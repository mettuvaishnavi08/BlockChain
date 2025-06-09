const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    role: {
        type: String,
        enum: ['student', 'institution', 'verifier', 'admin'],
        required: true
    },
    profile: {
        name: {
            type: String,
            required: true
        },
        institutionName: String,
        website: String,
        phoneNumber: String,
        verified: {
            type: Boolean,
            default: false
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema);