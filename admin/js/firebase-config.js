import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// TODO: Replace these with your actual Firebase Project config keys
// 1. Go to console.firebase.google.com
// 2. Create a Project
// 3. Register a Web App
// 4. Copy the config object here
const firebaseConfig = {
  apiKey: "PLACEHOLDER_API_KEY",
  authDomain: "myfitvybe-placeholder.firebaseapp.com",
  projectId: "myfitvybe-placeholder",
  storageBucket: "myfitvybe-placeholder.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Helper variable to bypass auth for local demo if real keys aren't set
export const isMockMode = firebaseConfig.apiKey === "PLACEHOLDER_API_KEY";
