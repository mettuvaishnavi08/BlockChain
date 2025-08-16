import React, { useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { 
  Search, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ExternalLink,
  QrCode,
  Clock,
  Building2,
  User,
  FileText
} from 'lucide-react';
import { Credential, VerificationResult } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const VerifierDashboard: React.FC = () => {
  const { wallet } = useWeb3();
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentVerifications, setRecentVerifications] = useState<VerificationResult[]>([]);

  // Mock verification data
  const mockVerificationResults = [
    {
      isValid: true,
      credential: {
        id: 'cred-001',
        studentAddress: '0x1234567890123456789012345678901234567890',
        institutionAddress: '0x742d35cc6634c0532925a3b8d4d15c8e3b4b8f8f',
        institutionName: 'Stanford University',
        credentialType: 'Degree',
        title: 'Bachelor of Science in Computer Science',
        description: 'Comprehensive computer science program.',
        issueDate: '2024-01-15',
        ipfsHash: 'QmX4nVN1HpGN3kN7x8zJ9K2mP5qR7sT8uV9wA1bC2dE3f',
        issueTxHash: '0xabc123...',
        isValid: true,
        accessLevel: 'public' as const,
        metadata: {
          grade: 'Summa Cum Laude',
          courseDuration: '4 years',
          skills: ['JavaScript', 'Python', 'React', 'Node.js']
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
    }
  ];

  const handleVerifyCredential = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a credential ID or student address');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock verification result
      const result = mockVerificationResults[0];
      setVerificationResult(result);
      
      // Add to recent verifications
      setRecentVerifications(prev => [result, ...prev.slice(0, 4)]);
      
      toast.success('Credential verified successfully');
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify credential');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = () => {
    // In a real implementation, this would open camera for QR scanning
    toast.info('QR Scanner would open here (camera access required)');
  };

  const getVerificationStatusIcon = (result: VerificationResult) => {
    if (!result.isValid) {
      return <XCircle className="w-8 h-8 text-red-500" />;
    }
    
    if (result.blockchainVerified && result.ipfsVerified) {
      return <CheckCircle className="w-8 h-8 text-green-500" />;
    }
    
    return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
  };

  const getStatusColor = (result: VerificationResult) => {
    if (!result.isValid) return 'border-red-200 bg-red-50';
    if (result.blockchainVerified && result.ipfsVerified) return 'border-green-200 bg-green-50';
    return 'border-yellow-200 bg-yellow-50';
  };

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to access the verifier dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Credential Verifier</h1>
                <p className="text-gray-600">Verify the authenticity of academic credentials</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Verify Credential</h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter credential ID, student address, or transaction hash..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleVerifyCredential()}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleQRScan}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg transition-colors"
                title="Scan QR Code"
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">Scan QR</span>
              </button>
              
              <button
                onClick={handleVerifyCredential}
                disabled={loading || !searchQuery.trim()}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Verify</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <div className={`bg-white rounded-xl shadow-lg border-2 ${getStatusColor(verificationResult)} mb-8`}>
            <div className="p-6">
              <div className="flex items-start space-x-4 mb-6">
                {getVerificationStatusIcon(verificationResult)}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {verificationResult.isValid ? 'Valid Credential' : 'Invalid Credential'}
                  </h3>
                  <p className="text-gray-600">
                    Verified on {new Date(verificationResult.verificationDate).toLocaleString()}
                  </p>
                </div>
              </div>

              {verificationResult.credential && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Credential Details */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 text-lg">Credential Details</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Title</p>
                        <p className="font-medium text-gray-900">{verificationResult.credential.title}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium text-gray-900">{verificationResult.credential.credentialType}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Issue Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(verificationResult.credential.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Student Address</p>
                        <p className="font-mono text-sm text-gray-900 break-all">
                          {verificationResult.credential.studentAddress}
                        </p>
                      </div>

                      {verificationResult.credential.metadata.grade && (
                        <div>
                          <p className="text-sm text-gray-500">Grade</p>
                          <p className="font-medium text-gray-900">{verificationResult.credential.metadata.grade}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Institution & Technical Details */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 text-lg">Institution & Verification</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Institution</p>
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <p className="font-medium text-gray-900">{verificationResult.credential.institutionName}</p>
                          {verificationResult.institution?.isVerified && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Institution Address</p>
                        <p className="font-mono text-sm text-gray-900 break-all">
                          {verificationResult.credential.institutionAddress}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Blockchain</p>
                          <div className="flex items-center space-x-1">
                            {verificationResult.blockchainVerified ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-sm font-medium">
                              {verificationResult.blockchainVerified ? 'Verified' : 'Failed'}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">IPFS</p>
                          <div className="flex items-center space-x-1">
                            {verificationResult.ipfsVerified ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-sm font-medium">
                              {verificationResult.ipfsVerified ? 'Verified' : 'Failed'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <a
                          href={`https://ipfs.io/ipfs/${verificationResult.credential.ipfsHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View on IPFS</span>
                        </a>
                      </div>

                      {verificationResult.credential.metadata.skills && verificationResult.credential.metadata.skills.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-500 mb-2">Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {verificationResult.credential.metadata.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Verifications */}
        {recentVerifications.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Verifications</h2>
            
            <div className="space-y-4">
              {recentVerifications.map((result, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  {getVerificationStatusIcon(result)}
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">
                        {result.credential?.title || 'Unknown Credential'}
                      </h3>
                      {result.isValid && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Valid
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Building2 className="w-3 h-3" />
                        <span>{result.credential?.institutionName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(result.verificationDate).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-blue-50 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Verify Credentials</h3>
          <div className="text-blue-800 space-y-2">
            <p>• Enter a credential ID, student wallet address, or transaction hash</p>
            <p>• Use the QR scanner to scan credential QR codes</p>
            <p>• Check both blockchain and IPFS verification status</p>
            <p>• Verified institutions are marked with a green checkmark</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifierDashboard;