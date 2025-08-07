import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { allow } from "../middlewares/roleMiddleware.js";
import {
  getAllAppointments,
  createAppointment,
  deleteAppointment,
  approveAppointment,
  dissapproveAppointment,
} from "../controllers/teacherController.js";
import { login, updatePassword } from "../controllers/authController.js";

const router = express.Router();

// Authentication
router.post("/login", login);
router.patch("/updatePassword", verifyToken, updatePassword);

// Manage teacher's appointments
router
  .route("/schedule")
  .get(verifyToken, allow("teacher"), getAllAppointments)
  .post(verifyToken, allow("teacher"), createAppointment);

// Delete an appointment
router.delete(
  "/reschedule/:id",
  verifyToken,
  allow("teacher"),
  deleteAppointment
);

// Approve/disapprove a student's specific appointment request (NOT student admission!)
router
  .route("/changeApprovalStatus/:id/:studentId")
  .patch(verifyToken, allow("teacher"), approveAppointment)
  .delete(verifyToken, allow("teacher"), dissapproveAppointment);

export default router;
