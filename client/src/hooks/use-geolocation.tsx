import { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface GeolocationHook {
  location: Location | null;
  error: GeolocationPositionError | null;
  requestPermission: () => Promise<void>;
  permissionGranted: boolean;
}

export default function useGeolocation(): GeolocationHook {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  
  // Request permission function that returns a promise
  const requestPermission = async (): Promise<void> => {
    if (!navigator.geolocation) {
      setError(new GeolocationPositionError());
      return;
    }
    
    try {
      await new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
            setPermissionGranted(true);
            setError(null);
            resolve();
          },
          (err) => {
            setError(err);
            setPermissionGranted(false);
            reject(err);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });
    } catch (err) {
      // Error is already set in the rejection handler
    }
  };
  
  // Setup watch position when component mounts
  useEffect(() => {
    if (!navigator.geolocation) {
      setError(new GeolocationPositionError());
      return;
    }
    
    // Try to get position initially
    // Check permission status if the Permissions API is available
    if (navigator.permissions && 'query' in navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        console.log("Geolocation permission status:", result.state);
        if (result.state === 'granted') {
          setPermissionGranted(true);
          requestPermission();
        } else if (result.state === 'prompt') {
          // Will show the permission prompt when requestPermission is called
          console.log("Geolocation permission needs to be requested");
        } else if (result.state === 'denied') {
          console.log("Geolocation permission was denied");
          setError(new GeolocationPositionError());
        }
        
        // Listen for permission changes
        result.addEventListener('change', () => {
          console.log("Geolocation permission changed to:", result.state);
          if (result.state === 'granted') {
            setPermissionGranted(true);
            requestPermission();
          } else if (result.state === 'denied') {
            setPermissionGranted(false);
            setError(new GeolocationPositionError());
          }
        });
      });
    } else {
      // Fallback if Permissions API is not available
      // Try to get current position to see if we have permission
      navigator.geolocation.getCurrentPosition(
        () => {
          setPermissionGranted(true);
          // Permission is granted, we can proceed
          console.log("Geolocation permission granted (fallback check)");
        },
        (err) => {
          // No permission or other error
          console.log("Geolocation error (fallback check):", err.code, err.message);
          setError(err);
        },
        { timeout: 5000 }
      );
    }
    
    // Set up watch position
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        console.log("Received geolocation update:", position.coords);
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setPermissionGranted(true);
        setError(null);
      },
      (err) => {
        console.error("Geolocation watch error:", err.code, err.message);
        setError(err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);
  
  return { location, error, requestPermission, permissionGranted };
}
