import axios from "axios";
import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState(
    localStorage.getItem("dToken") || ""
  );

  const [doctorId, setDoctorId] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState([]);
  const [profileData, setProfileData] = useState(null);

  // 🔥 AUTO CLEAR WHEN TOKEN REMOVED
  useEffect(() => {
    if (!dToken) {
      setAppointments([]);
      setProfileData(null);
      setDoctorId("");
    }
  }, [dToken]);

  // ================= GET APPOINTMENTS =================
  const getAppointments = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/doctor/appointments",
        { headers: { dToken } }
      );

      if (data.success) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch appointments");
    }
  };

  // ================= COMPLETE APPOINTMENT =================
  const completeAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/complete-appointment",
        { appointmentId },
        { headers: { dToken } }
      );

      if (data.success) {
        getAppointments();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error completing appointment");
    }
  };

  // ================= CANCEL APPOINTMENT =================
  const cancelAppointment = async (appointmentId) => {
    try {
      const confirmCancel = window.confirm(
        "Cancel appointment?\nPatient will get full refund."
      );

      if (!confirmCancel) return;

      const { data } = await axios.post(
        backendUrl + "/api/doctor/cancel-appointment",
        { appointmentId },
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAppointments();
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
        backendUrl + "/api/doctor/dashboard",
        { headers: { dToken } }
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

  // ================= PROFILE =================
  const getProfileData = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/doctor/profile",
        { headers: { dToken } }
      );

      if (data.success) {
        setProfileData(data.profileData);

        // 🔥 IMPORTANT
        setDoctorId(data.profileData._id);

      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Profile error");
    }
  };

  // ================= LOGOUT =================
  const logoutDoctor = () => {
    localStorage.removeItem("dToken");

    // 🔥 CLEAR EVERYTHING
    setDToken("");
    setDoctorId("");
    setAppointments([]);
    setProfileData(null);
    setDashData([]);

    //Force Reset
    window.location.replace("/login");
  };

 
  const value = {
    doctorId,
    dToken,
    setDToken,
    backendUrl,
    appointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    dashData,
    getDashData,
    profileData,
    getProfileData,
    logoutDoctor,
    setProfileData 
  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;