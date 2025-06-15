const Shortlist = require('../../Model/Matrimony/shortlistModel');

// Add a user to shortlist
exports.addToShortlist = async (req, res) => {
  try {
    const { shortlistedUserId } = req.body;
    const user= req.userId; // from auth middleware
    
    if (!shortlistedUserId) return res.status(400).json({ error: 'shortlistedUserId is required' });
    // Prevent duplicate
    const exists = await Shortlist.findOne({ user, shortlistedUserId });
    if (exists) return res.status(409).json({ message: 'Already shortlisted' });
    const entry = new Shortlist({ user, shortlistedUserId });
    await entry.save();
    res.status(201).json({ message: 'User shortlisted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all shortlisted users for a user 
exports.getShortlist = async (req, res) => {
  try {
    const user= req.userId; // from auth middleware
    const shortlist = await Shortlist.find({ user }).populate('shortlistedUserId', 'basicDetails');
    res.json(shortlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove a user from shortlist
exports.removeFromShortlist = async (req, res) => {
  try {
    const user= req.userId; // from auth middleware
    const { shortlistedUserId } = req.params;
    if (!shortlistedUserId) {
      return res.status(400).json({ error: 'shortlistedUserId is required' });
    }

    await Shortlist.deleteOne({ user, shortlistedUserId });
    res.json({ message: 'Removed from shortlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

