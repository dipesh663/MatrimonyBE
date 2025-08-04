const mongoose = require('mongoose');

const horoscopeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Basic birth info
  birthDate: {
    type: Date,
    required: [true, 'Birth date is required']
  },
  birthYear: {
    type: String,
    trim: true
  },
  birthMonth: {
    type: String,
    trim: true
  },
  birthDay: {
    type: String,
    trim: true
  },
  birthTime: {
    type: String, // Format: "HH:mm"
    required: [true, 'Birth time is required'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please enter valid time in HH:mm format']
  },
  birthPlace: {
    type: String,
    required: [true, 'Birth place is required'],
    trim: true
  },

  // Astrological info
  rashi: {
    type: String,
    enum: [
      'Mesh', 'Brish', 'Mithun', 'Karkat', 'Singha', 'Kanya',
      'Tula', 'Brischik', 'Dhanu', 'Makar', 'Kumbha', 'Meen'
    ],
    trim: true,
    index: true
  },
  nakshatra: {
    type: String,
    enum: [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha',
      'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
      'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra',
      'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula',
      'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
      'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ],
    index: true
  },
  gotra: {
    type: String,
    enum: [
      'Bharadwaja', 'Kashyapa', 'Vashistha', 'Vishwamitra', 'Atri',
      'Angirasa', 'Agastya', 'Shandilya', 'Gautam', 'Parashara',
      'Bhrigu', 'Kaushika', 'Jamdagni', 'Marichi'
    ],
    trim: true,
    index: true
  },

  // Optional: Kundli file upload
  kundliUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        return !v || /^(ftp|http|https):\/\/[^ "]+$/.test(v);
      },
      message: 'Please enter a valid URL'
    }
  },

  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },

  // Optional: Match score for compatibility
  matchScore: {
    type: Number,
    min: 0,
    max: 100
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field (optional)
horoscopeSchema.virtual('birthInfo').get(function () {
  if (!this.birthDate || !this.birthTime || !this.birthPlace) return null;
  const dateStr = this.birthDate.toISOString().split('T')[0];
  return `${dateStr} ${this.birthTime} at ${this.birthPlace}`;
});

module.exports = mongoose.model('Horoscope', horoscopeSchema);
