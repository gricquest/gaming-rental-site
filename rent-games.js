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
      document.getElementById('rentGamesDiv').style.display = 'block';
      loadAvailableGames();
    })
    .catch(error => {
      alert(error.message);
    });
});

// Load available games from the database
function loadAvailableGames() {
  const gamesList = document.getElementById('gamesList');
  gamesList.innerHTML = ''; // Clear the list
  onChildAdded(gamesRef, (snapshot) => {
    const gameData = snapshot.val();
    if (gameData.available) {
      const listItem = document.createElement('li');
      listItem.textContent = `Game ID: ${snapshot.key}, Name: ${gameData.name}, Available: ${gameData.available}`;
      gamesList.appendChild(listItem);
    }
  });
}

// Handle renting a game
document.getElementById('rentGameForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const gameId = document.getElementById('gameId').value.trim();
  
  if (gameId) {
    const gameRef = child(gamesRef, gameId);
    get(gameRef).then(snapshot => {
      if (snapshot.exists() && snapshot.val().available) {
        set(gameRef, { ...snapshot.val(), available: false })
          .then(() => {
            alert('Game rented successfully!');
            loadAvailableGames(); // Refresh the list
          })
          .catch(error => {
            alert('Error renting game: ' + error.message);
          });
      } else {
        alert('Game is not available for rent.');
      }
    }).catch(error => {
      alert('Error fetching game: ' + error.message);
    });
  } else {
    alert('Please enter a valid Game ID.');
  }
});
