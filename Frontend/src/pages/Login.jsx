import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext);
  const navigate = useNavigate();

  const [state, setState] = useState("Login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isSignUp = state === "Sign Up";
  const isForgotPassword = state === "Forgot Password";

  const switchState = (nextState) => {
    setState(nextState);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (isSignUp) {
        const { data } = await axios.post(backendUrl + "/api/user/register", {
          name,
          password,
          email,
        });

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success(data.message || "Account created successfully");
        } else {
          toast.error(data.message);
        }
        return;
      }

      if (isForgotPassword) {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }

        const { data } = await axios.post(backendUrl + "/api/user/reset-password", {
          email,
          newPassword: password,
        });

        if (data.success) {
          toast.success(data.message);
          switchState("Login");
        } else {
          toast.error(data.message);
        }
        return;
      }

      const { data } = await axios.post(backendUrl + "/api/user/login", {
        password,
        email,
      });

      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        toast.success("Login successful");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (token) navigate("/");
  }, [token, navigate]);

  return (
    <section className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md bg-gray-900 text-white rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold mb-2 text-center">
          {isSignUp
            ? "Create Account"
            : isForgotPassword
            ? "Reset Password"
            : "Welcome Back"}
        </h2>

        <p className="text-gray-400 text-sm text-center mb-6">
          {isSignUp
            ? "Sign up to book appointments seamlessly"
            : isForgotPassword
            ? "Enter your email and choose a new password"
            : "Login to continue your healthcare journey"}
        </p>

        <form onSubmit={onSubmitHandler} className="space-y-4">
          {isSignUp && (
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
            <label className="text-sm text-gray-300">
              {isForgotPassword ? "New Password" : "Password"}
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-white focus:outline-none pr-12"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[38px] text-gray-400 hover:text-white text-sm"
            >
              {showPassword ? "Hide" : "View"}
            </button>
          </div>

          {isForgotPassword && (
            <div>
              <label className="text-sm text-gray-300">Confirm New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-white focus:outline-none"
              />
            </div>
          )}

          {!isSignUp && !isForgotPassword && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => switchState("Forgot Password")}
                className="text-sm text-gray-300 hover:text-white hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-white text-gray-900 font-semibold py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-md"
          >
            {isSignUp ? "Create Account" : isForgotPassword ? "Reset Password" : "Login"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-400 mt-6">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <span
                onClick={() => switchState("Login")}
                className="text-white font-semibold cursor-pointer hover:underline"
              >
                Login
              </span>
            </>
          ) : isForgotPassword ? (
            <>
              Remember your password?{" "}
              <span
                onClick={() => switchState("Login")}
                className="text-white font-semibold cursor-pointer hover:underline"
              >
                Login
              </span>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <span
                onClick={() => switchState("Sign Up")}
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
