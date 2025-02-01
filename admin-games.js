// Initialize Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "https://YOUR_DATABASE_NAME.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
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
