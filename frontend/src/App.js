// src/App.js
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if there's a logged-in user in localStorage
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    // Store user in state
    setUser(loggedInUser);
    // Also persist in localStorage
    localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    // Clear user from state
    setUser(null);
    // Remove from localStorage
    localStorage.removeItem('loggedInUser');
    // Optionally also remove the last viewed page if you like
    localStorage.removeItem('currentView');
  };

  return (
    <div>
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
      {/* <Dashboard user={user} onLogout={handleLogout}/> */}
    </div>
  );
}

export default App;
