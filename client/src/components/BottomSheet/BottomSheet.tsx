import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ChargingStation } from "@shared/schema";
import ChargerCard from "./ChargerCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BottomSheetProps {
  state: "collapsed" | "expanded";
  onStateChange: (state: "collapsed" | "expanded") => void;
  stations: ChargingStation[];
  selectedStation: ChargingStation | null;
  onStationSelect: (station: ChargingStation) => void;
}

export default function BottomSheet({ 
  state, 
  onStateChange,
  stations,
  selectedStation,
  onStationSelect
}: BottomSheetProps) {
  const [sortBy, setSortBy] = useState<"distance" | "power" | "availability">("distance");
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const currentY = useRef<number | null>(null);
  
  // Sort stations based on selected criteria
  const sortedStations = [...stations].sort((a, b) => {
    switch (sortBy) {
      case "distance":
        return (a.distance || 0) - (b.distance || 0);
      case "power":
        return b.powerKw - a.powerKw;
      case "availability":
        // Sort Available first, then Busy, then Offline
        const statusOrder = { "Available": 0, "Busy": 1, "Offline": 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      default:
        return 0;
    }
  });

  // Handle touch events for swiping
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    const handleTouchStart = (e: TouchEvent) => {
      startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current === null) return;
      currentY.current = e.touches[0].clientY;
      
      // Prevent default to stop scrolling while swiping
      e.preventDefault();
    };

    const handleTouchEnd = () => {
      if (startY.current === null || currentY.current === null) return;
      
      const diff = currentY.current - startY.current;
      
      // Threshold for considering a swipe (in pixels)
      const threshold = 50;
      
      if (diff > threshold) {
        // Swiped down
        onStateChange("collapsed");
      } else if (diff < -threshold) {
        // Swiped up
        onStateChange("expanded");
      }
      
      startY.current = null;
      currentY.current = null;
    };

    sheet.addEventListener("touchstart", handleTouchStart);
    sheet.addEventListener("touchmove", handleTouchMove, { passive: false });
    sheet.addEventListener("touchend", handleTouchEnd);

    return () => {
      sheet.removeEventListener("touchstart", handleTouchStart);
      sheet.removeEventListener("touchmove", handleTouchMove);
      sheet.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onStateChange]);

  return (
    <div 
      ref={sheetRef}
      className={`bottom-sheet bg-white rounded-t-xl shadow-xl w-full transition-transform duration-300 ${
        state === "collapsed" ? "transform translate-y-[calc(100%-100px)]" : ""
      }`}
    >
      {/* Handle for expanding/collapsing */}
      <div 
        className="flex justify-center py-2 cursor-pointer"
        onClick={() => onStateChange(state === "collapsed" ? "expanded" : "collapsed")}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
      </div>
      
      {/* Summary view (when collapsed) */}
      <div className={`px-4 pb-4 ${state === "expanded" ? "hidden" : ""}`}>
        <div className="flex items-center">
          <h2 className="text-lg font-semibold flex items-center">
            {stations.length} Chargers Nearby
            <ChevronUp className="h-5 w-5 ml-2" />
          </h2>
        </div>
        <div className="flex items-center mt-1">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-sm text-gray-600 ml-1">Compatible</span>
          </div>
          <div className="mx-3 text-gray-300">|</div>
          <p className="text-sm text-gray-500">Tap to view and filter results</p>
        </div>
      </div>
      
      {/* Detailed view (when expanded) */}
      <div className={`px-4 pb-24 h-[70vh] overflow-y-auto ${state === "collapsed" ? "hidden" : ""}`}>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold flex items-center">
            Nearby Chargers
            <ChevronDown className="h-5 w-5 ml-2" />
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as any)}
            >
              <SelectTrigger className="text-sm bg-gray-100 border-none rounded-lg py-1 h-auto w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="availability">Availability</SelectItem>
                <SelectItem value="power">Power</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="bg-blue-50 text-blue-700 text-xs rounded-full px-3 py-1 flex items-center">
            <span>Compatible only</span>
          </div>
          <div className="bg-blue-50 text-blue-700 text-xs rounded-full px-3 py-1 flex items-center">
            <span>50+ kW</span>
          </div>
          <div className="bg-blue-50 text-blue-700 text-xs rounded-full px-3 py-1 flex items-center">
            <span>Within 10 miles</span>
          </div>
        </div>
        
        {/* Charger list */}
        {sortedStations.length > 0 ? (
          <div className="space-y-4">
            {sortedStations.map((station) => (
              <ChargerCard
                key={station.id}
                station={station}
                selected={selectedStation?.id === station.id}
                onClick={() => onStationSelect(station)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="bg-gray-100 rounded-full p-4 mb-4">
              <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Chargers Found</h3>
            <p className="text-gray-500 text-center max-w-xs">
              We couldn't find any charging stations matching your current filters. Try adjusting your filters or increasing the search radius.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
