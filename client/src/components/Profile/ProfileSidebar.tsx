import { Button } from "@/components/ui/button";
import { 
  History, 
  Star, 
  Settings, 
  HelpCircle, 
  X 
} from "lucide-react";
import VehicleSelector from "./VehicleSelector";
import { EvVehicle } from "@shared/schema";

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: EvVehicle;
  onVehicleChange: (vehicle: EvVehicle) => void;
}

export default function ProfileSidebar({ 
  isOpen, 
  onClose,
  vehicle,
  onVehicleChange 
}: ProfileSidebarProps) {
  // Mock user data (in a real app, this would come from auth)
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    initials: "JD"
  };

  return (
    <div className={`fixed left-0 top-0 h-full w-72 bg-white shadow-xl z-20 transform transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">My Profile</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-500 hover:text-gray-700 h-auto w-auto p-1"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white">
              <span className="text-lg font-medium">{user.initials}</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">MY VEHICLE</h3>
          <VehicleSelector 
            vehicle={vehicle}
            onChange={onVehicleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className="flex items-center justify-start space-x-3 p-2 w-full rounded-lg hover:bg-gray-100"
          >
            <History className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700">Charging History</span>
          </Button>
          
          <Button 
            variant="ghost" 
            className="flex items-center justify-start space-x-3 p-2 w-full rounded-lg hover:bg-gray-100"
          >
            <Star className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700">Saved Locations</span>
          </Button>
          
          <Button 
            variant="ghost" 
            className="flex items-center justify-start space-x-3 p-2 w-full rounded-lg hover:bg-gray-100"
          >
            <Settings className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700">Settings</span>
          </Button>
          
          <Button 
            variant="ghost" 
            className="flex items-center justify-start space-x-3 p-2 w-full rounded-lg hover:bg-gray-100"
          >
            <HelpCircle className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700">Help & Support</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
