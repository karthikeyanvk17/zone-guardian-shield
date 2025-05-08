
import React, { useEffect, useRef, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Shield, AlertTriangle, Map, MapPin, Navigation, Lock, Layers } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { toast } from "@/components/ui/sonner";

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInRestrictedZone, setIsInRestrictedZone] = useState(false);
  const [currentZone, setCurrentZone] = useState<RestrictedZone | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const { toast: useToastFn } = useToast();
  
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
            mapRef.current.flyTo({
              center: [newLocation.lng, newLocation.lat],
              essential: true,
              zoom: 14,
              speed: 0.8,
              curve: 1.5
            });
          }
          
          toast("Location updated", {
            description: "Using your real device location"
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast("Location error", {
            description: "Could not access your location. Using default.",
            variant: "destructive"
          });
        }
      );
    }
  }, []);

  // Initialize MapBox map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // This would be replaced with a proper API key in production
    // For demo purposes, we're using a public token
    const token = "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA";
    setMapboxToken(token);
    mapboxgl.accessToken = token;
    
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [simulatedLocation.lng, simulatedLocation.lat],
      zoom: 14,
      pitch: 30
    });
    
    map.on('load', () => {
      setLoading(false);
      
      // Add user marker with pulsing effect
      const userMarkerEl = document.createElement('div');
      userMarkerEl.className = 'user-marker';
      userMarkerEl.innerHTML = `
        <div class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></div>
        <div class="relative inline-flex rounded-full h-3 w-3 bg-primary"></div>
      `;
      
      new mapboxgl.Marker({
        element: userMarkerEl,
        anchor: 'center'
      })
      .setLngLat([simulatedLocation.lng, simulatedLocation.lat])
      .addTo(map);
      
      // Add navigation controls with animation
      const nav = new mapboxgl.NavigationControl({
        visualizePitch: true
      });
      map.addControl(nav, 'top-right');
      
      // Add zone circles
      addZoneCircles(map);
    });
    
    // Add map animations
    map.on('movestart', () => {
      if (mapContainerRef.current) {
        mapContainerRef.current.classList.add('scale-105');
        mapContainerRef.current.classList.add('transition-transform');
      }
    });
    
    map.on('moveend', () => {
      if (mapContainerRef.current) {
        mapContainerRef.current.classList.remove('scale-105');
      }
    });
    
    mapRef.current = map;
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);
  
  // Update map when zones change
  useEffect(() => {
    if (mapRef.current && !loading) {
      addZoneCircles(mapRef.current);
    }
  }, [restrictedZones, loading]);

  // Add zone circles to the map
  const addZoneCircles = (map: mapboxgl.Map) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // Check if the map has the source, if yes remove it
    if (map.getSource('zones')) {
      if (map.getLayer('zone-fills')) map.removeLayer('zone-fills');
      if (map.getLayer('zone-borders')) map.removeLayer('zone-borders');
      map.removeSource('zones');
    }
    
    // Add new source and layers
    map.addSource('zones', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: restrictedZones.map(zone => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [zone.lng, zone.lat]
          },
          properties: {
            id: zone.id,
            name: zone.name,
            radius: zone.radius
          }
        }))
      }
    });
    
    // Add a fill layer for the zones
    map.addLayer({
      id: 'zone-fills',
      type: 'circle',
      source: 'zones',
      paint: {
        'circle-radius': ['/', ['get', 'radius'], 5], // Scale down for visual appeal
        'circle-color': '#ff0000',
        'circle-opacity': 0.15,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ff0000'
      }
    });
    
    // Add a border layer for the zones with animation
    map.addLayer({
      id: 'zone-borders',
      type: 'circle',
      source: 'zones',
      paint: {
        'circle-radius': ['/', ['get', 'radius'], 5], 
        'circle-color': 'transparent',
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ff0000',
        'circle-stroke-opacity': [
          'interpolate',
          ['linear'],
          ['%', ['*', ['time'], 0.5], 1],
          0, 0.7,
          1, 0.3
        ]
      }
    });
    
    // Add markers for each zone
    restrictedZones.forEach(zone => {
      const el = document.createElement('div');
      el.className = 'zone-marker';
      el.innerHTML = `<div class="text-xs font-bold text-white bg-red-600 px-2 py-1 rounded shadow animate-bounce">${zone.name}</div>`;
      
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
      })
      .setLngLat([zone.lng, zone.lat])
      .addTo(map);
      
      markersRef.current.push(marker);
    });
  };

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
    
    setIsInRestrictedZone(!!inZone);
    setCurrentZone(inZone || null);
    
    // Show notification when entering or leaving a zone
    if (!!inZone !== isInRestrictedZone) {
      if (!!inZone) {
        toast("Entering Restricted Zone", {
          description: `You've entered ${inZone.name}. Camera access disabled.`
        });
      } else if (isInRestrictedZone) {
        toast("Leaving Restricted Zone", {
          description: "Camera access re-enabled."
        });
      }
    }
    
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
        mapRef.current.flyTo({
          center: [center.lng, center.lat],
          zoom: 15,
          speed: 0.8,
          curve: 1.5
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
          
          // Update the map view
          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [newLocation.lng, newLocation.lat],
              essential: true,
              zoom: 15,
              speed: 1.2,
              curve: 1.5
            });
          }
          
          toast("Location Updated", {
            description: "Using your current location",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast("Location Error", {
            description: "Could not access your location. Please check permissions.",
            variant: "destructive"
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
        description: "Geolocation is not supported by your browser.",
        variant: "destructive"
      });
    }
  };

  const handleToggleMapStyle = () => {
    if (!mapRef.current) return;
    
    const currentStyle = mapRef.current.getStyle().name;
    let newStyle = 'mapbox://styles/mapbox/streets-v12';
    
    if (currentStyle.includes('streets')) {
      newStyle = 'mapbox://styles/mapbox/satellite-streets-v12';
    } else if (currentStyle.includes('satellite')) {
      newStyle = 'mapbox://styles/mapbox/dark-v11';
    } else if (currentStyle.includes('dark')) {
      newStyle = 'mapbox://styles/mapbox/light-v11';
    }
    
    mapRef.current.setStyle(newStyle);
    toast("Map Style Changed", {
      description: "Switched to a new map style."
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
          {/* MapBox map container */}
          <div 
            ref={mapContainerRef} 
            className="w-full h-full transition-all duration-300"
          />
          
          {/* Map controls */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-2">
            {isAdminMode && (
              <Button 
                onClick={handleAddZone}
                className="animate-fade-in hover-scale"
                variant="default"
              >
                Add Restricted Zone
              </Button>
            )}
            
            <Button 
              onClick={handleUseCurrentLocation}
              className="animate-fade-in hover-scale"
              variant="outline"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Use Current Location
            </Button>
            
            <Button 
              onClick={handleToggleMapStyle}
              className="animate-fade-in hover-scale"
              variant="outline"
            >
              <Layers className="h-4 w-4 mr-2" />
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
      
      {/* Add MapBox attribution */}
      <div className="absolute bottom-0 right-0 text-xs text-gray-500 bg-white/80 px-1">
        © <a href="https://www.mapbox.com/about/maps/" target="_blank">Mapbox</a>
      </div>
    </div>
  );
};

export default MapComponent;
