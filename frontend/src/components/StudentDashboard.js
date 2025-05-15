// src/components/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import AssessmentsList  from './assessments/AssessmentsList';
import StudentReport    from './StudentReport';
import axios            from 'axios';

export default function StudentDashboard({ user, onLogout }) {
  const [assessments, setAssessments]     = useState([]);
  const [selectedAssessmentId, setSel]    = useState(null);

  useEffect(() => {
    axios.get('/api/assessments')
         .then(r => setAssessments(r.data.assessments));
  }, []);

  return (
    <div className="container py-4">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h2>Student Dashboard</h2>
        <button className="btn btn-danger" onClick={onLogout}>Logout</button>
      </header>

      {!selectedAssessmentId ? (
        <>
          <h4>Available Assessments</h4>
          <ul className="list-group">
            {assessments.map(a => (
              <li key={a.id} className="list-group-item d-flex justify-content-between">
                <span>
                  <strong>{a.name}</strong> {a.date && `(${a.date})`}
                </span>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setSel(a.id)}
                >
                  View My Report
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <StudentReport
          studentId={user.id}
          assessmentId={selectedAssessmentId}
        />
      )}
    </div>
  );
}
