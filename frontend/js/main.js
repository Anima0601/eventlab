const API_BASE_URL = 'http://127.0.0.1:5000/api';

const authSection = document.getElementById('authSection');
const registerFormDiv = document.getElementById('registerForm');
const loginFormDiv = document.getElementById('loginForm');
const eventsSection = document.getElementById('eventsSection');
const createEventFormDiv = document.getElementById('createEventForm');
const editEventFormDiv = document.getElementById('editEventForm');
const eventsListDiv = document.getElementById('eventsList');

const showRegisterBtn = document.getElementById('showRegisterBtn');
const showLoginBtn = document.getElementById('showLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const welcomeMessageSpan = document.getElementById('welcomeMessage');
const showCreateEventFormBtn = document.getElementById('showCreateEventFormBtn');
const cancelCreateEventBtn = document.getElementById('cancelCreateEventBtn');
const cancelEditEventBtn = document.getElementById('cancelEditEventBtn');

const registerUserForm = document.getElementById('registerUserForm');
const loginUserForm = document.getElementById('loginUserForm');
const addEventForm = document.getElementById('addEventForm');
const updateEventForm = document.getElementById('updateEventForm');

const registerMessage = document.getElementById('registerMessage');
const loginMessage = document.getElementById('loginMessage');
const createEventMessage = document.getElementById('createEventMessage');
const editEventMessage = document.getElementById('editEventMessage');

const editEventIdInput = document.getElementById('editEventId');
const editEventTitleInput = document.getElementById('editEventTitle');
const editEventDescriptionInput = document.getElementById('editEventDescription');
const editEventDateInput = document.getElementById('editEventDate');
const editEventTimeInput = document.getElementById('editEventTime');
const editEventLocationInput = document.getElementById('editEventLocation');

const searchQueryInput = document.getElementById('searchQuery');
const filterLocationInput = document.getElementById('filterLocation');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');

const attendeesModal = document.getElementById('attendeesModal');
const closeAttendeesModalBtn = document.getElementById('closeAttendeesModalBtn');
const attendeesModalTitle = document.getElementById('attendeesModalTitle');
const attendeesListContent = document.getElementById('attendeesListContent');

let currentUserId = null;
let currentUsername = null;

function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message mt-6 p-4 rounded-lg font-semibold text-center ${type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
        element.textContent = '';
    }, 5000);
}

function updateUIAfterAuth() {
    if (currentUserId && currentUsername) {
        authSection.style.display = 'none';
        eventsSection.style.display = 'block';
        showRegisterBtn.style.display = 'none';
        showLoginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        welcomeMessageSpan.textContent = `Welcome, ${currentUsername}!`;
        welcomeMessageSpan.style.display = 'inline-block';
        fetchEvents();
    } else {
        authSection.style.display = 'block';
        eventsSection.style.display = 'none';
        showRegisterBtn.style.display = 'inline-block';
        showLoginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        welcomeMessageSpan.style.display = 'none';
        welcomeMessageSpan.textContent = '';
        createEventFormDiv.style.display = 'none';
        editEventFormDiv.style.display = 'none';
        clearFilters();
    }
}

function hideAllEventForms() {
    createEventFormDiv.style.display = 'none';
    editEventFormDiv.style.display = 'none';
    addEventForm.reset();
    updateEventForm.reset();
    createEventMessage.style.display = 'none';
    editEventMessage.style.display = 'none';
}

function clearFilters() {
    searchQueryInput.value = '';
    filterLocationInput.value = '';
    fetchEvents();
}

async function registerUser(username, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await response.json();
        if (response.ok) {
            showMessage(registerMessage, data.message, 'success');
            registerFormDiv.style.display = 'none';
            loginFormDiv.style.display = 'block';
        } else {
            showMessage(registerMessage, data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage(registerMessage, `Network error: ${error.message}`, 'error');
    }
}

async function loginUser(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            showMessage(loginMessage, data.message, 'success');
            const userResponse = await fetch(`${API_BASE_URL}/auth/users?username=${username}`);
            const userData = await userResponse.json();

            if (userResponse.ok && userData.length > 0) {
                currentUserId = userData[0].id;
                currentUsername = username;
                localStorage.setItem('user_id', currentUserId);
                localStorage.setItem('username', currentUsername);
                updateUIAfterAuth();
            } else {
                showMessage(loginMessage, 'Login successful, but could not retrieve user data. Try refreshing.','error');
            }
        } else {
            showMessage(loginMessage, data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage(loginMessage, `Network error: ${error.message}`, 'error');
    }
}

async function fetchEvents() {
    const query = searchQueryInput.value.trim();
    const location = filterLocationInput.value.trim();

    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (location) params.append('location', location);

    const url = `${API_BASE_URL}/events?${params.toString()}`;
    console.log("Fetching events from URL:", url);

    try {
        const response = await fetch(url);
        const events = await response.json();
        eventsListDiv.innerHTML = '';

        if (events.length === 0) {
            eventsListDiv.innerHTML = '<p class="text-gray-600 text-center col-span-full">No events found matching your criteria. Try adjusting your filters.</p>';
            return;
        }

        const attendingEvents = new Set();
        if (currentUserId) {
            try {
                const attendanceResponse = await fetch(`${API_BASE_URL}/auth/users/${currentUserId}/attended_events`);
                if (attendanceResponse.ok) {
                    const attendedData = await attendanceResponse.json();
                    attendedData.forEach(item => attendingEvents.add(item.event_id));
                } else {
                    console.error("Failed to fetch attended events for user:", await attendanceResponse.json());
                }
            } catch (error) {
                console.error("Error fetching user's attended events:", error);
            }
        }

        events.forEach(event => {
            const isAttending = attendingEvents.has(event.id);
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col justify-between';
            eventCard.innerHTML = `
                <div>
                    <h4 class="text-2xl font-semibold text-blue-700 mb-2">${event.title}</h4>
                    <p class="text-gray-600 mb-1"><strong>Description:</strong> ${event.description || 'N/A'}</p>
                    <p class="text-gray-600 mb-1"><strong>Date:</strong> <span class="font-medium">${event.date}</span> ${event.time ? `<span class="font-medium">${event.time.substring(0, 5)}</span>` : ''}</p>
                    <p class="text-gray-600 mb-3"><strong>Location:</strong> ${event.location || 'N/A'}</p>
                    <p><small class="text-gray-500 text-sm">Created by User ID: ${event.created_by_user_id}</small></p>
                </div>
                <div class="mt-4 flex flex-wrap gap-2">
                    ${currentUserId ? `
                        ${isAttending ? `
                            <button class="bg-gray-400 text-white font-bold py-2 px-4 rounded-lg cursor-not-allowed flex-grow">Attending</button>
                        ` : `
                            <button class="attend-btn bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-md flex-grow" data-id="${event.id}">Attend</button>
                        `}
                        <button class="view-attendees-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-md flex-grow" data-id="${event.id}" data-title="${event.title}">View Attendees</button>
                    ` : ''}
                    ${currentUserId == event.created_by_user_id ? `
                        <div class="relative inline-block text-left">
                            <button class="tools-btn bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-md" data-id="${event.id}">
                                Tools <span class="ml-1">&#9662;</span>
                            </button>
                            <div class="tools-dropdown absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none hidden" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
                                <div class="py-1" role="none">
                                    <a href="#" class="edit-btn text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" tabindex="-1" data-id="${event.id}">Edit</a>
                                    <a href="#" class="delete-btn text-red-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" tabindex="-1" data-id="${event.id}">Delete</a>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
            eventsListDiv.appendChild(eventCard);
        });

    } catch (error) {
        eventsListDiv.innerHTML = `<p class="message error bg-red-100 text-red-700 text-center col-span-full">Failed to load events: ${error.message}</p>`;
        console.error("Error fetching events:", error);
    }
}

async function createEvent(eventData) {
    eventData.user_id = currentUserId;

    try {
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });
        const data = await response.json();
        if (response.ok) {
            showMessage(createEventMessage, data.message, 'success');
            hideAllEventForms();
            fetchEvents();
        } else {
            showMessage(createEventMessage, data.message || 'Failed to create event', 'error');
        }
    } catch (error) {
        showMessage(createEventMessage, `Network error: ${error.message}`, 'error');
    }
}

async function showEditEventForm(eventId) {
    hideAllEventForms();
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
        const event = await response.json();

        if (response.ok) {
            editEventIdInput.value = event.id;
            editEventTitleInput.value = event.title;
            editEventDescriptionInput.value = event.description || '';
            editEventDateInput.value = event.date;
            editEventTimeInput.value = event.time ? event.time.substring(0, 5) : '';
            editEventLocationInput.value = event.location || '';
            editEventFormDiv.style.display = 'block';
        } else {
            showMessage(eventsListDiv, event.message || 'Could not fetch event for editing.', 'error');
        }
    } catch (error) {
        showMessage(eventsListDiv, `Error fetching event details: ${error.message}`, 'error');
    }
}

async function updateEvent(eventId, eventData) {
    eventData.user_id = currentUserId;

    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });
        const data = await response.json();
        if (response.ok) {
            showMessage(editEventMessage, data.message, 'success');
            hideAllEventForms();
            fetchEvents();
        } else {
            showMessage(editEventMessage, data.message || 'Failed to update event', 'error');
        }
    } catch (error) {
        showMessage(editEventMessage, `Network error: ${error.message}`, 'error');
    }
}

async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentUserId })
        });
        const data = await response.json();
        if (response.ok) {
            showMessage(eventsListDiv, data.message, 'success');
            fetchEvents();
        } else {
            showMessage(eventsListDiv, data.message || 'Failed to delete event', 'error');
        }
    } catch (error) {
        showMessage(eventsListDiv, `Network error: ${error.message}`, 'error');
    }
}

async function attendEvent(eventId) {
    if (!currentUserId) {
        showMessage(eventsListDiv, 'Please log in to register for an event.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/attend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentUserId })
        });
        const data = await response.json();
        if (response.ok) {
            showMessage(eventsListDiv, data.message, 'success');
            fetchEvents();
        } else {
            showMessage(eventsListDiv, data.message || 'Failed to register for event', 'error');
        }
    } catch (error) {
        showMessage(eventsListDiv, `Network error: ${error.message}`, 'error');
        console.error("Error attending event:", error);
    }
}

async function fetchAttendees(eventId, eventTitle) {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/attendees`);
        const attendees = await response.json();

        if (response.ok) {
            attendeesModalTitle.textContent = `Attendees for: ${eventTitle}`;
            attendeesListContent.innerHTML = '';

            if (attendees.length === 0) {
                attendeesListContent.innerHTML = '<p class="text-gray-600">No one has registered for this event yet.</p>';
            } else {
                const ul = document.createElement('ul');
                ul.className = 'list-disc list-inside text-gray-700 space-y-2';
                attendees.forEach(attendee => {
                    const li = document.createElement('li');
                    li.textContent = `${attendee.username} (${attendee.email})`;
                    ul.appendChild(li);
                });
                attendeesListContent.appendChild(ul);
            }
            attendeesModal.style.display = 'flex';
        } else {
            showMessage(eventsListDiv, attendees.message || 'Failed to fetch attendees', 'error');
            console.error("Error fetching attendees:", attendees);
        }
    } catch (error) {
        showMessage(eventsListDiv, `Network error: ${error.message}`, 'error');
        console.error("Error fetching attendees:", error);
    }
}

eventsListDiv.addEventListener('click', (e) => {
    const target = e.target;
    const eventId = target.dataset.id;

    if (target.classList.contains('edit-btn')) {
        showEditEventForm(eventId);
        const dropdown = target.closest('.tools-dropdown');
        if (dropdown) dropdown.classList.add('hidden');
    } else if (target.classList.contains('delete-btn')) {
        deleteEvent(eventId);
        const dropdown = target.closest('.tools-dropdown');
        if (dropdown) dropdown.classList.add('hidden');
    } else if (target.classList.contains('attend-btn')) {
        attendEvent(eventId);
    } else if (target.classList.contains('view-attendees-btn')) {
        const eventTitle = target.dataset.title;
        fetchAttendees(eventId, eventTitle);
    } else if (target.classList.contains('tools-btn') || target.closest('.tools-btn')) {
        const toolsButton = target.classList.contains('tools-btn') ? target : target.closest('.tools-btn');
        if (toolsButton) {
            document.querySelectorAll('.tools-dropdown').forEach(dropdown => {
                if (dropdown !== toolsButton.nextElementSibling) {
                    dropdown.classList.add('hidden');
                }
            });
            const dropdown = toolsButton.nextElementSibling;
            if (dropdown && dropdown.classList.contains('tools-dropdown')) {
                dropdown.classList.toggle('hidden');
            }
        }
    } else {
        document.querySelectorAll('.tools-dropdown').forEach(dropdown => {
            dropdown.classList.add('hidden');
        });
    }
});

document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('tools-btn') && !e.target.closest('.tools-dropdown')) {
        document.querySelectorAll('.tools-dropdown').forEach(dropdown => {
            dropdown.classList.add('hidden');
        });
    }
});

showRegisterBtn.addEventListener('click', () => {
    registerFormDiv.style.display = 'block';
    loginFormDiv.style.display = 'none';
    registerMessage.style.display = 'none';
    loginMessage.style.display = 'none';
});

showLoginBtn.addEventListener('click', () => {
    loginFormDiv.style.display = 'block';
    registerFormDiv.style.display = 'none';
    loginMessage.style.display = 'none';
    registerMessage.style.display = 'none';
});

logoutBtn.addEventListener('click', () => {
    currentUserId = null;
    currentUsername = null;
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    updateUIAfterAuth();
    showMessage(loginMessage, 'Logged out successfully.', 'success');
});

registerUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    registerUser(username, email, password);
});

loginUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('logUsername').value;
    const password = document.getElementById('logPassword').value;
    loginUser(username, password);
});

showCreateEventFormBtn.addEventListener('click', () => {
    hideAllEventForms();
    createEventFormDiv.style.display = 'block';
});

cancelCreateEventBtn.addEventListener('click', () => {
    hideAllEventForms();
});

cancelEditEventBtn.addEventListener('click', () => {
    hideAllEventForms();
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

updateEventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const eventId = editEventIdInput.value;
    let editEventTimeValue = editEventTimeInput.value;
    if (editEventTimeValue && editEventTimeValue.match(/^\d{2}:\d{2}$/)) {
        editEventTimeValue += ':00';
    }

    const updatedEventData = {
        title: editEventTitleInput.value,
        description: editEventDescriptionInput.value,
        date: editEventDateInput.value,
        time: editEventTimeValue,
        location: editEventLocationInput.value
    };
    updateEvent(eventId, updatedEventData);
});

applyFiltersBtn.addEventListener('click', fetchEvents);
clearFiltersBtn.addEventListener('click', clearFilters);

closeAttendeesModalBtn.addEventListener('click', () => {
    attendeesModal.style.display = 'none';
});

attendeesModal.addEventListener('click', (e) => {
    if (e.target === attendeesModal) {
        attendeesModal.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    currentUserId = localStorage.getItem('user_id');
    currentUsername = localStorage.getItem('username');
    updateUIAfterAuth();
});