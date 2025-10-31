import React from "react";
import { Link } from "react-router-dom";

const gradientTextClass =
  "bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-purple-600";

const TermsAndConditionsPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center pt-12 pb-20 min-h-screen">
      <div className="flex flex-col items-center w-full max-w-2xl mx-4 p-8 bg-white rounded-2xl shadow-2xl">
        <h1 className={`text-3xl font-bold mb-8 ${gradientTextClass}`}>
          Terms & Conditions
        </h1>
        
        <div className="w-full text-gray-700 space-y-4">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
            <p>By creating an account and using our habit tracking application, you agree to be bound by these Terms and Conditions.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Data Privacy</h2>
            <p>We are committed to protecting your privacy. Your personal data, including habits and states of being, will be stored securely and used only to provide you with personalized insights.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. User Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Service Availability</h2>
            <p>We strive to maintain service availability but cannot guarantee uninterrupted access to the application.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Modifications</h2>
            <p>We reserve the right to modify these terms at any time. Users will be notified of significant changes.</p>
          </section>
        </div>

        <Link 
          to="/register" 
          className="mt-8 px-6 py-3 text-white text-lg font-bold rounded-lg bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 transition duration-300 shadow-lg"
        >
          Back to Registration
        </Link>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;