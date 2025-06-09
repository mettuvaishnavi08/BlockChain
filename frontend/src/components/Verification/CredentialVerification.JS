import React, { useState } from 'react';
import { MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const CredentialVerification = () => {
    const [credentialId, setCredentialId] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [loading, setLoading] = useState(false);

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
        } catch (error) {
            console.error('Verification error:', error);
            const message = error.response?.data?.message || 'Verification failed';
            toast.error(message);
            setVerificationResult({ isValid: false, error: message });
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setCredentialId('');
        setVerificationResult(null);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center mb-6">
                        <MagnifyingGlassIcon className="h-8 w-8 text-primary-600 mr-3" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Verify Credential</h1>
                            <p className="text-sm text-gray-500">
                                Enter a credential ID to verify its authenticity
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleVerification} className="mb-8">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Credential ID or Transaction Hash
                                </label>
                                <input
                                    type="text"
                                    value={credentialId}
                                    onChange={(e) => setCredentialId(e.target.value)}
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Enter credential ID or blockchain transaction hash..."
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md disabled:opacity-50 whitespace-nowrap"
                                >
                                    {loading ? 'Verifying...' : 'Verify'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {verificationResult && (
                        <div className="mt-8">
                            <div className={`rounded-lg p-6 ${verificationResult.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                }`}>
                                <div className="flex items-center mb-4">
                                    {verificationResult.isValid ? (
                                        <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                                    ) : (
                                        <XCircleIcon className="h-8 w-8 text-red-600 mr-3" />
                                    )}
                                    <div>
                                        <h3 className={`text-lg font-semibold ${verificationResult.isValid ? 'text-green-800' : 'text-red-800'
                                            }`}>
                                            {verificationResult.isValid ? 'Credential Verified' : 'Verification Failed'}
                                        </h3>
                                        <p className={`text-sm ${verificationResult.isValid ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {verificationResult.isValid
                                                ? 'This credential is authentic and valid'
                                                : verificationResult.error || 'This credential could not be verified'
                                            }
                                        </p>
                                    </div>
                                </div>

                                {verificationResult.isValid && verificationResult.credential && (
                                    <div className="bg-white rounded-lg p-4 border">
                                        <h4 className="font-semibold text-gray-900 mb-3">Credential Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Type</label>
                                                <p className="text-sm text-gray-900">{verificationResult.credential.credentialType}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Institution</label>
                                                <p className="text-sm text-gray-900">{verificationResult.credential.institutionName}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Student</label>
                                                <p className="text-sm text-gray-900">{verificationResult.credential.studentName || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Issue Date</label>
                                                <p className="text-sm text-gray-900">
                                                    {new Date(verificationResult.credential.issueDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {verificationResult.credential.courseName && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Course</label>
                                                    <p className="text-sm text-gray-900">{verificationResult.credential.courseName}</p>
                                                </div>
                                            )}
                                            {verificationResult.credential.grade && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Grade</label>
                                                    <p className="text-sm text-gray-900">{verificationResult.credential.grade}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {verificationResult.blockchainData && (
                                    <div className="mt-4 bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Blockchain Verification</h4>
                                        <div className="space-y-2">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Transaction Hash</label>
                                                <p className="text-sm text-gray-900 font-mono break-all">
                                                    {verificationResult.blockchainData.transactionHash}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Block Number</label>
                                                <p className="text-sm text-gray-900">{verificationResult.blockchainData.blockNumber}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Issuer Address</label>
                                                <p className="text-sm text-gray-900 font-mono">
                                                    {verificationResult.blockchainData.issuerAddress}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={reset}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
                                >
                                    Verify Another Credential
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CredentialVerification;