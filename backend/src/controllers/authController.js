const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const RoutePlan = require('../models/RoutePlan');
const Stop = require('../models/Stop');

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 4) {
      return res.status(400).json({ message: 'Password must be at least 4 characters' });
    }
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });
    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
}

// GET /api/auth/me
function getMe(req, res) {
  res.json({
    user: { id: req.user._id, name: req.user.name, email: req.user.email },
  });
}

// PUT /api/auth/me - Update user details
async function updateMe(req, res) {
  try {
    const { name, email, password } = req.body;
    const updates = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }
      updates.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ message: 'Email cannot be empty' });
      }

      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(409).json({
          message: 'This email is already in use',
        });
      }

      updates.email = normalizedEmail;
    }

    if (password !== undefined) {
      if (typeof password !== 'string' || password.length < 4) {
        return res.status(400).json({
          message: 'Password must be at least 4 characters',
        });
      }

      // Hash the new password before saving it.
      updates.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: 'Provide a name, email or password to update',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    console.error(err);
    res.status(500).json({ message: 'Failed to update user' });
  }
}

// DELETE /api/auth/me - Delete the logged-in user's account
async function deleteMe(req, res) {
  try {
    const userId = req.user._id;

    await User.findByIdAndDelete(userId);

    // Remove this user's saved route history too.
    await RoutePlan.deleteMany({ user: userId });

    // Remove this user's saved stops too.
    await Stop.deleteMany({ user: userId });

    res.json({
      message: 'Account and associated data deleted successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete account' });
  }
}

module.exports = { register, login, getMe, updateMe, deleteMe };
