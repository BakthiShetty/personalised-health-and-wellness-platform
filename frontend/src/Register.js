import React, { useState } from "react";
import axios from "axios";
import './App.css'; // Make sure to import the styles

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [message, setMessage] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://127.0.0.1:5000/register", { 
                username, 
                email, 
                password,
                age,
                gender,
                height,
                weight
            });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.error || "Registration failed");
        }
    };

    return (
        <div className="form-container">
            <div className="card">
                <h2 className="text-center mb-4">Register on HealthPro</h2>
                <form onSubmit={handleRegister}>
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
                            type="email"
                            className="form-control"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                    <div className="mb-3">
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Age"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <select
                            className="form-control"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Height (cm)"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Weight (kg)"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-success w-100">Register</button>
                </form>
                <p className="text-center mt-3">{message}</p>
                <div className="register-link">
                    <p>Already have an account? <a href="/login">Login here</a></p>
                </div>
            </div>
        </div>
    );
}

export default Register;
