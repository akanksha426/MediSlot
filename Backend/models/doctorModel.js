import mongoose from "mongoose";

const defaultWeeklySchedule = [
  { day: 0, isOpen: false, startTime: "10:00", endTime: "21:00", slotDuration: 30 },
  { day: 1, isOpen: true, startTime: "10:00", endTime: "21:00", slotDuration: 30 },
  { day: 2, isOpen: true, startTime: "10:00", endTime: "21:00", slotDuration: 30 },
  { day: 3, isOpen: true, startTime: "10:00", endTime: "21:00", slotDuration: 30 },
  { day: 4, isOpen: true, startTime: "10:00", endTime: "21:00", slotDuration: 30 },
  { day: 5, isOpen: true, startTime: "10:00", endTime: "21:00", slotDuration: 30 },
  { day: 6, isOpen: true, startTime: "10:00", endTime: "21:00", slotDuration: 30 },
];

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    registrationNumber: { type: String, default: "" },
    licenseDocument: { type: String, default: "" },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verificationNotes: { type: String, default: "" },
    fees: { type: Number, required: true },
    address: { type: Object, required: true },
    date: { type: Number, required: true },
    weeklySchedule: {
      type: Array,
      default: () => defaultWeeklySchedule,
    },
    city: { type: String, default: "" },  
     ratings: { type: Array, default: [] },         // 👈 added
    averageRating: { type: Number, default: 0 },   // 👈 added
    totalRatings: { type: Number, default: 0 }, 
    slots_booked: { type: Object, default: {} },
  },
  { minimize: false }
);

//minimize false allows to add empty object {} in schema

const doctorModel =
  mongoose.models.doctor || mongoose.model("doctor", doctorSchema);

export default doctorModel;
