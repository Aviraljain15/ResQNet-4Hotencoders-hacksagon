import { Flame, Building, Zap, ChevronDown, Check, X, Users } from "lucide-react"

const criticalReports = [
  {
    id: 1,
    title: "Gas leak near Main St, Ponce",
    icon: "flame",
    severity: "critical",
    time: "4 mins ago",
    confidence: 82,
  },
  {
    id: 2,
    title: "Building collapse near downtown",
    icon: "building",
    severity: "critical",
    time: "7 mins ago",
    confidence: 78,
  },
  {
    id: 3,
    title: "Power outage affecting large areas",
    icon: "power",
    severity: "warning",
    time: "12 minutes ago",
    confidence: null,
  },
]

const resourceReports = [
  {
    id: 1,
    title: "Building collapse near...",
    verified: true,
    severity: "critical",
    time: "7 mins ago",
    confidence: 78,
  },
  {
    id: 2,
    title: "Building fire reported in Yauco",
    severity: "warning",
    time: "17 min",
    confidence: null,
  },
]

function getIcon(icon) {
  switch (icon) {
    case "flame":
      return <Flame className="w-3 h-3 sm:w-4 sm:h-4" />
    case "building":
      return <Building className="w-3 h-3 sm:w-4 sm:h-4" />
    case "power":
      return <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
    default:
      return <Flame className="w-3 h-3 sm:w-4 sm:h-4" />
  }
}

export function BottomPanels() {
  return (
    <section className="h-[45%] sm:h-1/2 flex flex-col sm:flex-row border-t border-[#2A2A2A] overflow-hidden bg-[#131313]">
      <div className="flex-1 sm:w-1/2 flex flex-col border-b sm:border-b-0 sm:border-r border-[#2A2A2A] min-h-0">
        <div className="p-2 sm:p-3 border-b border-[#2A2A2A] flex justify-between items-center shrink-0">
          <h2 className="text-white font-bold text-xs sm:text-sm">
            Critical <span className="text-gray-500 font-normal ml-1 hidden sm:inline">Reports</span>
          </h2>
          <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-widest">Totaal: 912</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 sm:space-y-3">
          {criticalReports.map((report, idx) => (
            <div
              key={report.id}
              className={`bg-[#1C1B1B] border border-[#2A2A2A] rounded p-2 sm:p-3 relative overflow-hidden ${idx === 2 ? "opacity-60" : ""}`}
            >
              {report.severity === "critical" && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF3B30]" />
              )}
              {report.severity === "critical" && idx === 1 && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF9500]" />
              )}
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center min-w-0">
                  <span className={`mr-1.5 sm:mr-2 shrink-0 ${report.severity === "critical" ? "text-[#FF9500]" : "text-yellow-500"}`}>
                    {getIcon(report.icon)}
                  </span>
                  <h3 className="text-white font-medium text-[10px] sm:text-xs truncate">{report.title}</h3>
                </div>
                <span className="text-[9px] sm:text-[10px] text-gray-500 shrink-0 ml-2">{report.time.replace(" ago", "")}</span>
              </div>
              {report.confidence && (
                <div className="flex items-center mt-1.5 sm:mt-2 flex-wrap gap-1">
                  <span className="bg-[#FF3B30]/20 text-[#FF3B30] text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded border border-[#FF3B30]/30 font-bold flex items-center">
                    <span className="bg-[#FF3B30] text-white text-[7px] sm:text-[8px] px-0.5 sm:px-1 rounded mr-0.5 sm:mr-1">AI</span> CRITICAL
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-gray-500 hidden sm:inline">{report.time}</span>
                  <span className="ml-auto text-white font-bold text-xs sm:text-sm">{report.confidence}%</span>
                </div>
              )}
              {!report.confidence && (
                <div className="flex items-start mt-1">
                  <div className="text-[9px] sm:text-[10px] text-gray-500">{report.time}</div>
                  <button className="ml-auto">
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 sm:w-1/2 flex flex-col min-h-0">
        <div className="p-2 sm:p-3 border-b border-[#2A2A2A] flex justify-between items-center shrink-0">
          <h2 className="text-white font-bold text-xs sm:text-sm">Resource</h2>
          <div className="flex items-center gap-2 text-gray-500">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a1 1 0 00-2 0v12a1 1 0 102 0V4zM9 4a1 1 0 00-2 0v12a1 1 0 102 0V4zM13 4a1 1 0 00-2 0v12a1 1 0 102 0V4zM17 4a1 1 0 00-2 0v12a1 1 0 102 0V4z" />
            </svg>
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>
        
        {/* <div className="px-2 sm:px-3 py-1.5 sm:py-2 flex gap-1.5 sm:gap-2 border-b border-[#2A2A2A] shrink-0 overflow-x-auto">
          <button className="bg-[#FF9500]/20 text-[#FF9500] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold whitespace-nowrap">All</button>
          <button className="text-gray-500 px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold whitespace-nowrap">Critical</button>
          <button className="text-gray-500 px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold whitespace-nowrap">Verified</button>
        </div> */}

        <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 sm:space-y-3">
          {resourceReports.map((report, idx) => (
            <div
              key={report.id}
              className={`bg-[#1C1B1B] border border-[#2A2A2A] rounded p-2 sm:p-3 ${idx === 1 ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center min-w-0">
                  <span className={`mr-1.5 sm:mr-2 shrink-0 ${report.severity === "critical" ? "text-[#FF9500]" : "text-yellow-500"}`}>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                    </svg>
                  </span>
                  <h3 className="text-white text-[10px] sm:text-xs font-medium truncate">
                    {report.title}
                    {report.verified && <span className="text-[#34C759] ml-1 hidden sm:inline">isp:s</span>}
                  </h3>
                </div>
                {report.confidence ? (
                  <div className="text-right shrink-0 ml-2">
                    <div className="text-white font-bold text-xs sm:text-sm">{report.confidence}%</div>
                  </div>
                ) : (
                  <span className="text-[9px] sm:text-[10px] text-gray-500 shrink-0 ml-2">{report.time}</span>
                )}
              </div>
              
              {report.confidence && (
                <>
                  <div className="flex items-center mt-1.5 sm:mt-2 flex-wrap gap-1">
                    <span className="bg-[#FF3B30]/20 text-[#FF3B30] text-[7px] sm:text-[8px] px-1 sm:px-1.5 py-0.5 rounded font-bold flex items-center">
                      <span className="bg-[#FF3B30] text-white text-[6px] sm:text-[7px] px-0.5 sm:px-1 rounded mr-0.5 sm:mr-1">T</span> CRITICAL
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-gray-500 hidden sm:inline">{report.time}</span>
                    <span className="ml-auto text-yellow-500 text-[9px] sm:text-[10px]">{report.confidence}%</span>
                  </div>
                  
                  <div className="mt-2 sm:mt-4 flex gap-1.5 sm:gap-2">
                    <button className="flex-1 bg-[#34C759]/20 text-[#34C759] border border-[#34C759]/30 py-1 sm:py-1.5 rounded text-[8px] sm:text-[10px] font-bold flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" /> <span className="hidden sm:inline">VERIFY</span><span className="sm:hidden">OK</span>
                    </button>
                    <button className="flex-1 bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/30 py-1 sm:py-1.5 rounded text-[8px] sm:text-[10px] font-bold flex items-center justify-center">
                      <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" /> <span className="hidden sm:inline">REJECT</span><span className="sm:hidden">NO</span>
                    </button>
                    {/* <button className="flex-1 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 py-1 sm:py-1.5 rounded text-[8px] sm:text-[10px] font-bold flex items-center justify-center">
                      <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" /> <span className="hidden sm:inline">ASSIGN</span><span className="sm:hidden">ADD</span>
                    </button> */}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
