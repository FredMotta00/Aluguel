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

async function listProductsAndCategories() {
    console.log('\n🔍 LISTANDO PRODUTOS PARA IDENTIFICAR FAMÍLIAS\n');

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    try {
        // 1. Verificar Categorias Existentes
        console.log('📂 Categorias Atuais no Banco:');
        const catSnap = await getDocs(collection(db, 'categories'));
        if (catSnap.empty) {
            console.log('   (Nenhuma categoria encontrada)');
        } else {
            catSnap.forEach(doc => {
                console.log(`   - [${doc.id}] ${doc.data().name || doc.data().nome}`);
            });
        }

        // 2. Listar Produtos para identificar grupos
        console.log('\n📦 Produtos no Banco:');
        const prodSnap = await getDocs(collection(db, 'rental_equipments'));

        const names: string[] = [];
        prodSnap.forEach(doc => {
            const data = doc.data();
            const name = data.name || 'Sem Nome';
            names.push(name);
        });

        // Ordenar para facilitar visualização de grupos
        names.sort();

        names.forEach(name => console.log(`   • ${name}`));

    } catch (error) {
        console.error('❌ Erro:', error);
    }

    process.exit(0);
}

listProductsAndCategories();
