const mongoose = require('mongoose');

const credentialSchema = new mongoose.Schema({
    credentialId: {
        type: String,
        required: true,
        unique: true
    },
    studentAddress: {
        type: String,
        required: true,
        lowercase: true
    },
    institutionAddress: {
        type: String,
        required: true,
        lowercase: true
    },
    credentialType: {
        type: String,
        required: true,
        enum: ['Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Certificate', 'Diploma']
    },
    program: {
        type: String,
        required: true
    },
    grade: {
        type: String,
        required: true
    },
    ipfsHash: {
        type: String,
        required: true
    },
    metadata: {
        gpa: Number,
        honors: String,
        completionDate: Date,
        duration: String,
        specialization: String,
        additionalInfo: String
    },
    transactionHash: {
        type: String,
        required: true
    },
    blockNumber: Number,
    gasUsed: Number,
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'failed', 'revoked'],
        default: 'pending'
    },
    issueDate: {
        type: Date,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    isRevoked: {
        type: Boolean,
        default: false
    },
    revokedAt: Date,
    revokedReason: String,
    verificationCount: {
        type: Number,
        default: 0
    },
    lastVerified: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
credentialSchema.index({ studentAddress: 1 });
credentialSchema.index({ institutionAddress: 1 });
credentialSchema.index({ credentialType: 1 });
credentialSchema.index({ status: 1 });

module.exports = mongoose.model('Credential', credentialSchema);