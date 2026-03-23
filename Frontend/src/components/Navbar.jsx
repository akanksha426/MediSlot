import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const { token, setToken, userData } = useContext(AppContext);

  const logout = () => {
    setToken(false);
    localStorage.removeItem("token");
    navigate("/");
  };

  const navItemStyle =
    "relative px-2 py-1 text-gray-700 font-medium transition duration-300 hover:text-black after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-black after:transition-all after:duration-300 hover:after:w-full";

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-sm">
      <div className="flex items-center justify-between px-6 md:px-16 py-4">

        {/* LOGO */}
        <img
          onClick={() => navigate("/")}
          className="w-40 cursor-pointer"
          src={assets.logo}
          alt="MediSlot"
        />

        {/* DESKTOP MENU */}
        <ul className="hidden md:flex gap-8">
          <NavLink to="/" className={navItemStyle}>Home</NavLink>
          <NavLink to="/doctors" className={navItemStyle}>Doctors</NavLink>
          <NavLink to="/about" className={navItemStyle}>About</NavLink>
          <NavLink to="/contact" className={navItemStyle}>Contact</NavLink>
        </ul>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">

          {token && userData ? (
            <div className="relative group flex items-center gap-2 cursor-pointer">
              <img
                className="w-9 h-9 rounded-full border border-gray-300"
                src={userData.image}
                alt="User"
              />
              <img className="w-3 opacity-70" src={assets.dropdown_icon} alt="" />

              {/* DROPDOWN */}
              <div className="absolute right-0 mt-12 w-52 bg-white rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="p-4 flex flex-col gap-3 text-gray-700">
                  <p
                    onClick={() => navigate("/my-profile")}
                    className="hover:text-black cursor-pointer"
                  >
                    My Profile
                  </p>
                  <p
                    onClick={() => navigate("/my-appointments")}
                    className="hover:text-black cursor-pointer"
                  >
                    My Appointments
                  </p>
                  <hr />
                  <p
                    onClick={logout}
                    className="text-red-500 hover:text-red-600 cursor-pointer"
                  >
                    Logout
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-black text-white px-6 py-2.5 rounded-xl font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              Create Account
            </button>
          )}

          {/* MOBILE MENU ICON */}
          <img
            onClick={() => setShowMenu(true)}
            className="w-6 md:hidden cursor-pointer"
            src={assets.menu_icon}
            alt=""
          />
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl transform ${
          showMenu ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 md:hidden`}
      >
        <div className="flex items-center justify-between p-5 border-b">
          <img className="w-32" src={assets.logo} alt="" />
          <img
            onClick={() => setShowMenu(false)}
            className="w-5 cursor-pointer"
            src={assets.cross_icon}
            alt=""
          />
        </div>

        <div className="flex flex-col gap-6 p-6 text-lg font-medium text-gray-700">
          <NavLink onClick={() => setShowMenu(false)} to="/">Home</NavLink>
          <NavLink onClick={() => setShowMenu(false)} to="/doctors">Doctors</NavLink>
          <NavLink onClick={() => setShowMenu(false)} to="/about">About</NavLink>
          <NavLink onClick={() => setShowMenu(false)} to="/contact">Contact</NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;