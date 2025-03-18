// Include Firebase library
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Initialize Firebase and Firestore
const firebaseConfig = {
    apiKey: "AIzaSyBkEuLaRmpcFk7SUjshcr4j5I_YeCmi1o4",
    authDomain: "bookhive-8134e.firebaseapp.com",
    projectId: "bookhive-8134e",
    storageBucket: "bookhive-8134e.firebasestorage.app",
    messagingSenderId: "774988848702",
    appId: "1:774988848702:web:57fdcdf1bda6198024bb6f",
    measurementId: "G-TWVM5KBNCY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

export { db, storage };
