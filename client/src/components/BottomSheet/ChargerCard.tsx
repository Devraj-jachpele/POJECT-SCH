import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Navigation } from "lucide-react";
import { ChargingStation } from "@shared/schema";
import FavoriteButton from "@/components/Favorites/FavoriteButton";

interface ChargerCardProps {
  station: ChargingStation;
  selected?: boolean;
  onClick: () => void;
}

export default function ChargerCard({ station, selected = false, onClick }: ChargerCardProps) {
  // Determine status color
  const getStatusColor = (status: ChargingStation["status"]) => {
    switch (status) {
      case "Available":
        return "bg-[#4CAF50] bg-opacity-10 text-[#4CAF50]";
      case "Busy":
        return "bg-[#FF9800] bg-opacity-10 text-[#FF9800]";
      case "Offline":
        return "bg-[#757575] bg-opacity-10 text-[#757575]";
    }
  };

  const getStatusDot = (status: ChargingStation["status"]) => {
    switch (status) {
      case "Available":
        return "bg-[#4CAF50]";
      case "Busy":
        return "bg-[#FF9800]";
      case "Offline":
        return "bg-[#757575]";
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border ${selected ? 'border-primary' : 'border-gray-100'} overflow-hidden hover:shadow-md transition-shadow cursor-pointer`}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-800">{station.name}</h3>
            <p className="text-sm text-gray-600">{station.address}</p>
            <div className="flex items-center mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(station.status)}`}>
                <span className={`w-2 h-2 rounded-full ${getStatusDot(station.status)} mr-1`}></span>
                {station.status}
              </span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-xs text-gray-500">{station.distance?.toFixed(1)} miles away</span>
            </div>
            <div className="mt-1">
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-100">
                {station.network}
              </Badge>
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-2 text-center min-w-[60px]">
            <span className="block text-lg font-bold text-gray-800">{station.powerKw}</span>
            <span className="text-xs text-gray-500">kW</span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
          <div className="flex space-x-2">
            {station.connectorTypes.map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">{type}</Badge>
            ))}
          </div>
          <div className="flex space-x-1 text-green-600">
            <span className="text-sm font-medium">Compatible</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1" />
          <span>{station.openingHours}</span>
        </div>
        
        <div className="flex gap-2">
          <div
            onClick={(e) => e.stopPropagation()}
          >
            <FavoriteButton station={station} />
          </div>
          
          {station.status !== "Offline" ? (
            <Button 
              size="sm"
              className="flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                // Open in Google Maps
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`, '_blank');
              }}
            >
              <Navigation className="h-4 w-4 mr-1" />
              Navigate
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-gray-500 cursor-not-allowed"
              disabled
            >
              <Navigation className="h-4 w-4 mr-1" />
              Unavailable
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
