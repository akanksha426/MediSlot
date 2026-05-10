import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import MoveUpOnRender from "../components/MoveUpOnRender";

const specialityList = [
  "General physician",
  "Gynecologist",
  "Dermatologist",
  "Pediatricians",
  "Neurologist",
  "Gastroenterologist",
];

const Doctors = () => {
  const [locationQuery, setLocationQuery] = useState("");
  const [specialitySearch, setSpecialitySearch] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const { speciality } = useParams();
  const [searchParams] = useSearchParams();
  const { doctors } = useContext(AppContext);
  const [filterDoc, setFilterDoc] = useState([]);
  const navigate = useNavigate();

  const symptomQuery = searchParams.get("symptom") || "";
  const urgency = searchParams.get("urgency") || "";
  const matchedTerms = searchParams.get("matched") || "";

  const applyFilter = () => {
    let result = [...doctors];

    if (speciality) {
      result = result.filter((doc) => doc.speciality === speciality);
    }

    if (specialitySearch.trim()) {
      const query = specialitySearch.toLowerCase();
      result = result.filter((doc) =>
        doc.speciality.toLowerCase().includes(query)
      );
    }

    if (locationQuery.trim()) {
      const location = locationQuery.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.address?.line1?.toLowerCase().includes(location) ||
          doc.address?.line2?.toLowerCase().includes(location)
      );
    }

    if (sortBy === "available") {
      result = result.filter((doc) => doc.available);
    }

    if (sortBy === "rating") {
      result.sort(
        (a, b) => (b.averageRating || 0) - (a.averageRating || 0)
      );
    }

    setFilterDoc(result);
  };

  useEffect(() => {
    applyFilter();
  }, [doctors, speciality, specialitySearch, locationQuery, sortBy]);

  return (
    <div className="px-2 sm:px-0">
      {symptomQuery && (
        <div className="mb-5 rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,_#f8fbff_0%,_#ffffff_48%,_#f1f5ff_100%)] p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Guided by symptoms
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Best match: {speciality || "General physician"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Based on "{symptomQuery}", MediSlot narrowed the search to the most relevant specialists so booking feels less overwhelming.
              </p>
              {matchedTerms && (
                <p className="mt-2 text-sm text-slate-500">
                  Matched signals: {matchedTerms}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 md:items-end">
              {urgency && (
                <span
                  className={`inline-flex rounded-full px-4 py-2 text-sm font-medium ${
                    urgency === "Priority"
                      ? "bg-rose-100 text-rose-700"
                      : urgency === "Soon"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {urgency} attention
                </span>
              )}
              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
              >
                Try another symptom search
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-10 bg-white pb-4 pt-2 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={specialitySearch}
            onChange={(event) => setSpecialitySearch(event.target.value)}
            placeholder="Search speciality"
            className="flex-1 rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300"
          />

          <input
            type="text"
            value={locationQuery}
            onChange={(event) => setLocationQuery(event.target.value)}
            placeholder="Location"
            className="flex-1 rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300"
          />

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-xl border px-4 py-3 text-gray-600"
          >
            <option value="default">Sort</option>
            <option value="rating">Top Rated</option>
            <option value="available">Available Now</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {specialityList.map((item) => (
          <span
            key={item}
            onClick={() =>
              setSpecialitySearch((current) => (current === item ? "" : item))
            }
            className={`cursor-pointer rounded-full px-4 py-1 text-sm transition ${
              specialitySearch === item
                ? "bg-indigo-500 text-white"
                : "bg-gray-100 hover:bg-indigo-100"
            }`}
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-6">
        <p className="mb-4 text-sm text-gray-400">{filterDoc.length} doctors found</p>

        <MoveUpOnRender>
          <div className="grid grid-cols-1 gap-4 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filterDoc.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/appointment/${item._id}`)}
                className="flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="h-52 w-full overflow-hidden bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover object-top"
                  />
                </div>

                <div className="flex flex-grow flex-col p-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        item.available
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {item.available ? "Available" : "Unavailable"}
                    </span>

                    <span className="font-medium text-yellow-500">
                      {(item.averageRating || 0).toFixed(1)} star
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.speciality}</p>
                  <p className="mt-1 text-xs text-gray-400">{item.address?.line1}</p>

                  <div className="flex-grow" />

                  <button className="mt-4 w-full rounded-xl bg-indigo-500 py-2 text-white transition hover:bg-indigo-600">
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filterDoc.length === 0 && (
            <div className="py-20 text-center text-gray-400">
              <p className="mb-3 text-5xl">No results</p>
              <p>No doctors found</p>
            </div>
          )}
        </MoveUpOnRender>
      </div>
    </div>
  );
};

export default Doctors;
