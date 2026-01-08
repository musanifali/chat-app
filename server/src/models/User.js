import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
    match: /^[a-zA-Z0-9_]+$/,
    index: true,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    maxlength: 150,
    default: '',
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  blocked: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  fcmTokens: [{
    type: String,
  }],
  mutedConversations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
  }],
}, {
  timestamps: true,
});

// Indexes
userSchema.index({ username: 'text', displayName: 'text' });

const User = mongoose.model('User', userSchema);

export default User;
