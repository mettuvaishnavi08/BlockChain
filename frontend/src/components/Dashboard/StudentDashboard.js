import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, CheckBadgeIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const StudentDashboard = () => {
    const [credentials, setCredentials] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [credentialsRes, analyticsRes] = await Promise.all([
                apiService.getStudentCredentials(),
                apiService.getStudentAnalytics()
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
                    <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage and view your academic credentials
                    </p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Credentials
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {analytics?.totalCredentials || 0}
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
                                <CheckBadgeIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Verifications
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {analytics?.verificationStats?.totalVerifications || 0}
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
                                        Institutions
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {analytics?.credentialsByInstitution?.length || 0}
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
                        Recent Credentials
                    </h3>
                    {credentials.length > 0 ? (
                        <div className="space-y-4">
                            {credentials.slice(0, 5).map((credential) => (
                                <div key={credential._id} className="border-l-4 border-primary-400 bg-primary-50 p-4">
                                    <div className="flex justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-primary-800">
                                                {credential.credentialType}
                                            </h4>
                                            <p className="text-sm text-primary-600">
                                                {credential.institutionName}
                                            </p>
                                            <p className="text-xs text-primary-500">
                                                Issued: {new Date(credential.issueDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${credential.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {credential.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">
                            No credentials found. Contact your institution to issue credentials.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;