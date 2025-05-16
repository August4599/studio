
"use client";

import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Video, SlidersHorizontal, CameraIcon, Aperture, Settings, RadioTower, Sparkles } from "lucide-react"; 
import { Slider } from "@/components/ui/slider";
import { useScene } from "@/context/scene-context";
import type { CameraSettings, CameraType } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";


const CameraSettingsPanel = () => {
  const { cameraSettings = {} as CameraSettings, updateCameraSettings } = useScene();

  const handleSettingChange = (field: keyof CameraSettings, value: any) => {
    updateCameraSettings({ [field]: value });
  };

  const handleNestedSettingChange = (mainField: keyof CameraSettings, subField: string, value: any) => {
    updateCameraSettings({
        [mainField]: {
            ...(cameraSettings[mainField] as any || {}),
            [subField]: value
        }
    });
  };


  return (
    <AccordionItem value="item-camera-settings">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <CameraIcon size={18} /> Camera Settings
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-3 p-1 text-xs">
        <ScrollArea className="h-[calc(100vh-200px)] p-1"> {/* Adjust height as needed */}
          <div className="space-y-3">
        
        <Accordion type="single" collapsible className="w-full border rounded-md" defaultValue="camera-basic-sub">
            <AccordionItem value="camera-basic-sub" className="border-b-0">
                <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center gap-1.5"><Settings size={14}/> Basic Settings</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    <Label htmlFor="camera-type">Camera Type</Label>
                    <Select value={cameraSettings.type || 'standard'} onValueChange={(val) => handleSettingChange('type', val as CameraType)} >
                        <SelectTrigger id="camera-type" className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="standard" className="text-xs">Standard (Perspective)</SelectItem>
                            <SelectItem value="orthographic" className="text-xs">Orthographic (WIP)</SelectItem>
                            <SelectItem value="physical_concept" className="text-xs">Physical Camera (WIP)</SelectItem>
                            <SelectItem value="panoramic_vr_concept" className="text-xs">Panoramic / VR360 (WIP)</SelectItem>
                        </SelectContent>
                    </Select>
                    <Label htmlFor="camera-fov">Field of View (FOV): {(cameraSettings.fov || 60).toFixed(0)}°</Label>
                    <Slider id="camera-fov" min={10} max={120} step={1} value={[cameraSettings.fov || 60]} onValueChange={([val]) => handleSettingChange('fov', val)} />
                    {cameraSettings.type === 'orthographic' && (
                        <><Label htmlFor="ortho-scale">Orthographic Scale (WIP): {(cameraSettings.orthoScale || 10).toFixed(1)}</Label><Slider id="ortho-scale" value={[cameraSettings.orthoScale || 10]} onValueChange={([v]) => handleSettingChange('orthoScale',v)} min={1} max={100} step={0.5} disabled/></>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                        <div><Label htmlFor="near-clip">Near Clip: {(cameraSettings.nearClip || 0.1).toFixed(2)}</Label><Input id="near-clip" type="number" value={cameraSettings.nearClip || 0.1} onChange={e => handleSettingChange('nearClip', parseFloat(e.target.value))} min="0.01" step="0.1" className="h-7 text-xs"/></div>
                        <div><Label htmlFor="far-clip">Far Clip: {(cameraSettings.farClip || 1000).toFixed(0)}</Label><Input id="far-clip" type="number" value={cameraSettings.farClip || 1000} onChange={e => handleSettingChange('farClip', parseFloat(e.target.value))} min="1" step="100" className="h-7 text-xs"/></div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        {/* Physical Camera Properties (WIP) */}
        <Accordion type="single" collapsible className="w-full border rounded-md">
            <AccordionItem value="camera-physical-sub" className="border-b-0">
                <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center gap-1.5"><Aperture size={14}/> Physical Camera (WIP)</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                     <div className="grid grid-cols-2 gap-2">
                        <div><Label htmlFor="sensor-width">Sensor Width (mm)</Label><Input id="sensor-width" type="number" value={cameraSettings.sensorSize?.[0] || 36} onChange={e => handleSettingChange('sensorSize', [parseFloat(e.target.value), cameraSettings.sensorSize?.[1] || 24])} className="h-7 text-xs" disabled/></div>
                        <div><Label htmlFor="sensor-height">Sensor Height (mm)</Label><Input id="sensor-height" type="number" value={cameraSettings.sensorSize?.[1] || 24} onChange={e => handleSettingChange('sensorSize', [cameraSettings.sensorSize?.[0] || 36, parseFloat(e.target.value)])} className="h-7 text-xs" disabled/></div>
                    </div>
                    <Label htmlFor="focal-length">Focal Length (mm)</Label><Input id="focal-length" type="number" value={cameraSettings.focalLength || 50} onChange={e => handleSettingChange('focalLength', parseFloat(e.target.value))} className="h-7 text-xs" disabled/>
                    <Label htmlFor="f-stop">F-Stop (Aperture)</Label><Input id="f-stop" type="number" value={cameraSettings.fStop || 2.8} onChange={e => handleSettingChange('fStop', parseFloat(e.target.value))} step="0.1" min="0.5" className="h-7 text-xs" disabled/>
                    <Label htmlFor="shutter-speed">Shutter Speed (1/s)</Label><Input id="shutter-speed" type="number" value={cameraSettings.shutterSpeed || 100} onChange={e => handleSettingChange('shutterSpeed', parseInt(e.target.value))} className="h-7 text-xs" disabled/>
                    <Label htmlFor="iso">ISO</Label><Input id="iso" type="number" value={cameraSettings.iso || 100} onChange={e => handleSettingChange('iso', parseInt(e.target.value))} step="50" className="h-7 text-xs" disabled/>
                    <Label htmlFor="white-balance">White Balance (K)</Label><Input id="white-balance" type="number" value={cameraSettings.whiteBalance || 6500} onChange={e => handleSettingChange('whiteBalance', parseInt(e.target.value))} step="100" className="h-7 text-xs" disabled/>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        
        {/* Depth of Field (WIP) */}
        <Accordion type="single" collapsible className="w-full border rounded-md">
            <AccordionItem value="camera-dof-sub" className="border-b-0">
                <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center gap-1.5"><Sparkles size={14}/> Depth of Field (WIP)</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    <Label htmlFor="focus-distance">Focus Distance</Label><Input id="focus-distance" type="number" value={cameraSettings.focusDistance || 10} onChange={e => handleSettingChange('focusDistance', parseFloat(e.target.value))} className="h-7 text-xs" disabled/>
                    <Button variant="link" size="xs" className="p-0 h-auto text-xs" disabled>Pick Focus Point (Eyedropper)</Button>
                    <Label htmlFor="aperture-blades">Aperture Blades</Label><Input id="aperture-blades" type="number" value={cameraSettings.apertureBlades || 0} onChange={e => handleSettingChange('apertureBlades', parseInt(e.target.value))} min="0" max="16" step="1" className="h-7 text-xs" disabled/>
                    <Label htmlFor="aperture-rotation">Aperture Rotation (°)</Label><Slider id="aperture-rotation" value={[cameraSettings.apertureRotation || 0]} onValueChange={([v])=>handleSettingChange('apertureRotation',v)} min={0} max={360} step={1} disabled/>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        {/* Motion Blur (WIP) */}
        <Accordion type="single" collapsible className="w-full border rounded-md">
            <AccordionItem value="camera-motionblur-sub" className="border-b-0">
                 <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center gap-1.5"><RadioTower size={14}/> Motion Blur (WIP)</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    <div className="flex items-center justify-between"><Label className="font-normal">Enable Camera Motion Blur</Label><Checkbox checked={cameraSettings.motionBlur?.enabled} onCheckedChange={c => handleNestedSettingChange('motionBlur', 'enabled', !!c)} disabled/></div>
                    {cameraSettings.motionBlur?.enabled && (
                        <>
                        <Label htmlFor="shutter-angle">Shutter Angle (°)</Label><Input id="shutter-angle" type="number" value={cameraSettings.motionBlur.shutterAngle || 180} onChange={e => handleNestedSettingChange('motionBlur', 'shutterAngle', parseFloat(e.target.value))} min="1" max="360" className="h-7 text-xs" disabled/>
                        <Label htmlFor="motionblur-samples">Samples</Label><Input id="motionblur-samples" type="number" value={cameraSettings.motionBlur.samples || 16} onChange={e => handleNestedSettingChange('motionBlur', 'samples', parseInt(e.target.value))} min="2" max="64" step="2" className="h-7 text-xs" disabled/>
                        </>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        {/* Lens Distortion (WIP) */}
        <Accordion type="single" collapsible className="w-full border rounded-md">
            <AccordionItem value="camera-lensdistortion-sub" className="border-b-0">
                 <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center gap-1.5"><Settings size={14}/> Lens Distortion (WIP)</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                     <div className="flex items-center justify-between"><Label className="font-normal">Enable Lens Distortion</Label><Checkbox checked={cameraSettings.lensDistortion?.enabled} onCheckedChange={c => handleNestedSettingChange('lensDistortion', 'enabled', !!c)} disabled/></div>
                     {cameraSettings.lensDistortion?.enabled && (
                        <div className="grid grid-cols-2 gap-2">
                            <div><Label>K1</Label><Input type="number" value={cameraSettings.lensDistortion.k1 || 0} step="0.01" className="h-7 text-xs" disabled/></div>
                            <div><Label>K2</Label><Input type="number" value={cameraSettings.lensDistortion.k2 || 0} step="0.01" className="h-7 text-xs" disabled/></div>
                            <div><Label>K3 (WIP)</Label><Input type="number" value={cameraSettings.lensDistortion.k3 || 0} step="0.01" className="h-7 text-xs" disabled/></div>
                            <div><Label>P1 (WIP)</Label><Input type="number" value={cameraSettings.lensDistortion.p1 || 0} step="0.01" className="h-7 text-xs" disabled/></div>
                            <div><Label>P2 (WIP)</Label><Input type="number" value={cameraSettings.lensDistortion.p2 || 0} step="0.01" className="h-7 text-xs" disabled/></div>
                        </div>
                     )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        
        {/* Render Region (WIP) */}
        <Accordion type="single" collapsible className="w-full border rounded-md">
            <AccordionItem value="camera-renderregion-sub" className="border-b-0">
                 <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center gap-1.5"><SlidersHorizontal size={14}/> Render Region (WIP)</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                     <div className="flex items-center justify-between"><Label className="font-normal">Enable Render Region</Label><Checkbox checked={cameraSettings.renderRegion?.enabled} onCheckedChange={c => handleNestedSettingChange('renderRegion', 'enabled', !!c)} disabled/></div>
                     {cameraSettings.renderRegion?.enabled && (
                        <div className="grid grid-cols-2 gap-2">
                            <div><Label>Min X (0-1)</Label><Input type="number" value={cameraSettings.renderRegion.minX || 0} step="0.01" min="0" max="1" className="h-7 text-xs" disabled/></div>
                            <div><Label>Min Y (0-1)</Label><Input type="number" value={cameraSettings.renderRegion.minY || 0} step="0.01" min="0" max="1" className="h-7 text-xs" disabled/></div>
                            <div><Label>Max X (0-1)</Label><Input type="number" value={cameraSettings.renderRegion.maxX || 1} step="0.01" min="0" max="1" className="h-7 text-xs" disabled/></div>
                            <div><Label>Max Y (0-1)</Label><Input type="number" value={cameraSettings.renderRegion.maxY || 1} step="0.01" min="0" max="1" className="h-7 text-xs" disabled/></div>
                            <Button variant="outline" size="xs" className="col-span-2 h-7 text-[10px]" disabled>Select Region in Viewport</Button>
                        </div>
                     )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        </div>
        </ScrollArea>
      </AccordionContent>
    </AccordionItem>
  );
};

export default CameraSettingsPanel;
