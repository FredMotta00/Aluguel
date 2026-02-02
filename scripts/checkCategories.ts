// Verificar estrutura de categories no BOS
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function checkCategories() {
    console.log('📂 CATEGORIAS DO BOS:\n');

    const snapshot = await getDocs(collection(db, 'categories'));

    if (snapshot.empty) {
        console.log('❌ Nenhuma categoria encontrada!');
        process.exit(1);
    }

    console.log(`✅ Total: ${snapshot.size} categorias\n`);

    snapshot.docs.forEach((doc, i) => {
        const data = doc.data();
        console.log(`[${i + 1}] ID: ${doc.id}`);
        console.log('    Dados:', JSON.stringify(data, null, 2));
        console.log('');
    });

    process.exit(0);
}

checkCategories();
