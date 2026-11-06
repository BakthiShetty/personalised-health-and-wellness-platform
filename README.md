# Personalized Health and Wellness Platform – HealthPro

HealthPro is a web-based health and wellness management application designed to help users monitor their health information, manage personal wellness goals, and track their progress through reports and visualizations.

The application provides a centralized dashboard where users can maintain health records, set goals, receive recommendations, and view health trends.

## Features

- **User Registration and Login:** Create an account and access a personalized dashboard.
- **Health Dashboard:** View and manage health-related information.
- **Health Tracking:** Record heart rate, steps, calories burned, sleep hours, mood, and meal information.
- **Goal Management:** Create, update, view, and delete personal wellness goals.
- **Personalized Recommendations:** Generate recommendations based on recorded health information and goals.
- **Health Reports:** View health trends and progress through graphical reports.
- **Real-Time Notifications:** Receive notifications using Flask-SocketIO and Socket.IO.
- **User Profile:** Maintain basic profile information such as age, gender, height, and weight.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Backend | Python, Flask |
| Database | MySQL |
| API Communication | REST APIs |
| Real-Time Communication | Flask-SocketIO, Socket.IO |
| Charts and Visualization | Chart.js |
| UI Components | Bootstrap, Material UI |
| HTTP Requests | Axios |
| Authentication Support | Flask-JWT-Extended |

## Application Architecture

The application follows a client-server architecture.

```text
             React Frontend
                   |
                   |
              Axios Requests
                   |
                   v
             Flask Backend
                   |
          REST API Endpoints
                   |
                   v
              MySQL Database
                   |
          User and Health Data
```

Real-time notifications are handled separately through Socket.IO communication between the frontend and backend.

## Application Modules

### 1. User Authentication

- User registration with profile information.
- Login using username and password.
- Duplicate username validation.
- User-specific dashboard access.

### 2. Health Tracking

Users can maintain health information, including:

- Heart rate
- Daily steps
- Calories burned
- Sleep duration
- Mood level
- Meal type
- Calories consumed

### 3. Goal Management

Users can create and manage wellness goals.

Supported goal categories include:

- Weight Loss
- Fitness
- Nutrition
- Sleep
- Other

Each goal includes information such as its target value, current value, start date, end date, and status.

### 4. Health Recommendations

The application generates recommendations based on available user health information and wellness goals.

Recommendations are organized into categories such as fitness, nutrition, sleep, and weight management.

### 5. Health Reports and Visualization

The reports module provides a graphical overview of user health information.

Chart.js is used to visualize:

- Heart rate
- Steps
- Calories burned
- Sleep hours

Reports also display user profile information, BMI, and goal progress.

### 6. Real-Time Notifications

Flask-SocketIO and Socket.IO enable real-time communication between the backend and frontend.

Users can view notifications and track unread notifications through the application.

## Project Structure

```text
Personalized-Health-and-Wellness-Platform/
│
├── backend/
│   └── app.py
│
└── frontend/
    ├── public/
    │
    ├── src/
    │   ├── App.js
    │   ├── App.css
    │   ├── Dashboard.js
    │   ├── Goals.js
    │   ├── Home.js
    │   ├── Login.js
    │   ├── Register.js
    │   ├── Recommendations.js
    │   ├── Reports.js
    │   ├── Notifications.js
    │   ├── Navbar.js
    │   └── Sidebar.js
    │
    ├── package.json
    └── package-lock.json
```

## Getting Started

### Prerequisites

Install the following:

- Python 3.x
- Node.js and npm
- MySQL Server
- Visual Studio Code or another code editor

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd personalised-health-and-wellness-platform-main
```

### 2. Configure the MySQL Database

Start your MySQL server and create the database:

```sql
CREATE DATABASE loginsystem;
```

Create the required tables and columns used by the backend before starting the application.

Configure the database connection using environment variables rather than hardcoding credentials in `app.py`.

### 3. Start the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv venv
```

On Windows:

```bash
venv\Scripts\activate
```

Install the required Python packages:

```bash
pip install Flask Flask-Cors Flask-JWT-Extended Flask-MySQLdb Flask-SocketIO
```

Start the Flask application:

```bash
python app.py
```

The backend runs at:

```text
http://localhost:5000
```

### 4. Start the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm start
```

Open the application in your browser:

```text
http://localhost:3000
```

## API Endpoints

The backend exposes REST API endpoints for the application's main operations.

| HTTP Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new user |
| POST | `/login` | Authenticate a user |
| GET | `/health/<username>` | Retrieve health information by username |
| POST | `/health_data` | Add health information |
| GET | `/get_health_data` | Retrieve health information |
| POST | `/goals` | Create a wellness goal |
| GET | `/goals/<user_id>` | Retrieve user goals |
| PUT | `/goals/<goal_id>` | Update a goal |
| DELETE | `/goals/<goal_id>` | Delete a goal |
| GET | `/generate_recommendations/<user_id>` | Generate recommendations |
| GET | `/get_report` | Retrieve health reports |
| GET | `/notifications/<user_id>` | Retrieve notifications |
| PUT | `/notifications/mark_read/<notification_id>` | Mark a notification as read |

## Key Concepts Demonstrated

- Full-stack web application development
- React component-based development
- REST API development using Flask
- MySQL database integration
- CRUD operations
- User authentication
- Frontend and backend integration
- Real-time communication using WebSockets
- Data visualization using Chart.js
- Health data management

## Future Enhancements

- Enhanced authentication and authorization.
- Improved password security.
- More detailed health analytics.
- Additional report filters.
- Improved input validation and error handling.
- Responsive UI enhancements.

---

**Project Name:** HealthPro – Personalized Health and Wellness Platform

**Frontend:** React.js

**Backend:** Python Flask

**Database:** MySQL
