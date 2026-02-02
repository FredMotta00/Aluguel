import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize without service account (use application default credentials or emulator)
const app = initializeApp({
    projectId: 'comexs-r1g97'
});

const db = getFirestore(app);

async function addAdmin() {
    try {
        console.log('🔐 Adicionando admin ao projeto COMEXS...\n');

        const adminEmail = 'frederico.motta@gpecx.com.br';
        const adminData = {
            email: adminEmail,
            name: 'Frederico Motta',
            role: 'admin',
            createdAt: new Date(),
            source: 'EXS_Locacoes'
        };

        await db.collection('admins').doc(adminEmail).set(adminData);

        console.log('✅ Admin adicionado com sucesso!');
        console.log('📧 Email:', adminEmail);
        console.log('🏢 Projeto: comexs-r1g97\n');
        console.log('🎉 Agora faça logout e login novamente!\n');

        process.exit(0);
    } catch (error: any) {
        console.error('❌ Erro:', error.message);
        console.log('\n💡 Solução alternativa:\n');
        console.log('1. Acesse: https://console.firebase.google.com/project/comexs-r1g97/firestore');
        console.log('2. Coleção: admins');
        console.log('3. Adicione documento com ID: frederico.motta@gpecx.com.br');
        console.log('4. Campos:');
        console.log('   - email: "frederico.motta@gpecx.com.br"');
        console.log('   - name: "Frederico Motta"');
        console.log('   - role: "admin"');
        console.log('   - source: "EXS_Locacoes"');
        console.log('   - createdAt: (timestamp atual)\n');
        process.exit(1);
    }
}

addAdmin();
