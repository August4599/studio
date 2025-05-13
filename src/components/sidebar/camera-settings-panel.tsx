"use client";

import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
import { Video } from "lucide-react"; // Using Video icon for Camera Settings
import { Slider } from "@/components/ui/slider";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"

const CameraSettingsPanel = () => {
  // Placeholder states - replace with actual context/state management
  const [fov, setFov] = React.useState(60);
  // const [cameraType, setCameraType] = React.useState("perspective");

  return (
    <AccordionItem value="item-camera-settings">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Video size={18} /> Camera Settings
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 p-2">
        {/* <div className="space-y-1">
          <Label htmlFor="camera-type" className="text-xs">Camera Type</Label>
          <Select value={cameraType} onValueChange={setCameraType}>
            <SelectTrigger id="camera-type" className="h-9 text-sm"> // Updated size
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="perspective" className="text-sm">Perspective</SelectItem> // Updated text size
              <SelectItem value="orthographic" className="text-sm">Orthographic</SelectItem> // Updated text size
            </SelectContent>
          </Select>
        </div> */}

        <div className="space-y-1">
          <Label htmlFor="camera-fov" className="text-xs">Field of View (FOV): {fov}°</Label>
          <Slider
              id="camera-fov"
              min={10} max={120} step={1}
              value={[fov]}
              onValueChange={([val]) => setFov(val)}
              disabled // Disabled for now as it's a placeholder
            />
        </div>
        
        <div className="space-y-1">
            <Label htmlFor="focal-length" className="text-xs">Focal Length (mm)</Label>
            <Input id="focal-length" type="number" defaultValue="50" className="h-9 text-sm" disabled/> {/* Updated size */}
        </div>

        <div className="space-y-1">
            <Label htmlFor="depth-of-field" className="text-xs">Depth of Field (Placeholder)</Label>
            <p className="text-xs text-muted-foreground">Controls for aperture, focus distance, etc. (Future Development)</p>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          Camera settings are for demonstration. Full functionality is under development. Currently reflects viewport camera.
        </p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default CameraSettingsPanel;
