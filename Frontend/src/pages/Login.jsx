import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext);
  const navigate = useNavigate();

  const [state, setState] = useState("Sign Up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (state === "Sign Up") {
        const { data } = await axios.post(
          backendUrl + "/api/user/register",
          { name, password, email }
        );

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(
          backendUrl + "/api/user/login",
          { password, email }
        );

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) navigate("/");
  }, [token]);

  return (
    <section className="min-h-screen flex items-center justify-center bg-white px-6">

      <div className="w-full max-w-md bg-gray-900 text-white rounded-2xl p-8 shadow-2xl">

        <h2 className="text-3xl font-bold mb-2 text-center">
          {state === "Sign Up" ? "Create Account" : "Welcome Back"}
        </h2>

        <p className="text-gray-400 text-sm text-center mb-6">
          {state === "Sign Up"
            ? "Sign up to book appointments seamlessly"
            : "Login to continue your healthcare journey"}
        </p>

        <form onSubmit={onSubmitHandler} className="space-y-4">

          {state === "Sign Up" && (
            <div>
              <label className="text-sm text-gray-300">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-white focus:outline-none"
              />
            </div>
          )}

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

          <div className="relative">
            <label className="text-sm text-gray-300">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-white focus:outline-none pr-12"
            />

            {/* Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[38px] text-gray-400 hover:text-white text-sm"
            >
              {showPassword ? "Hide" : "View"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-gray-900 font-semibold py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-md"
          >
            {state === "Sign Up" ? "Create Account" : "Login"}
          </button>

        </form>

        <div className="text-center text-sm text-gray-400 mt-6">
          {state === "Sign Up" ? (
            <>
              Already have an account?{" "}
              <span
                onClick={() => setState("Login")}
                className="text-white font-semibold cursor-pointer hover:underline"
              >
                Login
              </span>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <span
                onClick={() => setState("Sign Up")}
                className="text-white font-semibold cursor-pointer hover:underline"
              >
                Sign Up
              </span>
            </>
          )}
        </div>

      </div>
    </section>
  );
};

export default Login;