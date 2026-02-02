import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase config para COMEXS (Gpecx Flow + EXS Locação)
const firebaseConfig = {
    apiKey: "AIzaSyAhn85m2KDDeIZE51uHem5MHM0VwoNlWaU",
    authDomain: "comexs-r1g97.firebaseapp.com",
    projectId: "comexs-r1g97",
    storageBucket: "comexs-r1g97.firebasestorage.app",
    messagingSenderId: "1083099377370",
    appId: "1:1083099377370:web:abd9647fbd14f75ea4bfe3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addAdmin() {
    try {
        console.log('🔐 Adicionando admin ao Firestore (projeto COMEXS)...');

        const adminEmail = 'frederico.motta@gpecx.com.br';
        const adminData = {
            email: adminEmail,
            name: 'Frederico Motta',
            role: 'admin',
            createdAt: new Date(),
            source: 'EXS_Locacoes'
        };

        await setDoc(doc(db, 'admins', adminEmail), adminData);

        console.log('✅ Admin adicionado com sucesso!');
        console.log('📧 Email:', adminEmail);
        console.log('👤 Nome:', adminData.name);
        console.log('🏢 Projeto:', 'comexs-r1g97');
        console.log('\n🎉 Agora você pode acessar a área administrativa!');
        console.log('🔄 Faça logout e login novamente para aplicar as permissões.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao adicionar admin:', error);
        process.exit(1);
    }
}

addAdmin();
