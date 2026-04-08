import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAECw9foiA16-QNnnBYIbURDYfyzBTTBGA",
  authDomain: "public-grivance-portal.firebaseapp.com",
  databaseURL: "https://public-grivance-portal-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "public-grivance-portal",
  storageBucket: "public-grivance-portal.firebasestorage.app",
  messagingSenderId: "760260395924",
  appId: "1:760260395924:web:8224deebd52e107f884581",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { RecaptchaVerifier, signInWithPhoneNumber };
export default app;
