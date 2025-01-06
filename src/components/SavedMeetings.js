import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SavedMeetings.css';

// Meeting component to display individual meeting details
const Meeting = ({ meeting, onDelete }) => (
    <div>
        <p><strong>Common Time:</strong> {meeting.commonTime}</p>
        <ul>
            {meeting.teamMembers.map((member, idx) => (
                <li key={idx}>
                    <strong>Name:</strong> {member.name},
                    <strong> Time Zone:</strong> {member.timeZone},
                    <strong> Selected Time:</strong> {member.selectedTime},
                    <strong> Date:</strong> {member.selectedDate}
                </li>
            ))}
        </ul>
        <button onClick={() => onDelete(meeting._id)}>Remove</button>
    </div>
);

const SavedMeetings = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true); // Track loading state

    const fetchMeetings = async () => {
        setLoading(true); // Set loading to true at the start of the fetch
        const loggedInUserEmail = localStorage.getItem('userEmail');
        
        try {
            const response = await axios.get('http://localhost:5000/get-meetings', {
                headers: { 'user-email': loggedInUserEmail },
            });
            setMeetings(response.data.meetings);
        } catch (error) {
            console.error('Error fetching meetings:', error);
        } finally {
            setLoading(false); // End loading
        }
    };

    const deleteMeeting = async (meetingId) => {
        const loggedInUserEmail = localStorage.getItem('userEmail');
        
        try {
            const response = await fetch(`http://localhost:5000/delete-meeting/${meetingId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'user-email': loggedInUserEmail,  // Ensure user-email is passed here
                },
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                // Remove the deleted meeting from the list without any message
                setMeetings((prevMeetings) => prevMeetings.filter((meeting) => meeting._id !== meetingId));
            }
        } catch (error) {
            console.error("Error deleting meeting:", error);
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, []);

    return (
        <div>
            <h2>Your Saved Meetings</h2>
            {loading ? (
                <p>Loading meetings...</p> // Simple loading message
            ) : meetings.length > 0 ? (
                meetings.map((meeting) => (
                    <Meeting key={meeting._id} meeting={meeting} onDelete={deleteMeeting} />
                ))
            ) : (
                <p>No saved meetings found.</p>
            )}
        </div>
    );
};

export default SavedMeetings;
