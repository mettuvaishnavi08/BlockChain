import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Building2, 
  User, 
  Calendar,
  ExternalLink,
  ArrowLeft,
  Award
} from 'lucide-react';
import { Credential, VerificationResult } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';

const VerifyCredential: React.FC = () => {
  const { credentialId } = useParams<{ credentialId: string }>();
  const navigate = useNavigate();
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyCredential = async () => {
      if (!credentialId) {
        setError('No credential ID provided');
        setLoading(false);
        return;
      }

      try {
        // Simulate verification process
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock verification result
        const mockResult: VerificationResult = {
          isValid: true,
          credential: {
            id: credentialId,
            studentAddress: '0x1234567890123456789012345678901234567890',
            institutionAddress: '0x742d35cc6634c0532925a3b8d4d15c8e3b4b8f8f',
            institutionName: 'Stanford University',
            credentialType: 'Degree',
            title: 'Bachelor of Science in Computer Science',
            description: 'Comprehensive computer science program covering algorithms, data structures, software engineering, and system design.',
            issueDate: '2024-01-15',
            ipfsHash: 'QmX4nVN1HpGN3kN7x8zJ9K2mP5qR7sT8uV9wA1bC2dE3f',
            issueTxHash: '0xabc123def456ghi789jkl012mno345pqr678stu901',
            isValid: true,
            accessLevel: 'public' as const,
            metadata: {
              grade: 'Summa Cum Laude',
              courseDuration: '4 years',
              skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Blockchain']
            }
          },
          institution: {
            id: 'inst-001',
            name: 'Stanford University',
            address: '0x742d35cc6634c0532925a3b8d4d15c8e3b4b8f8f',
            isVerified: true,
            website: 'https://stanford.edu',
            description: 'Leading research university',
            registrationDate: '2023-01-01'
          },
          verificationDate: new Date().toISOString(),
          blockchainVerified: true,
          ipfsVerified: true
        };

        setVerificationResult(mockResult);
      } catch (err) {
        setError('Failed to verify credential');
      } finally {
        setLoading(false);
      }
    };

    verifyCredential();
  }, [credentialId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Verifying credential...</p>
        </div>
      </div>
    );
  }

  if (error || !verificationResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error || 'Credential not found or invalid'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const { credential, institution, isValid, blockchainVerified, ipfsVerified, verificationDate } = verificationResult;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Verification Status Header */}
        <div className={`rounded-xl p-6 mb-8 border-2 ${
          isValid 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center space-x-4">
            {isValid ? (
              <CheckCircle className="w-12 h-12 text-green-500" />
            ) : (
              <XCircle className="w-12 h-12 text-red-500" />
            )}
            <div>
              <h1 className={`text-2xl font-bold ${
                isValid ? 'text-green-900' : 'text-red-900'
              }`}>
                {isValid ? 'Valid Credential' : 'Invalid Credential'}
              </h1>
              <p className={`${
                isValid ? 'text-green-700' : 'text-red-700'
              }`}>
                Verified on {new Date(verificationDate).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {credential && (
          <>
            {/* Credential Information */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-primary-500 to-primary-700 p-6 text-white">
                <div className="flex items-center space-x-3">
                  <Award className="w-8 h-8" />
                  <div>
                    <h2 className="text-xl font-bold">{credential.title}</h2>
                    <p className="text-primary-100">{credential.credentialType}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Credential Details</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Description</p>
                          <p className="text-gray-900">{credential.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Issue Date</p>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <p className="text-gray-900">
                                {new Date(credential.issueDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          {credential.metadata.grade && (
                            <div>
                              <p className="text-sm text-gray-500">Grade</p>
                              <p className="font-medium text-gray-900">{credential.metadata.grade}</p>
                            </div>
                          )}
                        </div>

                        {credential.metadata.courseDuration && (
                          <div>
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="text-gray-900">{credential.metadata.courseDuration}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {credential.metadata.skills && credential.metadata.skills.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Skills Acquired</p>
                        <div className="flex flex-wrap gap-2">
                          {credential.metadata.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Institution Information</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Institution Name</p>
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <p className="font-medium text-gray-900">{credential.institutionName}</p>
                            {institution?.isVerified && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Institution Address</p>
                          <p className="font-mono text-sm text-gray-700 break-all">
                            {credential.institutionAddress}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Student Address</p>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <p className="font-mono text-sm text-gray-700 break-all">
                              {credential.studentAddress}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Verification Status</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Blockchain Verification</span>
                          <div className="flex items-center space-x-1">
                            {blockchainVerified ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className={`text-sm font-medium ${
                              blockchainVerified ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {blockchainVerified ? 'Verified' : 'Failed'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">IPFS Verification</span>
                          <div className="flex items-center space-x-1">
                            {ipfsVerified ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className={`text-sm font-medium ${
                              ipfsVerified ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {ipfsVerified ? 'Verified' : 'Failed'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Technical Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Credential ID</p>
                      <p className="font-mono text-gray-700 break-all">{credential.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Transaction Hash</p>
                      <p className="font-mono text-gray-700 break-all">{credential.issueTxHash}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        alert(`IPFS Hash: ${credential.ipfsHash}\n\nDocument stored securely on IPFS.\n\nIn production, this would display the actual credential document.`);
                      }}
                      className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View Document</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Security & Privacy</h3>
              <div className="text-blue-800 text-sm space-y-1">
                <p>• This credential is cryptographically secured on the blockchain</p>
                <p>• Document integrity is verified through IPFS content addressing</p>
                <p>• Only the credential holder controls access permissions</p>
                <p>• Verification data is immutable and tamper-proof</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCredential;