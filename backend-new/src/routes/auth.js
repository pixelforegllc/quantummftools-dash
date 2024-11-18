const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { validateLogin, validatePasswordChange } = require('../middleware/validation');

// Authentication routes
router.post('/login', validateLogin, authController.login);
router.post('/ad-login', validateLogin, authController.adLogin);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.me);
router.post('/change-password', auth, validatePasswordChange, authController.changePassword);

module.exports = router;