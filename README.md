# Suzi Pet Store and Spa - Full Stack Website

Suzi Pet Store and Spa is a premium, full-stack responsive web application designed for a real local business located in Kapra, Hyderabad. It features a spa-first calming customer portal, a unified online booking form, an admin panel with a camera-based inventory barcode scanner, and automated reporting systems powered by Firebase Cloud Functions.

---

## 🛠️ Technology Stack

- **Frontend**: React, Vite, Tailwind CSS (v3), Framer Motion (for animations), Lucide React (icons), `html5-qrcode` (camera barcode scanning)
- **Backend & Cloud**: Firebase
  - **Firestore**: Database (storing appointments, inventory, audit logs, and authorized staff)
  - **Firebase Authentication**: Email and password authentication for admin personnel
  - **Cloud Functions**: Firestore-triggered email notifications & cron-scheduled business reports (Daily/Monthly)
  - **Firebase Hosting**: Fast CDN deployment for the web app

---

## 📦 Project Directory Structure

```
/
├── .env.example                # Frontend environment variables template
├── .gitignore
├── firebase.json               # Firebase services configurations
├── firestore.rules             # Strict Firestore Security Rules
├── firestore.indexes.json      # Firestore indexes config
├── package.json                # Frontend package dependencies
├── tailwind.config.js          # Tailwind CSS v3 configuration
├── postcss.config.js
├── vite.config.js
├── index.html                  # Main HTML entry with SEO and Google Fonts
├── README.md                   # Setup and Deployment guide
├── src/                        # React Frontend Source
│   ├── main.jsx                # DOM Mount entrypoint
│   ├── index.css               # Core CSS & styling tokens
│   ├── App.jsx                 # Routing and Layout controller
│   ├── firebase.js             # Initialized Firebase client SDK
│   ├── components/
│   │   ├── Navbar.jsx          # Public sticky navigation
│   │   ├── Footer.jsx          # Public footer with contacts & message form
│   │   ├── GlassCard.jsx       # Reusable glassmorphic design wrapper
│   │   ├── ChatbotWidget.jsx   # Rule-based FAQ chatbot (client-side)
│   │   └── ProtectedRoute.jsx  # Admin protection routing check
│   └── pages/
│       ├── Home.jsx            # Landing page with spa-first framing
│       ├── Services.jsx        # Spa and Grooming services lists
│       ├── About.jsx           # Location info and Google Map iframe
│       ├── BookAppointment.jsx # Online booking form with Google Calendar links
│       ├── Testimonials.jsx    # Google review quotes and trust badges
│       └── Admin/
│           ├── AdminLogin.jsx  # Admin auth form (light theme)
│           ├── AdminDashboard.jsx # Admin layout and sidebar navigation
│           ├── Appointments.jsx # Bookings review and status modifiers
│           ├── Inventory.jsx   # Barcode scanner and stock adjustments
│           └── StaffManager.jsx # Staff email access manager
└── functions/                  # Firebase Cloud Functions (Node.js 20)
    ├── index.js                # Core triggers and scheduler scripts
    ├── package.json
    ├── .env.example            # Backend credentials template
    └── README.md
```

---

## 🚀 Getting Started & Local Setup

### Prerequisite Tools
1. [Node.js](https://nodejs.org/) (Version 18 or 20 recommended)
2. [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`)

### Step 1: Install Dependencies
At the workspace root, run:
```bash
npm install
```
This will install all the frontend libraries.

To install dependencies for Cloud Functions, change directory to `functions` and run:
```bash
cd functions
npm install
```

### Step 2: Configure Environment Variables
1. **Frontend Configuration**: 
   - Copy the `.env.example` file in the root directory to a new file named `.env`.
   - Update it with your Firebase Web App configuration credentials (obtained from the Firebase Console).

2. **Backend Configuration**:
   - Copy the `functions/.env.example` file in the `functions/` directory to a new file named `functions/.env`.
   - Update it with your SMTP email server host, port, credentials (e.g. Gmail App Password), and the **Owner Notification Email** (flagged as `[PLACEHOLDER]` in the code and environment variables).

### Step 3: Run the Development Server
From the root directory, start the Vite local server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the customer-facing site.

To test Firebase Cloud Functions or Security Rules locally, launch the Firebase Emulator Suite:
```bash
firebase emulators:start
```

---

## ☁️ Deploying to Firebase

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name it (e.g. `suzi-pet-store-spa`).
3. (Optional) Enable Google Analytics for the project.

### Step 2: Enable Firebase Authentication
1. In the Firebase console sidebar, navigate to **Build** -> **Authentication**.
2. Click **Get Started**, then select **Email/Password** as the sign-in provider.
3. Enable **Email/Password** and click **Save**.

### Step 3: Create Firestore Database
1. Go to **Build** -> **Firestore Database**.
2. Click **Create Database**, select a region close to your business (e.g., `asia-south1` for India), and click Next.
3. Choose **Start in test mode** or **production mode** (your local `firestore.rules` will overwrite default rules on deploy anyway), then click **Create**.

### Step 4: Bootstrap the Owner's Admin Email
Before you can log in, you must manually whitelist your admin email address in the database:
1. In the Firebase Firestore Console, click **Start Collection** to create a collection named `admins`.
2. For the first document, set the **Document ID** to your administrator email address in **lowercase** (e.g., `owner@suzipetstore.com`).
3. Add the following fields to the document:
   - `addedAt` (type: `Timestamp`): Select current time
   - `addedBy` (type: `string`): Set to `System`

### Step 5: Create your Admin Authentication Account
1. Go back to **Authentication** -> **Users** tab.
2. Click **Add User**.
3. Input the exact same email address bootstraped in Step 4 and assign a secure password. Click **Add User**.

### Step 6: Build & Deploy via Firebase CLI
1. Build the production build of the Vite React frontend:
   ```bash
   npm run build
   ```
2. Log in to your Firebase account using the CLI:
   ```bash
   firebase login
   ```
3. Initialize connection to your project:
   ```bash
   firebase use --add [YOUR_FIREBASE_PROJECT_ID]
   ```
4. Deploy the rules, hosting, and functions:
   ```bash
   firebase deploy
   ```
5. Once deployment completes, the CLI will output your public hosting URL (e.g., `https://suzi-pet-store-spa.web.app`).

---

## 🔒 Security & Verification Details
- **Access Gating**: Anyone can create an appointment document or contact message from the public portal, but only users authenticated and whitelisted in the `admins` collection can read/write data.
- **Rules Protection**: The Firebase rules block unauthorized users immediately at the database level by comparing `request.auth.token.email.lower()` against the whitelisted `admins` collection keys.
- **Low Stock Alerts**: Any items in the `inventory` collection that drop below their configured `lowStockThreshold` trigger visible alert warnings on the Admin console and are compiled in the daily schedule reports.
