const Chat = require('../../Model/Matrimony/chatModel');
const Request = require('../../Model/Matrimony/requestModel'); // Import the request model
const Notification = require('../../Model/Matrimony/notificationModel');
const User = require('../../Model/authModel');
const UserDetail = require('../../Model/Matrimony/userDetal');

// Send message only if users are friends
const sendMessage = async (req, res) => {
  try {
    const { receiver, message } = req.body;
    const sender = req.userId;

    console.log('Received request:', { receiver, message, sender });

    // Validate required fields
    if (!receiver || !message) {
      console.log('Missing required fields:', { receiver, message });
      return res.status(400).json({ 
        message: 'Receiver ID and message are required' 
      });
    }

    if (!message.trim()) {
      return res.status(400).json({ 
        message: 'Message cannot be empty' 
      });
    }

    // Check if sender and receiver are different
    if (sender === receiver) {
      return res.status(400).json({ 
        message: 'Cannot send message to yourself' 
      });
    }

    console.log('Checking friendship between:', sender, 'and', receiver);

    // Check if there's an accepted friend request between sender and receiver
    const friendship = await Request.findOne({
      $or: [
        { sender, receiver, status: 'accepted' },
        { sender: receiver, receiver: sender, status: 'accepted' }
      ]
    });

    console.log('Friendship found:', friendship);

    if (!friendship) {
      return res.status(403).json({ 
        message: 'You can only chat with accepted friends.' 
      });
    }

    const chat = new Chat({ sender, receiver, message });
    await chat.save();
    
    // Create notification for receiver
    const senderUserDetail = await UserDetail.findOne({ user: sender });
    const senderName = senderUserDetail ? 
      `${senderUserDetail.firstName} ${senderUserDetail.lastName}`.trim() : 
      'Someone';
    
    await Notification.create({
      user: receiver,
      type: 'message',
      message: `New message from ${senderName}.`,
      link: '/chat/messages/' + sender
    });
    
    console.log('Message saved successfully');
    res.status(201).json(chat);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      message: 'Error sending message', 
      error: error.message 
    });
  }
};

// Get all messages between current user and another user
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;
    
    const messages = await Chat.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'username')
    .populate('receiver', 'username')
    .sort({ createdAt: 1 }); // Optional: sort by time
    
    // Transform messages to include user details
    const transformedMessages = await Promise.all(messages.map(async (msg) => {
      const senderDetails = await UserDetail.findOne({ user: msg.sender._id });
      const receiverDetails = await UserDetail.findOne({ user: msg.receiver._id });
      
      return {
        _id: msg._id,
        sender: msg.sender._id,
        receiver: msg.receiver._id,
        message: msg.message,
        createdAt: msg.createdAt,
        senderName: senderDetails ? 
          `${senderDetails.firstName} ${senderDetails.lastName}`.trim() : 
          msg.sender.username,
        receiverName: receiverDetails ? 
          `${receiverDetails.firstName} ${receiverDetails.lastName}`.trim() : 
          msg.receiver.username,
        isFromCurrentUser: msg.sender._id.toString() === currentUserId.toString()
      };
    }));
    
    res.status(200).json(transformedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

// Get unread message count for current user
const getUnreadMessageCount = async (req, res) => {
  try {
    const currentUserId = req.userId;
    
    const unreadCount = await Chat.countDocuments({
      receiver: currentUserId,
      read: false
    });
    
    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    res.status(500).json({ 
      message: 'Error fetching unread message count', 
      error: error.message 
    });
  }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    const currentUserId = req.userId;
    
    await Chat.updateMany(
      {
        sender: senderId,
        receiver: currentUserId,
        read: false
      },
      {
        read: true
      }
    );
    
    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ 
      message: 'Error marking messages as read', 
      error: error.message 
    });
  }
};

// Track profile view
const trackProfileView = async (req, res) => {
  try {
    const { viewedUserId } = req.params;
    const viewerId = req.userId;
    
    // Don't track if user views their own profile
    if (viewedUserId === viewerId) {
      return res.status(200).json({ message: 'Self view not tracked' });
    }
    
    // Increment profile views count
    await UserDetail.findOneAndUpdate(
      { user: viewedUserId },
      { $inc: { profileViews: 1 } },
      { new: true }
    );
    
    // Create notification for profile owner
    const viewerUserDetail = await UserDetail.findOne({ user: viewerId });
    const viewerName = viewerUserDetail ? 
      `${viewerUserDetail.firstName} ${viewerUserDetail.lastName}`.trim() : 
      'Someone';
    
    await Notification.create({
      user: viewedUserId,
      type: 'profile_view',
      message: `${viewerName} viewed your profile.`,
      link: '/dashboard/profile'
    });
    
    res.status(200).json({ message: 'Profile view tracked' });
  } catch (error) {
    console.error('Error tracking profile view:', error);
    res.status(500).json({ 
      message: 'Error tracking profile view', 
      error: error.message 
    });
  }
};

module.exports = { 
  sendMessage, 
  getMessages, 
  getUnreadMessageCount, 
  markMessagesAsRead,
  trackProfileView
};
