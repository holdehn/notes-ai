// Import the EmailInput component at the top
import GradientBg from "@/components/GradientBg";
import EmailInput from "../EmailInput/EmailInput";
import NavLink from "../NavLink";
import React, { useState } from "react";
import SuccessAlert from "components/ui/SuccessAlert";

export default function Hero() {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const handleSuccess = () => {
    setShowSuccessAlert(true);
  };

  return (
    <section className="py-20 relative sm:py-24 bg-black">
      <div className="custom-screen relative z-10">
        {showSuccessAlert && (
          <SuccessAlert setShowSuccessAlert={setShowSuccessAlert} />
        )}

        <div className="max-w-3xl mx-auto text-center space-y-6 text-white">
          <h1
            className="text-gray-800 text-4xl font-extrabold md:text-6xl"
            style={{ color: "#f9f9f9" }}
          >
            AI powered education.
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Join our exclusive beta program and experience the future of
            learning with personalized curriculums based on your material.
          </p>
        </div>
        <div>
          <EmailInput onSuccess={handleSuccess} />
        </div>
      </div>
      <GradientBg />
    </section>
  );
}
