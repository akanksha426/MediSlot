import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MoveUpOnRender from "../components/MoveUpOnRender";

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

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

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/user/appointments",
        { headers: { token } }
      );

      if (data.success) {
        setAppointments(data.appointments.reverse());
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ DELETE FUNCTION
  const deleteAppointment = async (appointmentId) => {
    try {
      const confirmDelete = window.confirm("Delete this appointment?");
      if (!confirmDelete) return;

      const { data } = await axios.post(
        backendUrl + "/api/user/delete-appointment",
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancle-appointment",
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Razorpay
  // const initPay = (order) => {
  //   const options = {
  //     key: import.meta.env.VITE_RAZORPAY_KEY_ID,
  //     amount: order.amount,
  //     currency: order.currency,
  //     name: "Appointment payment",
  //     description: "Appointment Payment",
  //     order_id: order.id,
  //     receipt: order.receipt,
  //     handler: async (response) => {
  //       try {
  //         const { data } = await axios.post(
  //           backendUrl + "/api/user/verify-razorpay",
  //           response,
  //           { headers: { token } }
  //         );
  //         if (data.success) {
  //           getUserAppointments();
  //           navigate("/my-appointments");
  //         }
  //       } catch (error) {
  //         toast.error(error.message);
  //       }
  //     },
  //   };

  //   const rzp = new window.Razorpay(options);
  //   rzp.open();
  // };

  // const appointmentRazorpay = async (appointmentId) => {
  //   try {
  //     const { data } = await axios.post(
  //       backendUrl + "/api/user/payment-razorpay",
  //       { appointmentId },
  //       { headers: { token } }
  //     );

  //     if (data.success) {
  //       initPay(data.order);
  //     } else {
  //       toast.error(data?.message);
  //     }
  //   } catch (error) {
  //     toast.error(error.message);
  //   }
  // };

  const handleNavigation = (docId) => {
    navigate(`/appointment/${docId}`);
  };
const mockPayment = (appointmentId) => {
  const modal = document.createElement("div");

  modal.innerHTML = `
    <div id="mockPay" style="
      position: fixed;
      top:0; left:0;
      width:100%; height:100%;
      background: rgba(0,0,0,0.6);
      display:flex;
      justify-content:center;
      align-items:center;
      z-index:1000;
      font-family: Arial;
    ">
      <div style="
        background:white;
        width:350px;
        border-radius:12px;
        padding:20px;
      ">
        <h2 style="text-align:center; color:#3399cc;">Razorpay</h2>
        <p style="text-align:center;">Pay ₹500</p>

        <input id="card" placeholder="Card Number" style="width:100%; padding:10px; margin:8px 0;" />
        <input id="expiry" placeholder="MM/YY" style="width:48%; padding:10px;" />
        <input id="cvv" placeholder="CVV" style="width:48%; padding:10px; float:right;" />

        <button id="payBtn" style="
          width:100%;
          padding:12px;
          margin-top:15px;
          background:#3399cc;
          color:white;
          border:none;
          border-radius:6px;
          cursor:pointer;
        ">Pay</button>

        <p id="error" style="color:red; font-size:12px;"></p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // 👉 PAY CLICK
  document.getElementById("payBtn").onclick = () => {
    const card = document.getElementById("card").value;

    if (card.length < 8) {
      document.getElementById("error").innerText = "Invalid card";
      return;
    }

    // OTP SCREEN
    modal.innerHTML = `
      <div style="
        position: fixed;
        top:0; left:0;
        width:100%; height:100%;
        background: rgba(0,0,0,0.6);
        display:flex;
        justify-content:center;
        align-items:center;
      ">
        <div style="background:white; padding:20px; border-radius:12px; width:300px; text-align:center;">
          <h3>Enter OTP</h3>
          <input id="otp" placeholder="123456" style="padding:10px; width:100%;" />
          <button id="verifyOtp" style="margin-top:10px; padding:10px; width:100%; background:#3399cc; color:white;">Verify</button>
        </div>
      </div>
    `;

    document.getElementById("verifyOtp").onclick = async () => {
      // LOADING
      modal.innerHTML = `
        <div style="
          position: fixed;
          top:0; left:0;
          width:100%; height:100%;
          background: rgba(0,0,0,0.6);
          display:flex;
          justify-content:center;
          align-items:center;
        ">
          <div style="background:white; padding:30px; border-radius:12px; text-align:center;">
            <p>Processing Payment...</p>
          </div>
        </div>
      `;

      setTimeout(async () => {
        try {
          const { data } = await axios.post(
            backendUrl + "/api/user/mock-payment",
            { appointmentId },
            { headers: { token } }
          );

          if (data.success) {
            modal.innerHTML = `
              <div style="
                position: fixed;
                top:0; left:0;
                width:100%; height:100%;
                background: rgba(0,0,0,0.6);
                display:flex;
                justify-content:center;
                align-items:center;
              ">
                <div style="background:white; padding:30px; border-radius:12px; text-align:center;">
                  <h2 style="color:green;">Payment Successful ✅</h2>
                </div>
              </div>
            `;

            setTimeout(() => {
              document.body.removeChild(modal);
              getUserAppointments();
            }, 1500);
          } else {
            throw new Error();
          }
        } catch {
          toast.error("Payment failed");
          document.body.removeChild(modal);
        }
      }, 1500);
    };
  };
};
  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My appointments
      </p>

      <MoveUpOnRender id="my-appointments">
        {appointments.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-3 border-b"
          >
            {/* Image */}
            <div onClick={() => handleNavigation(item?.docData?._id)}>
              <img
                className="w-32 bg-indigo-50 rounded cursor-pointer"
                src={item?.docData?.image}
                alt=""
              />
            </div>

            {/* Details */}
            <div className="flex-1 text-sm text-zinc-500">
              <p className="text-neutral-800 font-semibold">
                {item?.docData?.name}
              </p>
              <p>{item?.docData?.speciality}</p>

              <p className="text-zinc-700 font-medium mt-1">Address:</p>
              <p className="text-xs">{item?.docData?.address?.line1}</p>
              <p className="text-xs">{item?.docData?.address?.line2}</p>

              <p className="text-xs mt-1">
                <span className="text-sm text-neutral-700 font-medium">
                  Date & Time :
                </span>{" "}
                {slotDateFormat(item?.slotDate)} | {item.slotTime}
              </p>
              
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2 justify-end">

              {!item.cancelled && item.payment && !item.isCompleted && (
                <button className="text-sm py-2 border bg-indigo-50">
                  Paid
                </button>
              )}

              {!item.cancelled && !item.payment && !item.isCompleted && (
                <button
                  // onClick={() => appointmentRazorpay(item?._id)}
                  onClick={() => mockPayment(item._id)}
                  className="text-sm py-2 border hover:bg-primary hover:text-white transition duration-300"
                >
                  Pay Online
                </button>
              )}

              {!item.cancelled && !item.isCompleted && (
                <button
  onClick={() => {
  const confirmCancel = window.confirm(
    "Cancel appointment?\nRefund depends on timing."
  );

  if (confirmCancel) {
    cancelAppointment(item._id);
  }
}}
                  className="text-sm py-2 border hover:bg-red-600 hover:text-white transition duration-300"
                >
                  Cancel Appointment
                </button>
              )}

              {item.cancelled && (
                <button className="py-2 px-2 border border-red-500 text-red-500 rounded">
                  Cancelled
                </button>
              )}

              {item.isCompleted && (
                <button className="py-2 px-2 border border-green-500 text-green-500 rounded">
                  Completed
                </button>
              )}

              {/* ✅ DELETE BUTTON */}
              {(item.cancelled || item.isCompleted) && (
                <button
                  onClick={() => deleteAppointment(item._id)}
                  className="py-2 px-2 border border-red-400 text-red-500 hover:bg-red-500 hover:text-white transition duration-300 rounded"
                >
                  🗑
                </button>
              )}
              {item.cancelled && item.refund && (
  <p className="text-blue-600 text-sm">
    💰 Refund: ₹{item.refundAmount}
  </p>
)}
            </div>
          </div>
        ))}
      </MoveUpOnRender>
    </div>
  );
};

export default MyAppointments;