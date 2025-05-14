
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
} from "@/components/ui/select";
import { useScene } from "@/context/scene-context";
import type { RenderSettings } from "@/types";

const RenderSettingsPanel = () => {
  const { renderSettings, updateRenderSettings } = useScene();

  const handleSettingChange = (field: keyof RenderSettings, value: string | number) => {
    updateRenderSettings({ [field]: value });
  };

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
           <Select 
            value={renderSettings.engine} 
            onValueChange={(value) => handleSettingChange('engine', value as 'cycles' | 'eevee')}
           >
            <SelectTrigger id="render-engine" className="h-9 text-sm"> 
              <SelectValue placeholder="Select engine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cycles" className="text-sm">Cycles (Path Tracing - Higher Quality)</SelectItem> 
              <SelectItem value="eevee" className="text-sm">Eevee (Real-time - Faster Preview)</SelectItem> 
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="render-resolution" className="text-xs">Output Resolution</Label>
          <Select 
            value={renderSettings.resolution} 
            onValueChange={(value) => handleSettingChange('resolution', value)}
          >
            <SelectTrigger id="render-resolution" className="h-9 text-sm"> 
              <SelectValue placeholder="Select resolution" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1280x720" className="text-sm">1280x720 (HD 720p)</SelectItem> 
              <SelectItem value="1920x1080" className="text-sm">1920x1080 (Full HD 1080p)</SelectItem> 
              <SelectItem value="2560x1440" className="text-sm">2560x1440 (QHD 1440p)</SelectItem> 
              <SelectItem value="3840x2160" className="text-sm">3840x2160 (4K UHD)</SelectItem> 
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="output-format" className="text-xs">Output Format</Label>
          <Select 
            value={renderSettings.outputFormat} 
            onValueChange={(value) => handleSettingChange('outputFormat', value as 'png' | 'jpeg')}
          >
            <SelectTrigger id="output-format" className="h-9 text-sm"> 
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png" className="text-sm">PNG (Lossless, Alpha)</SelectItem> 
              <SelectItem value="jpeg" className="text-sm">JPEG (Lossy, Smaller)</SelectItem> 
            </SelectContent>
          </Select>
        </div>


        <div className="space-y-1">
          <Label htmlFor="render-samples" className="text-xs">Render Samples (Cycles)</Label>
          <Input 
            id="render-samples" 
            type="number" 
            value={renderSettings.samples} 
            onChange={(e) => handleSettingChange('samples', parseInt(e.target.value) || 1)} 
            min="1" 
            max="8192" 
            step="16" 
            className="h-9 text-sm" 
            disabled={renderSettings.engine !== "cycles"}
          />
           {renderSettings.engine !== "cycles" && <p className="text-xs text-muted-foreground italic">Sample count primarily affects Cycles engine.</p>}
        </div>

        <div className="space-y-2 border-t pt-3 mt-3">
            <h4 className="font-semibold text-sm flex items-center gap-2"><ListChecks size={16}/> Render Passes (Future)</h4>
            <p className="text-xs text-muted-foreground">Configure individual render passes like Depth, Normal, AO, etc. for compositing.</p>
            <Button variant="outline" size="sm" className="w-full text-sm h-9" disabled>Configure Passes (Coming Soon)</Button> 
        </div>
        

        <Button className="w-full text-sm mt-2 h-9" size="sm" disabled> 
          <Camera size={14} className="mr-2" /> Render Image (Coming Soon)
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Render Passes and Image Rendering are placeholders. Other settings are functional.
        </p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default RenderSettingsPanel;
