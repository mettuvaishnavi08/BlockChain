import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWeb3 } from '../../contexts/Web3Context';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, roles = [] }) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const { isConnected } = useWeb3();
    const location = useLocation();
    
    if (isLoading) {
        return <LoadingSpinner />;
    }
    
    if (!isConnected) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }
    
    if (roles.length > 0 && !roles.includes(user?.role)) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return children;
};

export default ProtectedRoute;