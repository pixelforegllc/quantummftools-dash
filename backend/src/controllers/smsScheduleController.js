const SmsSchedule = require('../models/SmsSchedule');
const SmsTemplate = require('../models/SmsTemplate');
const logger = require('../utils/logger');
const { validateSmsSchedule } = require('../utils/validation');

class SmsScheduleController {
  // Get all schedules with filtering
  async getSchedules(req, res) {
    try {
      const {
        status,
        template,
        search,
        startDate,
        endDate,
        page = 1,
        limit = 10,
        sortBy = 'scheduledTime',
        sortOrder = 'asc'
      } = req.query;

      const query = {};

      // Apply filters
      if (status) query.status = status;
      if (template) query.template = template;
      if (startDate) query.scheduledTime = { $gte: new Date(startDate) };
      if (endDate) {
        query.scheduledTime = {
          ...query.scheduledTime,
          $lte: new Date(endDate)
        };
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { 'recipients.phoneNumber': { $regex: search, $options: 'i' } }
        ];
      }

      const [schedules, total] = await Promise.all([
        SmsSchedule.find(query)
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
          .populate('template', 'name')
          .populate('createdBy', 'username')
          .populate('updatedBy', 'username'),
        SmsSchedule.countDocuments(query)
      ]);

      res.json({
        schedules,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching schedules:', error);
      res.status(500).json({ error: 'Failed to fetch schedules' });
    }
  }

  // Get single schedule
  async getSchedule(req, res) {
    try {
      const schedule = await SmsSchedule.findById(req.params.id)
        .populate('template')
        .populate('createdBy', 'username')
        .populate('updatedBy', 'username');

      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      res.json(schedule);
    } catch (error) {
      logger.error('Error fetching schedule:', error);
      res.status(500).json({ error: 'Failed to fetch schedule' });
    }
  }

  // Create new schedule
  async createSchedule(req, res) {
    try {
      // Validate schedule data
      const validationError = await validateSmsSchedule(req.body);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      // Create schedule instance
      const schedule = new SmsSchedule({
        ...req.body,
        createdBy: req.user.id
      });

      // Validate recipient variables against template
      const variableErrors = await schedule.validateRecipientVariables();
      if (variableErrors.length > 0) {
        return res.status(400).json({ error: variableErrors.join(', ') });
      }

      await schedule.save();

      await schedule.populate('template');
      await schedule.populate('createdBy', 'username');

      res.status(201).json(schedule);
    } catch (error) {
      logger.error('Error creating schedule:', error);
      res.status(500).json({ error: 'Failed to create schedule' });
    }
  }

  // Update schedule
  async updateSchedule(req, res) {
    try {
      const schedule = await SmsSchedule.findById(req.params.id);

      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      // Prevent updates to non-draft schedules
      if (schedule.status !== 'draft' && req.body.status === undefined) {
        return res.status(400).json({ error: 'Only draft schedules can be updated' });
      }

      // Validate updated data
      const validationError = await validateSmsSchedule(req.body);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      // Update fields
      Object.assign(schedule, {
        ...req.body,
        updatedBy: req.user.id
      });

      // Validate recipient variables if template or recipients changed
      if (req.body.template || req.body.recipients) {
        const variableErrors = await schedule.validateRecipientVariables();
        if (variableErrors.length > 0) {
          return res.status(400).json({ error: variableErrors.join(', ') });
        }
      }

      await schedule.save();

      await schedule.populate('template');
      await schedule.populate('createdBy', 'username');
      await schedule.populate('updatedBy', 'username');

      res.json(schedule);
    } catch (error) {
      logger.error('Error updating schedule:', error);
      res.status(500).json({ error: 'Failed to update schedule' });
    }
  }

  // Delete schedule
  async deleteSchedule(req, res) {
    try {
      const schedule = await SmsSchedule.findById(req.params.id);

      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      // Only allow deletion of draft or cancelled schedules
      if (!['draft', 'cancelled'].includes(schedule.status)) {
        return res.status(400).json({ 
          error: 'Only draft or cancelled schedules can be deleted' 
        });
      }

      await schedule.remove();

      res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
      logger.error('Error deleting schedule:', error);
      res.status(500).json({ error: 'Failed to delete schedule' });
    }
  }

  // Cancel schedule
  async cancelSchedule(req, res) {
    try {
      const schedule = await SmsSchedule.findById(req.params.id);

      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      // Only allow cancellation of scheduled or in_progress schedules
      if (!['scheduled', 'in_progress'].includes(schedule.status)) {
        return res.status(400).json({ 
          error: 'Only scheduled or in-progress schedules can be cancelled' 
        });
      }

      // Update recipients status to cancelled
      schedule.recipients.forEach(recipient => {
        if (recipient.status === 'pending') {
          recipient.status = 'cancelled';
        }
      });

      schedule.status = 'cancelled';
      schedule.updatedBy = req.user.id;

      await schedule.save();

      await schedule.populate('template');
      await schedule.populate('createdBy', 'username');
      await schedule.populate('updatedBy', 'username');

      res.json(schedule);
    } catch (error) {
      logger.error('Error cancelling schedule:', error);
      res.status(500).json({ error: 'Failed to cancel schedule' });
    }
  }

  // Get schedule statistics
  async getScheduleStats(req, res) {
    try {
      const stats = await SmsSchedule.aggregate([
        {
          $group: {
            _id: null,
            totalSchedules: { $sum: 1 },
            completedSchedules: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            inProgressSchedules: {
              $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
            },
            failedSchedules: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            },
            totalMessages: { $sum: '$stats.total' },
            sentMessages: { $sum: '$stats.sent' },
            failedMessages: { $sum: '$stats.failed' },
            averageRecipients: { $avg: '$stats.total' }
          }
        },
        {
          $project: {
            _id: 0,
            totalSchedules: 1,
            completedSchedules: 1,
            inProgressSchedules: 1,
            failedSchedules: 1,
            totalMessages: 1,
            sentMessages: 1,
            failedMessages: 1,
            averageRecipients: { $round: ['$averageRecipients', 1] },
            successRate: {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$sentMessages', '$totalMessages'] },
                    100
                  ]
                },
                1
              ]
            }
          }
        }
      ]);

      if (stats.length === 0) {
        return res.json({
          totalSchedules: 0,
          completedSchedules: 0,
          inProgressSchedules: 0,
          failedSchedules: 0,
          totalMessages: 0,
          sentMessages: 0,
          failedMessages: 0,
          averageRecipients: 0,
          successRate: 0
        });
      }

      res.json(stats[0]);
    } catch (error) {
      logger.error('Error fetching schedule stats:', error);
      res.status(500).json({ error: 'Failed to fetch schedule statistics' });
    }
  }
}

module.exports = new SmsScheduleController();