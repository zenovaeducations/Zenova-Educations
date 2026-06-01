// Firebase Config

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBE6t8N9emqGzjiDu04j96RauJRd8YgYkU",
  authDomain: "zenova---best-web.firebaseapp.com",
  projectId: "zenova---best-web",
  storageBucket: "zenova---best-web.firebasestorage.app",
  messagingSenderId: "13087161051",
  appId: "1:13087161051:web:7d702156830255783c6afe",
  measurementId: "G-FY6NPBZR7H"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
