import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { connect } from '../utils/sendEmail.js';
import{hashPassword, verifyPassword} from '../utils/passwordUtil.js'

const transporter = connect();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: 'SUCCESS',
    token,
    data: {
      user,
    },
  });
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, passwordConfirm, roles } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        status: 'FAIL',
        message: 'Email already in use',
      });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      passwordConfirm: hashedPassword,
      roles,
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: 'FAIL',
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await verifyPassword(user.password, password))) {
      return res.status(401).json({
        status: 'FAIL',
        message: 'Incorrect email or password',
      });
    }

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        status: 'FAIL',
        message: 'You are not logged in',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({
        status: 'FAIL',
        message: 'The user no longer exists',
      });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({ status: 'FAIL', message: 'Unauthorized' });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'FAIL',
        message: 'Current and new passwords are required',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    const passwordMatch = await verifyPassword(user.password, currentPassword);
    if (!passwordMatch) {
      return res.status(401).json({
        status: 'FAIL',
        message: 'Current password is incorrect',
      });
    }

    const newHashed = await hashPassword(newPassword);
    user.password = newHashed;
    user.passwordConfirm = newHashed;
    await user.save();

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ status: 'FAIL', message: 'No user found' });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_RESET_SECRET, {
      expiresIn: '10m',
    });

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;

    await transporter.sendMail({
      from: 'tutor-time@brevo.com',
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>Reset your password using this link: <a href="${resetURL}">${resetURL}</a></p>`,
    });

    res.status(200).json({
      status: 'SUCCESS',
      message: 'Token sent to email!',
    });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_RESET_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ status: 'FAIL', message: 'Invalid or expired token' });
    }

    user.password = await hashPassword(req.body.password);
    user.passwordConfirm = user.password;
    await user.save();

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({ status: 'FAIL', message: err.message });
  }
};
