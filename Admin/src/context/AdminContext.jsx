import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") || ""
  );

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState([]);

  // 🔥 AUTO CLEAR WHEN TOKEN REMOVED
  useEffect(() => {
    if (!aToken) {
      setDoctors([]);
      setAppointments([]);
      setDashData([]);
    }
  }, [aToken]);

  // ================= GET ALL DOCTORS =================
  const getAllDoctors = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/admin/all-doctors",
        { headers: { aToken } }
      );

      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch doctors");
    }
  };

  // ================= CHANGE AVAILABILITY =================
  const changeAvailability = async (docId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/change-availability",
        { docId },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error updating availability");
    }
  };

  // ================= VERIFY DOCTOR =================
  const updateDoctorVerification = async (docId, verificationStatus) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/verify-doctor",
        { docId, verificationStatus },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Error updating doctor verification";
      toast.error(message);
    }
  };

  // ================= GET APPOINTMENTS =================
  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/admin/appointments",
        { headers: { aToken } }
      );

      if (data.success) {
        setAppointments(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch appointments");
    }
  };

  // ================= CANCEL APPOINTMENT =================
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/cancel-appointment",
        { appointmentId },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
        getDashData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Cancel failed");
    }
  };

  // ================= DASHBOARD =================
  const getDashData = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/admin/dashboard",
        { headers: { aToken } }
      );

      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Dashboard error");
    }
  };

  // ================= LOGOUT =================
  const logoutAdmin = () => {
    localStorage.removeItem("aToken");

    // 🔥 CLEAR STATE
    setAToken("");
    setDoctors([]);
    setAppointments([]);
    setDashData([]);

    // 🔥 FORCE RESET (NO FLICKER)
    window.location.replace("/login");
  };

  // ================= VALUE =================
  const value = {
    aToken,
    setAToken,
    backendUrl,
    doctors,
    getAllDoctors,
    changeAvailability,
    updateDoctorVerification,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,
    getDashData,
    dashData,
    logoutAdmin, // ✅ IMPORTANT
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
