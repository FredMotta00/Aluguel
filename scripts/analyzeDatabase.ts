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

async function analyzeDatabase() {
    console.log('\n🔍 ANALISANDO ESTRUTURA DO BANCO DE DADOS FIRESTORE\n');

    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // 1. Analisar Categories
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📁 COLLECTION: categories');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        console.log(`Total de documentos: ${categoriesSnapshot.size}\n`);

        categoriesSnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`📌 Category ID: ${doc.id}`);
            console.log(`   Dados:`, JSON.stringify(data, null, 2));
            console.log('');
        });
    } catch (error) {
        console.error('❌ Erro ao buscar categories:', error);
    }

    // 2. Analisar Rental Equipments
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📁 COLLECTION: rental_equipments');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        const productsSnapshot = await getDocs(collection(db, 'rental_equipments'));
        console.log(`Total de documentos: ${productsSnapshot.size}\n`);

        // Agrupar por categoria
        const productsByCategory: Record<string, any[]> = {};
        const productsWithoutCategory: any[] = [];

        productsSnapshot.forEach((doc) => {
            const data = doc.data();
            const category = data.category || null;

            const productInfo = {
                id: doc.id,
                name: data.name,
                category: category,
                status: data.status
            };

            if (category) {
                if (!productsByCategory[category]) {
                    productsByCategory[category] = [];
                }
                productsByCategory[category].push(productInfo);
            } else {
                productsWithoutCategory.push(productInfo);
            }
        });

        // Mostrar produtos por categoria
        console.log('📊 PRODUTOS AGRUPADOS POR CATEGORIA:\n');

        Object.keys(productsByCategory).forEach(category => {
            console.log(`\n🏷️  Categoria: "${category}"`);
            console.log(`   Produtos (${productsByCategory[category].length}):`);
            productsByCategory[category].forEach(p => {
                console.log(`   - ${p.name} (ID: ${p.id}, Status: ${p.status})`);
            });
        });

        if (productsWithoutCategory.length > 0) {
            console.log(`\n⚠️  PRODUTOS SEM CATEGORIA (${productsWithoutCategory.length}):`);
            productsWithoutCategory.forEach(p => {
                console.log(`   - ${p.name} (ID: ${p.id}, Status: ${p.status})`);
            });
        }

        // 3. Mostrar exemplo completo de um produto
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 EXEMPLO DE ESTRUTURA DE PRODUTO COMPLETO');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        if (productsSnapshot.size > 0) {
            const firstProduct = productsSnapshot.docs[0];
            console.log(`Produto ID: ${firstProduct.id}`);
            console.log('Estrutura completa:');
            console.log(JSON.stringify(firstProduct.data(), null, 2));
        }

    } catch (error) {
        console.error('❌ Erro ao buscar rental_equipments:', error);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ANÁLISE CONCLUÍDA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
}

// Executar análise
analyzeDatabase().catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});
