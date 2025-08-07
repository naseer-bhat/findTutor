import express from "express";
import {
  sendMessage,
  getSentMessages,
  deleteMessage,
} from "../controllers/messageController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

// Get all messages for the logged-in user
router.get("/", verifyToken, getSentMessages);

// Create a new message
router.post("/", verifyToken, sendMessage);

// Delete a message by ID
router.delete("/:id", verifyToken, deleteMessage);

export default router;
