
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Map as MapIcon, 
  Shield, 
  Lock, 
  User, 
  UserPlus, 
  Settings, 
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';

const AdminDashboard: React.FC = () => {
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
  
  const handleZoneAdded = (zone: RestrictedZone) => {
    setRestrictedZones(prev => [...prev, zone]);
    toast(`New zone created: ${zone.name}`);
  };
  
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
  
  React.useEffect(() => {
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
            <h1 className="text-xl font-bold">CaptureShield Admin</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <User className="h-3 w-3" />
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
                <p className="font-medium">{user?.name} (Admin)</p>
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
                <Lock className="h-4 w-4 mr-2" />
                Camera Simulator
              </Button>
              
              <Button 
                onClick={() => { setActiveTab("users"); toggleMenu(); }} 
                variant={activeTab === "users" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <User className="h-4 w-4 mr-2" />
                Users
              </Button>
              
              <Button 
                onClick={() => { setActiveTab("settings"); toggleMenu(); }} 
                variant={activeTab === "settings" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
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
                <CardTitle className="text-lg">Admin Controls</CardTitle>
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
                    <Lock className="h-4 w-4 mr-2" />
                    Camera Simulator
                  </Button>
                  
                  <Button 
                    onClick={() => setActiveTab("users")}
                    variant={activeTab === "users" ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Users
                  </Button>
                  
                  <Button 
                    onClick={() => setActiveTab("settings")}
                    variant={activeTab === "settings" ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">System Status</h3>
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    <p className="flex items-center justify-between py-1">
                      <span>Active Zones:</span>
                      <span>{restrictedZones.length}</span>
                    </p>
                    <p className="flex items-center justify-between py-1">
                      <span>Registered Users:</span>
                      <span>2</span>
                    </p>
                    <p className="flex items-center justify-between py-1">
                      <span>Offline Mode:</span>
                      <span>Enabled</span>
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => {
                      toast("This feature is not available in the demo");
                    }}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Lock All Cameras
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content Area */}
          <div className="col-span-1 md:col-span-3 space-y-4">
            {/* Status Alert */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Admin Mode Active</AlertTitle>
              <AlertDescription>
                You have full access to manage restricted zones and security settings.
              </AlertDescription>
            </Alert>
            
            {/* Tabs Content */}
            <Card className="section-transition">
              <CardHeader className="pb-3">
                <CardTitle>{activeTab === "map" ? "Restricted Zone Management" : 
                             activeTab === "camera" ? "Camera Monitoring" : 
                             activeTab === "users" ? "User Management" : "System Settings"}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full justify-start px-6">
                    <TabsTrigger value="map">Map</TabsTrigger>
                    <TabsTrigger value="camera">Camera</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="map" className="p-0">
                    <div className="h-[60vh]">
                      <MapComponent 
                        onZoneAdded={handleZoneAdded} 
                        restrictedZones={restrictedZones}
                        userLocation={userLocation}
                        isAdminMode={true}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium mb-2">Active Restricted Zones</h3>
                      <div className="space-y-2">
                        {restrictedZones.map(zone => (
                          <div 
                            key={zone.id} 
                            className="flex justify-between items-center p-2 rounded-md border bg-muted/50"
                          >
                            <div>
                              <p className="font-medium">{zone.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Radius: {zone.radius}m • Created: {zone.createdAt.toLocaleDateString()}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setRestrictedZones(prev => 
                                  prev.filter(item => item.id !== zone.id)
                                );
                                toast(`Zone "${zone.name}" removed`);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="camera" className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium mb-2">Camera Simulator</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          This simulator demonstrates how camera functionality is automatically
                          disabled when a device enters a restricted zone.
                        </p>
                        <div className="h-[40vh]">
                          <CameraSimulator disabled={isInRestrictedZone} />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Camera Status</h3>
                        <Card>
                          <CardContent className="p-4">
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span>Camera Status:</span>
                                <Badge 
                                  variant={isInRestrictedZone ? "destructive" : "outline"}
                                  className={isInRestrictedZone ? "" : "bg-green-100 text-green-800"}
                                >
                                  {isInRestrictedZone ? "Disabled" : "Enabled"}
                                </Badge>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span>Current Zone:</span>
                                <span className="font-medium">
                                  {isInRestrictedZone ? "Restricted Area" : "Safe Zone"}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span>Protected Apps:</span>
                                <span>All Camera Apps</span>
                              </div>
                              
                              <Separator />
                              
                              <Button 
                                className="w-full"
                                onClick={() => {
                                  toast("Camera Protection Active", {
                                    description: "All device cameras are being monitored and will be disabled in restricted zones."
                                  });
                                }}
                              >
                                <Lock className="h-4 w-4 mr-2" />
                                Check Protection Status
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="users" className="p-4">
                    <div className="mb-4 flex justify-between items-center">
                      <h3 className="font-medium">Registered Users</h3>
                      <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add User
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center rounded-md border p-3">
                        <div>
                          <p className="font-medium">Admin User</p>
                          <p className="text-xs text-muted-foreground">admin@captureshield.com</p>
                        </div>
                        <Badge>Admin</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center rounded-md border p-3">
                        <div>
                          <p className="font-medium">Regular User</p>
                          <p className="text-xs text-muted-foreground">user@captureshield.com</p>
                        </div>
                        <Badge variant="outline">User</Badge>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings" className="p-4">
                    <ScrollArea className="h-[50vh] pr-4">
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-medium mb-2">General Settings</h3>
                          <Card>
                            <CardContent className="p-4 space-y-4">
                              <div className="flex justify-between items-center">
                                <span>Offline Mode</span>
                                <Button variant="outline" size="sm">Enabled</Button>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span>Auto-Sync</span>
                                <Button variant="outline" size="sm">Every 30 mins</Button>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span>Notifications</span>
                                <Button variant="outline" size="sm">Enabled</Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-2">Camera Protection</h3>
                          <Card>
                            <CardContent className="p-4 space-y-4">
                              <div className="flex justify-between items-center">
                                <span>Block All Cameras</span>
                                <Button variant="outline" size="sm">When In Zone</Button>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span>Protection Level</span>
                                <Button variant="outline" size="sm">Maximum</Button>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span>Override Password</span>
                                <Button variant="outline" size="sm">Change</Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-2">About</h3>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center mb-4">
                                <Shield className="h-6 w-6 text-primary mr-2" />
                                <h4 className="font-bold">CaptureShield</h4>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Version 1.0.0 (Demo)
                              </p>
                              <p className="text-sm text-muted-foreground mt-2">
                                This is a demonstration of the CaptureShield concept. The actual Android 
                                application would integrate with system-level controls to enforce camera 
                                restrictions in geofenced areas.
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* System Info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground p-2">
              <div className="flex items-center gap-1">
                <Info className="h-3 w-3" />
                <span>CaptureShield Admin Console v1.0</span>
              </div>
              <div>
                <span>Last synced: Just now</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
