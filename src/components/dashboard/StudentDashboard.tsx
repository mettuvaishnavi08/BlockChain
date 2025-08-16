import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useIPFS } from '../../contexts/IPFSContext';
import { User, Shield, FileText, Plus, Search, Filter } from 'lucide-react';
import { Credential } from '../../types';
import CredentialCard from '../common/CredentialCard';
import LoadingSpinner from '../common/LoadingSpinner';

const StudentDashboard: React.FC = () => {
  const { wallet } = useWeb3();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock data for demonstration
  useEffect(() => {
    const mockCredentials: Credential[] = [
      {
        id: 'cred-001',
        studentAddress: wallet.address || '',
        institutionAddress: '0x742d35cc6634c0532925a3b8d4d15c8e3b4b8f8f',
        institutionName: 'Stanford University',
        credentialType: 'Degree',
        title: 'Bachelor of Science in Computer Science',
        description: 'Comprehensive computer science program covering algorithms, data structures, software engineering, and system design.',
        issueDate: '2024-01-15',
        ipfsHash: 'QmX4nVN1HpGN3kN7x8zJ9K2mP5qR7sT8uV9wA1bC2dE3f',
        issueTxHash: '0xabc123...',
        isValid: true,
        accessLevel: 'public' as const,
        metadata: {
          grade: 'Summa Cum Laude',
          courseDuration: '4 years',
          skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Blockchain'],
        },
      },
      {
        id: 'cred-002',
        studentAddress: wallet.address || '',
        institutionAddress: '0x853e46dd7635d1542925b4c5e6f7g9h1i2j3k4l5',
        institutionName: 'MIT',
        credentialType: 'Certificate',
        title: 'Blockchain Technology Certificate',
        description: 'Advanced certification in blockchain technology, smart contracts, and decentralized applications.',
        issueDate: '2024-02-20',
        ipfsHash: 'QmY5oWO2IqHO4oO8y9zK0L3nQ6rR8sT9uV0xB2cD3eE4g',
        issueTxHash: '0xdef456...',
        isValid: true,
        accessLevel: 'restricted' as const,
        metadata: {
          courseDuration: '6 months',
          skills: ['Solidity', 'Web3.js', 'Smart Contracts', 'DeFi'],
        },
      },
    ];
    
    setTimeout(() => {
      setCredentials(mockCredentials);
      setLoading(false);
    }, 1000);
  }, [wallet.address]);

  const handleAccessLevelChange = (credentialId: string, accessLevel: 'public' | 'private' | 'restricted') => {
    setCredentials(prev => 
      prev.map(cred => 
        cred.id === credentialId 
          ? { ...cred, accessLevel }
          : cred
      )
    );
  };

  const filteredCredentials = credentials.filter(credential => {
    const matchesSearch = credential.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         credential.institutionName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && credential.credentialType.toLowerCase() === filterType;
  });

  const stats = {
    total: credentials.length,
    verified: credentials.filter(c => c.isValid).length,
    public: credentials.filter(c => c.accessLevel === 'public').length,
  };

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to access your credentials</p>
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
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-gray-600">{wallet.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-gray-600">Total Credentials</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-success-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
                <p className="text-gray-600">Verified</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <User className="w-8 h-8 text-warning-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.public}</p>
                <p className="text-gray-600">Public</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search credentials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
              >
                <option value="all">All Types</option>
                <option value="degree">Degree</option>
                <option value="certificate">Certificate</option>
                <option value="diploma">Diploma</option>
              </select>
            </div>
          </div>
        </div>

        {/* Credentials Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Loading your credentials...</span>
          </div>
        ) : filteredCredentials.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Credentials Found</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Your credentials will appear here once institutions issue them to you'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCredentials.map((credential) => (
              <CredentialCard
                key={credential.id}
                credential={credential}
                showControls={true}
                onAccessLevelChange={handleAccessLevelChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;