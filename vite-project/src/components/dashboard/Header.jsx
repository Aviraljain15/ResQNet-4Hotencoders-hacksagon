import { Menu, Search, Bell, LogOut, User } from "lucide-react"

export function Header({ onMenuClick, onAlertsClick, userData, onLogout }) {
  return (
    <header className="h-12 border-b border-[#2A2A2A] flex items-center justify-between px-3 sm:px-4 bg-[#1C1B1B] shrink-0">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          className="text-gray-400 hover:text-white"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">Reports</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:flex items-center bg-[#252525] border border-[#2A2A2A] rounded px-2 py-1">
          <Search className="w-4 h-4 text-gray-500 mr-2" />
          <span className="text-xs text-gray-500">Search...</span>
        </div>

        <button className="sm:hidden p-1.5 text-gray-400 hover:text-white">
          <Search className="w-5 h-5" />
        </button>

        <button
          className="lg:hidden p-1.5 text-gray-400 hover:text-white relative"
          onClick={onAlertsClick}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-[#FF3B30] rounded-full" />
        </button>

        <div className="hidden md:flex gap-1 border-l border-[#2A2A2A] pl-3 ml-2">
          <button className="p-1.5 bg-[#252525] rounded text-gray-400 hover:text-white">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a1 1 0 00-2 0v12a1 1 0 102 0V4zM9 4a1 1 0 00-2 0v12a1 1 0 102 0V4zM13 4a1 1 0 00-2 0v12a1 1 0 102 0V4zM17 4a1 1 0 00-2 0v12a1 1 0 102 0V4z" />
            </svg>
          </button>
          <button className="p-1.5 text-gray-500 hover:text-white">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            </svg>
          </button>
          <button className="p-1.5 text-gray-500 hover:text-white">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 2a1 1 0 112 0 1 1 0 01-2 0zm0 4a1 1 0 112 0 1 1 0 01-2 0zm5-4a1 1 0 112 0 1 1 0 01-2 0zm0 4a1 1 0 112 0 1 1 0 01-2 0z" />
            </svg>
          </button>
        </div>

        {/* User info + Logout */}
        {userData && (
          <div className="flex items-center gap-2 border-l border-[#2A2A2A] pl-3 ml-2">
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-white font-medium leading-tight">
                  {userData.orgName}
                </span>
                <span className="text-[10px] text-gray-500 leading-tight">
                  {userData.district}
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
