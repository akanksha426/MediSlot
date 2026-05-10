import express from "express";
const doctorRouter = express.Router();

import authUser from "../middlewares/authUser.js";
import authDoctor from "../middlewares/authDoctor.js";

import {
  appointmentComplete,
  appointmentsDoctor,
  doctorDashboard,
  doctorList,
  submitRating,
  doctorLogin,
  doctorProfile,
  updateDoctorProfile,
  doctorCancelAppointment,
  deleteAppointment,
  searchDoctors,
} from "../controllers/doctorController.js";

// 🔍 Search doctors (public)
doctorRouter.get("/search", searchDoctors);

// ⭐ User rates doctor (user auth required)
doctorRouter.post("/rate-doctor", authUser, submitRating);

// ❌ Cancel appointment (doctor)
doctorRouter.post("/cancel-appointment", authDoctor, doctorCancelAppointment);

// 📋 Get doctor list (public)
doctorRouter.get("/list", doctorList);

// 🗑 Delete appointment
doctorRouter.post("/delete-appointment", authDoctor, deleteAppointment);

// 🔐 Doctor login
doctorRouter.post("/login", doctorLogin);

// 📅 Doctor appointments
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);

// ✅ Mark complete
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);

// 📊 Dashboard
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);

// 👤 Profile
doctorRouter.get("/profile", authDoctor, doctorProfile);

// ✏️ Update profile
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile);

export default doctorRouter;