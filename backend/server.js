const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/credential-platform', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'issuer', 'student'], default: 'student' },
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
    institutionName: String,
    verified: { type: Boolean, default: false },
    verificationToken: String,
    createdAt: { type: Date, default: Date.now }
});

// Institution Schema
const institutionSchema = new mongoose.Schema({
    institutionName: { type: String, required: true },
    institutionType: { type: String, required: true },
    address: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    website: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    blockchainAddress: String,
    createdAt: { type: Date, default: Date.now }
});

// Credential Schema
const credentialSchema = new mongoose.Schema({
    credentialId: { type: String, unique: true, required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    issuingInstitution: { type: String, required: true },
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
    credentialType: { type: String, required: true },
    courseName: { type: String, required: true },
    grade: String,
    issueDate: { type: Date, required: true },
    expiryDate: Date,
    status: { type: String, enum: ['active', 'revoked', 'expired'], default: 'active' },
    blockchainHash: String,
    ipfsHash: String,
    metadata: {
        courseCode: String,
        credits: Number,
        gpa: Number,
        additionalInfo: String
    },
    createdAt: { type: Date, default: Date.now }
});

// Activity Log Schema
const activitySchema = new mongoose.Schema({
    type: { type: String, required: true },
    description: { type: String, required: true },
    actor: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    metadata: mongoose.Schema.Types.Mixed
});

const User = mongoose.model('User', userSchema);
const Institution = mongoose.model('Institution', institutionSchema);
const Credential = mongoose.model('Credential', credentialSchema);
const Activity = mongoose.model('Activity', activitySchema);

// Email configuration
const transporter = nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// JWT middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// AUTHENTICATION ROUTES

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, institutionName } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: role || 'student',
            institutionName,
            verificationToken
        });

        await user.save();

        // Send verification email
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify Your Email - Academic Credentials Platform',
            html: `
        <h2>Welcome to Academic Credentials Platform!</h2>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationLink}" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `
        });

        // Log activity
        await new Activity({
            type: 'user',
            description: 'New user registered',
            actor: `${firstName} ${lastName}`,
            metadata: { email, role }
        }).save();

        res.status(201).json({
            message: 'User registered successfully. Please check your email for verification.',
            userId: user._id
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
app.post('/api/auth/LandiingPage', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        if (!user.verified) {
            return res.status(400).json({ error: 'Please verify your email before logging in' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                institutionName: user.institutionName
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Verify Email
app.post('/api/auth/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired verification token' });
        }

        user.verified = true;
        user.verificationToken = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Email verification failed' });
    }
});

// INSTITUTION ROUTES

// Apply for institution
app.post('/api/institutions/apply', authenticateToken, async (req, res) => {
    try {
        const {
            institutionName,
            institutionType,
            address,
            contactEmail,
            contactPhone,
            website
        } = req.body;

        const institution = new Institution({
            institutionName,
            institutionType,
            address,
            contactEmail,
            contactPhone,
            website,
            adminUserId: req.user.userId
        });

        await institution.save();

        // Update user role to issuer
        await User.findByIdAndUpdate(req.user.userId, {
            role: 'issuer',
            institutionId: institution._id,
            institutionName
        });

        // Log activity
        await new Activity({
            type: 'institution',
            description: 'Institution application submitted',
            actor: institutionName,
            metadata: { institutionType }
        }).save();

        res.status(201).json({
            message: 'Institution application submitted successfully',
            institutionId: institution._id
        });
    } catch (error) {
        console.error('Institution application error:', error);
        res.status(500).json({ error: 'Institution application failed' });
    }
});

// Get pending institutions (Admin only)
app.get('/api/admin/institutions/pending', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const institutions = await Institution.find({ status: 'pending' }).populate('adminUserId', 'firstName lastName email');
        res.json({ data: institutions });
    } catch (error) {
        console.error('Get pending institutions error:', error);
        res.status(500).json({ error: 'Failed to fetch pending institutions' });
    }
});

// Approve institution (Admin only)
app.put('/api/admin/institutions/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const institution = await Institution.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        );

        if (!institution) {
            return res.status(404).json({ error: 'Institution not found' });
        }

        // Generate blockchain address for institution
        const blockchainAddress = crypto.randomBytes(20).toString('hex');
        institution.blockchainAddress = blockchainAddress;
        await institution.save();

        // Log activity
        await new Activity({
            type: 'institution',
            description: 'Institution approved',
            actor: req.user.email,
            metadata: { institutionName: institution.institutionName }
        }).save();

        res.json({ message: 'Institution approved successfully' });
    } catch (error) {
        console.error('Institution approval error:', error);
        res.status(500).json({ error: 'Institution approval failed' });
    }
});

// Reject institution (Admin only)
app.put('/api/admin/institutions/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const institution = await Institution.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        );

        if (!institution) {
            return res.status(404).json({ error: 'Institution not found' });
        }

        // Update user role back to student
        await User.findByIdAndUpdate(institution.adminUserId, {
            role: 'student',
            institutionId: undefined,
            institutionName: undefined
        });

        // Log activity
        await new Activity({
            type: 'institution',
            description: 'Institution rejected',
            actor: req.user.email,
            metadata: { institutionName: institution.institutionName }
        }).save();

        res.json({ message: 'Institution rejected' });
    } catch (error) {
        console.error('Institution rejection error:', error);
        res.status(500).json({ error: 'Institution rejection failed' });
    }
});

// CREDENTIAL ROUTES

// Issue credential
app.post('/api/credentials/issue', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'issuer') {
            return res.status(403).json({ error: 'Only approved institutions can issue credentials' });
        }

        const {
            studentEmail,
            credentialType,
            courseName,
            grade,
            issueDate,
            expiryDate,
            metadata
        } = req.body;

        // Find student
        const student = await User.findOne({ email: studentEmail });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Get issuer's institution
        const institution = await Institution.findOne({ adminUserId: req.user.userId });
        if (!institution || institution.status !== 'approved') {
            return res.status(403).json({ error: 'Institution not approved for issuing credentials' });
        }

        // Generate unique credential ID
        const credentialId = crypto.randomUUID();

        // Create credential hash for blockchain
        const credentialData = {
            credentialId,
            studentEmail,
            issuingInstitution: institution.institutionName,
            credentialType,
            courseName,
            issueDate
        };
        const blockchainHash = crypto.createHash('sha256').update(JSON.stringify(credentialData)).digest('hex');

        const credential = new Credential({
            credentialId,
            studentName: `${student.firstName} ${student.lastName}`,
            studentEmail,
            studentId: student._id,
            issuingInstitution: institution.institutionName,
            institutionId: institution._id,
            credentialType,
            courseName,
            grade,
            issueDate: new Date(issueDate),
            expiryDate: expiryDate ? new Date(expiryDate) : undefined,
            blockchainHash,
            metadata
        });

        await credential.save();

        // Send notification email to student
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: studentEmail,
            subject: 'New Credential Issued - Academic Credentials Platform',
            html: `
        <h2>New Credential Issued!</h2>
        <p>Dear ${student.firstName},</p>
        <p>A new credential has been issued to you:</p>
        <ul>
          <li><strong>Credential Type:</strong> ${credentialType}</li>
          <li><strong>Course:</strong> ${courseName}</li>
          <li><strong>Institution:</strong> ${institution.institutionName}</li>
          <li><strong>Issue Date:</strong> ${new Date(issueDate).toLocaleDateString()}</li>
        </ul>
        <p>You can view and share your credential through the platform.</p>
      `
        });

        // Log activity
        await new Activity({
            type: 'credential',
            description: 'New credential issued',
            actor: institution.institutionName,
            metadata: { studentEmail, credentialType, courseName }
        }).save();

        res.status(201).json({
            message: 'Credential issued successfully',
            credentialId: credential.credentialId
        });
    } catch (error) {
        console.error('Credential issuance error:', error);
        res.status(500).json({ error: 'Credential issuance failed' });
    }
});

// Verify credential
app.get('/api/credentials/verify/:credentialId', async (req, res) => {
    try {
        const { credentialId } = req.params;

        const credential = await Credential.findOne({ credentialId }).populate('institutionId');
        if (!credential) {
            return res.status(404).json({ error: 'Credential not found' });
        }

        // Verify blockchain hash
        const credentialData = {
            credentialId: credential.credentialId,
            studentEmail: credential.studentEmail,
            issuingInstitution: credential.issuingInstitution,
            credentialType: credential.credentialType,
            courseName: credential.courseName,
            issueDate: credential.issueDate
        };
        const computedHash = crypto.createHash('sha256').update(JSON.stringify(credentialData)).digest('hex');

        const isValid = computedHash === credential.blockchainHash && credential.status === 'active';

        res.json({
            valid: isValid,
            credential: {
                credentialId: credential.credentialId,
                studentName: credential.studentName,
                issuingInstitution: credential.issuingInstitution,
                credentialType: credential.credentialType,
                courseName: credential.courseName,
                issueDate: credential.issueDate,
                expiryDate: credential.expiryDate,
                status: credential.status
            },
            verificationDetails: {
                hashMatch: computedHash === credential.blockchainHash,
                statusActive: credential.status === 'active',
                verifiedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Credential verification error:', error);
        res.status(500).json({ error: 'Credential verification failed' });
    }
});

// Get user's credentials
app.get('/api/credentials/my', authenticateToken, async (req, res) => {
    try {
        const credentials = await Credential.find({ studentId: req.user.userId });
        res.json({ data: credentials });
    } catch (error) {
        console.error('Get credentials error:', error);
        res.status(500).json({ error: 'Failed to fetch credentials' });
    }
});

// Revoke credential (Admin only)
app.put('/api/admin/credentials/:id/revoke', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const credential = await Credential.findByIdAndUpdate(
            req.params.id,
            { status: 'revoked' },
            { new: true }
        );

        if (!credential) {
            return res.status(404).json({ error: 'Credential not found' });
        }

        // Log activity
        await new Activity({
            type: 'credential',
            description: 'Credential revoked',
            actor: req.user.email,
            metadata: { credentialId: credential.credentialId, studentEmail: credential.studentEmail }
        }).save();

        res.json({ message: 'Credential revoked successfully' });
    } catch (error) {
        console.error('Credential revocation error:', error);
        res.status(500).json({ error: 'Credential revocation failed' });
    }
});

// ADMIN ROUTES

// Get admin stats
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [totalUsers, approvedInstitutions, totalCredentials, pendingInstitutions, recentActivity] = await Promise.all([
            User.countDocuments(),
            Institution.countDocuments({ status: 'approved' }),
            Credential.countDocuments(),
            Institution.countDocuments({ status: 'pending' }),
            Activity.find().sort({ timestamp: -1 }).limit(10)
        ]);

        res.json({
            data: {
                totalUsers,
                approvedInstitutions,
                totalCredentials,
                pendingInstitutions,
                recentActivity
            }
        });
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});

// Get all users (Admin only)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password -verificationToken');
        res.json({ data: users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get all credentials (Admin only)
app.get('/api/admin/credentials', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const credentials = await Credential.find();
        res.json({ data: credentials });
    } catch (error) {
        console.error('Get credentials error:', error);
        res.status(500).json({ error: 'Failed to fetch credentials' });
    }
});

// Delete user (Admin only)
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ error: 'Cannot delete admin users' });
        }

        await User.findByIdAndDelete(req.params.id);

        // Log activity
        await new Activity({
            type: 'user',
            description: 'User deleted',
            actor: req.user.email,
            metadata: { deletedUser: `${user.firstName} ${user.lastName}`, email: user.email }
        }).save();

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Academic Credentials Platform API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});