// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Notes from './components/Notes';
import Admin from './components/Admin';
import AddUser from './components/AddUser';
import UserSettings from './components/UserSettings';

import './App.css';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setToken={setToken} />} />
        <Route path="/notes" element={<Notes token={token} />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/adduser" element={<AddUser />} />
        <Route path="/settings" element={<UserSettings />} /> {/* UserSettings için route ekleyin */}
      </Routes>
    </Router>
  );
};

export default App;