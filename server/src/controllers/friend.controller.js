import FriendRequest from '../models/FriendRequest.js';
import User from '../models/User.js';

export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friends', 'username displayName avatarUrl isOnline lastSeen');

    res.json({ friends: user.friends });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;

    if (userId === req.userId.toString()) {
      return res.status(400).json({ error: 'Cannot send request to yourself' });
    }

    // Check if user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if blocked
    if (targetUser.blocked.includes(req.userId)) {
      return res.status(403).json({ error: 'Cannot send request to this user' });
    }

    // Check if already friends
    const currentUser = await User.findById(req.userId);
    if (currentUser.friends.includes(userId)) {
      return res.status(400).json({ error: 'Already friends' });
    }

    // Check for existing request
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { from: req.userId, to: userId, status: 'pending' },
        { from: userId, to: req.userId, status: 'pending' },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Friend request already exists' });
    }

    // Create request
    const friendRequest = new FriendRequest({
      from: req.userId,
      to: userId,
    });

    await friendRequest.save();

    const populatedRequest = await FriendRequest.findById(friendRequest._id)
      .populate('from', 'username displayName avatarUrl')
      .populate('to', 'username displayName avatarUrl');

    // Emit socket event (will be handled by socket server)
    req.io?.to(userId).emit('friendRequest', {
      request: populatedRequest,
      fromUser: currentUser,
    });

    res.status(201).json({ message: 'Friend request sent', request: populatedRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      to: req.userId,
      status: 'pending',
    })
    .populate('from', 'username displayName avatarUrl')
    .sort('-createdAt');

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const respondToRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'decline'

    const friendRequest = await FriendRequest.findOne({
      _id: id,
      to: req.userId,
      status: 'pending',
    });

    if (!friendRequest) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    friendRequest.status = action === 'accept' ? 'accepted' : 'declined';
    friendRequest.respondedAt = new Date();
    await friendRequest.save();

    if (action === 'accept') {
      // Add to friends list
      await User.findByIdAndUpdate(req.userId, {
        $addToSet: { friends: friendRequest.from },
      });
      await User.findByIdAndUpdate(friendRequest.from, {
        $addToSet: { friends: req.userId },
      });

      const user = await User.findById(req.userId)
        .select('username displayName avatarUrl');

      // Emit socket event
      req.io?.to(friendRequest.from.toString()).emit('friendRequestAccepted', { user });
    }

    res.json({ message: `Friend request ${action}ed`, request: friendRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await FriendRequest.findOneAndDelete({
      _id: id,
      from: req.userId,
      status: 'pending',
    });

    if (!result) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    res.json({ message: 'Friend request canceled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndUpdate(req.userId, {
      $pull: { friends: id },
    });
    await User.findByIdAndUpdate(id, {
      $pull: { friends: req.userId },
    });

    res.json({ message: 'Friend removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Remove from friends if they are friends
    await User.findByIdAndUpdate(req.userId, {
      $pull: { friends: id },
      $addToSet: { blocked: id },
    });
    await User.findByIdAndUpdate(id, {
      $pull: { friends: req.userId },
    });

    res.json({ message: 'User blocked' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndUpdate(req.userId, {
      $pull: { blocked: id },
    });

    res.json({ message: 'User unblocked' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
