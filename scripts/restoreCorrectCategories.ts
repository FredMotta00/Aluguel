import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
    apiKey: 'AIzaSyAhn85m2KDDeIZE51uHem5MHM0VwoNlWaU',
    authDomain: 'comexs-r1g97.firebaseapp.com',
    projectId: 'comexs-r1g97',
    storageBucket: 'comexs-r1g97.firebasestorage.app',
    messagingSenderId: '1083099377370',
    appId: '1:1083099377370:web:abd9647fbd14f75ea4bfe3'
};

// CATEGORIAS CORRETAS (Baseadas na imagem do usuário)
const CORRECT_CATEGORIES = [
    {
        id: 'voltage-and-current-amplifier',
        name: 'Voltage And Current Amplifier',
        keywords: ['Amplifier', 'Amplificador', 'CMC', 'Sverker', 'Doble', 'Omicron'],
        icon: 'Zap'
    },
    {
        id: 'power-meters',
        name: 'Power Meters',
        keywords: ['Power Meter', 'Multímetro', 'Multimeter', 'Qualímetro', 'Quality'],
        icon: 'Activity'
    },
    {
        id: 'giga-de-teste',
        name: 'Giga de Teste',
        keywords: ['Giga', 'Hipot', 'VLF'],
        icon: 'Gauge'
    },
    {
        id: 'universal-test-set',
        name: 'Universal Test Set',
        keywords: ['UTS', 'Universal Test Set'],
        icon: 'Box'
    },
    {
        id: 'ct-pt-analyzer',
        name: 'CT/PT Analyzer',
        keywords: ['CT Analyzer', 'PT Analyzer', 'Transformador', 'Transformer', 'TTR'],
        icon: 'Settings'
    },
    {
        id: 'acessories',
        name: 'Acessories',
        keywords: ['Cabo', 'Cable', 'Acessório', 'Accessory', 'Kit'],
        icon: 'Briefcase'
    }
];

async function restoreCategories() {
    console.log('\n🛠️ RESTAURANDO CATEGORIAS CORRETAS\n');

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    try {
        // 1. Criar Categorias
        console.log('🏷️  Recriando categorias no Firestore...');
        for (const cat of CORRECT_CATEGORIES) {
            await setDoc(doc(db, 'categories', cat.id), {
                name: cat.name,
                slug: cat.id,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            console.log(`   ✅ ${cat.name}`);
        }

        // 2. Reassociar Produtos
        console.log('\n📦 Reassociando produtos...');
        const productsSnapshot = await getDocs(collection(db, 'rental_equipments'));

        let updatedCount = 0;

        for (const productDoc of productsSnapshot.docs) {
            const data = productDoc.data();
            const name = (data.name || '').toUpperCase();

            let matchedCategory = null;

            // Lógica de Matching
            for (const cat of CORRECT_CATEGORIES) {
                if (cat.keywords.some(k => name.includes(k.toUpperCase()))) {
                    matchedCategory = cat;
                    break;
                }
            }

            // Se encontrou nova categoria e é diferente da atual
            if (matchedCategory && data.category !== matchedCategory.id) {
                await updateDoc(doc(db, 'rental_equipments', productDoc.id), {
                    category: matchedCategory.id,
                    categoryName: matchedCategory.name,
                    updatedAt: new Date().toISOString()
                });
                console.log(`   🔗 ${data.name} → ${matchedCategory.name}`);
                updatedCount++;
            } else {
                // Se já está certo ou não encontrou match
                // console.log(`   . ${data.name} (Sem alteração)`);
            }
        }

        console.log(`\n✅ Concluído! ${updatedCount} produtos reassociados.`);

    } catch (error) {
        console.error('❌ Erro:', error);
    }

    process.exit(0);
}

restoreCategories();
