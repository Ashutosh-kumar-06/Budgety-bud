/**
 * PocketBuddy — Message Model
 * ==============================
 * Stores every chat turn (user, assistant, system) in a conversation.
 * Indexed for fast retrieval of conversation history by user + conversationId.
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IMessage } from '../types';

const MessageSchema = new Schema<IMessage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
    conversationId: {
      type: String,
      required: [true, 'conversationId is required'],
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: [true, 'Message role is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: 10000,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // We use `timestamp` as our own field, disable auto timestamps
    timestamps: false,
  },
);

// ── Compound indexes ─────────────────────────────────────
MessageSchema.index({ userId: 1, conversationId: 1, timestamp: -1 });
MessageSchema.index({ userId: 1, timestamp: -1 }); // global chat history

MessageSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Message: Model<IMessage> = mongoose.model<IMessage>('Message', MessageSchema);
export default Message;
