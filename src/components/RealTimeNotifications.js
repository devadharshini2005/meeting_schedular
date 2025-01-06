import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const loggedInUserEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    // Fetch the user's notes when the component loads
    const fetchNotes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get-notes', {
          params: { email: loggedInUserEmail },
        });
        if (response.status === 200) {
          setNotes(response.data.notes);
        } else {
          alert('Failed to fetch notes');
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
        alert('Error fetching notes');
      }
    };

    fetchNotes();
  }, [loggedInUserEmail]);

  const handleAddNote = async () => {
    if (!newNote) {
      alert('Note cannot be empty');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/save-note',
        { note: newNote },
        { headers: { 'user-email': loggedInUserEmail } }
      );

      if (response.status === 200) {
        setNotes([...notes, newNote]);
        setNewNote('');
      } else {
        alert('Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error saving note');
    }
  };

  const handleDeleteNote = async (noteToDelete) => {
    try {
      const response = await axios.delete('http://localhost:5000/delete-note', {
        data: { note: noteToDelete, email: loggedInUserEmail },
      });

      if (response.status === 200) {
        setNotes(notes.filter((note) => note !== noteToDelete));
      } else {
        alert('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting note');
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: 'auto',
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Arial, sans-serif',
      color: '#333',
    }}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Notes</h2>

      <div style={{ marginBottom: '20px' }}>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a new note..."
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            minHeight: '100px',
          }}
        ></textarea>
        <button onClick={handleAddNote} style={{
          marginTop: '10px',
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}>
          Add Note
        </button>
      </div>

      <div>
        {notes.length > 0 ? (
          notes.map((note, index) => (
            <div key={index} style={{
              backgroundColor: '#fff',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '5px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}>
              <p>{note}</p>
              <button onClick={() => handleDeleteNote(note)} style={{
                backgroundColor: '#ff4d4d',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                padding: '5px 10px',
                cursor: 'pointer',
              }}>
                Delete
              </button>
            </div>
          ))
        ) : (
          <p>No notes available.</p>
        )}
      </div>
    </div>
  );
};

export default Notes;
