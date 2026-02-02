import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
    apiKey: 'AIzaSyAhn85m2KDDeIZE51uHem5MHM0VwoNlWaU',
    authDomain: 'comexs-r1g97.firebaseapp.com',
    projectId: 'comexs-r1g97',
    storageBucket: 'comexs-r1g97.firebasestorage.app',
    messagingSenderId: '1083099377370',
    appId: '1:1083099377370:web:abd9647fbd14f75ea4bfe3'
};

async function checkDistribution() {
    console.log('\n📊 VERIFICANDO DISTRIBUIÇÃO DE PRODUTOS\n');

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    try {
        // 1. Pegar Categorias
        const catSnap = await getDocs(collection(db, 'categories'));
        const categories = new Map();
        catSnap.forEach(doc => categories.set(doc.id, doc.data().name));

        // 2. Pegar Produtos
        const prodSnap = await getDocs(collection(db, 'rental_equipments'));

        // Contadores
        const dist = new Map();
        const noCategory: string[] = [];

        // Inicializar contadores
        categories.forEach((name, id) => dist.set(id, 0));

        prodSnap.forEach(doc => {
            const data = doc.data();
            const catId = data.category;

            if (catId && categories.has(catId)) {
                dist.set(catId, dist.get(catId) + 1);
            } else {
                noCategory.push(data.name || 'Sem nome');
            }
        });

        console.log('📈 POR CATEGORIA:');
        dist.forEach((count, id) => {
            const name = categories.get(id);
            const status = count === 0 ? '❌ VAZIA' : `✅ ${count} produtos`;
            console.log(`   [${id}] ${name}: ${status}`);
        });

        console.log(`\n⚠️  SEM CATEGORIA: ${noCategory.length} produtos`);
        if (noCategory.length > 0) {
            noCategory.forEach(name => console.log(`   - ${name}`));
        }

    } catch (error) {
        console.error('❌ Erro:', error);
    }

    process.exit(0);
}

checkDistribution();
