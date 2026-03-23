import { Link } from "react-router-dom";
import { specialityData } from "../assets/assets";

const SpecialityMenu = () => {
  return (
    <section
      id="speciality"
      className="py-24 px-6 md:px-16 bg-white"
    >
      {/* Section Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-gray-900">
          Find by Speciality
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Explore our wide range of medical specialities and book trusted doctors instantly.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 mt-16">

        {specialityData.map((item, index) => (
          <Link
            key={index}
            to={`/doctors/${item.speciality}`}
            onClick={() => window.scrollTo(0, 0)}
            className="group flex flex-col items-center p-6 bg-gray-50 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
          >
            {/* Icon Container */}
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white shadow-md group-hover:scale-110 transition duration-300">
              <img
                className="w-18 h-18 object-contain"
                src={item.image}
                alt={item.speciality}
              />
            </div>

            {/* Speciality Name */}
            <p className="mt-5 text-sm font-semibold text-gray-700 group-hover:text-black transition">
              {item.speciality}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default SpecialityMenu;