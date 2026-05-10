import { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DontorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    backendUrl,
    doctorId,
  } = useContext(DoctorContext);

  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

  useEffect(() => {
    if (!doctorId) return;

    socket.emit("joinDoctor", doctorId);
    socket.on("slotUpdated", getAppointments);

    return () => {
      socket.off("slotUpdated", getAppointments);
    };
  }, [doctorId, getAppointments]);

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  const deleteAppointment = async (appointmentId) => {
    try {
      const confirmDelete = window.confirm("Delete this appointment?");
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
      toast.error("Delete failed");
    }
  };

  const renderStatus = (item) => {
    if (item.cancelled) {
      return (
        <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
          {item.cancelledBy === "doctor" ? "Cancelled by doctor" : "Cancelled"}
        </span>
      );
    }

    if (item.isCompleted) {
      return (
        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
          Completed
        </span>
      );
    }

    return (
      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        Pending
      </span>
    );
  };

  const renderActions = (item) => {
    if (!item.cancelled && !item.isCompleted) {
      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => cancelAppointment(item._id)}
            className="rounded-lg border border-rose-200 bg-rose-50 p-2 transition hover:bg-rose-100"
            title="Cancel appointment"
          >
            <img className="h-4 w-4" src={assets.cancel_icon} alt="Cancel" />
          </button>
          <button
            type="button"
            onClick={() => completeAppointment(item._id)}
            className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 transition hover:bg-emerald-100"
            title="Mark complete"
          >
            <img className="h-4 w-4" src={assets.tick_icon} alt="Complete" />
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => deleteAppointment(item._id)}
        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
      >
        Delete
      </button>
    );
  };

  return (
    <div className="w-full px-6 py-8 lg:px-8">
      <div className="mb-5">
        <p className="text-2xl font-semibold text-slate-900">All Appointments</p>
        <p className="mt-1 text-sm text-slate-500">
          Review upcoming visits, update statuses, and inspect urgent handoff details.
        </p>
      </div>

      <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-sm font-semibold text-slate-600">
                <th className="w-16 px-4 py-4">#</th>
                <th className="w-72 px-4 py-4">Patient</th>
                <th className="w-28 px-4 py-4">Payment</th>
                <th className="w-20 px-4 py-4">Age</th>
                <th className="w-56 px-4 py-4">Date & Time</th>
                <th className="w-24 px-4 py-4">Fees</th>
                <th className="w-36 px-4 py-4">Status</th>
                <th className="w-36 px-4 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-16 text-center text-sm text-slate-500"
                  >
                    No appointments yet.
                  </td>
                </tr>
              ) : (
                appointments.map((item, index) => (
                    <tr
                      key={item._id || index}
                      className="border-b border-slate-200 align-top text-sm text-slate-600"
                    >
                      <td className="px-4 py-5 font-medium text-slate-700">
                        {index + 1}
                      </td>

                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <img
                            className="h-11 w-11 flex-none rounded-full object-cover ring-1 ring-slate-200"
                            src={item?.userData?.image}
                            alt={item?.userData?.name || "Patient"}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                              {item?.userData?.name}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {item?.userData?.relation
                                ? `${item.userData.relation} • ${item?.userData?.gender || "Patient"}`
                                : item?.userData?.gender || "Patient"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-5">
                        <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                          {item.payment ? "Online" : "Cash"}
                        </span>
                      </td>

                      <td className="px-4 py-5">
                        {calculateAge(item?.userData?.dob)}
                      </td>

                      <td className="px-4 py-5">
                        <p className="font-medium text-slate-800">
                          {slotDateFormat(item?.slotDate)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item?.slotTime}
                        </p>
                      </td>

                      <td className="px-4 py-5 font-semibold text-slate-900">
                        {currency}
                        {item?.amount}
                      </td>

                      <td className="px-4 py-5">{renderStatus(item)}</td>

                      <td className="px-4 py-5">{renderActions(item)}</td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;
