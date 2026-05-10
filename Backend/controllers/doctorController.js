// import doctorModel from "../models/doctorModel.js";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import appointmentModel from "../models/appointmentModel.js";
// import Doctor from "../models/doctorModel.js";
// // ================= CHANGE AVAILABILITY =================
// const changeAvailabilty = async (req, res) => {
//   try {
//     const { docId } = req.body;
//     const docData = await doctorModel.findById(docId);

//     if (!docData) {
//       return res.json({ success: false, message: "Doctor not found" });
//     }

//     await doctorModel.findByIdAndUpdate(docId, {
//       available: !docData.available,
//     });

//     res.json({ success: true, message: "Availability changed" });
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

// // ================= DOCTOR LOGIN =================
// const doctorLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const doctor = await doctorModel.findOne({ email });

//     if (!doctor) {
//       return res.json({ success: false, message: "Invalid Credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, doctor.password);

//     if (isMatch) {
//       const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
//       res.json({ success: true, token });
//     } else {
//       res.json({ success: false, message: "Invalid Credentials" });
//     }
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

// // ================= GET APPOINTMENTS =================
// const appointmentsDoctor = async (req, res) => {
//   try {
//     const { docId } = req.body;
//     const appointments = await appointmentModel.find({ docId });

//     res.json({ success: true, appointments });
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

// // ================= COMPLETE APPOINTMENT =================
// const appointmentComplete = async (req, res) => {
//   try {
//     const { docId, appointmentId } = req.body;
//     const appointmentData = await appointmentModel.findById(appointmentId);

//     if (appointmentData && appointmentData.docId === docId) {
//       await appointmentModel.findByIdAndUpdate(appointmentId, {
//         isCompleted: true,
//       });

//       // 🔥 SOCKET EMIT
//       const io = req.app.get("io");

//       io.to(docId.toString()).emit("slotUpdated", {
//         slot: appointmentData.slotTime,
//         status: "completed",
//       });

//       return res.json({ success: true, message: "Appointment completed" });
//     } else {
//       return res.json({ success: false, message: "Mark failed" });
//     }
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

// // ================= CANCEL APPOINTMENT (DOCTOR) =================
// const doctorCancelAppointment = async (req, res) => {
//   try {
//     const { appointmentId } = req.body;

//     const appointment = await appointmentModel.findById(appointmentId);

//     if (!appointment) {
//       return res.json({ success: false, message: "Appointment not found" });
//     }

//     // Cancel + refund
//     await appointmentModel.findByIdAndUpdate(appointmentId, {
//       cancelled: true,
//       cancelledBy: "doctor",
//       status: "cancelled",
//       refund: true,
//       refundAmount: appointment.amount,
//       notification: "Doctor is unavailable. Please reschedule your appointment.",
//     });

//     // Free slot
//     const doctor = await doctorModel.findById(appointment.docId);
//     let slots = doctor.slots_booked;

//     if (slots[appointment.slotDate]) {
//       slots[appointment.slotDate] = slots[appointment.slotDate].filter(
//         (e) => e !== appointment.slotTime
//       );
//     }

//     await doctorModel.findByIdAndUpdate(appointment.docId, {
//       slots_booked: slots,
//     });

//     // 🔥 SOCKET EMIT
//     const io = req.app.get("io");

//     io.to(appointment.docId.toString()).emit("slotUpdated", {
//       slot: appointment.slotTime,
//       status: "available",
//     });

//     res.json({
//       success: true,
//       message: "Appointment cancelled by doctor",
//     });

//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };
// // ================= DOCTOR DASHBOARD =================
// const doctorDashboard = async (req, res) => {
//   try {
//     const { docId } = req.body;

//     const appointments = await appointmentModel.find({ docId });

//     let earnings = 0;
//     appointments.forEach((item) => {
//       if (item.isCompleted || item.payment) {
//         earnings += item.amount;
//       }
//     });

//     let patients = [];
//     appointments.forEach((item) => {
//       if (!patients.includes(item.userId)) {
//         patients.push(item.userId);
//       }
//     });

//     const dashData = {
//       earnings,
//       appointments: appointments.length,
//       patients: patients.length,
//       latestAppointments: appointments.reverse().slice(0, 5),
//     };

//     res.json({ success: true, dashData });

//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };
// // ================= DELETE APPOINTMENT =================
// export const deleteAppointment = async (req, res) => {
//   try {
//     const { appointmentId } = req.body;

//     const appointment = await appointmentModel.findById(appointmentId);

//     if (!appointment) {
//       return res.json({ success: false, message: "Appointment not found" });
//     }

//     if (!appointment.cancelled && !appointment.isCompleted) {
//       return res.json({
//         success: false,
//         message: "Only completed or cancelled appointments can be deleted",
//       });
//     }

//     await appointmentModel.findByIdAndDelete(appointmentId);

//     // 🔥 SOCKET EMIT
//     const io = req.app.get("io");

//     io.to(appointment.docId.toString()).emit("slotUpdated", {
//       slot: appointment.slotTime,
//       status: "deleted",
//     });

//     res.json({
//       success: true,
//       message: "Appointment deleted successfully",
//     });

//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };
// // ================= DOCTOR LIST =================
// const doctorList = async (req, res) => {
//   try {
//     const doctors = await doctorModel.find({}).select(["-password", "-email"]);
//     res.json({ success: true, doctors });
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

// // ================= DOCTOR PROFILE =================
// const doctorProfile = async (req, res) => {
//   try {
//     const { docId } = req.body;
//     const profileData = await doctorModel.findById(docId).select("-password");
//     res.json({ success: true, profileData });
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

// // ================= UPDATE PROFILE =================
// const updateDoctorProfile = async (req, res) => {
//   try {
//     const { docId, fees, address, available } = req.body;

//     await doctorModel.findByIdAndUpdate(docId, {
//       fees,
//       address,
//       available,
//     });

//     res.json({ success: true, message: "Profile Updated" });

//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };
// ////search
// export const searchDoctors = async (req, res) => {
//   const { location, speciality } = req.query;

//   try {
//     let query = {};

//     if (location) {
//       query.address = { $regex: location, $options: "i" }; // use address if exists
//     }

//     if (speciality) {
//       query.speciality = { $regex: speciality, $options: "i" };
//     }

//     const doctors = await Doctor.find(query);

//     res.json(doctors);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// // ================= SUBMIT RATING =================
// const submitRating = async (req, res) => {
//   try {
//     const { docId, rating, review } = req.body
//     const userId = req.userId             // comes from authUser middleware

//     const doctor = await doctorModel.findById(docId)
//     if (!doctor) {
//       return res.json({ success: false, message: "Doctor not found" })
//     }

//     // prevent duplicate rating
//     const alreadyRated = doctor.ratings.find(
//       (r) => r.userId.toString() === userId.toString()
//     )
//     if (alreadyRated) {
//       return res.json({ success: false, message: "You already rated this doctor" })
//     }

//     // only allow rating after completed appointment
//     // const appointment = await appointmentModel.findOne({
//     //   userId,
//     //   docId,
//     //   isCompleted: true,
//     // })
//     // if (!appointment) {
//     //   return res.json({
//     //     success: false,
//     //     message: "You can only rate after a completed appointment",
//     //   })
//     // }
//     const appointment = await appointmentModel.findOne({
//   userId: userId.toString(),
//   docId: docId.toString(),
//   isCompleted: true,
//   cancelled: false
// });

// if (!appointment) {
//   return res.json({
//     success: false,
//     message: "You can only rate after a completed appointment",
//   });

// }

// console.log("USER:", userId);
// console.log("DOC:", docId);
// console.log("FOUND:", appointment);
//     doctor.ratings.push({ userId, rating, review, date: Date.now() })
//     doctor.totalRatings = doctor.ratings.length
//     doctor.averageRating = (
//       doctor.ratings.reduce((sum, r) => sum + r.rating, 0) /
//       doctor.ratings.length
//     ).toFixed(1)

//     await doctor.save()
//     res.json({ success: true, message: "Rating submitted successfully" })

//   } catch (error) {
//     res.json({ success: false, message: error.message })
//   }
// }
// // ================= EXPORTS =================
// export {
//   submitRating,
//   changeAvailabilty,
//   doctorLogin,
//   appointmentsDoctor,
//   appointmentComplete,
//   doctorCancelAppointment,
//   doctorDashboard,
//   doctorList,
//   doctorProfile,
//   updateDoctorProfile,
// };
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";

const sanitizeWeeklySchedule = (weeklySchedule) => {
  const parsedSchedule =
    typeof weeklySchedule === "string"
      ? JSON.parse(weeklySchedule)
      : weeklySchedule;

  if (!Array.isArray(parsedSchedule) || parsedSchedule.length !== 7) {
    throw new Error("Weekly schedule must include all 7 days");
  }

  return parsedSchedule.map((item, index) => {
    const slotDuration = Number(item.slotDuration || 30);

    if (!["15", "30", "45", "60"].includes(String(slotDuration))) {
      throw new Error("Slot duration must be 15, 30, 45, or 60 minutes");
    }

    if (item.isOpen && (!item.startTime || !item.endTime || item.startTime >= item.endTime)) {
      throw new Error("Open days need a valid start and end time");
    }

    return {
      day: Number.isInteger(Number(item.day)) ? Number(item.day) : index,
      isOpen: Boolean(item.isOpen),
      startTime: item.startTime || "10:00",
      endTime: item.endTime || "21:00",
      slotDuration,
    };
  });
};

// ================= CHANGE AVAILABILITY =================
const changeAvailabilty = async (req, res) => {
  try {
    const { docId } = req.body;
    const docData = await doctorModel.findById(docId);

    if (!docData) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    if (docData.verificationStatus !== "verified") {
      return res.json({
        success: false,
        message: "Verify this doctor before changing availability",
      });
    }

    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });

    res.json({ success: true, message: "Availability changed" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ================= DOCTOR LOGIN =================
const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    if (doctor.verificationStatus !== "verified") {
      return res.json({
        success: false,
        message: "Doctor account is pending admin verification",
      });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ================= GET APPOINTMENTS =================
const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });

    res.json({ success: true, appointments });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ================= COMPLETE APPOINTMENT =================
const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });

      const io = req.app.get("io");

      io.to(docId.toString()).emit("slotUpdated", {
        slot: appointmentData.slotTime,
        status: "completed",
      });

      return res.json({ success: true, message: "Appointment completed" });
    } else {
      return res.json({ success: false, message: "Mark failed" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ================= CANCEL APPOINTMENT =================
const doctorCancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (appointment.cancelled) {
      return res.json({ success: false, message: "Appointment already cancelled" });
    }

    if (appointment.isCompleted) {
      return res.json({
        success: false,
        message: "Completed appointments cannot be cancelled",
      });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
      cancelledBy: "doctor",
      refund: appointment.payment,
      refundAmount: appointment.payment ? appointment.amount : 0,
      notification: "Doctor is unavailable. Please reschedule your appointment.",
    });

    const doctor = await doctorModel.findById(appointment.docId);
    let slots = doctor.slots_booked;

    if (slots[appointment.slotDate]) {
      slots[appointment.slotDate] = slots[appointment.slotDate].filter(
        (e) => e !== appointment.slotTime
      );
    }

    await doctorModel.findByIdAndUpdate(appointment.docId, {
      slots_booked: slots,
    });

    const io = req.app.get("io");

    io.to(appointment.docId.toString()).emit("slotUpdated", {
      slot: appointment.slotTime,
      status: "available",
    });

    res.json({
      success: true,
      message: "Appointment cancelled by doctor",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ================= DASHBOARD =================
const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.body;

    const appointments = await appointmentModel.find({ docId });

    let earnings = 0;

    appointments.forEach((item) => {
      if (
        item.isCompleted ||
        (item.payment && !item.cancelled && !item.refund)
      ) {
        earnings += item.amount;
      }
    });

    let patients = [];

    appointments.forEach((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId);
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };

    res.json({ success: true, dashData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ================= DELETE APPOINTMENT =================
export const deleteAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (!appointment.cancelled && !appointment.isCompleted) {
      return res.json({
        success: false,
        message: "Only completed or cancelled appointments can be deleted",
      });
    }

    await appointmentModel.findByIdAndDelete(appointmentId);

    const io = req.app.get("io");

    io.to(appointment.docId.toString()).emit("slotUpdated", {
      slot: appointment.slotTime,
      status: "deleted",
    });

    res.json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ================= DOCTOR LIST =================
const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel
      .find({ verificationStatus: "verified" })
      .select(["-password", "-email"]);
    res.json({ success: true, doctors });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ================= PROFILE =================
const doctorProfile = async (req, res) => {
  try {
    const { docId } = req.body;
    const profileData = await doctorModel.findById(docId).select("-password");

    res.json({ success: true, profileData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ================= UPDATE PROFILE =================
const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, fees, address, available, weeklySchedule } = req.body;

    const updateData = {
      fees,
      address,
      available,
    };

    if (weeklySchedule) {
      updateData.weeklySchedule = sanitizeWeeklySchedule(weeklySchedule);
    }

    await doctorModel.findByIdAndUpdate(docId, updateData);

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ================= SEARCH =================
export const searchDoctors = async (req, res) => {
  const { location, speciality } = req.query;

  try {
    let query = { verificationStatus: "verified" };

    if (location) {
      query.address = { $regex: location, $options: "i" };
    }

    if (speciality) {
      query.speciality = { $regex: speciality, $options: "i" };
    }

    const doctors = await Doctor.find(query);

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= SUBMIT RATING (FIXED) =================
const submitRating = async (req, res) => {
  try {
    const { docId, rating, review } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!docId) {
      return res.json({
        success: false,
        message: "Doctor ID missing",
      });
    }

    const doctor = await doctorModel.findById(docId);

    if (!doctor) {
      return res.json({
        success: false,
        message: "Doctor not found",
      });
    }

    const alreadyRated = doctor.ratings.find(
      (r) => String(r.userId) === String(userId)
    );

    if (alreadyRated) {
      return res.json({
        success: false,
        message: "You already rated this doctor",
      });
    }

    const appointment = await appointmentModel.findOne({
      userId: String(userId),
      docId: String(docId),
      isCompleted: true,
      cancelled: false,
    });

    if (!appointment) {
      return res.json({
        success: false,
        message: "You can only rate after a completed appointment",
      });
    }

    doctor.ratings.push({
      userId,
      rating,
      review,
      date: Date.now(),
    });

    doctor.totalRatings = doctor.ratings.length;

    doctor.averageRating = (
      doctor.ratings.reduce((sum, r) => sum + r.rating, 0) /
      doctor.ratings.length
    ).toFixed(1);

    await doctor.save();

    res.json({
      success: true,
      message: "Rating submitted successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// ================= EXPORTS =================
export {
  submitRating,
  changeAvailabilty,
  doctorLogin,
  appointmentsDoctor,
  appointmentComplete,
  doctorCancelAppointment,
  doctorDashboard,
  doctorList,
  doctorProfile,
  updateDoctorProfile,
};
