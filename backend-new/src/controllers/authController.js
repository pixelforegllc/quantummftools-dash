const User = require('../models/User');
const { ActiveDirectory } = require('activedirectory2');
const config = require('../config/ad.config');
const logger = require('../utils/logger');

const ad = new ActiveDirectory(config.ad);

class AuthController {
  // Local authentication
  async login(req, res) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });

      if (!user || !(await user.validatePassword(password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: 'Account is disabled' });
      }

      const token = user.generateAuthToken();
      user.lastLogin = new Date();
      await user.save();

      res.json({ user, token });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  // AD authentication
  async adLogin(req, res) {
    try {
      const { username, password } = req.body;

      // Authenticate with AD
      const adUser = await new Promise((resolve, reject) => {
        ad.authenticate(username + config.ad.domain, password, async (err, auth) => {
          if (err) {
            logger.error('AD Authentication error:', err);
            return reject(err);
          }
          
          if (auth) {
            ad.findUser(username, (err, user) => {
              if (err) {
                logger.error('AD Find user error:', err);
                return reject(err);
              }
              resolve(user);
            });
          } else {
            reject(new Error('Authentication failed'));
          }
        });
      });

      if (!adUser) {
        return res.status(401).json({ error: 'AD authentication failed' });
      }

      // Find or create local user
      let user = await User.findOne({ adUsername: username });
      
      if (!user) {
        user = new User({
          username: username,
          email: adUser.mail,
          adUsername: username,
          password: Math.random().toString(36), // Random password for AD users
          role: 'user' // Default role
        });
        await user.save();
      }

      if (!user.isActive) {
        return res.status(403).json({ error: 'Account is disabled' });
      }

      const token = user.generateAuthToken();
      user.lastLogin = new Date();
      await user.save();

      res.json({ user, token });
    } catch (error) {
      logger.error('AD Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  // Get current user
  async me(req, res) {
    try {
      res.json(req.user);
    } catch (error) {
      logger.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user information' });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      // In a more complex system, you might want to invalidate the token here
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  // Change password (for local users)
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id);

      if (user.adUsername) {
        return res.status(400).json({ error: 'AD users cannot change password here' });
      }

      if (!(await user.validatePassword(currentPassword))) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
}

module.exports = new AuthController();