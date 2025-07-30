```markdown
# 🎉 EventHub: A Simple Event Management Platform

EventHub is a full-stack web application that enables users to register, log in, and manage events. It supports event creation, editing, deletion, filtering, and attendance tracking — all through a clean, responsive UI.

---

## ✨ Features

### 🔐 User Authentication
- User Registration
- User Login/Logout

### 📅 Event Management (CRUD)
- Create new events
- View all events
- Search by **Title** or **Description**
- Filter by **Location**
- Edit & Delete (only by event creator)

### 🙋‍♂️ Event Attendance
- Register attendance for events
- View the list of attendees

### 💻 Responsive UI
- Built using **Tailwind CSS**
- Fully responsive for desktop and mobile

---

## 🛠️ Technologies Used

### 🔙 Backend
- **Flask** – Python web framework
- **Flask-SQLAlchemy** – ORM for DB operations
- **MySQL** – Relational database
- **Flask-CORS** – CORS handling for cross-origin requests
- **Werkzeug** – Secure password hashing
- **SQLAlchemy** – SQL Toolkit & ORM
- **mysql-connector-python** – MySQL driver

### 🔜 Frontend
- **HTML5** – Markup structure
- **CSS3 (Tailwind CSS)** – Styling and responsiveness
- **JavaScript (ES6+)** – Dynamic frontend logic
- **Fetch API (AJAX)** – Asynchronous backend communication

---

## 🧩 Project Structure

```

eventlab/
├── backend/
│   ├── **init**.py
│   ├── models.py
│   ├── routes.py
│   └── ...
├── frontend/
│   ├── index.html
│   ├── scripts/
│   ├── styles/
│   └── ...

````

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone <repository_url>
cd eventlab
````

### 2️⃣ Backend Setup

```bash
cd backend
```

#### a. Create and Activate a Virtual Environment

```bash
# Create venv
python -m venv venv

# Activate venv
# Windows
.\venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

#### b. Install Dependencies

```bash
pip install -r requirements.txt
```

> 💡 If `requirements.txt` is missing, generate it after installing the necessary packages:

```bash
pip install Flask Flask-SQLAlchemy Flask-CORS mysql-connector-python Werkzeug
pip freeze > requirements.txt
```

#### c. MySQL Database Setup

1. Ensure MySQL is installed and running.
2. Create a new database named `eventdb`:

```sql
CREATE DATABASE eventdb;
```

3. Update your database URI in `backend/__init__.py`:

```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:@localhost/eventdb'
```

> Replace `root:@` with your own username and password if needed.

#### d. Initialize the Database

```bash
flask run --debug --port 5000
```

* On first run, this will create the tables as per `models.py`.
* You can stop the server afterward with `CTRL + C`.

---

### 3️⃣ Frontend Setup

```bash
cd ../frontend
```

#### a. No Install Needed

The frontend is built using plain HTML, Tailwind (via CDN), and vanilla JS.

#### b. Start a Local HTTP Server

```bash
python -m http.server 8000
```

Open your browser and navigate to [http://localhost:8000](http://localhost:8000)

---

## 🚀 Usage Guide

### ✅ Start the Application

* **Backend**: `cd eventlab/backend && flask run --debug --port 5000`
* **Frontend**: `cd eventlab/frontend && python -m http.server 8000`

### 🧪 Test the Features

1. **Register** a new user.
2. **Login** to access event features.
3. **Create Events** using the "Create New Event" form.
4. **View** all events on the homepage.
5. **Search** events by keyword (title/description).
6. **Filter** events by location.
7. **Edit/Delete** events you created via the "Tools" menu.
8. **Attend Events** by clicking "Attend."
9. **View Attendees** via "View Attendees."

---

## 🚧 Future Enhancements

* 🔐 JWT-based secure authentication
* 📬 Email or in-app reminders
* 🏷️ Categories and Tags for events
* 🧑‍💼 User profiles and editable settings
* 📃 Pagination for event listings

---


