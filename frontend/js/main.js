// frontend/js/main.js

// API Base URL - Make sure your Flask backend is running on this address and port
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// UI Elements (referencing IDs from index.html)
const authSection = document.getElementById('authSection');
const registerFormDiv = document.getElementById('registerForm');
const loginFormDiv = document.getElementById('loginForm');
const eventsSection = document.getElementById('eventsSection');
const createEventFormDiv = document.getElementById('createEventForm');
const eventsListDiv = document.getElementById('eventsList');

const showRegisterBtn = document.getElementById('showRegisterBtn');
const showLoginBtn = document.getElementById('showLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const welcomeMessageSpan = document.getElementById('welcomeMessage');
const showCreateEventFormBtn = document.getElementById('showCreateEventFormBtn');
const cancelCreateEventBtn = document.getElementById('cancelCreateEventBtn');

const registerUserForm = document.getElementById('registerUserForm');
const loginUserForm = document.getElementById('loginUserForm');
const addEventForm = document.getElementById('addEventForm');

const registerMessage = document.getElementById('registerMessage');
const loginMessage = document.getElementById('loginMessage');
const createEventMessage = document.getElementById('createEventMessage');

// State variables (for a real app, you'd use more robust state management like Vuex/Redux)
// For this project, we'll store user_id and username in localStorage to persist login
let currentUserId = null;
let currentUsername = null;

// --- Helper Functions ---

/**
 * Displays a message on the UI, styling it as success or error.
 * @param {HTMLElement} element - The DOM element to display the message in.
 * @param {string} message - The message text.
 * @param {'success' | 'error'} type - The type of message (for styling).
 */
function showMessage(element, message, type) {
    element.textContent = message;
    // Apply Tailwind CSS classes for styling
    element.className = `message mt-6 p-4 rounded-lg font-semibold text-center ${type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
        element.textContent = '';
    }, 5000); // Hide after 5 seconds
}

/**
 * Updates the UI based on whether a user is logged in or not.
 */
function updateUIAfterAuth() {
    if (currentUserId && currentUsername) {
        // User is logged in
        authSection.style.display = 'none'; // Hide auth forms
        eventsSection.style.display = 'block'; // Show events section
        showRegisterBtn.style.display = 'none'; // Hide register button
        showLoginBtn.style.display = 'none'; // Hide login button
        logoutBtn.style.display = 'inline-block'; // Show logout button
        welcomeMessageSpan.textContent = `Welcome, ${currentUsername}!`; // Display welcome message
        welcomeMessageSpan.style.display = 'inline-block';
        fetchEvents(); // Load events relevant to the logged-in user (or all events)
    } else {
        // User is logged out
        authSection.style.display = 'block'; // Show auth forms
        eventsSection.style.display = 'none'; // Hide events section
        showRegisterBtn.style.display = 'inline-block'; // Show register button
        showLoginBtn.style.display = 'inline-block'; // Show login button
        logoutBtn.style.display = 'none'; // Hide logout button
        welcomeMessageSpan.style.display = 'none'; // Hide welcome message
        welcomeMessageSpan.textContent = '';
    }
}

// --- API Interaction Functions ---

/**
 * Sends a registration request to the backend.
 * @param {string} username
 * @param {string} email
 * @param {string} password
 */
async function registerUser(username, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        const data = await response.json();
        if (response.ok) {
            showMessage(registerMessage, data.message, 'success');
            // Switch to login form after successful registration for convenience
            registerFormDiv.style.display = 'none';
            loginFormDiv.style.display = 'block';
        } else {
            showMessage(registerMessage, data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage(registerMessage, `Network error: ${error.message}`, 'error');
    }
}

/**
 * Sends a login request to the backend.
 * On success, attempts to fetch user ID and updates UI.
 * @param {string} username
 * @param {string} password
 */
async function loginUser(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            showMessage(loginMessage, data.message, 'success');
            // After successful login, we need the user's ID for creating events.
            // We make a new GET request to fetch user details by username.
            const userResponse = await fetch(`${API_BASE_URL}/auth/users?username=${username}`);
            const userData = await userResponse.json();

            if (userResponse.ok && userData.length > 0) {
                currentUserId = userData[0].id;
                currentUsername = username;
                // Store in localStorage for basic persistence across sessions
                localStorage.setItem('user_id', currentUserId);
                localStorage.setItem('username', currentUsername);
                updateUIAfterAuth(); // Update UI to show events section
            } else {
                showMessage(loginMessage, 'Login successful, but could not retrieve user data. Try refreshing.', 'error');
            }
        } else {
            showMessage(loginMessage, data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage(loginMessage, `Network error: ${error.message}`, 'error');
    }
}

/**
 * Fetches and displays all events from the backend.
 */
async function fetchEvents() {
    try {
        const response = await fetch(`${API_BASE_URL}/events`);
        const events = await response.json();
        eventsListDiv.innerHTML = ''; // Clear previous events

        if (events.length === 0) {
            eventsListDiv.innerHTML = '<p class="text-gray-600">No events found. Be the first to create one!</p>';
            return;
        }

        events.forEach(event => {
            const eventCard = document.createElement('div');
            // Apply Tailwind CSS classes for event cards
            eventCard.className = 'event-card bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1';
            eventCard.innerHTML = `
                <h4 class="text-2xl font-semibold text-blue-700 mb-2">${event.title}</h4>
                <p class="text-gray-600 mb-1"><strong>Description:</strong> ${event.description || 'N/A'}</p>
                <p class="text-gray-600 mb-1"><strong>Date:</strong> <span class="font-medium">${event.date}</span> ${event.time ? `<span class="font-medium">${event.time}</span>` : ''}</p>
                <p class="text-gray-600 mb-3"><strong>Location:</strong> ${event.location || 'N/A'}</p>
                <p><small class="text-gray-500 text-sm">Created by User ID: ${event.created_by_user_id}</small></p>
                `;
            eventsListDiv.appendChild(eventCard);
        });
    } catch (error) {
        eventsListDiv.innerHTML = `<p class="message error bg-red-100 text-red-700">Failed to load events: ${error.message}</p>`;
    }
}

/**
 * Sends a request to create a new event.
 * @param {object} eventData - Object containing event details.
 */
async function createEvent(eventData) {
    // Attach currentUserId from logged-in user to event data for the backend
    eventData.user_id = currentUserId;

    try {
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });
        const data = await response.json();
        if (response.ok) {
            showMessage(createEventMessage, data.message, 'success');
            addEventForm.reset(); // Clear the form
            createEventFormDiv.style.display = 'none'; // Hide form after creation
            fetchEvents(); // Refresh event list to show the new event
        } else {
            showMessage(createEventMessage, data.message || 'Failed to create event', 'error');
        }
    } catch (error) {
        showMessage(createEventMessage, `Network error: ${error.message}`, 'error');
    }
}

// --- Event Listeners (for UI interactions) ---

showRegisterBtn.addEventListener('click', () => {
    registerFormDiv.style.display = 'block';
    loginFormDiv.style.display = 'none';
    registerMessage.style.display = 'none'; // Clear previous messages
    loginMessage.style.display = 'none'; // Clear previous messages
});

showLoginBtn.addEventListener('click', () => {
    loginFormDiv.style.display = 'block';
    registerFormDiv.style.display = 'none';
    loginMessage.style.display = 'none'; // Clear previous messages
    registerMessage.style.display = 'none'; // Clear previous messages
});

logoutBtn.addEventListener('click', () => {
    // Clear user state
    currentUserId = null;
    currentUsername = null;
    localStorage.removeItem('user_id'); // Remove from local storage
    localStorage.removeItem('username'); // Remove from local storage
    updateUIAfterAuth(); // Update UI to show auth forms
    eventsListDiv.innerHTML = '<p class="text-gray-600">Loading events...</p>'; // Clear events list placeholder
    showMessage(loginMessage, 'Logged out successfully.', 'success'); // Show logout message
});

registerUserForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    registerUser(username, email, password);
});

loginUserForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission
    const username = document.getElementById('logUsername').value;
    const password = document.getElementById('logPassword').value;
    loginUser(username, password);
});

showCreateEventFormBtn.addEventListener('click', () => {
    createEventFormDiv.style.display = 'block'; // Show create event form
});

cancelCreateEventBtn.addEventListener('click', () => {
    createEventFormDiv.style.display = 'none'; // Hide create event form
    addEventForm.reset(); // Reset form fields
    createEventMessage.style.display = 'none'; // Clear message
});

addEventForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    let eventTimeValue = document.getElementById('eventTime').value;
    if (eventTimeValue && eventTimeValue.match(/^\d{2}:\d{2}$/)) {
        eventTimeValue += ':00';
    }

    const eventData = {
        title: document.getElementById('eventTitle').value,
        description: document.getElementById('eventDescription').value,
        date: document.getElementById('eventDate').value,
        time: eventTimeValue,
        location: document.getElementById('eventLocation').value
    };
    createEvent(eventData);
});

// --- Initial Load Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // On page load, check if user details are stored in localStorage
    currentUserId = localStorage.getItem('user_id');
    currentUsername = localStorage.getItem('username');
    updateUIAfterAuth(); // Set initial UI state based on login status
});