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

// DEFINIÇÃO DAS FAMÍLIAS DE PRODUTOS
// O usuário pediu especificamente "Universal Test Set"
const FAMILIES = [
    {
        id: 'universal-test-set',
        name: 'Universal Test Set', // Nome exato solicitado
        slug: 'universal-test-set',
        description: 'Conjuntos de teste universais (UTS)',
        keywords: ['UTS', 'Universal Test Set'], // Palavras-chave para identificar produtos
        icon: 'Zap'
    },
    {
        id: 'sverker',
        name: 'Sverker',
        slug: 'sverker',
        description: 'Caixas de teste de relés monofásicos',
        keywords: ['Sverker'],
        icon: 'Box'
    },
    {
        id: 'cmc',
        name: 'CMC',
        slug: 'cmc',
        description: 'Caixas de teste de relés hexafásicos',
        keywords: ['CMC'],
        icon: 'Activity'
    },
    {
        id: 'megger',
        name: 'Megger',
        slug: 'megger',
        description: 'Equipamentos da marca Megger',
        keywords: ['Megger', 'MIT', 'Megômetro'],
        icon: 'Gauge'
    }
];

async function setupFamilies() {
    console.log('\n📋 CONFIGURANDO FAMÍLIAS DE PRODUTOS\n');

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    try {
        // 1. Criar Categorias/Famílias
        console.log('🏷️  Configurando categorias...');
        for (const family of FAMILIES) {
            await setDoc(doc(db, 'categories', family.id), {
                name: family.name,
                slug: family.slug,
                description: family.description,
                icon: family.icon,
                isFamily: true, // Marcador para saber que é uma família de produtos
                updatedAt: new Date().toISOString()
            }, { merge: true });
            console.log(`   ✅ Família: ${family.name}`);
        }

        // 2. Associar Produtos às Famílias
        console.log('\n📦 Associando produtos às famílias...');
        const productsSnapshot = await getDocs(collection(db, 'rental_equipments'));

        let updatedCount = 0;

        for (const productDoc of productsSnapshot.docs) {
            const data = productDoc.data();
            const name = (data.name || '').toUpperCase(); // Normalizar para busca

            let matchedFamily = null;

            // Tentar encontrar a família correta
            for (const family of FAMILIES) {
                // Verifica se ALGUMA palavra-chave está no nome do produto
                const match = family.keywords.some(k => name.includes(k.toUpperCase()));
                if (match) {
                    matchedFamily = family;
                    break; // Parar na primeira correspondência
                }
            }

            if (matchedFamily) {
                // Só atualiza se a categoria for diferente
                if (data.category !== matchedFamily.id) {
                    await updateDoc(doc(db, 'rental_equipments', productDoc.id), {
                        category: matchedFamily.id,
                        categoryName: matchedFamily.name,
                        updatedAt: new Date().toISOString()
                    });
                    console.log(`   🔗 ${data.name} → ${matchedFamily.name}`);
                    updatedCount++;
                } else {
                    console.log(`   (ok) ${data.name} já é ${matchedFamily.name}`);
                }
            } else {
                console.log(`   ⚠️  SEM FAMÍLIA: ${data.name}`);
            }
        }

        console.log(`\n✅ Concluído! ${updatedCount} produtos atualizados.`);

    } catch (error) {
        console.error('❌ Erro:', error);
    }

    process.exit(0);
}

setupFamilies();
