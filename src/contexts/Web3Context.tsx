import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Web3 from 'web3';
import { WalletState } from '../types';
import toast from 'react-hot-toast';

interface Web3ContextType {
  web3: Web3 | null;
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isInstitution: boolean;
  userRole: 'student' | 'institution' | 'verifier' | null;
  switchRole: (role: 'student' | 'institution' | 'verifier') => void;
  authenticateRole: (role: 'student' | 'institution' | 'verifier', password: string) => boolean;
  isRoleAuthenticated: (role: 'student' | 'institution' | 'verifier') => boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [wallet, setWallet] = useState<WalletState>({ isConnected: false });
  const [userRole, setUserRole] = useState<'student' | 'institution' | 'verifier' | null>(null);
  const [authenticatedRoles, setAuthenticatedRoles] = useState<Set<string>>(new Set());

  // Role passwords - In production, these should be stored securely
  const rolePasswords = {
    student: 'student123',
    institution: 'institution456',
    verifier: 'verifier789'
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const accounts = await web3Instance.eth.getAccounts();
        const balance = await web3Instance.eth.getBalance(accounts[0]);
        const chainId = await web3Instance.eth.getChainId();
        
        setWeb3(web3Instance);
        setWallet({
          isConnected: true,
          address: accounts[0],
          balance: web3Instance.utils.fromWei(balance, 'ether'),
          network: chainId.toString(),
        });
        
        toast.success('Wallet connected successfully!');
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            disconnectWallet();
          } else {
            setWallet(prev => ({ ...prev, address: accounts[0] }));
          }
        });
        
        // Listen for network changes
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
        
      } else {
        toast.error('Please install MetaMask to use this application');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const disconnectWallet = () => {
    setWeb3(null);
    setWallet({ isConnected: false });
    setUserRole(null);
    setAuthenticatedRoles(new Set());
    toast.success('Wallet disconnected');
  };

  const switchRole = (role: 'student' | 'institution' | 'verifier') => {
    if (authenticatedRoles.has(role)) {
      setUserRole(role);
      toast.success(`Switched to ${role} mode`);
    } else {
      toast.error(`Please authenticate as ${role} first`);
    }
  };

  const authenticateRole = (role: 'student' | 'institution' | 'verifier', password: string): boolean => {
    if (rolePasswords[role] === password) {
      setAuthenticatedRoles(prev => new Set([...prev, role]));
      setUserRole(role);
      toast.success(`Successfully authenticated as ${role}`);
      return true;
    } else {
      toast.error('Invalid password');
      return false;
    }
  };

  const isRoleAuthenticated = (role: 'student' | 'institution' | 'verifier'): boolean => {
    return authenticatedRoles.has(role);
  };

  const isInstitution = userRole === 'institution';

  const value: Web3ContextType = {
    web3,
    wallet,
    connectWallet,
    disconnectWallet,
    isInstitution,
    userRole,
    switchRole,
    authenticateRole,
    isRoleAuthenticated,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};