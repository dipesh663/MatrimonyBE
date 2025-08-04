const UserDetail = require('../../Model/Matrimony/userDetal');
const Request = require('../../Model/Matrimony/requestModel');

// Helper function to get request status between two users
const getRequestStatus = async (currentUserId, otherUserId) => {
  const request = await Request.findOne({
    $or: [
      { sender: currentUserId, receiver: otherUserId },
      { sender: otherUserId, receiver: currentUserId }
    ]
  });
  
  if (!request) return null;
  
  return {
    status: request.status,
    isSender: request.sender.toString() === currentUserId.toString(),
    requestId: request._id
  };
};

// Get recommended matches for a user (basic example: filter by age, location, education, religion, occupation)
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.userId || req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }
    // Get current user's detail
    const currentUser = await UserDetail.findOne({ user: userId });
    if (!currentUser) {
      return res.status(404).json({ message: 'User detail not found' });
    }
    // Build base query: exclude self, filter by age range, gender
    const query = {
      user: { $ne: userId },
      age: { $gte: 20, $lte: 60 },
    };
    // Gender filter (case-insensitive)
    // if (currentUser.gender && typeof currentUser.gender === 'string') {
    //   if (currentUser.gender.toLowerCase() === 'male') query.gender = { $regex: /^female$/i };
    //   else if (currentUser.gender.toLowerCase() === 'female') query.gender = { $regex: /^male$/i };
    // }

    // Log query for debugging
    console.log('Match query:', query);

    // Only filter by location, education, religion, occupation if currentUser has set them
    if (currentUser.location) query.location = currentUser.location;
    if (currentUser.education) query.education = currentUser.education;
    if (currentUser.religion) query.religion = currentUser.religion;
    if (currentUser.occupation) query.occupation = currentUser.occupation;

    // Get all possible matches
    const possibleMatches = await UserDetail.find(query).select('-__v');

    // Weighted scoring algorithm
    // Define weights for each field
    const weights = {
      age: 0.2,
      location: 0.2,
      education: 0.2,
      religion: 0.2,
      occupation: 0.2
    };

    // Helper to calculate score for each match
    function calculateScore(match) {
      let score = 0;
      // Age: closer is better
      if (currentUser.age && match.age) {
        const ageDiff = Math.abs(currentUser.age - match.age);
        score += weights.age * (1 - Math.min(ageDiff, 20) / 20); // 0 if 20+ years apart, 1 if same age
      }
      // Location
      if (currentUser.location && match.location && currentUser.location === match.location) {
        score += weights.location;
      }
      // Education
      if (currentUser.education && match.education && currentUser.education === match.education) {
        score += weights.education;
      }
      // Religion
      if (currentUser.religion && match.religion && currentUser.religion === match.religion) {
        score += weights.religion;
      }
      // Occupation
      if (currentUser.occupation && match.occupation && currentUser.occupation === match.occupation) {
        score += weights.occupation;
      }
      return score;
    }

    // Score and sort matches, then add request status
    const scoredMatches = possibleMatches
      .map(match => ({ ...match.toObject(), matchScore: calculateScore(match) }))
      .sort((a, b) => b.matchScore - a.matchScore);

    // Add request status for each match
    const matchesWithRequestStatus = await Promise.all(
      scoredMatches.map(async (match) => {
        const requestStatus = await getRequestStatus(userId, match.user);
        return {
          ...match,
          requestStatus
        };
      })
    );

    res.json(matchesWithRequestStatus);
  } catch (err) {
    console.error('Error getting matches:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get matches by gender only (opposite gender)
exports.getMatchesByGender = async (req, res) => {
  try {
    const userId = req.userId || req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }
    // Get current user's detail
    const currentUser = await UserDetail.findOne({ user: userId });
    if (!currentUser) {
      return res.status(404).json({ message: 'User detail not found' });
    }
    // Only filter by opposite gender and exclude self
    let genderQuery = {};
    if (currentUser.gender && typeof currentUser.gender === 'string') {
      if (currentUser.gender.toLowerCase() === 'male') genderQuery.gender = { $regex: /^female$/i };
      else if (currentUser.gender.toLowerCase() === 'female') genderQuery.gender = { $regex: /^male$/i };
    }
    const query = {
      user: { $ne: userId },
      ...genderQuery
    };
    const matches = await UserDetail.find(query).select('-__v');
    
    // Add request status for each match and filter out pending requests
    const matchesWithRequestStatus = await Promise.all(
      matches.map(async (match) => {
        const requestStatus = await getRequestStatus(userId, match.user);
        return {
          ...match.toObject(),
          requestStatus
        };
      })
    );
    
    // Filter out users with pending requests (but keep accepted connections)
    const filteredMatches = matchesWithRequestStatus.filter(match => {
      if (!match.requestStatus) return true; // No request exists
      if (match.requestStatus.status === 'rejected') return true; // Keep rejected users (can retry)
      return false; // Filter out pending and accepted requests
    });
    
    res.json(filteredMatches);
  } catch (err) {
    console.error('Error getting gender matches:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search users by name (including those with pending requests)
exports.searchUsers = async (req, res) => {
  try {
    const userId = req.userId;
    const { query } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }
    
    // Get current user's detail
    const currentUser = await UserDetail.findOne({ user: userId });
    if (!currentUser) {
      return res.status(404).json({ message: 'User detail not found' });
    }
    
    // Search by first name or last name (case insensitive)
    const searchQuery = {
      user: { $ne: userId }, // Exclude self
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { 
          $expr: { 
            $regexMatch: { 
              input: { $concat: ['$firstName', ' ', '$lastName'] }, 
              regex: query, 
              options: 'i' 
            } 
          } 
        }
      ]
    };
    
    const searchResults = await UserDetail.find(searchQuery).select('-__v');
    
    // Add request status for each search result
    const resultsWithRequestStatus = await Promise.all(
      searchResults.map(async (match) => {
        const requestStatus = await getRequestStatus(userId, match.user);
        return {
          ...match.toObject(),
          requestStatus
        };
      })
    );
    
    res.json(resultsWithRequestStatus);
  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
