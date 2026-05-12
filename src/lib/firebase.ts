import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { 
  getFirestore, 
  initializeFirestore, 
  Firestore 
} from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// sipwithdaniella Real Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsvl0sichc8q7d1GrgDHLkWkQXgJKgZoI",
  authDomain: "sipwithdaniella.firebaseapp.com",
  projectId: "sipwithdaniella",
  storageBucket: "sipwithdaniella.firebasestorage.app",
  messagingSenderId: "1037687828632",
  appId: "1:1037687828632:web:98bf4c713f57d7dfda20ed",
  measurementId: "G-G3QVGXQN0H"
};

// Initialize Firebase
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Use initializeFirestore with Long Polling (HMR safe)
let db: Firestore;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch (e) {
  db = getFirestore(app);
}

const auth: Auth = getAuth(app);

export { app, db, auth };