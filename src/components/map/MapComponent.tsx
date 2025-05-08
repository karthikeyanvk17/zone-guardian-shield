
import React, { useEffect, useRef, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Shield, AlertTriangle, Map, MapPin } from 'lucide-react';

interface MapProps {
  onZoneAdded?: (zone: RestrictedZone) => void;
  restrictedZones: RestrictedZone[];
  userLocation?: { lat: number; lng: number } | null;
  isAdminMode?: boolean;
}

export interface RestrictedZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  createdBy: string;
  createdAt: Date;
}

const MapComponent: React.FC<MapProps> = ({ 
  onZoneAdded, 
  restrictedZones = [],
  userLocation,
  isAdminMode = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [isInRestrictedZone, setIsInRestrictedZone] = useState(false);
  const [currentZone, setCurrentZone] = useState<RestrictedZone | null>(null);
  const { toast } = useToast();
  
  const [simulatedLocation, setSimulatedLocation] = useState(userLocation || {
    lat: 37.7749,
    lng: -122.4194
  });

  // Simulate a map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Check if user is in a restricted zone
  useEffect(() => {
    if (!simulatedLocation) return;
    
    const inZone = restrictedZones.find(zone => {
      // Simple calculation for demo - in reality would use proper geofence calculations
      const distance = calculateDistance(
        simulatedLocation.lat,
        simulatedLocation.lng,
        zone.lat,
        zone.lng
      );
      return distance <= zone.radius / 1000; // Convert meters to km for this demo
    });
    
    setIsInRestrictedZone(!!inZone);
    setCurrentZone(inZone || null);
    
  }, [simulatedLocation, restrictedZones]);

  // Function to calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };
  
  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };

  const handleAddZone = () => {
    if (!isAdminMode) return;
    
    // For demo purposes, create a zone at the "current location"
    const newZone: RestrictedZone = {
      id: `zone-${Date.now()}`,
      name: `Restricted Zone ${restrictedZones.length + 1}`,
      lat: simulatedLocation.lat,
      lng: simulatedLocation.lng,
      radius: 500, // 500 meters
      createdBy: "Admin User",
      createdAt: new Date(),
    };
    
    if (onZoneAdded) {
      onZoneAdded(newZone);
      toast({
        title: "Zone Added",
        description: `New restricted zone "${newZone.name}" has been created.`,
      });
    }
  };

  const handleUseCurrentLocation = () => {
    // In a real app, this would use the Geolocation API
    // For demo, use random location around the base location
    const randomOffset = () => (Math.random() - 0.5) * 0.05;
    
    setSimulatedLocation({
      lat: simulatedLocation.lat + randomOffset(),
      lng: simulatedLocation.lng + randomOffset()
    });
    
    toast({
      title: "Location Updated",
      description: "Using your current location",
    });
  };

  // Render map circles for zones
  const renderZones = () => {
    return restrictedZones.map((zone, index) => (
      <div 
        key={zone.id}
        className="absolute rounded-full border-2 border-red-500 animate-pulse-ring"
        style={{
          width: `${zone.radius / 50}px`,
          height: `${zone.radius / 50}px`,
          left: `calc(50% + ${(zone.lng - simulatedLocation.lng) * 1000}px)`,
          top: `calc(50% - ${(zone.lat - simulatedLocation.lat) * 1000}px)`,
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 0, 0, 0.15)'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-xs text-red-600 font-bold">
          {zone.name}
        </div>
      </div>
    ));
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
      {/* Status indicator */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        {isInRestrictedZone ? (
          <Badge variant="destructive" className="animate-pulse">
            <AlertTriangle className="w-4 h-4 mr-1" /> Restricted Zone
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
            <Shield className="w-4 h-4 mr-1" /> Safe Zone
          </Badge>
        )}
      </div>
      
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="ml-2 text-muted-foreground">Loading map...</span>
        </div>
      ) : (
        <div className="relative w-full h-full">
          {/* Simulated map */}
          <div 
            ref={mapRef} 
            className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100"
          >
            {/* Grid lines for map effect */}
            <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
              {Array.from({length: 10}).map((_, i) => (
                <div key={i} className="border-t border-l border-blue-200"></div>
              ))}
            </div>
            
            {/* User location pin */}
            <div 
              className="absolute z-20"
              style={{
                left: '50%', 
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="relative">
                <div className="absolute -top-8 -left-4 animate-bounce">
                  <MapPin className="h-8 w-8 text-primary" fill="currentColor" />
                </div>
                <div className="h-4 w-4 rounded-full bg-white border-2 border-primary"></div>
                <div className="absolute -z-10 h-8 w-8 rounded-full bg-primary/20 animate-ping -translate-x-2 -translate-y-2"></div>
              </div>
            </div>
            
            {/* Zone circles */}
            {renderZones()}
          </div>
          
          {/* Map controls */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-2">
            {isAdminMode && (
              <Button 
                onClick={handleAddZone}
                className="animate-fade-in"
                variant="default"
              >
                Add Restricted Zone
              </Button>
            )}
            
            <Button 
              onClick={handleUseCurrentLocation}
              className="animate-fade-in"
              variant="outline"
            >
              <Map className="h-4 w-4 mr-2" />
              Use Current Location
            </Button>
          </div>
          
          {/* Zone info */}
          {currentZone && (
            <div className="absolute bottom-4 right-4 max-w-xs p-3 rounded-lg bg-black/70 text-white animate-slide-in">
              <h4 className="font-bold">{currentZone.name}</h4>
              <p className="text-sm">Camera is disabled in this area</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapComponent;
