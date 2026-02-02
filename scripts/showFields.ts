// Script para mostrar TODOS os campos de um documento
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

async function showAllFields() {
    console.log('BUSCANDO rental_equipments...\n');

    const q = query(collection(db, 'rental_equipments'), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.log('VAZIO');
        return;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    console.log('=== CAMPOS DO DOCUMENTO ===\n');
    console.log('ID:', doc.id);
    console.log('\nCAMPOS RAIZ:');
    Object.keys(data).forEach(key => {
        const value = data[key];
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            console.log(`\n${key}: (object)`);
            console.log('  ', JSON.stringify(value, null, 2).substring(0, 200));
        } else if (Array.isArray(value)) {
            console.log(`\n${key}: (array com ${value.length} items)`);
            if (value.length > 0) {
                console.log('   [0]:', JSON.stringify(value[0], null, 2).substring(0, 200));
            }
        } else {
            console.log(`${key}:`, value);
        }
    });

    process.exit(0);
}

showAllFields();
