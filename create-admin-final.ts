import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAhn85m2KDDeIZE51uHem5MHM0VwoNlWaU",
    authDomain: "comexs-r1g97.firebaseapp.com",
    projectId: "comexs-r1g97",
    storageBucket: "comexs-r1g97.firebasestorage.app",
    messagingSenderId: "1083099377370",
    appId: "1:1083099377370:web:abd9647fbd14f75ea4bfe3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createAdmin() {
    try {
        const adminEmail = 'frederico.motta@gpecx.com.br';

        console.log('\n🔍 Verificando se admin já existe...');
        const adminRef = doc(db, 'admins', adminEmail);
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {
            console.log('✅ Admin já existe!');
            console.log('Dados:', adminSnap.data());
            console.log('\n💡 Faça logout e login novamente para ativar as permissões.\n');
            process.exit(0);
        }

        console.log('📝 Criando documento admin...\n');

        const adminData = {
            email: adminEmail,
            name: 'Frederico Motta',
            role: 'admin',
            createdAt: new Date(),
            source: 'EXS_Locacoes'
        };

        await setDoc(adminRef, adminData);

        console.log('✅ SUCESSO! Admin criado:');
        console.log('   📧 Email:', adminEmail);
        console.log('   👤 Nome:', adminData.name);
        console.log('   🏢 Projeto: comexs-r1g97');
        console.log('\n🎉 Agora faça LOGOUT e LOGIN novamente!');
        console.log('🔄 Após fazer login, você terá acesso admin.\n');

        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Erro:', error.message);
        console.error('Código:', error.code);
        console.log('\n💡 Se o erro for de permissão, as regras do Firestore');
        console.log('   podem precisar de alguns segundos para propagar.\n');
        process.exit(1);
    }
}

createAdmin();
