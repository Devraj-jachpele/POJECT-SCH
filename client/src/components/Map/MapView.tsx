import { useRef, useEffect, useState } from "react";
import L from "leaflet";
import { ChargingStation } from "@shared/schema";
import ChargerMarker from "./ChargerMarker";

interface MapViewProps {
  stations: ChargingStation[];
  userLocation: { latitude: number; longitude: number } | null;
  selectedStation: ChargingStation | null;
  onStationSelect: (station: ChargingStation) => void;
}

export default function MapView({ 
  stations, 
  userLocation, 
  selectedStation,
  onStationSelect 
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      // Default coordinates if user location not available
      const defaultPosition: [number, number] = [37.7749, -122.4194]; // San Francisco

      const mapInstance = L.map(mapContainerRef.current, {
        center: defaultPosition,
        zoom: 13,
        zoomControl: false,
      });

      // Add tile layer - using HTTPS for all sources
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);

      mapRef.current = mapInstance;
      setMap(mapInstance);
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    return () => {
      try {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch (error) {
        console.error("Error cleaning up map:", error);
      }
    };
  }, []);

  // Update user location marker
  useEffect(() => {
    if (!map || !userLocation) return;

    try {
      const position: [number, number] = [userLocation.latitude, userLocation.longitude];

      // Center map on user location if it's the first time we get it
      if (!userMarkerRef.current) {
        map.setView(position, 14);
      }

      // Create or update user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(position);
      } else {
        // Create a custom user location marker
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: `
            <div class="relative">
              <div class="bg-blue-600 w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <div class="bg-blue-400 w-2 h-2 rounded-full"></div>
              </div>
              <div class="bg-blue-500 w-12 h-12 rounded-full opacity-20 absolute -top-3 -left-3 animate-ping"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        userMarkerRef.current = L.marker(position, { icon: userIcon }).addTo(map);
      }
    } catch (error) {
      console.error("Error updating user location marker:", error);
    }
  }, [map, userLocation]);

  // Update charging station markers
  useEffect(() => {
    if (!map) return;

    try {
      // Clear old markers
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};

      // Add new markers
      stations.forEach(station => {
        const isSelected = selectedStation?.id === station.id;
        
        // Use ChargerMarker component to get HTML for the marker
        const iconHtml = ChargerMarker({ 
          status: station.status, 
          isSelected 
        }).props.dangerouslySetInnerHTML.__html;

        const icon = L.divIcon({
          className: 'charger-marker',
          html: iconHtml,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const position: [number, number] = [station.latitude, station.longitude];

        const marker = L.marker(position, { icon })
          .addTo(map)
          .on('click', () => onStationSelect(station));

        markersRef.current[station.id] = marker;
      });

      // Center on selected station if there is one
      if (selectedStation && markersRef.current[selectedStation.id]) {
        map.setView([selectedStation.latitude, selectedStation.longitude], 15);
      }
    } catch (error) {
      console.error("Error updating station markers:", error);
    }

    return () => {
      try {
        Object.values(markersRef.current).forEach(marker => marker.remove());
      } catch (error) {
        console.error("Error cleaning up markers:", error);
      }
    };
  }, [map, stations, selectedStation, onStationSelect]);

  return (
    <div ref={mapContainerRef} className="map-container bg-gray-100 absolute inset-0 z-0"></div>
  );
}
