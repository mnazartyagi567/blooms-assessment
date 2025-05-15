// src/components/TeacherDashboard.js
import React, { useState } from 'react';
import QuestionMapping from './QuestionMapping';
import CourseList from './CourseList';
import StudentList from './StudentList';
import AssessmentsList from './assessments/AssessmentsList';
import AssessmentDetail from './assessments/AssessmentDetail';
// import TeacherReport from './TeacherReport';

export default function TeacherDashboard({ onLogout }) {
  const [view, setView] = useState('questions');
  const [selAssessment, setSelAssessment] = useState(null);

  // when instructor clicks "Details" on AssessmentsList:
  const handleSelectAssessment = (id) => {
    setSelAssessment(id);
    setView('assessmentDetail');
  };

  // when instructor clicks "Class Summary" on AssessmentsList:
  const handleViewReport = (id) => {
    setSelAssessment(id);
    setView('classReport');
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand">Teacher Panel</span>
          <button className="btn btn-danger ms-auto" onClick={onLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="container my-4">
        {/* Navigation Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${view === 'questions' ? 'active' : ''}`}
              onClick={() => setView('questions')}
            >
              Questions
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${view === 'courses' ? 'active' : ''}`}
              onClick={() => setView('courses')}
            >
              Courses
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${view === 'students' ? 'active' : ''}`}
              onClick={() => setView('students')}
            >
              Students
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${view === 'assessments' ? 'active' : ''}`}
              onClick={() => setView('assessments')}
            >
              Assessments
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                view === 'classReport' ? 'active' : ''
              }`}
              onClick={() => {
                setSelAssessment(null);
                setView('classReport');
              }}
            >
              Class Summary
            </button>
          </li>
        </ul>

        {/* Views */}
        {view === 'questions' && <QuestionMapping />}

        {view === 'courses' && <CourseList />}

        {view === 'students' && <StudentList />}

        {view === 'assessments' && (
          <AssessmentsList
            onSelectAssessment={handleSelectAssessment}
            onViewReport={handleViewReport}
          />
        )}

        {view === 'assessmentDetail' && selAssessment && (
          <AssessmentDetail assessmentId={selAssessment} />
        )}

        {/* {view === 'classReport' && (
          // if selAssessment is set, show that assessment's report
          selAssessment ? (
            <TeacherReport assessmentId={selAssessment} />
          ) : (
            <p className="text-muted">
              Select an assessment’s “View Report” button in the Assessments tab
            </p>
          )
        )} */}
      </div>
    </div>
  );
}
