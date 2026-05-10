import { useContext, useState } from "react";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DontorContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [state, setState] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (state === "Admin") {
        const { data } = await axios.post(
          backendUrl + "/api/admin/login",
          { email, password }
        );

        if (data.success) {
          // 🔥 REMOVE DOCTOR TOKEN (ROLE SWITCH FIX)
          localStorage.removeItem("dToken");

          // ✅ SAVE ADMIN TOKEN
          localStorage.setItem("aToken", data.token);
          setAToken(data.token);

          // 🔥 REDIRECT TO ADMIN WELCOME PAGE
          window.location.replace("/");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(
          backendUrl + "/api/doctor/login",
          { email, password }
        );

        if (data.success) {
          // 🔥 REMOVE ADMIN TOKEN (ROLE SWITCH FIX)
          localStorage.removeItem("aToken");

          // ✅ SAVE DOCTOR TOKEN
          localStorage.setItem("dToken", data.token);
          setDToken(data.token);

          // 🔥 REDIRECT TO DOCTOR DASHBOARD
          window.location.replace("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error("Login failed");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md bg-gray-900 text-white rounded-2xl p-8 shadow-2xl">

        {/* Toggle Tabs */}
        <div className="flex mb-6 bg-gray-800 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setState("Admin")}
            className={`flex-1 py-2 text-sm font-semibold transition ${
              state === "Admin"
                ? "bg-white text-gray-900"
                : "text-gray-400"
            }`}
          >
            Admin
          </button>

          <button
            type="button"
            onClick={() => setState("Doctor")}
            className={`flex-1 py-2 text-sm font-semibold transition ${
              state === "Doctor"
                ? "bg-white text-gray-900"
                : "text-gray-400"
            }`}
          >
            Doctor
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center">
          {state} Login
        </h2>

        <form onSubmit={onSubmitHandler} className="space-y-4">

          {/* Email */}
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-white focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="text-sm text-gray-300">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-3 pr-12 rounded-xl bg-gray-800 border border-gray-700 focus:border-white focus:outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[38px] text-gray-400 hover:text-white text-sm"
            >
              {showPassword ? "Hide" : "View"}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-white text-gray-900 font-semibold py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-md"
          >
            Login
          </button>

        </form>
      </div>
    </section>
  );
};

export default Login;