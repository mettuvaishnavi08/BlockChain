import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DocumentTextIcon, AcademicCapIcon, UsersIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const InstitutionDashboard = () => {
    const [credentials, setCredentials] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        loadDashboardData();
    }, []);
    
    const loadDashboardData = async () => {
        try {
            const [credentialsRes, analyticsRes] = await Promise.all([
                apiService.getInstitutionCredentials(),
                apiService.getInstitutionAnalytics()
            ]);
            
            setCredentials(credentialsRes.data.credentials);
            setAnalytics(analyticsRes.data);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) return <LoadingSpinner />;
    
    return (
        <div className="space-y-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Institution Dashboard</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Issue and manage academic credentials
                            </p>
                        </div>
                        <Link
                            to="/issue"
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                            Issue New Credential
                        </Link>
                    </div>
                </div>
            </div>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Issued
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {analytics?.totalIssued || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <AcademicCapIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Active Credentials
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {analytics?.activeCredentials || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <UsersIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Revoked
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {analytics?.revokedCredentials || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ChartBarIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Credential Types
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {analytics?.credentialsByType?.length || 0}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Recent Credentials */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Recently Issued Credentials
                    </h3>
                    {credentials.length > 0 ? (
                        <div className="space-y-4">
                            {credentials.slice(0, 5).map((credential) => (
                                <div key={credential._id} className="border-l-4 border-green-400 bg-green-50 p-4">
                                    <div className="flex justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-green-800">
                                                {credential.credentialType}
                                            </h4>
                                            <p className="text-sm text-green-600">
                                                Student: {credential.studentName || 'N/A'}
                                            </p>
                                            <p className="text-xs text-green-500">
                                                Issued: {new Date(credential.issueDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                credential.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {credential.status}
                                            </span>
                                            {credential.isRevoked && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Revoked
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">
                            No credentials issued yet. Start by issuing your first credential.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstitutionDashboard;