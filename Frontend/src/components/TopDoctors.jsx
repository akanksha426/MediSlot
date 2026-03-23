import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const TopDoctors = () => {
  const { doctors } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <section className="py-12 px-6 md:px-12 bg-gray-50">

      {/* Section Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-gray-900">
          Top Doctors to Book
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Explore our most trusted and highly rated doctors available for instant appointments.
        </p>
      </div>

      {/* Doctor Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-10">

        {doctors.slice(0, 8).map((item) => (
          <div
            key={item._id}
            onClick={() => {
              navigate(`/appointment/${item._id}`);
              window.scrollTo(0, 0);
            }}
            className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden"
          >

            {/* Image */}
            <div className="relative overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-64 object-cover group-hover:scale-105 transition duration-500"
              />

              {/* Availability Badge */}
              <div className="absolute top-4 left-4">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    item.available
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {item.available ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {item.name}
              </h3>
              <p className="text-sm text-gray-500">
                {item.speciality}
              </p>

              {/* Rating + Fees */}
              <div className="flex items-center justify-between pt-3">
                <span className="text-yellow-500 text-sm">★ 4.8</span>
                <span className="text-blue-600 font-semibold text-sm">
                  ₹{item.fees}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-10">
        <button
          onClick={() => {
            navigate("/doctors");
            window.scrollTo(0, 0);
          }}
          className="bg-black text-white px-10 py-3 rounded-xl font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300"
        >
          View All Doctors
        </button>
      </div>

    </section>
  );
};

export default TopDoctors;