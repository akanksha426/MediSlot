import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const normalizeUserData = (userData) => {
  if (!userData) return false;

  return {
    ...userData,
    address: userData.address || { line1: "", line2: "" },
    familyMembers: Array.isArray(userData.familyMembers)
      ? userData.familyMembers
      : [],
  };
};

const AppContextProvider = (props) => {
const currencySymbol = "₹";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoading, setIsLoading] = useState(false);
  console.log("isLoading:", isLoading);
  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );
  const [userData, setUserData] = useState(false);
  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/list");

      if (data.success) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.log("error:", error);
      toast.error(error.message);
    }
  };

  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
        headers: { token },
      });

      if (data.success) {
        setUserData(normalizeUserData(data.userData));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("error:", error);
      toast.error(error.message);
    }
  };
  useEffect(() => {
    getDoctorsData();
  }, []);

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(false);
    }
  }, [token]);

  useEffect(() => {
    // request intercepter
    console.log("inter");
    axios.interceptors.request.use(
      (config) => {
        setIsLoading(true);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    //response intercepter
    axios.interceptors.response.use(
      (config) => {
        setIsLoading(false);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }, []);
  const value = {
    doctors,
    getDoctorsData,
    currencySymbol,
    token,
    setToken,
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData,
    isLoading,
    setIsLoading,
  };
  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
//////////////////////////////////
// import { useState, useEffect } from "react";
// import { createContext } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// export const AppContext = createContext();

// const AppContextProvider = (props) => {
//   const currency = "₹";
//   const backendUrl = import.meta.env.VITE_BACKEND_URL
//   const [isLoading, setIsLoading] = useState(false);
//   const [doctors, setDoctors] = useState([])
// const [token, setToken] = useState(
//     localStorage.getItem("token") ? localStorage.getItem("token") : ""
//   );
//   const [userData, setUserData] = useState(false);
//   const getDoctors = async () => {
//     try {
//       const { data } = await axios.get(backendUrl + "/api/doctor/list")
//       if (data.success) {
//         setDoctors(data.doctors)
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   }
//  const loadUserProfileData = async () => {
//     try {
//       const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
//         headers: { token },
//       });

//       if (data.success) {
//         setUserData(data.userData);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.log("error:", error);
//       toast.error(error.message);
//     }
//   };
//   const calculateAge = (dob) => {
//     const today = new Date();
//     const birthDate = new Date(dob);
//     return today.getFullYear() - birthDate.getFullYear();
//   };

//   const months = [
//     "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
//   ];

//   useEffect(() => {
//     getDoctors()
//   }, []);
//   useEffect(() => {
//     if (token) {
//       loadUserProfileData();
//     } else {
//       setUserData(false);
//     }
//   }, [token]);

//   useEffect(() => {
//     axios.interceptors.request.use(
//       (config) => { setIsLoading(true); return config; },
//       (error) => Promise.reject(error)
//     );
//     axios.interceptors.response.use(
//       (config) => { setIsLoading(false); return config; },
//       (error) => Promise.reject(error)
//     );
//   }, []);

//   const slotDateFormat = (slotDate) => {
//     const dataArray = slotDate.split("_");
//     return dataArray[0] + " " + months[Number(dataArray[1])] + " " + dataArray[2];
//   };

//   const value = {
//     calculateAge,
//     slotDateFormat,
//     currency,
//     isLoading,
//     setIsLoading,
//     doctors,
//     getDoctors,
//     backendUrl,
//     setToken,
//   };

//   return (
//     <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
//   );
// };

// export default AppContextProvider;
// import { useState, useEffect, createContext } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";

// export const AppContext = createContext();

// const AppContextProvider = (props) => {
//   const backendUrl = import.meta.env.VITE_BACKEND_URL;
//   const [isLoading, setIsLoading] = useState(false);
//   const [doctors, setDoctors] = useState([]);

//   const getDoctors = async () => {
//     try {
//       const { data } = await axios.get(backendUrl + "/api/doctor/list");
//       if (data.success) setDoctors(data.doctors);
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   useEffect(() => {
//     getDoctors();
//   }, []);

//   useEffect(() => {
//     axios.interceptors.request.use((config) => {
//       setIsLoading(true);
//       return config;
//     });

//     axios.interceptors.response.use((config) => {
//       setIsLoading(false);
//       return config;
//     });
//   }, []);

//   const value = {
//     backendUrl,
//     doctors,
//     isLoading,
//     setIsLoading,
//   };

//   return (
//     <AppContext.Provider value={value}>
//       {props.children}
//     </AppContext.Provider>
//   );
// };

// export default AppContextProvider;
