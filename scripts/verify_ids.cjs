const admin = require('firebase-admin');

let serviceAccount;
try {
    serviceAccount = require('./serviceAccountKey.json');
} catch (e) {
    console.log('No serviceAccountKey.json found.');
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkIds() {
    console.log('--- Categories Table ---');
    const categoriesSnap = await db.collection('categories').get();
    let catStrCount = 0;
    categoriesSnap.docs.forEach(doc => {
        const id = doc.id;
        if (isNaN(parseInt(id))) {
            console.log(`String ID found in Categories: ${id} -> ${doc.data().name}`);
            catStrCount++;
        }
    });
    console.log(`Categories with String IDs: ${catStrCount} / ${categoriesSnap.docs.length}`);

    console.log('\n--- Breeds Table ---');
    const breedsSnap = await db.collection('breeds').get();
    let breedStrCount = 0;
    breedsSnap.docs.forEach(doc => {
        const id = doc.id;
        if (isNaN(parseInt(id))) {
            console.log(`String ID found in Breeds: ${id} -> ${doc.data().name}`);
            breedStrCount++;
        }
    });
    console.log(`Breeds with String IDs: ${breedStrCount} / ${breedsSnap.docs.length}`);

    console.log('\n--- Listings Table ---');
    const listingsSnap = await db.collection('listings').get();
    let listCatStr = 0;
    let listBreedStr = 0;
    listingsSnap.docs.forEach(doc => {
        const data = doc.data();
        if (data.categoryId && isNaN(parseInt(data.categoryId))) {
            listCatStr++;
        }
        if (data.breedId && isNaN(parseInt(data.breedId))) {
            listBreedStr++;
        }
    });
    console.log(`Listings referencing String Category IDs: ${listCatStr} / ${listingsSnap.docs.length}`);
    console.log(`Listings referencing String Breed IDs: ${listBreedStr} / ${listingsSnap.docs.length}`);

    process.exit(0);
}

checkIds().catch(console.error);
