import React, { useState, useEffect } from 'react';
import QuestionMapping from './QuestionMapping';
import CourseList from './CourseList';
import StudentList from './StudentList';
import Navbar from './Navbar';
import StudentReport from './StudentReport';
import AssessmentsList from './assessments/AssessmentsList';
import AssessmentDetail from './assessments/AssessmentDetail';
import AssessmentReport from './assessments/AssessmentReport';

export default function TeacherDashboard({ user, onLogout }) {
    const [view, setView] = useState('questions');
    const [selectedAssessmentId, setA] = useState(null);
    const [initialStudentId,   setInitialStudentId]   = useState('');

     // on mount, inspect the URL to see if we need to jump straight to studentReport
  useEffect(() => {
    const { pathname, search } = window.location;
    if (pathname === '/student-report') {
      const params = new URLSearchParams(search);
      const sid = params.get('studentId')    || '';
      if (sid) {
        setInitialStudentId(sid);
        setView('studentReport');
      }
    }
  }, []);
    const handleSelectAsmt = (id) => {
        setA(id);
        setView('assessmentDetail');
    };

    const handleViewReport = (id) => {
        setA(id);
        setView('assessmentReport');
    };

    return (
        <>
            {/* ← new Navbar */}
            <Navbar
                user={user}
                currentView={view}
                onNavSelect={v => { setView(v); setA(null); }}
                onLogout={onLogout}
            />
            <div className="container py-4">

                {view === 'questions' && <QuestionMapping />}
                {view === 'courses' && <CourseList />}
                {view === 'students' && <StudentList />}

                {view === 'assessments' && (
                    <AssessmentsList
                        onSelectAssessment={handleSelectAsmt}
                        onViewReport={handleViewReport}
                    />
                )}

                {view === 'assessmentDetail' && selectedAssessmentId && (
                    <AssessmentDetail
                        assessmentId={selectedAssessmentId}
                        user={user}
                    />
                )}

                {view === 'assessmentReport' && selectedAssessmentId && (
                    <AssessmentReport
                        assessmentId={selectedAssessmentId}
                        user={user}
                    />
                )}

                {view === 'studentReport' && (
                    <StudentReport
                    initialStudentId={initialStudentId}
                        user={user}
                    // you can pass other props here if needed,
                    // like: assessments, onSelectAssessment, etc.
                    />
                )}

                {view === 'classReport' && !selectedAssessmentId && (
                    <p>Please select an assessment above to view the class summary.</p>
                )}
            </div>
        </>
    );
}
