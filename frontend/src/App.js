import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Goals from "./Goals";
import Recommendations from "./Recommendations";
import Reports from "./Reports";
import Notifications from "./Notifications";
import "./App.css";
// In your router configuration (App.js)

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("user_id")
  );

  useEffect(() => {
    // Check authentication status when component mounts
    const userId = localStorage.getItem("user_id");
    if (userId) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated} />}
      <div className={isAuthenticated ? "content-with-navbar" : "content"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login setIsAuthenticated={setIsAuthenticated} />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/goals" 
            element={isAuthenticated ? <Goals /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/recommendations" 
            element={isAuthenticated ? <Recommendations /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/reports" 
            element={isAuthenticated ? <Reports /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/notifications" 
            element={isAuthenticated ? <Notifications /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;