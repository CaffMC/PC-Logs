// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJVWCsc6lzt9tI4pR1BLgmq4A6Qio_uUw",
  authDomain: "pc-build-logs.firebaseapp.com",
  projectId: "pc-build-logs",
  storageBucket: "pc-build-logs.firebasestorage.app",
  messagingSenderId: "87655947707",
  appId: "1:87655947707:web:5bdc0b093e6d9cfb2df89e",
  measurementId: "G-P68GSMSTCY"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Export Firestore DB and useful functions for other JS files
export { db, collection, getDocs, addDoc };
