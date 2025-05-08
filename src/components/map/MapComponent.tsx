import React, { useEffect, useRef, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Shield, AlertTriangle, Map, MapPin, Navigation, Lock, Layers, Camera, CameraOff } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from "@/components/ui/sonner";

interface MapProps {
  onZoneAdded?: (zone: RestrictedZone) => void;
  restrictedZones: RestrictedZone[];
  userLocation?: { lat: number; lng: number } | null;
  isAdminMode?: boolean;
  onZoneStatusChange?: (isInZone: boolean) => void;
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
  isAdminMode = false,
  onZoneStatusChange
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const circlesRef = useRef<L.Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInRestrictedZone, setIsInRestrictedZone] = useState(false);
  const [currentZone, setCurrentZone] = useState<RestrictedZone | null>(null);
  const [mapStyle, setMapStyle] = useState<string>('streets');
  
  const [simulatedLocation, setSimulatedLocation] = useState(userLocation || {
    lat: 37.7749,
    lng: -122.4194
  });

  // Request real device location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setSimulatedLocation(newLocation);
          
          // If map is loaded, fly to the new location
          if (mapRef.current) {
            mapRef.current.setView([newLocation.lat, newLocation.lng], 14, {
              animate: true,
              duration: 1.5
            });
          }
          
          toast("Location updated", {
            description: "Using your real device location"
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast("Location error", {
            description: "Could not access your location. Using default."
          });
        }
      );
    }
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    const map = L.map(mapContainerRef.current, {
      center: [simulatedLocation.lat, simulatedLocation.lng],
      zoom: 14,
      zoomControl: false
    });
    
    // Add tile layer (free OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add zoom controls with custom position
    L.control.zoom({
      position: 'topright'
    }).addTo(map);
    
    // Add user marker with pulsing effect
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: `
        <div class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></div>
        <div class="relative inline-flex rounded-full h-3 w-3 bg-primary"></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    
    const userMarker = L.marker([simulatedLocation.lat, simulatedLocation.lng], {
      icon: userIcon
    }).addTo(map);
    
    // Add animation for map load
    map.on('load', () => {
      if (mapContainerRef.current) {
        mapContainerRef.current.classList.add('animate-fade-in');
      }
      setLoading(false);
    });
    
    mapRef.current = map;
    
    // Add restricted zones
    addZoneCircles();
    
    // Setup map animations
    map.on('zoomstart', () => {
      if (mapContainerRef.current) {
        mapContainerRef.current.classList.add('scale-105');
        mapContainerRef.current.classList.add('transition-transform');
      }
    });
    
    map.on('zoomend', () => {
      if (mapContainerRef.current) {
        mapContainerRef.current.classList.remove('scale-105');
      }
    });
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Function to add zone circles to the map
  const addZoneCircles = () => {
    if (!mapRef.current) return;
    
    // Clear existing circles and markers
    circlesRef.current.forEach(circle => circle.remove());
    circlesRef.current = [];
    
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // Add new circles and markers
    restrictedZones.forEach(zone => {
      // Add circle for the restricted zone
      const circle = L.circle([zone.lat, zone.lng], {
        radius: zone.radius,
        color: '#ff0000',
        fillColor: '#ff0000',
        fillOpacity: 0.15,
        weight: 2
      }).addTo(mapRef.current!);
      
      // Add animation class
      const circleElement = circle.getElement();
      if (circleElement) {
        circleElement.classList.add('animate-pulse-ring');
      }
      
      circlesRef.current.push(circle);
      
      // Add marker for the zone
      const zoneIcon = L.divIcon({
        className: 'zone-marker',
        html: `<div class="text-xs font-bold text-white bg-red-600 px-2 py-1 rounded shadow animate-bounce">${zone.name}</div>`,
        iconSize: [100, 20],
        iconAnchor: [50, 0]
      });
      
      const marker = L.marker([zone.lat, zone.lng], {
        icon: zoneIcon
      }).addTo(mapRef.current!);
      
      markersRef.current.push(marker);
    });
  };

  // Update map when zones change
  useEffect(() => {
    if (mapRef.current && !loading) {
      addZoneCircles();
    }
  }, [restrictedZones, loading]);

  // Check if user is in a restricted zone
  useEffect(() => {
    if (!simulatedLocation) return;
    
    const inZone = restrictedZones.find(zone => {
      const distance = calculateDistance(
        simulatedLocation.lat,
        simulatedLocation.lng,
        zone.lat,
        zone.lng
      );
      return distance <= zone.radius / 1000; // Convert meters to km for this demo
    });
    
    const isInZone = !!inZone;
    setIsInRestrictedZone(isInZone);
    setCurrentZone(inZone || null);
    
    // Call the onZoneStatusChange prop when zone status changes
    if (onZoneStatusChange) {
      onZoneStatusChange(isInZone);
    }
    
    // Show notification when entering or leaving a zone
    if (isInZone !== isInRestrictedZone) {
      if (isInZone) {
        toast("Entering Restricted Zone", {
          description: `You've entered ${inZone.name}. Camera access disabled.`
        });
      } else if (isInRestrictedZone) {
        toast("Leaving Restricted Zone", {
          description: "Camera access re-enabled."
        });
      }
    }
    
  }, [simulatedLocation, restrictedZones, isInRestrictedZone, onZoneStatusChange]);

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
    if (!isAdminMode || !mapRef.current) return;
    
    // Get current map center for the zone
    const center = mapRef.current.getCenter();
    
    // For demo purposes, create a zone at the map center
    const newZone: RestrictedZone = {
      id: `zone-${Date.now()}`,
      name: `Restricted Zone ${restrictedZones.length + 1}`,
      lat: center.lat,
      lng: center.lng,
      radius: 500, // 500 meters
      createdBy: "Admin User",
      createdAt: new Date(),
    };
    
    if (onZoneAdded) {
      onZoneAdded(newZone);
      toast("Zone Added", {
        description: `New restricted zone "${newZone.name}" has been created at the map center.`,
      });
      
      // Add animation for new zone
      if (mapRef.current) {
        mapRef.current.setView([center.lat, center.lng], 15, {
          animate: true,
          duration: 1
        });
      }
    }
  };

  const handleUseCurrentLocation = () => {
    // Use the real device location via Geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setSimulatedLocation(newLocation);
          
          // Update the map view with animation
          if (mapRef.current) {
            mapRef.current.setView([newLocation.lat, newLocation.lng], 15, {
              animate: true,
              duration: 1.5
            });
          }
          
          toast("Location Updated", {
            description: "Using your current location",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast("Location Error", {
            description: "Could not access your location. Please check permissions."
          });
          
          // Fallback to using random location as before
          const randomOffset = () => (Math.random() - 0.5) * 0.01;
          const newLocation = {
            lat: simulatedLocation.lat + randomOffset(),
            lng: simulatedLocation.lng + randomOffset()
          };
          setSimulatedLocation(newLocation);
        }
      );
    } else {
      toast("Location Not Supported", {
        description: "Geolocation is not supported by your browser."
      });
    }
  };

  const handleToggleMapStyle = () => {
    if (!mapRef.current) return;
    
    // Toggle between different OSM styles
    let tileUrl = '';
    let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    
    if (mapStyle === 'streets') {
      // Switch to satellite-like style (Stamen Terrain)
      tileUrl = 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png';
      attribution += ' | Map tiles by <a href="http://stamen.com">Stamen Design</a>';
      setMapStyle('satellite');
    } else if (mapStyle === 'satellite') {
      // Switch to dark style (CartoDB Dark Matter)
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution += ' | &copy; <a href="https://carto.com/attributions">CARTO</a>';
      setMapStyle('dark');
    } else if (mapStyle === 'dark') {
      // Switch to light style (CartoDB Positron)
      tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      attribution += ' | &copy; <a href="https://carto.com/attributions">CARTO</a>';
      setMapStyle('light');
    } else {
      // Back to default OpenStreetMap
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      setMapStyle('streets');
    }
    
    // Remove old layers and add new one
    mapRef.current.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        mapRef.current!.removeLayer(layer);
      }
    });
    
    L.tileLayer(tileUrl, { attribution }).addTo(mapRef.current);
    
    toast("Map Style Changed", {
      description: `Switched to ${mapStyle} style.`
    });
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
      {/* Status indicator */}
      <div className="absolute top-2 right-2 z-10 flex gap-2 animate-fade-in">
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
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <span className="ml-2 text-primary animate-pulse">Loading map...</span>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full transition-transform duration-300">
          {/* Map container */}
          <div 
            ref={mapContainerRef} 
            className="w-full h-full transition-all duration-300"
          />
          
          {/* Map controls */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-2 animate-slide-in-bottom">
            {isAdminMode && (
              <Button 
                onClick={handleAddZone}
                className="animate-fade-in hover-scale"
                variant="default"
              >
                <MapPin className="h-4 w-4 mr-2 animate-bounce" />
                Add Restricted Zone
              </Button>
            )}
            
            <Button 
              onClick={handleUseCurrentLocation}
              className="animate-fade-in hover-scale"
              variant="outline"
            >
              <Navigation className="h-4 w-4 mr-2 animate-pulse-subtle" />
              Use Current Location
            </Button>
            
            <Button 
              onClick={handleToggleMapStyle}
              className="animate-fade-in hover-scale"
              variant="outline"
            >
              <Layers className="h-4 w-4 mr-2 animate-rotate" />
              Change Map Style
            </Button>
          </div>
          
          {/* Zone info */}
          {currentZone && (
            <div className="absolute bottom-4 right-4 max-w-xs p-3 rounded-lg bg-black/70 text-white animate-slide-in">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="h-4 w-4 text-red-400 animate-pulse" />
                <h4 className="font-bold">{currentZone.name}</h4>
              </div>
              <p className="text-sm">Camera is disabled in this area</p>
            </div>
          )}
        </div>
      )}
      
      {/* Map attribution */}
      <div className="absolute bottom-0 right-0 text-xs text-gray-500 bg-white/80 px-1">
        © OpenStreetMap contributors
      </div>
    </div>
  );
};

export default MapComponent;
