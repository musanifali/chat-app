import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'audio', 'gif', 'sticker'],
    default: 'text',
  },
  content: {
    type: String,
    required: true,
  },
  audioDuration: {
    type: Number,
    default: null,
  },
  replyTo: {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: {
    type: Date,
  },
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  deletedForEveryone: {
    type: Boolean,
    default: false,
  },
  reactions: [{
    emoji: {
      type: String,
      required: true,
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  }],
}, {
  timestamps: true,
});

// Index for efficient message queries
messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
