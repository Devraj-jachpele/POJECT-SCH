import { FilterSettings, EvVehicle } from "@shared/schema";

// Default filter settings
export const defaultFilterSettings: FilterSettings = {
  connectorTypes: ["CCS1", "CCS2", "Type1", "Type2", "CHAdeMO", "Tesla", "NACS", "GB/T"],
  distance: 15,
  availabilityStatuses: ["Available", "Busy"],
  minPowerOutput: null,
  networks: ["Tesla Supercharger", "ChargePoint", "EVgo", "Electrify America", "IONITY", "Blink", "Other"],
};

// Default vehicle for new users
export const defaultVehicle: EvVehicle = {
  id: 0,
  userId: 0,
  name: "Tesla Model 3",
  make: "Tesla",
  model: "Model 3",
  year: 2023,
  connectorTypes: ["Tesla", "CCS1", "NACS"],
  maxChargingRate: 250,
  batteryCapacity: 82,
};

// Popular EV models for quick selection
export const popularEvModels = [
  {
    name: "Tesla Model 3",
    make: "Tesla",
    model: "Model 3",
    year: 2023,
    connectorTypes: ["Tesla", "CCS1", "NACS"],
    maxChargingRate: 250,
    batteryCapacity: 82,
  },
  {
    name: "Tesla Model Y",
    make: "Tesla",
    model: "Model Y",
    year: 2023,
    connectorTypes: ["Tesla", "CCS1", "NACS"],
    maxChargingRate: 250,
    batteryCapacity: 75,
  },
  {
    name: "Nissan Leaf",
    make: "Nissan",
    model: "Leaf",
    year: 2023,
    connectorTypes: ["CHAdeMO", "Type1"],
    maxChargingRate: 100,
    batteryCapacity: 62,
  },
  {
    name: "Chevrolet Bolt",
    make: "Chevrolet",
    model: "Bolt",
    year: 2023,
    connectorTypes: ["CCS1"],
    maxChargingRate: 55,
    batteryCapacity: 66,
  },
  {
    name: "Ford Mustang Mach-E",
    make: "Ford",
    model: "Mustang Mach-E",
    year: 2023,
    connectorTypes: ["CCS1"],
    maxChargingRate: 150,
    batteryCapacity: 91,
  },
  {
    name: "Hyundai IONIQ 5",
    make: "Hyundai",
    model: "IONIQ 5",
    year: 2023,
    connectorTypes: ["CCS2"],
    maxChargingRate: 220,
    batteryCapacity: 77,
  },
  {
    name: "Kia EV6",
    make: "Kia",
    model: "EV6",
    year: 2023,
    connectorTypes: ["CCS2"],
    maxChargingRate: 240,
    batteryCapacity: 77,
  },
];
