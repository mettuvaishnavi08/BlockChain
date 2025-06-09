const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const blockchainService = require('../utils/blockchain');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
    try {
        const { walletAddress, email, role, profile, signature, message } = req.body;

        // Validate required fields
        if (!walletAddress || !email || !role || !profile?.name) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Verify wallet signature
        try {
            const recoveredAddress = ethers.utils.verifyMessage(message, signature);
            if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid wallet signature'
                });
            }
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Signature verification failed'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { walletAddress: walletAddress.toLowerCase() },
                { email: email.toLowerCase() }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this wallet address or email already exists'
            });
        }

        // For institutions, verify registration on blockchain
        if (role === 'institution') {
            const isRegistered = await blockchainService.isRegisteredInstitution(walletAddress);
            if (!isRegistered) {
                return res.status(400).json({
                    success: false,
                    message: 'Institution not registered on blockchain'
                });
            }
        }

        // Create user
        const user = new User({
            walletAddress: walletAddress.toLowerCase(),
            email: email.toLowerCase(),
            role,
            profile: {
                ...profile,
                verified: role === 'institution' // Auto-verify institutions
            }
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, walletAddress: user.walletAddress, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    walletAddress: user.walletAddress,
                    email: user.email,
                    role: user.role,
                    profile: user.profile
                },
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { walletAddress, signature, message } = req.body;

        if (!walletAddress || !signature || !message) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Verify signature
        try {
            const recoveredAddress = ethers.utils.verifyMessage(message, signature);
            if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid wallet signature'
                });
            }
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Signature verification failed'
            });
        }

        // Find user
        const user = await User.findOne({
            walletAddress: walletAddress.toLowerCase(),
            isActive: true
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, walletAddress: user.walletAddress, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    walletAddress: user.walletAddress,
                    email: user.email,
                    role: user.role,
                    profile: user.profile
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-__v');

        res.json({
            success: true,
            data: { user }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile',
            error: error.message
        });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const updates = req.body;

        // Prevent updating sensitive fields
        delete updates.walletAddress;
        delete updates.role;
        delete updates._id;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-__v');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
});

// Get nonce for wallet signature
router.post('/nonce', async (req, res) => {
    try {
        const { walletAddress } = req.body;

        if (!walletAddress) {
            return res.status(400).json({
                success: false,
                message: 'Wallet address required'
            });
        }

        const nonce = `Please sign this message to authenticate with your wallet: ${Date.now()}`;

        res.json({
            success: true,
            data: { nonce }
        });

    } catch (error) {
        console.error('Nonce generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate nonce',
            error: error.message
        });
    }
});

module.exports = router;