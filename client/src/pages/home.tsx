import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import MapView from "@/components/Map/MapView";
import TopBar from "@/components/Navigation/TopBar";
import ProfileSidebar from "@/components/Profile/ProfileSidebar";
import FilterModal from "@/components/Modals/FilterModal";
import BottomSheet from "@/components/BottomSheet/BottomSheet";
import FloatingControls from "@/components/Map/FloatingControls";
import PermissionsModal from "@/components/Modals/PermissionsModal";
import FavoritesPanel from "@/components/Favorites/FavoritesPanel";
import FavoriteButton from "@/components/Favorites/FavoriteButton";
import Loading from "@/components/ui/loading";
import useGeolocation from "@/hooks/use-geolocation";
import { FilterSettings, ChargingStation, EvVehicle, ConnectorType } from "@shared/schema";
import { defaultFilterSettings, defaultVehicle } from "@/lib/constants";

export default function Home() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [filterSettings, setFilterSettings] = useState<FilterSettings>(defaultFilterSettings);
  const [selectedVehicle, setSelectedVehicle] = useState<EvVehicle>(defaultVehicle);
  const [bottomSheetState, setBottomSheetState] = useState<"collapsed" | "expanded">("collapsed");
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { location, error: locationError, requestPermission, permissionGranted } = useGeolocation();
  const { toast } = useToast();

  // Fetch charging stations based on location and filters
  const { 
    data: chargingStations, 
    isLoading: isLoadingStations,
    error: stationsError,
    refetch: refetchStations
  } = useQuery({
    queryKey: ['/api/stations', location?.latitude, location?.longitude, filterSettings],
    queryFn: async () => {
      if (!location) return [];
      
      const url = new URL('/api/stations', window.location.origin);
      url.searchParams.append('lat', location.latitude.toString());
      url.searchParams.append('long', location.longitude.toString());
      url.searchParams.append('distance', filterSettings.distance.toString());
      
      if (filterSettings.connectorTypes.length > 0) {
        url.searchParams.append('connectors', filterSettings.connectorTypes.join(','));
      }
      
      if (filterSettings.availabilityStatuses.length > 0) {
        url.searchParams.append('statuses', filterSettings.availabilityStatuses.join(','));
      }
      
      if (filterSettings.minPowerOutput !== null) {
        url.searchParams.append('minPower', filterSettings.minPowerOutput.toString());
      }
      
      if (filterSettings.networks.length > 0) {
        url.searchParams.append('networks', filterSettings.networks.join(','));
      }
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch charging stations');
      }
      
      return response.json();
    },
    enabled: !!location,
  });

  // Check if permission modal should be shown
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  
  // Effect to show permission modal on initial load if location is not granted
  useEffect(() => {
    if (!permissionGranted && !locationError) {
      setShowPermissionModal(true);
    }
  }, [permissionGranted, locationError]);

  // Handle location permission errors
  useEffect(() => {
    if (locationError) {
      toast({
        title: "Location Error",
        description: "Unable to get your location. Please enable location services.",
        variant: "destructive",
      });
    }
  }, [locationError, toast]);

  // Handle charging stations fetch errors
  useEffect(() => {
    if (stationsError) {
      toast({
        title: "Error Loading Charging Stations",
        description: "Could not load charging stations. Please try again later.",
        variant: "destructive",
      });
    }
  }, [stationsError, toast]);

  // Filter compatible stations based on selected vehicle
  const compatibleStations = chargingStations?.filter((station: ChargingStation) => {
    return station.connectorTypes.some((type: string) => 
      selectedVehicle.connectorTypes.includes(type as ConnectorType)
    );
  }) || [];

  // Filter stations based on search query
  const filteredStations = searchQuery
    ? compatibleStations.filter((station: ChargingStation) => 
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : compatibleStations;

  const handleStationSelect = (station: ChargingStation) => {
    setSelectedStation(station);
    setBottomSheetState("expanded");
  };

  const handleAllowLocationAccess = async () => {
    setShowPermissionModal(false);
    await requestPermission();
    refetchStations();
  };

  return (
    <div className="app-container relative h-screen overflow-hidden">
      {/* Map View */}
      <MapView 
        stations={filteredStations} 
        userLocation={location}
        selectedStation={selectedStation}
        onStationSelect={handleStationSelect}
      />

      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <TopBar 
          onProfileClick={() => setIsProfileOpen(true)}
          onFilterClick={() => setIsFilterOpen(true)}
          onFavoritesClick={() => setIsFavoritesOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Profile Sidebar */}
      <ProfileSidebar 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        vehicle={selectedVehicle}
        onVehicleChange={setSelectedVehicle}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filterSettings={filterSettings}
        onFilterChange={setFilterSettings}
      />
      
      {/* Favorites Panel */}
      <FavoritesPanel
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        onStationSelect={handleStationSelect}
      />

      {/* Bottom Sheet with Stations List */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <BottomSheet
          state={bottomSheetState}
          onStateChange={setBottomSheetState}
          stations={filteredStations}
          selectedStation={selectedStation}
          onStationSelect={handleStationSelect}
        />
      </div>

      {/* Floating Map Controls */}
      <div className="absolute right-4 bottom-28 z-20">
        <FloatingControls 
          onCenterMap={() => {
            if (!location) {
              requestPermission();
            }
          }}
        />
      </div>

      {/* Permission Modal */}
      {showPermissionModal && (
        <PermissionsModal
          onAllow={handleAllowLocationAccess}
          onSkip={() => setShowPermissionModal(false)}
        />
      )}

      {/* Loading State */}
      {isLoadingStations && <Loading message="Finding nearby chargers..." />}
    </div>
  );
}
