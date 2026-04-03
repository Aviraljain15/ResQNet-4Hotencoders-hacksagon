import { Flame, Zap, MapPin, ArrowUp, X } from "lucide-react"

const areaReports = [
  { name: "Ponce", reports: 12, count: 53, status: "critical", trend: "up" },
  { name: "Bayamón", reports: 12, count: 23, status: "verified", trend: "stable" },
  { name: "Sabana Grande", reports: 12, count: null, status: "warning", trend: null },
  { name: "Arecibo", reports: 9, count: 9, status: "normal", trend: null },
  { name: "Yauco", reports: 7, count: 7, status: "normal", trend: "up" },
]

const severityReports = [
  { name: "Ponce", reports: 12, count: 53, status: "critical" },
  { name: "Bayamón", reports: 12, count: 23, status: "verified" },
  { name: "Arecibo", reports: 9, count: 9, status: "normal" },
]

function getStatusIcon(status) {
  switch (status) {
    case "critical":
      return <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF9500]" />
    case "verified":
      return <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#34C759]" />
    case "warning":
      return <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
    default:
      return <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
  }
}

export function LeftSidebar({ onClose }) {
  return (
    <aside className="w-64 sm:w-64 h-full border-r border-[#2A2A2A] bg-[#131313] flex flex-col shrink-0 overflow-y-auto">
      <div className="p-3 sm:p-4 flex items-center justify-between border-b border-[#2A2A2A]">
        <div className="flex items-center text-xs font-semibold uppercase tracking-wider text-gray-500">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
          Reports
        </div>
        <button 
          className="lg:hidden p-1 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1">
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {areaReports.map((area, idx) => (
            <div 
              key={area.name} 
              className={`flex items-center justify-between ${idx > 2 ? "opacity-60" : idx > 0 ? "opacity-80" : ""}`}
            >
              <div className="flex items-center">
                <span className="mr-2 sm:mr-3">{getStatusIcon(area.status)}</span>
                <div>
                  <div className="text-white font-medium text-sm sm:text-base">{area.name}</div>
                  <div className={`text-xs ${area.status === "critical" ? "text-[#FF3B30] font-bold" : area.status === "verified" ? "text-[#FF3B30] font-bold" : "text-gray-400"}`}>
                    {area.reports} <span className="text-gray-500 font-normal">reports</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                {area.count && <div className="text-white font-bold">{area.count}</div>}
                {area.trend === "up" && area.status === "critical" && (
                  <div className="text-[10px] text-[#FF9500] flex items-center justify-end">
                    <ArrowUp className="w-2.5 h-2.5 mr-0.5" />
                  </div>
                )}
                {area.trend === "stable" && (
                  <div className="text-[10px] text-[#34C759] flex items-center justify-end">
                    <ArrowUp className="w-2.5 h-2.5 mr-0.5 rotate-45" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 sm:mt-8 border-t border-[#2A2A2A]">
          <div className="p-3 sm:p-4 flex items-center justify-between">
            <div className="text-white font-bold text-sm sm:text-base">
              Severity <span className="text-gray-500 font-normal text-xs ml-1">Reports</span>
            </div>
          </div>
          <div className="px-3 sm:px-4 space-y-3 sm:space-y-4">
            {severityReports.map((area, idx) => (
              <div 
                key={`severity-${area.name}`} 
                className={`flex items-center justify-between ${idx === 2 ? "opacity-60" : ""}`}
              >
                <div className="flex items-center">
                  <span className="mr-2 sm:mr-3">{getStatusIcon(area.status)}</span>
                  <div>
                    <div className="text-white font-medium text-sm sm:text-base">{area.name}</div>
                    <div className={`text-xs ${area.status !== "normal" ? "text-[#FF3B30] font-bold" : "text-gray-400"}`}>
                      {area.reports} <span className="text-gray-500 font-normal">reports</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-base sm:text-lg">{area.count}</div>
                  {area.status === "verified" && (
                    <div className="text-[10px] text-[#34C759] flex items-center justify-end">
                      <ArrowUp className="w-2.5 h-2.5 mr-0.5" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
