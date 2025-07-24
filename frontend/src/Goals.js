import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Goals() {
    const navigate = useNavigate();
    const [goals, setGoals] = useState([]);
    const [formData, setFormData] = useState({
        goal_type: 'FITNESS',
        target_value: '',
        current_value: '0', // Initialize as string to match input
        start_date: '',
        end_date: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const userId = localStorage.getItem('user_id');

    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }
        fetchGoals();
    }, [userId, navigate]);

    const fetchGoals = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/goals/${userId}`);
            setGoals(response.data.goals);
        } catch (err) {
            console.error('Error fetching goals:', err);
            setError('Failed to load goals');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.post('http://127.0.0.1:5000/goals', {
                user_id: userId,
                ...formData,
                current_value: parseFloat(formData.current_value) || 0 // Ensure number format
            });
            setSuccess('Goal created successfully!');
            setFormData({
                goal_type: 'FITNESS',
                target_value: '',
                current_value: '0',
                start_date: '',
                end_date: ''
            });
            fetchGoals();
        } catch (err) {
            console.error('Error creating goal:', err);
            setError(err.response?.data?.error || 'Failed to create goal');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (goalId, newValue) => {
        try {
            await axios.put(`http://127.0.0.1:5000/goals/${goalId}`, {
                current_value: parseFloat(newValue) // Convert to number
            });
            fetchGoals();
        } catch (err) {
            console.error('Error updating goal:', err);
            setError('Failed to update goal progress');
        }
    };

    const handleDelete = async (goalId) => {
        if (!window.confirm('Are you sure you want to delete this goal?')) return;

        try {
            await axios.delete(`http://127.0.0.1:5000/goals/${goalId}`);
            setSuccess('Goal deleted successfully!');
            fetchGoals();
        } catch (err) {
            console.error('Error deleting goal:', err);
            setError('Failed to delete goal');
        }
    };

    const getProgressPercentage = (current, target) => {
        const currentNum = parseFloat(current);
        const targetNum = parseFloat(target);
        if (currentNum === 0 || targetNum === 0) return 0;
        return Math.min(Math.round((currentNum / targetNum) * 100), 100);
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-lg p-4">
                <h2 className="text-center mb-4">Your Health Goals</h2>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="row">
                    <div className="col-md-5">
                        <div className="card mb-4">
                            <div className="card-header bg-success text-white">
                                <h4>Set New Goal</h4>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Goal Type</label>
                                        <select
                                            className="form-control"
                                            name="goal_type"
                                            value={formData.goal_type}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="WEIGHT_LOSS">Weight Loss</option>
                                            <option value="FITNESS">Fitness</option>
                                            <option value="NUTRITION">Nutrition</option>
                                            <option value="SLEEP">Sleep</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Target Value</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="target_value"
                                            value={formData.target_value}
                                            onChange={handleInputChange}
                                            step="0.1"
                                            min="0.1"
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Current Value</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="current_value"
                                            value={formData.current_value}
                                            onChange={handleInputChange}
                                            step="0.1"
                                            min="0"
                                        />
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Start Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="start_date"
                                                value={formData.start_date}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">End Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="end_date"
                                                value={formData.end_date}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-success w-100"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Creating...' : 'Create Goal'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-7">
                        <div className="card">
                            <div className="card-header bg-primary text-white">
                                <h4>Current Goals</h4>
                            </div>
                            <div className="card-body">
                                {goals.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Type</th>
                                                    <th>Target</th>
                                                    <th>Current</th>
                                                    <th>Progress</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {goals.map(goal => (
                                                    <tr key={goal.goal_id}>
                                                        <td>{goal.goal_type.replace('_', ' ')}</td>
                                                        <td>{goal.target_value}</td>
                                                        <td>{goal.current_value}</td>
                                                        <td>{getProgressPercentage(goal.current_value, goal.target_value)}%</td>
                                                        <td>{goal.status}</td>
                                                        <td>
                                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(goal.goal_id)}>
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-center">No goals set yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Goals;
