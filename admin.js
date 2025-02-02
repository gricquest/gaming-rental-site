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
    // Your Firebase configuration here
    apiKey: "AIzaSyB7yP6YD0oze6lo14u14aBKKVI8jBelHbc",
    authDomain: "gaming-rental-site.firebaseapp.com",
    databaseURL: "https://gaming-rental-site-default-rtdb.firebaseio.com",
    projectId: "gaming-rental-site",
    storageBucket: "gaming-rental-site.firebasestorage.app",
    messagingSenderId: "573901873327",
    appId: "1:573901873327:web:949bea4a588b6f9a37745a"
    // ... other configuration ...
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Wait for the DOM to load before adding event listeners
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginForm = document.getElementById('login-form');
    const adminPanel = document.getElementById('admin-panel');

    // Event Listeners
    document.getElementById('login-button').addEventListener('click', login);
    document.getElementById('logout-button').addEventListener('click', logout);
    document.getElementById('add-game-button').addEventListener('click', addGame);
    document.getElementById('update-game-button').addEventListener('click', updateGame);
    document.getElementById('delete-game-button').addEventListener('click', deleteGame);

    // Monitor Authentication State
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            loginForm.style.display = 'none';
            adminPanel.style.display = 'block';
            loadGames();
            // Load rentals if applicable
            // loadRentals();
        } else {
            // User is signed out
            adminPanel.style.display = 'none';
            loginForm.style.display = 'block';
        }
    });
});

// Login Function
function login() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            // User logged in successfully
            // Authentication state listener will handle UI changes
        })
        .catch((error) => {
            alert('Login Failed: ' + error.message);
        });
}

// Logout Function
function logout() {
    signOut(auth)
        .then(() => {
            // User signed out
            // Authentication state listener will handle UI changes
        })
        .catch((error) => {
            alert('Logout Failed: ' + error.message);
        });
}

// Add Game Function
function addGame() {
    if (!validateGameForm()) return;

    const gameId = push(ref(database, 'games')).key;
    const gameData = getGameFormData();

    set(ref(database, 'games/' + gameId), gameData)
        .then(() => {
            alert('Game added successfully!');
            clearGameForm();
            loadGames();
        })
        .catch((error) => {
            alert('Error adding game: ' + error.message);
        });
}

// Update Game Function
function updateGame() {
    const gameId = document.getElementById('game-id').value.trim();
    if (!gameId) {
        alert('Please enter a Game ID to update.');
        return;
    }

    if (!validateGameForm()) return;

    const gameData = getGameFormData();
    update(ref(database, 'games/' + gameId), gameData)
        .then(() => {
            alert('Game updated successfully!');
            clearGameForm();
            loadGames();
        })
        .catch((error) => {
            alert('Error updating game: ' + error.message);
        });
}

// Delete Game Function
function deleteGame() {
    const gameId = document.getElementById('game-id').value.trim();
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
        .catch((error) => {
            alert('Error deleting game: ' + error.message);
        });
}

// Load Games Function
function loadGames() {
    const gamesRef = ref(database, 'games');
    onValue(
        gamesRef,
        (snapshot) => {
            const gamesTableBody = document.getElementById('games-table-body');
            gamesTableBody.innerHTML = '';

            snapshot.forEach((childSnapshot) => {
                const game = childSnapshot.val();
                const gameId = childSnapshot.key;

                const row = document.createElement('tr');
                row.innerHTML = `
          <td>${gameId}</td>
          <td>${game.name}</td>
          <td>${game.description}</td>
          <td>$${parseFloat(game.price).toFixed(2)}</td>
          <td>${game.platform}</td>
          <td>${game.genre}</td>
          <td>${game.releaseDate || 'N/A'}</td>
          <td>${game.available ? 'Yes' : 'No'}</td>
          <td><img src="${game.imageUrl || ''}" alt="${game.name}" width="50"></td>
        `;
                gamesTableBody.appendChild(row);

                // Optionally, add a click event to populate form with game data for editing
                row.addEventListener('click', () => {
                    populateGameForm(gameId, game);
                });
            });
        },
        (error) => {
            alert('Error loading games: ' + error.message);
        }
    );
}

// Populate Game Form for Editing
function populateGameForm(gameId, gameData) {
    document.getElementById('game-id').value = gameId;
    document.getElementById('game-name').value = gameData.name || '';
    document.getElementById('game-description').value = gameData.description || '';
    document.getElementById('game-price').value = gameData.price || '';
    document.getElementById('game-platform').value = gameData.platform || '';
    document.getElementById('game-genre').value = gameData.genre || '';
    document.getElementById('game-release-date').value = gameData.releaseDate || '';
    document.getElementById('game-image-url').value = gameData.imageUrl || '';
    document.getElementById('game-availability').value = gameData.available ? 'true' : 'false';
}

// Helper Functions
function getGameFormData() {
    return {
        name: document.getElementById('game-name').value.trim(),
        description: document.getElementById('game-description').value.trim(),
        price: parseFloat(document.getElementById('game-price').value),
        platform: document.getElementById('game-platform').value.trim(),
        genre: document.getElementById('game-genre').value.trim(),
        releaseDate: document.getElementById('game-release-date').value, // Assuming YYYY-MM-DD format
        imageUrl: document.getElementById('game-image-url').value.trim(),
        available: document.getElementById('game-availability').value === 'true',
    };
}

function clearGameForm() {
    document.getElementById('game-id').value = '';
    document.getElementById('game-name').value = '';
    document.getElementById('game-description').value = '';
    document.getElementById('game-price').value = '';
    document.getElementById('game-platform').value = '';
    document.getElementById('game-genre').value = '';
    document.getElementById('game-release-date').value = '';
    document.getElementById('game-image-url').value = '';
    document.getElementById('game-availability').value = 'true';
}

function validateGameForm() {
    const name = document.getElementById('game-name').value.trim();
    const description = document.getElementById('game-description').value.trim();
    const price = document.getElementById('game-price').value.trim();
    const platform = document.getElementById('game-platform').value.trim();
    const genre = document.getElementById('game-genre').value.trim();
    const releaseDate = document.getElementById('game-release-date').value.trim();
    const imageUrl = document.getElementById('game-image-url').value.trim();

    if (!name || !description || !price || !platform || !genre || !releaseDate || !imageUrl) {
        alert('Please fill in all the fields.');
        return false;
    }

    if (isNaN(price) || parseFloat(price) < 0) {
        alert('Please enter a valid price.');
        return false;
    }

    // Optionally, validate the image URL
    if (!isValidUrl(imageUrl)) {
        alert('Please enter a valid Image URL.');
        return false;
    }

    return true;
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}
