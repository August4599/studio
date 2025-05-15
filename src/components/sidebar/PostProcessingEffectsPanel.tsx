
"use client";
import React, { useState } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Wand2, Sun, Droplet, Film, Palette, Sparkles, Aperture, Contrast } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PostProcessingEffectsPanel = () => {
  // Mock state for effects - replace with actual context/state later
  const [effects, setEffects] = useState({
    bloom: { enabled: true, intensity: 0.5, threshold: 0.8, radius: 0.5 },
    vignette: { enabled: false, offset: 0.5, darkness: 0.5 },
    chromaticAberration: { enabled: false, intensity: 0.01 },
    colorGrading: { enabled: true, lutPath: '', exposure: 0, contrast: 1, saturation: 1, temperature: 6500, tint:0 },
    lensDirt: { enabled: false, texturePath: '', intensity: 0.5},
    motionBlur: { enabled: false, samples: 16, intensity: 0.5},
    sharpen: { enabled: false, intensity: 0.3 },
  });

  const handleToggle = (effect: keyof typeof effects, subKey: 'enabled') => {
    setEffects(prev => ({ ...prev, [effect]: { ...prev[effect], [subKey]: !prev[effect][subKey] } }));
  };

  const handleSlider = (effect: keyof typeof effects, subKey: string, value: number) => {
    setEffects(prev => ({ ...prev, [effect]: { ...prev[effect], [subKey]: value } }));
  };
  
  const handleColorChange = (effect: keyof typeof effects, subKey: string, value: string) => {
    setEffects(prev => ({ ...prev, [effect]: { ...prev[effect], [subKey]: value } }));
  };


  return (
    <AccordionItem value="item-post-processing">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Wand2 size={18} /> Post-Processing Effects
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-3 p-1 text-xs">

        {/* Bloom */}
        <div className="space-y-1 p-1 border rounded-md">
          <div className="flex items-center justify-between"><Label className="font-medium flex items-center gap-1.5"><Sparkles size={14}/> Bloom (WIP)</Label><Switch checked={effects.bloom.enabled} onCheckedChange={()=>handleToggle('bloom', 'enabled')}/></div>
          {effects.bloom.enabled && <>
            <Label>Intensity: {effects.bloom.intensity.toFixed(2)}</Label><Slider value={[effects.bloom.intensity]} onValueChange={([v])=>handleSlider('bloom','intensity',v)} min={0} max={2} step={0.01}/>
            <Label>Threshold: {effects.bloom.threshold.toFixed(2)}</Label><Slider value={[effects.bloom.threshold]} onValueChange={([v])=>handleSlider('bloom','threshold',v)} min={0} max={1} step={0.01}/>
            <Label>Radius: {effects.bloom.radius.toFixed(2)}</Label><Slider value={[effects.bloom.radius]} onValueChange={([v])=>handleSlider('bloom','radius',v)} min={0} max={1} step={0.01}/>
          </>}
        </div>
        
        {/* Color Grading / LUT */}
         <div className="space-y-1 p-1 border rounded-md">
          <div className="flex items-center justify-between"><Label className="font-medium flex items-center gap-1.5"><Palette size={14}/> Color Grading (WIP)</Label><Switch checked={effects.colorGrading.enabled} onCheckedChange={()=>handleToggle('colorGrading','enabled')}/></div>
          {effects.colorGrading.enabled && <>
            <Button variant="outline" size="xs" className="w-full h-7 text-[10px]" disabled>Load LUT (.cube, .png)</Button>
            <Label>Exposure: {effects.colorGrading.exposure.toFixed(2)}</Label><Slider value={[effects.colorGrading.exposure]} onValueChange={([v])=>handleSlider('colorGrading','exposure',v)} min={-3} max={3} step={0.01}/>
            <Label>Contrast: {effects.colorGrading.contrast.toFixed(2)}</Label><Slider value={[effects.colorGrading.contrast]} onValueChange={([v])=>handleSlider('colorGrading','contrast',v)} min={0} max={2} step={0.01}/>
            <Label>Saturation: {effects.colorGrading.saturation.toFixed(2)}</Label><Slider value={[effects.colorGrading.saturation]} onValueChange={([v])=>handleSlider('colorGrading','saturation',v)} min={0} max={2} step={0.01}/>
            <Label>Temperature: {effects.colorGrading.temperature}K</Label><Slider value={[effects.colorGrading.temperature]} onValueChange={([v])=>handleSlider('colorGrading','temperature',v)} min={1000} max={12000} step={50}/>
            <Label>Tint: {effects.colorGrading.tint.toFixed(2)}</Label><Slider value={[effects.colorGrading.tint]} onValueChange={([v])=>handleSlider('colorGrading','tint',v)} min={-1} max={1} step={0.01}/>
          </>}
        </div>

        {/* Vignette */}
        <div className="space-y-1 p-1 border rounded-md">
          <div className="flex items-center justify-between"><Label className="font-medium flex items-center gap-1.5"><Aperture size={14}/> Vignette (WIP)</Label><Switch checked={effects.vignette.enabled} onCheckedChange={()=>handleToggle('vignette','enabled')}/></div>
          {effects.vignette.enabled && <>
            <Label>Offset: {effects.vignette.offset.toFixed(2)}</Label><Slider value={[effects.vignette.offset]} onValueChange={([v])=>handleSlider('vignette','offset',v)} min={0} max={1} step={0.01}/>
            <Label>Darkness: {effects.vignette.darkness.toFixed(2)}</Label><Slider value={[effects.vignette.darkness]} onValueChange={([v])=>handleSlider('vignette','darkness',v)} min={0} max={1} step={0.01}/>
          </>}
        </div>

        {/* Chromatic Aberration */}
        <div className="space-y-1 p-1 border rounded-md">
          <div className="flex items-center justify-between"><Label className="font-medium flex items-center gap-1.5"><Film size={14}/> Chromatic Aberration (WIP)</Label><Switch checked={effects.chromaticAberration.enabled} onCheckedChange={()=>handleToggle('chromaticAberration','enabled')}/></div>
          {effects.chromaticAberration.enabled && <>
            <Label>Intensity: {effects.chromaticAberration.intensity.toFixed(3)}</Label><Slider value={[effects.chromaticAberration.intensity]} onValueChange={([v])=>handleSlider('chromaticAberration','intensity',v)} min={0} max={0.1} step={0.001}/>
          </>}
        </div>
        
        {/* Lens Dirt */}
        <div className="space-y-1 p-1 border rounded-md">
          <div className="flex items-center justify-between"><Label className="font-medium flex items-center gap-1.5"><Droplet size={14}/> Lens Dirt (WIP)</Label><Switch checked={effects.lensDirt.enabled} onCheckedChange={()=>handleToggle('lensDirt','enabled')}/></div>
          {effects.lensDirt.enabled && <>
            <Button variant="outline" size="xs" className="w-full h-7 text-[10px]" disabled>Upload Dirt Texture</Button>
            <Label>Intensity: {effects.lensDirt.intensity.toFixed(2)}</Label><Slider value={[effects.lensDirt.intensity]} onValueChange={([v])=>handleSlider('lensDirt','intensity',v)} min={0} max={1} step={0.01}/>
          </>}
        </div>
        
         {/* Motion Blur */}
        <div className="space-y-1 p-1 border rounded-md">
          <div className="flex items-center justify-between"><Label className="font-medium flex items-center gap-1.5"><Film size={14} style={{transform: 'skewX(-15deg)'}}/> Motion Blur (WIP)</Label><Switch checked={effects.motionBlur.enabled} onCheckedChange={()=>handleToggle('motionBlur','enabled')}/></div>
          {effects.motionBlur.enabled && <>
            <Label>Samples: {effects.motionBlur.samples}</Label><Slider value={[effects.motionBlur.samples]} onValueChange={([v])=>handleSlider('motionBlur','samples',v)} min={4} max={64} step={4}/>
            <Label>Intensity: {effects.motionBlur.intensity.toFixed(2)}</Label><Slider value={[effects.motionBlur.intensity]} onValueChange={([v])=>handleSlider('motionBlur','intensity',v)} min={0} max={1} step={0.01}/>
          </>}
        </div>
        
        {/* Sharpen */}
        <div className="space-y-1 p-1 border rounded-md">
          <div className="flex items-center justify-between"><Label className="font-medium flex items-center gap-1.5"><Contrast size={14}/> Sharpen (WIP)</Label><Switch checked={effects.sharpen.enabled} onCheckedChange={()=>handleToggle('sharpen','enabled')}/></div>
          {effects.sharpen.enabled && <>
            <Label>Intensity: {effects.sharpen.intensity.toFixed(2)}</Label><Slider value={[effects.sharpen.intensity]} onValueChange={([v])=>handleSlider('sharpen','intensity',v)} min={0} max={1} step={0.01}/>
          </>}
        </div>

        <p className="text-xs text-muted-foreground text-center pt-1 italic">Post-Processing effects for rendering. All are WIP.</p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default PostProcessingEffectsPanel;
