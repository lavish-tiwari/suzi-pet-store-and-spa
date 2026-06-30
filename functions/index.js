const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

// Helper to initialize Nodemailer transporter from env vars
const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Generates the "Add to Google Calendar" link
const generateCalendarUrl = (bookingData) => {
  const { customerName, petName, serviceName, dateTime, notes, customerEmail, customerPhone } = bookingData;
  
  // Combine date and time
  const startLocal = dateTime.toDate ? dateTime.toDate() : new Date(dateTime);
  const endLocal = new Date(startLocal.getTime() + 60 * 60 * 1000); // 1-hour appointment
  
  const formatToBasicIso = (d) => {
    return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  };
  
  const startIso = formatToBasicIso(startLocal);
  const endIso = formatToBasicIso(endLocal);
  
  const title = `Suzi Pet Store & Spa: ${serviceName} for ${petName}`;
  const description = `Appointment Details:\n- Customer Name: ${customerName}\n- Contact Number: ${customerPhone}\n- Email: ${customerEmail}\n- Pet Name: ${petName}\n- Service Type: ${serviceName}\n- Notes: ${notes || 'None'}\n\nThank you for choosing Suzi Pet Store and Spa!`;
  const loc = "H.No. 1-107/53, V S Colony, Kapra, Secunderabad, Hyderabad, Telangana 500062";
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startIso}/${endIso}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(loc)}`;
};

// 1. Firestore trigger on appointment creation
exports.sendAppointmentNotifications = onDocumentCreated("appointments/{appointmentId}", async (event) => {
  const snap = event.data;
  if (!snap) return;
  const appointment = snap.data();
  const id = snap.id;

  const ownerEmail = process.env.OWNER_EMAIL || "[PLACEHOLDER - client to provide before launch]";
  const senderEmail = process.env.SENDER_EMAIL || "noreply@suzipetstore.com";

  // Customer Tracking Logic inside a Transaction
  let customerFriendlyId = '';
  let visitCount = 1;
  const customerPhone = appointment.customerPhone;
  const customerRef = db.doc(`customers/${customerPhone}`);

  try {
    await db.runTransaction(async (transaction) => {
      const customerDoc = await transaction.get(customerRef);

      if (customerDoc.exists) {
        const customerData = customerDoc.data();
        customerFriendlyId = customerData.friendlyId;
        visitCount = (customerData.visitCount || 0) + 1;

        const existingPets = customerData.pets || [];
        const hasPet = existingPets.some(
          (p) => p.name.toLowerCase() === appointment.petName.toLowerCase()
        );
        const updatedPets = [...existingPets];
        if (!hasPet) {
          updatedPets.push({ name: appointment.petName, breed: appointment.petTypeBreed });
        }

        transaction.update(customerRef, {
          lastVisit: admin.firestore.FieldValue.serverTimestamp(),
          visitCount: visitCount,
          pets: updatedPets
        });
      } else {
        const counterRef = db.doc('counters/customerId');
        const counterDoc = await transaction.get(counterRef);
        let nextValue = 1;

        if (counterDoc.exists) {
          nextValue = (counterDoc.data().value || 0) + 1;
        }

        transaction.set(counterRef, { value: nextValue }, { merge: true });
        customerFriendlyId = `SP-${String(nextValue).padStart(4, '0')}`;
        visitCount = 1;

        transaction.set(customerRef, {
          friendlyId: customerFriendlyId,
          phone: customerPhone,
          name: appointment.customerName,
          email: appointment.customerEmail || '',
          firstVisit: admin.firestore.FieldValue.serverTimestamp(),
          lastVisit: admin.firestore.FieldValue.serverTimestamp(),
          visitCount: 1,
          pets: [{ name: appointment.petName, breed: appointment.petTypeBreed }]
        });
      }
    });

    // Write resulting customerId (friendlyId) back to the appointment document
    await snap.ref.update({ customerId: customerFriendlyId });
    console.log(`Successfully mapped customer ${customerFriendlyId} to appointment ${id}`);
  } catch (custError) {
    console.error(`Failed customer tracking transaction for appointment ${id}:`, custError);
    // Fallback if transaction fails, so emails are not blocked
    customerFriendlyId = 'SP-NEW';
  }

  const calendarLink = generateCalendarUrl(appointment);
  const formattedDate = appointment.dateTime.toDate().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const transporter = getTransporter();

  // Email to Customer
  const customerMailOptions = {
    from: `"Suzi Pet Store & Spa" <${senderEmail}>`,
    to: appointment.customerEmail,
    subject: "Your Spa & Grooming Appointment is Pending Confirmation! ✨",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
        <h2 style="color: #0d9488; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Booking Request Received!</h2>
        <p>Dear <strong>${appointment.customerName}</strong>,</p>
        <p>Thank you for choosing Suzi Pet Store and Spa in Kapra, Hyderabad. We have received your booking request for your pet, <strong>${appointment.petName}</strong>. Our staff will contact you shortly to confirm your booking.</p>
        <p>Your Customer ID for future reference is: <strong>${customerFriendlyId}</strong>.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #334155;">Appointment Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 4px 0; color: #64748b; width: 140px;">Customer ID:</td><td><strong>${customerFriendlyId}</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #64748b; width: 140px;">Reference ID:</td><td><strong>${id}</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Service Category:</td><td><strong>${appointment.serviceCategory}</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Service Name:</td><td><strong>${appointment.serviceName}</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Preferred Date:</td><td><strong>${formattedDate}</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Pet Name:</td><td><strong>${appointment.petName} (${appointment.petTypeBreed})</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Additional Notes:</td><td>${appointment.notes || 'None'}</td></tr>
          </table>
        </div>

        <p style="text-align: center; margin: 25px 0;">
          <a href="${calendarLink}" target="_blank" style="background-color: #0d9488; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Add to Google Calendar</a>
        </p>

        <p style="font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          Store Address: H.No. 1-107/53, V S Colony, Kapra, Secunderabad, Hyderabad, Telangana 500062<br />
          Contact Numbers: 090000 97424 / 08401385510
        </p>
      </div>
    `
  };

  // Email to Owner
  const ownerMailOptions = {
    from: `"Suzi Shop Notifications" <${senderEmail}>`,
    to: ownerEmail,
    subject: `🚨 New Appointment: ${appointment.serviceCategory} - ${appointment.petName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
        <h2 style="color: #d97706; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">New Booking Request Pending</h2>
        <p>A new appointment has been requested by a customer and is pending in your admin panel.</p>
        
        <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 4px 0; color: #64748b; width: 140px;">Customer ID:</td><td><strong>${customerFriendlyId} (${visitCount > 1 ? 'Returning - visit #' + visitCount : 'New Customer'})</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #64748b; width: 140px;">Customer Name:</td><td><strong>${appointment.customerName}</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Customer Phone:</td><td><strong>${appointment.customerPhone}</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Customer Email:</td><td><strong>${appointment.customerEmail}</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Service Name:</td><td><strong>${appointment.serviceCategory} - ${appointment.serviceName}</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Schedule Time:</td><td><strong>${formattedDate} IST</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Pet:</td><td><strong>${appointment.petName} (${appointment.petTypeBreed})</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Notes:</td><td>${appointment.notes || 'None'}</td></tr>
          </table>
        </div>

        <p style="text-align: center; margin: 25px 0;">
          <a href="${calendarLink}" target="_blank" style="background-color: #d97706; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Add to Store Google Calendar</a>
        </p>

        <p style="font-size: 12px; color: #64748b;">Please login to your admin panel to confirm or update this booking's status.</p>
      </div>
    `
  };

  try {
    await Promise.all([
      transporter.sendMail(customerMailOptions),
      transporter.sendMail(ownerMailOptions)
    ]);
    console.log(`Notification emails successfully sent for appointment ${id}`);
  } catch (err) {
    console.error(`Failed to send emails for appointment ${id}:`, err);
  }
});

// Helper: Calculate IST range of "today"
const getTodayRangeIst = () => {
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const startOfDay = new Date(Date.UTC(istTime.getUTCFullYear(), istTime.getUTCMonth(), istTime.getUTCDate(), 0, 0, 0));
  startOfDay.setTime(startOfDay.getTime() - (5.5 * 60 * 60 * 1000));
  const endOfDay = new Date(startOfDay.getTime() + (24 * 60 * 60 * 1000) - 1);
  return { start: startOfDay, end: endOfDay };
};

// 2. Daily Report scheduled at 11:55 PM IST
exports.sendDailyReport = onSchedule({ schedule: '55 23 * * *', timeZone: 'Asia/Kolkata' }, async (event) => {
  const ownerEmail = process.env.OWNER_EMAIL || "[PLACEHOLDER - client to provide before launch]";
  const senderEmail = process.env.SENDER_EMAIL || "reports@suzipetstore.com";
  
  const { start, end } = getTodayRangeIst();

  try {
    // 1. Query appointments booked today
    const appQuery = query(collection(db, 'appointments'), orderBy('createdAt'));
    const appSnap = await getDocs(appQuery);
    
    let bookedTodayCount = 0;
    let completedTodayCount = 0;
    const appointmentsList = [];

    appSnap.forEach((doc) => {
      const data = doc.data();
      const createdTime = data.createdAt?.toDate() || new Date(0);
      const updatedTime = data.updatedAt?.toDate() || new Date(0);

      if (createdTime >= start && createdTime <= end) {
        bookedTodayCount++;
        appointmentsList.push({ id: doc.id, ...data });
      }

      if (data.status === 'completed' && updatedTime >= start && updatedTime <= end) {
        completedTodayCount++;
      }
    });

    // 2. Query inventory logs today
    const logsQuery = query(collection(db, 'inventory_logs'), orderBy('timestamp'));
    const logsSnap = await getDocs(logsQuery);
    
    let scanInCount = 0;
    let scanOutCount = 0;
    const logsList = [];

    logsSnap.forEach((doc) => {
      const data = doc.data();
      const logTime = data.timestamp?.toDate() || new Date(0);
      if (logTime >= start && logTime <= end) {
        if (data.direction === 'IN') scanInCount += data.quantityChanged;
        if (data.direction === 'OUT') scanOutCount += data.quantityChanged;
        logsList.push(data);
      }
    });

    // 3. Query items below low-stock threshold
    const invSnap = await getDocs(collection(db, 'inventory'));
    const lowStockItems = [];
    invSnap.forEach((doc) => {
      const data = doc.data();
      if (data.quantity <= data.lowStockThreshold) {
        lowStockItems.push(data);
      }
    });

    // Send Daily Email Report
    const transporter = getTransporter();
    const mailOptions = {
      from: `"Suzi Operations Reports" <${senderEmail}>`,
      to: ownerEmail,
      subject: `📊 Suzi Pet Store & Spa: Daily Report - ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #cbd5e1; border-radius: 12px; color: #1e293b;">
          <h2 style="color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">Daily Business Summary</h2>
          <p style="font-size: 14px; color: #64748b;">Report Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
          
          <!-- Key Metrics Grid -->
          <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin: 20px 0;">
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #0d9488;">${bookedTodayCount}</div>
              <div style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Appointments Booked</div>
            </div>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #059669;">${completedTodayCount}</div>
              <div style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Appointments Completed</div>
            </div>
          </div>

          <!-- Inventory Movement Summary -->
          <h3 style="color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Inventory Activity</h3>
          <p style="font-size: 13px;">Stock Scanned In: <strong>+${scanInCount} items</strong> | Stock Scanned Out: <strong>-${scanOutCount} items</strong></p>

          <!-- Low Stock Warning -->
          <h3 style="color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-top: 25px;">Low Stock Alerts (${lowStockItems.length})</h3>
          ${lowStockItems.length === 0 ? '<p style="font-size: 13px; color: #059669;">✔ All items are currently above low-stock thresholds.</p>' : `
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr style="background-color: #fffbeb; text-align: left;"><th style="padding: 6px;">Item</th><th style="padding: 6px; text-align: center;">Current Qty</th><th style="padding: 6px; text-align: center;">Threshold</th></tr>
              </thead>
              <tbody>
                ${lowStockItems.map(item => `
                  <tr style="border-bottom: 1px solid #fef3c7;"><td style="padding: 6px;">${item.name}</td><td style="padding: 6px; text-align: center; color: #b45309; font-weight: bold;">${item.quantity}</td><td style="padding: 6px; text-align: center;">${item.lowStockThreshold}</td></tr>
                `).join('')}
              </tbody>
            </table>
          `}
          
          <p style="font-size: 11px; color: #64748b; margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            This report is automatically compiled and sent by Suzi Shop Cloud Functions.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("Daily operations email report successfully sent.");
  } catch (error) {
    console.error("Failed to generate and send daily operations report:", error);
  }
});

// Helper: Calculate IST range of "prior month"
const getPriorMonthRangeIst = () => {
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  
  let year = istTime.getUTCFullYear();
  let month = istTime.getUTCMonth() - 1;
  if (month < 0) {
    month = 11;
    year -= 1;
  }
  
  const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  startOfMonth.setTime(startOfMonth.getTime() - (5.5 * 60 * 60 * 1000));
  
  const endOfMonth = new Date(Date.UTC(istTime.getUTCFullYear(), istTime.getUTCMonth(), 1, 0, 0, 0));
  endOfMonth.setTime(endOfMonth.getTime() - (5.5 * 60 * 60 * 1000) - 1);
  
  const monthName = startOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  return { start: startOfMonth, end: endOfMonth, monthName };
};

// 3. Monthly Report scheduled on the 1st of each month at 12:05 AM IST
exports.sendMonthlyReport = onSchedule({ schedule: '5 0 1 * *', timeZone: 'Asia/Kolkata' }, async (event) => {
  const ownerEmail = process.env.OWNER_EMAIL || "[PLACEHOLDER - client to provide before launch]";
  const senderEmail = process.env.SENDER_EMAIL || "reports@suzipetstore.com";

  const { start, end, monthName } = getPriorMonthRangeIst();

  try {
    // 1. Fetch prior month appointments
    const appQuery = query(collection(db, 'appointments'), orderBy('dateTime'));
    const appSnap = await getDocs(appQuery);

    let totalAppointments = 0;
    let spaCount = 0;
    let groomingCount = 0;
    let completedCount = 0;

    appSnap.forEach((doc) => {
      const data = doc.data();
      const appTime = data.dateTime?.toDate() || new Date(0);

      if (appTime >= start && appTime <= end) {
        totalAppointments++;
        if (data.serviceCategory === 'Spa') spaCount++;
        if (data.serviceCategory === 'Grooming') groomingCount++;
        if (data.status === 'completed') completedCount++;
      }
    });

    // 2. Fetch prior month inventory logs
    const logsQuery = query(collection(db, 'inventory_logs'), orderBy('timestamp'));
    const logsSnap = await getDocs(logsQuery);

    let totalStockIn = 0;
    let totalStockOut = 0;

    logsSnap.forEach((doc) => {
      const data = doc.data();
      const logTime = data.timestamp?.toDate() || new Date(0);

      if (logTime >= start && logTime <= end) {
        if (data.direction === 'IN') totalStockIn += data.quantityChanged;
        if (data.direction === 'OUT') totalStockOut += data.quantityChanged;
      }
    });

    // 3. Fetch items currently low in stock
    const invSnap = await getDocs(collection(db, 'inventory'));
    const lowStockItems = [];
    invSnap.forEach((doc) => {
      const data = doc.data();
      if (data.quantity <= data.lowStockThreshold) {
        lowStockItems.push(data);
      }
    });

    // Send Monthly Email Report
    const transporter = getTransporter();
    const mailOptions = {
      from: `"Suzi Operations Reports" <${senderEmail}>`,
      to: ownerEmail,
      subject: `📅 Suzi Pet Store & Spa: Monthly Report - ${monthName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #cbd5e1; border-radius: 12px; color: #1e293b;">
          <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">Monthly Performance Summary</h2>
          <h3 style="color: #0d9488; margin-top: 0;">${monthName}</h3>
          
          <!-- Key Metrics Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #0d9488;">${totalAppointments}</div>
              <div style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Total Bookings</div>
            </div>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #059669;">${completedCount}</div>
              <div style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Completed Bookings</div>
            </div>
          </div>

          <!-- Service Type Distribution -->
          <h4 style="color: #334155; margin-bottom: 8px;">Bookings Distribution</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 25px;">
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px; color: #64748b;">Spa & Relaxation:</td><td style="padding: 6px; text-align: right; font-weight: bold;">${spaCount}</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px; color: #64748b;">Grooming Services:</td><td style="padding: 6px; text-align: right; font-weight: bold;">${groomingCount}</td></tr>
          </table>

          <!-- Monthly Inventory Activity -->
          <h4 style="color: #334155; margin-bottom: 8px;">Inventory Trends</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 25px;">
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px; color: #64748b;">Total Products Stocked In:</td><td style="padding: 6px; text-align: right; font-weight: bold; color: #059669;">+${totalStockIn}</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px; color: #64748b;">Total Products Stocked Out:</td><td style="padding: 6px; text-align: right; font-weight: bold; color: #b45309;">-${totalStockOut}</td></tr>
          </table>

          <!-- Low Stock Items List -->
          <h4 style="color: #334155; margin-bottom: 8px;">Current Low Stock Items (${lowStockItems.length})</h4>
          ${lowStockItems.length === 0 ? '<p style="font-size: 13px; color: #059669;">✔ All items are currently above low-stock thresholds.</p>' : `
            <ul style="font-size: 13px; padding-left: 20px; margin-top: 5px;">
              ${lowStockItems.map(item => `
                <li style="margin-bottom: 4px;"><strong>${item.name}</strong>: Current stock level: ${item.quantity} (Threshold: ${item.lowStockThreshold})</li>
              `).join('')}
            </ul>
          `}

          <p style="font-size: 11px; color: #64748b; margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            This report is automatically compiled and sent by Suzi Shop Cloud Functions.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("Monthly operations email report successfully sent.");
  } catch (error) {
    console.error("Failed to generate and send monthly operations report:", error);
  }
});
