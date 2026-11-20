import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAxT9G_GNCElpJ1o6rsCZovdWB3XrCGHu8",
  authDomain: "portfol-8d43f.firebaseapp.com",
  projectId: "portfol-8d43f",
  storageBucket: "portfol-8d43f.firebasestorage.app",
  messagingSenderId: "779205396645",
  appId: "1:779205396645:web:939745e975e1bdeade254c",
  measurementId: "G-GFSZ30R87X",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
