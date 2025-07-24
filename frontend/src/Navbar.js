import React, { useState, useEffect } from "react";  // Added useEffect here
import { Link } from "react-router-dom";
import { io } from 'socket.io-client';

function Navbar({ setIsAuthenticated }) {  // Fixed typo in setIsAuthenticated
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const userId = localStorage.getItem("user_id");

    useEffect(() => {
        if (!userId) return;

        const socket = io('http://localhost:5000', {
            query: { user_id: userId }
        });

        socket.on('new_notification', () => {
            setUnreadCount(prev => prev + 1);
        });

        return () => socket.disconnect();
    }, [userId]);

    const handleLogout = () => {
        localStorage.removeItem("username");
        localStorage.removeItem("user_id");
        setIsAuthenticated(false);  // Make sure this matches the prop name
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)}>
                    ☰
                </button>
                <Link to="/dashboard" className="navbar-brand">
                    HealthPro
                </Link>
                <div className="navbar-right">
                    <Link to="/notifications" className="notification-bell">
                        🔔
                        {unreadCount > 0 && (
                            <span className="badge">{unreadCount}</span>
                        )}
                    </Link>
                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            <div className={`sidebar ${isOpen ? "open" : ""}`}>
                <ul className="sidebar-menu">
                    <li>
                        <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                            <i className="fas fa-heartbeat"></i> Health Data
                        </Link>
                    </li>
                    <li>
                        <Link to="/goals" onClick={() => setIsOpen(false)}>
                            <i className="fas fa-bullseye"></i> Goals
                        </Link>
                    </li>
                    <li>
                        <Link to="/recommendations" onClick={() => setIsOpen(false)}>
                            <i className="fas fa-lightbulb"></i> Recommendations
                        </Link>
                    </li>
                    <li>
                        <Link to="/reports" onClick={() => setIsOpen(false)}>
                            <i className="fas fa-chart-bar"></i> Reports
                        </Link>
                    </li>
                    <li>
                        <Link to="/notifications" onClick={() => setIsOpen(false)}>
                            <i className="fas fa-bell"></i> Notifications
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;