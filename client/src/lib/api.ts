import { ChargingStation, ConnectorType, ChargingStationStatus, ChargingNetwork } from '@shared/schema';

/**
 * Fetch charging stations from the server based on location and filters
 */
export async function fetchChargingStations(
  latitude: number, 
  longitude: number,
  distance: number = 15,
  connectorTypes: ConnectorType[] = [],
  statuses: ChargingStationStatus[] = ['Available', 'Busy'],
  minPower: number | null = null,
  networks: ChargingNetwork[] = []
): Promise<ChargingStation[]> {
  const params = new URLSearchParams({
    lat: latitude.toString(),
    long: longitude.toString(),
    distance: distance.toString(),
  });

  if (connectorTypes.length > 0) {
    params.append('connectors', connectorTypes.join(','));
  }

  if (statuses.length > 0) {
    params.append('statuses', statuses.join(','));
  }

  if (minPower !== null) {
    params.append('minPower', minPower.toString());
  }

  if (networks.length > 0) {
    params.append('networks', networks.join(','));
  }

  const response = await fetch(`/api/stations?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch charging stations');
  }
  
  return response.json();
}

/**
 * Get directions to a charging station
 */
export async function getDirections(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<any> {
  const params = new URLSearchParams({
    startLat: startLat.toString(),
    startLng: startLng.toString(),
    endLat: endLat.toString(),
    endLng: endLng.toString(),
  });

  const response = await fetch(`/api/directions?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to get directions');
  }
  
  return response.json();
}
