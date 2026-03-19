import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Firebase configuration for PetPal Hub
const firebaseConfig = {
    apiKey: "AIzaSyCY3N4BzymXctBDuMcsRN_QvJ_0p7MrM1M",
    authDomain: "dog-mart-846bc.firebaseapp.com",
    projectId: "dog-mart-846bc",
    storageBucket: "dog-mart-846bc.firebasestorage.app",
    messagingSenderId: "864577837299",
    appId: "1:864577837299:web:placeholder",
    databaseURL: "https://dog-mart-846bc-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);

export default app;
