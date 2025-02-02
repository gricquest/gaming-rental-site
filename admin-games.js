// admin.js

// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js';
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js';
import {
    getDatabase,
    ref,
    set,
    update,
    remove,
    onValue,
    push,
} from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB7yP6YD0oze6lo14u14aBKKVI8jBelHbc",
    authDomain: "gaming-rental-site.firebaseapp.com",
    databaseURL: "https://gaming-rental-site-default-rtdb.firebaseio.com",
    projectId: "gaming-rental-site",
    storageBucket: "gaming-rental-site.firebasestorage.app",
    messagingSenderId: "573901873327",
    appId: "1:573901873327:web:949bea4a588b6f9a37745a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Rest of the admin.js code remains the same
// ...

// DOM Elements
const loginForm = document.getElementById('login-form');
const adminPanel = document.getElementById('admin-panel');

// (Functions as provided earlier)

