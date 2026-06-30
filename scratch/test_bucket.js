import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
const storage = getStorage(app);
storage.maxUploadRetryTime = 5000; // set to 5 seconds!

async function testUpload() {
  console.log("Starting test upload to bucket...");
  const dummyData = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello" in binary
  const storageRef = ref(storage, `gallery/test_dummy_${Date.now()}.txt`);

  const startTime = Date.now();
  try {
    const snapshot = await uploadBytes(storageRef, dummyData, {
      contentType: 'text/plain'
    });
    console.log("✓ Upload successful! Path:", snapshot.metadata.fullPath);
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    console.error(`❌ Upload failed after ${duration.toFixed(2)} seconds with error:`, error.message || error);
  }
}

testUpload();
