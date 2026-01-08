import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

const userSockets = new Map(); // userId -> socketId mapping

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Store socket mapping
    userSockets.set(socket.userId, socket.id);

    // Update user online status
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date(),
    });

    // Notify friends that user is online
    const user = await User.findById(socket.userId).populate('friends', '_id');
    user.friends.forEach((friend) => {
      const friendSocketId = userSockets.get(friend._id.toString());
      if (friendSocketId) {
        io.to(friendSocketId).emit('userOnline', { userId: socket.userId });
      }
    });

    // Join user's personal room
    socket.join(socket.userId);

    // Handle get online users request
    socket.on('getOnlineUsers', () => {
      const onlineUserIds = Array.from(userSockets.keys());
      console.log(`Sending online users list to ${socket.userId}:`, onlineUserIds);
      socket.emit('onlineUsersList', { userIds: onlineUserIds });
    });

    // Automatically send online users list on connection (after handler is set up)
    setImmediate(() => {
      const onlineUserIds = Array.from(userSockets.keys());
      console.log(`Auto-sending online users list to ${socket.userId}:`, onlineUserIds);
      socket.emit('onlineUsersList', { userIds: onlineUserIds });
    });

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      try {
        const { conversationId, content, type = 'text', replyTo, audioDuration } = data;

        // Verify conversation
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.userId,
        });

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Create message
        const message = new Message({
          conversationId,
          sender: socket.userId,
          type,
          content,
          audioDuration: type === 'audio' ? audioDuration : null,
          replyTo: replyTo || null,
        });

        await message.save();

        // Update conversation
        conversation.lastMessage = {
          text: type === 'text' ? content : type === 'image' ? 'Image' : 'Voice message',
          sender: socket.userId,
          timestamp: new Date(),
        };
        conversation.updatedAt = new Date();
        await conversation.save();

        await message.populate('sender', 'username displayName avatarUrl');
        if (replyTo) {
          await message.populate('replyTo');
        }

        // Send to all participants
        conversation.participants.forEach((participantId) => {
          const participantSocketId = userSockets.get(participantId.toString());
          if (participantSocketId) {
            io.to(participantSocketId).emit('newMessage', {
              message,
              conversation,
            });
          }
        });

        // Update message status to delivered for online users
        const otherParticipant = conversation.participants.find(
          (p) => p.toString() !== socket.userId
        );
        if (userSockets.has(otherParticipant.toString())) {
          message.status = 'delivered';
          await message.save();
          socket.emit('messageDelivered', { 
            messageId: message._id,
            conversationId: conversationId 
          });
          
          // Also emit delivered to the recipient so they can auto-mark as read
          const recipientSocketId = userSockets.get(otherParticipant.toString());
          if (recipientSocketId) {
            io.to(recipientSocketId).emit('messageDelivered', { 
              messageId: message._id,
              conversationId: conversationId,
              autoRead: true  // Flag to indicate should auto-mark as read
            });
          }
        }
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Handle typing indicator
    socket.on('typing', async (data) => {
      try {
        const { conversationId } = data;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        // Notify other participant
        const otherParticipant = conversation.participants.find(
          (p) => p.toString() !== socket.userId
        );
        const otherSocketId = userSockets.get(otherParticipant.toString());
        if (otherSocketId) {
          io.to(otherSocketId).emit('userTyping', {
            userId: socket.userId,
            conversationId,
          });
        }
      } catch (error) {
        console.error('Typing error:', error);
      }
    });

    // Handle stop typing
    socket.on('stopTyping', async (data) => {
      try {
        const { conversationId } = data;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const otherParticipant = conversation.participants.find(
          (p) => p.toString() !== socket.userId
        );
        const otherSocketId = userSockets.get(otherParticipant.toString());
        if (otherSocketId) {
          io.to(otherSocketId).emit('userStoppedTyping', {
            userId: socket.userId,
            conversationId,
          });
        }
      } catch (error) {
        console.error('Stop typing error:', error);
      }
    });

    // Handle message read
    socket.on('messageRead', async (data) => {
      try {
        const { messageId, conversationId } = data;

        const message = await Message.findById(messageId);
        if (!message || message.sender.toString() === socket.userId) return;

        message.status = 'read';
        await message.save();

        // Notify sender
        const senderSocketId = userSockets.get(message.sender.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit('messageRead', {
            messageId,
            conversationId,
            readBy: socket.userId,
          });
        }
      } catch (error) {
        console.error('Message read error:', error);
      }
    });

    // Handle marking all messages in conversation as read
    socket.on('markConversationRead', async (data) => {
      try {
        const { conversationId } = data;

        // Find all unread messages in this conversation that were sent to this user
        const unreadMessages = await Message.find({
          conversationId,
          sender: { $ne: socket.userId },
          status: { $in: ['sent', 'delivered'] }
        });

        if (unreadMessages.length === 0) return;

        // Update all to read
        await Message.updateMany(
          {
            conversationId,
            sender: { $ne: socket.userId },
            status: { $in: ['sent', 'delivered'] }
          },
          { status: 'read' }
        );

        // Notify sender for each message
        unreadMessages.forEach(async (message) => {
          const senderSocketId = userSockets.get(message.sender.toString());
          if (senderSocketId) {
            io.to(senderSocketId).emit('messageRead', {
              messageId: message._id,
              conversationId,
              readBy: socket.userId,
            });
          }
        });

        console.log(`Marked ${unreadMessages.length} messages as read in conversation ${conversationId}`);
      } catch (error) {
        console.error('Mark conversation read error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.userId}`);

      userSockets.delete(socket.userId);

      // Update user status
      const lastSeen = new Date();
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen,
      });

      // Notify friends
      const user = await User.findById(socket.userId).populate('friends', '_id');
      user.friends.forEach((friend) => {
        const friendSocketId = userSockets.get(friend._id.toString());
        if (friendSocketId) {
          io.to(friendSocketId).emit('userOffline', {
            userId: socket.userId,
            lastSeen,
          });
        }
      });
    });
  });

  return io;
};

export { userSockets };
