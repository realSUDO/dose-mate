const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Authentication fields
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Profile fields (optional for new users)
  name: { type: String },
  age: { type: Number },
  medicalConditions: [String],
  currentMedications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date
  }],
  preferences: {
    aiPersonality: String,
    reminderFrequency: String,
    voicePreference: String
  },
  emergencyContact: String,
  conversations: [{
    timestamp: { type: Date, default: Date.now },
    userMessage: String,
    aiResponse: String,
    context: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
