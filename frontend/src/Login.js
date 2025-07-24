import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './App.css'; // Make sure to import the styles

function Login({ setIsAuthenticated }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://127.0.0.1:5000/login", { username, password });
            if (response.data.message === "Login Successful") {
                // Store user data in localStorage
                localStorage.setItem("username", response.data.username);
                localStorage.setItem("user_id", response.data.user_id); // Save user_id for session

                // Update the authentication state
                setIsAuthenticated(true);

                // Redirect to the dashboard
                navigate("/dashboard");
            } else {
                setMessage(response.data.error);
            }
        } catch (error) {
            setMessage(error.response?.data?.error || "Login failed");
        }
    };

    return (
        <div className="form-container">
            <div className="card">
                <h2 className="text-center mb-4">Login to HealthPro</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Login</button>
                </form>
                <p className="text-center mt-3">{message}</p>
                <div className="login-link">
                    <p>Don't have an account? <a href="/register">Register here</a></p>
                </div>
            </div>
        </div>
    );
}

export default Login;
