import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

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

console.log("Storage object keys:", Object.keys(storage));
console.log("Storage object prototype:", Object.getOwnPropertyNames(Object.getPrototypeOf(storage)));
console.log("Storage maxUploadRetryTime:", storage.maxUploadRetryTime);
