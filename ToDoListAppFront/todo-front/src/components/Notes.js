import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Notes.css';  // Import the CSS file for styling

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [editNoteId, setEditNoteId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('https://localhost:7082/api/Notes/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const userNotes = response.data['$values'] || [];
        setNotes(userNotes);
      } catch (error) {
        setError('There was an error fetching the notes!');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleAddNote = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      setError('No token or userId found');
      return;
    }

    try {
      const response = await axios.post('https://localhost:7082/api/Notes', {
        title: newNoteTitle,
        text: newNoteText,
        userId: parseInt(userId) // userId'yi gönderiyoruz
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setNotes([...notes, response.data]);
      setNewNoteTitle('');
      setNewNoteText('');
    } catch (error) {
      setError('There was an error adding the note!');
      console.error(error);
    }
  };

  const handleEditNote = (note) => {
    setEditNoteId(note.noteId);
    setNewNoteTitle(note.title);
    setNewNoteText(note.text);
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId || !editNoteId) {
      setError('No token, userId or note to edit found');
      return;
    }

    try {
      const response = await axios.put(`https://localhost:7082/api/Notes/${editNoteId}`, {
        title: newNoteTitle,
        text: newNoteText,
        userId: parseInt(userId) // userId'yi gönderiyoruz
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setNotes(notes.map(note => note.noteId === editNoteId ? response.data : note));
      setNewNoteTitle('');
      setNewNoteText('');
      setEditNoteId(null);
    } catch (error) {
      setError('There was an error updating the note!');
      console.error(error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found');
      return;
    }

    try {
      await axios.delete(`https://localhost:7082/api/Notes?id=${noteId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setNotes(notes.filter(note => note.noteId !== noteId));
    } catch (error) {
      setError('There was an error deleting the note!');
      console.error(error);
    }
  };

  return (
    <div className="notes-page">
      <button className="settings-button" onClick={() => navigate('/settings')}>Ayarlar</button>
      <div className="notes-content">
        <form onSubmit={editNoteId ? handleUpdateNote : handleAddNote}>
          <div>
            <label>Not Başlığı:</label>
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
            />
          </div>
          <div>
            <label>Not Metni:</label>
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
            />
          </div>
          <button type="submit">{editNoteId ? 'Güncelle' : 'Ekle'}</button>
        </form>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <ul>
            {notes.map(note => (
              <li key={note.noteId}>
                <h3>{note.title}</h3>
                <p>{note.text}</p>
                <button onClick={() => handleEditNote(note)}>Düzenle</button>
                <button onClick={() => handleDeleteNote(note.noteId)}>Sil</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notes;
