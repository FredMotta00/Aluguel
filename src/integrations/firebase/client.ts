import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
    apiKey: "AIzaSyCE0drNpwpGmvZJZk8KUuthqUqOi1k6R9c",
    authDomain: "aluguel-5f786.firebaseapp.com",
    projectId: "aluguel-5f786",
    storageBucket: "aluguel-5f786.firebasestorage.app",
    messagingSenderId: "355974947758",
    appId: "1:355974947758:web:9daf0b91b776a022f91e3f"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
