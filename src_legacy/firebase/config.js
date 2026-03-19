// Firebase configuration for DogMart Admin Panel
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, isSupported } from "firebase/messaging";
import { getDatabase } from "firebase/database";

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

// Messaging is only available in browsers that support service workers
export const messaging = (await isSupported()) ? getMessaging(app) : null;

export default app;

