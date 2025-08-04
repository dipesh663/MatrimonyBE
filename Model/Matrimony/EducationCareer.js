const mongoose = require('mongoose');

const educationCareerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    education: {
        highestQualification: {
            type: String,
            required: false,
            default: ''
        },
        institution: {
            type: String,
            required: false,
            default: ''
        },
        fieldOfStudy: {
            type: String,
            required: false,
            default: ''
        },
        graduationYear: {
            type: Number,
            required: false,
            default: null
        }
    },
    
    career: {
        occupation: {
            type: String,
            required: false,
            default: ''
        },
        company: {
            type: String,
            required: false,
            default: ''
        },
        designation: {
            type: String,
            required: false,
            default: ''
        },
        experience: {
            type: String,
            required: false,
            default: ''
        },
        salary: {
            type: String,
            required: false,
            default: ''
        }
    },
    
    additionalInfo: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('educationCareer', educationCareerSchema);