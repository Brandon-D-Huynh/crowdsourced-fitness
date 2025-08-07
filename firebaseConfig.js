// Import the functions you need from the SDKs you need
//import { getAnalytics } from "firebase/analytics";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDhYLwXkgv7Hqph445CRZsH8hCWspKcQyU",
  authDomain: "crowdsourced-fitness-app.firebaseapp.com",
  projectId: "crowdsourced-fitness-app",
  storageBucket: "crowdsourced-fitness-app.appspot.com",
  messagingSenderId: "610851266378",
  appId: "1:610851266378:web:d2ec9c8960f028331b6bb3",
  measurementId: "G-1L0TMJ0W2Y",
};

// Initialize Firebase (idempotent)
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
