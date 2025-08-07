import express from 'express';
import {
  getAllTeachers,
  createTeacher,
  getTeacher,
  updateTeacher,
  deleteTeacher,
  approveStudent,
  deleteStudent
} from '../controllers/adminController.js';
import verifyToken from '../middlewares/verifyToken.js';
import { allow, setRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();
import { getPendingStudents } from "../controllers/adminController.js";
// Only admins can fetch pending students
router.get(
  "/pending-students",
  verifyToken,
  allow("admin"),
  getPendingStudents
);


router
  .route('/')
  .get(verifyToken, getAllTeachers)
  .post(verifyToken, allow('admin'), setRole('teacher'), createTeacher);

router.route('/:id')
  .get(getTeacher)
  .patch(updateTeacher)
  .delete(deleteTeacher);

router.delete('/students/:id', deleteStudent);
router.patch('/approvestudent/:id', approveStudent);

export default router;
