import { 
  users, type User, type InsertUser,
  evVehicles, type EvVehicle, type InsertEvVehicle,
  savedLocations, type SavedLocation, type InsertSavedLocation
} from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { log } from "./vite";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vehicle methods
  getVehicle(id: number): Promise<EvVehicle | undefined>;
  getVehiclesByUserId(userId: number): Promise<EvVehicle[]>;
  createOrUpdateVehicle(vehicle: Partial<InsertEvVehicle> & { id?: number }): Promise<EvVehicle>;
  
  // Saved Location methods
  getSavedLocation(id: number): Promise<SavedLocation | undefined>;
  getSavedLocationsByUserId(userId: number): Promise<SavedLocation[]>;
  createSavedLocation(location: InsertSavedLocation): Promise<SavedLocation>;
  
  // Database initialization
  initDatabase(): Promise<void>;
}

// Memory storage implementation for backup/fallback
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vehicles: Map<number, EvVehicle>;
  private locations: Map<number, SavedLocation>;
  private currentUserId: number;
  private currentVehicleId: number;
  private currentLocationId: number;

  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.locations = new Map();
    this.currentUserId = 1;
    this.currentVehicleId = 1;
    this.currentLocationId = 1;
    
    this.initDatabase();
  }

  async initDatabase(): Promise<void> {
    // Initialize with a default user and vehicle
    this.initDefaultData();
  }

  private initDefaultData() {
    // Create default user
    const defaultUser: User = {
      id: this.currentUserId++,
      username: "demo_user",
      password: "password123",
      name: "John Doe",
      email: "john.doe@example.com"
    };
    this.users.set(defaultUser.id, defaultUser);
    
    // Create default vehicle for the user
    const defaultVehicle: EvVehicle = {
      id: this.currentVehicleId++,
      userId: defaultUser.id,
      name: "Tesla Model 3",
      make: "Tesla",
      model: "Model 3",
      year: 2023,
      connectorTypes: ["Tesla", "CCS1", "NACS"],
      maxChargingRate: 250,
      batteryCapacity: 82
    };
    this.vehicles.set(defaultVehicle.id, defaultVehicle);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      name: insertUser.name ?? null,
      email: insertUser.email ?? null
    };
    this.users.set(id, user);
    return user;
  }
  
  // Vehicle methods
  async getVehicle(id: number): Promise<EvVehicle | undefined> {
    return this.vehicles.get(id);
  }
  
  async getVehiclesByUserId(userId: number): Promise<EvVehicle[]> {
    return Array.from(this.vehicles.values()).filter(
      (vehicle) => vehicle.userId === userId
    );
  }
  
  async createOrUpdateVehicle(vehicleData: Partial<InsertEvVehicle> & { id?: number }): Promise<EvVehicle> {
    if (vehicleData.id && this.vehicles.has(vehicleData.id)) {
      // Update existing vehicle
      const existingVehicle = this.vehicles.get(vehicleData.id)!;
      const updatedVehicle: EvVehicle = {
        ...existingVehicle,
        ...vehicleData as any // TypeScript limitation
      };
      this.vehicles.set(updatedVehicle.id, updatedVehicle);
      return updatedVehicle;
    } else {
      // Create new vehicle
      const id = this.currentVehicleId++;
      const newVehicle: EvVehicle = {
        id,
        userId: vehicleData.userId!,
        name: vehicleData.name!,
        make: vehicleData.make!,
        model: vehicleData.model!,
        year: vehicleData.year || 0,
        connectorTypes: vehicleData.connectorTypes || [],
        maxChargingRate: vehicleData.maxChargingRate || 0,
        batteryCapacity: vehicleData.batteryCapacity || 0
      };
      this.vehicles.set(id, newVehicle);
      return newVehicle;
    }
  }
  
  // Saved Location methods
  async getSavedLocation(id: number): Promise<SavedLocation | undefined> {
    return this.locations.get(id);
  }
  
  async getSavedLocationsByUserId(userId: number): Promise<SavedLocation[]> {
    return Array.from(this.locations.values()).filter(
      (location) => location.userId === userId
    );
  }
  
  async createSavedLocation(locationData: InsertSavedLocation): Promise<SavedLocation> {
    const id = this.currentLocationId++;
    
    // Ensure connectorTypes and notes are not undefined
    const savedLocation: SavedLocation = {
      id,
      userId: locationData.userId,
      name: locationData.name,
      stationId: locationData.stationId,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      createdAt: locationData.createdAt,
      connectorTypes: locationData.connectorTypes || null,
      notes: locationData.notes || null
    };
    
    this.locations.set(id, savedLocation);
    return savedLocation;
  }
}

// PostgreSQL storage implementation
export class PgStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  private sql: ReturnType<typeof postgres>;
  
  constructor() {
    // Get database connection string from environment variables
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    
    // Create postgres client
    this.sql = postgres(DATABASE_URL);
    // Initialize drizzle with the postgres client
    this.db = drizzle(this.sql);
    
    // Initialize database schema and default data
    this.initDatabase().catch(err => {
      console.error("Failed to initialize database:", err);
    });
  }
  
  async initDatabase(): Promise<void> {
    try {
      log("Initializing database schema...", "database");
      
      // Create tables if they don't exist
      await this.sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          name TEXT,
          email TEXT
        )
      `;
      
      await this.sql`
        CREATE TABLE IF NOT EXISTS ev_vehicles (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          name TEXT NOT NULL,
          make TEXT NOT NULL,
          model TEXT NOT NULL,
          year INTEGER,
          connector_types TEXT[] NOT NULL,
          max_charging_rate INTEGER,
          battery_capacity INTEGER
        )
      `;
      
      await this.sql`
        CREATE TABLE IF NOT EXISTS saved_locations (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          name TEXT NOT NULL,
          station_id TEXT NOT NULL,
          latitude TEXT NOT NULL,
          longitude TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `;
      
      log("Database schema created successfully", "database");
      
      // Check if default user exists
      const defaultUser = await this.getUserByUsername("demo_user");
      
      if (!defaultUser) {
        log("Creating default user and vehicle...", "database");
        
        // Create default user
        const user = await this.createUser({
          username: "demo_user",
          password: "password123",
          name: "John Doe",
          email: "john.doe@example.com"
        });
        
        // Create default vehicle for the user
        await this.createOrUpdateVehicle({
          userId: user.id,
          name: "Tesla Model 3",
          make: "Tesla",
          model: "Model 3",
          year: 2023,
          connectorTypes: ["Tesla", "CCS1", "NACS"],
          maxChargingRate: 250,
          batteryCapacity: 82
        });
        
        log("Default user and vehicle created successfully", "database");
      } else {
        log("Default user already exists, skipping creation", "database");
      }
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await this.db.select().from(users).where(eq(users.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await this.db.select().from(users).where(eq(users.username, username));
      return result[0];
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await this.db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
  
  // Vehicle methods
  async getVehicle(id: number): Promise<EvVehicle | undefined> {
    try {
      const result = await this.db.select().from(evVehicles).where(eq(evVehicles.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting vehicle:", error);
      return undefined;
    }
  }
  
  async getVehiclesByUserId(userId: number): Promise<EvVehicle[]> {
    try {
      const result = await this.db.select().from(evVehicles).where(eq(evVehicles.userId, userId));
      return result;
    } catch (error) {
      console.error("Error getting vehicles by user ID:", error);
      return [];
    }
  }
  
  async createOrUpdateVehicle(vehicleData: Partial<InsertEvVehicle> & { id?: number }): Promise<EvVehicle> {
    try {
      const { id, ...data } = vehicleData;
      
      if (id !== undefined) {
        // Check if vehicle exists
        const existingVehicle = await this.getVehicle(id);
        
        if (existingVehicle) {
          // Update existing vehicle
          const result = await this.db
            .update(evVehicles)
            .set(data as any)
            .where(eq(evVehicles.id, id))
            .returning();
          return result[0];
        }
      }
      
      // Create new vehicle
      const result = await this.db
        .insert(evVehicles)
        .values(data as InsertEvVehicle)
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error creating or updating vehicle:", error);
      throw error;
    }
  }
  
  // Saved Location methods
  async getSavedLocation(id: number): Promise<SavedLocation | undefined> {
    try {
      const result = await this.db.select().from(savedLocations).where(eq(savedLocations.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting saved location:", error);
      return undefined;
    }
  }
  
  async getSavedLocationsByUserId(userId: number): Promise<SavedLocation[]> {
    try {
      const result = await this.db.select().from(savedLocations).where(eq(savedLocations.userId, userId));
      return result;
    } catch (error) {
      console.error("Error getting saved locations by user ID:", error);
      return [];
    }
  }
  
  async createSavedLocation(locationData: InsertSavedLocation): Promise<SavedLocation> {
    try {
      // Ensure all required fields are present and null where optional
      const dataToInsert = {
        userId: locationData.userId,
        name: locationData.name,
        stationId: locationData.stationId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        createdAt: locationData.createdAt,
        connectorTypes: locationData.connectorTypes ?? null,
        notes: locationData.notes ?? null
      };
      
      const result = await this.db
        .insert(savedLocations)
        .values(dataToInsert)
        .returning();
        
      return result[0];
    } catch (error) {
      console.error("Error creating saved location:", error);
      throw error;
    }
  }
}

// Create and export the storage instance
// We use PostgreSQL storage if DATABASE_URL is available, otherwise fallback to MemStorage
let storageImpl: IStorage;
try {
  storageImpl = new PgStorage();
  log("Using PostgreSQL storage", "database");
} catch (error) {
  console.error("Failed to initialize PostgreSQL storage, falling back to memory storage:", error);
  storageImpl = new MemStorage();
  log("Using in-memory storage (fallback)", "database");
}

export const storage = storageImpl;
