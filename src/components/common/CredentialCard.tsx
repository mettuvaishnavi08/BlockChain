import React, { useState } from 'react';
import { format } from 'date-fns';
import { Shield, ExternalLink, Eye, EyeOff, Download, Share2 } from 'lucide-react';
import { Credential } from '../../types';
import QRCode from 'qrcode';

interface CredentialCardProps {
  credential: Credential;
  showControls?: boolean;
  onAccessLevelChange?: (credentialId: string, accessLevel: 'public' | 'private' | 'restricted') => void;
}

const CredentialCard: React.FC<CredentialCardProps> = ({ 
  credential, 
  showControls = false, 
  onAccessLevelChange 
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showQR, setShowQR] = useState(false);

  const generateQRCode = async () => {
    try {
      const verificationUrl = `${window.location.origin}/verify/${credential.id}`;
      const url = await QRCode.toDataURL(verificationUrl);
      setQrCodeUrl(url);
      setShowQR(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'public':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'private':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'restricted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (isValid: boolean) => {
    return isValid 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6" />
            <h3 className="text-lg font-semibold">{credential.title}</h3>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(credential.isValid)}`}>
            {credential.isValid ? 'Verified' : 'Invalid'}
          </div>
        </div>
        <p className="text-primary-100 text-sm mt-1">{credential.institutionName}</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Credential Type</p>
            <p className="font-medium text-gray-900">{credential.credentialType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Issue Date</p>
            <p className="font-medium text-gray-900">
              {format(new Date(credential.issueDate), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500">Description</p>
          <p className="text-gray-900 mt-1">{credential.description}</p>
        </div>

        {credential.metadata.grade && (
          <div className="mb-4">
            <p className="text-sm text-gray-500">Grade</p>
            <p className="font-medium text-gray-900">{credential.metadata.grade}</p>
          </div>
        )}

        {credential.metadata.skills && credential.metadata.skills.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {credential.metadata.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-500">Access Level:</p>
            {showControls ? (
              <select
                value={credential.accessLevel}
                onChange={(e) => onAccessLevelChange?.(credential.id, e.target.value as any)}
                className={`text-xs px-2 py-1 rounded-full border font-medium ${getAccessLevelColor(credential.accessLevel)}`}
              >
                <option value="public">Public</option>
                <option value="restricted">Restricted</option>
                <option value="private">Private</option>
              </select>
            ) : (
              <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getAccessLevelColor(credential.accessLevel)}`}>
                {credential.accessLevel.charAt(0).toUpperCase() + credential.accessLevel.slice(1)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={generateQRCode}
              className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <Share2 className="w-4 h-4" />
              <span>QR Code</span>
            </button>
            <button
              onClick={() => {
                // In a real implementation, this would link to actual IPFS content
                alert(`IPFS Hash: ${credential.ipfsHash}\n\nIn production, this would link to the actual document stored on IPFS.`);
              }}
              className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Document</span>
            </button>
          </div>
          <p className="text-xs text-gray-400">
            ID: {credential.id.slice(0, 8)}...
          </p>
        </div>
      </div>

      {showQR && qrCodeUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Verification QR Code</h3>
              <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code to verify the credential
              </p>
              <button
                onClick={() => setShowQR(false)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CredentialCard;