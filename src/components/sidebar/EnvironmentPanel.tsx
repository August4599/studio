
"use client";
import React, { useState } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Globe, Sun, Cloud, Image as ImageIcon, Thermometer, Wind } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EnvironmentPanel = () => {
  // Mock state - replace with actual context/state later
  const [hdriSettings, setHdriSettings] = useState({
    enabled: true, path: '', intensity: 1, rotation: 0,
  });
  const [physicalSkySettings, setPhysicalSkySettings] = useState({
    enabled: false, turbidity: 3, sunPosition: 'manual', azimuth: 180, altitude: 45, intensity: 1,
  });
   const [volumetricSettings, setVolumetricSettings] = useState({
    fogEnabled: false, fogColor: '#CCCCCC', fogDensity: 0.01,
    volumetricLightingEnabled: false, samples: 64,
  });


  return (
    <AccordionItem value="item-environment">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Globe size={18} /> Environment Setup
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-3 p-1 text-xs">
        
        {/* HDRI Settings */}
        <div className="space-y-2 p-2 border rounded-md">
          <div className="flex items-center justify-between">
            <Label className="font-medium flex items-center gap-1.5"><ImageIcon size={14}/> HDRI Lighting (WIP)</Label>
            <Checkbox id="hdri-enabled" checked={hdriSettings.enabled} onCheckedChange={(c)=>setHdriSettings(s=>({...s, enabled:!!c}))} />
          </div>
          {hdriSettings.enabled && (
            <>
              <Button variant="outline" size="sm" className="w-full text-xs h-8">Upload HDRI (.hdr, .exr)</Button>
              {hdriSettings.path && <p className="truncate text-muted-foreground">Current: {hdriSettings.path}</p>}
              <Label htmlFor="hdri-intensity">Intensity: {hdriSettings.intensity.toFixed(2)}</Label>
              <Slider id="hdri-intensity" value={[hdriSettings.intensity]} onValueChange={([v])=>setHdriSettings(s=>({...s, intensity:v}))} min={0} max={5} step={0.05}/>
              <Label htmlFor="hdri-rotation">Rotation: {hdriSettings.rotation}°</Label>
              <Slider id="hdri-rotation" value={[hdriSettings.rotation]} onValueChange={([v])=>setHdriSettings(s=>({...s, rotation:v}))} min={0} max={360} step={1}/>
            </>
          )}
        </div>

        {/* Physical Sky Settings */}
        <div className="space-y-2 p-2 border rounded-md">
          <div className="flex items-center justify-between">
            <Label className="font-medium flex items-center gap-1.5"><Sun size={14}/> Physical Sky (WIP)</Label>
            <Checkbox id="physky-enabled" checked={physicalSkySettings.enabled} onCheckedChange={(c)=>setPhysicalSkySettings(s=>({...s, enabled:!!c}))} />
          </div>
          {physicalSkySettings.enabled && (
            <>
              <Label htmlFor="physky-turbidity">Turbidity: {physicalSkySettings.turbidity.toFixed(1)}</Label>
              <Slider id="physky-turbidity" value={[physicalSkySettings.turbidity]} onValueChange={([v])=>setPhysicalSkySettings(s=>({...s, turbidity:v}))} min={1} max={10} step={0.1}/>
              
              <Label htmlFor="physky-sunpos">Sun Position</Label>
               <Select value={physicalSkySettings.sunPosition} onValueChange={v=>setPhysicalSkySettings(s=>({...s, sunPosition:v}))}>
                <SelectTrigger id="physky-sunpos" className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual" className="text-xs">Manual (Azimuth/Altitude)</SelectItem>
                  <SelectItem value="datetime" className="text-xs" disabled>Date, Time & Location</SelectItem>
                </SelectContent>
              </Select>
              {physicalSkySettings.sunPosition === 'manual' && (
                <div className="grid grid-cols-2 gap-2">
                    <div><Label htmlFor="physky-azimuth">Azimuth: {physicalSkySettings.azimuth}°</Label><Slider id="physky-azimuth" value={[physicalSkySettings.azimuth]} onValueChange={([v])=>setPhysicalSkySettings(s=>({...s, azimuth:v}))} min={0} max={360} step={1}/></div>
                    <div><Label htmlFor="physky-altitude">Altitude: {physicalSkySettings.altitude}°</Label><Slider id="physky-altitude" value={[physicalSkySettings.altitude]} onValueChange={([v])=>setPhysicalSkySettings(s=>({...s, altitude:v}))} min={-90} max={90} step={1}/></div>
                </div>
              )}
              <Label htmlFor="physky-intensity">Sun Intensity: {physicalSkySettings.intensity.toFixed(2)}</Label>
              <Slider id="physky-intensity" value={[physicalSkySettings.intensity]} onValueChange={([v])=>setPhysicalSkySettings(s=>({...s, intensity:v}))} min={0} max={5} step={0.05}/>
            </>
          )}
        </div>
        
        {/* Volumetric Effects */}
        <div className="space-y-2 p-2 border rounded-md">
            <Label className="font-medium flex items-center gap-1.5"><Cloud size={14}/> Volumetric Effects (WIP)</Label>
             <div className="flex items-center justify-between">
                <Label htmlFor="vol-fog-enabled" className="font-normal">Enable Fog</Label>
                <Checkbox id="vol-fog-enabled" checked={volumetricSettings.fogEnabled} onCheckedChange={c=>setVolumetricSettings(s=>({...s, fogEnabled:!!c}))}/>
            </div>
            {volumetricSettings.fogEnabled && (
                <>
                    <Label htmlFor="vol-fog-color">Fog Color</Label>
                    <Input type="color" id="vol-fog-color" value={volumetricSettings.fogColor} onChange={e=>setVolumetricSettings(s=>({...s, fogColor:e.target.value}))} className="h-7 w-full"/>
                    <Label htmlFor="vol-fog-density">Fog Density: {volumetricSettings.fogDensity.toFixed(3)}</Label>
                    <Slider id="vol-fog-density" value={[volumetricSettings.fogDensity]} onValueChange={([v])=>setVolumetricSettings(s=>({...s, fogDensity:v}))} min={0} max={0.1} step={0.001}/>
                </>
            )}
            <div className="flex items-center justify-between pt-1 border-t mt-2">
                <Label htmlFor="vol-lighting-enabled" className="font-normal">Enable Volumetric Lighting</Label>
                <Checkbox id="vol-lighting-enabled" checked={volumetricSettings.volumetricLightingEnabled} onCheckedChange={c=>setVolumetricSettings(s=>({...s, volumetricLightingEnabled:!!c}))}/>
            </div>
             {volumetricSettings.volumetricLightingEnabled && (
                <>
                    <Label htmlFor="vol-lighting-samples">Samples: {volumetricSettings.samples}</Label>
                    <Slider id="vol-lighting-samples" value={[volumetricSettings.samples]} onValueChange={([v])=>setVolumetricSettings(s=>({...s, samples:v}))} min={8} max={256} step={8}/>
                </>
            )}
        </div>


        {/* Placeholder for Other Effects like Wind, Rain (D5 Inspired) */}
        <div className="p-2 border rounded-md text-muted-foreground">
            <Label className="font-medium flex items-center gap-1.5"><Wind size={14}/> Weather Effects (Future)</Label>
            <p className="italic">Configure wind, rain, snow, etc.</p>
        </div>


        <p className="text-xs text-muted-foreground text-center pt-1 italic">Environment settings for rendering mode. Most are WIP.</p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default EnvironmentPanel;
