// Configuração do Firebase para integração com o Ecosistema Rial
// Este arquivo deve ser configurado com as mesmas credenciais do ecosistema principal

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase - DEVE ser a mesma do ecosistema Rial
const firebaseConfig = {
  // IMPORTANTE: Substitua pelas configurações reais do seu projeto Firebase
  apiKey: "AIzaSyBxQKw5hXKQrpue3hA3WvZGT4UO2Dh5Iz0",
  authDomain: "portal-rial.firebaseapp.com",
  projectId: "portal-rial",
  storageBucket: "portal-rial.firebasestorage.app",
  messagingSenderId: "725347511611",
  appId: "1:725347511611:web:623ad406046a6e30071b1e",
  measurementId: "G-G5XM2DGCN6"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

