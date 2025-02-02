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


window.login = function () {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            // User logged in
            loginForm.style.display = 'none';
            adminPanel.style.display = 'block';
            loadGames();
            loadRentals(); // If you have this function
        })
        .catch((error) => {
            alert('Login Failed: ' + error.message);
        });
};

// Login Function

// Monitor Authentication State
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        loginForm.style.display = 'none';
        adminPanel.style.display = 'block';
        loadGames();
    } else {
        // User is signed out
        adminPanel.style.display = 'none';
        loginForm.style.display = 'block';
    }
});

// Logout Function
window.logout = function () {
    signOut(auth)
        .then(() => {
            // User signed out
            adminPanel.style.display = 'none';
            loginForm.style.display = 'block';
        })
        .catch((error) => {
            alert('Logout Failed: ' + error.message);
        });
};

// Add Game Function
window.addGame = function () {
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
};

// Update Game Function
window.updateGame = function () {
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
};

// Delete Game Function
window.deleteGame = function () {
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
};

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
          <td>${game.available ? 'Yes' : 'No'}</td>
        `;
                gamesTableBody.appendChild(row);
            });
        },
        (error) => {
            alert('Error loading games: ' + error.message);
        }
    );
}

// Helper Functions
function getGameFormData() {
    return {
        name: document.getElementById('game-name').value.trim(),
        description: document.getElementById('game-description').value.trim(),
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

function validateGameForm() {
    const name = document.getElementById('game-name').value.trim();
    const description = document.getElementById('game-description').value.trim();
    const price = document.getElementById('game-price').value.trim();

    if (!name || !description || !price) {
        alert('Please fill in all the fields.');
        return false;
    }

    if (isNaN(price) || parseFloat(price) < 0) {
        alert('Please enter a valid price.');
        return false;
    }

    return true;
}


// In admin.js
window.markAsReturned = function (rentalId, gameId) {
    const updates = {};
    updates[`rentals/${rentalId}/status`] = 'returned';
    updates[`games/${gameId}/rentals/${rentalId}/status`] = 'returned';

    update(ref(database), updates)
        .then(() => {
            alert('Rental marked as returned.');
            loadRentals();
        })
        .catch((error) => {
            alert('Error updating rental status: ' + error.message);
        });
};


// In admin.js
function loadRentals() {
    const rentalsRef = ref(database, 'rentals');

    onValue(rentalsRef, (snapshot) => {
        const rentalsTableBody = document.getElementById('rentals-table-body');
        rentalsTableBody.innerHTML = '';

        snapshot.forEach((childSnapshot) => {
            const rental = childSnapshot.val();
            const rentalId = childSnapshot.key;

            if (rental.status === 'active') {
                const row = document.createElement('tr');
                row.innerHTML = `
          <td>${rentalId}</td>
          <td>${rental.gameId}</td>
          <td>${rental.userId}</td>
          <td>${rental.startDate}</td>
          <td>${rental.endDate}</td>
          <td>${rental.status}</td>
          <td><button onclick="markAsReturned('${rentalId}', '${rental.gameId}')">Return</button></td>
        `;
                rentalsTableBody.appendChild(row);
            }
        });
    });
}


// In admin.js, after successful login
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in
        loginForm.style.display = 'none';
        adminPanel.style.display = 'block';
        loadGames();
        loadRentals();
    } else {
        // User is logged out
        loginForm.style.display = 'block';
        adminPanel.style.display = 'none';
    }
});
