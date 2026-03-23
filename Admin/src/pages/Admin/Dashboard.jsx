import { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { assets } from "../../assets/assets.js";
import { AppContext } from "../../context/AppContext.jsx";
import MoveUpOnRender from "../../components/MoveUpOnRender.jsx";
import DashboardWelcome from "../../components/DashboardWelcome";

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } =
    useContext(AdminContext);

  const { slotDateFormat } = useContext(AppContext);

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken]);

  return (
    <MoveUpOnRender id="admin-dash">
      <div className="p-6 bg-slate-50 min-h-screen">

        {/* ✅ ALWAYS SHOW SOMETHING (NO BLANK SCREEN) */}
        {!dashData || dashData?.latestAppointments?.length === 0 ? (
          <DashboardWelcome role="admin" />
        ) : (
          <>
            {/* ================= TOP CARDS ================= */}
            <div className="flex flex-wrap gap-6">

              {/* Doctors */}
              <div className="flex items-center gap-4 bg-white px-6 py-5 min-w-56 rounded-xl shadow-sm border hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <img className="w-10" src={assets.doctor_icon} alt="" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-700">
                    {dashData?.doctors || 0}
                  </p>
                  <p className="text-gray-500 text-sm">Total Doctors</p>
                </div>
              </div>

              {/* Appointments */}
              <div className="flex items-center gap-4 bg-white px-6 py-5 min-w-56 rounded-xl shadow-sm border hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="bg-green-100 p-3 rounded-lg">
                  <img className="w-10" src={assets.appointments_icon} alt="" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-700">
                    {dashData?.appointments || 0}
                  </p>
                  <p className="text-gray-500 text-sm">Appointments</p>
                </div>
              </div>

              {/* Patients */}
              <div className="flex items-center gap-4 bg-white px-6 py-5 min-w-56 rounded-xl shadow-sm border hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <img className="w-10" src={assets.patients_icon} alt="" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-700">
                    {dashData?.users || 0}
                  </p>
                  <p className="text-gray-500 text-sm">Patients</p>
                </div>
              </div>
            </div>

            {/* ================= LATEST APPOINTMENTS ================= */}
            <div className="mt-10 bg-white rounded-xl shadow-sm border overflow-hidden">

              <div className="flex items-center gap-3 px-6 py-4 border-b bg-slate-50">
                <img className="w-5" src={assets.list_icon} alt="" />
                <p className="font-semibold text-gray-700">
                  Latest Appointments
                </p>
              </div>

              <div>
                {dashData?.latestAppointments?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 px-6 py-4 border-b hover:bg-slate-50 transition"
                  >
                    <img
                      className="w-11 h-11 rounded-full object-cover border"
                      src={item?.docData?.image}
                      alt=""
                    />

                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {item?.docData?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {slotDateFormat(item?.slotDate)} | {item?.slotTime}
                      </p>
                    </div>

                    {item.cancelled ? (
                      <span className="text-xs font-semibold text-red-500 bg-red-100 px-3 py-1 rounded-full">
                        Cancelled
                      </span>
                    ) : item.isCompleted ? (
                      <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                        Completed
                      </span>
                    ) : (
                      <img
                        onClick={() => cancelAppointment(item._id)}
                        className="w-8 cursor-pointer hover:scale-110 transition"
                        src={assets.cancel_icon}
                        alt=""
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </MoveUpOnRender>
  );
};

export default Dashboard;