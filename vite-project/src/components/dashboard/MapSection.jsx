import { lazy, Suspense } from "react"
import { Search, Home, Menu, Maximize2, Plus, Minus } from "lucide-react"

const LeafletMap = lazy(() => import("./LeafletMap").then((mod) => ({ default: mod.LeafletMap })))

export function MapSection() {
  return (
    <section className="flex-1 relative bg-black overflow-hidden min-h-[200px] sm:min-h-[250px]">
      <Suspense
        fallback={
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <div className="text-gray-500 text-sm">Loading map...</div>
          </div>
        }
      >
        <LeafletMap />
      </Suspense>
      
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex flex-col gap-1.5 sm:gap-2 z-[1000]">
        <div className="bg-[#1C1B1B]/80 backdrop-blur border border-[#2A2A2A] rounded flex flex-col">
          <button className="p-1.5 sm:p-2 border-b border-[#2A2A2A] hover:text-white text-gray-400">
            <Search className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button className="p-1.5 sm:p-2 border-b border-[#2A2A2A] hover:text-white text-gray-400">
            <Home className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button className="p-1.5 sm:p-2 border-b border-[#2A2A2A] hover:text-white text-gray-400 hidden sm:block">
            <Menu className="w-4 h-4" />
          </button>
          <button className="p-1.5 sm:p-2 hover:text-white text-gray-400 hidden sm:block">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-[#1C1B1B]/80 backdrop-blur border border-[#2A2A2A] rounded flex flex-col">
          <button className="p-1.5 sm:p-2 border-b border-[#2A2A2A] text-white font-bold text-xs">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button className="p-1.5 sm:p-2 text-white font-bold text-xs">
            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 text-[8px] sm:text-[10px] text-gray-500 z-[1000]">
        Earthstar Geographics
      </div>
    </section>
  )
}
