import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { sendPushToUser } from '../controllers/notification.controller.js';

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

        // Check if recipient is offline and send push notification
        const otherParticipant = conversation.participants.find(
          (p) => p.toString() !== socket.userId
        );
        
        const isRecipientOnline = userSockets.has(otherParticipant.toString());
        
        if (!isRecipientOnline) {
          // Recipient is offline - send push notification
          const sender = await User.findById(socket.userId);
          const notificationPayload = {
            type: 'message',
            title: sender.displayName || sender.username,
            body: type === 'text' ? content : type === 'image' ? '📷 Image' : '🎤 Voice message',
            icon: sender.avatarUrl || '/icon-192x192.png',
            data: {
              conversationId: conversationId,
              messageId: message._id.toString(),
              senderId: socket.userId,
              senderName: sender.displayName || sender.username,
              senderAvatar: sender.avatarUrl,
            },
            url: `/?chat=${conversationId}`,
          };
          
          // Send push notification
          sendPushToUser(otherParticipant.toString(), notificationPayload).catch(err => {
            console.error('Failed to send push notification:', err);
          });
        }

        // Update message status to delivered for online users
        if (isRecipientOnline) {
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

    // Handle message reactions
    socket.on('messageReaction', async (data) => {
      try {
        const { messageId, emoji, action } = data; // action: 'add' or 'remove'
        
        const message = await Message.findById(messageId).populate('sender', '_id displayName');
        
        if (!message) {
          return socket.emit('error', { message: 'Message not found' });
        }

        // Find or create reaction entry for this emoji
        let reactionEntry = message.reactions.find(r => r.emoji === emoji);

        if (action === 'add') {
          if (!reactionEntry) {
            // Create new reaction entry
            message.reactions.push({
              emoji,
              users: [socket.userId]
            });
          } else {
            // Add user to existing reaction if not already there
            if (!reactionEntry.users.includes(socket.userId)) {
              reactionEntry.users.push(socket.userId);
            }
          }
        } else if (action === 'remove') {
          if (reactionEntry) {
            // Remove user from reaction
            reactionEntry.users = reactionEntry.users.filter(
              userId => userId.toString() !== socket.userId
            );
            
            // Remove reaction entry if no users left
            if (reactionEntry.users.length === 0) {
              message.reactions = message.reactions.filter(r => r.emoji !== emoji);
            }
          }
        }

        await message.save();

        // Emit updated reactions to all participants in the conversation
        const conversation = await Conversation.findById(message.conversationId);
        
        const reactionUpdate = {
          messageId: message._id,
          conversationId: message.conversationId,
          reactions: message.reactions,
        };

        conversation.participants.forEach((participantId) => {
          const participantSocketId = userSockets.get(participantId.toString());
          if (participantSocketId) {
            io.to(participantSocketId).emit('messageReactionUpdate', reactionUpdate);
          }
        });

        console.log(`💖 Reaction ${action}: ${emoji} on message ${messageId} by ${socket.userId}`);
      } catch (error) {
        console.error('Message reaction error:', error);
        socket.emit('error', { message: 'Failed to update reaction' });
      }
    });

    // Handle message editing
    socket.on('editMessage', async (data) => {
      try {
        const { messageId, newContent } = data;

        const message = await Message.findById(messageId);

        if (!message) {
          return socket.emit('error', { message: 'Message not found' });
        }

        // Verify the user is the sender
        if (message.sender.toString() !== socket.userId) {
          return socket.emit('error', { message: 'Unauthorized to edit this message' });
        }

        // Only allow editing text messages
        if (message.type !== 'text') {
          return socket.emit('error', { message: 'Can only edit text messages' });
        }

        // Update message
        message.content = newContent;
        message.isEdited = true;
        message.editedAt = new Date();
        await message.save();

        // Notify all participants
        const conversation = await Conversation.findById(message.conversationId);
        
        const messageUpdate = {
          messageId: message._id,
          conversationId: message.conversationId,
          content: message.content,
          isEdited: true,
          editedAt: message.editedAt,
        };

        conversation.participants.forEach((participantId) => {
          const participantSocketId = userSockets.get(participantId.toString());
          if (participantSocketId) {
            io.to(participantSocketId).emit('messageEdited', messageUpdate);
          }
        });

        console.log(`✏️ Message edited: ${messageId} by ${socket.userId}`);
      } catch (error) {
        console.error('Message edit error:', error);
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    // Handle message deletion
    socket.on('deleteMessage', async (data) => {
      try {
        const { messageId, deleteForEveryone } = data;

        const message = await Message.findById(messageId);

        if (!message) {
          return socket.emit('error', { message: 'Message not found' });
        }

        // Verify the user is the sender
        if (message.sender.toString() !== socket.userId) {
          return socket.emit('error', { message: 'Unauthorized to delete this message' });
        }

        const conversation = await Conversation.findById(message.conversationId);

        if (deleteForEveryone) {
          // Delete for everyone
          message.deletedForEveryone = true;
          message.content = 'This message was deleted';
          message.type = 'text';
          await message.save();

          // Notify all participants
          const deletionUpdate = {
            messageId: message._id,
            conversationId: message.conversationId,
            deletedForEveryone: true,
          };

          conversation.participants.forEach((participantId) => {
            const participantSocketId = userSockets.get(participantId.toString());
            if (participantSocketId) {
              io.to(participantSocketId).emit('messageDeleted', deletionUpdate);
            }
          });

          console.log(`🗑️ Message deleted for everyone: ${messageId} by ${socket.userId}`);
        } else {
          // Delete only for sender
          if (!message.deletedFor.includes(socket.userId)) {
            message.deletedFor.push(socket.userId);
            await message.save();
          }

          socket.emit('messageDeleted', {
            messageId: message._id,
            conversationId: message.conversationId,
            deletedForMe: true,
          });

          console.log(`🗑️ Message deleted for user: ${messageId} by ${socket.userId}`);
        }
      } catch (error) {
        console.error('Message delete error:', error);
        socket.emit('error', { message: 'Failed to delete message' });
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
