// src/components/Navbar.jsx
import React from 'react';

export default function Navbar({ user, currentView, onNavSelect, onLogout }) {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
            <div className="container">
                {/* Brand */}
                <span className="navbar-brand">Blooms Taxonomy</span>

                {/* Left–side links */}
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <button
                                className={`nav-link btn btn-link${currentView === 'questions' ? ' active' : ''}`}
                                onClick={() => onNavSelect('questions')}
                            >
                                Questions
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link btn btn-link${currentView === 'assessments' ? ' active' : ''}`}
                                onClick={() => onNavSelect('assessments')}
                            >
                                Assessments
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link btn btn-link${currentView === 'students' ? ' active' : ''}`}
                                onClick={() => onNavSelect('students')}
                            >
                                Students
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link btn btn-link${currentView === 'courses' ? ' active' : ''}`}
                                onClick={() => onNavSelect('courses')}
                            >
                                Courses
                            </button>
                        </li>
                        {user.role === 'teacher' && (
                            <li className="nav-item">
                                <button
                                    className={`nav-link btn btn-link ${currentView === 'studentReport' ? 'active' : ''}`}
                                    onClick={() => onNavSelect('studentReport')}
                                >
                                    Student Report
                                </button>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Logout button on the right */}
                <button className="btn btn-outline-light" onClick={onLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}
