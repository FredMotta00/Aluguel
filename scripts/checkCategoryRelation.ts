// Ver relacionamento produto-categoria
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';

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

async function checkRelationship() {
    console.log('🔗 RELACIONAMENTO PRODUTO-CATEGORIA:\n');

    const q = query(collection(db, 'rental_equipments'), limit(1));
    const snapshot = await getDocs(q);
    const data = snapshot.docs[0].data();

    console.log('Campo de categoria no produto:');
    console.log('  categoryId:', data.categoryId || '(não existe)');
    console.log('  category:', data.category || '(não existe)');
    console.log('  categoryName:', data.categoryName || '(não existe)');

    process.exit(0);
}

checkRelationship();
