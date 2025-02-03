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

// Register Function
window.register = function () {
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
            alert('Registration successful!');
        })
        .catch((error) => {
            alert('Registration failed: ' + error.message);
        });
};

// Login Function
window.login = function () {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            alert('Login successful!');
        })
        .catch((error) => {
            alert('Login failed: ' + error.message);
        });
};


import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js';

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'none';
        // Show rental options
    } else {
        // User is signed out
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'block';
        // Hide rental options
    }
});



import { getDatabase, ref, onValue, push, update } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js';

const database = getDatabase();

let selectedGameId = '';
let selectedGameName = '';

function showAvailableGames() {
    const gamesRef = ref(database, 'games');
    const availableGamesList = document.getElementById('available-games-list');

    onValue(gamesRef, (snapshot) => {
        availableGamesList.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const game = childSnapshot.val();
            const gameId = childSnapshot.key;

            const listItem = document.createElement('li');
            listItem.innerHTML = `
        <h3>${game.name}</h3>
        <p>${game.description}</p>
        <p>Price: $${game.price}</p>
        <button onclick="openRentalForm('${gameId}', '${game.name}')">Rent</button>
      `;
            availableGamesList.appendChild(listItem);
        });
    });
}

window.openRentalForm = function (gameId, gameName) {
    selectedGameId = gameId;
    selectedGameName = gameName;
    document.getElementById('rental-game-name').textContent = `Renting: ${gameName}`;
    document.getElementById('rental-form').style.display = 'block';
};

window.closeRentalForm = function () {
    document.getElementById('rental-form').style.display = 'none';
};

window.rentGame = function () {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (!startDate || !endDate) {
        alert('Please select both start and end dates.');
        return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
        alert('End date must be after start date.');
        return;
    }

    checkAvailabilityAndRent(selectedGameId, startDate, endDate);
};



import { get, child } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js';

function checkAvailabilityAndRent(gameId, startDate, endDate) {
    const rentalsRef = ref(database, `games/${gameId}/rentals`);

    get(rentalsRef).then((snapshot) => {
        let isAvailable = true;
        snapshot.forEach((childSnapshot) => {
            const rental = childSnapshot.val();

            if (rental.status === 'active') {
                const existingStart = new Date(rental.startDate);
                const existingEnd = new Date(rental.endDate);
                const newStart = new Date(startDate);
                const newEnd = new Date(endDate);

                // Check for date overlap
                if (newStart <= existingEnd && newEnd >= existingStart) {
                    isAvailable = false;
                }
            }
        });

        if (isAvailable) {
            confirmRental(gameId, startDate, endDate);
        } else {
            alert('Game is not available during the selected dates.');
        }
    });
}


import { getAuth } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js';

const auth = getAuth();

function confirmRental(gameId, startDate, endDate) {
    const user = auth.currentUser;
    if (!user) {
        alert('You must be logged in to rent a game.');
        return;
    }

    const rentalId = push(ref(database, 'rentals')).key;
    const rentalData = {
        gameId,
        userId: user.uid,
        startDate,
        endDate,
        status: 'active',
    };

    const updates = {};
    updates[`rentals/${rentalId}`] = rentalData;
    updates[`games/${gameId}/rentals/${rentalId}`] = rentalData;

    update(ref(database), updates)
        .then(() => {
            alert('Rental confirmed!');
            closeRentalForm();
        })
        .catch((error) => {
            alert('Error confirming rental: ' + error.message);
        });
}


function filterAvailableGames(startDate, endDate) {
    const gamesRef = ref(database, 'games');
    const availableGamesList = document.getElementById('available-games-list');

    onValue(gamesRef, (snapshot) => {
        availableGamesList.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const game = childSnapshot.val();
            const gameId = childSnapshot.key;

            isGameAvailable(gameId, startDate, endDate, (isAvailable) => {
                if (isAvailable) {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
            <h3>${game.name}</h3>
            <p>${game.description}</p>
            <p>Price: $${game.price}</p>
            <button onclick="openRentalForm('${gameId}', '${game.name}')">Rent</button>
          `;
                    availableGamesList.appendChild(listItem);
                }
            });
        });
    });
}

function isGameAvailable(gameId, startDate, endDate, callback) {
    const rentalsRef = ref(database, `games/${gameId}/rentals`);

    get(rentalsRef).then((snapshot) => {
        let isAvailable = true;

        snapshot.forEach((childSnapshot) => {
            const rental = childSnapshot.val();

            if (rental.status === 'active') {
                const existingStart = new Date(rental.startDate);
                const existingEnd = new Date(rental.endDate);
                const newStart = new Date(startDate);
                const newEnd = new Date(endDate);

                if (newStart <= existingEnd && newEnd >= existingStart) {
                    isAvailable = false;
                }
            }
        });

        callback(isAvailable);
    });
}

// Load available games on page load
window.onload = function() {
    showAvailableGames();
};
