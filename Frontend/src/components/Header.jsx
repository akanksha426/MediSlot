import { assets } from "../assets/assets";

const Header = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] px-6 md:px-16 py-16 md:py-24 shadow-2xl">
      
      {/* Background Glow Effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-12">

        {/* LEFT SIDE */}
        <div className="md:w-1/2 text-white space-y-6 animate-fadeIn">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/20">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Trusted by 5,000+ Patients
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            Book Verified <br />
            Doctors Instantly
          </h1>

          {/* Subtext */}
          <p className="text-white/70 text-lg max-w-lg leading-relaxed">
            Find top-rated specialists, check real-time availability,
            and schedule appointments seamlessly with MediSlot.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <a
              href="#speciality"
              className="bg-white text-black px-8 py-3 rounded-xl font-semibold hover:scale-105 hover:shadow-xl transition-all duration-300"
            >
              Book Appointment
            </a>

            <a
              href="#speciality"
              className="border border-white/30 text-white px-8 py-3 rounded-xl backdrop-blur-md hover:bg-white/10 transition-all duration-300"
            >
              Explore Doctors
            </a>
          </div>

          {/* Stats */}
          <div className="flex gap-10 pt-10">
            {[
              { number: "100+", label: "Verified Doctors" },
              { number: "10K+", label: "Appointments" },
              { number: "24/7", label: "Support" },
            ].map((item, index) => (
              <div key={index}>
                <p className="text-3xl font-bold text-white">{item.number}</p>
                <p className="text-white/50 text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="md:w-1/2 relative animate-fadeIn">
          <div className="relative z-10">
            <img
              src={assets.header_img}
              alt="Doctors"
              className="rounded-3xl shadow-2xl"
            />
          </div>

          
        </div>
      </div>
    </section>
  );
};

export default Header;