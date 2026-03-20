import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration for PetSaathi
// NOTE: Replace appId with the real Web App ID from Firebase Console → Project Settings → Your Apps
const firebaseConfig = {
    apiKey: "AIzaSyCY3N4BzymXctBDuMcsRN_QvJ_0p7MrM1M",
    authDomain: "dog-mart-846bc.firebaseapp.com",
    projectId: "dog-mart-846bc",
    storageBucket: "dog-mart-846bc.firebasestorage.app",
    messagingSenderId: "864577837299",
    appId: "1:864577837299:web:placeholder", // ⚠️ UPDATE THIS with real Web App ID
    databaseURL: "https://dog-mart-846bc-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
