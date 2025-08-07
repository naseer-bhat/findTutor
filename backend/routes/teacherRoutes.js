import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { allow } from "../middlewares/roleMiddleware.js";
import {
  createAppointment,
  deleteAppointment,
  getAllAppointments,
  getAllStudents,
  approveAppointment,
  dissapproveAppointment,
  getAllPendingStudents,
} from "../controllers/teacherController.js";
import { login, updatePassword } from "../controllers/authController.js";

const router = express.Router();

router.get("/", getAllStudents);
router.post("/login", login);
router.patch("/updatePassword", verifyToken, updatePassword);

router
  .route("/schedule")
  .get(verifyToken, allow("admin", "teacher"), getAllAppointments)
  .post(verifyToken, allow("admin", "teacher"), createAppointment);

router.delete(
  "/reschedule/:id",
  verifyToken,
  allow("teacher"),
  deleteAppointment
);

router
  .route("/changeApprovalStatus/:id/:studentId")
  .patch(verifyToken, allow("admin", "teacher"), approveAppointment)
  .delete(verifyToken, allow("admin", "teacher"), dissapproveAppointment);

router.get(
  "/getAllPendingStudents",
  verifyToken,
  allow("teacher"),
  getAllPendingStudents
);

export default router;
