import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Map as MapIcon, 
  Shield, 
  Camera, 
  AlertTriangle, 
  Info,
  LogOut, 
  Menu, 
  X,
  Lock,
  Smartphone,
  Bell,
  Share,
  Settings,
  HelpCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MapComponent, { RestrictedZone } from '@/components/map/MapComponent';
import CameraSimulator from '@/components/camera/CameraSimulator';
import { useAuth } from '@/components/auth/AuthContext';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';

const UserDashboard: React.FC = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState("map");
  const [menuOpen, setMenuOpen] = useState(false);
  const [restrictedZones, setRestrictedZones] = useState<RestrictedZone[]>([
    {
      id: "zone-1",
      name: "Office Building",
      lat: 37.7749,
      lng: -122.4194,
      radius: 200,
      createdBy: "Admin User",
      createdAt: new Date()
    }
  ]);
  
  const [userLocation, setUserLocation] = useState({
    lat: 37.7749,
    lng: -122.4194
  });
  
  const [isInRestrictedZone, setIsInRestrictedZone] = useState(false);
  
  // Enhanced feature states
  const [cameraLocked, setCameraLocked] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState("normal");
  
  // Request camera permissions on component mount
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
          toast("Camera Permission Granted", {
            description: "CaptureShield can now manage your camera access."
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
  
  // Get real location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast("Location Updated", {
            description: "Using your real device location"
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
  
  // Function to check if user is in a restricted zone
  const checkUserInRestrictedZone = () => {
    const inZone = restrictedZones.some(zone => {
      // Simple distance calculation for demo
      const latDiff = zone.lat - userLocation.lat;
      const lngDiff = zone.lng - userLocation.lng;
      const distSquared = latDiff * latDiff + lngDiff * lngDiff;
      const radiusInDegrees = zone.radius / 111000; // Rough conversion from meters to degrees
      return distSquared < radiusInDegrees * radiusInDegrees;
    });
    
    setIsInRestrictedZone(inZone);
  };
  
  useEffect(() => {
    checkUserInRestrictedZone();
  }, [userLocation, restrictedZones]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  // Lock all cameras function
  const handleLockAllCameras = () => {
    setCameraLocked(true);
    toast("All Cameras Locked", {
      description: "Camera access is now disabled on your device."
    });
  };
  
  // Unlock cameras function
  const handleUnlockCameras = () => {
    setCameraLocked(false);
    toast("Cameras Unlocked", {
      description: "Normal camera functionality restored."
    });
  };

  return (
    <div className={`min-h-screen bg-background flex flex-col ${animationSpeed === "fast" ? "fast-animations" : ""}`}>
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary animate-pulse-shield" />
            <h1 className="text-xl font-bold">CaptureShield</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <span>{user?.name}</span>
            </Badge>
            <Button variant="ghost" onClick={logout} size="sm" className="hover-scale">
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
          
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>
      
      {/* Mobile Menu Overlay - Fixed to appear above content */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="bg-black/50 backdrop-blur-sm w-full h-full" onClick={toggleMenu}></div>
          <div className="bg-background w-2/3 h-full shadow-xl p-4 animate-slide-in absolute right-0">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-bold">CaptureShield</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Logged in as:</p>
                <p className="font-medium">{user?.name}</p>
              </div>
              
              <Separator />
              
              <Button 
                onClick={() => { setActiveTab("map"); toggleMenu(); }} 
                variant={activeTab === "map" ? "default" : "ghost"}
                className="w-full justify-start hover-scale"
              >
                <MapIcon className="h-4 w-4 mr-2" />
                Map View
              </Button>
              
              <Button 
                onClick={() => { setActiveTab("camera"); toggleMenu(); }} 
                variant={activeTab === "camera" ? "default" : "ghost"}
                className="w-full justify-start hover-scale"
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
              
              <Button
                onClick={() => { setActiveTab("settings"); toggleMenu(); }}
                variant={activeTab === "settings" ? "default" : "ghost"}
                className="w-full justify-start hover-scale"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              
              <Separator />
              
              <Button 
                onClick={logout} 
                variant="outline"
                className="w-full justify-start hover-scale"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              
              <div className="mt-8">
                <Button 
                  onClick={cameraLocked ? handleUnlockCameras : handleLockAllCameras} 
                  variant={cameraLocked ? "outline" : "destructive"}
                  className="w-full justify-center animate-pulse-subtle"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {cameraLocked ? "Unlock Cameras" : "Lock All Cameras"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="flex-1 container py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Left Sidebar - Desktop Only */}
          <div className="hidden md:block col-span-1">
            <Card className="sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Camera Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 staggered-animation">
                  <Button 
                    onClick={() => setActiveTab("map")}
                    variant={activeTab === "map" ? "default" : "ghost"}
                    className="w-full justify-start hover-scale"
                  >
                    <MapIcon className="h-4 w-4 mr-2" />
                    Map View
                  </Button>
                  
                  <Button 
                    onClick={() => setActiveTab("camera")}
                    variant={activeTab === "camera" ? "default" : "ghost"}
                    className="w-full justify-start hover-scale"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Camera
                  </Button>
                  
                  <Button 
                    onClick={() => setActiveTab("settings")}
                    variant={activeTab === "settings" ? "default" : "ghost"}
                    className="w-full justify-start hover-scale"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                <div className="rounded-lg border p-3 animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Protection Status</h3>
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center justify-between py-1">
                      <span>Camera:</span>
                      <Badge variant={(isInRestrictedZone || cameraLocked) ? "destructive" : "outline"} 
                        className={(isInRestrictedZone || cameraLocked) ? "" : "bg-green-100 text-green-800"}>
                        {(isInRestrictedZone || cameraLocked) ? "Disabled" : "Enabled"}
                      </Badge>
                    </div>
                    <p className="flex items-center justify-between py-1">
                      <span>Current Zone:</span>
                      <span>{isInRestrictedZone ? "Restricted" : "Safe"}</span>
                    </p>
                    <p className="flex items-center justify-between py-1">
                      <span>Protected Apps:</span>
                      <span>All Camera Apps</span>
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full hover-scale"
                    onClick={() => {
                      toast("Camera Protection Active", {
                        description: "Your camera will be automatically disabled in restricted zones."
                      });
                    }}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Check Status
                  </Button>
                </div>
                
                <div className="mt-2">
                  <Button 
                    variant={cameraLocked ? "outline" : "destructive"} 
                    className="w-full hover-scale"
                    onClick={cameraLocked ? handleUnlockCameras : handleLockAllCameras}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {cameraLocked ? "Unlock Cameras" : "Lock All Cameras"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content Area */}
          <div className="col-span-1 md:col-span-3 space-y-4">
            {(isInRestrictedZone || cameraLocked) && (
              <div className="animate-fade-in">
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-red-700">
                        {cameraLocked ? "Cameras Manually Locked" : "Restricted Zone Detected"}
                      </h3>
                      <p className="text-sm text-red-600">
                        {cameraLocked 
                          ? "You've manually disabled all camera access." 
                          : "Your camera has been automatically disabled in this area."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Tabs Content */}
            <Card className="section-transition">
              <CardHeader className="pb-3">
                <CardTitle>
                  {activeTab === "map" ? "Zone Map" : 
                   activeTab === "camera" ? "Camera Access" : "Settings"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full justify-start px-6">
                    <TabsTrigger value="map">Map</TabsTrigger>
                    <TabsTrigger value="camera">Camera</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="map" className="p-0">
                    <div className="h-[60vh]">
                      <MapComponent 
                        restrictedZones={restrictedZones}
                        userLocation={userLocation}
                      />
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-medium mb-2">Restricted Zones Near You</h3>
                      <div className="space-y-2">
                        {restrictedZones.map(zone => (
                          <div 
                            key={zone.id} 
                            className="flex justify-between items-center p-2 rounded-md border bg-muted/50 hover-scale transition duration-300"
                          >
                            <div>
                              <p className="font-medium">{zone.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Radius: {zone.radius}m
                              </p>
                            </div>
                            <Badge variant="outline">
                              {isInRestrictedZone ? "You're Inside" : "Nearby"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="camera" className="p-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Camera Access</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Your camera can only be used when you are outside of restricted zones.
                        </p>
                        
                        <div className="h-[50vh] mb-4">
                          <CameraSimulator disabled={isInRestrictedZone || cameraLocked} />
                        </div>
                        
                        <div className="bg-muted p-3 rounded-md text-sm">
                          <p className="font-medium">How this works:</p>
                          <p className="mt-1">
                            The CaptureShield app automatically disables your camera in restricted zones.
                            This is enforced by system-level controls and cannot be bypassed. Your camera
                            will automatically be re-enabled when you leave the restricted area.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings" className="p-4">
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-3">Appearance Settings</h3>
                        
                        <div className="flex justify-between items-center py-2">
                          <span>Animation Speed</span>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant={animationSpeed === "slow" ? "default" : "ghost"} 
                              size="sm"
                              onClick={() => setAnimationSpeed("slow")}
                            >
                              Slow
                            </Button>
                            <Button 
                              variant={animationSpeed === "normal" ? "default" : "ghost"} 
                              size="sm"
                              onClick={() => setAnimationSpeed("normal")}
                            >
                              Normal
                            </Button>
                            <Button 
                              variant={animationSpeed === "fast" ? "default" : "ghost"} 
                              size="sm"
                              onClick={() => setAnimationSpeed("fast")}
                            >
                              Fast
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-3">Notification Settings</h3>
                        
                        <div className="flex justify-between items-center py-2">
                          <span>Zone Entry Notifications</span>
                          <Button 
                            variant={notificationsEnabled ? "default" : "ghost"}
                            size="sm"
                            onClick={() => {
                              setNotificationsEnabled(!notificationsEnabled);
                              toast(notificationsEnabled ? "Notifications Disabled" : "Notifications Enabled");
                            }}
                          >
                            <Bell className="h-4 w-4 mr-1" />
                            {notificationsEnabled ? "Enabled" : "Disabled"}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-3">Security Options</h3>
                        
                        <div className="flex justify-between items-center py-2">
                          <span>Manual Camera Lock</span>
                          <Button 
                            variant={cameraLocked ? "outline" : "destructive"}
                            size="sm"
                            onClick={cameraLocked ? handleUnlockCameras : handleLockAllCameras}
                          >
                            <Lock className="h-4 w-4 mr-1" />
                            {cameraLocked ? "Unlock Cameras" : "Lock Cameras"}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-3">Help & Support</h3>
                        
                        <div className="flex flex-col gap-2">
                          <Button variant="ghost" className="justify-start">
                            <HelpCircle className="h-4 w-4 mr-2" />
                            How It Works
                          </Button>
                          <Button variant="ghost" className="justify-start">
                            <Share className="h-4 w-4 mr-2" />
                            Share Feedback
                          </Button>
                          <Button variant="ghost" className="justify-start">
                            <Smartphone className="h-4 w-4 mr-2" />
                            About Device
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Footer Info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground p-2">
              <div className="flex items-center gap-1">
                <Info className="h-3 w-3" />
                <span>CaptureShield v1.0</span>
              </div>
              <div>
                <span>Status: {(isInRestrictedZone || cameraLocked) ? "Camera Locked" : "Camera Enabled"}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
