import validator from "validator";
//import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
//Api for adding doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      registrationNumber,
      experience,
      about,
      fees,
      address,
      city,
    } = req.body;
    const imageFile = req.files?.image?.[0];
    const licenseFile = req.files?.licenseDocument?.[0];

    //checking for all data to add doctor
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !registrationNumber ||
      !experience ||
      !about ||
      !fees ||
      !address ||
      !imageFile ||
      !licenseFile
    ) {
      return res.json({ success: false, message: "missing details" });
    }

    // validatin email format

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    //validating strong password
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    //check user existed
    const existedUser = await doctorModel.findOne({
      $or: [{ name }, { email }],
    });

    if (existedUser) {
      return res.status(409).json({
        success: false,
        message: "Docter with email already exists",
      });
    }

    // hashing doctor password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // upload image cloudinary

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    const imageUrl = imageUpload.secure_url;
    const licenseUpload = await cloudinary.uploader.upload(licenseFile.path, {
      resource_type: "auto",
    });
    const licenseDocumentUrl = licenseUpload.secure_url;

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      registrationNumber,
      licenseDocument: licenseDocumentUrl,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      city: city || "",
      date: Date.now(),
      verificationStatus: "pending",
    };

    const newDoctor = new doctorModel(doctorData);

    await newDoctor.save();
    res.json({
      success: true,
      message: "doctor added",
    });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

// API for admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credential" });
    }
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Api for get all doctors list
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

// API for admin to verify or reject a doctor
const updateDoctorVerification = async (req, res) => {
  try {
    const { docId, verificationStatus, verificationNotes } = req.body;

    if (!["pending", "verified", "rejected"].includes(verificationStatus)) {
      return res.json({ success: false, message: "Invalid verification status" });
    }

    const doctor = await doctorModel.findById(docId);

    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    await doctorModel.findByIdAndUpdate(docId, {
      verificationStatus,
      verificationNotes: verificationNotes || "",
      available: verificationStatus === "verified" ? doctor.available : false,
    });

    res.json({ success: true, message: `Doctor marked as ${verificationStatus}` });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});
    res.json({ success: true, appointments });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

// API for  appointment cancel

const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
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

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
      cancelledBy: "system",
      refund: appointmentData.payment,
      refundAmount: appointmentData.payment ? appointmentData.amount : 0,
      notification: "Appointment cancelled by admin. Please book a new slot.",
    });

    // releaseing doctor slot
    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;
    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log("error:", error);
    res.json({ success: false, message: error.message });
  }
};

//API to get dashboard data for admin panel

const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});

    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      users: users.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };

    res.json({ success: true, dashData });
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
import bcrypt from "bcrypt";
//import doctorModel from "../models/doctorModel.js";
export {
  addDoctor,
  loginAdmin,
  allDoctors,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
  updateDoctorVerification,
};
