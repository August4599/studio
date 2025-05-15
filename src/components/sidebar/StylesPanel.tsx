
"use client";
import React, { useState } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Image as ImageIcon, Palette, Sun, Droplet, Sigma, Edit } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const StylesPanel = () => {
  // Mock state - in a real app, this would come from context/scene state
  const [edgeSettings, setEdgeSettings] = useState({
    edges: true, profiles: true, depthCue: false, jitter: false, color: '#000000', profileWidth: 2,
  });
  const [faceSettings, setFaceSettings] = useState({
    style: 'shaded', frontColor: '#FFFFFF', backColor: '#A0A0A0',
  });
  const [backgroundSettings, setBackgroundSettings] = useState({
    sky: false, ground: false, color: '#F0F0F0', horizonColor: '#C0C0C0',
  });

  return (
    <AccordionItem value="item-styles">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <ImageIcon size={18} /> Display Styles
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-3 p-1 text-xs">
        
        {/* Edge Settings */}
        <div className="space-y-2 p-2 border rounded-md">
          <Label className="font-medium flex items-center gap-1.5"><Edit size={14}/> Edge Settings (WIP)</Label>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            <div className="flex items-center space-x-2"><Checkbox id="style-edges" checked={edgeSettings.edges} onCheckedChange={(c)=>setEdgeSettings(s=>({...s, edges:!!c}))} /><Label htmlFor="style-edges" className="font-normal">Edges</Label></div>
            <div className="flex items-center space-x-2"><Checkbox id="style-profiles" checked={edgeSettings.profiles} onCheckedChange={(c)=>setEdgeSettings(s=>({...s, profiles:!!c}))} disabled={!edgeSettings.edges}/><Label htmlFor="style-profiles" className="font-normal">Profiles</Label></div>
            <div className="flex items-center space-x-2"><Checkbox id="style-depthcue" checked={edgeSettings.depthCue} onCheckedChange={(c)=>setEdgeSettings(s=>({...s, depthCue:!!c}))} disabled={!edgeSettings.edges}/><Label htmlFor="style-depthcue" className="font-normal">Depth Cue</Label></div>
            <div className="flex items-center space-x-2"><Checkbox id="style-jitter" checked={edgeSettings.jitter} onCheckedChange={(c)=>setEdgeSettings(s=>({...s, jitter:!!c}))} disabled={!edgeSettings.edges}/><Label htmlFor="style-jitter" className="font-normal">Jitter</Label></div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="edge-color" className="shrink-0">Color:</Label>
            <Input type="color" id="edge-color" value={edgeSettings.color} onChange={e=>setEdgeSettings(s=>({...s, color:e.target.value}))} className="h-7 w-16" disabled={!edgeSettings.edges}/>
            <Label htmlFor="profile-width" className="shrink-0">Profile:</Label>
            <Input type="number" id="profile-width" min="1" max="10" value={edgeSettings.profileWidth} onChange={e=>setEdgeSettings(s=>({...s, profileWidth:parseInt(e.target.value)}))} className="h-7 w-12 text-xs" disabled={!edgeSettings.profiles || !edgeSettings.edges}/>
          </div>
        </div>

        {/* Face Settings */}
        <div className="space-y-2 p-2 border rounded-md">
          <Label className="font-medium flex items-center gap-1.5"><Palette size={14}/> Face Settings (WIP)</Label>
          <Select value={faceSettings.style} onValueChange={v=>setFaceSettings(s=>({...s, style:v}))}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="shaded" className="text-xs">Shaded (Monochrome)</SelectItem>
              <SelectItem value="shaded-textures" className="text-xs" disabled>Shaded with Textures</SelectItem>
              <SelectItem value="wireframe" className="text-xs">Wireframe</SelectItem>
              <SelectItem value="hidden-line" className="text-xs" disabled>Hidden Line</SelectItem>
              <SelectItem value="xray" className="text-xs" disabled>X-Ray</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Label htmlFor="face-front-color" className="shrink-0">Front:</Label>
            <Input type="color" id="face-front-color" value={faceSettings.frontColor} onChange={e=>setFaceSettings(s=>({...s, frontColor:e.target.value}))} className="h-7 w-16"/>
            <Label htmlFor="face-back-color" className="shrink-0">Back:</Label>
            <Input type="color" id="face-back-color" value={faceSettings.backColor} onChange={e=>setFaceSettings(s=>({...s, backColor:e.target.value}))} className="h-7 w-16"/>
          </div>
        </div>

        {/* Background Settings */}
        <div className="space-y-2 p-2 border rounded-md">
          <Label className="font-medium flex items-center gap-1.5"><Sun size={14}/> Background Settings (WIP)</Label>
           <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            <div className="flex items-center space-x-2"><Checkbox id="style-bg-sky" checked={backgroundSettings.sky} onCheckedChange={(c)=>setBackgroundSettings(s=>({...s, sky:!!c}))} /><Label htmlFor="style-bg-sky" className="font-normal">Sky</Label></div>
            <div className="flex items-center space-x-2"><Checkbox id="style-bg-ground" checked={backgroundSettings.ground} onCheckedChange={(c)=>setBackgroundSettings(s=>({...s, ground:!!c}))} /><Label htmlFor="style-bg-ground" className="font-normal">Ground Plane</Label></div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="bg-color" className="shrink-0">BG Color:</Label>
            <Input type="color" id="bg-color" value={backgroundSettings.color} onChange={e=>setBackgroundSettings(s=>({...s, color:e.target.value}))} className="h-7 w-16" disabled={backgroundSettings.sky}/>
            <Label htmlFor="horizon-color" className="shrink-0">Horizon:</Label>
            <Input type="color" id="horizon-color" value={backgroundSettings.horizonColor} onChange={e=>setBackgroundSettings(s=>({...s, horizonColor:e.target.value}))} className="h-7 w-16" disabled={!backgroundSettings.sky}/>
          </div>
        </div>
        
        {/* Watermark Settings Placeholder */}
        <div className="space-y-1 p-2 border rounded-md text-muted-foreground">
            <Label className="font-medium flex items-center gap-1.5"><Droplet size={14}/> Watermark (WIP)</Label>
            <p className="italic">Configure image watermarks, text overlays, position, scale, opacity.</p>
        </div>
        
        {/* Section Cuts Placeholder */}
        <div className="space-y-1 p-2 border rounded-md text-muted-foreground">
            <Label className="font-medium flex items-center gap-1.5"><Sigma size={14}/> Section Cuts (WIP)</Label>
            <p className="italic">Manage active section planes, fill display, line styles.</p>
        </div>


        <p className="text-xs text-muted-foreground text-center pt-1 italic">Display styles are for the modelling viewport. Most are WIP.</p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default StylesPanel;
