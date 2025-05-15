// src/components/StudentDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentDashboard({ onLogout }) {
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    axios
      .get('/api/results/final')
      .then((res) => setSummary(res.data.summary))
      .catch(console.error);
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h2>Your Bloom Summary</h2>
        <button className="btn btn-danger" onClick={onLogout}>
          Logout
        </button>
      </div>
      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>Level</th>
            <th>Correct</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((r) => (
            <tr key={r.level}>
              <td>{r.level}</td>
              <td>{r.correct}</td>
              <td>{r.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
