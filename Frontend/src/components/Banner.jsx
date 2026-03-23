import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

const Banner = () => {
  const navigate = useNavigate();
  const { token } = useContext(AppContext);

  return (
    <section className="relative my-12 px-6 md:px-16">

      <div className="relative bg-gradient-to-br from-[#0b1120] via-[#111827] to-[#1f2937] rounded-3xl overflow-hidden shadow-2xl">

        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="relative flex flex-col lg:flex-row items-center justify-between px-10 py-16">

          {/* LEFT CONTENT */}
          <div className="max-w-xl text-white space-y-6">

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Your Health,
              <br />
              Our Priority.
            </h2>

            <p className="text-white/70 text-lg leading-relaxed">
              Connect with 100+ verified doctors instantly.
              Book appointments seamlessly and receive trusted medical care.
            </p>

            {!token && (
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => {
                    navigate("/login");
                    window.scrollTo(0, 0);
                  }}
                  className="bg-white text-gray-900 font-semibold px-8 py-3 rounded-xl shadow-md hover:scale-105 hover:shadow-xl transition-all duration-300"
                >
                  Create Account
                </button>

                
              </div>
            )}

          </div>

          {/* RIGHT IMAGE */}
          <div className="mt-10 lg:mt-0 lg:ml-10 relative">
            <img
              src={assets.appointment_img}
              alt="Doctors"
              className="w-[340px] md:w-[420px] drop-shadow-2xl"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default Banner;