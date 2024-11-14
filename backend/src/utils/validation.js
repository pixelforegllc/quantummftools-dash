const validateTemplate = (data) => {
  const {
    name,
    content,
    category,
    variables = [],
    senderId,
    language
  } = data;

  // Validate required fields
  if (!name || typeof name !== 'string' || name.length < 3 || name.length > 100) {
    return 'Invalid template name. Must be between 3 and 100 characters.';
  }

  if (!content || typeof content !== 'string' || content.length > 1600) {
    return 'Invalid template content. Must not exceed 1600 characters.';
  }

  if (!category || typeof category !== 'string') {
    return 'Invalid category.';
  }

  // Validate language
  const validLanguages = ['en', 'es', 'fr'];
  if (language && !validLanguages.includes(language)) {
    return 'Invalid language code.';
  }

  // Validate sender ID format if provided
  if (senderId && (typeof senderId !== 'string' || senderId.length > 11 || !/^[a-zA-Z0-9]+$/.test(senderId))) {
    return 'Invalid sender ID. Must be alphanumeric and not exceed 11 characters.';
  }

  // Validate variables
  if (!Array.isArray(variables)) {
    return 'Variables must be an array.';
  }

  const variableKeys = new Set();
  for (const variable of variables) {
    // Check variable structure
    if (!variable.name || !variable.key) {
      return 'Each variable must have a name and key.';
    }

    // Check for duplicate keys
    if (variableKeys.has(variable.key)) {
      return `Duplicate variable key: ${variable.key}`;
    }
    variableKeys.add(variable.key);

    // Validate key format
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(variable.key)) {
      return `Invalid variable key format: ${variable.key}. Must start with a letter and contain only letters, numbers, and underscores.`;
    }
  }

  // Check if all variables in content are defined
  const contentVariables = content.match(/{{([^}]+)}}/g) || [];
  const undefinedVariables = contentVariables.filter(v => {
    const key = v.replace(/[{}]/g, '');
    return !variables.find(variable => variable.key === key);
  });

  if (undefinedVariables.length > 0) {
    return `Undefined variables in content: ${undefinedVariables.join(', ')}`;
  }

  // Check if all defined variables are used in content
  const unusedVariables = variables.filter(v => !content.includes(`{{${v.key}}}`));
  if (unusedVariables.length > 0) {
    return `Unused variables defined: ${unusedVariables.map(v => v.key).join(', ')}`;
  }

  return null;
};

const validateSmsSchedule = (data) => {
  const {
    templateId,
    recipients,
    scheduledTime,
    timeWindow,
    retryConfig
  } = data;

  // Validate template ID
  if (!templateId || typeof templateId !== 'string') {
    return 'Invalid template ID.';
  }

  // Validate recipients
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return 'Recipients must be a non-empty array.';
  }

  for (const recipient of recipients) {
    if (!recipient.phoneNumber || !recipient.variables) {
      return 'Each recipient must have a phone number and variables.';
    }

    // Basic phone number validation
    if (!/^\+?[1-9]\d{1,14}$/.test(recipient.phoneNumber)) {
      return `Invalid phone number format: ${recipient.phoneNumber}`;
    }
  }

  // Validate scheduled time
  const scheduledDate = new Date(scheduledTime);
  if (isNaN(scheduledDate.getTime())) {
    return 'Invalid scheduled time.';
  }

  if (scheduledDate < new Date()) {
    return 'Scheduled time must be in the future.';
  }

  // Validate time window if provided
  if (timeWindow) {
    const { start, end, timezone } = timeWindow;

    if (!start || !end || !timezone) {
      return 'Time window must include start, end, and timezone.';
    }

    // Validate time format (HH:mm)
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(start) ||
        !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(end)) {
      return 'Invalid time window format. Use HH:mm format.';
    }

    // Basic timezone validation
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
    } catch (error) {
      return 'Invalid timezone.';
    }
  }

  // Validate retry configuration if provided
  if (retryConfig) {
    const { maxAttempts, backoffDelay } = retryConfig;

    if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 5) {
      return 'Max attempts must be between 1 and 5.';
    }

    if (!Number.isInteger(backoffDelay) || backoffDelay < 60 || backoffDelay > 3600) {
      return 'Backoff delay must be between 60 and 3600 seconds.';
    }
  }

  return null;
};

module.exports = {
  validateTemplate,
  validateSmsSchedule
};