import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';

function App() {
  const [user, setUser] = useState(null);

  // On mount, check for a logged-in user in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('loggedInUser');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('loggedInUser');
      }
    }
  }, []);

  const handleLoginSuccess = (u) => {
    setUser(u);
    localStorage.setItem('loggedInUser', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('loggedInUser');
  };

  // If not logged in, show the login form
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Once logged in, branch on role
  return user.role === 'teacher' ? (
    <TeacherDashboard user={user} onLogout={handleLogout} />
  ) : (
    <StudentDashboard user={user} onLogout={handleLogout} />
  );
}

export default App;
