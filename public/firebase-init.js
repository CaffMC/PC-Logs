import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider };
