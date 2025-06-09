import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWeb3 } from './Web3Context';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { account, signMessage, isConnected } = useWeb3();
    
    // Check authentication status on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);
    
    // Clear auth if wallet disconnected
    useEffect(() => {
        if (!isConnected && isAuthenticated) {
            logout();
        }
    }, [isConnected, isAuthenticated]);
    
    const checkAuthStatus = async () => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            try {
                const response = await apiService.getProfile();
                setUser(response.data.user);
                setIsAuthenticated(true);
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        
        setIsLoading(false);
    };
    
    const register = async (userData) => {
        try {
            if (!account) {
                throw new Error('Wallet not connected');
            }
            
            const nonceResponse = await apiService.getNonce(account);
            const message = nonceResponse.data.nonce;
            const signature = await signMessage(message);
            
            const response = await apiService.register({
                ...userData,
                walletAddress: account,
                signature,
                message,
            });
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            setUser(response.data.user);
            setIsAuthenticated(true);
            
            toast.success('Registration successful');
            return response;
            
        } catch (error) {
            console.error('Registration error:', error);
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            throw error;
        }
    };
    
    const login = async () => {
        try {
            if (!account) {
                throw new Error('Wallet not connected');
            }
            
            const nonceResponse = await apiService.getNonce(account);
            const message = nonceResponse.data.nonce;
            const signature = await signMessage(message);
            
            const response = await apiService.login({
                walletAddress: account,
                signature,
                message,
            });
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            setUser(response.data.user);
            setIsAuthenticated(true);
            
            toast.success('Login successful');
            return response;
            
        } catch (error) {
            console.error('Login error:', error);
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            throw error;
        }
    };
    
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        toast.success('Logged out successfully');
    };
    
    const updateProfile = async (profileData) => {
        try {
            const response = await apiService.updateProfile(profileData);
            const updatedUser = response.data.user;
            
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            toast.success('Profile updated successfully');
            return response;
            
        } catch (error) {
            console.error('Profile update error:', error);
            const message = error.response?.data?.message || 'Profile update failed';
            toast.error(message);
            throw error;
        }
    };
    
    const value = {
        user,
        isAuthenticated,
        isLoading,
        register,
        login,
        logout,
        updateProfile,
    };
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};