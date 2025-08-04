const Detail = require('../../Model/Matrimony/userDetal');
const User = require('../../Model/authModel');
const mongoose = require('mongoose');

//update or create userDetail
const userDetail = async (req, res) => {
    try {
        const userId = req.userId; // Use userId set by authenticateToken middleware
        
        const {
            firstName,
            lastName,
            gender,
            age,
            religion,
            caste,
            maritialStatus,
            height,
            weight,
            bodyType,
            complexion,
            hobbies,
            about,
            location
        } = req.body;

        // Handle profile picture upload
        // Handle profile picture: accept either file or URL
        let profilePicturePath = null;
        if (req.file && req.file.filename) {
            // If a file is uploaded, use its filename
            profilePicturePath = req.file.filename;
        } else if (req.body.profilePicture) {
            // If a URL is provided, use the URL
            profilePicturePath = req.body.profilePicture;
        }

        // Check if user exists
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if userDetail already exists for this user
        let userDetailData = await Detail.findOne({ user: userId });

        if (userDetailData) {
            // Update existing userDetail
            userDetailData = await Detail.findOneAndUpdate(
                { user: userId },
                {
                    firstName,
                    lastName,
                    gender,
                    age,
                    religion,
                    caste,
                    maritialStatus,
                    height,
                    weight,
                    bodyType,
                    complexion,
                    hobbies,
                    about,
                    location,
                    profilePicture: profilePicturePath
                },
                { new: true, runValidators: true }
            );
        } else {
            // Create new userDetail
            userDetailData = new Detail({
                user: userId,
                firstName,
                lastName,
                gender,
                age,
                religion,
                caste,
                maritialStatus,
                height,
                weight,
                bodyType,
                complexion,
                hobbies,
                about,
                location,
                profilePicture: profilePicturePath
            });
            await userDetailData.save();
        }

        res.status(200).json({
            success: true,
            message: userDetailData ? 'User details updated successfully' : 'User details created successfully',
            data: userDetailData
        });

    } catch (error) {
        console.error('Error in userDetail:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const getUserDetail = async (req, res) => {
    try {
        const userId = req.userId;

        const userDetailData = await Detail.findOne({ user: userId });

        if (!userDetailData) {
            return res.status(404).json({
                success: false,
                message: 'User detail not found'
            });
        }

        res.status(200).json({
            success: true,
            data: userDetailData
        });
    } catch (error) {
        console.error('Error in getUserDetail:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get user detail by userId (for frontend profile page)
const getUserDetailById = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }
        const userDetailData = await Detail.findOne({ user: userId });
        if (!userDetailData) {
            return res.status(404).json({
                success: false,
                message: 'User detail not found'
            });
        }
        res.status(200).json({
            success: true,
            data: userDetailData
        });
    } catch (error) {
        console.error('Error in getUserDetailById:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = { userDetail, getUserDetail, getUserDetailById };