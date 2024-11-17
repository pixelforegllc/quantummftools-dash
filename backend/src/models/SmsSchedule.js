const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Basic phone number validation (E.164 format)
        return /^\+?[1-9]\d{1,14}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  variables: {
    type: Map,
    of: String
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'cancelled'],
    default: 'pending'
  },
  errorMessage: String,
  sentAt: Date,
  attemptCount: {
    type: Number,
    default: 0
  }
}, { _id: false });

const timeWindowSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: false
  },
  timezone: {
    type: String,
    required: function() { return this.enabled; },
    validate: {
      validator: function(v) {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: v });
          return true;
        } catch (error) {
          return false;
        }
      },
      message: props => `${props.value} is not a valid timezone!`
    }
  },
  startTime: {
    type: String,
    required: function() { return this.enabled; },
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format (HH:mm)!`
    }
  },
  endTime: {
    type: String,
    required: function() { return this.enabled; },
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format (HH:mm)!`
    }
  }
}, { _id: false });

const retryConfigSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: false
  },
  maxAttempts: {
    type: Number,
    required: function() { return this.enabled; },
    min: 1,
    max: 5,
    default: 3
  },
  backoffDelay: {
    type: Number,
    required: function() { return this.enabled; },
    min: 60,    // 1 minute
    max: 3600,  // 1 hour
    default: 300 // 5 minutes
  }
}, { _id: false });

const smsScheduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SmsTemplate',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'in_progress', 'completed', 'cancelled', 'failed'],
    default: 'draft'
  },
  scheduledTime: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Scheduled time must be in the future!'
    }
  },
  timeWindow: timeWindowSchema,
  retryConfig: retryConfigSchema,
  recipients: {
    type: [recipientSchema],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one recipient is required!'
    }
  },
  metadata: {
    type: Map,
    of: String,
    default: new Map()
  },
  stats: {
    total: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
smsScheduleSchema.index({ scheduledTime: 1, status: 1 });
smsScheduleSchema.index({ createdBy: 1 });
smsScheduleSchema.index({ 'recipients.phoneNumber': 1 });

// Update stats before saving
smsScheduleSchema.pre('save', function(next) {
  const stats = {
    total: this.recipients.length,
    pending: 0,
    sent: 0,
    failed: 0,
    cancelled: 0
  };

  this.recipients.forEach(recipient => {
    stats[recipient.status]++;
  });

  this.stats = stats;

  // Update overall status based on recipients
  if (stats.total === stats.sent) {
    this.status = 'completed';
  } else if (stats.total === stats.cancelled) {
    this.status = 'cancelled';
  } else if (stats.failed > 0 && stats.pending === 0 && stats.sent === 0) {
    this.status = 'failed';
  } else if (stats.pending < stats.total && (stats.sent > 0 || stats.failed > 0)) {
    this.status = 'in_progress';
  }

  next();
});

// Method to check if schedule is within time window
smsScheduleSchema.methods.isWithinTimeWindow = function() {
  if (!this.timeWindow.enabled) return true;

  const now = new Date();
  const timezone = this.timeWindow.timezone;
  const currentTime = now.toLocaleTimeString('en-US', { 
    timeZone: timezone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });

  const start = this.timeWindow.startTime;
  const end = this.timeWindow.endTime;

  // Handle time window that spans midnight
  if (start <= end) {
    return currentTime >= start && currentTime <= end;
  } else {
    return currentTime >= start || currentTime <= end;
  }
};

// Method to validate recipient variables against template
smsScheduleSchema.methods.validateRecipientVariables = async function() {
  const template = await mongoose.model('SmsTemplate').findById(this.template);
  if (!template) throw new Error('Template not found');

  const errors = [];
  const requiredVars = template.variables.filter(v => v.required).map(v => v.key);

  this.recipients.forEach((recipient, index) => {
    requiredVars.forEach(varKey => {
      if (!recipient.variables.has(varKey)) {
        errors.push(`Recipient ${index + 1} (${recipient.phoneNumber}) is missing required variable: ${varKey}`);
      }
    });
  });

  return errors;
};

const SmsSchedule = mongoose.model('SmsSchedule', smsScheduleSchema);

module.exports = SmsSchedule;