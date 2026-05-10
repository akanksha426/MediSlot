import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from "react-toastify";
import axios from "axios";
import SlotSelector from "../components/SlotSelector";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, token, backendUrl, getDoctorsData, userData } =
    useContext(AppContext);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState("self");

  const navigate = useNavigate();
  const containerRef = useRef(null);
  const reviewEntries = (docInfo?.ratings || [])
    .filter((entry) => entry.review?.trim())
    .sort((a, b) => b.date - a.date)
    .slice(0, 3);

  const defaultWeeklySchedule = daysOfWeek.map((_, day) => ({
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

  const applyTimeToDate = (date, time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const nextDate = new Date(date);
    nextDate.setHours(hours, minutes, 0, 0);
    return nextDate;
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [docSlots]);
  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  const householdProfiles = [
    userData
      ? {
          id: "self",
          name: userData.name,
          relation: "Self",
          gender: userData.gender,
          dob: userData.dob,
          phone: userData.phone,
          image: userData.image,
        }
      : null,
    ...((userData?.familyMembers || []).map((member, index) => ({
      id: member.id || `family-${index}`,
      name: member.name,
      relation: member.relation || "Family member",
      gender: member.gender,
      dob: member.dob,
      phone: member.phone,
      image: userData?.image,
    })) || []),
  ].filter(Boolean);

  const selectedProfile =
    householdProfiles.find((profile) => profile.id === selectedProfileId) ||
    householdProfiles[0] ||
    null;

  const fetchDocInfo = async () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
  };

  const checkSlotAvailable = (docInfo, slotDate, slotTime) => {
    if (!docInfo || !docInfo.slots_booked) return true; // if  docinfo is null
    return !docInfo.slots_booked?.[slotDate]?.includes(slotTime);
  };

  const getAvailableSlots = async () => {
    setDocSlots([]);

    if (!docInfo) return;

    const today = new Date();
    const weeklySchedule = normalizeWeeklySchedule(docInfo.weeklySchedule);

    const generateSlotDate = (date) =>
      `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`;

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      const dayLabelDate = new Date(currentDate);
      const daySchedule = weeklySchedule.find(
        (item) => Number(item.day) === currentDate.getDay()
      );

      const timeSlots = [];

      if (daySchedule?.isOpen) {
        const slotCursor = applyTimeToDate(currentDate, daySchedule.startTime);
        const endTime = applyTimeToDate(currentDate, daySchedule.endTime);
        const slotDuration = Number(daySchedule.slotDuration || 30);

        if (i === 0) {
          const earliestToday = new Date(today);
          earliestToday.setHours(today.getHours() + 1, today.getMinutes(), 0, 0);

          while (slotCursor < earliestToday) {
            slotCursor.setMinutes(slotCursor.getMinutes() + slotDuration);
          }
        }

        while (slotCursor < endTime) {
          const formattedTime = slotCursor.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          const slotDate = generateSlotDate(slotCursor);
          const isAvailable = checkSlotAvailable(
            docInfo,
            slotDate,
            formattedTime
          );

          if (isAvailable) {
            timeSlots.push({
              datetime: new Date(slotCursor),
              time: formattedTime,
            });
          }

          slotCursor.setMinutes(slotCursor.getMinutes() + slotDuration);
        }
      }

      // If no available slots, add a placeholder
      if (timeSlots.length === 0) {
        timeSlots.push({ datetime: dayLabelDate, time: false });
      }


      setDocSlots((prev) => [...prev, timeSlots]);
    }
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Login to book appointment");
      return navigate("/login");
    }

    if (!slotTime) {
      return toast.error("Please select the slot time");
    }
    try {
      const date = docSlots[slotIndex][0].datetime;

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;

      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        { docId, slotDate, slotTime, patientProfile: selectedProfile },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("error:", error);
      toast.error(error.message);
    }
  };
  return (
    docInfo && (
      <div>
        {/* --------------Doctor Details ----------------- */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img
              className="bg-black w-full sm:max-w-72 rounded-lg  "
              src={docInfo.image}
              alt=""
            />
          </div>

          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[80px] sm:mt-0">
            {/* --------------- Doc info name , degree , experience      --------------- */}
            <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
              {docInfo.name}
              <img className="w-5" src={assets.verified_icon} alt="" />
            </p>
            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              <p>
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <button className=" py-0.5 px-2 border text-xs rounded-full">
                {docInfo.experience}{" "}
              </button>
            </div>

            {/* ------------- Doctor Avbout */}
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900mt-3">
                About <img src={assets.info_icon} alt="" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1">
                {docInfo.about}
              </p>
            </div>
            <p className="text-gray-500 font-medium mt-4">
              Appointment fee:{" "}
              <span className="text-gray-600">
                {currencySymbol}
                {docInfo.fees}
              </span>{" "}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">
                {(docInfo.averageRating || 0).toFixed(1)} stars
              </span>
              <span className="text-gray-500">
                {docInfo.totalRatings || 0} patient ratings
              </span>
            </div>
          </div>
        </div>

        {/* ---------- Booking slots */}

        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Booking slots</p>
          <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
            {docSlots.length &&
              docSlots.map((item, index) => (
                <div
                  onClick={() => setSlotIndex(index)}
                  className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                    slotIndex === index
                      ? "bg-black text-white"
                      : "border border-gray-200"
                  }`}
                  key={index}
                >
                  <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                  <p>{item[0] && item[0].datetime.getDate()}</p>
                </div>
              ))}
          </div>

          <SlotSelector
            docSlots={docSlots}
            slotIndex={slotIndex}
            slotTime={slotTime}
            setSlotTime={setSlotTime}
          />

          {token && householdProfiles.length > 0 && (
            <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    Family care desk
                  </p>
                  <p className="text-sm text-gray-500">
                    Choose who this appointment is for. Save more members in My Profile.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/my-profile")}
                  className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:border-gray-500 hover:text-gray-900"
                >
                  Manage family
                </button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {householdProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => setSelectedProfileId(profile.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selectedProfileId === profile.id
                        ? "border-black bg-black text-white"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <p className="text-base font-semibold">{profile.name}</p>
                    <p
                      className={`mt-1 text-sm ${
                        selectedProfileId === profile.id
                          ? "text-gray-200"
                          : "text-gray-500"
                      }`}
                    >
                      {profile.relation}
                    </p>
                    <p
                      className={`mt-3 text-xs ${
                        selectedProfileId === profile.id
                          ? "text-gray-300"
                          : "text-gray-400"
                      }`}
                    >
                      {profile.gender || "Gender not set"} | {profile.phone || "Phone not set"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={bookAppointment}
            className="bg-black text-white text-sm font-light px-14 py-3 rounded-full my-5"
          >
            Book an appointment
          </button>

          <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  Patient reviews
                </p>
                <p className="text-sm font-normal text-gray-500">
                  Recent feedback from completed appointments
                </p>
              </div>
              <span className="text-sm font-medium text-amber-600">
                {(docInfo.averageRating || 0).toFixed(1)} / 5 average
              </span>
            </div>

            {reviewEntries.length > 0 ? (
              <div className="mt-4 grid gap-3">
                {reviewEntries.map((entry, index) => (
                  <div
                    key={`${entry.userId}-${entry.date}-${index}`}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-gray-900">
                        Patient review
                      </p>
                      <p className="text-sm text-amber-600">
                        {Number(entry.rating || 0).toFixed(1)} / 5
                      </p>
                    </div>
                    <p className="mt-2 text-sm font-normal leading-6 text-gray-600">
                      {entry.review}
                    </p>
                    <p className="mt-2 text-xs font-normal text-gray-400">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm font-normal text-gray-500">
                No written reviews yet. Ratings will appear here after completed visits.
              </p>
            )}
          </div>
        </div>

        {/* ------------------listing related doctors */}
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
};

export default Appointment;
