import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getDatabase, ref, push, set, onChildAdded, onValue, get } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";


// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB7yP6YD0oze6lo14u14aBKKVI8jBelHbc",
    authDomain: "gaming-rental-site.firebaseapp.com",
    databaseURL: "https://gaming-rental-site-default-rtdb.firebaseio.com",
    projectId: "gaming-rental-site",
    storageBucket: "gaming-rental-site.firebasestorage.app",
    messagingSenderId: "573901873327",
    appId: "1:573901873327:web:949bea4a588b6f9a37745a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const gamesRef = ref(database, 'games');

// Handle login
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      // Signed in
      document.getElementById('loginDiv').style.display = 'none';
      document.getElementById('adminGamesDiv').style.display = 'block';
      loadGames();
    })
    .catch(error => {
      alert(error.message);
    });
});

// Load games from the database
function loadGames() {
  const gamesList = document.getElementById('gamesList');
  gamesList.innerHTML = ''; // Clear the list
  onChildAdded(gamesRef, (snapshot) => {
    const gameData = snapshot.val();
    const listItem = document.createElement('li');
    listItem.textContent = `ID: ${snapshot.key}, Name: ${gameData.name}, Description: ${gameData.description}, Price: ${gameData.price}, Available: ${gameData.available}`;
    gamesList.appendChild(listItem);
  });
}

// Handle add or update game
document.getElementById('addUpdateGameForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const gameId = document.getElementById('gameId').value.trim();
  const gameName = document.getElementById('gameName').value.trim();
  const gameDescription = document.getElementById('gameDescription').value.trim();
  const gamePrice = parseFloat(document.getElementById('gamePrice').value.trim());
  const gameAvailability = document.getElementById('gameAvailability').value === 'true';

  if (gameName && gameDescription && gamePrice >= 0) {
    const gameData = {
      name: gameName,
      description: gameDescription,
      price: gamePrice,
      available: gameAvailability
    };

    if (gameId) {
      // Update game
      set(child(gamesRef, gameId), gameData)
        .then(() => {
          alert('Game updated successfully!');
          loadGames(); // Refresh the list
        })
        .catch(error => {
          alert('Error updating game: ' + error.message);
        });
    } else {
      // Add new game
      const newGameRef = push(gamesRef);
      set(newGameRef, gameData)
        .then(() => {
          alert('Game added successfully!');
          loadGames(); // Refresh the list
        })
        .catch(error => {
          alert('Error adding game: ' + error.message);
        });
    }
  } else {
    alert('Please enter valid game details.');
  }
});

// Handle delete game
document.getElementById('deleteGameForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const gameId = document.getElementById('deleteGameId').value.trim();

  if (gameId) {
    const gameRef = child(gamesRef, gameId);
    remove(gameRef)
      .then(() => {
        alert('Game deleted successfully!');
        loadGames(); // Refresh the list
      })
      .catch(error => {
        alert('Error deleting game: ' + error.message);
      });
  } else {
    alert('Please enter a valid Game ID.');
  }
});
