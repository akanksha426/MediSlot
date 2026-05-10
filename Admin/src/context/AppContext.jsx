// import { useState, useEffect } from "react";
// import { createContext } from "react";
// import axios from "axios";

// export const AppContext = createContext();

// const AppContextProvider = (props) => {
//   const currency = "₹";
//   const [isLoading, setIsLoading] = useState(false);
//   console.log("isLoading:", isLoading);
//   const calculateAge = (dob) => {
//     const today = new Date();
//     const birthDate = new Date(dob);

//     const age = today.getFullYear() - birthDate.getFullYear();
//     return age;
//   };
//   const months = [
//     "",
//     "Jan",
//     "Feb",
//     "Mar",
//     "Apr",
//     "May",
//     "Jun",
//     "Jul",
//     "Aug",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Dec",
//   ];
//   useEffect(() => {
//     // request intercepter
//     axios.interceptors.request.use(
//       (config) => {
//         setIsLoading(true);
//         return config;
//       },
//       (error) => {
//         return Promise.reject(error);
//       }
//     );
//     //response intercepter
//     axios.interceptors.response.use(
//       (config) => {
//         setIsLoading(false);
//         return config;
//       },
//       (error) => {
//         return Promise.reject(error);
//       }
//     );
//   }, []);
//   const slotDateFormat = (slotDate) => {
//     const dataArray = slotDate.split("_");
//     return (
//       dataArray[0] + " " + months[Number(dataArray[1])] + " " + dataArray[2]
//     );
//   };

//   const value = {
//     calculateAge,
//     slotDateFormat,
//     currency,
//     isLoading,
//     setIsLoading,
//   };

//   return (
//     <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
//   );
// };

// export default AppContextProvider;
import { useState, useEffect, createContext } from "react";
import axios from "axios";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currency = "₹";

  const backendUrl = "http://localhost:4000"; // change if different

  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isLoading, setIsLoading] = useState(false);

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    return today.getFullYear() - birthDate.getFullYear();
  };

  const months = [
    "",
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];

  const slotDateFormat = (slotDate) => {
    const dataArray = slotDate.split("_");
    return (
      dataArray[0] +
      " " +
      months[Number(dataArray[1])] +
      " " +
      dataArray[2]
    );
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    axios.interceptors.request.use(
      (config) => {
        setIsLoading(true);
        return config;
      },
      (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
      (response) => {
        setIsLoading(false);
        return response;
      },
      (error) => {
        setIsLoading(false);
        return Promise.reject(error);
      }
    );
  }, []);

  const value = {
    currency,
    backendUrl,
    token,
    setToken,
    isLoading,
    setIsLoading,
    calculateAge,
    slotDateFormat,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;