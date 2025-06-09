const mongoose = require('mongoose');

const verificationLogSchema = new mongoose.Schema({
    credentialId: {
        type: String,
        required: true
    },
    verifierAddress: {
        type: String,
        required: true,
        lowercase: true
    },
    verifierType: {
        type: String,
        enum: ['employer', 'institution', 'individual', 'government'],
        required: true
    },
    verificationResult: {
        type: String,
        enum: ['valid', 'invalid', 'expired', 'revoked'],
        required: true
    },
    ipAddress: String,
    userAgent: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for analytics
verificationLogSchema.index({ credentialId: 1 });
verificationLogSchema.index({ verifierAddress: 1 });
verificationLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('VerificationLog', verificationLogSchema);