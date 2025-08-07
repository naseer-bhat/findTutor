import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import mongoose from 'mongoose';

/**
 * Get all students (for teacher to assign/select in their own workflows)
 */
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ roles: 'student' }).select('-password');
    res.status(200).json({ status: 'SUCCESS', data: { students } });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

/**
 * Teacher creates an availability slot (appointment)
 */
export const createAppointment = async (req, res) => {
  try {
    const { scheduleAt, subject, description } = req.body;

    if (!scheduleAt) {
      return res.status(400).json({
        status: 'FAIL',
        message: 'scheduleAt is required',
      });
    }

    const appointment = await Appointment.create({
      scheduleAt,
      subject,
      description,
      sendBy: req.user.email,
      teacher: req.user._id,
      // studentId will be added when a student books this slot
      // (see studentController for booking logic)
    });

    res.status(201).json({
      status: 'SUCCESS',
      data: { appointment },
    });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

/**
 * Teacher views all their appointments (past/future, approved/pending)
 */
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      teacher: req.user._id,
    }).populate('studentId', 'name email');
    res.status(200).json({ status: 'SUCCESS', data: { appointments } });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

/**
 * Teacher deletes an appointment slot (not yet booked by student)
 */
export const deleteAppointment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'FAIL',
        message: 'Invalid appointment ID',
      });
    }

    // Ensure only the teacher who created this slot can delete it
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      teacher: req.user._id,
      studentId: { $exists: false }, // Only delete if not yet booked
    });

    if (!appointment) {
      return res.status(404).json({
        status: 'FAIL',
        message: 'Appointment not found or already booked',
      });
    }

    res.status(200).json({
      status: 'SUCCESS',
      message: 'Appointment slot deleted',
    });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

/**
 * Teacher approves a student's appointment request
 */
export const approveAppointment = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      return res.status(400).json({
        status: 'FAIL',
        message: 'Invalid appointment or student ID',
      });
    }

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: id,
        teacher: req.user._id,
        studentId: studentId,
        approved: false, // Only unapproved appointments can be approved
      },
      { approved: true, scheduleAt: new Date() }, // Set to current time or keep original
      { new: true }
    ).populate('studentId', 'name email');

    if (!appointment) {
      return res.status(404).json({
        status: 'FAIL',
        message: 'Appointment not found or already approved',
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

/**
 * Teacher rejects a student's appointment request
 */
export const dissapproveAppointment = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      return res.status(400).json({
        status: 'FAIL',
        message: 'Invalid appointment or student ID',
      });
    }

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: id,
        teacher: req.user._id,
        studentId: studentId,
        approved: false, // Only unapproved appointments can be rejected
      },
      { $unset: { studentId: 1 } }, // Unset the studentId to "unbook" it
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        status: 'FAIL',
        message: 'Appointment not found or already approved',
      });
    }

    res.status(200).json({
      status: 'SUCCESS',
      message: 'Appointment request rejected',
      data: { appointment },
    });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

export const getAllPendingStudents = async (req, res) => {
  try {
    const pendingAppointments = await Appointment.find({
      teacher: req.user._id,
      approved: false,
      studentId: { $exists: true },
    }).populate('studentId', 'name email');
    res.status(200).json({
      status: 'SUCCESS',
      data: { pendingAppointments },
    });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};
