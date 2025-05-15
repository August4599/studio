
"use client";
import React, { useState } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Globe, Sun, Cloud, Image as ImageIcon, Thermometer, Wind, Mountain, MapPin, CalendarDays, ClockIcon, Waves } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScene } from '@/context/scene-context'; // WIP: To connect to scene context later
import type { EnvironmentSettings } from '@/types'; // WIP: To use proper types

const EnvironmentPanel = () => {
  // Mock state - replace with actual context/state later
  // const { environmentSettings, updateEnvironmentSettings } = useScene(); // Example for future
  const [envSettings, setEnvSettings] = useState<EnvironmentSettings>({ // Using local state for now
    backgroundMode: 'hdri',
    backgroundColor: '#333333',
    hdriPath: '',
    hdriIntensity: 1,
    hdriRotation: 0,
    usePhysicalSky: true,
    physicalSkySettings: {
        turbidity: 3, sunPositionMode: 'manual', azimuth: 180, altitude: 45, intensity: 1,
        sunDiskSize: 0.5, groundAlbedo: 0.3,
    },
    fog: { enabled: false, color: '#CCCCCC', density: 0.01, heightFog: false, heightFalloff: 0.5, startDistance: 10, endDistance: 1000 },
    volumetricLighting: { enabled: false, samples: 64, scattering: 0.5 },
    atmosphere: { haze: 0.1, ozone: 0.3 },
    weatherEffects: { rain: { enabled: false, intensity: 0.5, puddleAmount: 0.2 }, snow: {enabled: false, accumulation: 0.1, melting: 0.1} }
  });

  const handleSettingChange = (field: keyof EnvironmentSettings, value: any) => {
    setEnvSettings(prev => ({ ...prev, [field]: value }));
    // updateEnvironmentSettings({ [field]: value }); // Future context update
  };

  const handleNestedSettingChange = (mainField: keyof EnvironmentSettings, subField: string, value: any) => {
    setEnvSettings(prev => ({
      ...prev,
      [mainField]: {
        ...(prev[mainField] as any),
        [subField]: value,
      }
    }));
  };
  
  const handleDeepNestedSettingChange = (mainField: keyof EnvironmentSettings, subGroup: string, subField: string, value: any) => {
     setEnvSettings(prev => ({
      ...prev,
      [mainField]: {
        ...(prev[mainField] as any),
        [subGroup]: {
          ...((prev[mainField] as any)[subGroup] || {}),
          [subField]: value
        }
      }
    }));
  };


  return (
    <AccordionItem value="item-environment">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Globe size={18} /> Environment &amp; Sky
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-3 p-1 text-xs">
        
        {/* Background Settings */}
        <Accordion type="single" collapsible className="w-full border rounded-md" defaultValue="background-sub">
            <AccordionItem value="background-sub" className="border-b-0">
                <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center gap-1.5"><ImageIcon size={14}/> Background</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    <Select value={envSettings.backgroundMode} onValueChange={val => handleSettingChange('backgroundMode', val as EnvironmentSettings['backgroundMode'])}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="color" className="text-xs">Solid Color</SelectItem>
                            <SelectItem value="gradient" className="text-xs" disabled>Gradient (WIP)</SelectItem>
                            <SelectItem value="hdri" className="text-xs">HDRI / Environment Map</SelectItem>
                            <SelectItem value="physical_sky" className="text-xs">Physical Sky</SelectItem>
                        </SelectContent>
                    </Select>
                    {envSettings.backgroundMode === 'color' && (
                        <>
                            <Label htmlFor="env-bgcolor">Background Color:</Label>
                            <Input type="color" id="env-bgcolor" value={envSettings.backgroundColor} onChange={e=>handleSettingChange('backgroundColor', e.target.value)} className="h-7 w-full"/>
                        </>
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
                        <Checkbox id="hdri-enabled" checked={envSettings.backgroundMode === 'hdri'} onCheckedChange={(c)=>handleSettingChange('backgroundMode', c ? 'hdri' : 'color')} />
                    </div>
                    {(envSettings.backgroundMode === 'hdri') && (
                        <>
                        <Button variant="outline" size="sm" className="w-full text-xs h-8">Upload HDRI (.hdr, .exr)</Button>
                        {envSettings.hdriPath && <p className="truncate text-muted-foreground">Current: {envSettings.hdriPath}</p>}
                        <Label htmlFor="hdri-intensity">Intensity: {envSettings.hdriIntensity?.toFixed(2)}</Label>
                        <Slider id="hdri-intensity" value={[envSettings.hdriIntensity || 1]} onValueChange={([v])=>handleSettingChange('hdriIntensity',v)} min={0} max={5} step={0.05}/>
                        <Label htmlFor="hdri-rotation">Rotation: {envSettings.hdriRotation?.toFixed(0)}°</Label>
                        <Slider id="hdri-rotation" value={[envSettings.hdriRotation || 0]} onValueChange={([v])=>handleSettingChange('hdriRotation',v)} min={0} max={360} step={1}/>
                         <div className="flex items-center space-x-2"><Checkbox id="hdri-bg" disabled/><Label htmlFor="hdri-bg" className="font-normal text-xs">Visible in Background (WIP)</Label></div>
                         <div className="flex items-center space-x-2"><Checkbox id="hdri-reflect" disabled/><Label htmlFor="hdri-reflect" className="font-normal text-xs">Affect Reflections (WIP)</Label></div>
                        </>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        

        {/* Physical Sky Settings */}
        <Accordion type="single" collapsible className="w-full border rounded-md">
             <AccordionItem value="physky-sub" className="border-b-0">
                 <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center gap-1.5"><Sun size={14}/> Physical Sky (WIP)</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    <div className="flex items-center justify-between">
                        <Label className="font-medium">Use Physical Sky</Label>
                        <Checkbox id="physky-enabled" checked={!!envSettings.usePhysicalSky} onCheckedChange={(c)=>handleSettingChange('usePhysicalSky',!!c)} />
                    </div>
                    {envSettings.usePhysicalSky && envSettings.physicalSkySettings && (
                        <>
                        <Label htmlFor="physky-turbidity">Turbidity: {envSettings.physicalSkySettings.turbidity.toFixed(1)}</Label>
                        <Slider id="physky-turbidity" value={[envSettings.physicalSkySettings.turbidity]} onValueChange={([v])=>handleNestedSettingChange('physicalSkySettings', 'turbidity',v)} min={1} max={10} step={0.1}/>
                        
                        <Label htmlFor="physky-sunpos">Sun Position Mode</Label>
                        <Select value={envSettings.physicalSkySettings.sunPositionMode} onValueChange={v=>handleNestedSettingChange('physicalSkySettings', 'sunPositionMode',v as any)}>
                            <SelectTrigger id="physky-sunpos" className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                            <SelectItem value="manual" className="text-xs">Manual (Azimuth/Altitude)</SelectItem>
                            <SelectItem value="datetime_location" className="text-xs">Date, Time & Location</SelectItem>
                            </SelectContent>
                        </Select>
                        {envSettings.physicalSkySettings.sunPositionMode === 'manual' && (
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label htmlFor="physky-azimuth">Azimuth: {envSettings.physicalSkySettings.azimuth?.toFixed(0)}°</Label><Slider id="physky-azimuth" value={[envSettings.physicalSkySettings.azimuth || 0]} onValueChange={([v])=>handleNestedSettingChange('physicalSkySettings', 'azimuth',v)} min={0} max={360} step={1}/></div>
                                <div><Label htmlFor="physky-altitude">Altitude: {envSettings.physicalSkySettings.altitude?.toFixed(0)}°</Label><Slider id="physky-altitude" value={[envSettings.physicalSkySettings.altitude || 0]} onValueChange={([v])=>handleNestedSettingChange('physicalSkySettings', 'altitude',v)} min={-90} max={90} step={1}/></div>
                            </div>
                        )}
                         {envSettings.physicalSkySettings.sunPositionMode === 'datetime_location' && (
                            <div className="space-y-2 p-2 border-t mt-2 bg-muted/30 rounded-md">
                                <div className="grid grid-cols-2 gap-2">
                                    <div><Label htmlFor="physky-date"><CalendarDays size={12} className="inline mr-1"/> Date</Label><Input type="date" id="physky-date" value={envSettings.physicalSkySettings.date || ''} onChange={e=>handleNestedSettingChange('physicalSkySettings', 'date', e.target.value)} className="h-7 text-xs"/></div>
                                    <div><Label htmlFor="physky-time"><ClockIcon size={12} className="inline mr-1"/> Time</Label><Input type="time" id="physky-time" value={envSettings.physicalSkySettings.time || ''} onChange={e=>handleNestedSettingChange('physicalSkySettings', 'time', e.target.value)} className="h-7 text-xs"/></div>
                                </div>
                                <div><Label htmlFor="physky-location"><MapPin size={12} className="inline mr-1"/> Location (Lat/Lon)</Label><Input id="physky-location" placeholder="e.g., 40.7128, -74.0060" className="h-7 text-xs" value={`${envSettings.physicalSkySettings.latitude || ''}, ${envSettings.physicalSkySettings.longitude || ''}`} onChange={e => { const [lat, lon] = e.target.value.split(','); handleNestedSettingChange('physicalSkySettings','latitude', parseFloat(lat)); handleNestedSettingChange('physicalSkySettings','longitude', parseFloat(lon))}}/></div>
                                <Button variant="link" size="xs" className="text-xs p-0 h-auto" disabled>Select Location from Map (WIP)</Button>
                            </div>
                         )}
                        <Label htmlFor="physky-intensity">Sun Intensity: {envSettings.physicalSkySettings.intensity.toFixed(2)}</Label>
                        <Slider id="physky-intensity" value={[envSettings.physicalSkySettings.intensity]} onValueChange={([v])=>handleNestedSettingChange('physicalSkySettings', 'intensity',v)} min={0} max={5} step={0.05}/>
                        <Label htmlFor="physky-sundisksize">Sun Disk Size: {envSettings.physicalSkySettings.sunDiskSize?.toFixed(2)}</Label>
                        <Slider id="physky-sundisksize" value={[envSettings.physicalSkySettings.sunDiskSize || 0.5]} onValueChange={([v])=>handleNestedSettingChange('physicalSkySettings', 'sunDiskSize',v)} min={0.1} max={10} step={0.1}/>
                        <Label htmlFor="physky-groundalbedo">Ground Albedo: {envSettings.physicalSkySettings.groundAlbedo?.toFixed(2)}</Label>
                        <Slider id="physky-groundalbedo" value={[envSettings.physicalSkySettings.groundAlbedo || 0.3]} onValueChange={([v])=>handleNestedSettingChange('physicalSkySettings', 'groundAlbedo',v)} min={0} max={1} step={0.01}/>
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
                        <Checkbox id="vol-fog-enabled" checked={envSettings.fog?.enabled} onCheckedChange={c=>handleNestedSettingChange('fog', 'enabled', !!c)}/>
                    </div>
                    {envSettings.fog?.enabled && (
                        <div className="pl-4 space-y-1 border-l ml-2">
                            <Label htmlFor="vol-fog-color">Fog Color</Label>
                            <Input type="color" id="vol-fog-color" value={envSettings.fog.color} onChange={e=>handleNestedSettingChange('fog', 'color', e.target.value)} className="h-7 w-full"/>
                            <Label htmlFor="vol-fog-density">Fog Density: {envSettings.fog.density?.toFixed(3)}</Label>
                            <Slider id="vol-fog-density" value={[envSettings.fog.density || 0.01]} onValueChange={([v])=>handleNestedSettingChange('fog','density',v)} min={0} max={0.1} step={0.001}/>
                            <div className="flex items-center space-x-2"><Checkbox id="vol-heightfog" checked={!!envSettings.fog.heightFog} onCheckedChange={c=>handleNestedSettingChange('fog','heightFog',!!c)}/><Label htmlFor="vol-heightfog" className="font-normal text-xs">Height Fog (D5 Style WIP)</Label></div>
                            {envSettings.fog.heightFog && (
                                <>
                                <Label htmlFor="vol-heightfalloff">Height Falloff: {envSettings.fog.heightFalloff?.toFixed(2)}</Label>
                                <Slider id="vol-heightfalloff" value={[envSettings.fog.heightFalloff || 0.5]} onValueChange={([v])=>handleNestedSettingChange('fog','heightFalloff',v)} min={0.01} max={2} step={0.01}/>
                                </>
                            )}
                            <Label htmlFor="vol-fog-start">Start Distance (Skp): {envSettings.fog.startDistance?.toFixed(0)}</Label>
                            <Slider id="vol-fog-start" value={[envSettings.fog.startDistance || 10]} onValueChange={([v])=>handleNestedSettingChange('fog','startDistance',v)} min={0} max={1000} step={10}/>
                        </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t mt-2">
                        <Label htmlFor="vol-lighting-enabled" className="font-normal">Volumetric Lighting</Label>
                        <Checkbox id="vol-lighting-enabled" checked={envSettings.volumetricLighting?.enabled} onCheckedChange={c=>handleNestedSettingChange('volumetricLighting','enabled',!!c)}/>
                    </div>
                    {envSettings.volumetricLighting?.enabled && (
                        <div className="pl-4 space-y-1 border-l ml-2">
                            <Label htmlFor="vol-lighting-samples">Samples: {envSettings.volumetricLighting.samples}</Label>
                            <Slider id="vol-lighting-samples" value={[envSettings.volumetricLighting.samples || 64]} onValueChange={([v])=>handleNestedSettingChange('volumetricLighting','samples',v)} min={8} max={256} step={8}/>
                             <Label htmlFor="vol-lighting-scattering">Scattering: {envSettings.volumetricLighting.scattering?.toFixed(2)}</Label>
                            <Slider id="vol-lighting-scattering" value={[envSettings.volumetricLighting.scattering || 0.5]} onValueChange={([v])=>handleNestedSettingChange('volumetricLighting','scattering',v)} min={0} max={1} step={0.01}/>
                        </div>
                    )}
                    <div className="pt-1 border-t mt-2">
                        <Label className="font-medium">Atmosphere (D5 Style WIP)</Label>
                         <Label htmlFor="atmos-haze">Haze: {envSettings.atmosphere?.haze?.toFixed(2)}</Label>
                        <Slider id="atmos-haze" value={[envSettings.atmosphere?.haze || 0.1]} onValueChange={([v])=>handleNestedSettingChange('atmosphere','haze',v)} min={0} max={1} step={0.01}/>
                        <Label htmlFor="atmos-ozone">Ozone: {envSettings.atmosphere?.ozone?.toFixed(2)}</Label>
                        <Slider id="atmos-ozone" value={[envSettings.atmosphere?.ozone || 0.3]} onValueChange={([v])=>handleNestedSettingChange('atmosphere','ozone',v)} min={0} max={1} step={0.01}/>
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
                        <Checkbox id="weather-rain-enabled" checked={envSettings.weatherEffects?.rain?.enabled} onCheckedChange={c=>handleDeepNestedSettingChange('weatherEffects','rain','enabled', !!c)}/>
                    </div>
                     {envSettings.weatherEffects?.rain?.enabled && (
                        <div className="pl-4 space-y-1 border-l ml-2">
                            <Label>Intensity: {envSettings.weatherEffects.rain.intensity.toFixed(2)}</Label><Slider value={[envSettings.weatherEffects.rain.intensity]} onValueChange={([v])=>handleDeepNestedSettingChange('weatherEffects','rain','intensity',v)} min={0} max={1} step={0.01}/>
                            <Label>Puddle Amount: {envSettings.weatherEffects.rain.puddleAmount.toFixed(2)}</Label><Slider value={[envSettings.weatherEffects.rain.puddleAmount]} onValueChange={([v])=>handleDeepNestedSettingChange('weatherEffects','rain','puddleAmount',v)} min={0} max={1} step={0.01}/>
                             <div className="flex items-center space-x-2"><Checkbox id="rain-streaks" disabled/><Label htmlFor="rain-streaks" className="font-normal text-xs">Rain Streaks on Glass (WIP)</Label></div>
                        </div>
                     )}
                    {/* Snow */}
                    <div className="flex items-center justify-between pt-1 border-t mt-2">
                        <Label htmlFor="weather-snow-enabled" className="font-normal">Snow</Label>
                        <Checkbox id="weather-snow-enabled" checked={envSettings.weatherEffects?.snow?.enabled} onCheckedChange={c=>handleDeepNestedSettingChange('weatherEffects','snow','enabled', !!c)}/>
                    </div>
                     {envSettings.weatherEffects?.snow?.enabled && (
                        <div className="pl-4 space-y-1 border-l ml-2">
                            <Label>Accumulation: {envSettings.weatherEffects.snow.accumulation.toFixed(2)}</Label><Slider value={[envSettings.weatherEffects.snow.accumulation]} onValueChange={([v])=>handleDeepNestedSettingChange('weatherEffects','snow','accumulation',v)} min={0} max={1} step={0.01}/>
                            <Label>Melting: {envSettings.weatherEffects.snow.melting.toFixed(2)}</Label><Slider value={[envSettings.weatherEffects.snow.melting]} onValueChange={([v])=>handleDeepNestedSettingChange('weatherEffects','snow','melting',v)} min={0} max={1} step={0.01}/>
                        </div>
                     )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>


        <p className="text-xs text-muted-foreground text-center pt-1 italic">Environment settings primarily affect "Visualize & Export" mode. Many are WIP.</p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default EnvironmentPanel;
