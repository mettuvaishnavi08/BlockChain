const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Credential = require('../models/Credential');
const VerificationLog = require('../models/VerificationLog');
const { auth, authorize } = require('../middleware/auth');
const blockchainService = require('../utils/blockchain');
const ipfsService = require('../utils/ipfs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
        }
    }
});

// Issue credential
router.post('/issue', auth, authorize('institution'), upload.single('document'), async (req, res) => {
    try {
        const {
            studentAddress,
            credentialType,
            program,
            grade,
            expiryDate,
            metadata
        } = req.body;
        
        // Validate required fields
        if (!studentAddress || !credentialType || !program || !grade || !expiryDate) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        // Validate expiry date
        const expiry = new Date(expiryDate);
        if (expiry <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Expiry date must be in the future'
            });
        }
        
        let ipfsHash = null;
        let filePath = null;
        
        // Upload document to IPFS if provided
        if (req.file) {
            filePath = req.file.path;
            const ipfsResult = await ipfsService.uploadCredentialDocument(filePath, {
                studentAddress,
                credentialType,
                program,
                institution: req.user.walletAddress
            });
            
            if (!ipfsResult.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload document to IPFS',
                    error: ipfsResult.error
                });
            }
            
            ipfsHash = ipfsResult.ipfsHash;
        } else {
            // Create metadata JSON and upload to IPFS
            const metadataJson = {
                studentAddress,
                credentialType,
                program,
                grade,
                issueDate: new Date().toISOString(),
                expiryDate,
                institution: req.user.profile.institutionName || req.user.profile.name,
                metadata: metadata ? JSON.parse(metadata) : {}
            };
            
            const ipfsResult = await ipfsService.uploadJSON(metadataJson, `credential-${Date.now()}`);
            
            if (!ipfsResult.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload metadata to IPFS',
                    error: ipfsResult.error
                });
            }
            
            ipfsHash = ipfsResult.ipfsHash;
        }
        
        // Issue credential on blockchain
        const blockchainResult = await blockchainService.issueCredential(
            process.env.INSTITUTION_PRIVATE_KEY, // You'll need to manage this securely
            {
                studentAddress: studentAddress.toLowerCase(),
                credentialType,
                program,
                grade,
                ipfsHash,
                expiryDate: Math.floor(expiry.getTime() / 1000)
            }
        );
        
        if (!blockchainResult.success) {
            // Clean up IPFS if blockchain fails
            await ipfsService.unpinFile(ipfsHash);
            
            return res.status(500).json({
                success: false,
                message: 'Failed to issue credential on blockchain',
                error: blockchainResult.error
            });
        }
        
        // Save credential to database
        const credential = new Credential({
            credentialId: blockchainResult.credentialId,
            studentAddress: studentAddress.toLowerCase(),
            institutionAddress: req.user.walletAddress,
            credentialType,
            program,
            grade,
            ipfsHash,
            metadata: metadata ? JSON.parse(metadata) : {},
            transactionHash: blockchainResult.transactionHash,
            blockNumber: blockchainResult.blockNumber,
            gasUsed: blockchainResult.gasUsed,
            status: 'confirmed',
            issueDate: new Date(),
            expiryDate: expiry
        });
        
        await credential.save();
        
        // Clean up uploaded file
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        res.status(201).json({
            success: true,
            message: 'Credential issued successfully',
            data: {
                credential: {
                    id: credential._id,
                    credentialId: credential.credentialId,
                    transactionHash: credential.transactionHash,
                    ipfsHash: credential.ipfsHash
                }
            }
        });
        
    } catch (error) {
        console.error('Issue credential error:', error);
        
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to issue credential',
            error: error.message
        });
    }
});

// Verify credential
router.get('/verify/:credentialId', async (req, res) => {
    try {
        const { credentialId } = req.params;
        const { verifierAddress, verifierType } = req.query;
        
        if (!credentialId) {
            return res.status(400).json({
                success: false,
                message: 'Credential ID required'
            });
        }
        
        // Verify on blockchain
        const blockchainResult = await blockchainService.verifyCredential(credentialId);
        
        // Get credential from database for additional info
        const credential = await Credential.findOne({ credentialId });
        
        let verificationResult = 'invalid';
        if (blockchainResult.isValid) {
            verificationResult = 'valid';
        } else if (credential && credential.isRevoked) {
            verificationResult = 'revoked';
        } else if (credential && new Date() > credential.expiryDate) {
            verificationResult = 'expired';
        }
        
        // Log verification attempt
        if (verifierAddress) {
            const verificationLog = new VerificationLog({
                credentialId,
                verifierAddress: verifierAddress.toLowerCase(),
                verifierType: verifierType || 'individual',
                verificationResult,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            await verificationLog.save();
            
            // Update verification count
            if (credential) {
                credential.verificationCount += 1;
                credential.lastVerified = new Date();
                await credential.save();
            }
        }
        
        res.json({
            success: true,
            data: {
                isValid: blockchainResult.isValid,
                verificationResult,
                credential: blockchainResult.isValid ? {
                    student: blockchainResult.student,
                    institution: blockchainResult.institution,
                    credentialType: blockchainResult.credentialType,
                    program: blockchainResult.program,
                    grade: blockchainResult.grade,
                    issueDate: blockchainResult.issueDate,
                    expiryDate: blockchainResult.expiryDate,
                    ipfsHash: credential?.ipfsHash
                } : null
            }
        });
        
    } catch (error) {
        console.error('Verify credential error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify credential',
            error: error.message
        });
    }
});

// Get student credentials
router.get('/student/:studentAddress', auth, async (req, res) => {
    try {
        const { studentAddress } = req.params;
        
        // Check if user can access these credentials
        if (req.user.role === 'student' && req.user.walletAddress !== studentAddress.toLowerCase()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        const credentials = await Credential.find({
            studentAddress: studentAddress.toLowerCase(),
            status: 'confirmed'
        }).populate('institutionAddress').sort({ issueDate: -1 });
        
        res.json({
            success: true,
            data: { credentials }
        });
        
    } catch (error) {
        console.error('Get student credentials error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get credentials',
            error: error.message
        });
    }
});

// Get institution credentials
router.get('/institution', auth, authorize('institution'), async (req, res) => {
    try {
        const credentials = await Credential.find({
            institutionAddress: req.user.walletAddress
        }).sort({ issueDate: -1 });
        
        res.json({
            success: true,
            data: { credentials }
        });
        
    } catch (error) {
        console.error('Get institution credentials error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get credentials',
            error: error.message
        });
    }
});

// Revoke credential
router.put('/revoke/:credentialId', auth, authorize('institution'), async (req, res) => {
    try {
        const { credentialId } = req.params;
        const { reason } = req.body;
        
        // Find credential
        const credential = await Credential.findOne({ 
            credentialId,
            institutionAddress: req.user.walletAddress
        });
        
        if (!credential) {
            return res.status(404).json({
                success: false,
                message: 'Credential not found or access denied'
            });
        }
        
        if (credential.isRevoked) {
            return res.status(400).json({
                success: false,
                message: 'Credential already revoked'
            });
        }
        
        // Revoke on blockchain (you'll need institution's private key)
        // This is a simplified version - in production, implement proper key management
        
        // Update database
        credential.isRevoked = true;
        credential.revokedAt = new Date();
        credential.revokedReason = reason;
        credential.status = 'revoked';
        
        await credential.save();
        
        res.json({
            success: true,
            message: 'Credential revoked successfully'
        });
        
    } catch (error) {
        console.error('Revoke credential error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to revoke credential',
            error: error.message
        });
    }
});

// Get credential details
router.get('/details/:credentialId', async (req, res) => {
    try {
        const { credentialId } = req.params;
        
        const credential = await Credential.findOne({ credentialId });
        
        if (!credential) {
            return res.status(404).json({
                success: false,
                message: 'Credential not found'
            });
        }
        
        // Get IPFS metadata if available
        let ipfsMetadata = null;
        try {
            ipfsMetadata = await ipfsService.getFile(credential.ipfsHash);
        } catch (error) {
            console.warn('Failed to get IPFS metadata:', error.message);
        }
        
        res.json({
            success: true,
            data: {
                credential,
                ipfsMetadata
            }
        });
        
    } catch (error) {
        console.error('Get credential details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get credential details',
            error: error.message
        });
    }
});

module.exports = router;