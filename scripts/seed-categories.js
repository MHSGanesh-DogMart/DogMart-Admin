import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, query, where, getDocs, writeBatch } from "firebase/firestore";

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
const db = getFirestore(app);

const categoriesConfig = [
    { name: "Dog", emoji: "🐶", color: "#FF9800", border: false, isActive: true, breeds: ["Labrador Retriever", "German Shepherd", "Golden Retriever", "French Bulldog", "Bulldog", "Poodle", "Beagle", "Rottweiler", "German Shorthaired Pointer", "Dachshund"] },
    { name: "Cat", emoji: "🐱", color: "#E91E63", border: false, isActive: true, breeds: ["Persian", "Maine Coon", "Bengal", "Siamese", "Sphynx", "Ragdoll", "British Shorthair", "Abyssinian", "Scottish Fold", "American Shorthair"] },
    { name: "Bird", emoji: "🦜", color: "#2196F3", border: false, isActive: true, breeds: ["Parrot", "Canary", "Cockatiel", "Finch", "Budgerigar", "Lovebird", "Cockatoo", "Macaw", "Dove", "Pigeon"] },
    { name: "Rabbit", emoji: "🐰", color: "#9C27B0", border: false, isActive: true, breeds: ["Holland Lop", "Mini Rex", "Netherland Dwarf", "Flemish Giant", "French Lop", "Lionhead", "English Lop", "Dutch", "Mini Lop", "Angora"] },
    { name: "Fish", emoji: "🐠", color: "#00BCD4", border: false, isActive: true, breeds: ["Betta", "Goldfish", "Guppy", "Tetra", "Angelfish", "Corydoras", "Molly", "Platy", "Swordtail", "Zebra Danio"] },
    { name: "Turtle", emoji: "🐢", color: "#4CAF50", border: false, isActive: true, breeds: ["Red-Eared Slider", "Box Turtle", "Painted Turtle", "Russian Tortoise", "Sulcata Tortoise", "Musk Turtle", "Map Turtle", "Mud Turtle", "Snapping Turtle", "Wood Turtle"] },
    { name: "Reptiles", emoji: "🦎", color: "#3F51B5", border: false, isActive: true, breeds: ["Bearded Dragon", "Leopard Gecko", "Crested Gecko", "Ball Python", "Corn Snake", "Chameleon", "Iguana", "Monitor Lizard", "Skink", "Tegu"] },
    { name: "Farm", emoji: "🐎", color: "#795548", border: false, isActive: true, breeds: ["Horse", "Cow", "Pig", "Sheep", "Goat", "Donkey", "Alpaca", "Llama", "Mule", "Ox"] },
    { name: "Hens", emoji: "🐔", color: "#FF5722", border: false, isActive: true, breeds: ["Leghorn", "Rhode Island Red", "Plymouth Rock", "Sussex", "Ancona", "Australorp", "Orpington", "Wyandotte", "Brahma", "Jersey Giant"] },
    { name: "Other", emoji: "🐾", color: "#607D8B", border: false, isActive: true, breeds: ["Hamster", "Guinea Pig", "Mouse", "Rat", "Chinchilla", "Gerbil", "Ferret", "Hedgehog", "Sugar Glider", "Tarantula"] }
];

async function clearCollection(collectionName) {
    const q = query(collection(db, collectionName));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    console.log(`Cleared collection: ${collectionName}`);
}

async function seed() {
    console.log("Seeding Database Categories and Breeds...");

    await clearCollection("categories");
    await clearCollection("breeds");

    let catIndex = 1;
    let breedIndex = 1;

    for (const catConfig of categoriesConfig) {
        // We will use the index as the ID
        const categoryId = String(catIndex++);
        const docRef = doc(db, "categories", categoryId);

        const { breeds, ...catData } = catConfig;
        const categoryData = {
            ...catData,
            id: categoryId
        };

        await setDoc(docRef, categoryData);
        console.log(`Added category ${catConfig.name} with ID: ${categoryId}`);

        // For simplicity, we delete all existing breeds and re-seed them with numeric IDs
        // in a production app we'd be more careful, but for seeding this is standard.
        const addBatch = writeBatch(db);
        let count = 0;
        for (const breedName of catConfig.breeds) {
            const bId = String(breedIndex++);
            const breedRef = doc(db, "breeds", bId);
            addBatch.set(breedRef, {
                id: bId,
                name: breedName,
                categoryId: categoryId,
                isActive: true
            });
            count++;
        }
        await addBatch.commit();
        console.log(`Added ${count} breeds for category ${catConfig.name}`);
    }
    console.log("Done seeding!");
    process.exit(0);
}

seed();
