import React from "react";
import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="welcome-section">
            <div>
                <h1>Welcome to HealthPro</h1>
                <p>Your personalized health and wellness platform. Join us today and take control of your well-being!</p>
                <div className="btn-container">
                    <Link to="/login" className="btn btn-primary">Login</Link>
                    <Link to="/register" className="btn btn-success">Register</Link>
                </div>
            </div>
        </div>
    );
}

export default Home;