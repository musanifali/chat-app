import mongoose from 'mongoose';

const friendRequestSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  },
  respondedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Compound indexes
friendRequestSchema.index({ from: 1, to: 1 });
friendRequestSchema.index({ to: 1, status: 1 });

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

export default FriendRequest;
