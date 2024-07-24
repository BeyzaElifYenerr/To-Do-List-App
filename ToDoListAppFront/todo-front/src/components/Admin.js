// src/components/Admin.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
//import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  //const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found');
        return;
      }

      try {
        debugger;
        const response = await axios.get('https://localhost:7082/api/Users', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const users = response.data['$values'] || [];
        console.log ('notes',users);
        setUsers(users);  
      } catch (error) {
        setError('There was an error fetching the users!');
        console.error(error);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found');
      return;
    }

    try {
      await axios.delete(`https://localhost:7082/api/Users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUsers(users.filter(user => user.userId !== userId));
    } catch (error) {
      setError('There was an error deleting the user!');
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      {error && <p>{error}</p>}
      <ul>
        {users.map(user => (
          <li key={user.userId}>
            <h3>{user.username}</h3>
            <button onClick={() => handleDeleteUser(user.userId)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Admin;
