const Preference = require('../../Model/Matrimony/PreferenceModel');
const UserDetail = require('../../Model/Matrimony/userDetal');
const EducationCareer = require('../../Model/Matrimony/EducationCareer');
const Horoscope = require('../../Model/Matrimony/Horoscope');

// Create or update preferences
exports.updatePreferences = async (req, res) => {
    try {
        const userId = req.userId;
        
        const preferences = await Preference.findOneAndUpdate(
            { user: userId },
            { ...req.body },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Preferences updated successfully',
            data: preferences
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating preferences',
            error: error.message
        });
    }
};

// Get user preferences
exports.getPreferences = async (req, res) => {
    try {
        const userId = req.userId;
        const preferences = await Preference.findOne({ user: userId });

        if (!preferences) {
            return res.status(404).json({
                success: false,
                message: 'Preferences not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: preferences
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching preferences',
            error: error.message
        });
    }
};

// Enhanced match finding with preference matching
exports.findMatchesByPreference = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Get current user's preferences and details
        const [preferences, userDetail] = await Promise.all([
            Preference.findOne({ user: userId }),
            UserDetail.findOne({ user: userId })
        ]);

        if (!preferences || !userDetail) {
            return res.status(404).json({
                success: false,
                message: 'Preferences or user details not found'
            });
        }

        // Build base query
        const query = {
            user: { $ne: userId },
            gender: userDetail.gender === 'Male' ? 'Female' : 'Male'
        };

        // Add age range filter
        if (preferences.ageRange) {
            query.age = {
                $gte: preferences.ageRange.min,
                $lte: preferences.ageRange.max
            };
        }

        // Add height range filter
        if (preferences.heightRange) {
            query.height = {
                $gte: preferences.heightRange.min,
                $lte: preferences.heightRange.max
            };
        }

        // Add weight range filter
        if (preferences.weightRange) {
            query.weight = {
                $gte: preferences.weightRange.min,
                $lte: preferences.weightRange.max
            };
        }

        // Add location filter
        if (preferences.locations?.length > 0) {
            query.location = { $in: preferences.locations };
        }

        // Add other basic filters
        if (preferences.religionPreferences?.length > 0) {
            query.religion = { $in: preferences.religionPreferences };
        }
        if (preferences.castePreferences?.length > 0) {
            query.caste = { $in: preferences.castePreferences };
        }
        if (preferences.maritalStatusPreferences?.length > 0) {
            query.maritialStatus = { $in: preferences.maritalStatusPreferences };
        }
        if (preferences.bodyTypePreferences?.length > 0) {
            query.bodyType = { $in: preferences.bodyTypePreferences };
        }
        if (preferences.complexionPreferences?.length > 0) {
            query.complexion = { $in: preferences.complexionPreferences };
        }

        // Find potential matches
        const potentialMatches = await UserDetail.find(query)
            .populate({
                path: 'user',
                select: 'email'
            });

        // Calculate match scores
        const scoredMatches = await Promise.all(potentialMatches.map(async match => {
            const score = await calculateMatchScore(match, preferences);
            return {
                ...match.toObject(),
                matchScore: score
            };
        }));

        // Sort by match score
        const sortedMatches = scoredMatches
            .filter(match => match.matchScore >= 0.5) // Filter matches with at least 50% compatibility
            .sort((a, b) => b.matchScore - a.matchScore);

        res.status(200).json({
            success: true,
            totalMatches: sortedMatches.length,
            data: sortedMatches
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error finding matches',
            error: error.message
        });
    }
};

// Helper function to calculate match score
async function calculateMatchScore(match, preferences) {
    try {
        let totalScore = 0;
        const weights = preferences.weights;

        // Age compatibility
        if (match.age >= preferences.ageRange.min && match.age <= preferences.ageRange.max) {
            totalScore += weights.age;
        }

        // Height compatibility
        if (match.height >= preferences.heightRange.min && match.height <= preferences.heightRange.max) {
            totalScore += weights.height;
        }

        // Weight compatibility
        if (match.weight >= preferences.weightRange.min && match.weight <= preferences.weightRange.max) {
            totalScore += weights.weight;
        }

        // Location compatibility
        if (preferences.locations.includes(match.location)) {
            totalScore += weights.location;
        }

        // Religion and Caste compatibility
        if (preferences.religionPreferences.includes(match.religion)) {
            totalScore += weights.religion;
        }
        if (preferences.castePreferences.includes(match.caste)) {
            totalScore += weights.caste;
        }

        // Education and Career compatibility
        const eduCareer = await EducationCareer.findOne({ user: match.user });
        if (eduCareer) {
            // Education match
            if (eduCareer.education.highestQualification === preferences.educationPreferences.highestQualification) {
                totalScore += weights.education * 0.6;
            }
            if (eduCareer.education.fieldOfStudy === preferences.educationPreferences.fieldOfStudy) {
                totalScore += weights.education * 0.4;
            }

            // Career match
            if (eduCareer.career.occupation === preferences.careerPreferences.occupation) {
                totalScore += weights.career * 0.4;
            }
            if (eduCareer.career.designation === preferences.careerPreferences.designation) {
                totalScore += weights.career * 0.3;
            }
            if (eduCareer.career.experience === preferences.careerPreferences.experience) {
                totalScore += weights.career * 0.3;
            }
        }

        // Physical attributes compatibility
        let physicalScore = 0;
        // Body type match
        if (preferences.bodyTypePreferences.includes(match.bodyType)) {
            physicalScore += 0.4;
        }
        // Complexion match
        if (preferences.complexionPreferences.includes(match.complexion)) {
            physicalScore += 0.4;
        }
        // Hobbies match (partial match)
        if (preferences.hobbies && match.hobbies) {
            const preferredHobbies = preferences.hobbies.toLowerCase().split(',').map(h => h.trim());
            const matchHobbies = match.hobbies.toLowerCase().split(',').map(h => h.trim());
            const commonHobbies = preferredHobbies.filter(h => matchHobbies.includes(h));
            if (commonHobbies.length > 0) {
                physicalScore += 0.2;
            }
        }
        totalScore += weights.physicalAttributes * physicalScore;

        return parseFloat(totalScore.toFixed(2));
    } catch (error) {
        console.error('Error calculating match score:', error);
        return 0;
    }
}

