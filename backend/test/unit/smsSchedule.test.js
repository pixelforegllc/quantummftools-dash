const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const SmsSchedule = require('../../src/models/SmsSchedule');

describe('SmsSchedule Model Test', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await SmsSchedule.deleteMany({});
    });

    it('should create & save schedule successfully', async () => {
        const validScheduleData = {
            template: new mongoose.Types.ObjectId(),
            recipients: [{
                phoneNumber: '+1234567890',
                variables: new Map([['name', 'Test User']])
            }],
            scheduledTime: new Date(Date.now() + 86400000), // tomorrow
            timezone: 'America/New_York',
            status: 'draft',
            createdBy: new mongoose.Types.ObjectId()
        };

        const schedule = new SmsSchedule(validScheduleData);
        const savedSchedule = await schedule.save();
        
        expect(savedSchedule._id).toBeDefined();
        expect(savedSchedule.status).toBe('draft');
        expect(savedSchedule.recipients[0].phoneNumber).toBe('+1234567890');
        expect(savedSchedule.timezone).toBe('America/New_York');
    });

    it('should fail to save with invalid phone number', async () => {
        const scheduleWithInvalidPhone = {
            template: new mongoose.Types.ObjectId(),
            recipients: [{
                phoneNumber: 'invalid',
                variables: new Map()
            }],
            scheduledTime: new Date(Date.now() + 86400000),
            timezone: 'America/New_York',
            status: 'draft',
            createdBy: new mongoose.Types.ObjectId()
        };

        let err;
        try {
            const invalidSchedule = new SmsSchedule(scheduleWithInvalidPhone);
            await invalidSchedule.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeDefined();
        expect(err.name).toBe('ValidationError');
        expect(err.errors['recipients.0.phoneNumber']).toBeDefined();
    });

    it('should validate timezone', async () => {
        const scheduleWithInvalidTimezone = {
            template: new mongoose.Types.ObjectId(),
            recipients: [{
                phoneNumber: '+1234567890',
                variables: new Map()
            }],
            scheduledTime: new Date(Date.now() + 86400000),
            timezone: 'Invalid/Timezone',
            status: 'draft',
            createdBy: new mongoose.Types.ObjectId()
        };

        let err;
        try {
            const invalidSchedule = new SmsSchedule(scheduleWithInvalidTimezone);
            await invalidSchedule.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeDefined();
        expect(err.name).toBe('ValidationError');
        expect(err.errors.timezone).toBeDefined();
    });
});
