// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import QuestionMapping from './QuestionMapping';
import AssessmentsList from './assessments/AssessmentsList';
import AssessmentDetail from './assessments/AssessmentDetail';
import AssessmentReport from './assessments/AssessmentReport';
import StudentList from './StudentList';
import CourseList from './CourseList';
import StudentBloomReport from './StudentBloomReport';

function Dashboard({ user, onLogout }) {
  const [view, setView] = useState('questions');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);

  // Example: For "Student Bloom Report"
  const sampleStudentId = 1;
  const sampleAssessmentId = 1;

  // On mount, load the last viewed page from localStorage
  useEffect(() => {
    const storedView = localStorage.getItem('currentView');
    if (storedView) {
      setView(storedView);
    }
  }, []);

  // Whenever view changes, store it
  useEffect(() => {
    localStorage.setItem('currentView', view);
  }, [view]);

  const handleSelectAssessment = (id) => {
    setSelectedAssessmentId(id);
    setView('assessmentDetail');
  };

  const handleViewReport = (id) => {
    setSelectedAssessmentId(id);
    setView('assessmentReport');
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <span className="navbar-brand">Blooms Taxonomy</span>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link"
                  onClick={() => setView('questions')}
                >
                  Questions
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link"
                  onClick={() => setView('assessments')}
                >
                  Assessments
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link"
                  onClick={() => setView('students')}
                >
                  Students
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link"
                  onClick={() => setView('courses')}
                >
                  Courses
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link"
                  onClick={() => setView('studentReport')}
                >
                  Student Bloom Report
                </button>
              </li>

              {/* Logout Button */}
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link text-warning"
                  onClick={onLogout}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container my-4">
        {view === 'questions' && <QuestionMapping />}
        {view === 'assessments' && (
          <AssessmentsList
            onSelectAssessment={handleSelectAssessment}
            onViewReport={handleViewReport}
          />
        )}
        {view === 'students' && <StudentList />}
        {view === 'courses' && <CourseList />}

        {view === 'assessmentDetail' && selectedAssessmentId && (
          <AssessmentDetail assessmentId={selectedAssessmentId} />
        )}
        {view === 'assessmentReport' && selectedAssessmentId && (
          <AssessmentReport assessmentId={selectedAssessmentId} />
        )}

        {view === 'studentReport' && (
          <StudentBloomReport
            studentId={sampleStudentId}
            assessmentId={sampleAssessmentId}
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
