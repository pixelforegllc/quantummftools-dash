const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
    service: {
        type: String,
        required: true,
        enum: ['zoho', 'infobip'],
        lowercase: true
    },
    apiKey: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUsed: {
        type: Date
    }
}, { timestamps: true });

// Encrypt API key before saving
apiKeySchema.pre('save', async function(next) {
    if (this.isModified('apiKey')) {
        // In production, you'd want to encrypt this
        // this.apiKey = await encrypt(this.apiKey);
    }
    next();
});

module.exports = mongoose.model('ApiKey', apiKeySchema);