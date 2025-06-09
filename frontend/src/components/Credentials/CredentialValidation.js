import React, { useState } from 'react';
import { MagnifyingGlassIcon, CheckBadgeIcon, XCircleIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../Common/LoadingSpinner';

const CredentialVerification = () => {
    const [credentialId, setCredentialId] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [verificationHistory, setVerificationHistory] = useState([]);

    const handleVerification = async (e) => {
        e.preventDefault();
        if (!credentialId.trim()) {
            toast.error('Please enter a credential ID');
            return;
        }

        setLoading(true);
        try {
            const response = await apiService.verifyCredential(credentialId);
            setVerificationResult(response.data);

            if (response.data.isValid) {
                toast.success('Credential verified successfully!');
            } else {
                toast.error('Credential verification failed');
            }

            // Add to verification history
            setVerificationHistory(prev => [
                {
                    id: credentialId,
                    result: response.data,
                    timestamp: new Date().toISOString()
                },
                ...prev.slice(0, 4) // Keep only last 5 verifications
            ]);
        } catch (error) {
            console.error('Verification error:', error);
            const message = error.response?.data?.message || 'Verification failed';
            toast.error(message);
            setVerificationResult(null);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const VerificationCard = ({ result }) => {
        const { credential, isValid, blockchainData, verificationDetails } = result;

        return (
            <div className={`border-2 rounded-lg p-6 ${isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        {isValid ? (
                            <CheckBadgeIcon className="h-8 w-8 text-green-600 mr-3" />
                        ) : (
                            <XCircleIcon className="h-8 w-8 text-red-600 mr-3" />
                        )}
                        <div>
                            <h3 className={`text-lg font-semibold ${isValid ? 'text-green-800' : 'text-red-800'
                                }`}>
                                {isValid ? 'Credential Verified' : 'Verification Failed'}
                            </h3>
                            <p className={`text-sm ${isValid ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {verificationDetails?.message || 'Credential verification completed'}
                            </p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${isValid
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {isValid ? 'Valid' : 'Invalid'}
                    </span>
                </div>

                {credential && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium text-gray-900">Credential Details</h4>
                                <div className="mt-2 space-y-2 text-sm">
                                    <div>
                                        <span className="font-medium">Type:</span> {credential.credentialType}
                                    </div>
                                    <div>
                                        <span className="font-medium">Course:</span> {credential.courseName}
                                    </div>
                                    <div>
                                        <span className="font-medium">Student:</span> {credential.studentName}
                                    </div>
                                    <div>
                                        <span className="font-medium">Institution:</span> {credential.institutionName}
                                    </div>
                                    <div>
                                        <span className="font-medium">Issue Date:</span> {formatDate(credential.issueDate)}
                                    </div>
                                    {credential.grade && (
                                        <div>
                                            <span className="font-medium">Grade:</span> {credential.grade}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900">Blockchain Verification</h4>
                                <div className="mt-2 space-y-2 text-sm">
                                    <div>
                                        <span className="font-medium">Transaction Hash:</span>
                                        <br />
                                        <code className="text-xs bg-gray-100 p-1 rounded">
                                            {blockchainData?.transactionHash || 'N/A'}
                                        </code>
                                    </div>
                                    <div>
                                        <span className="font-medium">Block Number:</span> {blockchainData?.blockNumber || 'N/A'}
                                    </div>
                                    <div>
                                        <span className="font-medium">Status:</span>
                                        <span className={`ml-1 ${credential.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {credential.status || 'Unknown'}
                                        </span>
                                    </div>
                                    {credential.isRevoked && (
                                        <div className="text-red-600">
                                            <span className="font-medium">⚠️ This credential has been revoked</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {credential.description && (
                            <div>
                                <h4 className="font-medium text-gray-900">Description</h4>
                                <p className="mt-1 text-sm text-gray-600">{credential.description}</p>
                            </div>
                        )}

                        {credential.customFields && credential.customFields.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-900">Additional Information</h4>
                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {credential.customFields.map((field, index) => (
                                        <div key={index} className="text-sm">
                                            <span className="font-medium">{field.key}:</span> {field.value}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center mb-6">
                        <MagnifyingGlassIcon className="h-8 w-8 text-primary-600 mr-3" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Verify Credential</h1>
                            <p className="text-sm text-gray-500">
                                Enter a credential ID to verify its authenticity on the blockchain
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleVerification} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Credential ID
                            </label>
                            <div className="flex space-x-3">
                                <input
                                    type="text"
                                    value={credentialId}
                                    onChange={(e) => setCredentialId(e.target.value)}
                                    placeholder="Enter credential ID (e.g., CRED-123456789)"
                                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
                                >
                                    {loading ? (
                                        <LoadingSpinner size="sm" />
                                    ) : (
                                        <>
                                            <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                                            Verify
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Verification Result */}
            {verificationResult && (
                <VerificationCard result={verificationResult} />
            )}

            {/* Verification History */}
            {verificationHistory.length > 0 && (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Verifications</h3>
                        <div className="space-y-3">
                            {verificationHistory.map((verification, index) => (
                                <div key={index} className="border-l-4 border-gray-200 pl-4 py-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {verification.id}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(verification.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${verification.result.isValid
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {verification.result.isValid ? 'Valid' : 'Invalid'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">How to verify credentials:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Enter the credential ID provided by the credential holder</li>
                    <li>• The system will check the credential's validity on the blockchain</li>
                    <li>• Verified credentials show detailed information and blockchain proof</li>
                    <li>• Invalid or revoked credentials will be clearly marked</li>
                </ul>
            </div>
        </div>
    );
};

export default CredentialVerification;