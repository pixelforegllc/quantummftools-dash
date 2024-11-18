// Phone number validation (E.164 format)
const validatePhoneNumber = (number) => {
    return /^\+?[1-9]\d{1,14}$/.test(number);
};

// Timezone validation
const validateTimezone = (timezone) => {
    try {
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
        return true;
    } catch (error) {
        return false;
    }
};

// Time format validation (HH:mm)
const validateTimeFormat = (time) => {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

module.exports = {
    validatePhoneNumber,
    validateTimezone,
    validateTimeFormat
};
