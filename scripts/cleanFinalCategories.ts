import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
    apiKey: 'AIzaSyAhn85m2KDDeIZE51uHem5MHM0VwoNlWaU',
    authDomain: 'comexs-r1g97.firebaseapp.com',
    projectId: 'comexs-r1g97',
    storageBucket: 'comexs-r1g97.firebasestorage.app',
    messagingSenderId: '1083099377370',
    appId: '1:1083099377370:web:abd9647fbd14f75ea4bfe3'
};

// APENAS ESTAS devem existir
const ALLOWED_IDS = [
    'voltage-and-current-amplifier',
    'power-meters',
    'giga-de-teste',
    'universal-test-set',
    'ct-pt-analyzer',
    'acessories'
];

async function cleanFinal() {
    console.log('\n🧹 LIMPEZA FINAL DE CATEGORIAS\n');

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    try {
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));

        for (const categoryDoc of categoriesSnapshot.docs) {
            const id = categoryDoc.id;
            const data = categoryDoc.data();

            if (!ALLOWED_IDS.includes(id)) {
                console.log(`❌ REMOVENDO: [${id}] ${data.name}`);
                await deleteDoc(doc(db, 'categories', id));
            } else {
                console.log(`✅ MANTENDO: [${id}] ${data.name}`);
            }
        }
        console.log('\n✅ Limpeza concluída.');

    } catch (error) {
        console.error('❌ Erro:', error);
    }

    process.exit(0);
}

cleanFinal();
