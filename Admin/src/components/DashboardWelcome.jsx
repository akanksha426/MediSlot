import React from "react";

const DashboardWelcome = ({ role }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 18) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-6">

      {/* Main Card */}
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-10 text-center">

        {/* Greeting */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-2 tracking-tight">
          {getGreeting()},
        </h1>

        {/* Role */}
        <h2 className="text-2xl md:text-3xl font-semibold text-blue-600 mb-4">
          {role === "admin" ? "Welcome Admin 👨‍⚕️" : "Welcome Doctor 👩‍⚕️"}
        </h2>

        {/* Divider */}
        <div className="w-16 h-1 bg-blue-500 mx-auto rounded-full mb-6"></div>

        {/* Description */}
        <p className="text-gray-600 text-lg leading-relaxed max-w-xl mx-auto">
          Welcome to{" "}
          <span className="font-semibold text-gray-900">MediSlot</span> — your
          smart healthcare management system.
          <br />
          Effortlessly manage appointments, patients, and medical workflows in one place.
        </p>

        {/* Highlight Box */}
        <div className="mt-8 bg-gradient-to-r from-black to-gray-800 text-white px-6 py-4 rounded-xl shadow-md">
          <p className="text-lg font-medium">
            Start by selecting an option from the sidebar
          </p>
        </div>

        {/* Footer Note */}
        <p className="text-sm text-gray-400 mt-6">
          Your centralized dashboard for smarter healthcare management
        </p>

      </div>
    </div>
  );
};

export default DashboardWelcome;