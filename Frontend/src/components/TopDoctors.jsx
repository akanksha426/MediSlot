import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const TopDoctors = () => {
  const { doctors } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <section className="bg-gray-50 px-6 py-12 md:px-12">
      <div className="space-y-4 text-center">
        <h2 className="text-4xl font-bold text-gray-900">Top Doctors to Book</h2>
        <p className="mx-auto max-w-xl text-gray-500">
          Explore our most trusted and highly rated doctors available for instant appointments.
        </p>
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {doctors.slice(0, 8).map((item) => (
          <div
            key={item._id}
            onClick={() => {
              navigate(`/appointment/${item._id}`);
              window.scrollTo(0, 0);
            }}
            className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-2xl"
          >
            <div className="relative overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
              />

              <div className="absolute left-4 top-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    item.available
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {item.available ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>

            <div className="space-y-2 p-5">
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.speciality}</p>

              <div className="flex items-center justify-between pt-3">
                <span className="text-sm text-yellow-500">
                  {(item.averageRating || 0).toFixed(1)} star
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  Rs{item.fees}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={() => {
            navigate("/doctors");
            window.scrollTo(0, 0);
          }}
          className="rounded-xl bg-black px-10 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          View All Doctors
        </button>
      </div>
    </section>
  );
};

export default TopDoctors;
