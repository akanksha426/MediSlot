import express from "express";
import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from "razorpay";
// API for register user

const timeToMinutes = (time) => {
  if (!time) return null;

  const normalized = String(time).trim();
  const meridiemMatch = normalized.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);

  if (meridiemMatch) {
    let hours = Number(meridiemMatch[1]);
    const minutes = Number(meridiemMatch[2]);
    const meridiem = meridiemMatch[3].toUpperCase();

    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  const [hours, minutes] = normalized.split(":").map(Number);
  return hours * 60 + minutes;
};

const isSlotInsideDoctorSchedule = (docData, slotDate, slotTime) => {
  const [day, month, year] = slotDate.split("_").map(Number);
  const appointmentDate = new Date(year, month - 1, day);
  const daySchedule = docData.weeklySchedule?.find(
    (item) => Number(item.day) === appointmentDate.getDay()
  );

  if (!daySchedule?.isOpen) return false;

  const requestedMinutes = timeToMinutes(slotTime);
  const startMinutes = timeToMinutes(daySchedule.startTime);
  const endMinutes = timeToMinutes(daySchedule.endTime);
  const slotDuration = Number(daySchedule.slotDuration || 30);

  if (
    requestedMinutes === null ||
    startMinutes === null ||
    endMinutes === null ||
    requestedMinutes < startMinutes ||
    requestedMinutes >= endMinutes
  ) {
    return false;
  }

  return (requestedMinutes - startMinutes) % slotDuration === 0;
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Detail" });
    }

    //validating email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    //validating strong password
    if (password.length < 8) {
      return res.json({ success: false, message: "Enter a strong password" });
    }

    //check user existed
    const existedUser = await userModel.findOne({ email });

    if (existedUser) {
      return res.status(409).json({
        success: false,
        message: "User with email already exists",
      });
    }

    //hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);

    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch (error) {
    console.log("error:", error);

    return res.json({ success: false, message: error.message });
  }
};

//api for user login

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    //check user exist
    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    //check for password
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      return res.json({ success: true, token });
    } else {
      return res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

// API for user password reset
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.json({ success: false, message: "Email and new password are required" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    if (newPassword.length < 8) {
      return res.json({ success: false, message: "Enter a strong password" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await userModel.findByIdAndUpdate(user._id, { password: hashedPassword });

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

//API to get user profile data

const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    const userData = await userModel.findById(userId).select("-password");

    res.json({ success: true, userData });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

//API to update user profile

const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender, familyMembers } = req.body;

    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data missing" });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
      familyMembers: familyMembers ? JSON.parse(familyMembers) : [],
    });

    if (imageFile) {
      // upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });

      const imageURL = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }

    const updatedUserData = await userModel.findById(userId).select("-password");

    res.json({
      success: true,
      message: "Profile Updated",
      userData: updatedUserData,
    });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

//API to book appointment

const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime, patientProfile } = req.body;
    const docData = await doctorModel.findById(docId).select("-password");

    if (docData.verificationStatus !== "verified") {
      return res.json({ success: false, message: "Doctor is not verified yet" });
    }

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor is not availble " });
    }

    if (!isSlotInsideDoctorSchedule(docData, slotDate, slotTime)) {
      return res.json({
        success: false,
        message: "Selected slot is outside doctor's schedule",
      });
    }

    let slots_booked = docData.slots_booked;

    //checking for slot availablity
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({
          success: false,
          message: "Slot not availble ",
        });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const accountUserData = await userModel.findById(userId).select("-password");
    const sanitizedPatientProfile = patientProfile
      ? {
          name: patientProfile.name || accountUserData.name,
          phone: patientProfile.phone || accountUserData.phone,
          gender: patientProfile.gender || accountUserData.gender,
          dob: patientProfile.dob || accountUserData.dob,
          relation: patientProfile.relation || "Self",
          image: patientProfile.image || accountUserData.image,
        }
      : null;
    const userData = sanitizedPatientProfile || accountUserData;

    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    //save new slots data in docdata

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Booked" });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

//API to get user appointments for backend my-appointments page

const listAppointment = async (req, res) => {
  try {
    const { userId } = req.body;
    const appointments = await appointmentModel.find({ userId });

    if (!appointments) {
      return res.json({ success: false, message: "No Appointment" });
    }

    res.json({ success: true, appointments });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};


// API to cancel appointment
// const cancelAppointment = async (req, res) => {
//   try {
//     const { userId, appointmentId } = req.body;

//     const appointmentData = await appointmentModel.findById(appointmentId);

//     if (!appointmentData) {
//       return res.json({ success: false, message: "Appointment not found" });
//     }

//     if (appointmentData.userId !== userId) {
//       return res.json({ success: false, message: "Unauthorized" });
//     }

//     let updateData = { cancelled: true };

//     // 💰 REFUND LOGIC
//     if (appointmentData.payment) {
//       updateData.refund = true;
//       updateData.refundAmount = appointmentData.amount; // full refund
//     }

//     await appointmentModel.findByIdAndUpdate(appointmentId, updateData);

//     res.json({ success: true, message: "Appointment Cancelled" });

//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    if (appointmentData.cancelled) {
      return res.json({ success: false, message: "Appointment already cancelled" });
    }

    if (appointmentData.isCompleted) {
      return res.json({
        success: false,
        message: "Completed appointments cannot be cancelled",
      });
    }

    //  mark cancelled + refund
    let updateData = {
      cancelled: true,
      cancelledBy: "user",
      notification: "Appointment cancelled by patient.",
    };

    if (appointmentData.payment) {
      updateData.refund = true;
      updateData.refundAmount = appointmentData.amount;
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, updateData);

    // (SLOT FREE KARNA)
    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;

    if (slots_booked[slotDate]) {
      slots_booked[slotDate] = slots_booked[slotDate].filter(
        (time) => time !== slotTime
      );
    }

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Cancelled & Slot is Free Now" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// API for make payment of appointment using razorpay
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({
        success: false,
        message: "Appointment cancelled or not found",
      });
    }

    // creating options for razorpay payment

    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY,
      receipt: appointmentId,
    };

    //creating of an order
    const order = await razorpayInstance.orders.create(options);

    res.json({ success: true, order });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to verify payment
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {
        payment: true,
      });

      res.json({ success: true, message: "Payment successfull" });
    } else {
      res.json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};
export const deleteAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // ✅ Allow delete only if completed or cancelled
    if (!appointment.cancelled && !appointment.isCompleted) {
      return res.json({
        success: false,
        message: "Only completed or cancelled appointments can be deleted",
      });
    }

    await appointmentModel.findByIdAndDelete(appointmentId);

    res.json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
// ✅ ADD THIS
const mockPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      payment: true,
    });

    res.json({
      success: true,
      message: "Mock payment successful",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
};
export {
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
  mockPayment,
};
