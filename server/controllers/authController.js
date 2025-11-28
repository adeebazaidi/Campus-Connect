const asyncHandler = require('express-async-handler');
const { signToken } = require('../config/jwt');
const User = require('../models/User');

const buildAuthResponse = (user) => ({
  token: signToken({ id: user._id, role: user.role }),
  user,
});

const allowedRoles = ['student', 'staff', 'admin'];

exports.registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'student', department } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }

  if (!allowedRoles.includes(role)) {
    res.status(400);
    throw new Error('Invalid role selected');
  }

  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    res.status(400);
    throw new Error('User already exists');
  }

  if (role !== 'admin' && !department) {
    res.status(400);
    throw new Error('Department is required for students and staff');
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role,
    department: role === 'admin' ? undefined : department,
  });

  res.status(201).json(buildAuthResponse(user));
});

exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  
  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await user.matchPassword(password);
  if (!isPasswordValid) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  user.password = undefined;
  res.json(buildAuthResponse(user));
});

exports.getProfile = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});


