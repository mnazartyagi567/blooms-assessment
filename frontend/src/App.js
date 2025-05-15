// src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import Login from './components/Login';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const onLoginSuccess = ({ token, role }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setToken(token);
    setRole(role);
  };

  const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setRole(null);
  };

  if (!token) {
    return <Login onLoginSuccess={onLoginSuccess} />;
  }
  return role === 'teacher' ? (
    <TeacherDashboard onLogout={onLogout} />
  ) : (
    <StudentDashboard onLogout={onLogout} />
  );
}
