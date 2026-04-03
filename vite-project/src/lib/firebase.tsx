// @ts-nocheck
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
//import type { FirebaseOptions } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAk3kd49aO9wIX-fmE_foM8I1mA2JrOXSk",
  authDomain: "disaster2-7d335.firebaseapp.com",
  projectId: "disaster2-7d335",
  storageBucket: "disaster2-7d335.appspot.com",
  messagingSenderId: "760357853149",
  appId: "1:760357853149:web:90392c5d079ac5fb570834"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;