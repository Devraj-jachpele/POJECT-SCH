import { Button } from "@/components/ui/button";
import { Compass, Target, Plus, Minus } from "lucide-react";
import { useRef } from "react";

interface FloatingControlsProps {
  onCenterMap: () => void;
}

export default function FloatingControls({ onCenterMap }: FloatingControlsProps) {
  // Get reference to map to manipulate zoom
  const mapRef = useRef<L.Map | null>(null);

  // Function to get the map instance from window
  const getMap = () => {
    if (mapRef.current) return mapRef.current;
    
    // Try to find the map instance from the window object
    const map = (window as any).__leaflet_map_instance;
    if (map) {
      mapRef.current = map;
      return map;
    }
    
    return null;
  };

  const handleZoomIn = () => {
    const map = getMap();
    if (map) map.zoomIn();
  };

  const handleZoomOut = () => {
    const map = getMap();
    if (map) map.zoomOut();
  };

  return (
    <div className="floating-controls flex flex-col space-y-3">
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-white shadow-lg text-gray-700 hover:bg-gray-50 rounded-full h-12 w-12"
      >
        <Compass className="h-6 w-6" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-white shadow-lg text-gray-700 hover:bg-gray-50 rounded-full h-12 w-12"
        onClick={() => {
          // First try to center using the map if available
          const map = getMap();
          if (map) {
            console.log("Centering map using map instance");
            // Get the user location marker if it exists
            const userMarker = document.querySelector('.user-location-marker');
            if (userMarker) {
              // Extract position from marker if possible
              const markerInstance = Object.values(map._layers).find(
                (layer: any) => layer._icon === userMarker
              ) as any;
              
              if (markerInstance && markerInstance.getLatLng) {
                const latLng = markerInstance.getLatLng();
                map.setView([latLng.lat, latLng.lng], 15);
                console.log("Centered on user marker at", latLng);
                return;
              }
            }
          }
          
          // Fall back to the passed-in callback if direct centering failed
          console.log("Using fallback location method");
          onCenterMap();
        }}
      >
        <Target className="h-6 w-6" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-white shadow-lg text-gray-700 hover:bg-gray-50 rounded-full h-12 w-12"
        onClick={handleZoomIn}
      >
        <Plus className="h-6 w-6" />
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-white shadow-lg text-gray-700 hover:bg-gray-50 rounded-full h-12 w-12"
        onClick={handleZoomOut}
      >
        <Minus className="h-6 w-6" />
      </Button>
    </div>
  );
}
