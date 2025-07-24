import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();
    const [healthData, setHealthData] = useState([]);
    const [formData, setFormData] = useState({
        heartRate: "",
        steps: "",
        caloriesBurned: "",
        sleepHours: "",
        mealType: "Breakfast",
        caloriesConsumed: "",
        date: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const userId = localStorage.getItem("user_id");

    useEffect(() => {
        const fetchHealthData = async () => {
            try {
                const response = await axios.get(
                    `http://127.0.0.1:5000/get_health_data?user_id=${userId}`
                );
                setHealthData(response.data.health_data);
            } catch (error) {
                console.error("Error fetching health data:", error);
            }
        };
        
        if (userId) {
            fetchHealthData();
        }
    }, [userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddHealthData = async (e) => {
        e.preventDefault();
        
        if (!userId) {
            alert("Session expired. Please log in again.");
            navigate("/login");
            return;
        }

        setIsSubmitting(true);
        setSuccessMessage("");
        
        try {
            const response = await axios.post("http://127.0.0.1:5000/health_data", {
                user_id: userId,
                heart_rate: formData.heartRate,
                steps: formData.steps,
                calories_burned: formData.caloriesBurned,
                sleep_hours: formData.sleepHours,
                meal_type: formData.mealType,
                calories_consumed: formData.caloriesConsumed,
                date: formData.date
            });

            setSuccessMessage("Health data added successfully!");
            
            // Refresh health data
            const refreshResponse = await axios.get(
                `http://127.0.0.1:5000/get_health_data?user_id=${userId}`
            );
            setHealthData(refreshResponse.data.health_data);
            
            // Reset form
            setFormData({
                heartRate: "",
                steps: "",
                caloriesBurned: "",
                sleepHours: "",
                mealType: "Breakfast",
                caloriesConsumed: "",
                date: ""
            });
            
        } catch (error) {
            console.error("Submission error:", error.response?.data || error.message);
            alert(error.response?.data?.error || "Failed to add health data");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container">
            <h2>Welcome, {localStorage.getItem("username")}!</h2>
            <p className="text-muted">Take charge of your health and wellness!</p>

            <div className="card shadow-lg p-4 mt-3">
                <h3>Your Health Data</h3>
                <div className="health-data">
                    {healthData.length > 0 ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Heart Rate</th>
                                    <th>Steps</th>
                                    <th>Calories Burned</th>
                                    <th>Calories Consumed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {healthData.map((data) => (
                                    <tr key={data.health_id}>
                                        <td>{data.date}</td>
                                        <td>{data.heart_rate}</td>
                                        <td>{data.steps}</td>
                                        <td>{data.calories_burned}</td>
                                        <td>{data.calories_consumed}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No health data available</p>
                    )}
                </div>

                <h3 className="mt-4">Add Health Data</h3>
                {successMessage && (
                    <div className="alert alert-success">{successMessage}</div>
                )}
                <form onSubmit={handleAddHealthData}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Heart Rate"
                                name="heartRate"
                                value={formData.heartRate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Steps"
                                name="steps"
                                value={formData.steps}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Calories Burned"
                                name="caloriesBurned"
                                value={formData.caloriesBurned}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Sleep Hours"
                                name="sleepHours"
                                value={formData.sleepHours}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <select
                                className="form-control"
                                name="mealType"
                                value={formData.mealType}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Dinner">Dinner</option>
                                <option value="Snack">Snack</option>
                            </select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Calories Consumed"
                                name="caloriesConsumed"
                                value={formData.caloriesConsumed}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-3">
                        <input
                            type="date"
                            className="form-control"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Dashboard;