const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  state: { type: String, required: true },
  district: { type: String, required: true },
});

const horoscopeSchema = new mongoose.Schema({
  birthDateTime: { type: Date, required: true },
  birthPlace: { type: String, required: true },
  sunSign: { type: String, required: true },
  moonSign: { type: String, required: true },
  planetaryPositions: { type:String ,required: true } // Example: { Mars: "Aries", Venus: "Libra" }
});

const userProfileSchema = new mongoose.Schema({
 user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', unique: true },
  fatherName: { type: String, required: true },
  fatherOccupation: { type: String, required: true },
  motherName: { type: String, required: true },
  motherOccupation: { type: String, required: true },
  noOfSiblings: { type: Number, required: true },
  noOfBrothers: { type: Number },
  noOfSisters: { type: Number },
  noOfMarried: { type: Number },
  noOfUnmarried: { type: Number },
  familyClass: { type: String, required: true },
  familyValue: { type: String, required: true },
  userIncome: { type: Number, required: true },
  occupation: { type: String, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  complexion: { type: String, required: true },
  disability: { type: String },
  religion: { type: String, required: true },
  caste: { type: String, required: true },
  subCaste: { type: String, required: true },
  location: locationSchema,
  horoscope: { type: horoscopeSchema, required: true },
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', userProfileSchema);
