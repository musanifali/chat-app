import jwt from 'jsonwebtoken';
import { verifyFirebaseToken } from '../middleware/auth.js';
import User from '../models/User.js';

export const register = async (req, res) => {
  try {
    const { firebaseToken, username, displayName } = req.body;

    // Verify Firebase token
    const decodedToken = await verifyFirebaseToken(firebaseToken);
    const { uid, email } = decodedToken;

    // Check if user already exists
    let user = await User.findOne({ firebaseUid: uid });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Check username availability
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Create new user
    user = new User({
      firebaseUid: uid,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      displayName,
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, firebaseUid: uid },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    // Verify Firebase token
    const decodedToken = await verifyFirebaseToken(firebaseToken);
    const { uid } = decodedToken;

    // Find user
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, firebaseUid: uid },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    // Update user status
    await User.findByIdAndUpdate(req.userId, {
      isOnline: false,
      lastSeen: new Date(),
    });

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-__v');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
