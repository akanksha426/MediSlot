import { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DontorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    backendUrl,
  } = useContext(DoctorContext);

  const { calculateAge, slotDateFormat, currency } =
    useContext(AppContext);

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  // ✅ DELETE FUNCTION
  const deleteAppointment = async (appointmentId) => {
    try {
      const confirmDelete = window.confirm(
        "Delete this appointment?"
      );
      if (!confirmDelete) return;

      const { data } = await axios.post(
        backendUrl + "/api/doctor/delete-appointment",
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
      console.log(error);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">
        All Appointments
      </p>

      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll">

        {/* Header */}
        <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b font-medium text-gray-700">
          <p>Sr no.</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {/* Data */}
        {appointments.map((item, index) => (
          <div
            key={index}
            className="flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50 transition"
          >
            <p className="max-sm:hidden">{index + 1}</p>

            {/* Patient */}
            <div className="flex items-center gap-2">
              <img
                className="w-8 rounded-full"
                src={item?.userData?.image}
                alt=""
              />
              <p>{item?.userData?.name}</p>
            </div>

            {/* Payment */}
            <div>
              <p className="text-xs inline border border-primary px-2 rounded-full">
                {item.payment ? "Online" : "CASH"}
              </p>
            </div>

            {/* Age */}
            <p className="max-sm:hidden">
              {calculateAge(item?.userData?.dob)}
            </p>

            {/* Date */}
            <p>
              {slotDateFormat(item?.slotDate)} ,{" "}
              {item?.slotTime}
            </p>

            {/* Fees */}
            <p>
              {currency}
              {item?.amount}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2">

              {/* Cancelled */}
              {item.cancelled && (
                <p className="text-red-400 text-xs font-medium">
                  Cancelled
                </p>
              )}

              {/* Completed */}
              {item.isCompleted && (
                <p className="text-green-500 text-xs font-medium">
                  Completed
                </p>
              )}
              
              {item.cancelled && item.cancelledBy === "doctor" && (
  <p className="text-red-500 text-xs font-medium">
    Cancelled by Doctor (Refund)
  </p>
)}

              {/* Active buttons */}
              {!item.cancelled && !item.isCompleted && (
                <>
                  <img
                    onClick={() =>
                      cancelAppointment(item?._id)
                    }
                    className="w-8 cursor-pointer hover:scale-110 transition"
                    src={assets.cancel_icon}
                    alt=""
                  />
                  <img
                    onClick={() =>
                      completeAppointment(item?._id)
                    }
                    className="w-8 cursor-pointer hover:scale-110 transition"
                    src={assets.tick_icon}
                    alt=""
                  />
                </>
              )}

              {/* ✅ DELETE BUTTON */}
              {(item.cancelled || item.isCompleted) && (
                <button
                  onClick={() =>
                    deleteAppointment(item._id)
                  }
                  className="text-red-500 hover:bg-red-500 hover:text-white p-2 rounded transition"
                  title="Delete Appointment"
                >
                  🗑
                </button>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;