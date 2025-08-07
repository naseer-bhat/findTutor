import crypto from "crypto";
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import Message from "../models/Message.js";
import { hashPassword } from "../utils/passwordUtil.js";
import { connect } from "../utils/sendEmail.js";

const transporter = connect();

const oneTimePasswordCreator = () => {
  return crypto.randomBytes(32).toString("hex");
};

const filterObj = (obj) => {
  const newObj = {};
  const notAllowed = ["email", "roles"];
  Object.keys(obj).forEach((el) => {
    if (!notAllowed.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// ---- ADMIN MIDDLEWARE (already imported/moved elsewhere) ----
// export const setRole = (role) => (req, res, next) => {
//   req.body.roles = role;
//   next();
// };
// 
// export const allow =
//   (...roles) =>
//   (req, res, next) => {
//     if (roles.includes(req.user.roles)) next();
//     else res.status(403).json({ status: "FAIL", message: "Forbidden" });
//   };

// 1. Get all students pending admin approval
export const getPendingStudents = async (req, res) => {
  try {
    const students = await User.find({ 
      roles: "student", 
      admissionStatus: false 
    }).select("-password");
    res.status(200).json({ status: "SUCCESS", data: { students } });
  } catch (err) {
    res.status(500).json({ status: "FAIL", message: err.message });
  }
};

// 2. Admin creates a teacher account
export const createTeacher = async (req, res) => {
  try {
    const { name, email, password, department, subject, age } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "FAIL",
        message: "Email already in use",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // For teacher, roles is always "teacher", admissionStatus always true
    const newTeacher = await User.create({
      name,
      email,
      password: hashedPassword,
      department,
      subject,
      age,
      roles: "teacher",
      admissionStatus: true, // Teachers don't need approval
    });

    res.status(201).json({
      status: "SUCCESS",
      data: { teacher: newTeacher },
    });
  } catch (err) {
    res.status(500).json({ status: "FAIL", message: err.message });
  }
};

// 3. Get all teachers
export const getAllTeachers = async (req, res) => {
  try {
    const users = await User.find({ roles: "teacher" }).populate("appointments");
    res.status(200).json({ status: "SUCCESS", data: { users } });
  } catch (err) {
    res.status(500).json({ status: "FAIL", message: err.message });
  }
};

// 4. Get single teacher by ID
export const getTeacher = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ status: "FAIL", message: "User not found" });
    res.status(200).json({ status: "SUCCESS", data: { user } });
  } catch (err) {
    res.status(500).json({ status: "FAIL", message: err.message });
  }
};

// 5. Update teacher details (safe fields only)
export const updateTeacher = async (req, res) => {
  try {
    const updateObj = filterObj(req.body);
    const user = await User.findByIdAndUpdate(req.params.id, updateObj, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ status: "FAIL", message: "User not found" });
    res.status(200).json({ status: "SUCCESS", data: { user } });
  } catch (err) {
    res.status(500).json({ status: "FAIL", message: err.message });
  }
};

// 6. Delete teacher (and cascade delete appointments/messages)
export const deleteTeacher = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ status: "FAIL", message: "User not found" });

    await Appointment.deleteMany({ sendBy: user.email });
    await Message.deleteMany({
      $or: [{ from: user.email }, { to: user.email }],
    });
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      status: "SUCCESS",
      message: "User, related appointments, and messages deleted",
    });
  } catch (err) {
    res.status(500).json({ status: "FAIL", message: err.message });
  }
};

// 7. Approve a student (set admissionStatus = true, send email)
export const approveStudent = async (req, res) => {
  try {
    const student = await User.findByIdAndUpdate(
      req.params.id,
      { admissionStatus: true },
      { new: true }
    );
    if (!student) return res.status(404).json({ status: "FAIL", message: "Student not found" });

    // Note: Make sure your sendEmail setup works
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: student.email,
      subject: "Account Approved – TUTOR-TIME",
      html: `
        <h2>Congratulations!</h2>
        <p>Your account has been approved on TUTOR-TIME.</p>
        <p>You can now access all student features.</p>
        <p>Best regards,<br>TUTOR-TIME</p>
      `,
    });

    res.status(200).json({ status: "SUCCESS", message: "Student approved" });
  } catch (err) {
    res.status(500).json({ status: "FAIL", message: err.message });
  }
};

// 8. Delete a student
export const deleteStudent = async (req, res) => {
  try {
    const student = await User.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ status: "FAIL", message: "Student not found" });
    res.status(200).json({ status: "SUCCESS", message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ status: "FAIL", message: err.message });
  }
};
