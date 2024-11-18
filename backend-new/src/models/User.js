const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'manager'],
    default: 'user'
  },
  adUsername: {
    type: String,
    sparse: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  permissions: [{
    type: String
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  const user = this;
  const token = jwt.sign(
    { 
      _id: user._id.toString(),
      role: user.role,
      permissions: user.permissions
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '24h' }
  );
  return token;
};

// Validate password
userSchema.methods.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Remove sensitive information when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;