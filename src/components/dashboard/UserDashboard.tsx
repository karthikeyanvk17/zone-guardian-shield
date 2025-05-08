
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/components/auth/AuthContext';
import MapComponent, { RestrictedZone } from '@/components/map/MapComponent';
import { Menu, X, Settings, LogOut, Camera, MapPin, Bell, Lock } from 'lucide-react';
import CameraSimulator from '@/components/camera/CameraSimulator';
import CameraLockControl from '@/components/camera/CameraLockControl';
import { toast } from "@/components/ui/sonner";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [restrictedZones, setRestrictedZones] = useState<RestrictedZone[]>([]);
  const [isInRestrictedZone, setIsInRestrictedZone] = useState(false);
  const [camerasLocked, setCamerasLocked] = useState(false);
  
  // Request camera permission on mount
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          // Stop the stream immediately, we just want to request permission
          stream.getTracks().forEach(track => track.stop());
          toast("Camera Access Granted", {
            description: "Camera can be used in safe zones."
          });
        })
        .catch(err => {
          console.error("Error accessing camera:", err);
          toast("Camera Permission Denied", {
            description: "Please enable camera access for full functionality."
          });
        });
    }
  }, []);
  
  // Load demo restricted zones
  useEffect(() => {
    // Demo zones - in a real app, these would come from an API
    const demoZones: RestrictedZone[] = [
      {
        id: 'zone-1',
        name: 'Office Building',
        lat: 37.7749,
        lng: -122.4194,
        radius: 500, // meters
        createdBy: 'System Admin',
        createdAt: new Date()
      },
      {
        id: 'zone-2',
        name: 'Hospital Area',
        lat: 37.7639,
        lng: -122.4089,
        radius: 300, // meters
        createdBy: 'System Admin',
        createdAt: new Date()
      },
      {
        id: 'zone-3',
        name: 'Government Facility',
        lat: 37.7859,
        lng: -122.4294,
        radius: 400, // meters
        createdBy: 'System Admin',
        createdAt: new Date()
      }
    ];
    
    setRestrictedZones(demoZones);
  }, []);
  
  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          
          toast("Location Detected", {
            description: "Using your real location for zone detection."
          });
        },
        (error) => {
          console.error("Location error:", error);
          toast("Location Access Denied", {
            description: "Using simulated location instead."
          });
        }
      );
    }
  }, []);

  // Handle camera lock toggle
  const handleCameraLockToggle = (locked: boolean) => {
    setCamerasLocked(locked);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hover-scale">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold gradient-text">CaptureShield</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} />
              <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar} 
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-background border-r border-border z-50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto menu-overlay
      `}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Lock className="h-6 w-6 text-primary animate-pulse-shield" />
            <span className="font-bold text-lg">CaptureShield</span>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="px-2 staggered-animation">
          <div className="border-t border-border my-4"></div>
          
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <Camera className="h-5 w-5 mr-3" />
              Camera Status
            </Button>
            
            <Button variant="ghost" className="w-full justify-start">
              <MapPin className="h-5 w-5 mr-3" />
              Restricted Zones
            </Button>
            
            <Button variant="ghost" className="w-full justify-start">
              <Bell className="h-5 w-5 mr-3" />
              Notifications
            </Button>
            
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="h-5 w-5 mr-3" />
              Settings
            </Button>
          </div>
          
          <div className="border-t border-border my-4"></div>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Log Out
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <main className="container py-6 lg:ml-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map card */}
          <Card className="col-span-1 animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary animate-pulse-subtle" />
                <span>Zone Monitoring</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <MapComponent 
                restrictedZones={restrictedZones}
                userLocation={location}
                onZoneStatusChange={setIsInRestrictedZone}
              />
            </CardContent>
          </Card>
          
          {/* Camera card */}
          <Card className="col-span-1 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary animate-pulse-subtle" />
                <span>Camera Simulator</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <CameraSimulator 
                disabled={isInRestrictedZone} 
                globalLock={camerasLocked} 
              />
            </CardContent>
          </Card>
          
          {/* Camera Lock Control */}
          <Card className="col-span-1 lg:col-span-2 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <span>Device Controls</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CameraLockControl 
                onLockChange={handleCameraLockToggle} 
                isLocked={camerasLocked} 
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
