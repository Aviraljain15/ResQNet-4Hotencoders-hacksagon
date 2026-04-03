import { useNavigate } from "react-router-dom";
import bg from "./assets/fire.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0b1326] text-white font-sans h-screen overflow-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0b1326]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center px-6 py-5 max-w-7xl mx-auto">
          <div className="text-2xl font-bold text-blue-400">
            Disaster App
          </div>
          <div className="flex items-center space-x-8 text-xs uppercase tracking-widest">
            <span className="text-blue-400 border-b border-blue-400 pb-1">Home</span>
            <span className="text-gray-400 hover:text-blue-400 cursor-pointer">About</span>
            <span className="text-gray-400 hover:text-blue-400 cursor-pointer">Contact</span>
          </div>
        </div>
      </nav>

      {/* Main Section */}
      <main className="relative h-screen flex items-center justify-center">

        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={bg}
            alt="disaster"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/80"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Text */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Report Disasters. <br />
              <span className="text-blue-400">Save Lives.</span>
            </h1>
            <p className="text-gray-300 max-w-lg">
              Real-time emergency reporting platform. Help authorities respond faster when every second matters.
            </p>
          </div>

          {/* Cards */}
          <div className="grid gap-6">

            {/* User Card */}
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl border border-white/10 hover:border-blue-400 transition">
              <h3 className="text-2xl font-bold mb-3">User</h3>
              <p className="text-gray-300 mb-6">
                Report disasters instantly with location, media, and details.
              </p>
              <button
                onClick={() => navigate("/report")}
                className="w-full py-3 bg-blue-500 rounded-lg font-bold hover:bg-blue-600 transition"
              >
                Report Now
              </button>
            </div>

            {/* Authority Card */}
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl border border-white/10 hover:border-red-400 transition">
              <h3 className="text-2xl font-bold mb-3">Authority</h3>
              <p className="text-gray-300 mb-6">
                Monitor and manage reported incidents effectively.
              </p>
              <button
                onClick={() => navigate("/authority-login")}
                className="w-full py-3 bg-red-500 rounded-lg font-bold hover:bg-red-600 transition"
              >
                Login as Authority
              </button>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
};

export default Home;