import React from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { GraduationCap, Wallet, LogOut, User, Building2, Shield } from 'lucide-react';

const Header: React.FC = () => {
  const { wallet, connectWallet, disconnectWallet, userRole, switchRole, isRoleAuthenticated } = useWeb3();

  const getRoleIcon = () => {
    switch (userRole) {
      case 'student':
        return <User className="w-4 h-4" />;
      case 'institution':
        return <Building2 className="w-4 h-4" />;
      case 'verifier':
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">EduChain</h1>
              <p className="text-xs text-gray-500">Decentralized Credentials</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {wallet.isConnected && (
              <div className="flex items-center space-x-2">
                <select
                  value={userRole || ''}
                  onChange={(e) => {
                    const role = e.target.value as 'student' | 'institution' | 'verifier';
                    if (role && isRoleAuthenticated(role)) {
                      switchRole(role);
                    }
                  }}
                  className="text-sm bg-gray-50 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Role</option>
                  <option value="student" disabled={!isRoleAuthenticated('student')}>
                    Student {isRoleAuthenticated('student') ? '✓' : '🔒'}
                  </option>
                  <option value="institution" disabled={!isRoleAuthenticated('institution')}>
                    Institution {isRoleAuthenticated('institution') ? '✓' : '🔒'}
                  </option>
                  <option value="verifier" disabled={!isRoleAuthenticated('verifier')}>
                    Verifier {isRoleAuthenticated('verifier') ? '✓' : '🔒'}
                  </option>
                </select>
                
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                  {getRoleIcon()}
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {userRole || 'Select Role'}
                  </span>
                </div>
              </div>
            )}

            {wallet.isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700">
                      {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                    </span>
                  </div>
                  {wallet.balance && (
                    <div className="text-xs text-green-600 mt-1">
                      {parseFloat(wallet.balance).toFixed(4)} ETH
                    </div>
                  )}
                </div>
                <button
                  onClick={disconnectWallet}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Disconnect Wallet"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;