
"use client";
import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Globe, Sun, Cloud, Image as ImageIcon, Mountain, MapPin, CalendarDays, ClockIcon, Waves, Wind as WindIcon, Thermometer } from 'lucide-react'; // Added WindIcon, Thermometer
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScene } from '@/context/scene-context'; 
import type { EnvironmentSettings, PhysicalSkyModel } from '@/types'; 
import { ScrollArea } from '../ui/scroll-area';

const EnvironmentPanel = () => {
  const { environmentSettings = {} as EnvironmentSettings, updateRenderSettings: updateEnvironmentSettings } = useScene(); // Assuming updateRenderSettings can update environmentSettings too


  const handleSettingChange = (field: keyof EnvironmentSettings, value: any) => {
    updateEnvironmentSettings({ environmentSettings: { ...environmentSettings, [field]: value } });
  };

  const handleNestedSettingChange = (mainField: keyof EnvironmentSettings, subField: string, value: any) => {
     updateEnvironmentSettings({ 
        environmentSettings: {
          ...environmentSettings,
          [mainField]: {
            ...(environmentSettings[mainField] as any || {}),
            [subField]: value,
          }
        }
    });
  };
  
  const handleDeepNestedSettingChange = (mainField: keyof EnvironmentSettings, subGroup: string, subField: string, value: any) => {
     updateEnvironmentSettings({ 
        environmentSettings: {
            ...environmentSettings,
            [mainField]: {
                ...(environmentSettings[mainField] as any || {}),
                [subGroup]: {
                ...((environmentSettings[mainField] as any || {})[subGroup] || {}),
                [subField]: value
                }
            }
        }
    });
  };


  return (
    <AccordionItem value="item-environment">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Globe size={18} /> Environment
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-3 p-1 text-xs">
        <ScrollArea className="h-[calc(100vh-200px)] p-1"> {/* Adjust height */}
         <div className="space-y-3">

        {/* Background Settings */}
        <Accordion type="single" collapsible className="w-full border rounded-md" defaultValue="background-sub">
            <AccordionItem value="background-sub" className="border-b-0">
                <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center gap-1.5"><ImageIcon size={14}/> Background</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    <Select value={environmentSettings.backgroundMode || 'physical_sky'} onValueChange={val => handleSettingChange('backgroundMode', val as EnvironmentSettings['backgroundMode'])}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="color" className="text-xs">Solid Color</SelectItem>
                            <SelectItem value="gradient" className="text-xs">Gradient</SelectItem>
                            <SelectItem value="hdri" className="text-xs">HDRI / Environment Map</SelectItem>
                            <SelectItem value="physical_sky" className="text-xs">Physical Sky</SelectItem>
                        </SelectContent>
                    </Select>
                    {environmentSettings.backgroundMode === 'color' && (
                        <>
                            <Label htmlFor="env-bgcolor">Background Color:</Label>
                            <Input type="color" id="env-bgcolor" value={environmentSettings.backgroundColor || '#333333'} onChange={e=>handleSettingChange('backgroundColor', e.target.value)} className="h-7 w-full"/>
                        </>
                    )}
                     {environmentSettings.backgroundMode === 'gradient' && (
                        <div className="grid grid-cols-2 gap-2">
                             <div><Label htmlFor="env-gradtop">Top Color:</Label><Input type="color" id="env-gradtop" value={environmentSettings.gradientTopColor || '#87CEEB'} onChange={e=>handleSettingChange('gradientTopColor', e.target.value)} className="h-7 w-full"/></div>
                             <div><Label htmlFor="env-gradbottom">Bottom Color:</Label><Input type="color" id="env-gradbottom" value={environmentSettings.gradientBottomColor || '#F0F8FF'} onChange={e=>handleSettingChange('gradientBottomColor', e.target.value)} className="h-7 w-full"/></div>
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>


        {/* HDRI Settings */}
        <Accordion type="single" collapsible className="w-full border rounded-md">
            <AccordionItem value="hdri-sub" className="border-b-0">
                 <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center gap-1.5"><Mountain size={14}/> HDRI Lighting (WIP)</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    <div className="flex items-center justify-between">
                        <Label className="font-medium">Use HDRI</Label>
                        <Checkbox id="hdri-enabled" checked={environmentSettings.backgroundMode === 'hdri'} onCheckedChange={(c)=>handleSettingChange('backgroundMode', c ? 'hdri' : 'physical_sky')} />
                    </div>
                    {(environmentSettings.backgroundMode === 'hdri') && (
                        <>
                        <Button variant="outline" size="sm" className="w-full text-xs h-8" disabled>Upload HDRI (.hdr, .exr)</Button>
                        {environmentSettings.hdriPath && <p className="truncate text-muted-foreground">Current: {environmentSettings.hdriPath}</p>}
                        <Label htmlFor="hdri-intensity">Intensity: {(environmentSettings.hdriIntensity || 1).toFixed(2)}</Label>
                        <Slider id="hdri-intensity" value={[environmentSettings.hdriIntensity || 1]} onValueChange={([v])=>handleSettingChange('hdriIntensity',v)} min={0} max={5} step={0.05} disabled/>
                        <Label htmlFor="hdri-rotation">Rotation: {(environmentSettings.hdriRotation || 0).toFixed(0)}°</Label>
                        <Slider id="hdri-rotation" value={[environmentSettings.hdriRotation || 0]} onValueChange={([v])=>handleSettingChange('hdriRotation',v)} min={0} max={360} step={1} disabled/>
                         <div className="flex items-center space-x-2"><Checkbox id="hdri-bg" checked={!!environmentSettings.hdriVisibleBackground} onCheckedChange={c=>handleSettingChange('hdriVisibleBackground', !!c)} disabled/><Label htmlFor="hdri-bg" className="font-normal text-xs">Visible in Background</Label></div>
                         <div className="flex items-center space-x-2"><Checkbox id="hdri-lighting" checked={!!environmentSettings.hdriAffectsLighting} onCheckedChange={c=>handleSettingChange('hdriAffectsLighting', !!c)} disabled/><Label htmlFor="hdri-lighting" className="font-normal text-xs">Affects Lighting</Label></div>
                         <div className="flex items-center space-x-2"><Checkbox id="hdri-reflect" checked={!!environmentSettings.hdriAffectsReflections} onCheckedChange={c=>handleSettingChange('hdriAffectsReflections', !!c)} disabled/><Label htmlFor="hdri-reflect" className="font-normal text-xs">Affects Reflections</Label></div>
                        </>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        

        {/* Physical Sky Settings */}
        <Accordion type="single" collapsible className="w-full border rounded-md" defaultValue="physky-sub">
             <AccordionItem value="physky-sub" className="border-b-0">
                 <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center gap-1.5"><Sun size={14}/> Physical Sky (WIP)</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    <div className="flex items-center justify-between">
                        <Label className="font-medium">Use Physical Sky</Label>
                        <Checkbox id="physky-enabled" checked={!!environmentSettings.usePhysicalSky} onCheckedChange={(c)=>handleSettingChange('usePhysicalSky',!!c)} />
                    </div>
                    {environmentSettings.usePhysicalSky && environmentSettings.physicalSkySettings && (
                        <>
                        <Label htmlFor="physky-model">Sky Model</Label>
                        <Select value={environmentSettings.physicalSkySettings.skyModel || 'hosek_wilkie'} onValueChange={v=>handleNestedSettingChange('physicalSkySettings', 'skyModel', v as PhysicalSkyModel)} disabled>
                            <SelectTrigger id="physky-model" className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="hosek_wilkie" className="text-xs">Hosek-Wilkie</SelectItem>
                                <SelectItem value="preetham" className="text-xs">Preetham</SelectItem>
                                <SelectItem value="d5_procedural_concept" className="text-xs">D5 Procedural</SelectItem>
                                <SelectItem value="cie_clear" className="text-xs">CIE Clear Sky</SelectItem>
                                <SelectItem value="cie_overcast" className="text-xs">CIE Overcast Sky</SelectItem>
                            </SelectContent>
                        </Select>
                        <Label htmlFor="physky-turbidity">Turbidity: {(environmentSettings.physicalSkySettings.turbidity || 3).toFixed(1)}</Label>
                        <Slider id="physky-turbidity" value={[environmentSettings.physicalSkySettings.turbidity || 3]} onValueChange={([v])=>handleNestedSettingChange('physicalSkySettings', 'turbidity',v)} min={1} max={10} step={0.1} disabled/>
                        
                        <Label htmlFor="physky-sunpos">Sun Position Mode</Label>
                        <Select value={environmentSettings.physicalSkySettings.sunPositionMode || 'manual'} onValueChange={v=>handleNestedSettingChange('physicalSkySettings', 'sunPositionMode',v as any)} disabled>
                            <SelectTrigger id="physky-sunpos" className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                            <SelectItem value="manual" className="text-xs">Manual (Azimuth/Altitude)</SelectItem>
                            <SelectItem value="datetime_location" className="text-xs">Date, Time & Location</SelectItem>
                            </SelectContent>
                        </Select>
                        {environmentSettings.physicalSkySettings.sunPositionMode === 'manual' && (
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label htmlFor="physky-azimuth">Azimuth: {(environmentSettings.physicalSkySettings.azimuth || 180).toFixed(0)}°</Label><Slider id="physky-azimuth" value={[environmentSettings.physicalSkySettings.azimuth || 180]} onValueChange={([v])=>handleNestedSettingChange('physicalSkySettings', 'azimuth',v)} min={0} max={360} step={1} disabled/></div>
                                <div><Label htmlFor="physky-altitude">Altitude: {(environmentSettings.physicalSkySettings.altitude || 45).toFixed(0)}°</Label><Slider id="physky-altitude" value={[environmentSettings.physicalSkySettings.altitude || 45]} onValueChange={([v])=>handleNestedSettingChange('physicalSkySettings', 'altitude',v)} min={-90} max={90} step={1} disabled/></div>
                            </div>
                        )}
                         {environmentSettings.physicalSkySettings.sunPositionMode === 'datetime_location' && (
                            <div className="space-y-2 p-2 border-t mt-2 bg-muted/30 rounded-md">
                                <div className="grid grid-cols-2 gap-2">
                                    <div><Label htmlFor="physky-date"><CalendarDays size={12} className="inline mr-1"/> Date</Label><Input type="date" id="physky-date" value={environmentSettings.physicalSkySettings.date || ''} onChange={e=>handleNestedSettingChange('physicalSkySettings', 'date', e.target.value)} className="h-7 text-xs" disabled/></div>
                                    <div><Label htmlFor="physky-time"><ClockIcon size={12} className="inline mr-1"/> Time</Label><Input type="time" id="physky-time" value={environmentSettings.physicalSkySettings.time || ''} onChange={e=>handleNestedSettingChange('physicalSkySettings', 'time', e.target.value)} className="h-7 text-xs" disabled/></div>
                                </div>
                                <div><Label htmlFor="physky-location"><MapPin size={12} className="inline mr-1"/> Location (Lat/Lon)</Label><Input id="physky-location" placeholder="e.g., 40.7128, -74.0060" className="h-7 text-xs" value={`${environmentSettings.physicalSkySettings.latitude || ''}, ${environmentSettings.physicalSkySettings.longitude || ''}`} onChange={e => { const [lat, lon] = e.target.value.split(','); handleNestedSettingChange('physicalSkySettings','latitude', parseFloat(lat)); handleNestedSettingChange('physicalSkySettings','longitude', parseFloat(lon))}} disabled/></div>
                                <Button variant="link" size="xs" className="text-xs p-0 h-auto" disabled>Select Location from Map (WIP)</Button>
                            </div>
                         )}
                        <Label htmlFor="physky-intensity">Sun Intensity: {(environmentSettings.physicalSkySettings.intensity || 1).toFixed(2)}</Label>
                        <Slider id="physky-intensity" value={[environmentSettings.physicalSkySettings.intensity || 1]} onValueChange={([v])=>handleNestedSettingChange('physicalSkySettings', 'intensity',v)} min={0} max={5} step={0.05} disabled/>
                        <Label htmlFor="physky-sundisksize">Sun Disk Size: {(environmentSettings.physicalSkySettings.sunDiskSize || 0.5).toFixed(2)}</Label>
                        <Slider id="physky-sundisksize" value={[environmentSettings.physicalSkySettings.sunDiskSize || 0.5]} onValueChange={([v])=>handleNestedSettingChange('physicalSkySettings', 'sunDiskSize',v)} min={0.1} max={10} step={0.1} disabled/>
                        <Label htmlFor="physky-sundiskintensity">Sun Disk Intensity: {(environmentSettings.physicalSkySettings.sunDiskIntensity || 1).toFixed(2)}</Label>
                        <Slider id="physky-sundiskintensity" value={[environmentSettings.physicalSkySettings.sunDiskIntensity || 1]} onValueChange={([v])=>handleNestedSettingChange('physicalSkySettings', 'sunDiskIntensity',v)} min={0} max={5} step={0.05} disabled/>
                        <Label htmlFor="physky-groundalbedo">Ground Albedo: {(environmentSettings.physicalSkySettings.groundAlbedo || 0.3).toFixed(2)}</Label>
                        <Slider id="physky-groundalbedo" value={[environmentSettings.physicalSkySettings.groundAlbedo || 0.3]} onValueChange={([v])=>handleNestedSettingChange('physicalSkySettings', 'groundAlbedo',v)} min={0} max={1} step={0.01} disabled/>
                        <Label htmlFor="physky-ozone">Ozone: {(environmentSettings.physicalSkySettings.ozone || 0.35).toFixed(2)}</Label>
                        <Slider id="physky-ozone" value={[environmentSettings.physicalSkySettings.ozone || 0.35]} onValueChange={([v])=>handleNestedSettingChange('physicalSkySettings', 'ozone',v)} min={0} max={1} step={0.01} disabled/>
                        </>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>

         {/* Ground Plane Settings */}
        <Accordion type="single" collapsible className="w-full border rounded-md">
            <AccordionItem value="groundplane-sub" className="border-b-0">
                 <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center gap-1.5"><Waves size={14}/> Ground Plane (WIP)</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    <div className="flex items-center justify-between">
                        <Label className="font-medium">Enable Ground Plane</Label>
                        <Checkbox id="ground-enabled" checked={!!environmentSettings.groundPlane?.enabled} onCheckedChange={(c)=>handleNestedSettingChange('groundPlane', 'enabled', !!c)} disabled/>
                    </div>
                    {environmentSettings.groundPlane?.enabled && (
                        <>
                         <Label htmlFor="ground-height">Height: {(environmentSettings.groundPlane.height || 0).toFixed(2)}</Label>
                         <Input id="ground-height" type="number" value={environmentSettings.groundPlane.height || 0} onChange={e=>handleNestedSettingChange('groundPlane','height', parseFloat(e.target.value))} className="h-7 text-xs" disabled/>
                         <Label htmlFor="ground-size">Size: {(environmentSettings.groundPlane.size || 100).toFixed(0)}</Label>
                         <Input id="ground-size" type="number" value={environmentSettings.groundPlane.size || 100} onChange={e=>handleNestedSettingChange('groundPlane','size', parseFloat(e.target.value))} className="h-7 text-xs" disabled/>
                         <Label htmlFor="ground-material">Material (Select from scene - WIP)</Label>
                         <Select value={environmentSettings.groundPlane.materialId || ''} disabled><SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger></Select>
                         <div className="flex items-center space-x-2"><Checkbox id="ground-shadows" checked={!!environmentSettings.groundPlane.receiveShadows} onCheckedChange={c=>handleNestedSettingChange('groundPlane','receiveShadows', !!c)} disabled/><Label htmlFor="ground-shadows" className="font-normal text-xs">Receive Shadows</Label></div>
                        </>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        
        {/* Volumetric Effects */}
         <Accordion type="single" collapsible className="w-full border rounded-md">
            <AccordionItem value="volumetric-sub" className="border-b-0">
                 <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center gap-1.5"><Cloud size={14}/> Volumetric Effects (WIP)</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="vol-fog-enabled" className="font-normal">Global Fog</Label>
                        <Checkbox id="vol-fog-enabled" checked={!!environmentSettings.fog?.enabled} onCheckedChange={c=>handleNestedSettingChange('fog', 'enabled', !!c)} disabled/>
                    </div>
                    {environmentSettings.fog?.enabled && (
                        <div className="pl-4 space-y-1 border-l ml-2">
                            <Label htmlFor="vol-fog-color">Fog Color</Label>
                            <Input type="color" id="vol-fog-color" value={environmentSettings.fog.color || '#CCCCCC'} onChange={e=>handleNestedSettingChange('fog', 'color', e.target.value)} className="h-7 w-full" disabled/>
                            <Label htmlFor="vol-fog-density">Fog Density: {(environmentSettings.fog.density || 0.01).toFixed(3)}</Label>
                            <Slider id="vol-fog-density" value={[environmentSettings.fog.density || 0.01]} onValueChange={([v])=>handleNestedSettingChange('fog','density',v)} min={0} max={0.1} step={0.001} disabled/>
                            <div className="flex items-center space-x-2"><Checkbox id="vol-heightfog" checked={!!environmentSettings.fog.heightFog} onCheckedChange={c=>handleNestedSettingChange('fog','heightFog',!!c)} disabled/><Label htmlFor="vol-heightfog" className="font-normal text-xs">Height Fog</Label></div>
                            {environmentSettings.fog.heightFog && (
                                <>
                                <Label htmlFor="vol-heightfalloff">Height Falloff: {(environmentSettings.fog.heightFalloff || 0.5).toFixed(2)}</Label>
                                <Slider id="vol-heightfalloff" value={[environmentSettings.fog.heightFalloff || 0.5]} onValueChange={([v])=>handleNestedSettingChange('fog','heightFalloff',v)} min={0.01} max={2} step={0.01} disabled/>
                                </>
                            )}
                            <Label htmlFor="vol-fog-start">Start Distance: {(environmentSettings.fog.startDistance || 10).toFixed(0)}</Label>
                            <Slider id="vol-fog-start" value={[environmentSettings.fog.startDistance || 10]} onValueChange={([v])=>handleNestedSettingChange('fog','startDistance',v)} min={0} max={1000} step={10} disabled/>
                            <div className="flex items-center space-x-2"><Checkbox id="vol-fog-affectsky" checked={!!environmentSettings.fog.affectSky} onCheckedChange={c=>handleNestedSettingChange('fog','affectSky',!!c)} disabled/><Label htmlFor="vol-fog-affectsky" className="font-normal text-xs">Affect Sky</Label></div>
                        </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t mt-2">
                        <Label htmlFor="vol-lighting-enabled" className="font-normal">Volumetric Lighting</Label>
                        <Checkbox id="vol-lighting-enabled" checked={!!environmentSettings.volumetricLighting?.enabled} onCheckedChange={c=>handleNestedSettingChange('volumetricLighting','enabled',!!c)} disabled/>
                    </div>
                    {environmentSettings.volumetricLighting?.enabled && (
                        <div className="pl-4 space-y-1 border-l ml-2">
                            <Label htmlFor="vol-lighting-samples">Samples: {environmentSettings.volumetricLighting.samples || 64}</Label>
                            <Slider id="vol-lighting-samples" value={[environmentSettings.volumetricLighting.samples || 64]} onValueChange={([v])=>handleNestedSettingChange('volumetricLighting','samples',v)} min={8} max={256} step={8} disabled/>
                             <Label htmlFor="vol-lighting-scattering">Scattering: {(environmentSettings.volumetricLighting.scattering || 0.5).toFixed(2)}</Label>
                            <Slider id="vol-lighting-scattering" value={[environmentSettings.volumetricLighting.scattering || 0.5]} onValueChange={([v])=>handleNestedSettingChange('volumetricLighting','scattering',v)} min={0} max={1} step={0.01} disabled/>
                             <Label htmlFor="vol-lighting-anisotropy">Anisotropy: {(environmentSettings.volumetricLighting.anisotropy || 0).toFixed(2)}</Label>
                            <Slider id="vol-lighting-anisotropy" value={[environmentSettings.volumetricLighting.anisotropy || 0]} onValueChange={([v])=>handleNestedSettingChange('volumetricLighting','anisotropy',v)} min={-1} max={1} step={0.01} disabled/>
                        </div>
                    )}
                    <div className="pt-1 border-t mt-2">
                        <Label className="font-medium">Atmosphere</Label>
                         <Label htmlFor="atmos-haze">Haze: {(environmentSettings.atmosphere?.haze || 0.1).toFixed(2)}</Label>
                        <Slider id="atmos-haze" value={[environmentSettings.atmosphere?.haze || 0.1]} onValueChange={([v])=>handleNestedSettingChange('atmosphere','haze',v)} min={0} max={1} step={0.01} disabled/>
                        <Label htmlFor="atmos-ozone">Ozone (Physical Sky): {(environmentSettings.atmosphere?.ozone || 0.3).toFixed(2)}</Label>
                        <Slider id="atmos-ozone" value={[environmentSettings.atmosphere?.ozone || 0.3]} onValueChange={([v])=>handleNestedSettingChange('atmosphere','ozone',v)} min={0} max={1} step={0.01} disabled/>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        {/* Weather Effects */}
        <Accordion type="single" collapsible className="w-full border rounded-md">
            <AccordionItem value="weather-sub" className="border-b-0">
                 <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center gap-1.5"><WindIcon size={14}/> Weather Effects (D5 Style WIP)</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    {/* Rain */}
                    <div className="flex items-center justify-between">
                        <Label htmlFor="weather-rain-enabled" className="font-normal">Rain</Label>
                        <Checkbox id="weather-rain-enabled" checked={!!environmentSettings.weatherEffects?.rain?.enabled} onCheckedChange={c=>handleDeepNestedSettingChange('weatherEffects','rain','enabled', !!c)} disabled/>
                    </div>
                     {environmentSettings.weatherEffects?.rain?.enabled && (
                        <div className="pl-4 space-y-1 border-l ml-2">
                            <Label>Intensity: {(environmentSettings.weatherEffects.rain.intensity || 0.5).toFixed(2)}</Label><Slider value={[environmentSettings.weatherEffects.rain.intensity || 0.5]} onValueChange={([v])=>handleDeepNestedSettingChange('weatherEffects','rain','intensity',v)} min={0} max={1} step={0.01} disabled/>
                            <Label>Puddle Amount: {(environmentSettings.weatherEffects.rain.puddleAmount || 0.2).toFixed(2)}</Label><Slider value={[environmentSettings.weatherEffects.rain.puddleAmount || 0.2]} onValueChange={([v])=>handleDeepNestedSettingChange('weatherEffects','rain','puddleAmount',v)} min={0} max={1} step={0.01} disabled/>
                             <div className="flex items-center space-x-2"><Checkbox id="rain-streaks" checked={!!environmentSettings.weatherEffects.rain.rainStreaksOnGlass} onCheckedChange={c=>handleDeepNestedSettingChange('weatherEffects','rain','rainStreaksOnGlass', !!c)} disabled/><Label htmlFor="rain-streaks" className="font-normal text-xs">Rain Streaks on Glass</Label></div>
                        </div>
                     )}
                    {/* Snow */}
                    <div className="flex items-center justify-between pt-1 border-t mt-2">
                        <Label htmlFor="weather-snow-enabled" className="font-normal">Snow</Label>
                        <Checkbox id="weather-snow-enabled" checked={!!environmentSettings.weatherEffects?.snow?.enabled} onCheckedChange={c=>handleDeepNestedSettingChange('weatherEffects','snow','enabled', !!c)} disabled/>
                    </div>
                     {environmentSettings.weatherEffects?.snow?.enabled && (
                        <div className="pl-4 space-y-1 border-l ml-2">
                            <Label>Accumulation: {(environmentSettings.weatherEffects.snow.accumulation || 0.1).toFixed(2)}</Label><Slider value={[environmentSettings.weatherEffects.snow.accumulation || 0.1]} onValueChange={([v])=>handleDeepNestedSettingChange('weatherEffects','snow','accumulation',v)} min={0} max={1} step={0.01} disabled/>
                            <Label>Melting: {(environmentSettings.weatherEffects.snow.melting || 0.1).toFixed(2)}</Label><Slider value={[environmentSettings.weatherEffects.snow.melting || 0.1]} onValueChange={([v])=>handleDeepNestedSettingChange('weatherEffects','snow','melting',v)} min={0} max={1} step={0.01} disabled/>
                        </div>
                     )}
                      {/* Wind */}
                    <div className="flex items-center justify-between pt-1 border-t mt-2">
                        <Label htmlFor="weather-wind-enabled" className="font-normal">Wind</Label>
                        <Checkbox id="weather-wind-enabled" checked={!!environmentSettings.weatherEffects?.wind?.enabled} onCheckedChange={c=>handleDeepNestedSettingChange('weatherEffects','wind','enabled', !!c)} disabled/>
                    </div>
                     {environmentSettings.weatherEffects?.wind?.enabled && (
                        <div className="pl-4 space-y-1 border-l ml-2">
                            <Label>Speed: {(environmentSettings.weatherEffects.wind.speed || 5).toFixed(1)} m/s</Label><Slider value={[environmentSettings.weatherEffects.wind.speed || 5]} onValueChange={([v])=>handleDeepNestedSettingChange('weatherEffects','wind','speed',v)} min={0} max={30} step={0.5} disabled/>
                            <Label>Direction: {(environmentSettings.weatherEffects.wind.direction || 0).toFixed(0)}°</Label><Slider value={[environmentSettings.weatherEffects.wind.direction || 0]} onValueChange={([v])=>handleDeepNestedSettingChange('weatherEffects','wind','direction',v)} min={0} max={360} step={1} disabled/>
                            <div className="flex items-center space-x-2"><Checkbox id="wind-foliage" checked={!!environmentSettings.weatherEffects.wind.affectFoliage} onCheckedChange={c=>handleDeepNestedSettingChange('weatherEffects','wind','affectFoliage', !!c)} disabled/><Label htmlFor="wind-foliage" className="font-normal text-xs">Affect Foliage</Label></div>
                        </div>
                     )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>


        <p className="text-xs text-muted-foreground text-center pt-1 italic">Environment settings primarily affect "Visualize & Export" mode. Many are WIP.</p>
      </div>
      </ScrollArea>
      </AccordionContent>
    </AccordionItem>
  );
};

export default EnvironmentPanel;
