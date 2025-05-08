
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Camera, CameraOff, Lock, LockOpen } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface CameraLockControlProps {
  onLockChange: (locked: boolean) => void;
  isLocked: boolean;
}

const CameraLockControl: React.FC<CameraLockControlProps> = ({ 
  onLockChange, 
  isLocked 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleToggleLock = () => {
    setIsAnimating(true);
    
    // Toggle lock state with animation
    setTimeout(() => {
      const newLockState = !isLocked;
      onLockChange(newLockState);
      
      toast(newLockState ? "Cameras Locked" : "Cameras Unlocked", {
        description: newLockState 
          ? "All camera access has been disabled on this device." 
          : "Camera access has been re-enabled on this device.",
      });
      
      setIsAnimating(false);
    }, 600);
  };

  return (
    <div className={`
      rounded-lg border border-border p-4 transition-all duration-500
      ${isAnimating ? 'animate-pulse' : ''}
      ${isLocked ? 'bg-destructive/5' : 'bg-muted'}
    `}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center
            ${isLocked 
              ? 'bg-destructive/20 text-destructive animate-pulse' 
              : 'bg-muted-foreground/20 text-muted-foreground'
            }
          `}>
            {isLocked ? (
              <CameraOff className="w-5 h-5 animate-pulse" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-medium">Camera Lock</h3>
            <p className="text-sm text-muted-foreground">
              {isLocked 
                ? "All cameras are currently locked" 
                : "Cameras are currently enabled"
              }
            </p>
          </div>
        </div>
        
        <Switch 
          checked={isLocked} 
          onCheckedChange={handleToggleLock} 
          className={`${isLocked ? 'data-[state=checked]:bg-destructive' : ''}`}
        />
      </div>
      
      <div className={`
        mt-4 p-3 rounded-md
        ${isLocked 
          ? 'bg-destructive/10 border border-destructive/20' 
          : 'bg-transparent'
        }
        ${isLocked ? 'animate-fade-in' : 'hidden'}
      `}>
        <div className="flex items-start gap-2">
          <Lock className="w-4 h-4 mt-0.5 text-destructive" />
          <p className="text-xs">
            When cameras are locked, no applications on this device will be able to access 
            the camera, regardless of location. This overrides zone-based restrictions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CameraLockControl;
