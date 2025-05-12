
"use client";

import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react"; // Using Camera icon for Render
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const RenderSettingsPanel = () => {
  // Placeholder states - replace with actual context/state management
  const [resolution, setResolution] = React.useState("1920x1080");
  const [samples, setSamples] = React.useState(128);
  const [engine, setEngine] = React.useState("cycles"); // Example engines

  return (
    <AccordionItem value="item-render-settings">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Camera size={18} /> Render Settings
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 p-2">
        <div className="space-y-1">
          <Label htmlFor="render-resolution" className="text-xs">Output Resolution</Label>
          <Select value={resolution} onValueChange={setResolution}>
            <SelectTrigger id="render-resolution" className="h-8 text-xs">
              <SelectValue placeholder="Select resolution" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1280x720" className="text-xs">1280x720 (HD)</SelectItem>
              <SelectItem value="1920x1080" className="text-xs">1920x1080 (Full HD)</SelectItem>
              <SelectItem value="2560x1440" className="text-xs">2560x1440 (QHD)</SelectItem>
              <SelectItem value="3840x2160" className="text-xs">3840x2160 (4K UHD)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="render-samples" className="text-xs">Render Samples</Label>
          <Input 
            id="render-samples" 
            type="number" 
            value={samples} 
            onChange={(e) => setSamples(parseInt(e.target.value) || 1)} 
            min="1" 
            max="4096"
            className="h-8 text-xs"
          />
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="render-engine" className="text-xs">Render Engine</Label>
           <Select value={engine} onValueChange={setEngine}>
            <SelectTrigger id="render-engine" className="h-8 text-xs">
              <SelectValue placeholder="Select engine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cycles" className="text-xs">Cycles (Path Tracing)</SelectItem>
              <SelectItem value="eevee" className="text-xs">Eevee (Real-time)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full text-xs" size="sm" disabled>
          <Camera size={14} className="mr-2" /> Render Image (Coming Soon)
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Render settings are placeholders. Actual rendering functionality is not yet implemented.
        </p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default RenderSettingsPanel;
