const Detail = require('../../Model/Matrimony/EducationCareer');
const User = require('../../Model/authModel');
const mongoose = require('mongoose');

//update or create educationCareer
const educationCareer = async (req, res) => {
    try {
        const userId = req.userId; // Assuming user ID comes from auth middleware
        
        let { education, career, additionalInfo } = req.body;
        // Ensure occupation and company are always present as empty string if not provided
        if (!career) career = {};
        career.occupation = career.occupation || '';
        career.company = career.company || '';

        // Check if user exists
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if educationCareer already exists for this user
        let educationCareerDetail = await Detail.findOne({ user: userId });

        if (educationCareerDetail) {
            // Update existing educationCareer
            educationCareerDetail = await Detail.findOneAndUpdate(
                { user: userId },
                {
                    education,
                    career,
                    additionalInfo
                },
                { new: true, runValidators: true }
            );
        } else {
            // Create new educationCareer
            educationCareerDetail = new Detail({
                user: userId,
                education,
                career,
                additionalInfo
            });
            await educationCareerDetail.save();
        }

        res.status(200).json({
            success: true,
            message: educationCareerDetail ? 'Education and career details updated successfully' : 'Education and career details created successfully',
            data: educationCareerDetail
        });

    } catch (error) {
        console.error('Error in educationCareer:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get education and career details
const getEducationCareer = async (req, res) => {
    try {
        const userId = req.userId;

        const educationCareerDetail = await Detail.findOne({ user: userId });

        if (!educationCareerDetail) {
            return res.status(404).json({
                success: false,
                message: 'Education and career details not found'
            });
        }

        res.status(200).json({
            success: true,
            data: educationCareerDetail
        });

    } catch (error) {
        console.error('Error in getEducationCareer:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get education/career detail by userId (for frontend profile page)
const getEducationCareerById = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }
        const educationCareerDetail = await Detail.findOne({ user: userId });
        if (!educationCareerDetail) {
            return res.status(404).json({
                success: false,
                message: 'Education and career details not found'
            });
        }
        res.status(200).json({
            success: true,
            data: educationCareerDetail
        });
    } catch (error) {
        console.error('Error in getEducationCareerById:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = { 
    educationCareer,
    getEducationCareer,
    getEducationCareerById
};