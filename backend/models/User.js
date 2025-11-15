const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
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
