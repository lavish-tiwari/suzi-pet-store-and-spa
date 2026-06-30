import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Configure environment variables for the Admin SDK to point to the local emulators
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

// Initialize the Admin SDK (associated with our demo project)
initializeApp({
  projectId: 'demo-suzi-pet-store-and-spa'
});

const db = getFirestore();
const auth = getAuth();

async function run() {
  console.log("Connecting to local Firebase Emulators via Admin SDK to seed data...");
  const adminEmail = 'admin@suzi.com';
  const adminPassword = 'password123';

  try {
    // 1. Whitelist the admin account in the Firestore "admins" collection
    const adminDocRef = db.doc(`admins/${adminEmail}`);
    await adminDocRef.set({
      addedAt: FieldValue.serverTimestamp(),
      addedBy: "System Emulator Bootstrap"
    });
    console.log(`✓ Firestore: whitelisted ${adminEmail} inside the 'admins' collection.`);

    // 2. Create the user in the Authentication Emulator
    try {
      await auth.createUser({
        email: adminEmail,
        password: adminPassword,
        emailVerified: true
      });
      console.log(`✓ Auth: registered user account '${adminEmail}' with password '${adminPassword}'.`);
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        console.log(`✓ Auth: account '${adminEmail}' already exists inside the Auth Emulator.`);
      } else {
        throw e;
      }
    }

    console.log("\n=======================================================");
    console.log("SUCCESS: Local emulator environment successfully seeded!");
    console.log("Log in with:");
    console.log("- Email: admin@suzi.com");
    console.log("- Password: password123");
    console.log("=======================================================");
  } catch (error) {
    console.error("❌ Seeding failed:", error.message || error);
    process.exit(1);
  }
}

// Run bootstrap process
run();
