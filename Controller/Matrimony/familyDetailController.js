const Detail = require('../../Model/Matrimony/FamilyInfo');
const User = require('../../Model/authModel');

// Create or update family details
const familyDetail = async (req, res) => {
  try {
    // Check if req.body exists
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'Request body is missing. Please send JSON data with Content-Type: application/json'
      });
    }

    const userId = req.userId;

    const {
      fatherName,
      motherName,
      siblings,
      familyType
    } = req.body;

    // Validate required fields
    if (!fatherName || !motherName || !familyType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: fatherName, motherName, or familyType'
      });
    }

    // Validate familyType enum
    const validFamilyTypes = ['Nuclear', 'Joint', 'Extended'];
    if (!validFamilyTypes.includes(familyType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid familyType. Must be one of: Nuclear, Joint, Extended'
      });
    }

    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if familyDetail already exists for this user
    let familyDetailData = await Detail.findOne({ user: userId });

    if (familyDetailData) {
      // Update existing familyDetail
      familyDetailData = await Detail.findOneAndUpdate(
        { user: userId },
        { 
          fatherName, 
          motherName, 
          siblings, 
          familyType 
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new familyDetail
      familyDetailData = new Detail({
        user: userId,
        fatherName,
        motherName,
        siblings,
        familyType
      });
      await familyDetailData.save();
    }

    res.status(200).json({
      success: true,
      message: familyDetailData ? 'Family details updated successfully' : 'Family details created successfully',
      data: familyDetailData
    });

  } catch (error) {
    console.error('Error in familyDetail:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get family details
const getFamilyDetail = async (req, res) => {
  try {
    const userId = req.userId;

    const familyDetailData = await Detail.findOne({ user: userId });

    if (!familyDetailData) {
      return res.status(404).json({
        success: false,
        message: 'Family details not found'
      });
    }

    res.status(200).json({
      success: true,
      data: familyDetailData
    });

  } catch (error) {
    console.error('Error in getFamilyDetail:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get family detail by userId (for frontend profile page)
const getFamilyDetailById = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    const familyDetailData = await Detail.findOne({ user: userId });
    if (!familyDetailData) {
      return res.status(404).json({
        success: false,
        message: 'Family details not found'
      });
    }
    res.status(200).json({
      success: true,
      data: familyDetailData
    });
  } catch (error) {
    console.error('Error in getFamilyDetailById:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = { familyDetail, getFamilyDetail, getFamilyDetailById };
