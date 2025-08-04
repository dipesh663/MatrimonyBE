// Update horoscope by _id
const updateHoroscopeById = async (req, res) => {
  try {
    const horoscopeId = req.params.id;
    const { birthDate, birthYear, birthMonth, birthDay, birthTime, birthPlace, rashi, nakshatra, gotra, kundliUrl, isVerified, matchScore } = req.body;
    const updateFields = { birthDate, birthYear, birthMonth, birthDay, birthTime, birthPlace, rashi, nakshatra, gotra };
    if (kundliUrl !== undefined) updateFields.kundliUrl = kundliUrl;
    if (isVerified !== undefined) updateFields.isVerified = isVerified;
    if (matchScore !== undefined) updateFields.matchScore = matchScore;
    const updated = await Horoscope.findByIdAndUpdate(horoscopeId, updateFields, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Horoscope not found' });
    }
    res.status(200).json({ success: true, message: 'Horoscope updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating horoscope', error: error.message });
  }
};
const Horoscope = require('../../Model/Matrimony/Horoscope');
const User = require('../../Model/authModel');

const createOrUpdateHoroscope = async (req, res) => {
  try {
    const userId = req.userId;
    const { birthDate, birthYear, birthMonth, birthDay, birthTime, birthPlace, rashi, nakshatra, gotra } = req.body;

    // Validate required fields
    if (!birthDate || !birthTime || !birthPlace || !rashi || !nakshatra || !gotra || !birthDay || !birthYear || !birthMonth) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: birthDate, birthTime, birthPlace, rashi, nakshatra, gotra, birthDay, birthYear, or birthMonth'
      });
    }

    let existing = await Horoscope.findOne({ user: userId });

    let horoscopeData;
    let message;

    if (existing) {
      // Update existing
      horoscopeData = await Horoscope.findOneAndUpdate(
        { user: userId },
        { birthDate, birthYear, birthMonth, birthDay, birthTime, birthPlace, rashi, nakshatra, gotra },
        { new: true, runValidators: true }
      );
      message = 'Horoscope updated successfully';
    } else {
      // Create new
      horoscopeData = await Horoscope.create({
        user: userId,
        birthDate,
        birthYear,
        birthMonth,
        birthDay,
        birthTime,
        birthPlace,
        rashi,
        nakshatra,
        gotra
      });
      message = 'Horoscope created successfully';
    }

    res.status(200).json({
      success: true,
      message,
      data: horoscopeData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating or updating horoscope',
      error: error.message
    });
  }
};

const getHoroscope = async (req, res) => {
  try {
    const userId = req.userId;
    const horoscopeData = await Horoscope.findOne({ user: userId });

    if (!horoscopeData) {
      return res.status(404).json({
        success: false,
        message: 'Horoscope not found'
      });
    }

    res.status(200).json({
      success: true,
      data: horoscopeData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting horoscope',
      error: error.message
    });
  }
};

const getCompatibleMatches = async (req, res) => {
  try {
    const userId = req.userId;

    const currentUserHoroscope = await Horoscope.findOne({ user: userId });
    if (!currentUserHoroscope) {
      return res.status(404).json({
        success: false,
        message: 'User horoscope not found'
      });
    }

    const allHoroscopes = await Horoscope.find({ user: { $ne: userId } });

    const matches = allHoroscopes.filter(other => {
      let score = 0;
      if (currentUserHoroscope.rashi === other.rashi) score++;
      if (currentUserHoroscope.nakshatra === other.nakshatra) score++;
      if (currentUserHoroscope.gotra === other.gotra) return false;

      return score >= 2; // Match on both rashi and nakshatra
    });

    res.status(200).json({
      success: true,
      totalMatches: matches.length,
      data: matches
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting compatible matches',
      error: error.message
    });
  }
};

// Get horoscope by userId (for frontend profile page)
const getHoroscopeById = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    const horoscopeData = await Horoscope.findOne({ user: userId });
    if (!horoscopeData) {
      return res.status(404).json({
        success: false,
        message: 'Horoscope not found'
      });
    }
    res.status(200).json({
      success: true,
      data: horoscopeData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting horoscope by userId',
      error: error.message
    });
  }
};

module.exports = {
  createHoroscope: createOrUpdateHoroscope,
  getHoroscope,
  getCompatibleMatches,
  getHoroscopeById,
  updateHoroscopeById
};
