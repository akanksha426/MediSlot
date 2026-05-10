import { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import MoveUpOnRender from "../../components/MoveUpOnRender";

const DoctorsList = () => {
  const {
    doctors,
    aToken,
    getAllDoctors,
    changeAvailability,
    updateDoctorVerification,
  } = useContext(AdminContext);

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);
  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll ">
      <MoveUpOnRender id="admin-doctorlist">
        <h1 className="text-lg font-medium">All Doctors</h1>

        <div className="w-full flex flex-wrap gap-4 pt-5 gap-y-6">
          {doctors.map((item, index) => (
            <div
              className="border border-[#C9D8FF] rounded-xl max-w-64 overflow-hidden group bg-white"
              key={index}
            >
              <img
                className="bg-indigo-50 group-hover:bg-primary transition-all duration-300"
                src={item.image}
                alt=""
              />
              <div className="p-4 ">
                <p className="text-neutral-800 text-lg font-medium">
                  {item.name}
                </p>
                <p className="text-zinc-600 text-sm ">{item.speciality}</p>
                <p className="mt-1 text-zinc-500 text-xs">
                  Reg: {item.registrationNumber || "Not provided"}
                </p>
                {item.licenseDocument ? (
                  <a
                    href={item.licenseDocument}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs font-medium text-blue-600 hover:underline"
                  >
                    Open license proof
                  </a>
                ) : (
                  <p className="mt-2 text-xs text-red-500">No proof uploaded</p>
                )}
                <span
                  className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    item.verificationStatus === "verified"
                      ? "bg-green-50 text-green-700"
                      : item.verificationStatus === "rejected"
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {item.verificationStatus || "pending"}
                </span>

                <div className="mt-5 flex items-center gap-1 text-sm">
                  <input
                    onChange={() => changeAvailability(item._id)}
                    type="checkbox"
                    checked={item.available}
                    disabled={item.verificationStatus !== "verified"}
                  />
                  <p>Available</p>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateDoctorVerification(item._id, "verified")
                    }
                    className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                    disabled={item.verificationStatus === "verified"}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateDoctorVerification(item._id, "rejected")
                    }
                    className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                    disabled={item.verificationStatus === "rejected"}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </MoveUpOnRender>
    </div>
  );
};

export default DoctorsList;
