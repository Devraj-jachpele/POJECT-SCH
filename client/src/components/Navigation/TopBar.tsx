import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Menu, SlidersHorizontal, Heart } from "lucide-react";

interface TopBarProps {
  onProfileClick: () => void;
  onFilterClick: () => void;
  onFavoritesClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function TopBar({ 
  onProfileClick, 
  onFilterClick,
  onFavoritesClick,
  searchQuery,
  onSearchChange 
}: TopBarProps) {
  return (
    <div className="topbar absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
      {/* Menu button */}
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-white shadow-lg text-gray-700 hover:bg-gray-50 rounded-full h-10 w-10"
        onClick={onProfileClick}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      {/* Search bar */}
      <div className="flex-1 mx-2">
        <div className="bg-white rounded-full shadow-lg flex items-center px-4 py-2">
          <Search className="h-4 w-4 text-gray-400 mr-2" />
          <Input
            type="text"
            placeholder="Search for chargers or locations..."
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm p-0 h-auto"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      {/* Favorites button */}
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-white shadow-lg text-gray-700 hover:bg-gray-50 rounded-full h-10 w-10 mx-2"
        onClick={onFavoritesClick}
      >
        <Heart className="h-5 w-5" />
      </Button>
      
      {/* Filter button */}
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-white shadow-lg text-gray-700 hover:bg-gray-50 rounded-full h-10 w-10"
        onClick={onFilterClick}
      >
        <SlidersHorizontal className="h-5 w-5" />
      </Button>
    </div>
  );
}
