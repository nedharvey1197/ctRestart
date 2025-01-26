const mongoose = require('mongoose');

const trialAnalyticsSchema = new mongoose.Schema({
  totalTrials: Number,
  registeredTrials: Number,
  preRegistrationTrials: Number,
  phaseDistribution: Map,
  therapeuticAreas: Map,
  interventions: Map,
  enrollmentStats: {
    total: Number,
    average: Number,
    median: Number
  },
  statusSummary: Map
});

const companySchema = new mongoose.Schema({
  // Basic info
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  companyWebsite: {
    type: String,
    required: true,
    trim: true
  },
  companySize: {
    type: String,
    enum: ['Small (<50 employees)', 'Medium (50-250 employees)', 'Large (251-1000 employees)', 'Enterprise (1000+ employees)'],
    required: false
  },
  headquarters: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    required: true,
    trim: true
  },
  therapeuticAreas: {
    type: [String],
    default: []
  },
  
  // Enriched data
  enrichedData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Contextual data
  contextualData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  lastEnriched: {
    type: Date
  },

  enrichmentStatus: {
    type: String,
    enum: ['none', 'pending', 'completed', 'failed'],
    default: 'none'
  },

  clinicalTrials: [{
    protocolSection: {
      identificationModule: {
        nctId: String,
        briefTitle: String
      },
      statusModule: {
        overallStatus: String,
        startDateStruct: { date: String },
        completionDateStruct: { date: String }
      },
      sponsorCollaboratorsModule: {
        leadSponsor: { name: String }
      },
      designModule: {
        phases: [String],
        enrollmentInfo: { count: Number }
      }
    }
  }],
  trialAnalytics: trialAnalyticsSchema,
  lastAnalyzed: Date,

  trialAnalysis: {
    lastUpdated: Date,
    rawAnalysis: Object, // Store complete CTA JSON
    studies: [{
      nctId: String,
      title: String,
      status: String,
      phase: String,
      startDate: Date,
      completionDate: Date,
      conditions: [String],
      interventions: [String]
    }],
    analytics: {
      phaseDistribution: Object,
      statusSummary: Object,
      therapeuticAreas: Object
    }
  },

  workspaceId: {
    type: String,
    required: true,
    index: true
  },
  workspaceConfig: {
    isolationType: {
      type: String,
      enum: ['full', 'shared', 'reference'],
      default: 'full'
    },
    sharedResources: [{
      type: String,
      ref: 'Resource'
    }]
  }
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
companySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Company', companySchema); 