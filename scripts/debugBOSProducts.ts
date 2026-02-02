/**
 * Script para debugar e ver a estrutura real do rental_equipments
 */

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

async function debugRentalEquipments() {
    console.log('🔍 Buscando rental_equipments do BOS...\n');

    const q = query(collection(db, 'rental_equipments'), limit(3));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.log('❌ Nenhum documento encontrado em rental_equipments');
        return;
    }

    console.log(`✅ Encontrados ${snapshot.size} documentos\n`);

    snapshot.docs.forEach((doc, index) => {
        console.log(`\n========== DOCUMENTO ${index + 1} ==========`);
        console.log('ID:', doc.id);
        console.log('\nDADOS COMPLETOS:');
        console.log(JSON.stringify(doc.data(), null, 2));
        console.log('=====================================\n');
    });

    process.exit(0);
}

debugRentalEquipments();
