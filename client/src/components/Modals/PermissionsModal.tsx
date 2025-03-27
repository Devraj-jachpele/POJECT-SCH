import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface PermissionsModalProps {
  onAllow: () => void;
  onSkip: () => void;
}

export default function PermissionsModal({ onAllow, onSkip }: PermissionsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center">
      <div className="bg-white rounded-xl w-11/12 max-w-md mx-auto overflow-hidden">
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center mb-2">Location Access Required</h2>
          <p className="text-gray-600 text-center mb-3">
            EV Finder needs access to your location to find charging stations near you.
          </p>
          <p className="text-sm text-gray-500 text-center mb-6">
            You'll need to allow location access in your browser when prompted. This helps us show you the closest charging options.
          </p>
          <div className="space-y-3">
            <Button 
              className="w-full py-6"
              onClick={onAllow}
            >
              Allow Location Access
            </Button>
            <Button 
              variant="outline" 
              className="w-full py-6 border-gray-200 text-gray-600"
              onClick={onSkip}
            >
              Not Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
