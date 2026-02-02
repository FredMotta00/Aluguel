import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
    apiKey: 'AIzaSyAhn85m2KDDeIZE51uHem5MHM0VwoNlWaU',
    authDomain: 'comexs-r1g97.firebaseapp.com',
    projectId: 'comexs-r1g97',
    storageBucket: 'comexs-r1g97.firebasestorage.app',
    messagingSenderId: '1083099377370',
    appId: '1:1083099377370:web:abd9647fbd14f75ea4bfe3'
};

const CATEGORIES_RULES = [
    {
        id: 'voltage-and-current-amplifier',
        name: 'Voltage And Current Amplifier',
        // Expandindo keywords
        terms: ['Amplifier', 'Amplificador', 'CMC', 'Sverker', 'Omicron', 'Doble', 'Relay Test', 'Caixa de Teste', 'Hexafásica', 'Monofásica', 'Current Injector', 'Injetor']
    },
    {
        id: 'power-meters',
        name: 'Power Meters',
        terms: ['Power Meter', 'Multímetro', 'Multimeter', 'Qualímetro', 'Quality', 'Energia', 'Energy', 'Analyser', 'Analyzer', 'Medidor']
    },
    {
        id: 'giga-de-teste',
        name: 'Giga de Teste',
        terms: ['Giga', 'Hipot', 'VLF', 'Insulation', 'Isolamento', 'Megômetro', 'Megger', 'MIT']
    },
    {
        id: 'universal-test-set',
        name: 'Universal Test Set',
        terms: ['UTS', 'Universal', 'CPC']
    },
    {
        id: 'ct-pt-analyzer',
        name: 'CT/PT Analyzer',
        terms: ['CT Analyzer', 'PT Analyzer', 'Transformador', 'Transformer', 'TTR', 'Relação de Transformação']
    },
    {
        id: 'acessories',
        name: 'Acessories',
        terms: ['Cabo', 'Cable', 'Acessório', 'Accessory', 'Kit', 'Pontas', 'Probes']
    }
];

async function redistribute() {
    console.log('\n🔄 REDISTRIBUINDO PRODUTOS ÓRFÃOS\n');

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    try {
        const productsSnapshot = await getDocs(collection(db, 'rental_equipments'));
        let updatedCount = 0;

        for (const productDoc of productsSnapshot.docs) {
            const data = productDoc.data();
            const name = (data.name || '').toLowerCase();
            const currentCat = data.category;

            let matchedCat = null;

            // Tentar encontrar uma categoria, priorizando as mais específicas
            for (const cat of CATEGORIES_RULES) {
                if (cat.terms.some(term => name.includes(term.toLowerCase()))) {
                    matchedCat = cat;
                    break; // Pega a primeira que der match (ordem importa!)
                }
            }

            // Se encontrou algo e é diferente do atual (ou atual é nulo, ou atual não existe na lista oficial)
            // Vou forçar atualização se a categoria atual parecer errada ou genérica
            if (matchedCat && matchedCat.id !== currentCat) {

                console.log(`📝 Produto: ${data.name}`);
                console.log(`   Atual: [${currentCat}] -> Novo: [${matchedCat.id}]`);

                await updateDoc(doc(db, 'rental_equipments', productDoc.id), {
                    category: matchedCat.id,
                    categoryName: matchedCat.name,
                    updatedAt: new Date().toISOString()
                });

                updatedCount++;
            } else if (!matchedCat && !currentCat) {
                console.log(`⚠️  CONTINUA SEM CATEGORIA: ${data.name}`);
            }
        }

        console.log(`\n✅ Concluído! ${updatedCount} produtos atualizados.`);

    } catch (error) {
        console.error('❌ Erro:', error);
    }

    process.exit(0);
}

redistribute();
