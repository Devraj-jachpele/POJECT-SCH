import fetch from "node-fetch";
import { ChargingStation, ConnectorType, ChargingStationStatus, ChargingNetwork } from "@shared/schema";

// OpenChargeMap API credentials - in a real app, this would be in environment variables
const API_KEY = process.env.OPEN_CHARGE_MAP_API_KEY || "";
const API_BASE = "https://api.openchargemap.io/v3";

// Cache stations data to reduce API calls
const stationsCache = new Map<string, { timestamp: number, data: ChargingStation[] }>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch charging stations near given coordinates
 */
export async function getChargersNearby(
  latitude: number,
  longitude: number,
  distance: number = 15,
  connectorTypes?: string[],
  statusTypes?: string[],
  minPowerKW?: number | null,
  networkOperators?: string[]
): Promise<ChargingStation[]> {
  // Create a cache key based on parameters
  const cacheKey = `${latitude},${longitude},${distance},${connectorTypes?.join(',')},${statusTypes?.join(',')},${minPowerKW},${networkOperators?.join(',')}`;
  
  // Check if we have cached data
  const cachedData = stationsCache.get(cacheKey);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
    return cachedData.data;
  }
  
  // For demo purposes, generate mock data instead of real API call
  // In a real implementation, this would call the OpenChargeMap API
  const mockStations = generateMockChargingStations(latitude, longitude, distance, connectorTypes, statusTypes, minPowerKW, networkOperators);
  
  // Cache the result
  stationsCache.set(cacheKey, { timestamp: Date.now(), data: mockStations });
  
  return mockStations;
}

/**
 * Get details for a specific charging station
 */
export async function getChargingStationDetails(stationId: string): Promise<ChargingStation | null> {
  // In a real implementation, this would call the OpenChargeMap API to get details
  // For demo purposes, we'll generate a mock station
  return {
    id: stationId,
    name: `Charging Station ${stationId}`,
    address: "123 Example Street, Anytown, USA",
    latitude: 37.7749,
    longitude: -122.4194,
    connectorTypes: ["CCS1", "Tesla", "CHAdeMO"],
    powerKw: 150,
    status: "Available",
    network: "Tesla Supercharger",
    openingHours: "Open 24/7",
    distance: 1.5,
    isCompatible: true
  };
}

/**
 * Generate mock charging stations for demo purposes
 */
function generateMockChargingStations(
  latitude: number,
  longitude: number,
  distance: number,
  connectorTypes?: string[],
  statusTypes?: string[],
  minPowerKW?: number | null,
  networkOperators?: string[]
): ChargingStation[] {
  // Names for mock stations
  const stationNames = [
    "Tesla Supercharger", 
    "ChargePoint Station", 
    "EVgo Fast Charging", 
    "Electrify America", 
    "IONITY High Power Charging",
    "Blink Charging Station",
    "GreenWay Charging Hub",
    "Shell Recharge",
    "EV Connect",
    "City Power Station"
  ];
  
  // Addresses for mock stations
  const addresses = [
    "Shopping Center Parking Lot",
    "City Hall Parking",
    "Metro Station Parking",
    "Mall Parking Garage",
    "Highway Rest Area",
    "Downtown Parking Structure",
    "Hotel Visitor Parking",
    "Grocery Store Parking",
    "Office Park",
    "Public Library Parking"
  ];
  
  // Opening hours
  const openingHours = [
    "Open 24/7",
    "Open 6 AM - 11 PM",
    "Open 8 AM - 10 PM",
    "Open 7 AM - 9 PM",
    "Open 9 AM - 8 PM"
  ];
  
  // Networks
  const networks: ChargingNetwork[] = [
    "Tesla Supercharger",
    "ChargePoint",
    "EVgo",
    "Electrify America",
    "IONITY",
    "Blink",
    "Other"
  ];
  
  // Status types
  const statuses: ChargingStationStatus[] = ["Available", "Busy", "Offline"];
  
  // Power options
  const powerOptions = [50, 75, 100, 150, 250, 350];
  
  // Generate random stations
  const stations: ChargingStation[] = [];
  const count = Math.floor(Math.random() * 5) + 5; // 5-10 stations
  
  for (let i = 0; i < count; i++) {
    // Random position within distance
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * distance * 0.8; // 80% of max distance to ensure within range
    const lat = latitude + (dist / 69) * Math.cos(angle); // miles to degrees lat
    const lng = longitude + (dist / 69) * Math.sin(angle) / Math.cos(latitude * (Math.PI / 180)); // miles to degrees lng accounting for latitude
    
    const power = powerOptions[Math.floor(Math.random() * powerOptions.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const network = networks[Math.floor(Math.random() * networks.length)];
    
    // Choose 1-3 connector types
    const availableConnectors: ConnectorType[] = ["CCS1", "CCS2", "Type1", "Type2", "CHAdeMO", "Tesla", "NACS"];
    const stationConnectors: ConnectorType[] = [];
    const connectorCount = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < connectorCount; j++) {
      const randomConnector = availableConnectors[Math.floor(Math.random() * availableConnectors.length)];
      if (!stationConnectors.includes(randomConnector)) {
        stationConnectors.push(randomConnector);
      }
    }
    
    const station: ChargingStation = {
      id: `station_${i}_${Date.now()}`,
      name: stationNames[Math.floor(Math.random() * stationNames.length)],
      address: addresses[Math.floor(Math.random() * addresses.length)],
      latitude: lat,
      longitude: lng,
      connectorTypes: stationConnectors,
      powerKw: power,
      status: status,
      network: network,
      openingHours: openingHours[Math.floor(Math.random() * openingHours.length)],
      distance: dist,
      isCompatible: true // Will be determined by the client based on user's vehicle
    };
    
    // Apply filters
    let include = true;
    
    // Filter by connector type
    if (connectorTypes && connectorTypes.length > 0) {
      if (!stationConnectors.some(c => connectorTypes.includes(c))) {
        include = false;
      }
    }
    
    // Filter by status
    if (statusTypes && statusTypes.length > 0) {
      if (!statusTypes.includes(status)) {
        include = false;
      }
    }
    
    // Filter by power
    if (minPowerKW && power < minPowerKW) {
      include = false;
    }
    
    // Filter by network
    if (networkOperators && networkOperators.length > 0) {
      if (!networkOperators.includes(network)) {
        include = false;
      }
    }
    
    if (include) {
      stations.push(station);
    }
  }
  
  return stations;
}
