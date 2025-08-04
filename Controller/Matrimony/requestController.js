const Request = require('../../Model/Matrimony/requestModel');
const Notification = require('../../Model/Matrimony/notificationModel');
const User = require('../../Model/authModel');
const UserDetail = require('../../Model/Matrimony/userDetal');
const EducationCareer = require('../../Model/Matrimony/EducationCareer');

// Helper function to check if users are already connected
const areUsersConnected = async (user1Id, user2Id) => {
  const connection = await Request.findOne({
    $or: [
      { sender: user1Id, receiver: user2Id, status: 'accepted' },
      { sender: user2Id, receiver: user1Id, status: 'accepted' }
    ]
  });
  return !!connection;
};

// Send a request to another user
const sendRequest = async (req, res) => {
  try {
    const { receiver } = req.body;
    const sender = req.userId;

    if (!receiver) {
      return res.status(400).json({ message: 'Receiver ID is required' });
    }

    if (sender === receiver) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    // Check if users are already connected
    const alreadyConnected = await areUsersConnected(sender, receiver);
    if (alreadyConnected) {
      return res.status(409).json({ message: 'You are already connected with this user' });
    }

    // Check if a request already exists between these users (in any direction)
    const existingRequest = await Request.findOne({
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender }
      ]
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        if (existingRequest.sender.toString() === sender) {
          return res.status(409).json({ message: 'Request already sent to this user' });
        } else {
          return res.status(409).json({ message: 'This user has already sent you a request' });
        }
      } else if (existingRequest.status === 'rejected') {
        // If request was rejected, allow sending a new request
        await Request.deleteOne({ _id: existingRequest._id });
      }
    }

    // Create new request
    const request = new Request({ sender, receiver, status: 'pending' });
    await request.save();
    
    // Create notification for receiver
    const senderUserDetail = await UserDetail.findOne({ user: sender });
    const senderName = senderUserDetail ? 
      `${senderUserDetail.firstName} ${senderUserDetail.lastName}`.trim() : 
      'Someone';
    
    await Notification.create({
      user: receiver,
      type: 'request',
      message: `${senderName} sent you a connection request.`,
      link: '/requests'
    });
    
    res.status(201).json({ message: 'Request sent', request });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Request already sent' });
    }
    res.status(500).json({ message: 'Error sending request', error });
  }
};

// Accept a request
const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findOne({ _id: requestId, receiver: req.userId, status: 'pending' });
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found or already acted upon' });
    }
    
    request.status = 'accepted';
    await request.save();
    
    // Create notification for sender
    const receiverUserDetail = await UserDetail.findOne({ user: req.userId });
    const receiverName = receiverUserDetail ? 
      `${receiverUserDetail.firstName} ${receiverUserDetail.lastName}`.trim() : 
      'Someone';
    
    await Notification.create({
      user: request.sender,
      type: 'accept',
      message: `${receiverName} accepted your connection request.`,
      link: '/requests'
    });
    
    res.status(200).json({ message: 'Request accepted', request });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting request', error });
  }
};

// Reject a request
const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findOne({ _id: requestId, receiver: req.userId, status: 'pending' });
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found or already acted upon' });
    }
    
    request.status = 'rejected';
    await request.save();
    
    // Create notification for sender
    const receiverUserDetail = await UserDetail.findOne({ user: req.userId });
    const receiverName = receiverUserDetail ? 
      `${receiverUserDetail.firstName} ${receiverUserDetail.lastName}`.trim() : 
      'Someone';
    
    await Notification.create({
      user: request.sender,
      type: 'reject',
      message: `${receiverName} rejected your connection request.`,
      link: '/requests'
    });
    
    res.status(200).json({ message: 'Request rejected', request });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting request', error });
  }
};

// Get all received requests
const getRequests = async (req, res) => {
  try {
    console.log('getRequests: req.userId =', req.userId);
    const requests = await Request.find({ receiver: req.userId })
      .populate({
        path: 'sender',
        model: 'User',
        select: 'username email'
      });
    
    console.log('getRequests: found requests =', requests);
    
    // Get user details for each sender
    const transformed = await Promise.all(requests.map(async (r) => {
      let senderDetails = null;
      if (r.sender) {
        const [userDetail, educationCareer] = await Promise.all([
          UserDetail.findOne({ user: r.sender._id }),
          EducationCareer.findOne({ user: r.sender._id })
        ]);
        
        senderDetails = userDetail ? {
          user: r.sender._id, // Preserve the original user ID
          name: `${userDetail.firstName || ''} ${userDetail.lastName || ''}`.trim(),
          firstName: userDetail.firstName || '',
          lastName: userDetail.lastName || '',
          profilePicture: userDetail.profilePicture || '',
          location: userDetail.location || '',
          occupation: educationCareer?.career?.occupation || '',
          education: educationCareer?.education?.highestQualification || '',
          email: r.sender.email || ''
        } : {
          user: r.sender._id, // Preserve the original user ID
          name: r.sender.username || 'Unknown User',
          firstName: '',
          lastName: '',
          profilePicture: '',
          location: '',
          occupation: '',
          education: '',
          email: r.sender.email || ''
        };
      }
      
      return {
        ...r.toObject(),
        sender: senderDetails
      };
    }));
    
    res.status(200).json(transformed);
  } catch (error) {
    console.error('getRequests error:', error);
    res.status(500).json({ message: 'Error fetching requests', error });
  }
};

// Get all sent requests by the user
const getSentRequests = async (req, res) => {
  try {
    const user = req.userId;
    const sentRequests = await Request.find({ sender: user })
      .populate({
        path: 'receiver',
        model: 'User',
        select: 'username email'
      });
    
    // Get user details for each receiver
    const transformed = await Promise.all(sentRequests.map(async (r) => {
      let receiverDetails = null;
      if (r.receiver) {
        const [userDetail, educationCareer] = await Promise.all([
          UserDetail.findOne({ user: r.receiver._id }),
          EducationCareer.findOne({ user: r.receiver._id })
        ]);
        
        receiverDetails = userDetail ? {
          user: r.receiver._id, // Preserve the original user ID
          name: `${userDetail.firstName || ''} ${userDetail.lastName || ''}`.trim(),
          firstName: userDetail.firstName || '',
          lastName: userDetail.lastName || '',
          profilePicture: userDetail.profilePicture || '',
          location: userDetail.location || '',
          occupation: educationCareer?.career?.occupation || '',
          education: educationCareer?.education?.highestQualification || '',
          email: r.receiver.email || ''
        } : {
          user: r.receiver._id, // Preserve the original user ID
          name: r.receiver.username || 'Unknown User',
          firstName: '',
          lastName: '',
          profilePicture: '',
          location: '',
          occupation: '',
          education: '',
          email: r.receiver.email || ''
        };
      }
      
      return {
        ...r.toObject(),
        receiver: receiverDetails
      };
    }));
    
    res.status(200).json(transformed);
  } catch (error) {
    console.error('getSentRequests error:', error);
    res.status(500).json({ message: 'Error fetching sent requests', error });
  }
};

const cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findOne({ 
      _id: requestId, 
      sender: req.userId, 
      status: 'pending' 
    });
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found or already acted upon' });
    }
    
    await Request.deleteOne({ _id: requestId });
    res.status(200).json({ message: 'Request cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling request', error });
  }
};

// Unfriend a user by deleting the accepted request
const unfriendUser = async (req, res) => {
  try {
    const { requestId } = req.params;
    // Find request that is accepted and involves the current user
    const request = await Request.findOne({
      _id: requestId,
      status: 'accepted',
      $or: [
        { sender: req.userId },
        { receiver: req.userId }
      ]
    });
    if (!request) {
      return res.status(404).json({ message: 'Friend connection not found or already removed' });
    }
    await Request.deleteOne({ _id: requestId });
    res.status(200).json({ message: 'Unfriended successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error unfriending user', error });
  }
};

module.exports = { 
    sendRequest, 
    getRequests, 
    getSentRequests, 
    acceptRequest, 
    rejectRequest,
    cancelRequest,
    unfriendUser
};