import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import './App.css';  // For custom styles

function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`http://localhost:5000/generate_recommendations/${userId}`);
        const data = await response.json();

        if (response.ok) {
          setRecommendations(data.recommendations);
        } else {
          setRecommendations(["Failed to load recommendations."]);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setError("Error fetching recommendations.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchRecommendations();
    }
  }, [userId]);

  return (
    <div className="container">
      <h2>Health Recommendations</h2>
      {loading ? (
        <div className="loading-spinner">
          <CircularProgress />
        </div>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : recommendations.length > 0 ? (
        <div className="recommendation-list">
          {recommendations.map((rec, index) => (
            <Card key={index} className="recommendation-card">
              <CardContent>
                <Typography variant="h6">{rec}</Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>No recommendations available yet.</p>
      )}
    </div>
  );
}

export default Recommendations;
