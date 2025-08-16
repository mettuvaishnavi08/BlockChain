import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useIPFS } from '../../contexts/IPFSContext';
import { 
  Building2, 
  Plus, 
  Users, 
  Award, 
  FileText, 
  Upload,
  X,
  Check,
  Search,
  Filter,
  Download,
  Calendar
} from 'lucide-react';
import { Credential } from '../../types';
import CredentialCard from '../common/CredentialCard';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const InstitutionDashboard: React.FC = () => {
  const { wallet } = useWeb3();
  const { uploadJSONToIPFS, isUploading } = useIPFS();
  const [issuedCredentials, setIssuedCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    studentAddress: '',
    credentialType: 'certificate',
    title: '',
    description: '',
    grade: '',
    courseDuration: '',
    skills: '',
    documentFile: null as File | null
  });

  // Mock institution data
  const institutionInfo = {
    name: 'Stanford University',
    verified: true,
    address: wallet.address || '',
    credentialsIssued: 234,
    studentsEnrolled: 1500
  };

  useEffect(() => {
    // Mock data for demonstration
    const mockCredentials: Credential[] = [
      {
        id: 'cred-inst-001',
        studentAddress: '0x1234567890123456789012345678901234567890',
        institutionAddress: wallet.address || '',
        institutionName: institutionInfo.name,
        credentialType: 'Degree',
        title: 'Master of Science in Computer Science',
        description: 'Advanced computer science program focusing on AI and machine learning.',
        issueDate: '2024-01-15',
        ipfsHash: 'QmX4nVN1HpGN3kN7x8zJ9K2mP5qR7sT8uV9wA1bC2dE3f',
        issueTxHash: '0xabc123...',
        isValid: true,
        accessLevel: 'public' as const,
        metadata: {
          grade: 'A+',
          courseDuration: '2 years',
          skills: ['Machine Learning', 'Deep Learning', 'Python', 'TensorFlow'],
        },
      },
      {
        id: 'cred-inst-002',
        studentAddress: '0x2345678901234567890123456789012345678901',
        institutionAddress: wallet.address || '',
        institutionName: institutionInfo.name,
        credentialType: 'Certificate',
        title: 'Blockchain Development Certificate',
        description: 'Comprehensive blockchain development program.',
        issueDate: '2024-02-20',
        ipfsHash: 'QmY5oWO2IqHO4oO8y9zK0L3nQ6rR8sT9uV0xB2cD3eE4g',
        issueTxHash: '0xdef456...',
        isValid: true,
        accessLevel: 'public' as const,
        metadata: {
          courseDuration: '6 months',
          skills: ['Solidity', 'Web3.js', 'Smart Contracts', 'DeFi'],
        },
      }
    ];

    setTimeout(() => {
      setIssuedCredentials(mockCredentials);
      setLoading(false);
    }, 1000);
  }, [wallet.address]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, documentFile: e.target.files![0] }));
    }
  };

  const handleIssueCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form
      if (!formData.studentAddress || !formData.title || !formData.description) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Create credential data
      const credentialData = {
        studentAddress: formData.studentAddress,
        institutionAddress: wallet.address,
        institutionName: institutionInfo.name,
        credentialType: formData.credentialType,
        title: formData.title,
        description: formData.description,
        issueDate: new Date().toISOString(),
        metadata: {
          grade: formData.grade || undefined,
          courseDuration: formData.courseDuration || undefined,
          skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
        }
      };

      // Upload to IPFS
      const ipfsHash = await uploadJSONToIPFS(credentialData);

      // Create new credential
      const newCredential: Credential = {
        id: `cred-${Date.now()}`,
        ...credentialData,
        ipfsHash,
        issueTxHash: `0x${Math.random().toString(16).substr(2, 40)}`,
        isValid: true,
        accessLevel: 'public' as const,
      };

      // Add to issued credentials
      setIssuedCredentials(prev => [newCredential, ...prev]);

      // Reset form
      setFormData({
        studentAddress: '',
        credentialType: 'certificate',
        title: '',
        description: '',
        grade: '',
        courseDuration: '',
        skills: '',
        documentFile: null
      });

      setShowIssueForm(false);
      toast.success('Credential issued successfully!');

    } catch (error) {
      console.error('Error issuing credential:', error);
      toast.error('Failed to issue credential');
    }
  };

  const filteredCredentials = issuedCredentials.filter(credential => {
    const matchesSearch = credential.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         credential.studentAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && credential.credentialType.toLowerCase() === filterType;
  });

  const stats = {
    total: issuedCredentials.length,
    thisMonth: issuedCredentials.filter(c => 
      new Date(c.issueDate).getMonth() === new Date().getMonth()
    ).length,
    verified: issuedCredentials.filter(c => c.isValid).length,
  };

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to access the institution dashboard</p>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{institutionInfo.name}</h1>
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-600">{wallet.address}</p>
                    {institutionInfo.verified && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowIssueForm(true)}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Issue Credential</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-gray-600">Total Issued</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
                <p className="text-gray-600">This Month</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{institutionInfo.studentsEnrolled}</p>
                <p className="text-gray-600">Students</p>
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
                placeholder="Search by title or student address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
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
            <span className="ml-3 text-gray-600">Loading issued credentials...</span>
          </div>
        ) : filteredCredentials.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Credentials Found</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start issuing credentials to your students'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCredentials.map((credential) => (
              <CredentialCard
                key={credential.id}
                credential={credential}
                showControls={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Issue Credential Modal */}
      {showIssueForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Issue New Credential</h2>
                <button
                  onClick={() => setShowIssueForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleIssueCredential} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Wallet Address *
                </label>
                <input
                  type="text"
                  name="studentAddress"
                  value={formData.studentAddress}
                  onChange={handleInputChange}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credential Type *
                  </label>
                  <select
                    name="credentialType"
                    value={formData.credentialType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="certificate">Certificate</option>
                    <option value="degree">Degree</option>
                    <option value="diploma">Diploma</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade (Optional)
                  </label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    placeholder="A+, Summa Cum Laude, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credential Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Bachelor of Science in Computer Science"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Detailed description of the credential..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Duration (Optional)
                  </label>
                  <input
                    type="text"
                    name="courseDuration"
                    value={formData.courseDuration}
                    onChange={handleInputChange}
                    placeholder="4 years, 6 months, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills (Optional)
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="JavaScript, Python, React (comma-separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supporting Document (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    id="document-upload"
                  />
                  <label
                    htmlFor="document-upload"
                    className="cursor-pointer text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Click to upload document
                  </label>
                  <p className="text-sm text-gray-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                  {formData.documentFile && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {formData.documentFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowIssueForm(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {isUploading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Issuing...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4" />
                      <span>Issue Credential</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionDashboard;