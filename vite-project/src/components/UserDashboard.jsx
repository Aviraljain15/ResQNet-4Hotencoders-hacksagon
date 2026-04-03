import { useState, useEffect } from "react"
import { Navigate, useNavigate, Link } from "react-router-dom"
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth, db } from "../lib/firebase"
import { Spinner } from "./ui/spinner"
import { MapPin, Clock, AlertTriangle, Brain, XCircle, CheckCircle2, ArrowLeft } from "lucide-react"

export default function UserDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reports, setReports] = useState([])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
      } else {
        setUser(null)
        navigate("/")
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [navigate])

  // Real-time listener for user's reports
  useEffect(() => {
    if (!user?.uid) return

    const reportsRef = collection(db, "reports")
    const q = query(
      reportsRef,
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReports = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setReports(fetchedReports)
    }, (error) => {
      console.error("Error fetching reports:", error)
    })

    return () => unsubscribe()
  }, [user?.uid])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-500"
      case "verified": return "bg-green-500"
      case "rejected": return "bg-red-500"
      case "assigned": return "bg-blue-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "Pending Review"
      case "verified": return "Verified"
      case "rejected": return "Rejected"
      case "assigned": return "Assigned"
      default: return status || "Unknown"
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0b1326]">
        <Spinner className="w-8 h-8 text-blue-400" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" />
  }

  return (
    <div className="min-h-screen bg-[#0b1326] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0b1326]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center px-6 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-400 hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="text-2xl font-bold text-blue-400">
              My Reports
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/report"
              className="text-xs uppercase tracking-widest text-gray-400 hover:text-blue-400"
            >
              Submit New Report
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs uppercase tracking-widest text-gray-400 hover:text-red-400"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6 max-w-4xl mx-auto">
        {reports.length === 0 ? (
          <div className="text-center py-20">
            <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-400 mb-2">No reports submitted yet</h2>
            <p className="text-gray-500 mb-6">Submit your first disaster report to see it here.</p>
            <Link
              to="/report"
              className="inline-block px-6 py-3 bg-blue-500 rounded-lg font-bold hover:bg-blue-600 transition"
            >
              Submit Report
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  {report.imageUrl && (
                    <div className="md:w-64 h-48 md:h-auto shrink-0">
                      <img
                        src={report.imageUrl}
                        alt="Report"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold capitalize">
                          {report.incidentType?.replace(/-/g, " ") || "Incident Report"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(report.createdAt)}</span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                        report.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                        report.status === "verified" ? "bg-green-500/20 text-green-400" :
                        report.status === "rejected" ? "bg-red-500/20 text-red-400" :
                        report.status === "assigned" ? "bg-blue-500/20 text-blue-400" :
                        "bg-gray-500/20 text-gray-400"
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(report.status)}`}></span>
                        {getStatusText(report.status)}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {report.description || "No description provided"}
                    </p>

                    {/* Location */}
                    {report.location && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {report.location.lat?.toFixed(4) || "0.0000"}, {report.location.lng?.toFixed(4) || "0.0000"}
                        </span>
                      </div>
                    )}

                    {/* AI Status */}
                    {report.aiStatus === "processing" && (
                      <div className="flex items-center gap-2 text-xs text-yellow-400">
                        <Brain className="w-4 h-4 animate-pulse" />
                        <span className="font-medium">Analyzing...</span>
                      </div>
                    )}

                    {report.aiStatus === "completed" && report.ai && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-green-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="font-bold">AI Analysis Complete</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs">
                          <span className="text-gray-400">
                            Confidence: <span className="text-white font-bold">{Math.round((report.ai.confidence || 0) * 100)}%</span>
                          </span>
                          <span className="text-gray-400">
                            Priority: <span className={`font-bold ${
                              report.ai.priority === "high" ? "text-red-400" :
                              report.ai.priority === "medium" ? "text-yellow-400" :
                              "text-green-400"
                            }`}>{report.ai.priority?.toUpperCase() || "LOW"}</span>
                          </span>
                          <span className="text-gray-400">
                            Type: <span className="text-white font-bold">{report.ai.imageClassification?.toUpperCase() || "N/A"}</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {report.aiStatus === "failed" && (
                      <div className="flex items-center gap-2 text-xs text-red-400">
                        <XCircle className="w-4 h-4" />
                        <span className="font-medium">AI processing failed</span>
                      </div>
                    )}

                    {/* Handled By */}
                    {report.handledBy && (
                      <div className="text-xs text-gray-500">
                        Reviewed by authority
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
