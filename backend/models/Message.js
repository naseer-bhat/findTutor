// models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: [true, 'Sender email is required'],
    },
    to: {
      type: String,
      required: [true, 'Receiver email is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
