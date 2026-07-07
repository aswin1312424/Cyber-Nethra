import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const user = JSON.parse(sessionStorage.getItem('user'));

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Simply redirect to login or a "Not Authorized" page if you have one
        // For now, sending back to login is safe
        alert("Access Denied: You do not have permission to view this page.");
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
