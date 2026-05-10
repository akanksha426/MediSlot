import express from "express";
const userRouter = express.Router();
import {
  registerUser,
  loginUser,
  resetPassword,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";
import { mockPayment } from "../controllers/userController.js";
import { deleteAppointment } from "../controllers/userController.js";
import { submitRating } from "../controllers/doctorController.js"  // 👈 add import

userRouter.post("/rate-doctor", authUser, submitRating)             // 👈 add route


userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/reset-password", resetPassword);
userRouter.get("/get-profile", authUser, getProfile);
userRouter.post(
  "/update-profile",
  upload.single("image"),
  authUser,
  updateProfile
);

userRouter.post("/mock-payment",authUser, mockPayment);
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointment);
userRouter.post("/cancle-appointment", authUser, cancelAppointment);
userRouter.post("/payment-razorpay", authUser, paymentRazorpay);
userRouter.post("/verify-razorpay", authUser, verifyRazorpay);
userRouter.post("/delete-appointment", authUser,deleteAppointment);
export default userRouter;
