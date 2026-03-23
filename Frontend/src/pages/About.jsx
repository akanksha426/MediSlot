import { assets } from "../assets/assets";
import MoveUpOnRender from "../components/MoveUpOnRender";

const About = () => {
  return (
    <MoveUpOnRender id="about">
      <section className="px-6 md:px-16 py-12">

        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-800">
            About <span className="text-gray-900">MediSlot</span>
          </h1>
          <p className="text-gray-500 mt-3 text-sm md:text-base">
            Simplifying healthcare access through smart technology.
          </p>
        </div>

        {/* Top Section */}
        <div className="flex flex-col md:flex-row items-center gap-12 mb-16">

          <img
            className="w-full md:max-w-[420px] rounded-xl shadow-lg"
            src={assets.about_image}
            alt="About MediSlot"
          />

          <div className="flex flex-col gap-6 md:w-1/2 text-gray-600 leading-relaxed">

            <p>
              <b className="text-gray-800">MediSlot</b> is designed to simplify
              the way patients connect with healthcare professionals.
              Managing appointments, accessing trusted doctors, and keeping
              track of your healthcare journey should be effortless — and that
              is exactly what our platform delivers.
            </p>

            <p>
              Our platform combines modern technology with healthcare
              accessibility, enabling users to find verified doctors,
              schedule consultations, and manage their appointments in
              just a few clicks.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Our Vision
              </h3>

              <p>
                We envision a healthcare ecosystem where technology bridges
                the gap between patients and providers. MediSlot aims to
                make healthcare services more accessible, efficient, and
                user-friendly for everyone.
              </p>
            </div>

          </div>
        </div>

        {/* Why Choose Us */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
            Why Choose <span className="text-gray-900">MediSlot</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">

          <div className="p-8 border rounded-xl shadow-sm hover:shadow-xl transition duration-300 bg-white">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Efficient Scheduling
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Book appointments with trusted doctors quickly without long
              waiting times or complicated procedures.
            </p>
          </div>

          <div className="p-8 border rounded-xl shadow-sm hover:shadow-xl transition duration-300 bg-white">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Trusted Medical Network
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Access a curated network of verified healthcare professionals
              across multiple specialities.
            </p>
          </div>

          <div className="p-8 border rounded-xl shadow-sm hover:shadow-xl transition duration-300 bg-white">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Personalized Healthcare
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Receive tailored healthcare recommendations, reminders, and
              appointment updates designed around your needs.
            </p>
          </div>

        </div>

      </section>
    </MoveUpOnRender>
  );
};

export default About;