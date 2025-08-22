const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    
    // Basic Preferences from UserDetail model
    ageRange: {
        min: { type: Number, min: 20, max: 60 },
        max: { type: Number, min: 20, max: 60 }
    },

    heightRange: {
        min: { type: Number, min: 150, max: 190 }, // in cm
        max: { type: Number, min: 150, max: 190 }  // in cm
    },

    weightRange: {
        min: { type: Number, min: 30, max: 90 }, // in kg
        max: { type: Number, min: 30, max: 90 }  // in kg
    },

    locations: [{
        type: String,
        enum: [
            'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Biratnagar',
            'Birgunj', 'Butwal', 'Nepalgunj', 'Dharan', 'Janakpur', 'Hetauda',
            'Itahari', 'Dhangadhi', 'Bharatpur', 'Tulsipur', 'Gorkha', 'Chitwan',
            'Ramechhap', 'Dolakha', 'Sindhupalchok', 'Nuwakot', 'Dang', 'Jhapa',
            'Morang', 'Sunsari', 'Parsa', 'Makwanpur', 'Kaski', 'Tanahun', 'Palpa',
            'Gulmi', 'Rupandehi', 'Kapilvastu', 'Bardiya', 'Banke', 'Surkhet',
            'Kailali', 'Kanchanpur', 'Bajhang', 'Bajura', 'Doti', 'Achham',
            'Dailekh', 'Jajarkot', 'Salyan', 'Rolpa', 'Rukum', 'Pyuthan'
        ]
    }],

    // Religion and Caste preferences from UserDetail model
    religionPreferences: [{
        type: String,
        enum: ['Hindu', 'Buddhist', 'Muslim', 'Christian', 'Kirat', 'Other']
    }],
    castePreferences: [{
        type: String,
        enum: [
            'Brahmin', 'Chhetri', 'Newar', 'Tamang', 'Rai', 'Magar',
            'Gurung', 'Sherpa', 'Tharu', 'Madhesi', 'Dalit', 'Other'
        ]
    }],

    // Education and Career preferences from EducationCareer model
    educationPreferences: {
        highestQualification: { type: String, default: '' },
        fieldOfStudy: { type: String, default: '' }
    },
    careerPreferences: {
        occupation: { type: String, default: '' },
        salary: { type: String, default: '' }
    },

    // Marital Status preference from UserDetail model
    maritalStatusPreferences: [{
        type: String,
        enum: ['Never Married', 'Divorced', 'Widowed', 'Separated']
    }],

    // Physical preferences from UserDetail model
    bodyTypePreferences: [{
        type: String,
        enum: ['Slim', 'Average', 'Athletic', 'Heavy']
    }],
    complexionPreferences: [{
        type: String,
        enum: ['Fair', 'Wheatish', 'Dark']
    }],


    // Preference weights for matching algorithm
    weights: {
        age: { type: Number, default: 0.15 },
        height: { type: Number, default: 0.1 },
        weight: { type: Number, default: 0.1 },
        location: { type: Number, default: 0.15 },
        education: { type: Number, default: 0.1 },
        career: { type: Number, default: 0.1 },
        religion: { type: Number, default: 0.1 },
        caste: { type: Number, default: 0.1 },
        physicalAttributes: { type: Number, default: 0.1 }
    }
}, {
    timestamps: true
});

// Validation for weight total
preferenceSchema.pre('save', function(next) {
    const totalWeight = Object.values(this.weights).reduce((sum, weight) => sum + weight, 0);
    if (Math.abs(totalWeight - 1) > 0.01) { // Allow small floating point differences
        next(new Error('Preference weights must sum to 1'));
    }
    next();
});

module.exports = mongoose.model('Preference', preferenceSchema);
