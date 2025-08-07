import Message from '../models/Message.js';

// Create a new message
export const sendMessage = async (req, res) => {
  try {
    const { to, content } = req.body;
    const from = req.user.email;

    if (!to || !content) {
      return res.status(400).json({
        status: 'FAIL',
        message: 'Receiver and content are required',
      });
    }

    const newMessage = await Message.create({ from, to, content });

    res.status(201).json({
      status: 'SUCCESS',
      data: newMessage,
    });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

// Get inbox messages for the logged-in user
export const getInbox = async (req, res) => {
  try {
    const inbox = await Message.find({ to: req.user.email });

    res.status(200).json({
      status: 'SUCCESS',
      data: inbox,
    });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

// Get sent messages by the logged-in user
export const getSentMessages = async (req, res) => {
  try {
    const sent = await Message.find({ from: req.user.email });

    res.status(200).json({
      status: 'SUCCESS',
      data: sent,
    });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

// Delete a message by ID (only if the user is sender or receiver)
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ status: 'FAIL', message: 'Message not found' });
    }

    const userEmail = req.user.email;
    if (message.from !== userEmail && message.to !== userEmail) {
      return res.status(403).json({ status: 'FAIL', message: 'Not authorized to delete this message' });
    }

    await message.deleteOne();

    res.status(200).json({ status: 'SUCCESS', message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};
