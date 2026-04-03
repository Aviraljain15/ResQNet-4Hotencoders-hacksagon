import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const [page, setPage] = useState("landing");
  const navigate = useNavigate();

  useEffect(() => {
    const container = document.getElementById("markers");

    // Only add markers if container exists and is empty
    if (container && container.childNodes.length === 0) {
      for (let i = 0; i < 12; i++) {
        const m = document.createElement("span");
        m.className = "absolute w-2.5 h-2.5 bg-red-500 rounded-full";
        m.style.top = Math.random() * 100 + "%";
        m.style.left = Math.random() * 100 + "%";

        const pulse = document.createElement("span");
        pulse.className =
          "absolute w-full h-full bg-red-500 rounded-full animate-ping";
        m.appendChild(pulse);

        container.appendChild(m);
      }
    }
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden text-white">

      {/* 🌪️ VIDEO BACKGROUND */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover brightness-50 -z-30"
      >
        <source src="/storm.mp4" type="video/mp4" />
      </video>

      {/* DARK OVERLAY */}
      <div className="fixed inset-0 bg-black/60 -z-20"></div>

      {/* 🌍 MARKERS */}
      <div id="markers" className="fixed inset-0 -z-10"></div>

      {/* TEXT */}
      <div className="absolute top-16 w-full text-center">
        <h1 className="text-5xl font-bold tracking-wide">
          Report Disasters. Save Lives.
        </h1>
        <p className="opacity-70 mt-2">
          Real-time emergency response platform
        </p>
      </div>

      {/* LANDING */}
      {page === "landing" && (
        <div className="flex justify-center items-center h-full gap-10">

          {/* CIVILIAN */}
          <div
            onClick={() => navigate("/report")}
            className="w-72 p-8 rounded-2xl bg-white/10 backdrop-blur-xl text-center cursor-pointer transition duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(0,150,255,0.6)]"
          >
            <i className="fas fa-triangle-exclamation text-4xl mb-4"></i>
            <h2 className="text-xl font-semibold mb-2">Civilians</h2>
            <p className="text-sm opacity-80">
              Report emergencies instantly
            </p>
          </div>

          {/* AUTHORITY */}
          <div
            onClick={() => navigate("/authority-login")}
            className="w-72 p-8 rounded-2xl bg-white/10 backdrop-blur-xl text-center cursor-pointer transition duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(255,0,0,0.6)]"
          >
            <i className="fas fa-user-shield text-4xl mb-4"></i>
            <h2 className="text-xl font-semibold mb-2">Authorities</h2>
            <p className="text-sm opacity-80">
              Monitor & control incidents
            </p>
          </div>

        </div>
      )}

      {/* DASHBOARD */}
      {page !== "landing" && (
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-4xl font-bold">
            {page === "civilians"
              ? "Civilians Dashboard"
              : "Authorities Dashboard"}
          </h1>

          <button
            onClick={() => setPage("landing")}
            className="mt-6 px-5 py-2 bg-white text-black rounded-lg"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}