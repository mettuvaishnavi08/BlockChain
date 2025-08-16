import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import { 
  Shield, 
  Zap, 
  Globe, 
  Lock, 
  Users, 
  Award,
  ChevronRight,
  CheckCircle,
  Building2,
  GraduationCap,
  Search,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { wallet, connectWallet, userRole, switchRole, authenticateRole, isRoleAuthenticated } = useWeb3();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'student' | 'institution' | 'verifier' | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const features = [
    {
      icon: Shield,
      title: 'Blockchain Security',
      description: 'Credentials secured by Ethereum blockchain technology, ensuring immutable verification.'
    },
    {
      icon: Globe,
      title: 'Decentralized Storage',
      description: 'Documents stored on IPFS for permanent, censorship-resistant access.'
    },
    {
      icon: Lock,
      title: 'Privacy Control',
      description: 'Students control who can access their credentials with granular privacy settings.'
    },
    {
      icon: Zap,
      title: 'Instant Verification',
      description: 'Real-time credential verification through QR codes and blockchain lookup.'
    }
  ];

  const roles = [
    {
      id: 'student',
      icon: GraduationCap,
      title: 'Student',
      description: 'View and manage your academic credentials',
      color: 'from-blue-500 to-blue-700'
    },
    {
      id: 'institution',
      icon: Building2,
      title: 'Institution',
      description: 'Issue and manage student credentials',
      color: 'from-purple-500 to-purple-700'
    },
    {
      id: 'verifier',
      icon: Search,
      title: 'Verifier',
      description: 'Verify the authenticity of credentials',
      color: 'from-green-500 to-green-700'
    }
  ];

  const handleRoleSelect = (roleId: string) => {
    if (wallet.isConnected) {
      const role = roleId as 'student' | 'institution' | 'verifier';
      if (isRoleAuthenticated(role)) {
        switchRole(role);
        navigate('/dashboard');
      } else {
        setSelectedRole(role);
        setShowPasswordModal(true);
      }
    } else {
      connectWallet();
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole && authenticateRole(selectedRole, password)) {
      setShowPasswordModal(false);
      setPassword('');
      setSelectedRole(null);
      navigate('/dashboard');
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPassword('');
    setSelectedRole(null);
    setShowPassword(false);
  };

  const getRoleCredentials = (role: string) => {
    switch (role) {
      case 'student':
        return 'student123';
      case 'institution':
        return 'institution456';
      case 'verifier':
        return 'verifier789';
      default:
        return '';
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduChain
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Decentralized Academic Credential Verification Platform
            </p>
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              Secure, transparent, and tamper-proof academic credentials powered by blockchain technology and IPFS storage.
            </p>
            
            {!wallet.isConnected && (
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                Connect Wallet to Get Started
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Role Selection */}
      {wallet.isConnected && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Role</h2>
            <p className="text-gray-600 text-lg">Select how you want to use EduChain</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = userRole === role.id;
              const isAuthenticated = isRoleAuthenticated(role.id as 'student' | 'institution' | 'verifier');
              
              return (
                <div
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`relative group cursor-pointer transform hover:-translate-y-2 transition-all duration-300 ${
                    isSelected ? 'scale-105' : ''
                  }`}
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 border-2 border-transparent hover:border-blue-200 transition-all duration-300">
                    <div className={`w-16 h-16 bg-gradient-to-br ${role.color} rounded-xl flex items-center justify-center mb-6 mx-auto shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{role.title}</h3>
                    <p className="text-gray-600 text-center mb-6">{role.description}</p>
                    
                    <div className="flex items-center justify-center text-blue-600 font-medium group-hover:text-blue-700">
                      <span>{isAuthenticated ? 'Access Dashboard' : 'Authenticate'}</span>
                      <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                    
                    {(isSelected || isAuthenticated) && (
                      <div className="absolute -top-2 -right-2">
                        <CheckCircle className={`w-8 h-8 ${isAuthenticated ? 'text-green-500' : 'text-blue-500'} bg-white rounded-full shadow-lg`} />
                      </div>
                    )}
                    
                    {wallet.isConnected && (
                      <div className="absolute top-4 right-4">
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                          Demo: {getRoleCredentials(role.id)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose EduChain?</h2>
          <p className="text-gray-600 text-lg">Built with cutting-edge technology for maximum security and usability</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/50"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-blue-100">Secure</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">0</div>
              <div className="text-blue-100">Single Points of Failure</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">∞</div>
              <div className="text-blue-100">Credential Lifespan</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Availability</div>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-600 text-lg">Simple, secure, and transparent credential management</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
              1
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Institution Issues</h3>
            <p className="text-gray-600">Educational institutions issue credentials directly to student wallets</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
              2
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Blockchain Storage</h3>
            <p className="text-gray-600">Credentials are stored securely on blockchain with IPFS document storage</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
              3
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Verification</h3>
            <p className="text-gray-600">Anyone can verify credentials instantly using QR codes or direct lookup</p>
          </div>
        </div>
      </div>

      {/* Password Authentication Modal */}
      {showPasswordModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Authenticate as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                </h2>
                <button
                  onClick={closePasswordModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter {selectedRole} password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Demo credentials display */}
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Demo Password:</strong> {getRoleCredentials(selectedRole)}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Authenticate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;