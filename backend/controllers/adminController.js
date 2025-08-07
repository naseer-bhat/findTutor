// Controllers/adminController.js
import crypto from 'crypto';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Message from '../models/Message.js';
import { connect } from '../utils/sendEmail.js';

const transporter = connect();

export const setRole = (role) => (req, res, next) => {
  req.body.roles = role;
  next();
};

const oneTimePasswordCreator = () => {
  return crypto.randomBytes(32).toString('hex');
};

const filterObj = (obj) => {
  const newObj = {};
  const notAllowed = ['email', 'roles'];
  Object.keys(obj).forEach((el) => {
    if (!notAllowed.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

export const allow = (...roles) => (req, res, next) => {
  if (roles.includes(req.user.role)) {
    next();
  } else {
    res.status(401).json({
      status: 'FAIL',
      message: 'Admin-only access',
    });
  }
};

export const createTeacher = async (req, res) => {
  try {
    const user = {
      email: req.body.email,
      name: req.body.name,
      department: req.body.department,
      subject: req.body.subject,
      age: req.body.age,
      roles: req.body.roles,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    };

    const existing = await User.findOne({ email: user.email });
    if (existing) {
      return res.status(400).json({
        status: 'FAIL',
        message: 'Email already in use',
      });
    }

    const newUser = await User.create(user);

    return res.status(200).json({
      status: 'SUCCESS',
      data: { newUser },
    });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

export const getAllTeachers = async (req, res) => {
  try {
    const users = await User.find({ roles: 'teacher' }).populate('appointments');
    res.status(200).json({ status: 'SUCCESS', data: { users } });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

export const getTeacher = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json({ status: 'SUCCESS', data: { user } });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const updateObj = filterObj(req.body);
    const user = await User.findByIdAndUpdate(req.params.id, updateObj, { new: true });
    res.status(200).json({ status: 'SUCCESS', data: { user } });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'FAIL', message: 'User not found' });
    }
    await User.findByIdAndDelete(userId);
    await Appointment.deleteMany({ sendBy: user.email });
    await Message.deleteMany({ $or: [{ from: user.email }, { to: user.email }] });

    res.status(200).json({
      status: 'SUCCESS',
      message: 'User, related appointments, and messages deleted',
    });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

export const approveStudent = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { admissionStatus: true });
    const studentEmail = await User.findById(req.params.id).select('email');

    await transporter.sendMail({
      from: 'tutor-time@brevo.com',
      to: studentEmail.email,
      subject: 'Appointment Accepted',
      html: `
        <h2>Congratulations!</h2>
        <p>Your account has been approved on TUTOR-TIME.</p>
        <p>You can now access all the features and resources available to students.</p>
        <p>Best regards,</p>
        <p>From TUTOR-TIME</p>
      `,
    });

    res.status(200).json({ message: 'Student Approved' });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: 'SUCCESS', message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};
