// routes/studentRoutes.js
import express from 'express';
import {
  register,
  bookAppointment,
  getTeacherWithAppointments,
  registeredAppointments
} from '../controllers/studentController.js';
import { login } from '../controllers/authController.js';
import { allow } from '../middlewares/roleMiddleware.js';
import verifyToken from '../middlewares/verifyToken.js';

const router = express.Router();

router.get('/get', (req, res) => {
  res.send('Welcome to the student Tutor-Time API!');
});

router.post('/post', (req, res) => {
  res.send('Welcome to the student Tutor-Time API!');
});

router.post('/register', register);
router.post('/login', login);

router.patch('/appointment/:id', verifyToken, allow('student'), bookAppointment);
router.get('/appointment/getTeachersWithAppointments', verifyToken, allow('student'), getTeacherWithAppointments);
router.get('/appointment/getRegisteredAppointments', verifyToken, allow('student'), registeredAppointments);

export default router;
