// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Login.css';  // Import the CSS file for styling

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://localhost:7082/api/Users/login', {
        username,
        password
      });
      const token = response.data;
      const decodedToken = jwtDecode(token.token);

      localStorage.setItem('token', token.token);
      localStorage.setItem('userId', token.userId);
      
      setToken(token);
    
      if (decodedToken.sub === '1') {
        navigate('/admin');
      } else {
        navigate('/notes');
      }
    } catch (error) {
      console.error('Giriş yaparken bir hata oluştu!', error);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <div>
          <label>Kullanıcı Adı:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Şifre:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Giriş Yap</button>
        <button 
          onClick={() => navigate('/adduser')} 
          className="btn-secondary"
        >
          Kayıt Ol
        </button>
      </form>
    </div>
  );
};

export default Login;
