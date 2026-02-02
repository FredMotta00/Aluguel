// Script simples para conectar ao Firestore Admin
const admin = require('firebase-admin');

// Inicializar com credenciais do projeto
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'comexs-r1g97'
});

const db = admin.firestore();

async function quickCheck() {
    console.log('\n🔍 Verificação Rápida do Firestore\n');

    try {
        // Buscar categorias
        const categoriesSnap = await db.collection('categories').get();
        console.log(`✅ Categories: ${categoriesSnap.size} documentos`);

        if (categoriesSnap.size > 0) {
            console.log('\nCategorias encontradas:');
            categoriesSnap.forEach(doc => {
                console.log(`  - ${doc.id}:`, doc.data());
            });
        }

        // Buscar produtos
        const productsSnap = await db.collection('rental_equipments').limit(5).get();
        console.log(`\n✅ Products: ${productsSnap.size} documentos (amostra de 5)`);

        if (productsSnap.size > 0) {
            console.log('\nPrimeiros produtos:');
            productsSnap.forEach(doc => {
                const data = doc.data();
                console.log(`\n  📦 ${data.name || 'Sem nome'}`);
                console.log(`     ID: ${doc.id}`);
                console.log(`     Category: ${data.category || 'SEM CATEGORIA'}`);
                console.log(`     Status: ${data.status}`);
            });
        }

    } catch (error) {
        console.error('❌ Erro:', error);
    }

    process.exit(0);
}

quickCheck();
