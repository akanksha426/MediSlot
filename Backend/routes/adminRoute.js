import expres from "express";

import {
  addDoctor,
  adminDashboard,
  allDoctors,
  appointmentCancel,
  appointmentsAdmin,
  loginAdmin,
  updateDoctorVerification,
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import { changeAvailabilty } from "../controllers/doctorController.js";
import { deleteAppointment } from "../controllers/adminController.js";
const adminRouter = expres.Router();
adminRouter.post("/delete-appointment",authAdmin, deleteAppointment);
adminRouter.post(
  "/add-doctor",
  authAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "licenseDocument", maxCount: 1 },
  ]),
  addDoctor
);
adminRouter.post("/login", loginAdmin);
adminRouter.get("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/verify-doctor", authAdmin, updateDoctorVerification);
adminRouter.post("/change-availability", authAdmin, changeAvailabilty);
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel);
adminRouter.get("/dashboard", authAdmin, adminDashboard);

export default adminRouter;
