import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ username, children }) => {
    if (!username) {
        // Redirect to login if user is not authenticated
        return <Navigate to="/login" />;
    }

    // If user is authenticated, render the child components
    return children;
};

export default PrivateRoute;
