import { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DontorContext";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useState } from "react";

const dayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const defaultWeeklySchedule = dayLabels.map((_, day) => ({
  day,
  isOpen: day !== 0,
  startTime: "10:00",
  endTime: "21:00",
  slotDuration: 30,
}));

const normalizeWeeklySchedule = (weeklySchedule) => {
  if (!Array.isArray(weeklySchedule) || weeklySchedule.length !== 7) {
    return defaultWeeklySchedule;
  }

  return defaultWeeklySchedule.map((defaultDay) => ({
    ...defaultDay,
    ...weeklySchedule.find((item) => Number(item.day) === defaultDay.day),
  }));
};

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData, backendUrl } =
    useContext(DoctorContext);
  const { currency } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  const updateProfile = async () => {
    try {
      const updateData = {
        address: profileData.address,
        fees: profileData.fees,
        available: profileData.available,
        weeklySchedule: normalizeWeeklySchedule(profileData.weeklySchedule),
      };

      const { data } = await axios.post(
        backendUrl + "/api/doctor/update-profile",
        updateData,
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        getProfileData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("error:", error);
      toast.error(error?.message);
    }
  };

  const updateScheduleDay = (day, field, value) => {
    setProfileData((prev) => {
      const weeklySchedule = normalizeWeeklySchedule(prev.weeklySchedule).map((item) =>
        item.day === day ? { ...item, [field]: value } : item
      );

      return { ...prev, weeklySchedule };
    });
  };

  return (
    profileData && (
      <div>
        <div className="flex flex-col gap-4 m-5">
          <div>
            <img
              className="bg-primary/80  w-full sm:max-w-64 rounded-lg"
              src={profileData.image}
              alt=""
            />
          </div>

          <div className="flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white">
            {/* ---docinfo name degree experience */}
            <p className="flex items-center gap-2 text-3xl font-medium text-gray-600">
              {profileData.name}
            </p>
            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <p>
                {profileData.degree} -{profileData.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full ">
                {profileData.experience}
              </button>
            </div>

            {/* Doct about */}
            <div>
              <p className="flex item-center gap-1 text-sm font-medium text-neutral-800 mt-3">
                About:
              </p>
              <p className="text-sm text-gray-600 max-w-[700px] mt-3">
                {profileData.about}
              </p>
            </div>

            <p className="text-gray-600 font-medium mt-4">
              Appointment fee:{" "}
              <span className="text-gray-800">
                {currency}
                {isEdit ? (
                  <input
                    type="number"
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        fees: e.target.value,
                      }))
                    }
                    value={profileData.fees}
                  />
                ) : (
                  profileData.fees
                )}
              </span>
            </p>

            <div className="flex gap-2 py-2">
              <p>Address:</p>
              <p className="text-sm">
                {isEdit ? (
                  <input
                    type="text"
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        address: { ...prev.address, line1: e.target.value },
                      }))
                    }
                    value={profileData?.address?.line1}
                  />
                ) : (
                  profileData.address.line1
                )}
                <br />
                {isEdit ? (
                  <input
                    type="text"
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        address: { ...prev.address, line2: e.target.value },
                      }))
                    }
                    value={profileData?.address?.line2}
                  />
                ) : (
                  profileData.address.line2
                )}
              </p>
            </div>

            <div className="flex gap-1 pt-2">
              <input
                onChange={() =>
                  isEdit &&
                  setProfileData((prev) => ({
                    ...prev,
                    available: !prev.available,
                  }))
                }
                checked={profileData.available}
                type="checkbox"
              />
              <label htmlFor="">Available</label>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-5">
              <div>
                <p className="text-lg font-medium text-gray-700">Weekly schedule</p>
                <p className="text-sm text-gray-500">
                  Set the days and times patients can book appointments.
                </p>
              </div>

              <div className="mt-4 grid gap-3">
                {normalizeWeeklySchedule(profileData.weeklySchedule).map((daySchedule) => (
                  <div
                    key={daySchedule.day}
                    className="grid gap-3 rounded-lg border border-gray-200 p-3 md:grid-cols-[120px_90px_1fr_1fr_120px]"
                  >
                    <p className="font-medium text-gray-700">
                      {dayLabels[daySchedule.day]}
                    </p>

                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={daySchedule.isOpen}
                        disabled={!isEdit}
                        onChange={(e) =>
                          updateScheduleDay(daySchedule.day, "isOpen", e.target.checked)
                        }
                      />
                      Open
                    </label>

                    <input
                      type="time"
                      value={daySchedule.startTime}
                      disabled={!isEdit || !daySchedule.isOpen}
                      onChange={(e) =>
                        updateScheduleDay(daySchedule.day, "startTime", e.target.value)
                      }
                      className="rounded-md border px-3 py-2 text-sm disabled:bg-gray-100"
                    />

                    <input
                      type="time"
                      value={daySchedule.endTime}
                      disabled={!isEdit || !daySchedule.isOpen}
                      onChange={(e) =>
                        updateScheduleDay(daySchedule.day, "endTime", e.target.value)
                      }
                      className="rounded-md border px-3 py-2 text-sm disabled:bg-gray-100"
                    />

                    <select
                      value={daySchedule.slotDuration}
                      disabled={!isEdit || !daySchedule.isOpen}
                      onChange={(e) =>
                        updateScheduleDay(
                          daySchedule.day,
                          "slotDuration",
                          Number(e.target.value)
                        )
                      }
                      className="rounded-md border px-3 py-2 text-sm disabled:bg-gray-100"
                    >
                      <option value={15}>15 min</option>
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {isEdit ? (
              <button
                onClick={updateProfile}
                className="px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all"
              >
                save
              </button>
            ) : (
              <button
                onClick={() => setIsEdit(true)}
                className="px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all"
              >
                edit
              </button>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default DoctorProfile;
