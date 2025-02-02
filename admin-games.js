// Import Firebase modules (using Firebase version 9 modules)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getDatabase, ref, set, update, remove, onValue } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js';

// Firebase Configuration
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
const auth = getAuth();
const database = getDatabase(app);

// Elements
const loginForm = document.getElementById('login-form');
const adminPanel = document.getElementById('admin-panel');

// Login Function
window.login = function () {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            loginForm.style.display = 'none';
            adminPanel.style.display = 'block';
            loadGames();
        })
        .catch((error) => {
            alert("Login Failed: " + error.message);
        });
};

// Logout Function
window.logout = function () {
    signOut(auth).then(() => {
        adminPanel.style.display = 'none';
        loginForm.style.display = 'block';
    });
};

// Add Game
window.addGame = function () {
    const gameId = ref(database, 'games').push().key;
    const gameData = getGameFormData();

    set(ref(database, 'games/' + gameId), gameData)
        .then(() => {
            alert('Game added successfully!');
            clearGameForm();
            loadGames();
        })
        .catch(error => {
            alert("Error: " + error.message);
        });
};

// Update Game
window.updateGame = function () {
    const gameId = document.getElementById('game-id').value;
    if (!gameId) {
        alert('Please enter a Game ID to update.');
        return;
    }
    const gameData = getGameFormData();

    update(ref(database, 'games/' + gameId), gameData)
        .then(() => {
            alert('Game updated successfully!');
            clearGameForm();
            loadGames();
        })
        .catch(error => {
            alert("Error: " + error.message);
        });
};

// Delete Game
window.deleteGame = function () {
    const gameId = document.getElementById('game-id').value;
    if (!gameId) {
        alert('Please enter a Game ID to delete.');
        return;
    }

    remove(ref(database, 'games/' + gameId))
        .then(() => {
            alert('Game deleted successfully!');
            clearGameForm();
            loadGames();
        })
        .catch(error => {
            alert("Error: " + error.message);
        });
};

// Load Games to Table
function loadGames() {
    const gamesRef = ref(database, 'games');
    onValue(gamesRef, (snapshot) => {
        const gamesTableBody = document.getElementById('games-table-body');
        gamesTableBody.innerHTML = ''; // Clear Table
        snapshot.forEach((childSnapshot) => {
            const game = childSnapshot.val();
            const gameId = childSnapshot.key;

            const row = document.createElement('tr');
            row.innerHTML = `
        <td>${gameId}</td>
        <td>${game.name}</td>
        <td>${game.description}</td>
        <td>$${game.price}</td>
        <td>${game.available ? 'Yes' : 'No'}</td>
      `;
            gamesTableBody.appendChild(row);
        });
    });
}

// Helper Functions
function getGameFormData() {
    return {
        name: document.getElementById('game-name').value,
        description: document.getElementById('game-description').value,
        price: parseFloat(document.getElementById('game-price').value),
        available: document.getElementById('game-availability').value === 'true',
    };
}

function clearGameForm() {
    document.getElementById('game-id').value = '';
    document.getElementById('game-name').value = '';
    document.getElementById('game-description').value = '';
    document.getElementById('game-price').value = '';
    document.getElementById('game-availability').value = 'true';
}
