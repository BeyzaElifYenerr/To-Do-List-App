import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddUser.css';  // CSS dosyasına doğru yolu belirleyin

const AddUser = () => {
    
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
       
      await axios.post('https://localhost:7082/api/Users/register', {
        username,
        password,
      });

      setMessage('Kullanıcı başarıyla eklendi!');
      setUsername(username);
      setPassword(password);
      setTimeout(() => navigate('/Login'), 1500); // Başarılı ekleme sonrası yönlendirme
    } catch (error) {
      setMessage('Kullanıcı ekleme işlemi başarısız oldu.');
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Kullanıcı Ekle</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Kullanıcı Adı:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Şifre:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Kullanıcı Ekle</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AddUser;