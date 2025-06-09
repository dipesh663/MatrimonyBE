// Model/Matrimony/userPreferenceModel.js

const mongoose = require('mongoose');

const partnerPreferenceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' },

    basic: {
        ageRange: {
            min: Number,
            max: Number
        },
        height: { type: String },
        maritalStatus: { type: String, enum: ['Never Married', 'Divorced', 'Widowed', 'Separated'] },
        motherTongue: { type: String },
        eatingHabits: { type: String, enum: ['Vegetarian', 'Non-Vegetarian'] },
        drinkingHabits: { type: String, enum: ['Doesn\'t Drink', 'Drinks Socially', 'Drinks Regularly'] },
        smokingHabits: { type: String, enum: ['Doesn\'t Smoke', 'Smokes Occasionally', 'Smokes Regularly'] },
        complexion: { type: String, enum: ['Fair', 'Wheatish', 'Dark'] }, // added
        bodyType: { type: String, enum: ['Slim', 'Athletic', 'Average', 'Heavy'] } // added
    },

    religious: {
        religion: { type: String },
        caste: { type: String },
        subCaste: { type: String },
       
    },

    professional: {
        education: { type: String },
        employedIn: { type: String, enum: ['Government', 'Private', 'Business', 'Not working'] },
        occupation: { type: String }, // added
        annualIncome: { type: String },
    },

    location: {
        country: { type: String, default: 'Nepal' }, // added
        state: { type: [String] },
        district: { type: [String] },
        preferredCities: { type: [String] } // added
    },

    family: { // optional addition
        familyType: { type: String, enum: ['Joint', 'Nuclear'] },
        familyValues: { type: String, enum: ['Traditional', 'Moderate', 'Liberal'] }
    },

    aboutMyPartner: { type: String }
});

module.exports = mongoose.model('Partner-Preference', partnerPreferenceSchema);
