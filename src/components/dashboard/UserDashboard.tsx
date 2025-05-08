
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
  X 
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
            <Button variant="ghost" onClick={logout} size="sm">
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
          
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>
      
      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 menu-overlay flex md:hidden">
          <div className="bg-background w-2/3 h-full shadow-xl p-4 animate-slide-in">
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
                className="w-full justify-start"
              >
                <MapIcon className="h-4 w-4 mr-2" />
                Map View
              </Button>
              
              <Button 
                onClick={() => { setActiveTab("camera"); toggleMenu(); }} 
                variant={activeTab === "camera" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
              
              <Separator />
              
              <Button 
                onClick={logout} 
                variant="outline"
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
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
                    className="w-full justify-start"
                  >
                    <MapIcon className="h-4 w-4 mr-2" />
                    Map View
                  </Button>
                  
                  <Button 
                    onClick={() => setActiveTab("camera")}
                    variant={activeTab === "camera" ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Camera
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Protection Status</h3>
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center justify-between py-1">
                      <span>Camera:</span>
                      <Badge variant={isInRestrictedZone ? "destructive" : "outline"} 
                        className={isInRestrictedZone ? "" : "bg-green-100 text-green-800"}>
                        {isInRestrictedZone ? "Disabled" : "Enabled"}
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
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Camera Protection Active",
                        description: "Your camera will be automatically disabled in restricted zones."
                      });
                    }}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Check Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content Area */}
          <div className="col-span-1 md:col-span-3 space-y-4">
            {isInRestrictedZone && (
              <div className="animate-fade-in">
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-red-700">Restricted Zone Detected</h3>
                      <p className="text-sm text-red-600">
                        Your camera has been automatically disabled in this area.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Tabs Content */}
            <Card className="section-transition">
              <CardHeader className="pb-3">
                <CardTitle>{activeTab === "map" ? "Zone Map" : "Camera Access"}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full justify-start px-6">
                    <TabsTrigger value="map">Map</TabsTrigger>
                    <TabsTrigger value="camera">Camera</TabsTrigger>
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
                            className="flex justify-between items-center p-2 rounded-md border bg-muted/50"
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
                          <CameraSimulator disabled={isInRestrictedZone} />
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
                <span>Status: {isInRestrictedZone ? "In Restricted Zone" : "In Safe Zone"}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
