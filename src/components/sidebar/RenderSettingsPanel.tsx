
"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera, FileImage, ListChecks, Settings, Cpu, CloudCog, SlidersHorizontal, Zap, Palette, Aperture, Film, Image as ImageIcon, Sparkles } from "lucide-react"; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScene } from "@/context/scene-context";
import type { RenderSettings, RenderEngineType, RenderOutputType, RenderPassType } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";


const RenderSettingsPanel = () => {
  const { renderSettings = {} as RenderSettings, updateRenderSettings } = useScene();

  const handleSettingChange = (field: keyof RenderSettings, value: string | number | boolean | undefined | Record<string, any>) => {
    updateRenderSettings({ [field]: value });
  };
  
  const handleNestedSettingChange = (mainField: keyof RenderSettings, subField: string, value: any) => {
    updateRenderSettings({ 
        [mainField]: {
            ...(renderSettings[mainField] as any || {}),
            [subField]: value
        }
    });
  };
  
  const handleDeepNestedSettingChange = (mainField: keyof RenderSettings, subGroup: string, subField: string, value: any) => {
     updateRenderSettings({
        [mainField]: {
            ...(renderSettings[mainField] as any || {}),
            [subGroup]: {
                ...((renderSettings[mainField] as any || {})[subGroup] || {}),
                [subField]: value
            }
        }
     });
  };

  const availableRenderPasses: RenderPassType[] = [
    'beauty', 'z_depth', 'normal', 'ao', 'object_id', 'material_id', 
    'cryptomatte_object', 'cryptomatte_material', 'cryptomatte_asset',
    'reflection', 'refraction', 'diffuse_filter', 'specular', 'gi', 'shadows', 
    'velocity', 'world_position', 'mist', 'emission'
  ];

  return (
    <AccordionItem value="item-render-settings">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Aperture size={18} /> Render Settings
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-3 p-1 text-xs">
        <ScrollArea className="h-[calc(100vh-200px)] p-1"> {/* Adjust height as needed */}
        <div className="space-y-3">

        <Accordion type="multiple" defaultValue={['engine-output', 'quality-sampling']} className="w-full">
            {/* Engine & Output */}
            <AccordionItem value="engine-output">
                <AccordionTrigger className="text-xs hover:no-underline px-2 py-2"><FileImage size={14}/> Engine & Output</AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-1">
                    <Label htmlFor="render-engine">Render Engine</Label>
                    <Select 
                        value={renderSettings.engine} 
                        onValueChange={(value) => handleSettingChange('engine', value as RenderEngineType)}
                    >
                        <SelectTrigger id="render-engine" className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="cycles" className="text-xs">Cycles (Path Tracing)</SelectItem> 
                        <SelectItem value="eevee" className="text-xs">Eevee (Real-time)</SelectItem> 
                        <SelectItem value="path_traced_rt_concept" className="text-xs" disabled>Path Traced RT (D5-like WIP)</SelectItem>
                        <SelectItem value="unreal_pathtracer_concept" className="text-xs" disabled>Unreal Engine PathTracer (WIP)</SelectItem>
                        <SelectItem value="vray_concept" className="text-xs" disabled>V-Ray (WIP)</SelectItem>
                        <SelectItem value="corona_concept" className="text-xs" disabled>Corona (WIP)</SelectItem>
                        <SelectItem value="arnold_concept" className="text-xs" disabled>Arnold (WIP)</SelectItem>
                        </SelectContent>
                    </Select>

                    <Label htmlFor="render-resolution-preset">Output Resolution</Label>
                    <Select 
                        value={renderSettings.resolutionPreset || 'FullHD'} 
                        onValueChange={(value) => handleNestedSettingChange('renderSettings', 'resolutionPreset', value)}
                    >
                        <SelectTrigger id="render-resolution-preset" className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="HD" className="text-xs">1280x720 (HD 720p)</SelectItem> 
                            <SelectItem value="FullHD" className="text-xs">1920x1080 (Full HD 1080p)</SelectItem> 
                            <SelectItem value="2K_QHD" className="text-xs">2560x1440 (QHD 1440p)</SelectItem> 
                            <SelectItem value="4K_UHD" className="text-xs">3840x2160 (4K UHD)</SelectItem> 
                            <SelectItem value="Custom" className="text-xs">Custom</SelectItem> 
                        </SelectContent>
                    </Select>
                    {renderSettings.resolutionPreset === 'Custom' && (
                        <div className="grid grid-cols-2 gap-2 items-center">
                            <Input type="number" placeholder="Width" value={renderSettings.customWidth || 1920} onChange={e=>handleNestedSettingChange('renderSettings', 'customWidth', parseInt(e.target.value))} className="h-7 text-xs"/>
                            <Input type="number" placeholder="Height" value={renderSettings.customHeight || 1080} onChange={e=>handleNestedSettingChange('renderSettings', 'customHeight', parseInt(e.target.value))} className="h-7 text-xs"/>
                            <div className="col-span-2 flex items-center space-x-2"><Checkbox id="aspect-lock" checked={!!renderSettings.aspectRatioLock} onCheckedChange={c => handleNestedSettingChange('renderSettings', 'aspectRatioLock', !!c)}/><Label htmlFor="aspect-lock" className="text-xs font-normal">Lock Aspect Ratio (WIP)</Label></div>
                        </div>
                    )}
                    
                    <Label htmlFor="output-format">Output Format</Label>
                    <Select 
                        value={renderSettings.outputFormat} 
                        onValueChange={(value) => handleSettingChange('outputFormat', value as RenderOutputType)}
                    >
                        <SelectTrigger id="output-format" className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="png" className="text-xs">PNG</SelectItem> 
                        <SelectItem value="jpeg" className="text-xs">JPEG</SelectItem> 
                        <SelectItem value="exr" className="text-xs">EXR (HDR)</SelectItem>
                        <SelectItem value="tiff" className="text-xs">TIFF</SelectItem>
                        <SelectItem value="tga" className="text-xs">TGA</SelectItem>
                        <SelectItem value="mp4" className="text-xs">MP4 (Video)</SelectItem>
                        <SelectItem value="mov" className="text-xs">MOV (Video)</SelectItem>
                        <SelectItem value="avi" className="text-xs">AVI (Video)</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* WIP: Format specific options */}
                     <div className="text-xs text-muted-foreground italic">Format specific options (bit depth, quality, compression) WIP.</div>

                    <Label htmlFor="output-path">Output Path (WIP)</Label>
                    <Input id="output-path" value={renderSettings.outputPath || ""} onChange={e => handleSettingChange('outputPath', e.target.value)} placeholder="e.g., C:/Renders/" className="h-8 text-xs" disabled/>
                    <Label htmlFor="file-name">File Name (WIP)</Label>
                    <Input id="file-name" value={renderSettings.fileName || "render_####"} onChange={e => handleSettingChange('fileName', e.target.value)} placeholder="Use # for frame padding" className="h-8 text-xs" disabled/>
                     <div className="flex items-center space-x-2"><Checkbox id="overwrite-files" checked={!!renderSettings.overwriteExisting} onCheckedChange={c => handleSettingChange('overwriteExisting', !!c)} disabled/><Label htmlFor="overwrite-files" className="text-xs font-normal">Overwrite Existing Files</Label></div>
                </AccordionContent>
            </AccordionItem>

            {/* Quality & Sampling */}
            <AccordionItem value="quality-sampling">
                <AccordionTrigger className="text-xs hover:no-underline px-2 py-2"><Sparkles size={14}/> Quality & Sampling</AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-1">
                    <Label htmlFor="render-samples">Render Samples (Cycles/PT)</Label>
                    <Input id="render-samples" type="number" value={renderSettings.samples || 128} onChange={(e) => handleSettingChange('samples', parseInt(e.target.value))} min="1" max="16384" step="16" className="h-8 text-xs" disabled={renderSettings.engine === 'eevee'}/>
                    
                    <Label htmlFor="render-denoiser">Denoiser (WIP)</Label>
                    <Select value={renderSettings.denoiser || 'none'} onValueChange={v => handleSettingChange('denoiser', v as any)} disabled>
                        <SelectTrigger id="render-denoiser" className="h-8 text-xs"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none" className="text-xs">None</SelectItem>
                            <SelectItem value="optix" className="text-xs">OptiX (NVIDIA)</SelectItem>
                            <SelectItem value="oidn" className="text-xs">OpenImageDenoise (Intel)</SelectItem>
                            <SelectItem value="vray_default_concept" className="text-xs">V-Ray Denoiser</SelectItem>
                            <SelectItem value="d5_default_concept" className="text-xs">D5 AI Denoiser</SelectItem>
                        </SelectContent>
                    </Select>
                     <Label>Denoiser Strength (WIP): {(renderSettings.denoiserStrength || 0.5).toFixed(2)}</Label><Slider value={[renderSettings.denoiserStrength || 0.5]} onValueChange={([v])=>handleSettingChange('denoiserStrength',v)} min={0} max={1} step={0.01} disabled/>

                    <Label htmlFor="time-limit">Time Limit (minutes, WIP)</Label>
                    <Input id="time-limit" type="number" value={renderSettings.timeLimit || 0} onChange={e=>handleSettingChange('timeLimit', parseInt(e.target.value))} min="0" className="h-8 text-xs" placeholder="0 for no limit" disabled/>
                    <Label htmlFor="noise-threshold">Noise Threshold (WIP)</Label>
                    <Input id="noise-threshold" type="number" value={renderSettings.noiseThreshold || 0.01} onChange={e=>handleSettingChange('noiseThreshold', parseFloat(e.target.value))} min="0" max="1" step="0.001" className="h-8 text-xs" disabled/>
                    
                    <div className="flex items-center space-x-2"><Checkbox id="adaptive-sampling" checked={!!renderSettings.adaptiveSampling} onCheckedChange={c=>handleSettingChange('adaptiveSampling', !!c)} disabled/><Label htmlFor="adaptive-sampling" className="text-xs font-normal">Adaptive Sampling (WIP)</Label></div>
                     {renderSettings.adaptiveSampling && (
                        <div className="grid grid-cols-2 gap-2 pl-4">
                            <Input type="number" placeholder="Min Samples" value={renderSettings.adaptiveMinSamples || 0} onChange={e=>handleSettingChange('adaptiveMinSamples', parseInt(e.target.value))} className="h-7 text-xs" disabled/>
                            <Input type="number" placeholder="Max Samples" value={renderSettings.adaptiveMaxSamples || renderSettings.samples || 128} onChange={e=>handleSettingChange('adaptiveMaxSamples', parseInt(e.target.value))} className="h-7 text-xs" disabled/>
                        </div>
                     )}
                </AccordionContent>
            </AccordionItem>
            
            {/* Lighting & Bounces */}
            <AccordionItem value="lighting-bounces">
                <AccordionTrigger className="text-xs hover:no-underline px-2 py-2"><Zap size={14}/> Lighting & Bounces (WIP)</AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-1">
                     <Label htmlFor="gi-mode">Global Illumination Mode</Label>
                    <Select value={renderSettings.giMode || 'path_tracing_gi'} onValueChange={v => handleSettingChange('giMode', v as any)} disabled>
                        <SelectTrigger id="gi-mode" className="h-8 text-xs"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="path_tracing_gi" className="text-xs">Path Tracing (Default)</SelectItem>
                            <SelectItem value="brute_force" className="text-xs">Brute Force</SelectItem>
                            <SelectItem value="irradiance_cache" className="text-xs">Irradiance Cache</SelectItem>
                            <SelectItem value="light_cache" className="text-xs">Light Cache</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2"><Checkbox id="caustics" checked={!!renderSettings.caustics} onCheckedChange={c=>handleSettingChange('caustics', !!c)} disabled/><Label htmlFor="caustics" className="text-xs font-normal">Caustics</Label></div>
                    <Label>Max Bounces (Total, Diffuse, Glossy, etc.)</Label>
                    <div className="p-2 border rounded bg-muted/30 text-muted-foreground">Details here...</div>
                </AccordionContent>
            </AccordionItem>

            {/* Render Elements (AOVs) */}
            <AccordionItem value="render-elements">
                <AccordionTrigger className="text-xs hover:no-underline px-2 py-2"><ListChecks size={14}/> Render Elements (AOVs - WIP)</AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-1">
                    <Label>Select passes to render:</Label>
                    <ScrollArea className="h-24 border rounded p-1">
                        {availableRenderPasses.map(pass => (
                            <div key={pass} className="flex items-center space-x-2">
                                <Checkbox id={`pass-${pass}`} disabled/>
                                <Label htmlFor={`pass-${pass}`} className="font-normal text-xs">{pass.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                            </div>
                        ))}
                    </ScrollArea>
                </AccordionContent>
            </AccordionItem>
            
            {/* Color Management */}
            <AccordionItem value="color-management">
                <AccordionTrigger className="text-xs hover:no-underline px-2 py-2"><Palette size={14}/> Color Management (WIP)</AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-1">
                     <Label>Display Device</Label><Select value={renderSettings.colorManagement?.displayDevice || 'sRGB'} disabled><SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="sRGB">sRGB</SelectItem><SelectItem value="Rec.709">Rec.709</SelectItem><SelectItem value="ACEScg">ACEScg</SelectItem></SelectContent></Select>
                     <Label>View Transform</Label><Select value={renderSettings.colorManagement?.viewTransform || 'Standard'} disabled><SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Standard">Standard</SelectItem><SelectItem value="Filmic">Filmic</SelectItem><SelectItem value="ACES">ACES</SelectItem></SelectContent></Select>
                     <Label>Look</Label><Select value={renderSettings.colorManagement?.look || 'None'} disabled><SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="None">None</SelectItem><SelectItem value="Medium Contrast">Medium Contrast</SelectItem></SelectContent></Select>
                     <Button variant="outline" size="xs" className="w-full h-7 text-[10px]" disabled>Load LUT...</Button>
                     <Label>Exposure: {renderSettings.colorManagement?.exposure || 0}</Label><Slider value={[renderSettings.colorManagement?.exposure || 0]} min={-5} max={5} step={0.1} disabled/>
                     <Label>Gamma: {renderSettings.colorManagement?.gamma || 2.2}</Label><Slider value={[renderSettings.colorManagement?.gamma || 2.2]} min={0.5} max={3.5} step={0.05} disabled/>
                </AccordionContent>
            </AccordionItem>

            {/* Animation Output */}
            <AccordionItem value="animation-output">
                <AccordionTrigger className="text-xs hover:no-underline px-2 py-2"><Film size={14}/> Animation Output (WIP)</AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-1">
                    <Label htmlFor="anim-framerange">Frame Range</Label><Input id="anim-framerange" placeholder="e.g., 1-100, 150" value={renderSettings.animationSettings?.frameRange || ""} className="h-8 text-xs" disabled/>
                    <div className="grid grid-cols-2 gap-2">
                        <div><Label htmlFor="anim-framestep">Frame Step</Label><Input id="anim-framestep" type="number" value={renderSettings.animationSettings?.frameStep || 1} min="1" className="h-7 text-xs" disabled/></div>
                        <div><Label htmlFor="anim-fps">FPS</Label><Input id="anim-fps" type="number" value={renderSettings.animationSettings?.fps || 24} min="1" className="h-7 text-xs" disabled/></div>
                    </div>
                    <Label htmlFor="anim-videocodec">Video Codec</Label>
                    <Select value={renderSettings.animationSettings?.videoCodec || 'h264'} disabled>
                        <SelectTrigger id="anim-videocodec" className="h-8 text-xs"><SelectValue/></SelectTrigger>
                        <SelectContent><SelectItem value="h264">H.264</SelectItem><SelectItem value="prores">ProRes</SelectItem><SelectItem value="h265_hevc">H.265/HEVC</SelectItem></SelectContent>
                    </Select>
                    <Label htmlFor="anim-videobitrate">Video Bitrate (kbps)</Label><Input id="anim-videobitrate" type="number" value={renderSettings.animationSettings?.videoBitrate || 8000} className="h-8 text-xs" disabled/>
                    <div className="flex items-center space-x-2"><Checkbox id="anim-rendersequence" checked={!!renderSettings.animationSettings?.renderSequence} disabled/><Label htmlFor="anim-rendersequence" className="text-xs font-normal">Render Image Sequence</Label></div>
                </AccordionContent>
            </AccordionItem>
            
             {/* Performance */}
            <AccordionItem value="performance">
                <AccordionTrigger className="text-xs hover:no-underline px-2 py-2"><Cpu size={14}/> Performance (WIP)</AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-1">
                     <div className="flex items-center space-x-2"><Checkbox id="distrib-render" checked={!!renderSettings.distributedRendering?.enabled} disabled/><Label htmlFor="distrib-render" className="text-xs font-normal">Distributed Rendering</Label></div>
                     <Input placeholder="Render Nodes (IPs, comma-sep)" className="h-7 text-xs" disabled/>
                     <Label>Threads</Label><Select value={renderSettings.performance?.threads?.toString() || 'auto'} disabled><SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="auto">Auto</SelectItem><SelectItem value="4">4 Threads</SelectItem></SelectContent></Select>
                     <div className="flex items-center space-x-2"><Checkbox id="use-gpu" checked={!!renderSettings.performance?.useGpu} disabled/><Label htmlFor="use-gpu" className="text-xs font-normal">Use GPU Acceleration</Label></div>
                     <Input placeholder="GPU Devices (e.g., 0,1)" className="h-7 text-xs" disabled/>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        <Button className="w-full text-sm mt-2 h-8" size="sm" disabled> 
          <Camera size={14} className="mr-2" /> Render Image / Animation
        </Button>
        <p className="text-xs text-muted-foreground text-center pt-1">
          Many settings are WIP placeholders for future functionality.
        </p>
        </div>
        </ScrollArea>
      </AccordionContent>
    </AccordionItem>
  );
};

export default RenderSettingsPanel;
