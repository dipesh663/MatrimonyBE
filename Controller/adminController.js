const User = require('../Model/authModel');
const userDetail = require('../Model/Matrimony/userDetal');

// Get all users (excluding admins)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }, '-password'); // Only get users with role 'user'
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a user by ID
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    await userDetail.deleteMany({ user: userId }); // Remove user details
    res.json({ message: 'User deleted successfully', deletedUserId: userId });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get analytics summary
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' }); // Only count regular users
    
    // Get gender counts only for regular users
    const genderCounts = await userDetail.aggregate([
      {
        $lookup: {
          from: 'users', // User collection name
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $match: {
          'userInfo.role': 'user'
        }
      },
      {
        $group: { _id: '$gender', count: { $sum: 1 } }
      }
    ]);
    
    const genderRatio = genderCounts.reduce((acc, g) => {
      acc[g._id] = g.count;
      return acc;
    }, {});
    
    // Get location distribution only for regular users
    const locationDist = await userDetail.aggregate([
      {
        $lookup: {
          from: 'users', // User collection name
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $match: {
          'userInfo.role': 'user'
        }
      },
      {
        $group: { _id: '$location', count: { $sum: 1 } }
      }
    ]);
    
    res.json({ totalUsers, genderRatio, locationDist });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};