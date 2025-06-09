import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const IssueCredentialForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        studentWalletAddress: '',
        studentName: '',
        studentEmail: '',
        credentialType: '',
        courseName: '',
        grade: '',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        description: '',
        additionalData: {}
    });
    const [loading, setLoading] = useState(false);
    const [additionalFields, setAdditionalFields] = useState([]);

    const credentialTypes = [
        'Degree Certificate',
        'Diploma',
        'Course Completion',
        'Professional Certificate',
        'Achievement Award',
        'Transcript',
        'Other'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const addAdditionalField = () => {
        setAdditionalFields(prev => [...prev, { key: '', value: '' }]);
    };

    const updateAdditionalField = (index, field, value) => {
        setAdditionalFields(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });

        // Update formData.additionalData
        const updatedData = {};
        additionalFields.forEach((field, i) => {
            if (i === index) {
                if (field === 'key') {
                    updatedData[value] = additionalFields[index].value;
                } else {
                    updatedData[additionalFields[index].key] = value;
                }
            } else if (field.key && field.value) {
                updatedData[field.key] = field.value;
            }
        });

        setFormData(prev => ({
            ...prev,
            additionalData: updatedData
        }));
    };

    const removeAdditionalField = (index) => {
        setAdditionalFields(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.studentWalletAddress || !formData.credentialType) {
                throw new Error('Please fill in all required fields');
            }

            // Add additional fields to formData
            const finalData = {
                ...formData,
                additionalData: {}
            };

            additionalFields.forEach(field => {
                if (field.key && field.value) {
                    finalData.additionalData[field.key] = field.value;
                }
            });

            const response = await apiService.issueCredential(finalData);
            
            toast.success('Credential issued successfully!');
            navigate('/credentials');
            
        } catch (error) {
            console.error('Error issuing credential:', error);
            const message = error.response?.data?.message || error.message || 'Failed to issue credential';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center mb-6">
                        <DocumentArrowUpIcon className="h-8 w-8 text-primary-600 mr-3" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Issue New Credential</h1>
                            <p className="text-sm text-gray-500">Create and issue a new academic credential</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Student Information */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Student Wallet Address *
                                </label>
                                <input
                                    type="text"
                                    name="studentWalletAddress"
                                    value={formData.studentWalletAddress}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="0x..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Student Name
                                </label>
                                <input
                                    type="text"
                                    name="studentName"
                                    value={formData.studentName}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Student Email
                                </label>
                                <input
                                    type="email"
                                    name="studentEmail"
                                    value={formData.studentEmail}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Credential Type *
                                </label>
                                <select
                                    name="credentialType"
                                    value={formData.credentialType}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">Select type...</option>
                                    {credentialTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Credential Details */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Course/Program Name
                                </label>
                                <input
                                    type="text"
                                    name="courseName"
                                    value={formData.courseName}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Grade/Score
                                </label>
                                <input
                                    type="text"
                                    name="grade"
                                    value={formData.grade}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="A, B+, 85%, etc."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Issue Date
                                </label>
                                <input
                                    type="date"
                                    name="issueDate"
                                    value={formData.issueDate}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Expiry Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Additional details about the credential..."
                            />
                        </div>

                        {/* Additional Fields */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
                                <button
                                    type="button"
                                    onClick={addAdditionalField}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm"
                                >
                                    Add Field
                                </button>
                            </div>

                            {additionalFields.map((field, index) => (
                                <div key={index} className="flex gap-4 mb-3">
                                    <input
                                        type="text"
                                        placeholder="Field name"
                                        value={field.key}
                                        onChange={(e) => updateAdditionalField(index, 'key', e.target.value)}
                                        className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Field value"
                                        value={field.value}
                                        onChange={(e) => updateAdditionalField(index, 'value', e.target.value)}
                                        className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeAdditionalField(index)}
                                        className="bg-red-200 hover:bg-red-300 text-red-700 px-3 py-2 rounded"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                            >
                                {loading ? 'Issuing...' : 'Issue Credential'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default IssueCredentialForm;