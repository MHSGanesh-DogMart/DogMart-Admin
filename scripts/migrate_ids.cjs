const admin = require('firebase-admin');
const fs = require('fs');

let serviceAccount;
try {
    serviceAccount = require('./serviceAccountKey.json');
} catch (e) {
    console.log('No serviceAccountKey.json found. Please ensure it exists for Admin SDK.');
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrate() {
    console.log('Starting migration...');

    // 1. Get Categories
    const categoriesRef = db.collection('categories');
    const categoriesSnap = await categoriesRef.get();

    let catIdCounter = 1;
    const oldToNewCatMap = {};

    console.log('Migrating Categories...');
    for (const docSnap of categoriesSnap.docs) {
        const id = docSnap.id;
        // Check if already numeric
        if (!isNaN(parseInt(id))) {
            const numId = parseInt(id);
            if (numId >= catIdCounter) catIdCounter = numId + 1;
            continue;
        }

        const data = docSnap.data();
        const newId = String(catIdCounter++);
        oldToNewCatMap[id] = newId;
        data.id = newId;

        await db.collection('categories').doc(newId).set(data);
        await categoriesRef.doc(id).delete();
        console.log(`Migrated Category ${data.name} from ${id} to ${newId}`);
    }

    // 2. Get Breeds
    const breedsRef = db.collection('breeds');
    const breedsSnap = await breedsRef.get();

    let breedIdCounter = 1;
    const oldToNewBreedMap = {};

    console.log('Migrating Breeds...');
    for (const docSnap of breedsSnap.docs) {
        const id = docSnap.id;
        let data = docSnap.data();
        let changed = false;

        // Update category reference if needed
        if (data.categoryId && oldToNewCatMap[data.categoryId]) {
            data.categoryId = oldToNewCatMap[data.categoryId];
            changed = true;
        }

        // Check if already numeric
        if (!isNaN(parseInt(id))) {
            const numId = parseInt(id);
            if (numId >= breedIdCounter) breedIdCounter = numId + 1;
            if (changed) {
                await breedsRef.doc(id).update({ categoryId: data.categoryId });
            }
            continue;
        }

        const newId = String(breedIdCounter++);
        oldToNewBreedMap[id] = newId;
        data.id = newId;

        await db.collection('breeds').doc(newId).set(data);
        await breedsRef.doc(id).delete();
        console.log(`Migrated Breed ${data.name} from ${id} to ${newId}`);
    }

    // 3. Update Listings
    console.log('Updating Listings...');
    const listingsRef = db.collection('listings');
    const listingsSnap = await listingsRef.get();

    let updatedListings = 0;
    for (const docSnap of listingsSnap.docs) {
        const data = docSnap.data();
        let changed = false;

        if (data.categoryId && oldToNewCatMap[data.categoryId]) {
            data.categoryId = oldToNewCatMap[data.categoryId];
            changed = true;
        }

        if (data.breedId && oldToNewBreedMap[data.breedId]) {
            data.breedId = oldToNewBreedMap[data.breedId];
            changed = true;
        }

        if (changed) {
            await listingsRef.doc(docSnap.id).update({
                categoryId: data.categoryId,
                breedId: data.breedId
            });
            updatedListings++;
        }
    }
    console.log(`Updated ${updatedListings} listings.`);

    console.log('Migration Complete!');
}

migrate().catch(console.error);
