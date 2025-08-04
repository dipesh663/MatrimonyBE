const mongoose = require('mongoose');

const userDetailSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },

  religion: {
    type: String,
    enum: ['Hindu', 'Buddhist', 'Muslim', 'Christian', 'Kirat', 'Other'],
    required: true
  },

  caste: {
    type: String,
    enum: [
      'Brahmin', 'Chhetri', 'Newar', 'Tamang', 'Rai', 'Magar',
      'Gurung', 'Sherpa', 'Tharu', 'Madhesi', 'Dalit', 'Other'
    ],
    required: true
  },


  maritialStatus: {
    type: String,
    enum: ['Never Married', 'Divorced', 'Widowed', 'Separated'],
    required: true
  },

  location: {
    type: String,
    required: false,
    trim: true
  },

  height: {
    type: String,
    required: true
  },
  weight: {
    type: String,
    required: true
  },
  bodyType: {
    type: String,
    required: true
  },

  complexion: {
    type: String,
    enum: ['Fair', 'Wheatish', 'Dark'],
    required: true
  },

  hobbies: {
    type: [String],
    required: true
  },

  about: {
    type: String,
    required: true
  },

  profilePicture: {
    type: String,
    default: null
  }

});

module.exports = mongoose.model('userDetail', userDetailSchema);
