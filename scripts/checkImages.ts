// Ver estrutura de imagem no BOS
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

async function checkImages() {
    const q = query(collection(db, 'rental_equipments'), limit(1));
    const snapshot = await getDocs(q);
    const data = snapshot.docs[0].data();

    console.log('CAMPOS DE IMAGEM:');
    console.log('imageUrl direto:', data.imageUrl || '(não existe)');
    console.log('image:', data.image || '(não existe)');
    console.log('images:', data.images || '(não existe)');
    console.log('\naccessories[0].imageUrl:', data.accessories?.[0]?.imageUrl || '(não existe)');

    process.exit(0);
}

checkImages();
