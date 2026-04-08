npm install firebase

Then, initialize Firebase and begin using the SDKs for the products you'd like to use.

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAKBS1vMFnuH0xCnp9DVd9rk8HJdLIBtLo",
  authDomain: "rcma-c7198.firebaseapp.com",
  projectId: "rcma-c7198",
  storageBucket: "rcma-c7198.firebasestorage.app",
  messagingSenderId: "845620823965",
  appId: "1:845620823965:web:c2417d7f0b714f50dad174",
  measurementId: "G-33Q20PQGJ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


npm install -g firebase-tools




Start in locked mode
Your data is private by default. Client read/write access will only be granted as specified by your security rules.

{
  "rules": {
    ".read": false,
    ".write": false
  }
}