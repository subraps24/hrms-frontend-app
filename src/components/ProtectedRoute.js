import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ component: Component, roles }) => {
    const userRole = localStorage.getItem('userRole');

    if (!userRole || !roles.includes(userRole)) {
        return <Navigate to="/" replace />;
    }

    return <Component />;
};

export default ProtectedRoute;