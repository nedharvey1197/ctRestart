const mongoose = require('mongoose');

const trialSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  trialId: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^NCT\d{8}$/.test(v);
      },
      message: 'Invalid trial ID format'
    }
  },
  therapeuticArea: {
    type: String,
    required: true
  },
  phase: {
    type: String,
    enum: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'],
    required: true
  },
  primaryEndpoint: {
    type: String,
    required: true
  },
  targetPopulation: {
    type: String,
    required: true
  },
  businessObjectives: {
    type: String
  },
  trialDescription: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['planning', 'recruiting', 'ongoing', 'completed', 'suspended'],
    default: 'planning'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

trialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Trial', trialSchema); 