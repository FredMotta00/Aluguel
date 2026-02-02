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

// Categorias oficiais que DEVEM ser mantidas
const OFFICIAL_CATEGORIES = [
    'universal-test-set',
    'sverker',
    'cmc',
    'megger'
];

async function cleanCategories() {
    console.log('\n🧹 LIMPANDO CATEGORIAS INVÁLIDAS DO FIRESTORE\n');

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    try {
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));

        console.log(`Total de categorias encontradas: ${categoriesSnapshot.size}\n`);

        let deletedCount = 0;
        let keptCount = 0;

        for (const categoryDoc of categoriesSnapshot.docs) {
            const id = categoryDoc.id;
            const data = categoryDoc.data();
            const name = data.name || data.nome || 'Sem nome';

            // Verificar se é uma categoria oficial
            if (OFFICIAL_CATEGORIES.includes(id)) {
                console.log(`✅ MANTER: [${id}] ${name}`);
                keptCount++;
            } else {
                // Deletar categoria inválida
                console.log(`❌ DELETANDO: [${id}] ${name}`);
                await deleteDoc(doc(db, 'categories', id));
                deletedCount++;
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 RESUMO DA LIMPEZA');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log(`✅ Mantidas: ${keptCount}`);
        console.log(`🗑️  Deletadas: ${deletedCount}`);
        console.log('\n✅ PROCESSO CONCLUÍDO!\n');

    } catch (error) {
        console.error('❌ Erro:', error);
    }

    process.exit(0);
}

cleanCategories();
