import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-firebaseUid -__v');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { displayName, bio, username } = req.body;
    const updates = {};

    if (displayName) updates.displayName = displayName;
    if (bio !== undefined) updates.bio = bio;
    if (username) {
      // Check username availability
      const existingUser = await User.findOne({ 
        username: username.toLowerCase(),
        _id: { $ne: req.userId }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      updates.username = username.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-firebaseUid -__v');

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'friendchat/avatars',
          transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'face' },
            { quality: 'auto' }
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Update user
    const user = await User.findByIdAndUpdate(
      req.userId,
      { avatarUrl: result.secure_url },
      { new: true }
    ).select('-firebaseUid -__v');

    res.json({ message: 'Avatar uploaded', avatarUrl: result.secure_url, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.userId } },
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { displayName: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
          ],
        },
      ],
    })
    .select('username displayName avatarUrl isOnline lastSeen')
    .limit(20);

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('username displayName avatarUrl bio isOnline lastSeen');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if blocked
    const currentUser = await User.findById(req.userId);
    if (currentUser.blocked.includes(user._id)) {
      return res.status(403).json({ error: 'User is blocked' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
