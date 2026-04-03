import { Routes, Route } from "react-router-dom"
import Home from "./Home"
import DisasterReportForm from "./components/DisasterReportForm"
import AuthorityLogin from "./components/AuthorityLogin"
import Register from "./components/Register"
import Dashboard from "./components/Dashboard"
import UserDashboard from "./components/UserDashboard"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/report"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <DisasterReportForm />
          </div>
        }
      />

      <Route path="/my-reports" element={<UserDashboard />} />
      <Route path="/login" element={<AuthorityLogin />} />
      <Route path="/authority-login" element={<AuthorityLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}

export default App
