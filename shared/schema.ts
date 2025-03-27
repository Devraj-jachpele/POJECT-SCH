import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// EV Vehicle schema
export const evVehicles = pgTable("ev_vehicles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year"),
  connectorTypes: text("connector_types").array().notNull(),
  maxChargingRate: integer("max_charging_rate"),
  batteryCapacity: integer("battery_capacity"),
});

export const insertEvVehicleSchema = createInsertSchema(evVehicles).pick({
  userId: true,
  name: true,
  make: true,
  model: true,
  year: true,
  connectorTypes: true,
  maxChargingRate: true,
  batteryCapacity: true,
});

export type InsertEvVehicle = z.infer<typeof insertEvVehicleSchema>;
export type EvVehicle = typeof evVehicles.$inferSelect;

// Saved Locations schema
export const savedLocations = pgTable("saved_locations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  stationId: text("station_id").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  createdAt: text("created_at").notNull(),
  connectorTypes: text("connector_types"),  // Store as JSON string
  notes: text("notes"),  // Store network or other notes
});

export const insertSavedLocationSchema = createInsertSchema(savedLocations).pick({
  userId: true,
  name: true,
  stationId: true,
  latitude: true,
  longitude: true,
  createdAt: true,
  connectorTypes: true,
  notes: true,
});

export type InsertSavedLocation = z.infer<typeof insertSavedLocationSchema>;
export type SavedLocation = typeof savedLocations.$inferSelect;

// Connector types
export const connectorTypes = [
  "CCS1", // Combined Charging System Type 1
  "CCS2", // Combined Charging System Type 2
  "Type1", // J1772
  "Type2", // Mennekes
  "CHAdeMO",
  "Tesla",
  "NACS", // North American Charging Standard (Tesla's new standard)
  "GB/T", // Chinese Standard
] as const;

export const ConnectorTypeSchema = z.enum(connectorTypes);
export type ConnectorType = z.infer<typeof ConnectorTypeSchema>;

// Charging station status
export type ChargingStationStatus = "Available" | "Busy" | "Offline";

// Charging station network
export type ChargingNetwork = 
  | "Tesla Supercharger" 
  | "ChargePoint" 
  | "EVgo" 
  | "Electrify America"
  | "IONITY"
  | "Blink"
  | "Other";

// Charging station type (from API)
export type ChargingStation = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  connectorTypes: ConnectorType[];
  powerKw: number;
  status: ChargingStationStatus;
  network: ChargingNetwork;
  openingHours: string;
  distance?: number; // In miles, calculated based on user location
  isCompatible?: boolean; // Calculated based on user's vehicle
};

// Filter settings
export type FilterSettings = {
  connectorTypes: ConnectorType[];
  distance: number; // In miles
  availabilityStatuses: ChargingStationStatus[];
  minPowerOutput: number | null; // In kW
  networks: ChargingNetwork[];
};
