const UserRegister = require('../Model/userRegisterModel');

// Create or update registration details
const createRegister = async (req, res) => {
  try {
    const user = req.userId;
    const { basicDetails } = req.body;
    if (!user || !basicDetails) {
      return res.status(400).json({ message: 'User and basicDetails are required' });
    }
    let register = await UserRegister.findOne({ user });
    if (register) {
      register.basicDetails = basicDetails;
      await register.save();
      return res.status(200).json(register);
    }
    register = new UserRegister({ user, basicDetails });
    await register.save();
    res.status(201).json(register);
  } catch (err) {
    res.status(500).json({ message: 'Error saving registration', error: err.message });
  }
};

// Get all registered users
const getAllRegisteredDetails = async (req, res) => {
  try {
    const users = await UserRegister.find().populate('user', 'email');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

// Get current user's registration details
const getcurrentRegisteredDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UserRegister.findOne({ user: userId }).populate('user', 'email');
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
};

module.exports = {
  createRegister,
  getAllRegisteredDetails,
  getcurrentRegisteredDetails
};