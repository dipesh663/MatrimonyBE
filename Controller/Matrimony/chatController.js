const Chat = require('../../Model/Matrimony/chatModel');
const Request = require('../../Model/Matrimony/requestModel'); //Import the request model

// Send message only if users are friends
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.userId;

    // Check if there's an accepted friend request between sender and receiver
    const friendship = await Request.findOne({
      $or: [
        { senderId, receiverId, status: 'accepted' },
        { senderId: receiverId, receiverId: senderId, status: 'accepted' }
      ]
    });

    if (!friendship) {
      return res.status(403).json({ message: 'You can only chat with accepted friends.' });
    }

    const chat = new Chat({ senderId, receiverId, message });
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error });
  }
};

// Get all messages between current user and another user
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Chat.find({
      $or: [
        { senderId: req.userId, receiverId: userId },
        { senderId: userId, receiverId: req.userId }
      ]
    }).sort({ createdAt: 1 }); // Optional: sort by time
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
};

module.exports = { sendMessage, getMessages };
