const Preference = require('../../Model/Matrimony/PreferenceModel');
const UserDetail = require('../../Model/Matrimony/userDetal');
const EducationCareer = require('../../Model/Matrimony/EducationCareer');
const Horoscope = require('../../Model/Matrimony/Horoscope');
const Request = require('../../Model/Matrimony/requestModel');

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

        if (!userDetail) {
            return res.status(404).json({
                success: false,
                message: 'User details not found'
            });
        }

        // If no preferences are set, return all users of opposite gender
        if (!preferences) {
            console.log(`No preferences found for user ${userId}, returning all opposite gender users`);
            const allMatches = await UserDetail.find({
                user: { $ne: userId },
                gender: userDetail.gender === 'Male' ? 'Female' : 'Male'
            }).populate({
                path: 'user',
                select: 'email'
            });

            console.log(`Found ${allMatches.length} users without preferences`);

            return res.status(200).json({
                success: true,
                totalMatches: allMatches.length,
                data: allMatches.map(match => ({
                    ...match.toObject(),
                    matchScore: 0.5 // Default score for users without preferences
                }))
            });
        }

        console.log(`Preferences found for user ${userId}:`, preferences);

        // Build base query - start with opposite gender only
        const query = {
            user: { $ne: userId },
            gender: userDetail.gender === 'Male' ? 'Female' : 'Male'
        };

        // Find all potential matches first (without strict filtering)
        const allPotentialMatches = await UserDetail.find(query)
            .populate({
                path: 'user',
                select: 'email'
            });

        console.log(`Found ${allPotentialMatches.length} potential matches for user ${userId}`);

        // Calculate match scores for all users
        const scoredMatches = await Promise.all(allPotentialMatches.map(async match => {
            const score = await calculateMatchScore(match, preferences);
            console.log(`User ${match.firstName} ${match.lastName} - Score: ${score}`);
            return {
                ...match.toObject(),
                matchScore: score
            };
        }));

        // Augment with request status between current user and each candidate
        const withRequestStatus = await Promise.all(scoredMatches.map(async match => {
            const req = await Request.findOne({
                $or: [
                    { sender: userId, receiver: match.user },
                    { sender: match.user, receiver: userId }
                ]
            });
            let requestStatus = null;
            if (req) {
                requestStatus = {
                    status: req.status,
                    isSender: req.sender.toString() === userId.toString(),
                    requestId: req._id
                };
            }
            return {
                ...match,
                requestStatus
            };
        }));

        // Filter out already accepted connections; keep others (including pending/rejected)
        const filtered = withRequestStatus.filter(m => !(m.requestStatus && m.requestStatus.status === 'accepted'));

        // Sort by match score
        const sortedMatches = filtered.sort((a, b) => b.matchScore - a.matchScore);

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
        const weights = preferences.weights || {
            age: 0.15,
            height: 0.1,
            weight: 0.1,
            location: 0.15,
            education: 0.1,
            career: 0.1,
            religion: 0.1,
            caste: 0.1,
            physicalAttributes: 0.1
        };

        // Age compatibility
        if (preferences.ageRange && match.age) {
            if (match.age >= preferences.ageRange.min && match.age <= preferences.ageRange.max) {
                totalScore += weights.age;
            }
        }

        // Height compatibility
        if (preferences.heightRange && match.height) {
            if (match.height >= preferences.heightRange.min && match.height <= preferences.heightRange.max) {
                totalScore += weights.height;
            }
        }

        // Weight compatibility
        if (preferences.weightRange && match.weight) {
            if (match.weight >= preferences.weightRange.min && match.weight <= preferences.weightRange.max) {
                totalScore += weights.weight;
            }
        }

        // Location compatibility
        if (preferences.locations && preferences.locations.length > 0 && match.location) {
            if (preferences.locations.includes(match.location)) {
                totalScore += weights.location;
            }
        }

        // Religion compatibility
        if (preferences.religionPreferences && preferences.religionPreferences.length > 0 && match.religion) {
            if (preferences.religionPreferences.includes(match.religion)) {
                totalScore += weights.religion;
            }
        }

        // Caste compatibility
        if (preferences.castePreferences && preferences.castePreferences.length > 0 && match.caste) {
            if (preferences.castePreferences.includes(match.caste)) {
                totalScore += weights.caste;
            }
        }

        // Marital status compatibility
        if (preferences.maritalStatusPreferences && preferences.maritalStatusPreferences.length > 0 && match.maritialStatus) {
            if (preferences.maritalStatusPreferences.includes(match.maritialStatus)) {
                totalScore += weights.physicalAttributes * 0.5; // Use part of physical attributes weight
            }
        }

        // Education and Career compatibility
        const eduCareer = await EducationCareer.findOne({ user: match.user });
        if (eduCareer && preferences.educationPreferences) {
            // Education match
            if (preferences.educationPreferences.highestQualification && 
                eduCareer.education.highestQualification === preferences.educationPreferences.highestQualification) {
                totalScore += weights.education * 0.6;
            }
            if (preferences.educationPreferences.fieldOfStudy && 
                eduCareer.education.fieldOfStudy === preferences.educationPreferences.fieldOfStudy) {
                totalScore += weights.education * 0.4;
            }
        }

        if (eduCareer && preferences.careerPreferences) {
            // Career match
            if (preferences.careerPreferences.occupation && 
                eduCareer.career.occupation === preferences.careerPreferences.occupation) {
                totalScore += weights.career * 0.4;
            }
            if (preferences.careerPreferences.salary && 
                eduCareer.career.salary === preferences.careerPreferences.salary) {
                totalScore += weights.career * 0.3;
            }
        }

        // Physical attributes compatibility
        let physicalScore = 0;
        // Body type match
        if (preferences.bodyTypePreferences && preferences.bodyTypePreferences.length > 0 && match.bodyType) {
            if (preferences.bodyTypePreferences.includes(match.bodyType)) {
                physicalScore += 0.4;
            }
        }
        // Complexion match
        if (preferences.complexionPreferences && preferences.complexionPreferences.length > 0 && match.complexion) {
            if (preferences.complexionPreferences.includes(match.complexion)) {
                physicalScore += 0.4;
            }
        }
        totalScore += weights.physicalAttributes * physicalScore;

        return parseFloat(totalScore.toFixed(2));
    } catch (error) {
        console.error('Error calculating match score:', error);
        return 0;
    }
}

