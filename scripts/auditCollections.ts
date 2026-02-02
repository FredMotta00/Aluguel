// Script para verificar todas as collections e suas estruturas
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAhn85m2KDDeIZE51uHem5MHM0VwoNlWaU",
    authDomain: "comexs-r1g97.firebaseapp.com",
    projectId: "comexs-r1g97",
    storageBucket: "comexs-r1g97.firebasestorage.app",
    messagingSenderId: "1083099377370",
    appId: "1:1083099377370:web:abd9647fbd14f75ea4bfe3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const collections = [
    'rental_equipments',
    'categories',
    'customers',
    'orders',
    'reservas',
    'coupons',
    'loyalty_points',
    'upgrades',
    'packages',
    'promotions',
    'product_kits',
    'product_types',
    'quotes',
    'settings',
    'users',
    'vendors'
];

async function auditCollections() {
    console.log('🔍 AUDITORIA DE COLLECTIONS\n');
    console.log('='.repeat(60), '\n');

    for (const collectionName of collections) {
        try {
            const q = query(collection(db, collectionName), limit(1));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                console.log(`❌ ${collectionName.padEnd(25)} - VAZIA`);
            } else {
                console.log(`✅ ${collectionName.padEnd(25)} - ${snapshot.size} doc(s)`);
                const data = snapshot.docs[0].data();
                const fields = Object.keys(data).slice(0, 5).join(', ');
                console.log(`   Campos: ${fields}...`);
            }
        } catch (error: any) {
            console.log(`🔴 ${collectionName.padEnd(25)} - ERRO: ${error.message}`);
        }
        console.log('');
    }

    console.log('='.repeat(60));
    process.exit(0);
}

auditCollections();
