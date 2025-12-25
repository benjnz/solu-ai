// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfAmZsgYQpK-7IzafLttPfPvbNm8EClf4",
  authDomain: "soluaiblueprint-62038680-8d4ee.firebaseapp.com",
  projectId: "soluaiblueprint-62038680-8d4ee",
  storageBucket: "soluaiblueprint-62038680-8d4ee.appspot.com",
  messagingSenderId: "36265478306",
  appId: "1:36265478306:web:b0bd9d9f4d4c8f6fb1affb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
