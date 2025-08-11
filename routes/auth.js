const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'durjogprohori@gmail.com',
    pass: 'hyau loeq okwp wuqq'
  }
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Generate verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Middleware to verify token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.resolve(__dirname, '../client/src/components/user/Image');
    console.log('Upload directory:', uploadDir);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename while preserving the original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = uniqueSuffix + ext;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Register user
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { name, email } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    console.log('Generated verification code:', verificationCode);

    // Store user data temporarily
    const tempUserData = {
      name,
      email,
      verificationCode,
      verificationCodeTimestamp: new Date()
    };

    // Send verification email
    try {
      const mailOptions = {
        from: '"দুর্যোগ প্রহরী" <durjogprohori@gmail.com>',
        to: email,
        subject: 'Email Verification - দুর্যোগ প্রহরী',
        html: `
          <h1>Email Verification</h1>
          <p>Your verification code is: <strong>${verificationCode}</strong></p>
          <p>This code will expire in 10 minutes.</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('Verification email sent successfully');

      // Store temp user data in session or cache
      req.app.locals.tempUsers = req.app.locals.tempUsers || {};
      req.app.locals.tempUsers[email] = tempUserData;

      res.json({ 
        success: true, 
        message: 'Please verify your email to complete registration.',
        email: email
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({ 
        message: 'Failed to send verification email. Please try again.',
        error: emailError.message 
      });
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    // Get temp user data
    const tempUserData = req.app.locals.tempUsers?.[email];
    if (!tempUserData) {
      return res.status(400).json({ message: 'Verification session expired. Please register again.' });
    }

    // Check verification code
    if (tempUserData.verificationCode !== verificationCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Check if code is expired (10 minutes)
    const codeAge = (Date.now() - tempUserData.verificationCodeTimestamp) / 1000 / 60;
    if (codeAge > 10) {
      // Clean up expired temp data
      delete req.app.locals.tempUsers[email];
      return res.status(400).json({ message: 'Verification code expired. Please register again.' });
    }

    // Create and save verified user
    const user = new User({
      name: tempUserData.name,
      email: tempUserData.email,
      createdAt: new Date(),
      isVerified: true,
      verificationCode: tempUserData.verificationCode,
      verificationCodeTimestamp: tempUserData.verificationCodeTimestamp
    });

    await user.save();

    // Clean up temp data
    delete req.app.locals.tempUsers[email];

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ 
      success: true, 
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Login attempt for:', email);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Found user:', {
      id: user._id,
      email: user.email,
      isVerified: user.isVerified
    });

    // Check if user is verified
    if (!user.isVerified) {
      console.log('User not verified:', email);
      return res.status(400).json({ 
        message: 'Please verify your email before logging in',
        needsVerification: true 
      });
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log('Login successful for:', email);

    res.json({ 
      success: true, 
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        phone_number: user.phone_number,
        is_phone_verified: user.is_phone_verified,
        email: user.email,
        is_email_verified: user.is_email_verified,
        address: user.address,
        blood_type: user.blood_type,
        profileImage: user.profileImage,
        online: user.online,
        lastActive: user.lastActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send phone OTP
router.post('/send-phone-otp', auth, async (req, res) => {
  try {
    const { phone } = req.body;
    
    // Generate OTP
    const otp = generateVerificationCode();
    
    // Store OTP with user ID to ensure it belongs to the correct user
    req.app.locals.phoneOTPs = req.app.locals.phoneOTPs || {};
    req.app.locals.phoneOTPs[`${req.user.id}_${phone}`] = {
      otp,
      phone,
      timestamp: new Date(),
      userId: req.user.id
    };

    // In a real application, you would send this OTP via SMS
    console.log(`Phone OTP for ${phone}: ${otp}`);

    res.json({ 
      success: true, 
      message: 'OTP sent successfully'
    });
  } catch (err) {
    console.error('Error sending phone OTP:', err);
    res.status(500).json({ message: 'Error sending OTP' });
  }
});

// Verify phone OTP
router.post('/verify-phone-otp', auth, async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    // Get stored OTP data using user ID and phone
    const storedData = req.app.locals.phoneOTPs?.[`${req.user.id}_${phone}`];
    if (!storedData) {
      return res.status(400).json({ message: 'OTP expired or not found' });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if OTP is expired (10 minutes)
    const otpAge = (Date.now() - storedData.timestamp) / 1000 / 60;
    if (otpAge > 10) {
      delete req.app.locals.phoneOTPs[`${req.user.id}_${phone}`];
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Clean up used OTP
    delete req.app.locals.phoneOTPs[`${req.user.id}_${phone}`];

    res.json({ 
      success: true, 
      message: 'Phone number verified successfully' 
    });
  } catch (err) {
    console.error('Error verifying phone OTP:', err);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
});

// Send email OTP for email change
router.post('/send-email-otp', auth, async (req, res) => {
  try {
    const { newEmail } = req.body;
    
    // Generate OTP
    const emailOTP = generateVerificationCode();
    
    // Store OTP with user ID
    req.app.locals.emailOTPs = req.app.locals.emailOTPs || {};
    req.app.locals.emailOTPs[`${req.user.id}_${newEmail}`] = {
      emailOTP,
      timestamp: new Date(),
      userId: req.user.id
    };

    console.log(`Email OTP for ${newEmail}: ${emailOTP}`);

    // Send OTP to new email
    try {
      await transporter.sendMail({
        from: '"দুর্যোগ প্রহরী" <durjogprohori@gmail.com>',
        to: newEmail,
        subject: 'Email Verification - দুর্যোগ প্রহরী',
        html: `
          <h1>Email Verification</h1>
          <p>Your verification code is: <strong>${emailOTP}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this change, please ignore this email.</p>
        `
      });
      
      res.json({ 
        success: true, 
        message: 'OTP sent successfully to your email' 
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({ 
        message: 'Failed to send verification email. Please try again.',
        error: emailError.message 
      });
    }
  } catch (err) {
    console.error('Error sending email OTP:', err);
    res.status(500).json({ message: 'Error sending OTP' });
  }
});

// Verify email OTP for email change
router.post('/verify-email-otp', auth, async (req, res) => {
  try {
    const { newEmail, emailOTP } = req.body;
    
    // Get stored OTP data using user ID
    const storedData = req.app.locals.emailOTPs?.[`${req.user.id}_${newEmail}`];
    if (!storedData) {
      return res.status(400).json({ message: 'OTP expired or not found' });
    }

    // Verify OTP
    if (storedData.emailOTP !== emailOTP) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if OTP is expired (10 minutes)
    const otpAge = (Date.now() - storedData.timestamp) / 1000 / 60;
    if (otpAge > 10) {
      delete req.app.locals.emailOTPs[`${req.user.id}_${newEmail}`];
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Clean up used OTP
    delete req.app.locals.emailOTPs[`${req.user.id}_${newEmail}`];

    // Check if email already exists
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser && existingUser._id.toString() !== req.user.id) {
      return res.status(400).json({ message: 'Email already in use by another account' });
    }

    // Update user's email
    await User.findByIdAndUpdate(
      req.user.id,
      { 
        $set: { 
          email: newEmail,
          is_email_verified: true 
        } 
      }
    );

    res.json({ 
      success: true, 
      message: 'Email verified successfully' 
    });
  } catch (err) {
    console.error('Error verifying email OTP:', err);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
});

// Update user profile
router.put('/update-profile', auth, async (req, res) => {
  try {
    const { name, email, username, address, blood_type } = req.body;
    console.log('Update profile request received:', { name, email, username, address, blood_type });
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Current user blood type:', user.blood_type);
    
    // Check if username already exists (only if username is being updated)
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ 
        username,
        _id: { $ne: req.user.id }
      });
      
      if (usernameExists) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }
    
    // Update basic fields if provided
    if (name) user.name = name;
    if (address !== undefined) user.address = address;
    
    // Validate and update blood type
    if (blood_type !== undefined) {
      const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''];
      if (blood_type === '' || validBloodTypes.includes(blood_type)) {
        console.log('Setting blood type to:', blood_type || null);
        user.blood_type = blood_type || null;
      } else {
        return res.status(400).json({ message: 'Invalid blood type value' });
      }
    }
    
    // For email updates, only update if email changed
    if (email && email !== user.email) {
      user.email = email;
      user.is_email_verified = false; // Require verification for new email
    }
    
    await user.save();
    console.log('User saved successfully. Updated blood type:', user.blood_type);
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        phone_number: user.phone_number,
        is_phone_verified: user.is_phone_verified,
        email: user.email,
        is_email_verified: user.is_email_verified,
        address: user.address,
        blood_type: user.blood_type,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Error updating profile',
      details: error.message
    });
  }
});

// Upload profile image
router.post('/upload-profile-image', auth, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Check if user is in edit mode (should be passed in the request)
    const isEditing = req.body.isEditing === 'true';
    if (!isEditing) {
      // Delete the uploaded file since we're not going to use it
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ message: 'Profile can only be updated in edit mode' });
    }

    // Delete old profile image if it exists
    if (req.user.profileImage) {
      const oldImagePath = path.join(__dirname, '../client/src/components/user/Image', path.basename(req.user.profileImage));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Store only the filename in the database
    const filename = path.basename(req.file.path);

    // Update user profile with new image filename
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profileImage: filename } },
      { new: true }
    );

    if (!user) {
      // Delete the uploaded file if user not found
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      imageUrl: `/api/auth/profile-image/${filename}`,
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        phone_number: user.phone_number,
        is_phone_verified: user.is_phone_verified,
        email: user.email,
        is_email_verified: user.is_email_verified,
        address: user.address,
        blood_type: user.blood_type,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    // Clean up uploaded file in case of error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error uploading profile image:', err);
    res.status(500).json({ 
      message: 'Error uploading profile image',
      details: err.message 
    });
  }
});

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map();

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP route
router.post('/send-otp', async (req, res) => {
  try {
    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with phone number (expires in 5 minutes)
    otpStore.set(phone_number, {
      otp,
      createdAt: new Date()
    });

    // In production, integrate with SMS service to send OTP
    console.log(`OTP for ${phone_number}: ${otp}`);

    // For development, we'll just return success
    res.json({ message: 'OTP sent successfully' });

    // Clean up OTP after 5 minutes
    setTimeout(() => {
      otpStore.delete(phone_number);
    }, 5 * 60 * 1000);

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
});

// Verify OTP route
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone_number, otp, username, name } = req.body;
    console.log('Received verify OTP request:', { phone_number, otp, username, name });

    if (!phone_number || !otp) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    const storedOTP = otpStore.get(phone_number);
    console.log('Stored OTP data:', storedOTP);

    if (!storedOTP) {
      console.log('No OTP found for phone number:', phone_number);
      return res.status(400).json({ message: 'OTP expired or not found' });
    }

    if (storedOTP.otp !== otp) {
      console.log('OTP mismatch. Expected:', storedOTP.otp, 'Received:', otp);
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if 5 minutes have passed since OTP generation
    const now = new Date();
    const otpAge = now - storedOTP.createdAt;
    if (otpAge > 5 * 60 * 1000) {
      console.log('OTP expired. Age:', otpAge / 1000, 'seconds');
      otpStore.delete(phone_number);
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Find or create user
    console.log('Looking for existing user with phone number:', phone_number);
    let user = await User.findOne({ phone_number });

    if (!user) {
      console.log('No existing user found, checking if registration data provided');
      
      // If new user but username and name not provided, return with needsRegistration flag
      if (!username || !name) {
        console.log('New user needs to provide username and name');
        // Clear OTP from store, but keep verification state temporarily
        otpStore.set(phone_number, {
          otp: storedOTP.otp,
          createdAt: storedOTP.createdAt,
          verified: true
        });
        
        return res.status(200).json({
          success: true,
          needsRegistration: true,
          message: 'OTP verified. Please provide username and name to complete registration.'
        });
      }
      
      // Check if username is already taken
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        console.log('Username already exists:', username);
        return res.status(400).json({ 
          message: 'Username already taken. Please choose another username.',
          needsRegistration: true
        });
      }
      
      console.log('Creating new user with username and name');
      // Create a new user object with a unique default email
      const uniqueDefaultEmail = `${phone_number}.durjogprohori@gmail.com`;
      const newUser = {
        username,
        name,
        phone_number,
        is_phone_verified: true,
        phone_verificationCode: otp,
        email: uniqueDefaultEmail,
        is_email_verified: false,
        email_verificationCode: '',
        address: null,
        blood_type: null,
        createdAt: new Date()
      };
      
      user = new User(newUser);

      try {
        console.log('Attempting to save new user:', user);
        await user.save();
        console.log('User saved successfully');
      } catch (saveError) {
        console.error('Error saving user:', {
          error: saveError.message,
          code: saveError.code,
          stack: saveError.stack
        });
        return res.status(500).json({ 
          message: 'Error creating user account',
          details: saveError.message
        });
      }
    } else {
      console.log('Updating existing user');
      user.is_phone_verified = true;
      user.phone_verificationCode = otp;
      try {
        await user.save();
        console.log('User updated successfully');
      } catch (saveError) {
        console.error('Error updating user:', {
          error: saveError.message,
          code: saveError.code,
          stack: saveError.stack
        });
        return res.status(500).json({ 
          message: 'Error updating user account',
          details: saveError.message
        });
      }
    }

    // Generate JWT token
    console.log('Generating JWT token for user:', user._id);
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Clear OTP
    otpStore.delete(phone_number);
    console.log('OTP cleared from store');

    const responseData = {
      token,
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        phone_number: user.phone_number,
        is_phone_verified: user.is_phone_verified,
        phone_verificationCode: user.phone_verificationCode,
        email: user.email,
        is_email_verified: user.is_email_verified,
        email_verificationCode: user.email_verificationCode,
        address: user.address,
        createdAt: user.createdAt,
        online: user.online,
        lastActive: user.lastActive
      }
    };
    console.log('Sending success response:', responseData);

    res.json(responseData);

  } catch (error) {
    console.error('Verify OTP error:', {
      error: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Error verifying OTP',
      details: error.message
    });
  }
});

// Complete registration after OTP verification
router.post('/complete-registration', async (req, res) => {
  try {
    const { phone_number, username, name } = req.body;
    
    if (!phone_number || !username || !name) {
      return res.status(400).json({ 
        message: 'Phone number, username and name are required' 
      });
    }
    
    // Check if user's OTP was verified
    const storedData = otpStore.get(phone_number);
    if (!storedData || !storedData.verified) {
      return res.status(400).json({ 
        message: 'Phone verification required before registration' 
      });
    }
    
    // Check if phone number already exists
    const phoneExists = await User.findOne({ phone_number });
    if (phoneExists) {
      return res.status(400).json({ 
        message: 'Phone number already registered' 
      });
    }
    
    // Check if username is already taken
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ 
        message: 'Username already taken. Please choose another username.' 
      });
    }
    
    // Create a new user
    const uniqueDefaultEmail = `${phone_number}.durjogprohori@gmail.com`;
    const user = new User({
      username,
      name,
      phone_number,
      is_phone_verified: true,
      phone_verificationCode: storedData.otp,
      email: uniqueDefaultEmail,
      is_email_verified: false,
      email_verificationCode: '',
      address: null,
      createdAt: new Date()
    });
    
    await user.save();
    
    // Clear OTP store
    otpStore.delete(phone_number);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        phone_number: user.phone_number,
        is_phone_verified: user.is_phone_verified,
        email: user.email,
        is_email_verified: user.is_email_verified,
        address: user.address,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('Complete registration error:', error);
    res.status(500).json({ 
      message: 'Error completing registration',
      details: error.message 
    });
  }
});

// Serve profile images
router.get('/profile-image/:filename', (req, res) => {
  const { filename } = req.params;
  const imagePath = path.resolve(__dirname, '../client/src/components/user/Image', filename);
  
  console.log('Requested image path:', imagePath);
  
  // Check if file exists
  if (fs.existsSync(imagePath)) {
    return res.sendFile(imagePath);
  } else {
    console.log('Image not found at path:', imagePath);
    return res.status(404).json({ message: 'Image not found' });
  }
});

module.exports = router; 