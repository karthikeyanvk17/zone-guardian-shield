
import React, { useState, useEffect } from 'react';
import { Camera, X, AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

interface CameraSimulatorProps {
  disabled: boolean;
}

const CameraSimulator: React.FC<CameraSimulatorProps> = ({ disabled }) => {
  const [cameraActive, setCameraActive] = useState(false);
  
  // Reset camera state when disabled changes
  useEffect(() => {
    if (disabled && cameraActive) {
      setCameraActive(false);
    }
  }, [disabled, cameraActive]);

  const handleToggleCamera = () => {
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
      {cameraActive && !disabled ? (
        <>
          {/* Simulated camera view */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800 opacity-90 z-10"></div>
          
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center text-white">
              <Camera className="w-16 h-16 mx-auto mb-4 animate-pulse text-primary" />
              <p className="text-xl font-semibold">Camera Simulation</p>
              <p className="text-sm text-gray-300 mt-2">This is a simulation of a working camera</p>
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
          {disabled ? (
            <div className="text-destructive">
              <AlertOctagon className="w-16 h-16 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-bold">Camera Disabled</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
                You are in a restricted zone. Camera functionality is disabled by system policy.
              </p>
            </div>
          ) : (
            <>
              <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold text-gray-300">Camera Ready</h3>
              <p className="text-sm text-gray-400 mt-2">Tap the button below to activate the camera</p>
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
