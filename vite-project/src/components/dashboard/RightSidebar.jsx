import { useState } from "react"
import { TrendingUp, Play, MapPin, XCircle, X, Clock, CheckCircle2, AlertTriangle, Brain } from "lucide-react"
import { updateDoc, doc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "../../lib/firebase"

export function RightSidebar({ onClose, reports = [] }) {
  const [loadingStates, setLoadingStates] = useState({})

  const handleAction = async (reportId, status) => {
    const loadingKey = `${reportId}-${status}`
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }))

    try {
      const reportRef = doc(db, "reports", reportId)
      await updateDoc(reportRef, {
        status: status,
        handledBy: auth.currentUser.uid,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error(`Failed to ${status} report:`, error)
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }))
    }
  }

  return (
    <aside className="w-72 sm:w-80 h-full flex flex-col bg-[#131313] shrink-0 overflow-y-auto">
      <div className="lg:hidden flex justify-end p-2 border-b border-[#2A2A2A]">
        <button
          className="p-1 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 border-b border-[#2A2A2A]">
        <div className="bg-[#1C1B1B] border border-[#2A2A2A] rounded p-2.5 sm:p-3 relative group cursor-pointer hover:border-gray-500 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-white font-bold text-xs sm:text-sm">Spike Detected</h4>
              <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5">in your district</p>
              <p className="text-[9px] sm:text-[10px] text-gray-600">{reports.length} total reports</p>
            </div>
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-bold text-white tracking-tighter">
                {reports.filter(r => r.status === "pending").length}
              </div>
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 ml-auto text-gray-500 group-hover:text-white" />
            </div>
          </div>
        </div>

        <div className="bg-[#1C1B1B] border border-[#2A2A2A] rounded p-2.5 sm:p-3 flex items-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500/10 rounded flex items-center justify-center mr-2 sm:mr-3 shrink-0">
            <Play className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-bold text-xs sm:text-sm leading-tight truncate">AI Analysis Active</h4>
            <p className="text-[9px] sm:text-[10px] text-gray-500">Processing reports</p>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white shrink-0 ml-2">
            {reports.filter(r => r.aiStatus === "completed").length}
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded px-2.5 sm:px-3 py-1.5 sm:py-2 flex justify-between items-center text-[10px] sm:text-[11px]">
          <span className="text-gray-400">Pending Review:</span>
          <span className="text-yellow-500 font-bold">{reports.filter(r => r.status === "pending").length}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between border-b border-[#2A2A2A] bg-[#181818]">
          <div className="flex gap-3 sm:gap-4 text-[10px] sm:text-[11px] font-bold">
            <button className="text-gray-500">All</button>
            <button className="text-[#FF9500]">Critical</button>
            <button className="text-gray-500">Verified</button>
          </div>
          <button className="text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a1 1 0 00-2 0v12a1 1 0 102 0V4zM9 4a1 1 0 00-2 0v12a1 1 0 102 0V4zM13 4a1 1 0 00-2 0v12a1 1 0 102 0V4zM17 4a1 1 0 00-2 0v12a1 1 0 102 0V4z" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {reports.length === 0 && (
            <div className="text-center text-gray-500 text-xs py-8">
              No reports yet
            </div>
          )}

          {reports.map((report) => (
            <div key={report.id} className="bg-[#1C1B1B] rounded border border-[#2A2A2A] overflow-hidden flex flex-col">
              <div className="relative">
                {report.imageUrl ? (
                  <img
                    alt="Report"
                    className="w-full h-32 sm:h-40 object-cover grayscale brightness-75"
                    src={report.imageUrl}
                  />
                ) : (
                  <div className="w-full h-32 sm:h-40 bg-[#252525] flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-gray-600" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/80 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-bold text-white flex items-center border border-white/20">
                  <span className="truncate max-w-[80px]">{report.incidentType || "Report"}</span>
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ml-1 sm:ml-2 ${
                    report.status === "pending" ? "bg-yellow-500" :
                    report.status === "approved" || report.status === "verified" ? "bg-[#34C759]" :
                    "bg-[#FF3B30]"
                  }`} />
                </div>
              </div>
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                <p className="text-[10px] sm:text-[11px] text-gray-400 leading-relaxed italic line-clamp-3">
                  {report.description || "No description provided"}
                </p>

                {/* AI Status Display */}
                {report.aiStatus === "processing" && (
                  <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-yellow-500">
                    <Brain className="w-3 h-3 animate-pulse" />
                    <span className="font-medium">Analyzing...</span>
                  </div>
                )}

                {report.aiStatus === "completed" && report.ai && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#34C759]/20 text-[#34C759] text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded border border-[#34C759]/30 font-bold flex items-center">
                      <span className="bg-[#34C759] text-white text-[7px] px-0.5 rounded mr-0.5">AI</span>
                      {report.ai.imageClassification?.toUpperCase() || "ANALYZED"}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-gray-500">
                      Confidence: {Math.round((report.ai.confidence || 0) * 100)}%
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-bold ${
                      report.ai.priority === "high" ? "text-[#FF3B30]" :
                      report.ai.priority === "medium" ? "text-[#FF9500]" :
                      "text-[#34C759]"
                    }`}>
                      {report.ai.priority?.toUpperCase() || "LOW"}
                    </span>
                  </div>
                )}

                {report.aiStatus === "failed" && (
                  <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-[#FF3B30]">
                    <XCircle className="w-3 h-3" />
                    <span className="font-medium">AI processing failed</span>
                  </div>
                )}

                {report.location && (
                  <div className="flex items-center text-[9px] sm:text-[10px] text-gray-500 font-mono">
                    <MapPin className="w-3 h-3 mr-1 shrink-0" />
                    <span className="truncate">
                      {report.location.lat?.toFixed(4) || "0.0000"} - {report.location.lng?.toFixed(4) || "0.0000"}
                    </span>
                  </div>
                )}

                <div className="flex gap-1.5 sm:gap-2 pt-1 sm:pt-2">
                  <button
                    className="flex-1 bg-[#34C759]/20 text-[#34C759] border border-[#34C759]/30 py-1.5 sm:py-2 rounded text-[9px] sm:text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!!loadingStates[`${report.id}-verified`]}
                    onClick={() => handleAction(report.id, "verified")}
                  >
                    {loadingStates[`${report.id}-verified`] ? "..." : "Verify"}
                  </button>
                  <button
                    className="flex-1 bg-white/5 text-gray-400 border border-white/10 py-1.5 sm:py-2 rounded text-[9px] sm:text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!!loadingStates[`${report.id}-rejected`]}
                    onClick={() => handleAction(report.id, "rejected")}
                  >
                    {loadingStates[`${report.id}-rejected`] ? "..." : "Reject"}
                  </button>
                  <button
                    className="flex-1 bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/30 py-1.5 sm:py-2 rounded text-[9px] sm:text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!!loadingStates[`${report.id}-assigned`]}
                    onClick={() => handleAction(report.id, "assigned")}
                  >
                    {loadingStates[`${report.id}-assigned`] ? "..." : "Assign"}
                  </button>
                </div>

                <div className="flex items-center text-[9px] sm:text-[10px] text-gray-500 pt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {report.status || "pending"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
