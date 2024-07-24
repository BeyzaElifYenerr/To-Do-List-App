import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserSettings = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      console.error('No token or userId found');
      return;
    }
  
    try {
        await axios.put(`https://localhost:7082/api/Users/${userId}`, {
        username: username,  // Kullanıcı adını state'den alın
        password: password   // Şifreyi state'den alın
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      // Güncellenmiş bilgileri state'ten temizleyin
      setUsername('');
      setPassword('');
      alert('Kullanıcı başarıyla güncellendi!');
    } catch (error) {
      console.error('Kullanıcı güncellenirken bir hata oluştu!', error);
      alert('Kullanıcı güncellenirken bir hata oluştu!');
    }
  };
  ;

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      await axios.delete(`https://localhost:7082/api/Users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      alert('Kullanıcı başarıyla silindi!');
      navigate('/');
    } catch (error) {
      console.error('Kullanıcı silinirken bir hata oluştu!', error);
      alert('Kullanıcı silinirken bir hata oluştu!');
    }
  };

  return (
    <div className="user-settings">
      <form onSubmit={handleUpdate}>
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
        <button type="submit">Güncelle</button>
      </form>
      <button onClick={handleDelete}>Hesabı Sil</button>
    </div>
  );
};

export default UserSettings;
