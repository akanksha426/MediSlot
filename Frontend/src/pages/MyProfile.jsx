import { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import MoveUpOnRender from "../components/MoveUpOnRender";

const createEmptyFamilyMember = () => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  name: "",
  relation: "",
  gender: "Male",
  dob: "",
  phone: "",
});

const MyProfile = () => {
  const { backendUrl, token, userData, setUserData, loadUserProfileData } = useContext(AppContext);

  const [isEdit, setEdit] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateUserProfileData = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("address", JSON.stringify(userData.address));
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);
      formData.append(
        "familyMembers",
        JSON.stringify(userData.familyMembers || [])
      );

      if (image) formData.append("image", image);

      const { data } = await axios.post(
        backendUrl + "/api/user/update-profile",
        formData,
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        setUserData({
          ...data.userData,
          address: data.userData?.address || { line1: "", line2: "" },
          familyMembers: Array.isArray(data.userData?.familyMembers)
            ? data.userData.familyMembers
            : [],
        });
        await loadUserProfileData();
        setEdit(false);
        setImage(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    userData && (
      <MoveUpOnRender id="my-profile">
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-6 md:p-8 space-y-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <img
                className="w-32 h-32 object-cover rounded-full border-4 border-primary/20"
                src={image ? URL.createObjectURL(image) : userData.image}
                alt="profile"
              />

              {isEdit && (
                <label className="absolute bottom-0 right-0 bg-primary p-2 rounded-full cursor-pointer shadow-md">
                  <img className="w-4" src={assets.upload_icon} alt="upload" />
                  <input
                    type="file"
                    hidden
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                </label>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              {isEdit ? (
                <input
                  className="text-2xl font-semibold w-full border-b outline-none"
                  value={userData.name}
                  onChange={(e) =>
                    setUserData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-800">
                  {userData.name}
                </h2>
              )}

              <p className="text-sm text-gray-500 mt-1">{userData.email}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Contact Information</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Phone</label>
                {isEdit ? (
                  <input
                    className="w-full p-2 border rounded-lg"
                    value={userData.phone}
                    onChange={(e) =>
                      setUserData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                ) : (
                  <p className="text-gray-700">{userData.phone}</p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-500">Address</label>
                {isEdit ? (
                  <>
                    <input
                      className="w-full p-2 border rounded-lg mb-2"
                      placeholder="Line 1"
                      value={userData.address?.line1}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          address: { ...prev.address, line1: e.target.value },
                        }))
                      }
                    />
                    <input
                      className="w-full p-2 border rounded-lg"
                      placeholder="Line 2"
                      value={userData.address?.line2}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          address: { ...prev.address, line2: e.target.value },
                        }))
                      }
                    />
                  </>
                ) : (
                  <p className="text-gray-700">
                    {userData.address.line1} <br /> {userData.address.line2}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Basic Information</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Gender</label>
                {isEdit ? (
                  <select
                    className="w-full p-2 border rounded-lg"
                    value={userData.gender}
                    onChange={(e) =>
                      setUserData((prev) => ({ ...prev, gender: e.target.value }))
                    }
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                ) : (
                  <p className="text-gray-700">{userData.gender}</p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-500">Date of Birth</label>
                {isEdit ? (
                  <input
                    type="date"
                    className="w-full p-2 border rounded-lg"
                    value={userData.dob}
                    onChange={(e) =>
                      setUserData((prev) => ({ ...prev, dob: e.target.value }))
                    }
                  />
                ) : (
                  <p className="text-gray-700">{userData.dob}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-700">Family Care Desk</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Save family profiles so you can book for parents, children, or partner from one account.
                </p>
              </div>

              {isEdit && (
                <button
                  type="button"
                  onClick={() =>
                    setUserData((prev) => ({
                      ...prev,
                      familyMembers: [
                        ...(prev.familyMembers || []),
                        createEmptyFamilyMember(),
                      ],
                    }))
                  }
                  className="rounded-lg border border-black px-4 py-2 text-sm text-black transition hover:bg-black hover:text-white"
                >
                  Add Member
                </button>
              )}
            </div>

            <div className="mt-4 space-y-4">
              {(userData.familyMembers || []).length > 0 ? (
                (userData.familyMembers || []).map((member, index) => (
                  <div
                    key={member.id || index}
                    className="rounded-xl border border-white bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-800">
                          {member.name || `Family member ${index + 1}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {member.relation || "Relation not set"}
                        </p>
                      </div>

                      {isEdit && (
                        <button
                          type="button"
                          onClick={() =>
                            setUserData((prev) => ({
                              ...prev,
                              familyMembers: (prev.familyMembers || []).filter(
                                (_, memberIndex) => memberIndex !== index
                              ),
                            }))
                          }
                          className="text-sm text-red-500 transition hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {isEdit ? (
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <input
                          className="w-full rounded-lg border p-2"
                          placeholder="Name"
                          value={member.name || ""}
                          onChange={(e) =>
                            setUserData((prev) => ({
                              ...prev,
                              familyMembers: (prev.familyMembers || []).map(
                                (currentMember, memberIndex) =>
                                  memberIndex === index
                                    ? {
                                        ...currentMember,
                                        name: e.target.value,
                                      }
                                    : currentMember
                              ),
                            }))
                          }
                        />
                        <input
                          className="w-full rounded-lg border p-2"
                          placeholder="Relation"
                          value={member.relation || ""}
                          onChange={(e) =>
                            setUserData((prev) => ({
                              ...prev,
                              familyMembers: (prev.familyMembers || []).map(
                                (currentMember, memberIndex) =>
                                  memberIndex === index
                                    ? {
                                        ...currentMember,
                                        relation: e.target.value,
                                      }
                                    : currentMember
                              ),
                            }))
                          }
                        />
                        <select
                          className="w-full rounded-lg border p-2"
                          value={member.gender || "Male"}
                          onChange={(e) =>
                            setUserData((prev) => ({
                              ...prev,
                              familyMembers: (prev.familyMembers || []).map(
                                (currentMember, memberIndex) =>
                                  memberIndex === index
                                    ? {
                                        ...currentMember,
                                        gender: e.target.value,
                                      }
                                    : currentMember
                              ),
                            }))
                          }
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                        <input
                          type="date"
                          className="w-full rounded-lg border p-2"
                          value={member.dob || ""}
                          onChange={(e) =>
                            setUserData((prev) => ({
                              ...prev,
                              familyMembers: (prev.familyMembers || []).map(
                                (currentMember, memberIndex) =>
                                  memberIndex === index
                                    ? {
                                        ...currentMember,
                                        dob: e.target.value,
                                      }
                                    : currentMember
                              ),
                            }))
                          }
                        />
                        <input
                          className="w-full rounded-lg border p-2 md:col-span-2"
                          placeholder="Phone"
                          value={member.phone || ""}
                          onChange={(e) =>
                            setUserData((prev) => ({
                              ...prev,
                              familyMembers: (prev.familyMembers || []).map(
                                (currentMember, memberIndex) =>
                                  memberIndex === index
                                    ? {
                                        ...currentMember,
                                        phone: e.target.value,
                                      }
                                    : currentMember
                              ),
                            }))
                          }
                        />
                      </div>
                    ) : (
                      <div className="mt-3 grid gap-3 text-sm text-gray-600 md:grid-cols-2">
                        <p>
                          <span className="font-medium text-gray-700">Relation:</span>{" "}
                          {member.relation || "Not set"}
                        </p>
                        <p>
                          <span className="font-medium text-gray-700">Gender:</span>{" "}
                          {member.gender || "Not set"}
                        </p>
                        <p>
                          <span className="font-medium text-gray-700">DOB:</span>{" "}
                          {member.dob || "Not set"}
                        </p>
                        <p>
                          <span className="font-medium text-gray-700">Phone:</span>{" "}
                          {member.phone || "Not set"}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
                  No family members saved yet. Add a parent, child, spouse, or dependent to book for them quickly.
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            {isEdit && (
              <button
                className="px-5 py-2 rounded-lg border hover:bg-gray-100"
                onClick={() => setEdit(false)}
              >
                Cancel
              </button>
            )}

            <button
              onClick={isEdit ? updateUserProfileData : () => setEdit(true)}
              className="px-6 py-2 bg-black text-white rounded-lg shadow hover:opacity-90 transition"
            >
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Edit Profile"}
            </button>
          </div>
        </div>
      </MoveUpOnRender>
    )
  );
};

export default MyProfile;
