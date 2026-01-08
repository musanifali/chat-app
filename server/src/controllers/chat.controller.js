import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId,
    })
    .populate('participants', 'username displayName avatarUrl isOnline lastSeen')
    .populate('lastMessage.sender', 'username displayName')
    .sort('-updatedAt');

    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createOrGetConversation = async (req, res) => {
  try {
    const { userId } = req.body;

    // Check if users are friends
    const currentUser = await User.findById(req.userId);
    if (!currentUser.friends.includes(userId)) {
      return res.status(403).json({ error: 'Can only chat with friends' });
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, userId], $size: 2 },
    }).populate('participants', 'username displayName avatarUrl isOnline lastSeen');

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [req.userId, userId],
      });
      await conversation.save();
      await conversation.populate('participants', 'username displayName avatarUrl isOnline lastSeen');
    }

    res.json({ conversation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: id,
      participants: req.userId,
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await Message.find({
      conversationId: id,
      deletedForEveryone: false,
      deletedFor: { $ne: req.userId },
    })
    .populate('sender', 'username displayName avatarUrl')
    .populate('replyTo')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const count = await Message.countDocuments({
      conversationId: id,
      deletedForEveryone: false,
      deletedFor: { $ne: req.userId },
    });

    res.json({
      messages: messages.reverse(),
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, type = 'text', replyTo, audioDuration } = req.body;

    // Verify conversation
    const conversation = await Conversation.findOne({
      _id: id,
      participants: req.userId,
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const message = new Message({
      conversationId: id,
      sender: req.userId,
      type,
      content,
      audioDuration: type === 'audio' ? audioDuration : null,
      replyTo: replyTo || null,
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = {
      text: type === 'text' ? content : type === 'image' ? 'Image' : 'Voice message',
      sender: req.userId,
      timestamp: new Date(),
    };
    conversation.updatedAt = new Date();
    await conversation.save();

    await message.populate('sender', 'username displayName avatarUrl');
    if (replyTo) {
      await message.populate('replyTo');
    }

    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const message = await Message.findOne({
      _id: id,
      sender: req.userId,
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if within 15 minutes
    const fifteenMinutes = 15 * 60 * 1000;
    if (Date.now() - message.createdAt.getTime() > fifteenMinutes) {
      return res.status(403).json({ error: 'Can only edit messages within 15 minutes' });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    res.json({ message: 'Message edited', message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { forEveryone = false } = req.body;

    const message = await Message.findOne({
      _id: id,
      sender: req.userId,
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (forEveryone) {
      message.deletedForEveryone = true;
    } else {
      message.deletedFor.push(req.userId);
    }

    await message.save();

    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sender.toString() !== req.userId.toString()) {
      message.status = 'read';
      await message.save();
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const muteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { mute } = req.body;

    const conversation = await Conversation.findOne({
      _id: id,
      participants: req.userId,
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (mute) {
      conversation.mutedBy.addToSet(req.userId);
    } else {
      conversation.mutedBy.pull(req.userId);
    }

    await conversation.save();

    res.json({ message: mute ? 'Conversation muted' : 'Conversation unmuted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
