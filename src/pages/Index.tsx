
import React from 'react';
import { AuthProvider, useAuth } from '@/components/auth/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import UserDashboard from '@/components/dashboard/UserDashboard';
import { Shield, Lock, MapPin, Camera, Users } from 'lucide-react';

const AppContent = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col">
        <header className="container py-8">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary animate-pulse-shield" />
            <h1 className="text-3xl font-bold gradient-text">CaptureShield</h1>
          </div>
        </header>
        
        <main className="flex-1 container flex flex-col md:flex-row items-center gap-8 py-12">
          <div className="w-full md:w-1/2 space-y-6">
            <h2 className="text-4xl font-bold">Secure Area <span className="gradient-text">Camera Protection</span></h2>
            <p className="text-lg text-muted-foreground">
              CaptureShield automatically disables camera functionality in restricted geofenced areas,
              ensuring security and privacy where it matters most.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3 staggered-animation">
                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Automatic Protection</h3>
                  <p className="text-sm text-muted-foreground">
                    Camera automatically disabled in restricted zones
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 staggered-animation">
                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Geofencing</h3>
                  <p className="text-sm text-muted-foreground">
                    Precisely define areas where cameras are restricted
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 staggered-animation">
                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                  <Camera className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">All Camera Apps</h3>
                  <p className="text-sm text-muted-foreground">
                    Blocks all camera apps, not just the system camera
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 staggered-animation">
                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Admin Controls</h3>
                  <p className="text-sm text-muted-foreground">
                    Admins can define and manage restricted areas
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 mt-8 md:mt-0">
            <LoginForm />
          </div>
        </main>
        
        <footer className="container py-6 text-center text-sm text-muted-foreground">
          <p>CaptureShield Demo - A secure camera management solution</p>
        </footer>
      </div>
    );
  }

  // Render the appropriate dashboard based on user role
  return user?.role === "admin" ? <AdminDashboard /> : <UserDashboard />;
};

const Index = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default Index;
