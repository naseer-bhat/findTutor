// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
  },
  roles: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student',
  },
  age: Number,
  department: String,
  subject: String,
  admissionStatus: {
    type: Boolean,
    default: false,
  },
  appointments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  }],
});

const User = mongoose.model('User', userSchema);
export default User;
