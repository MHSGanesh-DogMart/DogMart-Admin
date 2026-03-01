import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "dummy",
    authDomain: "dogmart-482ff.firebaseapp.com",
    projectId: "dogmart-482ff",
    storageBucket: "dogmart-482ff.appspot.com",
    messagingSenderId: "123",
    appId: "123"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
    console.log("Fetching categories...");
    const catsSnap = await getDocs(collection(db, 'categories'));
    const categories = [];
    catsSnap.forEach(d => categories.push({ id: d.id, ...d.data() }));
    console.log("Categories:", categories.slice(0, 3));

    console.log("Fetching breeds...");
    const breedsSnap = await getDocs(collection(db, 'breeds'));
    const breeds = [];
    breedsSnap.forEach(d => breeds.push({ id: d.id, ...d.data() }));
    console.log("Total breeds:", breeds.length);
    console.log("Sample breeds:", breeds.slice(0, 3));

    process.exit();
}

test();
