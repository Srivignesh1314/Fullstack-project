# Attendance Tracker

A full-stack web application built with the MERN stack (MongoDB, Express, React, Node.js) designed to streamline and automate the process of tracking student attendance across different departments and sections.

## 🌟 Key Features

* **Role-Based Access Control:** Secure authentication and authorization for different user roles (Admin, Teacher, Student).
* **Admin Dashboard:**
  * Manage Subjects (CRUD operations) across multiple departments (CSE, ECE, Mech, etc.).
  * Enroll and manage Students with specific roll number formatting (e.g., `AP24110010xxx`).
  * Add and manage Teachers.
* **Teacher Portal:**
  * View assigned subjects and respective sections.
  * Easy-to-use interface to mark student attendance.
  * Real-time attendance state updates.
* **Student Tracking:**
  * Comprehensive tracking of individual student attendance records.
  * Section-wise attendance recording to prevent overlap.
* **Premium UI/UX:** Built with React, Vite, and styled cohesively using Tailwind CSS for a modern, responsive, and intuitive user experience.

## 🛠️ Tech Stack

### Frontend
* **Framework:** React 19 (via Vite)
* **Styling:** Tailwind CSS 4 & PostCSS
* **Routing:** React Router DOM v7
* **HTTP Client:** Axios
* **Icons:** React Icons

### Backend
* **Environment:** Node.js & Express.js
* **Database:** MongoDB & Mongoose
* **Authentication:** JWT (JSON Web Tokens) & bcryptjs for secure password hashing
* **Middleware:** CORS, dotenv

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) installed
* [MongoDB](https://www.mongodb.com/) running locally or have a MongoDB URI clustered.

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd "full stack project"
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with the following contents:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   ```
   *Run the server:*
   ```bash
   node index.js
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```
   *Run the Vite development server:*
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```
.
├── backend/                  # Express server, MongoDB models, Controllers
│   ├── build/              
│   ├── controllers/          # Request handling (auth, attendance, admin)
│   ├── models/               # Mongoose schemas (Student, User, Subject)
│   ├── routes/               # Express route definitions
│   ├── middleware/           # Auth and role-validation middlewares
│   ├── index.js              # Entry point for backend
│   └── package.json
└── frontend/                 # React application
    ├── public/
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── pages/            # AdminDashboard, Teacher Portal, Auth pages
    │   ├── services/         # Axios API calls
    │   ├── App.jsx           # Main React component & Routing
    │   └── index.css         # Tailwind directives
    ├── vite.config.js
    └── package.json
```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
