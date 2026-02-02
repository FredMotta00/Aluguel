
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

// Use the config from client.ts (hardcoded or env)
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyAhn85m2KDDeIZE51uHem5MHM0VwoNlWaU",
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "comexs-r1g97.firebaseapp.com",
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || "comexs-r1g97",
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "comexs-r1g97.firebasestorage.app",
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1083099377370",
    appId: process.env.VITE_FIREBASE_APP_ID || "1:1083099377370:web:abd9647fbd14f75ea4bfe3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkData() {
    console.log("Checking Firestore connection...");
    try {
        const productsRef = collection(db, 'rental_equipments');
        const productsSnapshot = await getDocs(query(productsRef, limit(5)));
        console.log(`Found ${productsSnapshot.size} products.`);
        productsSnapshot.forEach(doc => {
            console.log(`Product: ${doc.id} - ${doc.data().name}`);
        });

        const categoriesRef = collection(db, 'categories');
        const categoriesSnapshot = await getDocs(query(categoriesRef, limit(5)));
        console.log(`Found ${categoriesSnapshot.size} categories.`);
        categoriesSnapshot.forEach(doc => {
            console.log(`Category: ${doc.id} - ${doc.data().name}`);
        });

    } catch (e) {
        console.error("Error fetching data:", e);
    }
}

checkData().then(() => process.exit(0)).catch(() => process.exit(1));
