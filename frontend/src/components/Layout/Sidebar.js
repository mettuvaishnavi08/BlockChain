import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    HomeIcon,
    DocumentTextIcon,
    AcademicCapIcon,
    ChartBarIcon,
    UserGroupIcon,
    CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();
    
    const getNavigationItems = () => {
        const baseItems = [
            { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        ];
        
        if (user?.role === 'student') {
            return [
                ...baseItems,
                { name: 'My Credentials', href: '/credentials', icon: DocumentTextIcon },
                { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
            ];
        }
        
        if (user?.role === 'institution') {
            return [
                ...baseItems,
                { name: 'Issue Credential', href: '/issue', icon: AcademicCapIcon },
                { name: 'Issued Credentials', href: '/credentials', icon: DocumentTextIcon },
                { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
            ];
        }
        
        if (user?.role === 'verifier') {
            return [
                ...baseItems,
                { name: 'Verify Credentials', href: '/verify', icon: CheckBadgeIcon },
                { name: 'Verification History', href: '/verifications', icon: DocumentTextIcon },
            ];
        }
        
        if (user?.role === 'admin') {
            return [
                ...baseItems,
                { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
                { name: 'All Credentials', href: '/admin/credentials', icon: DocumentTextIcon },
                { name: 'Platform Analytics', href: '/admin/analytics', icon: ChartBarIcon },
            ];
        }
        
        return baseItems;
    };
    
    const navigation = getNavigationItems();
    
    return (
        <div className="fixed left-0 top-16 h-screen w-64 bg-white shadow-lg">
            <nav className="mt-5 px-2">
                <div className="space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`${
                                    isActive
                                        ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
                            >
                                <item.icon
                                    className={`${
                                        isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                                    } mr-3 h-6 w-6`}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;