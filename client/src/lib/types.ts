import { ChargingStation, EvVehicle, FilterSettings } from "@shared/schema";

// App state interface
export interface AppState {
  userVehicle: EvVehicle;
  selectedStation: ChargingStation | null;
  filterSettings: FilterSettings;
  userLocation: { latitude: number; longitude: number } | null;
  stations: ChargingStation[];
  loading: boolean;
  error: string | null;
}

// Direction route interface
export interface DirectionsRoute {
  distance: number; // In meters
  duration: number; // In seconds
  polyline: string; // Encoded polyline
}

// Map bounds interface
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
