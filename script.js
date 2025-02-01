// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyB7yP6YD0oze6lo14u14aBKKVI8jBelHbc",
    authDomain: "gaming-rental-site.firebaseapp.com",
    databaseURL: "https://gaming-rental-site-default-rtdb.firebaseio.com",
    projectId: "gaming-rental-site",
    storageBucket: "gaming-rental-site.firebasestorage.app",
    messagingSenderId: "573901873327",
    appId: "1:573901873327:web:949bea4a588b6f9a37745a"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

// Add product to the database
function addProduct() {
    var gameName = document.getElementById('game-name').value;
    database.ref('games/' + gameName).set({
        available: true
    });
}

// Rent a game
function rentGame() {
    var gameName = document.getElementById('rent-game-name').value;
    database.ref('games/' + gameName).once('value', function(snapshot) {
        if (snapshot.exists() && snapshot.val().available) {
            database.ref('games/' + gameName).update({
                available: false
            });
        } else {
            alert("Game not available for rent");
        }
    });
}

// Return a game
function returnGame() {
    var gameName = document.getElementById('return-game-name').value;
    database.ref('games/' + gameName).update({
        available: true
    });
}

// Show available games
function showAvailableGames() {
    var availableGamesList = document.getElementById('available-games-list');
    database.ref('games').on('value', function(snapshot) {
        availableGamesList.innerHTML = '';
        snapshot.forEach(function(childSnapshot) {
            var game = childSnapshot.key;
            var available = childSnapshot.val().available;
            if (available) {
                var listItem = document.createElement('li');
                listItem.textContent = game;
                availableGamesList.appendChild(listItem);
            }
        });
    });
}

// Load available games on page load
window.onload = function() {
    showAvailableGames();
};
