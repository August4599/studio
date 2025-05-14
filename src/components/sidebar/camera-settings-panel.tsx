
"use client";

import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Video } from "lucide-react"; 
import { Slider } from "@/components/ui/slider";
import { useScene } from "@/context/scene-context";

const CameraSettingsPanel = () => {
  const { cameraFov, setCameraFov } = useScene();

  return (
    <AccordionItem value="item-camera-settings">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Video size={18} /> Camera Settings
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 p-2">
        <div className="space-y-1">
          <Label htmlFor="camera-fov" className="text-xs">Field of View (FOV): {cameraFov.toFixed(0)}°</Label>
          <Slider
              id="camera-fov"
              min={10} max={120} step={1}
              value={[cameraFov]}
              onValueChange={([val]) => setCameraFov(val)}
            />
        </div>
        
        <div className="space-y-1">
            <Label htmlFor="focal-length" className="text-xs">Focal Length (mm)</Label>
            <Input id="focal-length" type="number" defaultValue="50" className="h-9 text-sm" disabled/> 
        </div>

        <div className="space-y-1">
            <Label htmlFor="depth-of-field" className="text-xs">Depth of Field (Placeholder)</Label>
            <p className="text-xs text-muted-foreground">Controls for aperture, focus distance, etc. (Future Development)</p>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          Focal length and Depth of Field are for demonstration.
        </p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default CameraSettingsPanel;
