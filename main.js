/// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAcPgYCoBgKfuY6XVEvorTmjBVZIdi8QPc",
    authDomain: "chatee-530ac.firebaseapp.com",
    projectId: "chatee-530ac",
    storageBucket: "chatee-530ac.appspot.com",
    messagingSenderId: "1052612417999",
    appId: "1:1052612417999:web:e0f00c85610cb398865aba",
    measurementId: "G-D7MELKXLJR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Reference to the messages node in the database
const messagesRef = ref(db, 'messages');

// DOM elements
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');

// Sign Up
const signupForm = document.getElementById('signup-form');
signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const displayName = document.getElementById('signup-display-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // Update the user's profile with the display name
            updateProfile(user, { displayName: displayName }).then(() => {
                console.log('User signed up:', user);
            }).catch((error) => {
                console.error('Error updating profile:', error.message);
            });
        })
        .catch((error) => {
            console.error('Error during sign up:', error.message);
        });
});

// Log In
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('User logged in:', user);
        })
        .catch((error) => {
            console.error('Error during login:', error.message);
        });

});// Log Out
const logoutButton = document.getElementById('logout-button');
logoutButton.addEventListener('click', () => {
    auth.signOut().then(() => {
        console.log('User signed out.');
    }).catch((error) => {
        console.error('Error signing out:', error.message);
    });
});

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('User is signed in:', user);
        document.querySelector('.auth-container').style.display = 'none'; // Hide auth forms
        document.querySelector('.chat-container').style.display = 'block'; // Show chat
    } else {
        console.log('No user is signed in.');
        document.querySelector('.auth-container').style.display = 'block'; // Show auth forms
        document.querySelector('.chat-container').style.display = 'none'; // Hide chat
    }
});

// Listen for new messages from Firebase
onChildAdded(messagesRef, (snapshot) => {
    const message = snapshot.val();
    displayMessage(message.text, message.userDisplayName);
});

// Function to display a message in the chat box
function displayMessage(text, userDisplayName) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.textContent = `${userDisplayName || 'Anonymous'}: ${text}`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
}

// Listen for form submission
chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const messageText = messageInput.value.trim();
    const user = auth.currentUser; // Get the current user
    const userDisplayName = user ? user.displayName : 'Anonymous'; // Use display name or 'Anonymous'
    if (messageText) {
        // Push new message to Firebase with user display name
        push(messagesRef, { text: messageText, userDisplayName: userDisplayName });
        messageInput.value = ''; // Clear the input field
    }
});

