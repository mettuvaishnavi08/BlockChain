import React, { createContext, useContext, useState, ReactNode } from 'react';
import { IPFSFile } from '../types';
import toast from 'react-hot-toast';

interface IPFSContextType {
  uploadToIPFS: (file: File) => Promise<string>;
  uploadJSONToIPFS: (data: any) => Promise<string>;
  getFromIPFS: (hash: string) => Promise<any>;
  isUploading: boolean;
}

const IPFSContext = createContext<IPFSContextType | undefined>(undefined);

export const useIPFS = () => {
  const context = useContext(IPFSContext);
  if (context === undefined) {
    throw new Error('useIPFS must be used within an IPFSProvider');
  }
  return context;
};

interface IPFSProviderProps {
  children: ReactNode;
}

export const IPFSProvider: React.FC<IPFSProviderProps> = ({ children }) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const uploadToIPFS = async (file: File): Promise<string> => {
    try {
      setIsUploading(true);
      
      // Simulate IPFS upload for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a mock IPFS hash
      const mockHash = `Qm${Math.random().toString(36).substr(2, 44)}`;
      
      toast.success('File uploaded to IPFS successfully!');
      return mockHash;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      toast.error('Failed to upload file to IPFS');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadJSONToIPFS = async (data: any): Promise<string> => {
    try {
      setIsUploading(true);
      
      // Simulate IPFS upload for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a mock IPFS hash
      const mockHash = `Qm${Math.random().toString(36).substr(2, 44)}`;
      
      toast.success('Data uploaded to IPFS successfully!');
      return mockHash;
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      toast.error('Failed to upload data to IPFS');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const getFromIPFS = async (hash: string): Promise<any> => {
    try {
      // Simulate IPFS retrieval for demo purposes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock data
      return {
        message: "Mock IPFS data retrieved successfully",
        hash: hash,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting from IPFS:', error);
      toast.error('Failed to retrieve data from IPFS');
      throw error;
    }
  };

  const value: IPFSContextType = {
    uploadToIPFS,
    uploadJSONToIPFS,
    getFromIPFS,
    isUploading,
  };

  return <IPFSContext.Provider value={value}>{children}</IPFSContext.Provider>;
};