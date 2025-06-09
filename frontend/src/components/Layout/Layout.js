import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWeb3 } from '../../contexts/Web3Context';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="pt-16">
                    {children}
                </main>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex pt-16">
                <Sidebar />
                <main className="flex-1 ml-64 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;