const mongoose = require('mongoose');

const basicDetailsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  qualification: { type: String },
  hobbies: { type: String },
  interest: { type: String },
  drinkingHabits: { type: String },
  smokingHabits: { type: String },
  profilePicture: { type: String },
  multipleImages: { type: [String] },
  shortReel: { type: String }
});

const userRegisterSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', unique: true },
  basicDetails: { type: basicDetailsSchema, required: true }
});

// Virtual for age based on dateOfBirth
userRegisterSchema.virtual('basicDetails.age').get(function() {
  if (!this.basicDetails || !this.basicDetails.dateOfBirth) return null;
  const dob = new Date(this.basicDetails.dateOfBirth);
  const diff = Date.now() - dob.getTime();
  const ageDt = new Date(diff);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
});

// Ensure virtuals are included in JSON and Object outputs
userRegisterSchema.set('toJSON', { virtuals: true });
userRegisterSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('UserRegister', userRegisterSchema);