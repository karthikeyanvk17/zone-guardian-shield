
import React, { useState, useEffect } from 'react';
import { Camera, X, AlertOctagon, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

interface CameraSimulatorProps {
  disabled: boolean;
  globalLock?: boolean;
}

const CameraSimulator: React.FC<CameraSimulatorProps> = ({ 
  disabled, 
  globalLock = false 
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  
  // Reset camera state when disabled or lock changes
  useEffect(() => {
    if ((disabled || globalLock) && cameraActive) {
      setCameraActive(false);
    }
  }, [disabled, globalLock, cameraActive]);

  const handleToggleCamera = () => {
    if (globalLock) {
      toast.error("Cameras are globally locked", {
        description: "All cameras on this device have been locked by administrator policy.",
        action: {
          label: "Understood",
          onClick: () => {},
        },
      });
      return;
    }
    
    if (disabled) {
      toast.error("Camera is disabled in this restricted zone", {
        description: "Security policy prevents camera usage in this area.",
        action: {
          label: "Understood",
          onClick: () => {},
        },
      });
      return;
    }
    
    setCameraActive(prev => !prev);
    
    if (!cameraActive) {
      toast.success("Camera activated", {
        description: "You are in a safe zone and can use your camera."
      });
    }
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border bg-black flex flex-col items-center justify-center">
      {cameraActive && !disabled && !globalLock ? (
        <>
          {/* Simulated camera view */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800 opacity-90 z-10"></div>
          
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center text-white">
              <Camera className="w-16 h-16 mx-auto mb-4 animate-pulse text-primary" />
              <p className="text-xl font-semibold animate-slide-in-bottom">Camera Simulation</p>
              <p className="text-sm text-gray-300 mt-2 animate-slide-in-bottom delay-150">
                This is a simulation of a working camera
              </p>
              <div className="mt-8 animate-fade-in delay-300">
                <div className="flex justify-center space-x-2">
                  <div className="h-2 w-2 bg-white rounded-full animate-ping"></div>
                  <div className="h-2 w-2 bg-white rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-2 w-2 bg-white rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Camera UI elements */}
          <div className="absolute top-4 right-4 z-30">
            <Button variant="ghost" size="icon" className="rounded-full bg-black/50 text-white" onClick={() => setCameraActive(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Recording indicator */}
          <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-xs text-white">REC</span>
          </div>
        </>
      ) : (
        <div className="text-center p-8 animate-fade-in">
          {globalLock ? (
            <div className="text-destructive">
              <Lock className="w-16 h-16 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-bold animate-slide-in-bottom">Cameras Locked</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto animate-slide-in-bottom delay-100">
                All cameras on this device have been locked by administrator policy.
              </p>
            </div>
          ) : disabled ? (
            <div className="text-destructive">
              <AlertOctagon className="w-16 h-16 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-bold animate-slide-in-bottom">Camera Disabled</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto animate-slide-in-bottom delay-100">
                You are in a restricted zone. Camera functionality is disabled by system policy.
              </p>
            </div>
          ) : (
            <>
              <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-float" />
              <h3 className="text-xl font-bold text-gray-300 animate-slide-in-bottom">Camera Ready</h3>
              <p className="text-sm text-gray-400 mt-2 animate-slide-in-bottom delay-100">
                Tap the button below to activate the camera
              </p>
              <Button 
                onClick={handleToggleCamera}
                className="mt-6 animate-pulse-shield"
                variant="outline"
              >
                <Camera className="h-4 w-4 mr-2" />
                Open Camera
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CameraSimulator;
