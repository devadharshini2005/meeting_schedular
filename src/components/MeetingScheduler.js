import React, { useState } from 'react';
import moment from 'moment-timezone';
import axios from 'axios';

const MeetingScheduler = () => {
  const [teamMembers, setTeamMembers] = useState([
    { name: '', timeZone: moment.tz.guess(), selectedTime: '09:00', selectedDate: moment().format('YYYY-MM-DD') },
  ]);
  const [commonTime, setCommonTime] = useState(null);

  const handleMemberChange = (index, field, value) => {
    const updatedTeamMembers = [...teamMembers];
    updatedTeamMembers[index][field] = value;
    setTeamMembers(updatedTeamMembers);
  };

  const addTeamMember = () => {
    setTeamMembers([
      ...teamMembers,
      { name: '', timeZone: moment.tz.guess(), selectedTime: '09:00', selectedDate: moment().format('YYYY-MM-DD') },
    ]);
  };

  const removeTeamMember = (index) => {
    const updatedTeamMembers = [...teamMembers];
    updatedTeamMembers.splice(index, 1);
    setTeamMembers(updatedTeamMembers);
  };

  const calculateCommonTime = () => {
    const times = teamMembers.map((member) =>
      moment.tz(`${member.selectedDate}T${member.selectedTime}`, member.timeZone)
    );

    const earliestTime = moment.max(times);
    const latestTime = moment.min(times);

    if (earliestTime.isSameOrBefore(latestTime)) {
      setCommonTime(earliestTime.format('YYYY-MM-DD HH:mm z'));
    } else {
      setCommonTime('No common time available');
    }
  };

  const handleSave = async () => {
    const loggedInUserEmail = localStorage.getItem('userEmail');

    try {
      const response = await axios.post(
        'http://localhost:5000/save-meeting',
        { teamMembers, commonTime },
        { headers: { 'user-email': loggedInUserEmail } }
      );

      if (response.status === 201) {
        alert('Meeting saved successfully!');
      } else {
        alert('Unexpected response while saving the meeting.');
      }
    } catch (error) {
      console.error('Error saving meeting:', error);
      alert('Failed to save meeting.');
    }
  };

  return (
    <div style={{
      maxWidth: '700px',
      margin: 'auto',
      padding: '30px',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      fontFamily: 'Arial, sans-serif',
      color: '#333',
      textAlign: 'center'
    }}>
      <h2 style={{ fontSize: '26px', color: '#2c3e50', marginBottom: '25px' }}>Schedule a Meeting</h2>

      {teamMembers.map((member, index) => (
        <div key={index} style={{
          marginBottom: '20px',
          padding: '15px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        }}>
          <input
            type="text"
            placeholder="Member Name"
            value={member.name}
            onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              marginBottom: '10px'
            }}
          />
          <select
            value={member.timeZone}
            onChange={(e) => handleMemberChange(index, 'timeZone', e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              marginBottom: '10px'
            }}
          >
            {moment.tz.names().map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={member.selectedDate}
            onChange={(e) => handleMemberChange(index, 'selectedDate', e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              marginBottom: '10px'
            }}
          />
          <input
            type="time"
            value={member.selectedTime}
            onChange={(e) => handleMemberChange(index, 'selectedTime', e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              marginBottom: '10px'
            }}
          />
          <button type="button" onClick={() => removeTeamMember(index)} style={{
            backgroundColor: '#ff4d4d',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 20px',
            cursor: 'pointer'
          }}>
            Remove
          </button>
        </div>
      ))}
      
      <button type="button" onClick={addTeamMember} style={{
        width: '100%',
        backgroundColor: '#4CAF50',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        padding: '10px',
        cursor: 'pointer',
        marginTop: '10px'
      }}>
        Add Team Member
      </button>

      <button type="button" onClick={calculateCommonTime} style={{
        width: '100%',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        padding: '10px',
        cursor: 'pointer',
        marginTop: '10px'
      }}>
        Calculate Common Time
      </button>

      {commonTime && <p style={{
        fontSize: '18px',
        color: '#333',
        backgroundColor: '#e9f7ff',
        padding: '10px',
        borderRadius: '8px',
        marginTop: '15px'
      }}>Common Meeting Time: {commonTime}</p>}

      <button type="button" onClick={handleSave} style={{
        width: '100%',
        backgroundColor: '#f39c12',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        padding: '10px',
        cursor: 'pointer',
        marginTop: '10px'
      }}>
        Save
      </button>
    </div>
  );
};

export default MeetingScheduler;
