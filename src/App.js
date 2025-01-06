// src/App.js
import React, { useState, useEffect } from 'react';
import { Route, Routes, Link, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import Login from './components/Login';
import SignUp from './components/SignUp';
import TimeZoneDashboard from './components/TimeZoneDashboard';
import SavedMeetings from './components/SavedMeetings';
import MeetingScheduler from './components/MeetingScheduler';
import RealTimeNotifications from './components/RealTimeNotifications';
import PrivateRoute from './components/PrivateRoute';
import GoogleLoginButton from './components/GoogleLoginButton';  // Import GoogleLoginButton
import './App.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

const App = () => {
    const [username, setUserEmail] = useState(localStorage.getItem('username'));
    const navigate = useNavigate();

    useEffect(() => {
        if (username) {
            localStorage.setItem('username', username);
        }
    }, [username]);

    const handleLogout = () => {
        localStorage.removeItem('username');
        setUserEmail(null);
        navigate('/login');
    };

    return (
        <GoogleOAuthProvider clientId="1028908847778-mt6cl1uumfkn9of64vvedqk6h97rcps1.apps.googleusercontent.com"> {/* Use your actual Google Client ID here */}
            <div className="app-container">
                <header className="app-header">
                    <h1 className="app-title">Time Zone Collaboration Tool</h1>
                    <nav className="nav-bar">
                        <Link to="/" className="nav-link">Home</Link>
                        <div className="auth-buttons">
                            {username ? (
                                <>
                                    <span className="user-profile">{username}</span>
                                    <Link to="/" onClick={handleLogout} className="logout-link">Logout</Link>
                                </>
                            ) : (
                                <>
                                    <GoogleLoginButton setUserEmail={setUserEmail} /> {/* Add Google Login Button */}
                                    <Link to="/signup" className="sign-up-button">Sign Up</Link>
                                </>
                            )}
                        </div>
                    </nav>
                </header>
                <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login setUserEmail={setUserEmail} />} />
                <Route path="/signup" element={<SignUp setUserEmail={setUserEmail} />} />
                {/* Protected Routes */}
                <Route
                    path="/timezone-dashboard"
                    element={
                        <PrivateRoute username={username}>
                            <TimeZoneDashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/saved-meetings"
                    element={
                        <PrivateRoute username={username}>
                            <SavedMeetings />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/meeting-scheduler"
                    element={
                        <PrivateRoute username={username}>
                            <MeetingScheduler />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/notifications"
                    element={
                        <PrivateRoute username={username}>
                            <RealTimeNotifications />
                        </PrivateRoute>
                    }
                />
            </Routes>

            </div>
        </GoogleOAuthProvider>
    );
};

export default App;
