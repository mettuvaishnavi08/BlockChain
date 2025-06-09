const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');

class IPFSService {
    constructor() {
        this.pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);
    }

    // Test IPFS connection
    async testConnection() {
        try {
            await this.pinata.testAuthentication();
            console.log('✅ IPFS (Pinata) connection successful');
            return true;
        } catch (error) {
            console.error('❌ IPFS connection failed:', error);
            return false;
        }
    }

    // Upload credential document to IPFS
    async uploadCredentialDocument(filePath, metadata = {}) {
        try {
            const options = {
                pinataMetadata: {
                    name: `credential-${Date.now()}`,
                    ...metadata
                },
                pinataOptions: {
                    cidVersion: 0
                }
            };

            const result = await this.pinata.pinFromFS(filePath, options);

            return {
                success: true,
                ipfsHash: result.IpfsHash,
                pinSize: result.PinSize,
                timestamp: result.Timestamp
            };
        } catch (error) {
            console.error('IPFS upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Upload JSON metadata to IPFS
    async uploadJSON(jsonData, filename = null) {
        try {
            const options = {
                pinataMetadata: {
                    name: filename || `metadata-${Date.now()}`
                }
            };

            const result = await this.pinata.pinJSONToIPFS(jsonData, options);

            return {
                success: true,
                ipfsHash: result.IpfsHash,
                pinSize: result.PinSize
            };
        } catch (error) {
            console.error('IPFS JSON upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get file from IPFS
    async getFile(ipfsHash) {
        try {
            const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('IPFS retrieve error:', error);
            throw error;
        }
    }

    // Unpin file from IPFS
    async unpinFile(ipfsHash) {
        try {
            await this.pinata.unpin(ipfsHash);
            return { success: true };
        } catch (error) {
            console.error('IPFS unpin error:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new IPFSService();