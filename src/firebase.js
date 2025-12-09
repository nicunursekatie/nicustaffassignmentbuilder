// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHILPVvX5-9NXn6_TphCNMTra2KhdMyy4",
  authDomain: "nicu-assignment-sheet-builder.firebaseapp.com",
  projectId: "nicu-assignment-sheet-builder",
  storageBucket: "nicu-assignment-sheet-builder.firebasestorage.app",
  messagingSenderId: "588263243942",
  appId: "1:588263243942:web:fa142c0c82581c58f3f467",
  measurementId: "G-BWJ53PJSLT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics };

