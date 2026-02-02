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

async function setupCategories() {
    console.log('\n📋 CONFIGURANDO CATEGORIAS NO FIRESTORE\n');

    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    try {
        // 1. Verificar se existem categorias
        console.log('🔍 Verificando categorias existentes...');
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));

        const existingCategories = new Map<string, any>();
        categoriesSnapshot.forEach(doc => {
            existingCategories.set(doc.id, doc.data());
            console.log(`   ✓ Categoria encontrada: ${doc.id} (${doc.data().name || doc.data().nome})`);
        });

        // 2. Criar categorias padrão se não existirem
        const defaultCategories = [
            {
                id: 'testing-equipment',
                name: 'Equipamentos de Teste',
                slug: 'testing-equipment',
                description: 'Equipamentos para testes elétricos e calibração'
            },
            {
                id: 'measuring-instruments',
                name: 'Instrumentos de Medição',
                slug: 'measuring-instruments',
                description: 'Instrumentos de medição e metrologia'
            },
            {
                id: 'power-quality',
                name: 'Qualidade de Energia',
                slug: 'power-quality',
                description: 'Equipamentos para análise de qualidade de energia'
            },
            {
                id: 'protection-testing',
                name: 'Testes de Proteção',
                slug: 'protection-testing',
                description: 'Equipamentos para testes de relés e proteção'
            }
        ];

        console.log('\n📝 Criando categorias padrão...');
        for (const category of defaultCategories) {
            if (!existingCategories.has(category.id)) {
                await setDoc(doc(db, 'categories', category.id), {
                    name: category.name,
                    slug: category.slug,
                    description: category.description,
                    createdAt: new Date().toISOString()
                });
                console.log(`   ✅ Criada: ${category.name}`);
            } else {
                console.log(`   ⏭️  Já existe: ${category.name}`);
            }
        }

        // 3. Analisar produtos
        console.log('\n🔍 Analisando produtos...');
        const productsSnapshot = await getDocs(collection(db, 'rental_equipments'));

        let productsWithCategory = 0;
        let productsWithoutCategory = 0;
        const productsByCategory = new Map<string, number>();

        console.log(`\nTotal de produtos: ${productsSnapshot.size}\n`);

        productsSnapshot.forEach(doc => {
            const data = doc.data();
            const category = data.category;

            if (category) {
                productsWithCategory++;
                productsByCategory.set(category, (productsByCategory.get(category) || 0) + 1);
            } else {
                productsWithoutCategory++;
                console.log(`   ⚠️  Sem categoria: ${data.name || doc.id}`);
            }
        });

        console.log(`\n📊 RESUMO:\n`);
        console.log(`✅ Produtos com categoria: ${productsWithCategory}`);
        console.log(`⚠️  Produtos sem categoria: ${productsWithoutCategory}\n`);

        if (productsByCategory.size > 0) {
            console.log('📈 Distribuição por categoria:\n');
            productsByCategory.forEach((count, categoryId) => {
                const categoryData = existingCategories.get(categoryId);
                const categoryName = categoryData?.name || categoryData?.nome || categoryId;
                console.log(`   ${categoryName}: ${count} produtos`);
            });
        }

        // 4. Sugerir categoria para produtos sem categoria (baseado no nome)
        if (productsWithoutCategory > 0) {
            console.log('\n💡 SUGESTÕES DE CATEGORIZAÇÃO:\n');

            const suggestions = new Map<string, string>();

            productsSnapshot.forEach(doc => {
                const data = doc.data();
                if (!data.category) {
                    const name = (data.name || '').toLowerCase();
                    let suggestedCategory = 'testing-equipment'; // padrão

                    if (name.includes('uts') || name.includes('test set')) {
                        suggestedCategory = 'testing-equipment';
                    } else if (name.includes('multímetro') || name.includes('multimeter')) {
                        suggestedCategory = 'measuring-instruments';
                    } else if (name.includes('qualímetro') || name.includes('power quality')) {
                        suggestedCategory = 'power-quality';
                    } else if (name.includes('relé') || name.includes('relay') || name.includes('proteção')) {
                        suggestedCategory = 'protection-testing';
                    }

                    suggestions.set(doc.id, suggestedCategory);

                    const categoryData = existingCategories.get(suggestedCategory) ||
                        defaultCategories.find(c => c.id === suggestedCategory);
                    console.log(`   📦 ${data.name || doc.id}`);
                    console.log(`      → Sugestão: ${categoryData?.name || suggestedCategory}`);
                }
            });

            console.log('\n❓ Deseja aplicar estas sugestões automaticamente?');
            console.log('   Execute: node scripts/applyCategorySuggestions.js');
        }

        console.log('\n✅ CONFIGURAÇÃO CONCLUÍDA!\n');

    } catch (error) {
        console.error('❌ Erro:', error);
    }

    process.exit(0);
}

// Executar
setupCategories().catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});
