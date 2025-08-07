import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

// GET /api/v1/teachers/
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' });
    res.status(200).json({ status: 'SUCCESS', data: { students } });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

// POST /api/v1/teachers/schedule
export const createAppointment = async (req, res) => {
  try {
    const { date, time, subject, description, sendTo } = req.body;

    const appointment = await Appointment.create({
      date,
      time,
      subject,
      description,
      sendBy: req.user.email,
      sendTo,
      teacher: req.user._id,
    });

    res.status(201).json({
      status: 'SUCCESS',
      data: { appointment },
    });
  } catch (err) {
    res.status(500).json({
      status: 'FAIL',
      message: err.message,
    });
  }
};

// GET /api/v1/teachers/schedule
export const getAllAppointments = async (req, res) => {
  try {
    const filter = req.user.role === 'teacher'
      ? { teacher: req.user._id }
      : {};
    const appointments = await Appointment.find(filter);

    res.status(200).json({
      status: 'SUCCESS',
      data: { appointments },
    });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

// DELETE /api/v1/teachers/reschedule/:id
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        status: 'FAIL',
        message: 'Appointment not found',
      });
    }

    res.status(200).json({
      status: 'SUCCESS',
      message: 'Appointment deleted',
    });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

// PATCH /api/v1/teachers/changeApprovalStatus/:id/:studentId
export const approveAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        status: 'FAIL',
        message: 'Appointment not found',
      });
    }

    res.status(200).json({
      status: 'SUCCESS',
      data: { appointment },
    });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

// DELETE /api/v1/teachers/changeApprovalStatus/:id/:studentId
export const dissapproveAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { approved: false },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        status: 'FAIL',
        message: 'Appointment not found',
      });
    }

    res.status(200).json({
      status: 'SUCCESS',
      data: { appointment },
    });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

// GET /api/v1/teachers/getAllPendingStudents
export const getAllPendingStudents = async (req, res) => {
  try {
    const pendingAppointments = await Appointment.find({
      approved: false,
      teacher: req.user._id,
    }).populate('student');

    res.status(200).json({
      status: 'SUCCESS',
      data: { pendingAppointments },
    });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};
