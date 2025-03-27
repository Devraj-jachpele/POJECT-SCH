import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SavedLocation, ChargingStation, ConnectorType, ChargingNetwork } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Heart, Trash2, X, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface FavoritesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onStationSelect: (station: ChargingStation) => void;
}

export default function FavoritesPanel({ isOpen, onClose, onStationSelect }: FavoritesPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch favorites
  const { data: favorites = [], isLoading, error } = useQuery({
    queryKey: ['/api/favorites'],
    enabled: isOpen,
  });

  // Delete favorite mutation
  const deleteFavoriteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/favorites/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove from favorites');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Favorite removed',
        description: 'The charging station has been removed from your favorites.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to remove the station from favorites.',
        variant: 'destructive',
      });
    },
  });

  // Handle selecting a favorite station
  const handleSelectStation = (favorite: SavedLocation) => {
    // Create a ChargingStation object from the SavedLocation
    const station: ChargingStation = {
      id: favorite.stationId,
      name: favorite.name,
      address: '',  // We don't have this in our saved locations
      latitude: parseFloat(favorite.latitude),
      longitude: parseFloat(favorite.longitude),
      connectorTypes: favorite.connectorTypes ? 
        JSON.parse(favorite.connectorTypes) as ConnectorType[] : 
        [],
      powerKw: 0,  // We don't have this in our saved locations
      status: 'Available',  // Default value
      network: (favorite.notes || 'Unknown') as ChargingNetwork,
      openingHours: '24/7',  // Default value
    };
    
    onStationSelect(station);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Heart className="mr-2 h-5 w-5 text-red-500" />
            Favorite Charging Stations
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <ScrollArea className="h-[300px] pr-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <p>Loading favorites...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-24">
              <p className="text-red-500">Failed to load favorites</p>
            </div>
          ) : Array.isArray(favorites) && favorites.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-24 text-center">
              <p className="text-gray-500 mb-2">You don't have any favorite stations yet</p>
              <p className="text-sm text-gray-400">
                Save your favorite charging stations for quick access
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.isArray(favorites) && favorites.map((favorite: SavedLocation) => (
                <Card key={favorite.id} className="relative group">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-6">
                        <h3 className="font-semibold truncate">{favorite.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          <span>{`${parseFloat(favorite.latitude).toFixed(4)}, ${parseFloat(favorite.longitude).toFixed(4)}`}</span>
                        </div>
                        
                        {favorite.connectorTypes && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {JSON.parse(favorite.connectorTypes as string).map((type: string) => (
                              <Badge key={type} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {favorite.notes && (
                          <p className="text-sm mt-2 text-gray-600">{favorite.notes}</p>
                        )}
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteFavoriteMutation.mutate(favorite.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => handleSelectStation(favorite)}
                    >
                      Navigate
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}