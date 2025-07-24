import React, { useEffect, useState, useRef } from "react";
import { Chart } from "chart.js/auto";
import axios from "axios";

const Report = () => {
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  let chartInstance = useRef(null);

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!userId) {
      setError("User ID is missing. Please log in.");
      return;
    }

    axios
      .get(`http://127.0.0.1:5000/get_report?user_id=${userId}`)
      .then((response) => {
        if (response.data.error) {
          setError(response.data.error);
          return;
        }
        setReportData(response.data);
      })
      .catch((err) => {
        console.error("Error fetching report:", err);
        setError("Failed to load report data");
      });
  }, [userId]);

  useEffect(() => {
    if (!reportData || !chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy(); // Destroy previous chart instance
    }

    const ctx = chartRef.current.getContext("2d");

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: reportData.health_data.labels,
        datasets: [
          {
            label: "Heart Rate",
            data: reportData.health_data.heart_rate,
            borderColor: "#ff4757",
            backgroundColor: "rgba(255, 71, 87, 0.2)",
            fill: true,
          },
          {
            label: "Steps",
            data: reportData.health_data.steps,
            borderColor: "#1e90ff",
            backgroundColor: "rgba(30, 144, 255, 0.2)",
            fill: true,
          },
          {
            label: "Calories Burned",
            data: reportData.health_data.calories_burned,
            borderColor: "#ffa502",
            backgroundColor: "rgba(255, 165, 2, 0.2)",
            fill: true,
          },
          {
            label: "Sleep Hours",
            data: reportData.health_data.sleep_hours,
            borderColor: "#2ed573",
            backgroundColor: "rgba(46, 213, 115, 0.2)",
            fill: true,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      }
    });
  }, [reportData]);

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>User Health Report</h2>

      {error ? (
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      ) : reportData ? (
        <>
          {/* User Info Section */}
          <div style={{
            background: "#f9f9f9",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
            marginBottom: "20px"
          }}>
            <h3 style={{ marginBottom: "10px", color: "#333" }}>User Details</h3>
            <p><strong>Username:</strong> {reportData.user_info.username}</p>
            <p><strong>Age:</strong> {reportData.user_info.age}</p>
            <p><strong>Gender:</strong> {reportData.user_info.gender}</p>
            <p><strong>Height:</strong> {reportData.user_info.height} cm</p>
            <p><strong>Weight:</strong> {reportData.user_info.weight} kg</p>
            <p><strong>BMI:</strong> {reportData.user_info.bmi}</p>
          </div>

          {/* Goals Section */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ color: "#333" }}>User Goals</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {reportData.goals.length > 0 ? (
                reportData.goals.map((goal, index) => (
                  <div key={index} style={{
                    background: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                    padding: "15px",
                    flex: "1 1 calc(50% - 10px)", // Two cards per row
                    minWidth: "250px",
                    textAlign: "center"
                  }}>
                    <h4 style={{ color: "#444", marginBottom: "5px" }}>{goal.goal_type}</h4>
                    <p><strong>Target:</strong> {goal.target_value}</p>
                    <p><strong>Current:</strong> {goal.current_value}</p>
                    <p><strong>Status:</strong> 
                      <span style={{
                        color: goal.status === "COMPLETED" ? "green" : goal.status === "FAILED" ? "red" : "blue",
                        fontWeight: "bold"
                      }}> {goal.status}</span>
                    </p>
                    <p><strong>Start:</strong> {goal.start_date}</p>
                    <p><strong>End:</strong> {goal.end_date}</p>
                  </div>
                ))
              ) : (
                <p>No goals found.</p>
              )}
            </div>
          </div>

          {/* Health Chart */}
          <div style={{
            background: "#fff",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
            height: "400px"
          }}>
            <h3 style={{ marginBottom: "10px", color: "#333" }}>Health Data Chart</h3>
            <canvas ref={chartRef}></canvas>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Report;
