// Controllers/studentController.js
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import   verifyToken  from '../middlewares/verifyToken.js';


export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'FAIL', message: 'Email already exists' });
    }

    const newUser = await User.create({ name, email, password, roles: 'student' });
    res.status(201).json({ status: 'SUCCESS', data: { user: newUser } });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { studentId: req.user._id },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ status: 'FAIL', message: 'Appointment not found' });
    }

    res.status(200).json({ status: 'SUCCESS', data: { appointment } });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

export const getTeacherWithAppointments = async (req, res) => {
  try {
    const teachers = await User.find({ roles: 'teacher' });

    const teachersWithAppointments = await Promise.all(
      teachers.map(async (teacher) => {
        const appointments = await Appointment.find({ sendTo: teacher.email });
        return { teacher, appointments };
      })
    );

    res.status(200).json({ status: 'SUCCESS', data: teachersWithAppointments });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

export const registeredAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ studentId: req.user._id });
    res.status(200).json({ status: 'SUCCESS', data: { appointments } });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ roles: 'student' });
    res.status(200).json({
      status: 'SUCCESS',
      data: { students },
    });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

export const getStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ status: 'FAIL', message: 'Student not found' });
    }
    res.status(200).json({
      status: 'SUCCESS',
      data: { student },
    });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const updatedStudent = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedStudent) {
      return res.status(404).json({ status: 'FAIL', message: 'Student not found' });
    }

    res.status(200).json({
      status: 'SUCCESS',
      data: { updatedStudent },
    });
  } catch (err) {
    res.status(500).json({ status: 'FAIL', message: err.message });
  }
};
