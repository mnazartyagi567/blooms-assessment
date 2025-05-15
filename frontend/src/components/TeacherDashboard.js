// src/components/TeacherDashboard.jsx
import React, { useState } from 'react';
import QuestionMapping       from './QuestionMapping';
import CourseList            from './CourseList';
import StudentList           from './StudentList';
import AssessmentsList       from './assessments/AssessmentsList';
import AssessmentDetail      from './assessments/AssessmentDetail';
import AssessmentReport      from './assessments/AssessmentReport';

export default function TeacherDashboard({ user, onLogout }) {
  const [view, setView]               = useState('questions');
  const [selectedAssessmentId, setA]  = useState(null);

  const handleSelectAsmt = id => {
    setA(id);
    setView('assessmentDetail');
  };

  const handleViewReport = id => {
    setA(id);
    setView('assessmentReport');
  };

  return (
    <div className="container py-4">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h2>Teacher Dashboard</h2>
        <button className="btn btn-danger" onClick={onLogout}>Logout</button>
      </header>

      <nav className="nav nav-tabs mb-4">
        {['questions','courses','students','assessments','classReport'].map(v => (
          <button
            key={v}
            className={`nav-link ${view===v?'active':''}`}
            onClick={() => setView(v)}
          >
            {v === 'questions'     && 'Questions'}
            {v === 'courses'       && 'Courses'}
            {v === 'students'      && 'Students'}
            {v === 'assessments'   && 'Assessments'}
            {v === 'classReport'   && 'Class Summary'}
          </button>
        ))}
      </nav>

      {view === 'questions'    && <QuestionMapping /> }
      {view === 'courses'      && <CourseList />      }
      {view === 'students'     && <StudentList />     }

      {view === 'assessments'  &&
        <AssessmentsList
          onSelectAssessment={handleSelectAsmt}
          onViewReport={handleViewReport}
        />
      }

      {view === 'assessmentDetail' && selectedAssessmentId &&
        <AssessmentDetail assessmentId={selectedAssessmentId} />
      }

      {view === 'assessmentReport' && selectedAssessmentId &&
        <AssessmentReport assessmentId={selectedAssessmentId} />
      }

      {view === 'classReport' && selectedAssessmentId == null &&
        <p>Please select an assessment above to view the class summary.</p>
      }
    </div>
  );
}
