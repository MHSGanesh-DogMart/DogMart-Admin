import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBu4AwOs200emlFhQtL4Q0eKmv8Gvm7__8",
    authDomain: "dog-mart-846bc.firebaseapp.com",
    databaseURL: "https://dog-mart-846bc-default-rtdb.firebaseio.com",
    projectId: "dog-mart-846bc",
    storageBucket: "dog-mart-846bc.firebasestorage.app",
    messagingSenderId: "864577837299",
    appId: "1:864577837299:web:bff52686f589cdbb12bf86",
    measurementId: "G-T2QQQPLVWC",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
