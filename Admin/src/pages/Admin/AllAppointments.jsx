import { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import MoveUpOnRender from "../../components/MoveUpOnRender";
import axios from "axios";
import { toast } from "react-toastify";

const AllAppointments = () => {
  const {
    aToken,
    appointments,
    getAllAppointments,
    cancelAppointment,
    backendUrl,
  } = useContext(AdminContext);

  const { currency, calculateAge, slotDateFormat } =
    useContext(AppContext);

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);

  // ✅ DELETE FUNCTION
  const deleteAppointment = async (appointmentId) => {
    try {
      const confirmDelete = window.confirm(
        "Delete this appointment?"
      );
      if (!confirmDelete) return;

      const { data } = await axios.post(
        backendUrl + "/api/admin/delete-appointment",
        { appointmentId },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="w-full max-w-7xl m-5">
      <MoveUpOnRender id="admin-allappointment">

        <p className="mb-3 text-lg font-medium">
          All Appointments
        </p>

        <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll">

          {/* Header */}
          <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center py-3 px-6 border-b font-medium text-gray-700">
            <p>Sr No.</p>
            <p>Patient</p>
            <p>Age</p>
            <p>Date & Time</p>
            <p>Doctor</p>
            <p>Fees</p>
            <p>Actions</p>
          </div>

          {/* Data */}
          {appointments.map((item, index) => (
            <div
              key={index}
              className="flex flex-wrap justify-between sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-600 py-3 px-6 border-b hover:bg-gray-50 transition"
            >
              <p className="max-sm:hidden">{index + 1}</p>

              {/* Patient */}
              <div className="flex items-center gap-2">
                <img
                  className="w-8 rounded-full"
                  src={item?.userData?.image}
                  alt=""
                />
                <p className="capitalize">
                  {item?.userData?.name}
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

              {/* Doctor */}
              <div className="flex items-center gap-2">
                <img
                  className="w-8 rounded-full bg-gray-200"
                  src={item?.docData?.image}
                  alt=""
                />
                <p>{item?.docData?.name}</p>
              </div>

              {/* Fees */}
              <p>
                {currency}
                {item?.docData?.fees}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2">

                {/* Active → Cancel */}
                {!item.cancelled && !item.isCompleted && (
                  <img
                    onClick={() =>
                      cancelAppointment(item._id)
                    }
                    className="w-8 cursor-pointer hover:scale-110 transition"
                    src={assets.cancel_icon}
                    alt=""
                  />
                )}

                {/* Cancelled */}
                {item.cancelled && (
                  <p className="text-red-500 text-xs font-medium">
                    Cancelled
                  </p>
                )}

                {/* Completed */}
                {item.isCompleted && (
                  <p className="text-green-500 text-xs font-medium">
                    Completed
                  </p>
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

      </MoveUpOnRender>
    </div>
  );
};

export default AllAppointments;