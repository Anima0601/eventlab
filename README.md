EventHub: A Simple Event Management Platform
EventHub is a web application designed to allow users to register, log in, create, view, search, filter, edit, and delete events. It also includes basic functionality for users to mark their attendance at events and view attendees.

Features
User Authentication:

User Registration

User Login/Logout

Event Management (CRUD):

Create New Events

View All Events

Search Events by Keyword (Title/Description)

Filter Events by Location

Edit Existing Events (only by the creator)

Delete Events (only by the creator)

Event Attendance:

Register to attend an event.

View a list of attendees for any event.

Responsive UI: A clean and responsive user interface built with Tailwind CSS.

Technologies Used
Backend
Flask: A lightweight Python web framework.

Flask-SQLAlchemy: ORM (Object Relational Mapper) for interacting with the database.

Flask-CORS: For handling Cross-Origin Resource Sharing.

MySQL: Relational database for storing application data.

SQLAlchemy: Python SQL Toolkit and Object Relational Mapper.

Werkzeug: For password hashing (used by Flask's security features).

Frontend
HTML5: Structure of the web pages.

CSS3 (Tailwind CSS): Utility-first CSS framework for styling and responsiveness.

JavaScript (ES6+): Client-side logic for interacting with the backend API and dynamic UI updates.

AJAX (Fetch API): For asynchronous communication with the backend.

Setup Instructions
Follow these steps to get EventHub up and running on your local machine.

1. Clone the Repository (if applicable)
If this project is in a Git repository, clone it:

git clone <repository_url>
cd eventlab

Otherwise, ensure you have the eventlab directory with backend and frontend subdirectories.

2. Backend Setup
Navigate into the backend directory:

cd backend

a. Create a Virtual Environment (Recommended)
python -m venv venv

b. Activate the Virtual Environment
Windows:

.\venv\Scripts\activate

macOS/Linux:

source venv/bin/activate

c. Install Dependencies
pip install -r requirements.txt

(If you don't have requirements.txt, create one with pip freeze > requirements.txt after installing Flask, Flask-SQLAlchemy, Flask-CORS, mysql-connector-python, Werkzeug, SQLAlchemy).

d. Database Configuration (MySQL)
Install MySQL: Ensure you have MySQL installed and running on your system.

Create a Database: Open your MySQL client (e.g., MySQL Workbench, command line) and create a new database named eventdb.

CREATE DATABASE eventdb;

Update Database URI: Open backend/__init__.py and ensure the SQLALCHEMY_DATABASE_URI matches your MySQL setup. If you're using root with no password, it's already configured:

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:@localhost/eventdb'

If you have a password, update it: mysql+mysqlconnector://user:password@localhost/eventdb

e. Run Database Migrations (Create Tables)
With your virtual environment active and database configured, run your Flask app once to create the tables:

flask run --debug --port 5000

You should see output indicating the server is running. You can then press CTRL+C to stop it. This step initializes the database schema defined in backend/models.

3. Frontend Setup
Navigate into the frontend directory:

cd frontend

a. No Installation Required
The frontend uses plain HTML, CSS (Tailwind CDN), and JavaScript, so no npm install or similar is needed.

b. Run a Local HTTP Server (Recommended)
To serve your frontend files correctly and avoid CORS issues with file:// URLs, it's best to use a simple local server.
From the frontend directory:

python -m http.server 8000

This will usually serve your frontend at http://localhost:8000/.

Usage
Start Backend: In a terminal, navigate to eventlab/backend and run flask run --debug --port 5000.

Start Frontend: In a separate terminal, navigate to eventlab/frontend and run python -m http.server 8000.

Access the App: Open your web browser and go to http://localhost:8000/.

Interacting with the App:

Register: Create a new user account.

Login: Log in with your registered credentials.

Create Events: Once logged in, use the "Create New Event" button to add events.

View Events: All events will be listed on the main page.

Search/Filter: Use the "Keyword" and "Location" fields to find specific events. Click "Apply Filters" or "Clear Filters."

Edit/Delete: For events you created, a "Tools" button will appear. Click it to reveal "Edit" and "Delete" options.

Attend Events: Click the "Attend" button on any event to mark your attendance.

View Attendees: Click "View Attendees" to see who has registered for an event.

Future Enhancements
This project provides a strong foundation. Here are some areas for future development:

Improved Authentication (JWTs): Implement JSON Web Tokens for more secure and stateless API authentication.

User-Specific Event Views: Add a dedicated section for "My Events" (events created by the logged-in user) and "Events I'm Attending."

Notifications/Reminders: Set up in-app notifications or email reminders for upcoming events.

Event Categories/Tags: Allow events to be categorized for better organization and filtering.

User Profiles: Basic user profiles where users can manage their information and view their created/attended events.

Pagination: Implement pagination for event listings to handle a large number of events efficiently.

Frontend Framework: Consider migrating the frontend to a framework like React, Vue, or Angular for more complex state management and component-based development.

Deployment: Deploy the backend to a cloud platform (e.g., Heroku, Render, AWS, Google Cloud) and the frontend to a static hosting service (e.g., Netlify, Vercel, GitHub Pages).

License