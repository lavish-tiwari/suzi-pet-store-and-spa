import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBud4QecnziyxHoOJsI3UDIv2biK9W4OS4",
  authDomain: "suzi-pet-store-and-spa.firebaseapp.com",
  projectId: "suzi-pet-store-and-spa",
  storageBucket: "suzi-pet-store-and-spa.appspot.com",
  messagingSenderId: "416126880503",
  appId: "1:416126880503:web:7b26a6f47f918464de61f2",
  measurementId: "G-8B4Y8RHV05"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirestore() {
  console.log("Querying firestore 'gallery' collection...");
  try {
    const q = query(collection(db, 'gallery'), limit(5));
    const snapshot = await getDocs(q);
    console.log("✓ Firestore query completed successfully!");
    console.log(`Found ${snapshot.size} documents.`);
    snapshot.forEach(doc => {
      console.log("- Doc ID:", doc.id, "Data:", doc.data());
    });
  } catch (error) {
    console.error("❌ Firestore query failed:", error);
  }
}

testFirestore();
