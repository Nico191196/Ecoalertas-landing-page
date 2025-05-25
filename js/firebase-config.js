// js/firebase-config.js

// ——————————
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvHK_BuP7HWDz_VAlCVylRKCZWI-qidCM",
  authDomain: "ecoalertas-946d0.firebaseapp.com",
  projectId: "ecoalertas-946d0",
  storageBucket: "ecoalertas-946d0.firebasestorage.app",
  messagingSenderId: "182951073757",
  appId: "1:182951073757:web:8b7cf79eae56da91304834"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);// ——————————
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUÍ",
  authDomain: "TU_AUTH_DOMAIN.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);

// Exporta el objeto auth para usarlo en otros scripts
const auth = firebase.auth();
