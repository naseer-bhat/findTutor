// models/Appointment.js
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    sendBy: {
      type: String,
      required: [true, "Sender email is required"],
    },
    sendTo: {
      type: String,
      required: [true, "Receiver email is required"],
    },
    title: {
      type: String,
      required: [true, "Appointment title is required"],
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    time: {
      type: String,
      required: [true, "Appointment time is required"],
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
