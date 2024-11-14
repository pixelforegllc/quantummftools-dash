const mongoose = require('mongoose');

const variablePlaceholderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  key: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  required: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const smsTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Check if content length is within SMS limits (160 chars for single SMS)
        return v.length <= 1600; // Allow up to 10 concatenated messages
      },
      message: 'Template content exceeds maximum length (1600 characters)'
    }
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  variables: [variablePlaceholderSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr'], // Add more languages as needed
  },
  senderId: {
    type: String,
    trim: true
  },
  metadata: {
    type: Map,
    of: String,
    default: new Map()
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date
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
smsTemplateSchema.index({ category: 1, tags: 1 });
smsTemplateSchema.index({ createdAt: -1 });
smsTemplateSchema.index({ usageCount: -1 });

// Virtual for preview with sample data
smsTemplateSchema.virtual('preview').get(function() {
  let preview = this.content;
  this.variables.forEach(variable => {
    const placeholder = `{{${variable.key}}}`;
    const sampleValue = `[${variable.name}]`;
    preview = preview.replace(new RegExp(placeholder, 'g'), sampleValue);
  });
  return preview;
});

// Method to validate template variables
smsTemplateSchema.methods.validateVariables = function(data) {
  const errors = [];
  this.variables.forEach(variable => {
    if (variable.required && !data[variable.key]) {
      errors.push(`Missing required variable: ${variable.name} (${variable.key})`);
    }
  });
  return errors;
};

// Method to compile template with actual data
smsTemplateSchema.methods.compile = function(data) {
  const validationErrors = this.validateVariables(data);
  if (validationErrors.length > 0) {
    throw new Error('Template validation failed: ' + validationErrors.join(', '));
  }

  let compiledContent = this.content;
  this.variables.forEach(variable => {
    const placeholder = `{{${variable.key}}}`;
    const value = data[variable.key] || '';
    compiledContent = compiledContent.replace(new RegExp(placeholder, 'g'), value);
  });

  return compiledContent;
};

// Pre-save middleware to extract and validate variables
smsTemplateSchema.pre('save', function(next) {
  // Extract variables from content
  const variableRegex = /{{([^}]+)}}/g;
  const matches = this.content.matchAll(variableRegex);
  const foundVariables = new Set();

  for (const match of matches) {
    foundVariables.add(match[1]);
  }

  // Validate that all declared variables are used in content
  this.variables.forEach(variable => {
    if (!foundVariables.has(variable.key)) {
      next(new Error(`Declared variable "${variable.key}" is not used in template content`));
    }
  });

  // Validate that all used variables are declared
  foundVariables.forEach(key => {
    if (!this.variables.find(v => v.key === key)) {
      next(new Error(`Used variable "${key}" is not declared in template variables`));
    }
  });

  next();
});

// Update usage statistics
smsTemplateSchema.methods.recordUsage = async function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  await this.save();
};

const SmsTemplate = mongoose.model('SmsTemplate', smsTemplateSchema);

module.exports = SmsTemplate;