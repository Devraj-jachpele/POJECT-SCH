import { createRoot } from "react-dom/client";
import "./index.css";
import L from "leaflet";
import App from "./App";

// Set up Leaflet configuration before rendering the app
if (typeof window !== 'undefined') {
  try {
    // Fix Leaflet icon paths
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
    
    console.log("Leaflet configured successfully");
  } catch (error) {
    console.error("Error configuring Leaflet:", error);
  }
}

// Add a slight delay before mounting the app to ensure resources are loaded
setTimeout(() => {
  try {
    const rootElement = document.getElementById("root");
    if (rootElement) {
      createRoot(rootElement).render(<App />);
      console.log("App rendered successfully");
    } else {
      console.error("Root element not found");
    }
  } catch (error) {
    console.error("Error rendering app:", error);
  }
}, 100);
