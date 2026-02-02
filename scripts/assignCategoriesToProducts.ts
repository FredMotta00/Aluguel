import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
    apiKey: 'AIzaSyAhn85m2KDDeIZE51uHem5MHM0VwoNlWaU',
    authDomain: 'comexs-r1g97.firebaseapp.com',
    projectId: 'comexs-r1g97',
    storageBucket: 'comexs-r1g97.firebasestorage.app',
    messagingSenderId: '1083099377370',
    appId: '1:1083099377370:web:abd9647fbd14f75ea4bfe3'
};

// Mapeamento de categorias e regras de associação
const CATEGORIES = {
    'universal-test-set': {
        name: 'Universal Test Set',
        slug: 'universal-test-set',
        description: 'Conjuntos de teste universais para calibração e testes',
        keywords: ['uts', 'universal test set', 'uts-'],
        icon: 'TestTube2'
    },
    'power-quality-analyzers': {
        name: 'Analisadores de Qualidade de Energia',
        slug: 'power-quality-analyzers',
        description: 'Equipamentos para análise de qualidade de energia elétrica',
        keywords: ['qualímetro', 'power quality', 'analisador de energia'],
        icon: 'Zap'
    },
    'multimeters': {
        name: 'Multímetros',
        slug: 'multimeters',
        description: 'Multímetros digitais e analógicos',
        keywords: ['multímetro', 'multimeter'],
        icon: 'Gauge'
    },
    'relay-testers': {
        name: 'Testadores de Relés',
        slug: 'relay-testers',
        description: 'Equipamentos para teste de relés de proteção',
        keywords: ['relé', 'relay', 'proteção', 'protection'],
        icon: 'Shield'
    },
    'oscilloscopes': {
        name: 'Osciloscópios',
        slug: 'oscilloscopes',
        description: 'Osciloscópios digitais e analógicos',
        keywords: ['osciloscópio', 'oscilloscope'],
        icon: 'Activity'
    },
    'calibrators': {
        name: 'Calibradores',
        slug: 'calibrators',
        description: 'Calibradores de processo e instrumentos',
        keywords: ['calibrador', 'calibrator'],
        icon: 'Settings'
    }
};

async function assignCategoriesToProducts() {
    console.log('\n📋 ATRIBUINDO CATEGORIAS AOS PRODUTOS\n');

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    try {
        // 1. Criar/Atualizar categorias no Firestore
        console.log('🏷️  Criando categorias...\n');

        for (const [id, category] of Object.entries(CATEGORIES)) {
            await setDoc(doc(db, 'categories', id), {
                name: category.name,
                slug: category.slug,
                description: category.description,
                icon: category.icon,
                createdAt: new Date().toISOString()
            });
            console.log(`   ✅ ${category.name}`);
        }

        // 2. Buscar todos os produtos
        console.log('\n📦 Analisando produtos...\n');
        const productsSnapshot = await getDocs(collection(db, 'rental_equipments'));

        let updatedCount = 0;
        let alreadyCategorizedCount = 0;
        let notCategorizedCount = 0;

        const updates: Array<{ id: string; name: string; oldCategory: string | null; newCategory: string; categoryName: string }> = [];

        // 3. Atribuir categorias baseado no nome do produto
        for (const productDoc of productsSnapshot.docs) {
            const data = productDoc.data();
            const productName = (data.name || '').toLowerCase();
            const currentCategory = data.category;

            // Encontrar categoria correspondente
            let matchedCategory: string | null = null;
            let matchedCategoryName = '';

            for (const [categoryId, category] of Object.entries(CATEGORIES)) {
                // Verificar se o nome do produto contém alguma palavra-chave
                const hasKeyword = category.keywords.some(keyword =>
                    productName.includes(keyword.toLowerCase())
                );

                if (hasKeyword) {
                    matchedCategory = categoryId;
                    matchedCategoryName = category.name;
                    break;
                }
            }

            if (matchedCategory) {
                // Verificar se já tem a categoria correta
                if (currentCategory === matchedCategory) {
                    alreadyCategorizedCount++;
                } else {
                    // Atualizar categoria
                    await updateDoc(doc(db, 'rental_equipments', productDoc.id), {
                        category: matchedCategory,
                        categoryName: matchedCategoryName, // Adicionar nome também para facilitar
                        updatedAt: new Date().toISOString()
                    });

                    updates.push({
                        id: productDoc.id,
                        name: data.name || 'Sem nome',
                        oldCategory: currentCategory || null,
                        newCategory: matchedCategory,
                        categoryName: matchedCategoryName
                    });

                    updatedCount++;
                }
            } else {
                notCategorizedCount++;
                console.log(`   ⚠️  Sem categoria: ${data.name || productDoc.id}`);
            }
        }

        // 4. Mostrar resultados
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 RESUMO DA ATRIBUIÇÃO');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log(`✅ Produtos atualizados: ${updatedCount}`);
        console.log(`ℹ️  Já categorizados corretamente: ${alreadyCategorizedCount}`);
        console.log(`⚠️  Sem categoria identificada: ${notCategorizedCount}`);
        console.log(`📦 Total de produtos: ${productsSnapshot.size}\n`);

        if (updates.length > 0) {
            console.log('📝 ATUALIZAÇÕES REALIZADAS:\n');

            // Agrupar por categoria
            const updatesByCategory = updates.reduce((acc, update) => {
                if (!acc[update.categoryName]) {
                    acc[update.categoryName] = [];
                }
                acc[update.categoryName].push(update);
                return acc;
            }, {} as Record<string, typeof updates>);

            for (const [categoryName, categoryUpdates] of Object.entries(updatesByCategory)) {
                console.log(`\n🏷️  ${categoryName} (${categoryUpdates.length} produtos):`);
                categoryUpdates.forEach(update => {
                    const oldCat = update.oldCategory ? `[${update.oldCategory}]` : '[SEM CATEGORIA]';
                    console.log(`   • ${update.name}`);
                    console.log(`     ${oldCat} → [${update.newCategory}]`);
                });
            }
        }

        console.log('\n✅ CATEGORIZAÇÃO CONCLUÍDA!\n');

    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }

    process.exit(0);
}

// Executar
assignCategoriesToProducts().catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});
