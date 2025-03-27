import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getChargersNearby, getChargingStationDetails } from "./api/openchargermap";
import { FilterSettings, ChargingStation } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Get all charging stations near a location
  app.get('/api/stations', async (req: Request, res: Response) => {
    try {
      const latitude = parseFloat(req.query.lat as string);
      const longitude = parseFloat(req.query.long as string);
      const distance = parseInt(req.query.distance as string) || 15;
      
      // Optional filters
      const connectors = (req.query.connectors as string)?.split(',') || [];
      const statuses = (req.query.statuses as string)?.split(',') || ['Available', 'Busy'];
      const minPower = req.query.minPower ? parseInt(req.query.minPower as string) : null;
      const networks = (req.query.networks as string)?.split(',') || [];

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: 'Valid latitude and longitude required' });
      }

      const stations = await getChargersNearby(
        latitude, 
        longitude, 
        distance,
        connectors.length > 0 ? connectors : undefined,
        statuses.length > 0 ? statuses : undefined,
        minPower,
        networks.length > 0 ? networks : undefined
      );

      res.json(stations);
    } catch (error) {
      console.error('Error fetching charging stations:', error);
      res.status(500).json({ message: 'Failed to fetch charging stations' });
    }
  });

  // Get details for a specific charging station
  app.get('/api/stations/:id', async (req: Request, res: Response) => {
    try {
      const stationId = req.params.id;
      const station = await getChargingStationDetails(stationId);
      
      if (!station) {
        return res.status(404).json({ message: 'Charging station not found' });
      }
      
      res.json(station);
    } catch (error) {
      console.error('Error fetching station details:', error);
      res.status(500).json({ message: 'Failed to fetch station details' });
    }
  });

  // Create/update a user's EV vehicle
  app.post('/api/vehicles', async (req: Request, res: Response) => {
    try {
      const vehicleData = req.body;
      
      // In a real app, we would validate the user ID and associate the vehicle with it
      // For now, we'll just use a default user ID
      const userId = 1;
      
      if (!vehicleData.name || !vehicleData.make || !vehicleData.model) {
        return res.status(400).json({ message: 'Vehicle name, make, and model are required' });
      }
      
      const vehicle = await storage.createOrUpdateVehicle({
        ...vehicleData,
        userId
      });
      
      res.json(vehicle);
    } catch (error) {
      console.error('Error creating/updating vehicle:', error);
      res.status(500).json({ message: 'Failed to create/update vehicle' });
    }
  });

  // Get user's vehicles
  app.get('/api/vehicles', async (req: Request, res: Response) => {
    try {
      // In a real app, we would get the user ID from the session
      const userId = 1;
      
      const vehicles = await storage.getVehiclesByUserId(userId);
      res.json(vehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      res.status(500).json({ message: 'Failed to fetch vehicles' });
    }
  });

  // Save a location for a user
  app.post('/api/saved-locations', async (req: Request, res: Response) => {
    try {
      const locationData = req.body;
      
      // In a real app, we would validate the user ID
      const userId = 1;
      
      if (!locationData.name || !locationData.stationId || !locationData.latitude || !locationData.longitude) {
        return res.status(400).json({ message: 'Location name, station ID, latitude, and longitude are required' });
      }
      
      const savedLocation = await storage.createSavedLocation({
        ...locationData,
        userId,
        createdAt: new Date().toISOString()
      });
      
      res.json(savedLocation);
    } catch (error) {
      console.error('Error saving location:', error);
      res.status(500).json({ message: 'Failed to save location' });
    }
  });

  // Get user's saved locations
  app.get('/api/saved-locations', async (req: Request, res: Response) => {
    try {
      // In a real app, we would get the user ID from the session
      const userId = 1;
      
      const savedLocations = await storage.getSavedLocationsByUserId(userId);
      res.json(savedLocations);
    } catch (error) {
      console.error('Error fetching saved locations:', error);
      res.status(500).json({ message: 'Failed to fetch saved locations' });
    }
  });

  // Add favorite stations API
  // Save a favorite charging station
  app.post('/api/favorites', async (req: Request, res: Response) => {
    try {
      const { stationId, name, latitude, longitude, connectorTypes, network } = req.body;
      
      // In a real app, we would validate the user ID
      const userId = 1;
      
      if (!stationId || !name || !latitude || !longitude) {
        return res.status(400).json({ message: 'Station ID, name, latitude, and longitude are required' });
      }
      
      const savedLocation = await storage.createSavedLocation({
        userId,
        stationId,
        name,
        latitude,
        longitude,
        connectorTypes: JSON.stringify(connectorTypes || []),
        notes: network || '',
        createdAt: new Date().toISOString()
      });
      
      res.status(201).json(savedLocation);
    } catch (error) {
      console.error('Error saving favorite station:', error);
      res.status(500).json({ message: 'Failed to save favorite station' });
    }
  });

  // Get user's favorite stations
  app.get('/api/favorites', async (req: Request, res: Response) => {
    try {
      // In a real app, we would get the user ID from the session
      const userId = 1;
      
      const favorites = await storage.getSavedLocationsByUserId(userId);
      res.json(favorites);
    } catch (error) {
      console.error('Error fetching favorite stations:', error);
      res.status(500).json({ message: 'Failed to fetch favorite stations' });
    }
  });

  // Delete a favorite station
  app.delete('/api/favorites/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid favorite ID' });
      }
      
      // We would check if the favorite belongs to the current user here
      
      // For now, we'll just return success
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting favorite station:', error);
      res.status(500).json({ message: 'Failed to delete favorite station' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
