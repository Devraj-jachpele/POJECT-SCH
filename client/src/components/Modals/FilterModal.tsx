import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { 
  FilterSettings, 
  ConnectorType, 
  connectorTypes, 
  ChargingStationStatus, 
  ChargingNetwork 
} from "@shared/schema";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterSettings: FilterSettings;
  onFilterChange: (settings: FilterSettings) => void;
}

export default function FilterModal({ 
  isOpen, 
  onClose, 
  filterSettings,
  onFilterChange 
}: FilterModalProps) {
  // Create a local copy of filter settings to work with
  const localSettings = useRef<FilterSettings>({ ...filterSettings });

  // Reset local settings when modal opens
  useEffect(() => {
    if (isOpen) {
      localSettings.current = { ...filterSettings };
    }
  }, [isOpen, filterSettings]);

  // Update a specific filter
  const updateFilter = <K extends keyof FilterSettings>(
    key: K,
    value: FilterSettings[K]
  ) => {
    localSettings.current = {
      ...localSettings.current,
      [key]: value,
    };
  };

  // Toggle a connector type
  const toggleConnectorType = (type: ConnectorType) => {
    const currentTypes = localSettings.current.connectorTypes;
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    updateFilter('connectorTypes', newTypes);
  };

  // Toggle availability status
  const toggleAvailabilityStatus = (status: ChargingStationStatus) => {
    const currentStatuses = localSettings.current.availabilityStatuses;
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    updateFilter('availabilityStatuses', newStatuses);
  };

  // Toggle network
  const toggleNetwork = (network: ChargingNetwork) => {
    const currentNetworks = localSettings.current.networks;
    const newNetworks = currentNetworks.includes(network)
      ? currentNetworks.filter(n => n !== network)
      : [...currentNetworks, network];
    
    updateFilter('networks', newNetworks);
  };

  // Set power output
  const setPowerOutput = (power: number | null) => {
    updateFilter('minPowerOutput', power);
  };

  // Apply filters and close modal
  const applyFilters = () => {
    onFilterChange(localSettings.current);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-end justify-center sm:items-center">
      <div className="bg-white rounded-t-xl sm:rounded-xl w-full sm:w-[600px] max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Filter Chargers</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-500 hover:text-gray-700 h-auto w-auto p-1"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="space-y-6">
            {/* Connector types section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">CONNECTOR TYPES</h3>
              <div className="grid grid-cols-2 gap-3">
                {connectorTypes.map((type) => (
                  <label 
                    key={type} 
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-primary cursor-pointer"
                  >
                    <Checkbox 
                      checked={filterSettings.connectorTypes.includes(type)}
                      onCheckedChange={() => toggleConnectorType(type)}
                    />
                    <span className="ml-3 text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Distance section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-500">DISTANCE</h3>
                <span className="text-sm text-primary font-medium">
                  {filterSettings.distance} miles
                </span>
              </div>
              <Slider
                defaultValue={[filterSettings.distance]}
                max={50}
                min={1}
                step={1}
                onValueChange={(value) => updateFilter('distance', value[0])}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 mi</span>
                <span>25 mi</span>
                <span>50 mi</span>
              </div>
            </div>
            
            {/* Availability section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">AVAILABILITY</h3>
              <div className="space-y-2">
                <label className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Checkbox 
                    checked={filterSettings.availabilityStatuses.includes("Available")}
                    onCheckedChange={() => toggleAvailabilityStatus("Available")}
                  />
                  <span className="ml-3 text-sm text-gray-700">Available Now</span>
                </label>
                <label className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Checkbox 
                    checked={filterSettings.availabilityStatuses.includes("Busy")}
                    onCheckedChange={() => toggleAvailabilityStatus("Busy")}
                  />
                  <span className="ml-3 text-sm text-gray-700">In Use</span>
                </label>
                <label className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Checkbox 
                    checked={filterSettings.availabilityStatuses.includes("Offline")}
                    onCheckedChange={() => toggleAvailabilityStatus("Offline")}
                  />
                  <span className="ml-3 text-sm text-gray-700">Offline</span>
                </label>
              </div>
            </div>
            
            {/* Power output section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">MINIMUM POWER OUTPUT</h3>
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  variant={filterSettings.minPowerOutput === null ? "default" : "outline"}
                  onClick={() => setPowerOutput(null)}
                  className="py-2 px-4 text-sm font-medium"
                >
                  Any
                </Button>
                <Button 
                  variant={filterSettings.minPowerOutput === 50 ? "default" : "outline"}
                  onClick={() => setPowerOutput(50)}
                  className="py-2 px-4 text-sm font-medium"
                >
                  50+ kW
                </Button>
                <Button 
                  variant={filterSettings.minPowerOutput === 150 ? "default" : "outline"}
                  onClick={() => setPowerOutput(150)}
                  className="py-2 px-4 text-sm font-medium"
                >
                  150+ kW
                </Button>
              </div>
            </div>
            
            {/* Network section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">CHARGING NETWORKS</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Tesla Supercharger",
                  "ChargePoint",
                  "EVgo",
                  "Electrify America",
                  "IONITY",
                  "Blink",
                  "Other"
                ].map((network) => (
                  <label 
                    key={network} 
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-primary cursor-pointer"
                  >
                    <Checkbox 
                      checked={filterSettings.networks.includes(network as ChargingNetwork)}
                      onCheckedChange={() => toggleNetwork(network as ChargingNetwork)}
                    />
                    <span className="ml-3 text-sm text-gray-700">{network}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                className="w-full py-6" 
                onClick={applyFilters}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
