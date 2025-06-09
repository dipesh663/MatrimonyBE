 const Request = require('../../Model/Matrimony/requestModel');


// Send a request to another user
const sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.userId;

    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver ID is required' });
    }

    // Prevent duplicate requests
    const existing = await Request.findOne({ senderId, receiverId });
    if (existing) {
      return res.status(409).json({ message: 'Request already sent' });
    }

    const request = new Request({ senderId, receiverId, status: 'pending' });
    await request.save();
    res.status(201).json({ message: 'Request sent', request });
  } catch (error) {
    res.status(500).json({ message: 'Error sending request', error });
  }
};

// Accept a request
const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findOne({ _id: requestId, receiverId: req.userId });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    request.status = 'accepted';
    await request.save();
    res.status(200).json({ message: 'Request accepted', request });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting request', error });
  }
};

 // Reject a request
// const rejectRequest = async (req, res) => {
//   try {
//     const { requestId } = req.params;
//     const request = await Request.findOne({ _id: requestId, receiverId: req.userId });
//     if (!request) return res.status(404).json({ message: 'Request not found' });
//     request.status = 'rejected';
//     await request.save();
//     res.status(200).json({ message: 'Request rejected', request });
//   } catch (error) {
//     res.status(500).json({ message: 'Error rejecting request', error });
//   }
// };

const getRequests = async (req, res) => {
  try {
    const requests = await Request.find({ receiverId: req.userId })
      .populate('senderId', 'basicDetails');
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error });
  }
};

// Get all sent requests by the user
const getSentRequests = async (req, res) => {
  try {
    const user = req.userId;
    const sentRequests = await Request.find({ senderId: user });
    res.status(200).json(sentRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sent requests', error });
  }
};

const cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findOne({ _id: requestId, senderId: req.userId, status: 'pending' });
    if (!request) return res.status(404).json({ message: 'Request not found or already acted upon' });
    await request.remove();
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
        { senderId: req.userId },
        { receiverId: req.userId }
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
    cancelRequest,
    unfriendUser
};