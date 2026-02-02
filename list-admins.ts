import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function listAdmins() {
    try {
        console.log('\n🔍 Listando TODOS os admins no Firestore...\n');

        const adminsRef = collection(db, 'admins');
        const snapshot = await getDocs(adminsRef);

        if (snapshot.empty) {
            console.log('❌ Nenhum admin encontrado na coleção "admins"!\n');
            process.exit(1);
        }

        console.log(`✅ Total de admins: ${snapshot.size}\n`);
        console.log('━'.repeat(60));

        snapshot.forEach((doc, index) => {
            console.log(`\n${index + 1}. ID do Documento: ${doc.id}`);
            console.log('   Dados:', JSON.stringify(doc.data(), null, 2));
        });

        console.log('\n' + '━'.repeat(60));
        console.log('\n💡 Para ter acesso admin, você precisa fazer login com');
        console.log('   um dos emails listados acima (exatamente como está).\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Erro ao listar admins:', error);
        process.exit(1);
    }
}

listAdmins();
