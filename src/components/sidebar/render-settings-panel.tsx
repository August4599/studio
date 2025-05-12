
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
import { Camera, FileImage, ListChecks } from "lucide-react"; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const RenderSettingsPanel = () => {
  const [resolution, setResolution] = React.useState("1920x1080");
  const [samples, setSamples] = React.useState(128);
  const [engine, setEngine] = React.useState("cycles"); 
  const [outputFormat, setOutputFormat] = React.useState("png");

  return (
    <AccordionItem value="item-render-settings">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Camera size={18} /> Render Settings
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 p-2">
        <div className="space-y-1">
          <Label htmlFor="render-engine" className="text-xs">Render Engine</Label>
           <Select value={engine} onValueChange={setEngine}>
            <SelectTrigger id="render-engine" className="h-8 text-xs">
              <SelectValue placeholder="Select engine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cycles" className="text-xs">Cycles (Path Tracing - Higher Quality)</SelectItem>
              <SelectItem value="eevee" className="text-xs">Eevee (Real-time - Faster Preview)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="render-resolution" className="text-xs">Output Resolution</Label>
          <Select value={resolution} onValueChange={setResolution}>
            <SelectTrigger id="render-resolution" className="h-8 text-xs">
              <SelectValue placeholder="Select resolution" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1280x720" className="text-xs">1280x720 (HD 720p)</SelectItem>
              <SelectItem value="1920x1080" className="text-xs">1920x1080 (Full HD 1080p)</SelectItem>
              <SelectItem value="2560x1440" className="text-xs">2560x1440 (QHD 1440p)</SelectItem>
              <SelectItem value="3840x2160" className="text-xs">3840x2160 (4K UHD)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="output-format" className="text-xs">Output Format</Label>
          <Select value={outputFormat} onValueChange={setOutputFormat}>
            <SelectTrigger id="output-format" className="h-8 text-xs">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png" className="text-xs">PNG (Lossless, Alpha)</SelectItem>
              <SelectItem value="jpeg" className="text-xs">JPEG (Lossy, Smaller)</SelectItem>
              {/* Future: TIFF, EXR etc. */}
            </SelectContent>
          </Select>
        </div>


        <div className="space-y-1">
          <Label htmlFor="render-samples" className="text-xs">Render Samples (Cycles)</Label>
          <Input 
            id="render-samples" 
            type="number" 
            value={samples} 
            onChange={(e) => setSamples(parseInt(e.target.value) || 1)} 
            min="1" 
            max="8192" // Increased max samples
            step="16" // Common step for samples
            className="h-8 text-xs"
            disabled={engine !== "cycles"}
          />
           {engine !== "cycles" && <p className="text-xs text-muted-foreground italic">Sample count primarily affects Cycles engine.</p>}
        </div>

        <div className="space-y-2 border-t pt-3 mt-3">
            <h4 className="font-semibold text-sm flex items-center gap-2"><ListChecks size={16}/> Render Passes (Future)</h4>
            <p className="text-xs text-muted-foreground">Configure individual render passes like Depth, Normal, AO, etc. for compositing.</p>
            <Button variant="outline" size="sm" className="w-full text-xs" disabled>Configure Passes (Coming Soon)</Button>
        </div>
        

        <Button className="w-full text-xs mt-2" size="sm" disabled>
          <Camera size={14} className="mr-2" /> Render Image (Coming Soon)
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Render settings are for demonstration. Actual rendering functionality is under development.
        </p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default RenderSettingsPanel;
