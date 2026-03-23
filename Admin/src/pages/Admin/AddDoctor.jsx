import { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";
import MoveUpOnRender from "../../components/MoveUpOnRender";

const initialValues = {
  name: "",
  email: "",
  password: "",
  experience: "1 Year",
  fees: "",
  about: "",
  speciality: "General physician",
  degree: "",
  address1: "",
  address2: "",
};

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(false);
  const [doctorData, setDoctorData] = useState(initialValues);

  const { backendUrl, aToken } = useContext(AdminContext);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDoctorData({
      ...doctorData,
      [name]: value,
    });
  };

  const handleOnSubmit = async (event) => {
    event.preventDefault();

    try {
      if (!docImg) {
        return toast.error("Image not selected");
      }

      const formData = new FormData();
      formData.append("image", docImg);
      formData.append("name", doctorData.name);
      formData.append("email", doctorData.email);
      formData.append("password", doctorData.password);
      formData.append("experience", doctorData.experience);
      formData.append("fees", Number(doctorData.fees));
      formData.append("about", doctorData.about);
      formData.append("speciality", doctorData.speciality);
      formData.append("degree", doctorData.degree);
      formData.append(
        "address",
        JSON.stringify({
          line1: doctorData.address1,
          line2: doctorData.address2,
        })
      );

      const { data } = await axios.post(
        backendUrl + "/api/admin/add-doctor",
        formData,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message);
        setDocImg(null);
        setDoctorData(initialValues);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <MoveUpOnRender id="admin-adddoctor">
      <form onSubmit={handleOnSubmit} className="p-6 bg-gray-100 min-h-screen">

        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border overflow-hidden">

          {/* Header */}
          <div className="bg-gray-900 text-white px-6 py-4 flex items-center gap-3">
            <img className="w-6" src={assets.doctor_icon} alt="" />
            <p className="text-lg font-semibold">Add New Doctor</p>
          </div>

          <div className="p-8">

            {/* Image Upload */}
            <div className="flex items-center gap-6 mb-10">
              <label htmlFor="doc-img" className="cursor-pointer group">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 group-hover:border-blue-500 transition">
                  <img
                    className="w-full h-full object-cover"
                    src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
                    alt=""
                  />
                </div>
              </label>

              <input
                onChange={(e) => setDocImg(e.target.files[0])}
                type="file"
                id="doc-img"
                hidden
              />

              <div>
                <p className="font-medium text-gray-700">Upload Doctor Image</p>
                <p className="text-sm text-gray-400">PNG, JPG supported</p>
              </div>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <Input label="Doctor Name" name="name" value={doctorData.name} onChange={handleInputChange} />
              <Input label="Email" name="email" type="email" value={doctorData.email} onChange={handleInputChange} />
              <Input label="Password" name="password" type="password" value={doctorData.password} onChange={handleInputChange} />

              <Select label="Experience" name="experience" value={doctorData.experience} onChange={handleInputChange}>
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={`${i + 1} Year`}>
                    {i + 1} Year
                  </option>
                ))}
              </Select>

              <Input label="Fees" name="fees" type="number" value={doctorData.fees} onChange={handleInputChange} />

              <Select label="Speciality" name="speciality" value={doctorData.speciality} onChange={handleInputChange}>
                <option>General physician</option>
                <option>Gynecologist</option>
                <option>Dermatologist</option>
                <option>Pediatricians</option>
                <option>Neurologist</option>
                <option>Gastroenterologist</option>
              </Select>

              <Input label="Education" name="degree" value={doctorData.degree} onChange={handleInputChange} />
              <Input label="Address Line 1" name="address1" value={doctorData.address1} onChange={handleInputChange} />
              <Input label="Address Line 2" name="address2" value={doctorData.address2} onChange={handleInputChange} />

            </div>

            {/* About */}
            <div className="mt-6">
              <p className="font-medium mb-2 text-gray-700">About Doctor</p>
              <textarea
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Write about doctor"
                value={doctorData.about}
                onChange={handleInputChange}
                name="about"
                rows={5}
                required
              />
            </div>

            {/* Button */}
            <div className="mt-8">
              <button
                type="submit"
                className="bg-black hover:bg-blue-600 text-white px-10 py-3 rounded-full transition font-medium shadow-md hover:shadow-lg"
              >
                Add Doctor
              </button>
            </div>

          </div>
        </div>
      </form>
    </MoveUpOnRender>
  );
};

export default AddDoctor;

/* Reusable Components */

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    <p className="text-gray-700 font-medium">{label}</p>
    <input
      {...props}
      className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
      required
    />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div className="flex flex-col gap-1">
    <p className="text-gray-700 font-medium">{label}</p>
    <select
      {...props}
      className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
    >
      {children}
    </select>
  </div>
);