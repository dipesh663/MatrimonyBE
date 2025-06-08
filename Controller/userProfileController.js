const Profile = require('../Model/Matrimony/userProfileModel');
const User = require('../Model/authModel');
const mongoose = require('mongoose');

// Create or update a profile (upsert)
const createProfile = async (req, res) => {
  try {
    const profileData = req.body;
    // Use req.userId from the token for upsert, and always use 'user' as the field
    const user = req.userId;
    const updatedProfile = await Profile.findOneAndUpdate(
      { user },
      { ...profileData, user },
      { upsert: true, new: true }
    );
    res.status(201).json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: 'Error creating/updating profile', error });
  }
};

// Get a profile by user (from params)
const getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await Profile.findOne({ user: mongoose.Types.ObjectId(userId) });
    if (!profile) {
      return res.status(200).json({});
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
};

// Get all profiles, with optional gender filter
const getAllProfiles = async (req, res) => {
  try {
    let filter = {};
    if (req.query.gender) {
      filter['gender'] = req.query.gender;
    }
    const profiles = await Profile.find(filter);
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profiles', error });
  }
};

// Get all user profiles (admin or public view)
const getAllUserProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', 'email');
    res.status(200).json(profiles);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a single user profile by user ID
const getUserProfileById = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId }).populate('user', 'email');
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a user profile by user ID
const updateUserProfile = async (req, res) => {
  try {
    const updates = req.body;
    const profile = await Profile.findOneAndUpdate(
      { user: req.params.userId },
      updates,
      { new: true }
    );
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a user profile by user ID
const deleteUserProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndDelete({ user: req.params.userId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json({ message: 'Profile deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Export all functions
module.exports = {
  createProfile,
  getProfileByUserId,
  getAllProfiles,
  getAllUserProfiles,
  getUserProfileById,
  updateUserProfile,
  deleteUserProfile
};