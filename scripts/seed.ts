
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

console.log("Initializing Firebase with project:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const products = [
    {
        nome: "Mala de Testes de Relés - Omicron CMC 356",
        descricao: "Equipamento universal para testes de relés de proteção de todas as gerações. Ideal para aplicações de alta potência.",
        status: "available",
        imagem: "https://www.omicronenergy.com/fileadmin/user_upload/products/CMC-356/CMC-356-front-right.png",

        sku: "OMI-356-001",
        type: "equipment",
        commercial: {
            isForRent: true,
            isForSale: false,
            dailyRate: 1500,
            salePrice: null,
            cashbackRate: 0.05
        },
        technical: {
            model: "CMC 356",
            manufacturer: "Omicron",
            weight: "16.8 kg",
            specs: {
                "Saídas de Corrente": "6 x 32 A / 430 VA",
                "Saídas de Tensão": "4 x 300 V / 85 VA",
                "Interface": "IEC 61850",
                "Precisão": "Alta"
            }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        nome: "Megômetro Digital - Fluke 1555",
        descricao: "Testador de isolamento de até 10 kV. Ideal para testes em comutadores, motores, geradores e cabos.",
        status: "available",
        imagem: "https://cdn.awsli.com.br/600x450/1376/1376088/produto/54752834/5fd2e2f69e.jpg",

        sku: "FLU-1555-021",
        type: "equipment",
        commercial: {
            isForRent: true,
            isForSale: true, // Hybrid item!
            dailyRate: 450,
            salePrice: 12500.00,
            cashbackRate: 0.03
        },
        technical: {
            model: "1555",
            manufacturer: "Fluke",
            weight: "4 kg",
            specs: {
                "Tensão Máxima": "10 kV",
                "Resistência Máxima": "2 TΩ",
                "Segurança": "CAT III 1000 V"
            }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        nome: "Analisador de Energia - Fluke 435 Series II",
        descricao: "Qualidade de energia e analisador de energia trifásica. Localize, preveja, previna e solucione problemas.",
        status: "maintenance",
        imagem: "https://m.media-amazon.com/images/I/61Nl-Xp+JAL.jpg",

        sku: "FLU-435-002",
        type: "equipment",
        commercial: {
            isForRent: true,
            isForSale: false,
            dailyRate: 600,
            salePrice: null,
            cashbackRate: 0.04
        },
        technical: {
            model: "435-II",
            manufacturer: "Fluke",
            specs: {
                "Função": "PowerWave",
                "Cálculo": "Perda de Energia",
                "Fase": "Trifásica"
            }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

async function seed() {
    console.log("Starting seed process...");
    try {
        const inventoryRef = collection(db, "inventory");

        for (const product of products) {
            const docRef = await addDoc(inventoryRef, product);
            console.log(`Product added with ID: ${docRef.id}`);
        }

        console.log("Seeding finished successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
    }
}

seed();
