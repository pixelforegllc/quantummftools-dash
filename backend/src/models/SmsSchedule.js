const mongoose = require('mongoose');
const { validatePhoneNumber, validateTimezone, validateTimeFormat } = require('../utils/validators');

const recipientSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        validate: {
            validator: validatePhoneNumber,
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    variables: {
        type: Map,
        of: String,
        default: new Map()
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
        validate: {
            validator: validateTimezone,
            message: props => `${props.value} is not a valid timezone!`
        }
    },
    startTime: {
        type: String,
        validate: {
            validator: validateTimeFormat,
            message: props => `${props.value} is not a valid time format (HH:mm)!`
        }
    },
    endTime: {
        type: String,
        validate: {
            validator: validateTimeFormat,
            message: props => `${props.value} is not a valid time format (HH:mm)!`
        }
    }
}, { _id: false });

const smsScheduleSchema = new mongoose.Schema({
    template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SmsTemplate',
        required: true
    },
    recipients: {
        type: [recipientSchema],
        required: true,
        validate: {
            validator: function(v) {
                return Array.isArray(v) && v.length > 0;
            },
            message: 'At least one recipient is required!'
        }
    },
    scheduledTime: {
        type: Date,
        required: true
    },
    timezone: {
        type: String,
        required: true,
        validate: {
            validator: validateTimezone,
            message: props => `${props.value} is not a valid timezone!`
        }
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'in_progress', 'completed', 'cancelled', 'failed'],
        default: 'draft'
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

const SmsSchedule = mongoose.model('SmsSchedule', smsScheduleSchema);

module.exports = SmsSchedule;
