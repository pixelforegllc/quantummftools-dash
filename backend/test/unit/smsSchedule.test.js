const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const SmsSchedule = require('../../src/models/SmsSchedule');

describe('SmsSchedule Model Test', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri(), {});
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await SmsSchedule.deleteMany({});
    });

    it('should create & save schedule successfully', async () => {
        // Create a valid schedule object
        const validScheduleData = {
            template: new mongoose.Types.ObjectId(),
            recipients: [{
                phoneNumber: '+1234567890',
                variables: {
                    name: 'Test User',
                    code: '123456'
                }
            }],
            scheduledTime: new Date(),
            timezone: 'America/New_York',
            status: 'draft',
            createdBy: new mongoose.Types.ObjectId()
        };

        const schedule = new SmsSchedule(validScheduleData);
        const savedSchedule = await schedule.save();
        
        // Verify saved schedule
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
                variables: {
                    name: 'Test User'
                }
            }],
            scheduledTime: new Date(),
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
    });

    it('should require required fields', async () => {
        const scheduleWithMissingFields = {};

        let err;
        try {
            const invalidSchedule = new SmsSchedule(scheduleWithMissingFields);
            await invalidSchedule.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeDefined();
        expect(err.name).toBe('ValidationError');
        expect(err.errors.template).toBeDefined();
        expect(err.errors.recipients).toBeDefined();
        expect(err.errors.scheduledTime).toBeDefined();
    });

    it('should validate timezone', async () => {
        const scheduleWithInvalidTimezone = {
            template: new mongoose.Types.ObjectId(),
            recipients: [{
                phoneNumber: '+1234567890',
                variables: { name: 'Test User' }
            }],
            scheduledTime: new Date(),
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
