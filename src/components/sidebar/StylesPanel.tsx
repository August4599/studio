

"use client";
import React, { useState } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Image as ImageIcon, Palette, Sun, Droplet, Sigma, Edit, Axe, LineChart, MonitorPlay, Type } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StyleSettings, EdgeStyleSettings, FaceStyleSettings, BackgroundStyleSettings, ModellingAidsSettings, FaceStyleType } from '@/types'; // WIP: Import types when defined

const StylesPanel = () => {
  // Mock state - replace with actual context/state later
  const [edgeSettings, setEdgeSettings] = useState<EdgeStyleSettings>({ // Using local state for now
    showEdges: true, edgeColor: '#000000', edgeWidth: 1,
    showProfiles: true, profileColor: '#000000', profileWidth: 2,
    showBackEdges: false, backEdgeColor: '#888888',
    showExtensions: false, extensionLength: 5,
    showEndpoints: false, endpointStyle: 'dot',
    depthCue: false, depthCueStrength: 0.5,
    jitter: false, jitterStrength: 0.2,
  });
  const [faceSettings, setFaceSettings] = useState<FaceStyleSettings>({
    style: 'shaded', frontColor: '#FFFFFF', backColor: '#A0A0A0',
    monochromeColor: '#BBBBBB', xrayOpacity: 0.3, showTextures: false,
  });
  const [backgroundSettings, setBackgroundSettings] = useState<BackgroundStyleSettings>({
    useSky: false, skyColor: '#DDEEFF', useGround: false, groundColor: '#AAAAAA',
    useHorizonGradient: false, horizonColor: '#C0C0C0', backgroundColor: '#F0F0F0',
    useEnvironmentImage: false, 
  });
  const [modellingAids, setModellingAids] = useState<ModellingAidsSettings>({
      displayGuidelines: true, guidelineColor: '#FF00FF',
      displaySectionFill: true, sectionFillColor: '#FFA500',
      displaySectionLines: true, sectionLineColor: '#FF0000', sectionLineWidth: 2,
      displayModelAxes: true, axesOriginColor: '#FF0000',
  });

  return (
    <AccordionItem value="item-styles">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <MonitorPlay size={18} /> Display Styles
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-3 p-1 text-xs">
        
        {/* Edge Settings */}
        <Accordion type="single" collapsible className="w-full border rounded-md" defaultValue="edge-style-sub">
          <AccordionItem value="edge-style-sub" className="border-b-0">
            <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
              <div className="flex items-center gap-1.5"><Edit size={14}/> Edge Settings</div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 p-2 pt-0">
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                <div className="flex items-center space-x-2"><Checkbox id="style-edges" checked={edgeSettings.showEdges} onCheckedChange={(c)=>setEdgeSettings(s=>({...s, showEdges:!!c}))} /><Label htmlFor="style-edges" className="font-normal">Edges</Label></div>
                <div className="flex items-center space-x-2"><Checkbox id="style-profiles" checked={edgeSettings.showProfiles} onCheckedChange={(c)=>setEdgeSettings(s=>({...s, showProfiles:!!c}))} disabled={!edgeSettings.showEdges}/><Label htmlFor="style-profiles" className="font-normal">Profiles</Label></div>
                <div className="flex items-center space-x-2"><Checkbox id="style-backedges" checked={edgeSettings.showBackEdges} onCheckedChange={(c)=>setEdgeSettings(s=>({...s, showBackEdges:!!c}))} disabled={!edgeSettings.showEdges}/><Label htmlFor="style-backedges" className="font-normal">Back Edges (WIP)</Label></div>
                <div className="flex items-center space-x-2"><Checkbox id="style-extensions" checked={edgeSettings.showExtensions} onCheckedChange={(c)=>setEdgeSettings(s=>({...s, showExtensions:!!c}))} disabled={!edgeSettings.showEdges}/><Label htmlFor="style-extensions" className="font-normal">Extensions (WIP)</Label></div>
                <div className="flex items-center space-x-2"><Checkbox id="style-endpoints" checked={edgeSettings.showEndpoints} onCheckedChange={(c)=>setEdgeSettings(s=>({...s, showEndpoints:!!c}))} disabled={!edgeSettings.showEdges}/><Label htmlFor="style-endpoints" className="font-normal">Endpoints (WIP)</Label></div>
                <div className="flex items-center space-x-2"><Checkbox id="style-depthcue" checked={edgeSettings.depthCue} onCheckedChange={(c)=>setEdgeSettings(s=>({...s, depthCue:!!c}))} disabled={!edgeSettings.showEdges}/><Label htmlFor="style-depthcue" className="font-normal">Depth Cue</Label></div>
                <div className="flex items-center space-x-2"><Checkbox id="style-jitter" checked={edgeSettings.jitter} onCheckedChange={(c)=>setEdgeSettings(s=>({...s, jitter:!!c}))} disabled={!edgeSettings.showEdges}/><Label htmlFor="style-jitter" className="font-normal">Jitter (Hand-drawn Effect)</Label></div>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="edge-color" className="shrink-0">Color:</Label>
                <Input type="color" id="edge-color" value={edgeSettings.edgeColor} onChange={e=>setEdgeSettings(s=>({...s, edgeColor:e.target.value}))} className="h-7 w-12" disabled={!edgeSettings.showEdges}/>
                <Label htmlFor="profile-width" className="shrink-0">Profile Width:</Label>
                <Input type="number" id="profile-width" min="1" max="10" value={edgeSettings.profileWidth} onChange={e=>setEdgeSettings(s=>({...s, profileWidth:parseInt(e.target.value)}))} className="h-7 w-12 text-xs" disabled={!edgeSettings.showProfiles || !edgeSettings.showEdges}/>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Face Settings */}
        <Accordion type="single" collapsible className="w-full border rounded-md" defaultValue="face-style-sub">
           <AccordionItem value="face-style-sub" className="border-b-0">
            <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                <div className="flex items-center gap-1.5"><Palette size={14}/> Face Settings</div>
            </AccordionTrigger>
             <AccordionContent className="space-y-2 p-2 pt-0">
                <Select value={faceSettings.style} onValueChange={v=>setFaceSettings(s=>({...s, style:v as FaceStyleType}))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shaded" className="text-xs">Shaded (Default)</SelectItem>
                      <SelectItem value="shaded_with_textures" className="text-xs">Shaded with Textures (WIP)</SelectItem>
                      <SelectItem value="wireframe" className="text-xs">Wireframe</SelectItem>
                      <SelectItem value="hidden_line" className="text-xs">Hidden Line (WIP)</SelectItem>
                      <SelectItem value="monochrome" className="text-xs">Monochrome (WIP)</SelectItem>
                      <SelectItem value="xray" className="text-xs">X-Ray (WIP)</SelectItem>
                      <SelectItem value="color_by_layer" className="text-xs">Color by Layer (WIP)</SelectItem>
                    </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                    <Label htmlFor="face-front-color" className="shrink-0">Front:</Label>
                    <Input type="color" id="face-front-color" value={faceSettings.frontColor} onChange={e=>setFaceSettings(s=>({...s, frontColor:e.target.value}))} className="h-7 w-12"/>
                    <Label htmlFor="face-back-color" className="shrink-0">Back:</Label>
                    <Input type="color" id="face-back-color" value={faceSettings.backColor} onChange={e=>setFaceSettings(s=>({...s, backColor:e.target.value}))} className="h-7 w-12"/>
                </div>
                {faceSettings.style === 'monochrome' && (
                    <div className="flex items-center gap-2">
                        <Label htmlFor="face-mono-color" className="shrink-0">Monochrome Color:</Label>
                        <Input type="color" id="face-mono-color" value={faceSettings.monochromeColor} onChange={e=>setFaceSettings(s=>({...s, monochromeColor:e.target.value}))} className="h-7 w-12"/>
                    </div>
                )}
             </AccordionContent>
           </AccordionItem>
        </Accordion>


        {/* Background Settings */}
        <Accordion type="single" collapsible className="w-full border rounded-md">
          <AccordionItem value="bg-style-sub" className="border-b-0">
            <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                <div className="flex items-center gap-1.5"><Sun size={14}/> Background Settings</div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 p-2 pt-0">
               <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                <div className="flex items-center space-x-2"><Checkbox id="style-bg-sky" checked={backgroundSettings.useSky} onCheckedChange={(c)=>setBackgroundSettings(s=>({...s, useSky:!!c}))} /><Label htmlFor="style-bg-sky" className="font-normal">Sky</Label></div>
                <div className="flex items-center space-x-2"><Checkbox id="style-bg-ground" checked={backgroundSettings.useGround} onCheckedChange={(c)=>setBackgroundSettings(s=>({...s, useGround:!!c}))} /><Label htmlFor="style-bg-ground" className="font-normal">Ground Plane</Label></div>
                <div className="flex items-center space-x-2"><Checkbox id="style-bg-gradient" checked={backgroundSettings.useHorizonGradient} onCheckedChange={(c)=>setBackgroundSettings(s=>({...s, useHorizonGradient:!!c}))} disabled={!backgroundSettings.useSky}/><Label htmlFor="style-bg-gradient" className="font-normal">Horizon Gradient (WIP)</Label></div>
                <div className="flex items-center space-x-2"><Checkbox id="style-bg-envimage" checked={backgroundSettings.useEnvironmentImage} onCheckedChange={(c)=>setBackgroundSettings(s=>({...s, useEnvironmentImage:!!c}))} /><Label htmlFor="style-bg-envimage" className="font-normal">Environment Image (WIP)</Label></div>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="bg-color" className="shrink-0">BG Color:</Label>
                <Input type="color" id="bg-color" value={backgroundSettings.backgroundColor} onChange={e=>setBackgroundSettings(s=>({...s, backgroundColor:e.target.value}))} className="h-7 w-12" disabled={backgroundSettings.useSky || backgroundSettings.useEnvironmentImage}/>
                <Label htmlFor="horizon-color" className="shrink-0">Sky/Horizon:</Label>
                <Input type="color" id="horizon-color" value={backgroundSettings.skyColor} onChange={e=>setBackgroundSettings(s=>({...s, skyColor:e.target.value}))} className="h-7 w-12" disabled={!backgroundSettings.useSky}/>
              </div>
              {backgroundSettings.useEnvironmentImage && <Button variant="outline" size="xs" className="w-full h-7 text-[10px]" disabled>Select Environment Image (WIP)</Button>}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {/* Modelling Aids */}
         <Accordion type="single" collapsible className="w-full border rounded-md">
          <AccordionItem value="aids-style-sub" className="border-b-0">
            <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                <div className="flex items-center gap-1.5"><Axe size={14}/> Modelling Aids</div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 p-2 pt-0">
                 <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    <div className="flex items-center space-x-2"><Checkbox id="style-guides" checked={modellingAids.displayGuidelines} onCheckedChange={(c)=>setModellingAids(s=>({...s, displayGuidelines:!!c}))} /><Label htmlFor="style-guides" className="font-normal">Guidelines (WIP)</Label></div>
                    <div className="flex items-center space-x-2"><Checkbox id="style-sec-fill" checked={modellingAids.displaySectionFill} onCheckedChange={(c)=>setModellingAids(s=>({...s, displaySectionFill:!!c}))} /><Label htmlFor="style-sec-fill" className="font-normal">Section Fill (WIP)</Label></div>
                    <div className="flex items-center space-x-2"><Checkbox id="style-sec-lines" checked={modellingAids.displaySectionLines} onCheckedChange={(c)=>setModellingAids(s=>({...s, displaySectionLines:!!c}))} /><Label htmlFor="style-sec-lines" className="font-normal">Section Lines (WIP)</Label></div>
                    <div className="flex items-center space-x-2"><Checkbox id="style-model-axes" checked={modellingAids.displayModelAxes} onCheckedChange={(c)=>setModellingAids(s=>({...s, displayModelAxes:!!c}))} /><Label htmlFor="style-model-axes" className="font-normal">Model Axes (WIP)</Label></div>
                 </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>


        <p className="text-xs text-muted-foreground text-center pt-1 italic">Display styles for modelling viewport. Many are WIP.</p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default StylesPanel;

