// Simplificado - mostrar apenas campos-chave
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

async function simple() {
    const q = query(collection(db, 'rental_equipments'), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) { process.exit(1); }

    const data = snapshot.docs[0].data();

    console.log('CAMPOS PRINCIPAIS:');
    console.log('categoryName:', data.categoryName);
    console.log('rentPrice:', data.rentPrice);
    console.log('status:', data.status);
    console.log('\ntags:', data.tags);
    console.log('\naccessories (total:', data.accessories?.length || 0, '):');
    if (data.accessories) {
        data.accessories.forEach((acc: any, i: number) => {
            console.log(`  [${i}]`, acc.name);
        });
    }

    process.exit(0);
}

simple();
