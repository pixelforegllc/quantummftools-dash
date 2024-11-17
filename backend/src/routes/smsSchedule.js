const express = require('express');
const router = express.Router();
const smsScheduleController = require('../controllers/smsScheduleController');
const authMiddleware = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all schedules with filtering
router.get('/', smsScheduleController.getSchedules);

// Get schedule statistics
router.get('/stats', smsScheduleController.getScheduleStats);

// Get single schedule
router.get('/:id', smsScheduleController.getSchedule);

// Create new schedule
router.post('/', smsScheduleController.createSchedule);

// Update schedule
router.put('/:id', smsScheduleController.updateSchedule);

// Delete schedule
router.delete('/:id', smsScheduleController.deleteSchedule);

// Cancel schedule
router.post('/:id/cancel', smsScheduleController.cancelSchedule);

module.exports = router;