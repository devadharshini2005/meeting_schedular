// src/components/GoogleLoginButton.js
import React from 'react';
import { GoogleLogin } from '@react-oauth/google'; 
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = ({ setUserEmail }) => {
    const navigate = useNavigate();

    const handleSuccess = (response) => {
        const { credential } = response;
        const userEmail = JSON.parse(atob(credential.split('.')[1])).email;
        localStorage.setItem('username', userEmail);
        setUserEmail(userEmail);
        navigate('/');
    };

    const handleError = (error) => {
        console.error('Login Failed', error);
    };

    return (
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
        />
    );
};

export default GoogleLoginButton;
