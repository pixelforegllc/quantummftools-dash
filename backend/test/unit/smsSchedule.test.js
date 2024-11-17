const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { SmsSchedule } = require('../../src/models/SmsSchedule');

describe('SmsSchedule Model Test', () => {
    let mongod;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongod.stop();
    });

    it('should create & save schedule successfully', async () => {
        const validSchedule = new SmsSchedule({
            templateId: new mongoose.Types.ObjectId(),
            recipientNumber: '+1234567890',
            scheduledTime: new Date(),
            timezone: 'America/New_York',
            status: 'pending'
        });
        const savedSchedule = await validSchedule.save();
        
        expect(savedSchedule._id).toBeDefined();
        expect(savedSchedule.recipientNumber).toBe(validSchedule.recipientNumber);
        expect(savedSchedule.status).toBe('pending');
    });

    it('should fail to save with invalid phone number', async () => {
        const scheduleWithInvalidPhone = new SmsSchedule({
            templateId: new mongoose.Types.ObjectId(),
            recipientNumber: 'invalid',
            scheduledTime: new Date(),
            timezone: 'America/New_York'
        });

        let err;
        try {
            await scheduleWithInvalidPhone.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    });
});