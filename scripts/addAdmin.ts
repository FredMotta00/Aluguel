// Script para adicionar admin no Firestore
// Execute com: npx tsx scripts/addAdmin.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAp3blrPO6Y6jriCezC-U9JsMvBbVWPcZQ",
    authDomain: "exs-soluctions.firebaseapp.com",
    projectId: "exs-soluctions",
    storageBucket: "exs-soluctions.firebasestorage.app",
    messagingSenderId: "945abordaremos81482812",
    appId: "1:945481482812:web:c0d31d0a5476710d7b5f8e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addAdmin() {
    const adminEmail = 'frederico.motta@gpecx.com';

    try {
        await setDoc(doc(db, 'admins', adminEmail), {
            email: adminEmail,
            name: 'Frederico Motta',
            role: 'admin',
            createdAt: new Date().toISOString()
        });

        console.log('✅ Admin cadastrado com sucesso:', adminEmail);
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao cadastrar admin:', error);
        process.exit(1);
    }
}

addAdmin();
