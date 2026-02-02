/**
 * Script COMPLETO para mostrar TODA estrutura de rental_equipments
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';
import * as fs from 'fs';

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

async function analyzeComplete() {
    console.log('========================================');
    console.log('ANÁLISE COMPLETA: rental_equipments BOS');
    console.log('========================================\n');

    const q = query(collection(db, 'rental_equipments'), limit(3));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.log('❌ Nenhum documento encontrado!');
        process.exit(1);
    }

    console.log(`✅ Encontrados ${snapshot.size} documentos\n`);

    let output = '';

    snapshot.docs.forEach((doc, index) => {
        const data = doc.data();

        const section = `
==========================================
📦 DOCUMENTO ${index + 1}
==========================================
ID: ${doc.id}

📋 ESTRUTURA COMPLETA (JSON):
${JSON.stringify(data, null, 2)}

==========================================
`;

        console.log(section);
        output += section;
    });

    // Salvar em arquivo
    fs.writeFileSync('BOS_COMPLETE_ANALYSIS.txt', output, 'utf8');
    console.log('\n✅ Análise salva em: BOS_COMPLETE_ANALYSIS.txt');

    process.exit(0);
}

analyzeComplete();
