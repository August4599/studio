

"use client";
import React, { useState } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch'; 
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { SunMoon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const ShadowsPanel = () => {
  // Mock state - replace with actual context/state later
  const [shadowsEnabled, setShadowsEnabled] = useState(true);
  const [useSunForShadows, setUseSunForShadows] = useState(true);
  const [time, setTime] = useState('12:00'); 
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); 
  const [lightness, setLightness] = useState(50); 
  const [darkness, setDarkness] = useState(50);   
  const [shadowsOnFaces, setShadowsOnFaces] = useState(true);
  const [shadowsOnGround, setShadowsOnGround] = useState(true);


  return (
    <AccordionItem value="item-shadows">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <SunMoon size={18} /> Shadows
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-3 p-1 text-xs">
        <div className="flex items-center justify-between p-1">
          <Label htmlFor="shadows-enabled" className="font-medium">Enable Shadows</Label>
          <Switch id="shadows-enabled" checked={shadowsEnabled} onCheckedChange={setShadowsEnabled} />
        </div>

        <div className="flex items-center justify-between p-1">
          <Label htmlFor="use-sun" className="font-normal">Use Sun for Shadows</Label>
          <Switch id="use-sun" checked={useSunForShadows} onCheckedChange={setUseSunForShadows} disabled={!shadowsEnabled} />
        </div>

        {useSunForShadows && shadowsEnabled && (
          <div className="space-y-2 p-1 border-t pt-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="shadow-time">Time</Label>
                <Input id="shadow-time" type="time" value={time} onChange={e => setTime(e.target.value)} className="h-8 text-xs" />
              </div>
              <div>
                <Label htmlFor="shadow-date">Date</Label>
                <Input id="shadow-date" type="date" value={date} onChange={e => setDate(e.target.value)} className="h-8 text-xs" />
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-1 p-1 border-t pt-2">
            <Label htmlFor="shadow-light" className="font-normal">Light: {lightness}%</Label>
            <Slider id="shadow-light" value={[lightness]} onValueChange={([val]) => setLightness(val)} max={100} step={1} disabled={!shadowsEnabled} />
        </div>
        <div className="space-y-1 p-1">
            <Label htmlFor="shadow-dark" className="font-normal">Dark: {darkness}%</Label>
            <Slider id="shadow-dark" value={[darkness]} onValueChange={([val]) => setDarkness(val)} max={100} step={1} disabled={!shadowsEnabled} />
        </div>
         <div className="space-y-1 p-1 border-t pt-2">
            <div className="flex items-center space-x-2">
                <Checkbox id="shadows-on-faces" checked={shadowsOnFaces} onCheckedChange={()=>setShadowsOnFaces(!shadowsOnFaces)} disabled={!shadowsEnabled} />
                <Label htmlFor="shadows-on-faces" className="font-normal">Shadows on Faces (WIP)</Label>
            </div>
             <div className="flex items-center space-x-2">
                <Checkbox id="shadows-on-ground" checked={shadowsOnGround} onCheckedChange={()=>setShadowsOnGround(!shadowsOnGround)} disabled={!shadowsEnabled} />
                <Label htmlFor="shadows-on-ground" className="font-normal">Shadows on Ground (WIP)</Label>
            </div>
        </div>
        <p className="text-xs text-muted-foreground text-center pt-1 italic">Shadows panel (WIP) - Controls actual shadow rendering in modelling viewport.</p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ShadowsPanel;

