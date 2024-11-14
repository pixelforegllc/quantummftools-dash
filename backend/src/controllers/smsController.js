const SmsTemplate = require('../models/SmsTemplate');
const logger = require('../utils/logger');
const { validateTemplate } = require('../utils/validation');

class SmsController {
  // Get all templates with filtering
  async getTemplates(req, res) {
    try {
      const {
        category,
        language,
        status,
        search,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const query = {};
      if (category) query.category = category;
      if (language) query.language = language;
      if (status === 'active') query.isActive = true;
      if (status === 'inactive') query.isActive = false;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ];
      }

      const [templates, total] = await Promise.all([
        SmsTemplate.find(query)
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
          .populate('createdBy', 'username')
          .populate('updatedBy', 'username'),
        SmsTemplate.countDocuments(query)
      ]);

      res.json({
        templates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  }

  // Get single template
  async getTemplate(req, res) {
    try {
      const template = await SmsTemplate.findById(req.params.id)
        .populate('createdBy', 'username')
        .populate('updatedBy', 'username');

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json(template);
    } catch (error) {
      logger.error('Error fetching template:', error);
      res.status(500).json({ error: 'Failed to fetch template' });
    }
  }

  // Create new template
  async createTemplate(req, res) {
    try {
      const validationError = validateTemplate(req.body);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      const template = new SmsTemplate({
        ...req.body,
        createdBy: req.user.id
      });

      await template.save();
      
      await template.populate('createdBy', 'username');
      
      res.status(201).json(template);
    } catch (error) {
      logger.error('Error creating template:', error);
      res.status(500).json({ error: 'Failed to create template' });
    }
  }

  // Update template
  async updateTemplate(req, res) {
    try {
      const validationError = validateTemplate(req.body);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      const template = await SmsTemplate.findById(req.params.id);
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Update fields
      Object.assign(template, {
        ...req.body,
        updatedBy: req.user.id
      });

      await template.save();
      
      await template.populate('createdBy', 'username');
      await template.populate('updatedBy', 'username');

      res.json(template);
    } catch (error) {
      logger.error('Error updating template:', error);
      res.status(500).json({ error: 'Failed to update template' });
    }
  }

  // Delete template
  async deleteTemplate(req, res) {
    try {
      const template = await SmsTemplate.findById(req.params.id);
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      await template.remove();
      
      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      logger.error('Error deleting template:', error);
      res.status(500).json({ error: 'Failed to delete template' });
    }
  }

  // Clone template
  async cloneTemplate(req, res) {
    try {
      const sourceTemplate = await SmsTemplate.findById(req.params.id);
      
      if (!sourceTemplate) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Create new template object without _id and timestamps
      const templateData = sourceTemplate.toObject();
      delete templateData._id;
      delete templateData.createdAt;
      delete templateData.updatedAt;
      delete templateData.usageCount;
      delete templateData.lastUsed;

      // Add clone indicator to name
      templateData.name = `${templateData.name} (Clone)`;
      templateData.createdBy = req.user.id;

      const newTemplate = new SmsTemplate(templateData);
      await newTemplate.save();
      
      await newTemplate.populate('createdBy', 'username');

      res.status(201).json(newTemplate);
    } catch (error) {
      logger.error('Error cloning template:', error);
      res.status(500).json({ error: 'Failed to clone template' });
    }
  }

  // Preview template with sample data
  async previewTemplate(req, res) {
    try {
      const { content, variables, data } = req.body;

      // Create temporary template instance for preview
      const template = new SmsTemplate({
        content,
        variables,
        name: 'Preview Template'
      });

      try {
        const compiledContent = template.compile(data);
        res.json({ preview: compiledContent });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    } catch (error) {
      logger.error('Error previewing template:', error);
      res.status(500).json({ error: 'Failed to preview template' });
    }
  }

  // Get template statistics
  async getTemplateStats(req, res) {
    try {
      const stats = await SmsTemplate.aggregate([
        {
          $group: {
            _id: null,
            totalTemplates: { $sum: 1 },
            activeTemplates: {
              $sum: { $cond: ['$isActive', 1, 0] }
            },
            totalUsage: { $sum: '$usageCount' },
            avgVariables: { $avg: { $size: '$variables' } },
            categoryBreakdown: {
              $push: '$category'
            }
          }
        },
        {
          $project: {
            _id: 0,
            totalTemplates: 1,
            activeTemplates: 1,
            totalUsage: 1,
            avgVariables: { $round: ['$avgVariables', 1] },
            categoryBreakdown: 1
          }
        }
      ]);

      if (stats.length === 0) {
        return res.json({
          totalTemplates: 0,
          activeTemplates: 0,
          totalUsage: 0,
          avgVariables: 0,
          categoryBreakdown: {}
        });
      }

      // Process category breakdown
      const categoryCount = stats[0].categoryBreakdown.reduce((acc, category) => {
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      res.json({
        ...stats[0],
        categoryBreakdown: categoryCount
      });
    } catch (error) {
      logger.error('Error fetching template stats:', error);
      res.status(500).json({ error: 'Failed to fetch template statistics' });
    }
  }
}

module.exports = new SmsController();