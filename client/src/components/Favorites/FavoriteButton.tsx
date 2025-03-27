import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { ChargingStation } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface FavoriteButtonProps {
  station: ChargingStation;
}

export default function FavoriteButton({ station }: FavoriteButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  // Check if this station is already in favorites
  const { data: favorites = [] } = useQuery({
    queryKey: ['/api/favorites'],
  });

  const isAlreadyFavorite = Array.isArray(favorites) && favorites.some(
    (fav: any) => fav.stationId === station.id
  );

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      setIsSaving(true);
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1, // Default user ID
          stationId: station.id,
          name: station.name,
          latitude: String(station.latitude),
          longitude: String(station.longitude),
          connectorTypes: JSON.stringify(station.connectorTypes),
          notes: station.network,
          createdAt: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add to favorites');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Added to favorites',
        description: 'This charging station has been added to your favorites.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add station to favorites.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });

  return (
    <Button
      variant={isAlreadyFavorite ? "default" : "outline"}
      size="sm"
      className={`flex items-center gap-1 ${isAlreadyFavorite ? 'bg-red-100 hover:bg-red-200 text-red-600 border-red-200' : ''}`}
      onClick={() => !isAlreadyFavorite && addToFavoritesMutation.mutate()}
      disabled={isSaving || isAlreadyFavorite}
    >
      <Heart className={`h-4 w-4 ${isAlreadyFavorite ? 'fill-red-500 text-red-500' : ''}`} />
      {isAlreadyFavorite ? 'Favorited' : 'Add to Favorites'}
    </Button>
  );
}