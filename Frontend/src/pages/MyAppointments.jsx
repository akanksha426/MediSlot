import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaCreditCard, FaQrcode, FaRegCreditCard } from "react-icons/fa";
import { SiGooglepay, SiPhonepe, SiPaytm } from "react-icons/si";
import MoveUpOnRender from "../components/MoveUpOnRender";

const paymentMethods = [
  {
    id: "upi",
    label: "UPI",
    description: "Google Pay, PhonePe, Paytm and other UPI apps",
    icon: SiGooglepay,
  },
  {
    id: "card",
    label: "Cards",
    description: "Credit and debit cards",
    icon: FaCreditCard,
  },
  {
    id: "scanner",
    label: "Scan QR",
    description: "Scan and pay from any UPI app",
    icon: FaQrcode,
  },
];

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData, doctors, userData } =
    useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [ratingModal, setRatingModal] = useState({
    open: false,
    docId: null,
    appointmentId: null,
  });
  const [ratingValue, setRatingValue] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    appointmentId: null,
    amount: 500,
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("upi");
  const [paymentStep, setPaymentStep] = useState("details");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
    otp: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  const months = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const slotDateFormat = (slotDate) => {
    const dataArray = slotDate.split("_");
    return `${dataArray[0]} ${months[Number(dataArray[1])]} ${dataArray[2]}`;
  };

  const getDoctorById = (docId) =>
    doctors.find((doctor) => String(doctor._id) === String(docId));

  const hasUserRatedDoctor = (docId) => {
    const doctor = getDoctorById(docId);

    if (!doctor || !userData?._id || !Array.isArray(doctor.ratings)) {
      return false;
    }

    return doctor.ratings.some(
      (entry) => String(entry.userId) === String(userData._id)
    );
  };

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });

      if (data.success) {
        setAppointments(data.appointments.reverse());
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

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

  const submitRating = async () => {
    if (ratingValue === 0) {
      toast.error("Please select a star rating");
      return;
    }

    try {
      setSubmittingRating(true);
      const { data } = await axios.post(
        backendUrl + "/api/user/rate-doctor",
        {
          docId: ratingModal.docId,
          rating: ratingValue,
          review: reviewText,
        },
        { headers: { token } }
      );

      if (data.success) {
        toast.success("Rating submitted!");
        setRatingModal({ open: false, docId: null, appointmentId: null });
        setRatingValue(0);
        setReviewText("");
        getDoctorsData();
        getUserAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to submit rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleNavigation = (docId) => {
    navigate(`/appointment/${docId}`);
  };

  const openPaymentModal = (appointment) => {
    setPaymentModal({
      open: true,
      appointmentId: appointment._id,
      amount: appointment.amount || 500,
    });
    setSelectedPaymentMethod("upi");
    setPaymentStep("details");
    setPaymentProcessing(false);
    setPaymentError("");
    setPaymentDetails({
      upiId: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
      cardName: "",
      otp: "",
    });
  };

  const closePaymentModal = () => {
    if (paymentProcessing) return;
    setPaymentModal({ open: false, appointmentId: null, amount: 500 });
  };

  const updatePaymentDetails = (field, value) => {
    setPaymentDetails((details) => ({ ...details, [field]: value }));
    setPaymentError("");
  };

  const validatePaymentDetails = () => {
    if (selectedPaymentMethod === "upi") {
      return /^[\w.-]+@[\w.-]+$/.test(paymentDetails.upiId.trim())
        ? ""
        : "Enter a valid UPI ID";
    }

    if (selectedPaymentMethod === "card") {
      const cardNumber = paymentDetails.cardNumber.replace(/\s/g, "");
      if (cardNumber.length < 12) return "Enter a valid card number";
      if (!paymentDetails.expiry.trim()) return "Enter card expiry";
      if (paymentDetails.cvv.length < 3) return "Enter valid CVV";
      if (!paymentDetails.cardName.trim()) return "Enter card holder name";
    }

    return "";
  };

  const startPaymentVerification = () => {
    const error = validatePaymentDetails();
    if (error) {
      setPaymentError(error);
      return;
    }

    if (selectedPaymentMethod === "scanner") {
      setPaymentStep("scanner");
      return;
    }

    setPaymentStep("otp");
  };

  const completePayment = async () => {
    if (paymentStep === "otp" && paymentDetails.otp.length < 4) {
      setPaymentError("Enter the OTP sent to your mobile");
      return;
    }

    try {
      setPaymentProcessing(true);
      setPaymentError("");

      const { data } = await axios.post(
        backendUrl + "/api/user/mock-payment",
        { appointmentId: paymentModal.appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        setPaymentStep("success");
        toast.success("Payment successful");
        getUserAppointments();
        setTimeout(() => {
          setPaymentModal({ open: false, appointmentId: null, amount: 500 });
        }, 1200);
      } else {
        setPaymentError(data.message || "Payment failed");
      }
    } catch {
      setPaymentError("Payment failed. Please try again.");
      toast.error("Payment failed");
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <div>
      <p className="mt-12 border-b pb-3 font-medium text-zinc-700">
        My appointments
      </p>

      <MoveUpOnRender id="my-appointments">
        {appointments.map((item, index) => (
          <div key={index} className="border-b py-4">
            <div className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6">
              <div onClick={() => handleNavigation(item?.docData?._id)}>
                <img
                  className="w-32 cursor-pointer rounded bg-indigo-50"
                  src={item?.docData?.image}
                  alt=""
                />
              </div>

              <div className="flex-1 text-sm text-zinc-500">
                <p className="font-semibold text-neutral-800">
                  {item?.docData?.name}
                </p>
                <p>{item?.docData?.speciality}</p>
                <p className="mt-1 text-xs font-medium text-indigo-600">
                  Booked for: {item?.userData?.name}
                  {item?.userData?.relation ? ` (${item.userData.relation})` : ""}
                </p>

                <p className="mt-1 font-medium text-zinc-700">Address:</p>
                <p className="text-xs">{item?.docData?.address?.line1}</p>
                <p className="text-xs">{item?.docData?.address?.line2}</p>

                <p className="mt-1 text-xs">
                  <span className="text-sm font-medium text-neutral-700">
                    Date & Time :
                  </span>{" "}
                  {slotDateFormat(item?.slotDate)} | {item.slotTime}
                </p>
              </div>

              <div className="flex flex-col justify-end gap-2">
                {!item.cancelled && item.payment && !item.isCompleted && (
                  <button className="border bg-indigo-50 py-2 text-sm">Paid</button>
                )}

                {!item.cancelled && !item.payment && !item.isCompleted && (
                  <button
                    onClick={() => openPaymentModal(item)}
                    className="border py-2 text-sm transition duration-300 hover:bg-primary hover:text-white"
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
                    className="border py-2 text-sm transition duration-300 hover:bg-red-600 hover:text-white"
                  >
                    Cancel Appointment
                  </button>
                )}

                {item.cancelled && (
                  <button className="rounded border border-red-500 px-2 py-2 text-red-500">
                    Cancelled
                  </button>
                )}

                {item.isCompleted && (
                  <button className="rounded border border-green-500 px-2 py-2 text-green-500">
                    Completed
                  </button>
                )}

                {item.isCompleted &&
                  (hasUserRatedDoctor(item.docId) ? (
                    <button className="rounded border border-slate-300 px-2 py-2 text-sm text-slate-500">
                      Reviewed
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setRatingModal({
                          open: true,
                          docId: item.docId,
                          appointmentId: item._id,
                        })
                      }
                      className="rounded border border-yellow-400 px-2 py-2 text-sm text-yellow-500 transition duration-300 hover:bg-yellow-400 hover:text-white"
                    >
                      Rate Doctor
                    </button>
                  ))}

                {(item.cancelled || item.isCompleted) && (
                  <button
                    onClick={() => deleteAppointment(item._id)}
                    className="rounded border border-red-400 px-2 py-2 text-red-500 transition duration-300 hover:bg-red-500 hover:text-white"
                  >
                    Delete
                  </button>
                )}

                {item.cancelled && item.refund && (
                  <p className="text-sm text-blue-600">Refund: Rs{item.refundAmount}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </MoveUpOnRender>

      {ratingModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-[90%] max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-1 text-lg font-medium text-gray-800">
              Rate your Doctor
            </h3>
            <p className="mb-4 text-sm text-gray-400">
              Your feedback helps other patients
            </p>

            <div className="mb-4 flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRatingValue(star)}
                  className={`select-none text-4xl transition-all ${
                    star <= ratingValue
                      ? "text-yellow-400"
                      : "cursor-pointer text-gray-300 hover:text-yellow-200"
                  }`}
                >
                  *
                </span>
              ))}
              {ratingValue > 0 && (
                <span className="ml-1 self-center text-sm text-gray-400">
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                    ratingValue
                  ]}
                </span>
              )}
            </div>

            <textarea
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              placeholder="Write a short review (optional)"
              className="mb-4 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
              rows={3}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setRatingModal({ open: false, docId: null, appointmentId: null });
                  setRatingValue(0);
                  setReviewText("");
                }}
                className="px-4 py-2 text-sm text-gray-400 transition-colors hover:text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={submitRating}
                disabled={submittingRating}
                className="rounded-lg bg-indigo-500 px-5 py-2 text-sm text-white transition-all hover:bg-indigo-600 disabled:opacity-50"
              >
                {submittingRating ? "Submitting..." : "Submit Rating"}
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                  Secure checkout
                </p>
                <h3 className="text-xl font-semibold text-gray-900">
                  Pay Rs{paymentModal.amount}
                </h3>
              </div>
              <button
                onClick={closePaymentModal}
                className="rounded-full px-3 py-1 text-xl leading-none text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                x
              </button>
            </div>

            {paymentStep === "success" ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
                  OK
                </div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Payment Successful
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  Your appointment payment has been confirmed.
                </p>
              </div>
            ) : (
              <div className="grid gap-0 md:grid-cols-[220px_1fr]">
                <div className="border-b bg-gray-50 p-4 md:border-b-0 md:border-r">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Payment methods
                  </p>
                  <div className="space-y-2">
                    {paymentMethods.map((method) => {
                      const MethodIcon = method.icon;
                      const selected = selectedPaymentMethod === method.id;

                      return (
                        <button
                          key={method.id}
                          onClick={() => {
                            setSelectedPaymentMethod(method.id);
                            setPaymentStep("details");
                            setPaymentError("");
                          }}
                          className={`w-full rounded-lg border p-3 text-left transition ${
                            selected
                              ? "border-blue-500 bg-white shadow-sm"
                              : "border-transparent hover:border-gray-200 hover:bg-white"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <span
                              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                                selected
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              <MethodIcon />
                            </span>
                            <span>
                              <span className="block text-sm font-semibold text-gray-800">
                                {method.label}
                              </span>
                              <span className="block text-xs text-gray-500">
                                {method.description}
                              </span>
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-5">
                  {paymentStep === "details" && selectedPaymentMethod === "upi" && (
                    <div>
                      <div className="mb-5 flex gap-2 text-2xl text-gray-600">
                        <SiGooglepay />
                        <SiPhonepe />
                        <SiPaytm />
                      </div>
                      <label className="text-sm font-medium text-gray-700">
                        UPI ID
                      </label>
                      <input
                        value={paymentDetails.upiId}
                        onChange={(event) =>
                          updatePaymentDetails("upiId", event.target.value)
                        }
                        placeholder="name@bank"
                        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        A payment request will be sent to your UPI app.
                      </p>
                    </div>
                  )}

                  {paymentStep === "details" && selectedPaymentMethod === "card" && (
                    <div className="space-y-3">
                      <div className="mb-1 flex items-center gap-2 text-gray-700">
                        <FaRegCreditCard />
                        <p className="text-sm font-semibold">
                          Credit / Debit Card
                        </p>
                      </div>
                      <input
                        value={paymentDetails.cardNumber}
                        onChange={(event) =>
                          updatePaymentDetails("cardNumber", event.target.value)
                        }
                        placeholder="Card number"
                        className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          value={paymentDetails.expiry}
                          onChange={(event) =>
                            updatePaymentDetails("expiry", event.target.value)
                          }
                          placeholder="MM/YY"
                          className="rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                        />
                        <input
                          value={paymentDetails.cvv}
                          onChange={(event) =>
                            updatePaymentDetails("cvv", event.target.value)
                          }
                          placeholder="CVV"
                          type="password"
                          className="rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                      <input
                        value={paymentDetails.cardName}
                        onChange={(event) =>
                          updatePaymentDetails("cardName", event.target.value)
                        }
                        placeholder="Card holder name"
                        className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  {paymentStep === "details" &&
                    selectedPaymentMethod === "scanner" && (
                      <div className="text-center">
                        <div className="mx-auto mb-4 flex h-44 w-44 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-6xl text-gray-500">
                          <FaQrcode />
                        </div>
                        <h4 className="text-base font-semibold text-gray-900">
                          Scan and pay
                        </h4>
                        <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                          Open any UPI app, scan the QR code, and complete the
                          payment.
                        </p>
                      </div>
                    )}

                  {paymentStep === "otp" && (
                    <div>
                      <h4 className="text-base font-semibold text-gray-900">
                        Verify payment
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        Enter the OTP sent to your registered mobile number.
                      </p>
                      <input
                        value={paymentDetails.otp}
                        onChange={(event) =>
                          updatePaymentDetails("otp", event.target.value)
                        }
                        placeholder="123456"
                        className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  {paymentStep === "scanner" && (
                    <div className="text-center">
                      <div className="mx-auto mb-4 grid h-44 w-44 grid-cols-5 gap-1 rounded-xl bg-white p-4 shadow-inner ring-1 ring-gray-200">
                        {Array.from({ length: 25 }).map((_, index) => (
                          <span
                            key={index}
                            className={`rounded-sm ${
                              [0, 1, 2, 5, 10, 12, 14, 19, 22, 23, 24].includes(
                                index
                              )
                                ? "bg-gray-900"
                                : "bg-gray-100"
                            }`}
                          />
                        ))}
                      </div>
                      <h4 className="text-base font-semibold text-gray-900">
                        Waiting for confirmation
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        Complete the payment in your UPI app, then confirm here.
                      </p>
                    </div>
                  )}

                  {paymentError && (
                    <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                      {paymentError}
                    </p>
                  )}

                  <div className="mt-6 flex justify-end gap-3">
                    {paymentStep !== "details" && (
                      <button
                        onClick={() => {
                          setPaymentStep("details");
                          setPaymentError("");
                        }}
                        disabled={paymentProcessing}
                        className="rounded-lg border px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                      >
                        Back
                      </button>
                    )}
                    <button
                      onClick={
                        paymentStep === "details"
                          ? startPaymentVerification
                          : completePayment
                      }
                      disabled={paymentProcessing}
                      className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                    >
                      {paymentProcessing
                        ? "Processing..."
                        : paymentStep === "details"
                        ? selectedPaymentMethod === "scanner"
                          ? "Show QR"
                          : "Continue"
                        : "Confirm Payment"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
