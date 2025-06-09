const UserPreference = require('../../Model/Matrimony/userPreferenceModel');
const mongoose = require('mongoose');

const createPreference = async (req, res) => {
  try {
    const preferenceData = req.body;
    const user = req.userId;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: user ID not found' });
    }

    delete preferenceData.user; // prevent manual override

    const updatedPreference = await UserPreference.findOneAndUpdate(
      { user: user },
      { ...preferenceData, user: user },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Preferences saved!', updatedPreference });
  } catch (error) {
    res.status(500).json({ message: 'Error creating/updating preference', error });
  }
};

const getPreferenceByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId format first
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const preference = await UserPreference.findOne({ user: userId });

    if (!preference) {
      return res.status(200).json({});
    }

    res.status(200).json(preference);
  } catch (error) {
    console.error("Error in getPreferenceByUserId:", error); 
    res.status(500).json({ message: 'Error fetching preference', error });
  }
};


const getMyPreference = async (req, res) => {
  try {
    const user = req.userId;
    const preference = await UserPreference.findOne({ user: user });
    if (!preference) return res.status(200).json({});
    res.status(200).json(preference);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching preference', error });
  }
};

module.exports = { createPreference, getPreferenceByUserId, getMyPreference };
