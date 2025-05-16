
"use client";
import React, { useState } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Wand2, Sun, Droplet, Film, Palette, Sparkles, Aperture, Contrast, UploadCloud, Shuffle, PlusCircle, Trash2, SlidersHorizontal, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from '../ui/scroll-area';
import { useScene } from '@/context/scene-context';
import type { PostProcessingSettings } from '@/types';


const PostProcessingEffectsPanel = () => {
  const { postProcessingSettings = {} as PostProcessingSettings, updatePostProcessingSettings } = useScene();

  const handleToggle = (effect: keyof PostProcessingSettings, subKey: 'enabled') => {
    const currentEffectSettings = postProcessingSettings[effect] || { enabled: false };
    updatePostProcessingSettings({ 
        ...postProcessingSettings,
        [effect]: { ...currentEffectSettings, [subKey]: !currentEffectSettings.enabled }
    });
  };

  const handleSlider = (effect: keyof PostProcessingSettings, subKey: string, value: number) => {
     const currentEffectSettings = postProcessingSettings[effect] || { enabled: false };
     updatePostProcessingSettings({ 
        ...postProcessingSettings,
        [effect]: { ...currentEffectSettings, enabled: currentEffectSettings.enabled ?? false, [subKey]: value }
    });
  };
  
  const handleSelectChange = (effect: keyof PostProcessingSettings, subKey: string, value: string) => {
    const currentEffectSettings = postProcessingSettings[effect] || { enabled: false };
    updatePostProcessingSettings({ 
        ...postProcessingSettings,
        [effect]: { ...currentEffectSettings, enabled: currentEffectSettings.enabled ?? false, [subKey]: value }
    });
  };

  const handleInputChange = (effect: keyof PostProcessingSettings, subKey: string, value: string | number) => {
    const currentEffectSettings = postProcessingSettings[effect] || { enabled: false };
    updatePostProcessingSettings({ 
        ...postProcessingSettings,
        [effect]: { ...currentEffectSettings, enabled: currentEffectSettings.enabled ?? false, [subKey]: value }
    });
  };


  return (
    <AccordionItem value="item-post-processing">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Wand2 size={18} /> Post-Processing Effects
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-3 p-1 text-xs">
      <ScrollArea className="h-[calc(100vh-200px)] p-1"> {/* Adjust height as needed */}
        <div className="space-y-3">
            <div className="flex items-center justify-between p-1 border-b">
                <Label className="font-medium">Effect Stack (WIP)</Label>
                <div className="flex gap-1">
                    <Button variant="outline" size="xs" className="h-6" disabled><PlusCircle size={12} className="mr-1"/> Add</Button>
                    <Button variant="outline" size="xs" className="h-6" disabled><Shuffle size={12} className="mr-1"/>Reorder</Button>
                </div>
            </div>
        {/* Bloom */}
        <Accordion type="single" collapsible className="w-full border rounded-md">
            <AccordionItem value="effect-bloom" className="border-b-0">
                 <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-1.5"><Sparkles size={14}/> Bloom</span>
                        <Switch checked={postProcessingSettings.bloom?.enabled} onCheckedChange={()=>handleToggle('bloom', 'enabled')} onClick={(e)=>e.stopPropagation()}/>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    {postProcessingSettings.bloom?.enabled && <>
                        <Label>Intensity: {(postProcessingSettings.bloom?.intensity || 0.5).toFixed(2)}</Label><Slider value={[postProcessingSettings.bloom?.intensity || 0.5]} onValueChange={([v])=>handleSlider('bloom','intensity',v)} min={0} max={2} step={0.01}/>
                        <Label>Threshold: {(postProcessingSettings.bloom?.threshold || 0.8).toFixed(2)}</Label><Slider value={[postProcessingSettings.bloom?.threshold || 0.8]} onValueChange={([v])=>handleSlider('bloom','threshold',v)} min={0} max={1} step={0.01}/>
                        <Label>Radius: {(postProcessingSettings.bloom?.radius || 0.5).toFixed(2)}</Label><Slider value={[postProcessingSettings.bloom?.radius || 0.5]} onValueChange={([v])=>handleSlider('bloom','radius',v)} min={0} max={1} step={0.01}/>
                        <Label htmlFor="bloom-blend">Blend Mode (WIP)</Label>
                        <Select value={postProcessingSettings.bloom?.blendMode || 'add'} onValueChange={v => handleSelectChange('bloom', 'blendMode', v)} disabled>
                            <SelectTrigger id="bloom-blend" className="h-7 text-xs"><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="add">Add</SelectItem><SelectItem value="screen">Screen</SelectItem></SelectContent>
                        </Select>
                    </>}
                 </AccordionContent>
            </AccordionItem>
        </Accordion>
        
        {/* Color Grading / LUT */}
         <Accordion type="single" collapsible className="w-full border rounded-md">
            <AccordionItem value="effect-colorgrading" className="border-b-0">
                 <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center justify-between w-full">
                         <span className="flex items-center gap-1.5"><Palette size={14}/> Color Grading / LUT</span>
                         <Switch checked={postProcessingSettings.colorGrading?.enabled} onCheckedChange={()=>handleToggle('colorGrading','enabled')} onClick={(e)=>e.stopPropagation()}/>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                  {postProcessingSettings.colorGrading?.enabled && <>
                    <Button variant="outline" size="xs" className="w-full h-7 text-[10px]" disabled><UploadCloud size={12} className="mr-1"/> Load LUT (.cube, .png)</Button>
                    <Label>Exposure: {(postProcessingSettings.colorGrading?.exposure || 0).toFixed(2)}</Label><Slider value={[postProcessingSettings.colorGrading?.exposure || 0]} onValueChange={([v])=>handleSlider('colorGrading','exposure',v)} min={-3} max={3} step={0.01}/>
                    <Label>Contrast: {(postProcessingSettings.colorGrading?.contrast || 1).toFixed(2)}</Label><Slider value={[postProcessingSettings.colorGrading?.contrast || 1]} onValueChange={([v])=>handleSlider('colorGrading','contrast',v)} min={0} max={2} step={0.01}/>
                    <Label>Saturation: {(postProcessingSettings.colorGrading?.saturation || 1).toFixed(2)}</Label><Slider value={[postProcessingSettings.colorGrading?.saturation || 1]} onValueChange={([v])=>handleSlider('colorGrading','saturation',v)} min={0} max={2} step={0.01}/>
                    <Label>Temperature: {(postProcessingSettings.colorGrading?.temperature || 6500)}K</Label><Slider value={[postProcessingSettings.colorGrading?.temperature || 6500]} onValueChange={([v])=>handleSlider('colorGrading','temperature',v)} min={1000} max={12000} step={50}/>
                    <Label>Tint: {(postProcessingSettings.colorGrading?.tint || 0).toFixed(2)}</Label><Slider value={[postProcessingSettings.colorGrading?.tint || 0]} onValueChange={([v])=>handleSlider('colorGrading','tint',v)} min={-1} max={1} step={0.01}/>
                     <div className="pt-1 border-t"><Label className="font-medium">Color Wheels (WIP)</Label><p className="text-[10px] text-muted-foreground italic">Placeholders for Shadows, Midtones, Highlights color wheels.</p></div>
                  </>}
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        {/* Vignette */}
        <Accordion type="single" collapsible className="w-full border rounded-md">
            <AccordionItem value="effect-vignette" className="border-b-0">
                <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-1.5"><Aperture size={14}/> Vignette</span>
                        <Switch checked={postProcessingSettings.vignette?.enabled} onCheckedChange={()=>handleToggle('vignette','enabled')} onClick={(e)=>e.stopPropagation()}/>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                  {postProcessingSettings.vignette?.enabled && <>
                    <Label>Offset: {(postProcessingSettings.vignette?.offset || 0.5).toFixed(2)}</Label><Slider value={[postProcessingSettings.vignette?.offset || 0.5]} onValueChange={([v])=>handleSlider('vignette','offset',v)} min={0} max={1} step={0.01}/>
                    <Label>Darkness: {(postProcessingSettings.vignette?.darkness || 0.5).toFixed(2)}</Label><Slider value={[postProcessingSettings.vignette?.darkness || 0.5]} onValueChange={([v])=>handleSlider('vignette','darkness',v)} min={0} max={1} step={0.01}/>
                    <Label htmlFor="vignette-color">Color (WIP)</Label><Input id="vignette-color" type="color" value={postProcessingSettings.vignette?.color || '#000000'} onChange={e => handleInputChange('vignette', 'color', e.target.value)} className="h-7 w-full" disabled/>
                    <Label>Roundness (WIP): {(postProcessingSettings.vignette?.roundness || 1).toFixed(2)}</Label><Slider value={[postProcessingSettings.vignette?.roundness || 1]} min={0} max={1} step={0.01} disabled/>
                    <Label>Feather (WIP): {(postProcessingSettings.vignette?.feather || 0.5).toFixed(2)}</Label><Slider value={[postProcessingSettings.vignette?.feather || 0.5]} min={0} max={1} step={0.01} disabled/>
                  </>}
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        {/* Chromatic Aberration */}
        <Accordion type="single" collapsible className="w-full border rounded-md">
             <AccordionItem value="effect-chroma" className="border-b-0">
                 <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-1.5"><Film size={14}/> Chromatic Aberration</span>
                         <Switch checked={postProcessingSettings.chromaticAberration?.enabled} onCheckedChange={()=>handleToggle('chromaticAberration','enabled')} onClick={(e)=>e.stopPropagation()}/>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    {postProcessingSettings.chromaticAberration?.enabled && <>
                        <Label>Intensity: {(postProcessingSettings.chromaticAberration?.intensity || 0.01).toFixed(3)}</Label><Slider value={[postProcessingSettings.chromaticAberration?.intensity || 0.01]} onValueChange={([v])=>handleSlider('chromaticAberration','intensity',v)} min={0} max={0.1} step={0.001}/>
                        <div className="flex items-center space-x-2"><Checkbox id="chroma-radial" checked={!!postProcessingSettings.chromaticAberration?.radialModulation} disabled/><Label htmlFor="chroma-radial" className="font-normal">Radial Modulation (WIP)</Label></div>
                        <Label>Start Offset (WIP): {(postProcessingSettings.chromaticAberration?.startOffset || 0).toFixed(2)}</Label><Slider value={[postProcessingSettings.chromaticAberration?.startOffset || 0]} min={0} max={1} step={0.01} disabled/>
                    </>}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        
        {/* Lens Dirt */}
        <Accordion type="single" collapsible className="w-full border rounded-md">
             <AccordionItem value="effect-lensdirt" className="border-b-0">
                <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-1.5"><Droplet size={14}/> Lens Dirt</span>
                        <Switch checked={postProcessingSettings.lensDirt?.enabled} onCheckedChange={()=>handleToggle('lensDirt','enabled')} onClick={(e)=>e.stopPropagation()}/>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    {postProcessingSettings.lensDirt?.enabled && <>
                        <Button variant="outline" size="xs" className="w-full h-7 text-[10px]" disabled><UploadCloud size={12} className="mr-1"/>Upload Dirt Texture</Button>
                        <Label>Intensity: {(postProcessingSettings.lensDirt?.intensity || 0.5).toFixed(2)}</Label><Slider value={[postProcessingSettings.lensDirt?.intensity || 0.5]} onValueChange={([v])=>handleSlider('lensDirt','intensity',v)} min={0} max={1} step={0.01}/>
                        <Label>Scale (WIP): {(postProcessingSettings.lensDirt?.scale || 1).toFixed(2)}</Label><Slider value={[postProcessingSettings.lensDirt?.scale || 1]} min={0.1} max={5} step={0.1} disabled/>
                    </>}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        
         {/* Motion Blur (Screen Space) */}
        <Accordion type="single" collapsible className="w-full border rounded-md">
            <AccordionItem value="effect-motionblur" className="border-b-0">
                 <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-1.5"><Film size={14} style={{transform: 'skewX(-15deg)'}}/> Motion Blur (Screen)</span>
                         <Switch checked={postProcessingSettings.motionBlur?.enabled} onCheckedChange={()=>handleToggle('motionBlur','enabled')} onClick={(e)=>e.stopPropagation()}/>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                  {postProcessingSettings.motionBlur?.enabled && <>
                    <Label>Samples: {postProcessingSettings.motionBlur?.samples || 16}</Label><Slider value={[postProcessingSettings.motionBlur?.samples || 16]} onValueChange={([v])=>handleSlider('motionBlur','samples',v)} min={4} max={64} step={4}/>
                    <Label>Intensity: {(postProcessingSettings.motionBlur?.intensity || 0.5).toFixed(2)}</Label><Slider value={[postProcessingSettings.motionBlur?.intensity || 0.5]} onValueChange={([v])=>handleSlider('motionBlur','intensity',v)} min={0} max={1} step={0.01}/>
                  </>}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        
        {/* Sharpen */}
        <Accordion type="single" collapsible className="w-full border rounded-md">
            <AccordionItem value="effect-sharpen" className="border-b-0">
                 <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center justify-between w-full">
                         <span className="flex items-center gap-1.5"><Contrast size={14}/> Sharpen</span>
                         <Switch checked={postProcessingSettings.sharpen?.enabled} onCheckedChange={()=>handleToggle('sharpen','enabled')} onClick={(e)=>e.stopPropagation()}/>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    {postProcessingSettings.sharpen?.enabled && <>
                        <Label>Intensity: {(postProcessingSettings.sharpen?.intensity || 0.3).toFixed(2)}</Label><Slider value={[postProcessingSettings.sharpen?.intensity || 0.3]} onValueChange={([v])=>handleSlider('sharpen','intensity',v)} min={0} max={1} step={0.01}/>
                        <Label htmlFor="sharpen-technique">Technique (WIP)</Label>
                        <Select value={postProcessingSettings.sharpen?.technique || 'unsharp_mask'} disabled>
                            <SelectTrigger className="h-7 text-xs"><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="unsharp_mask">Unsharp Mask</SelectItem><SelectItem value="simple_laplacian">Simple Laplacian</SelectItem></SelectContent>
                        </Select>
                        <Label>Radius (WIP): {(postProcessingSettings.sharpen?.radius || 1.0).toFixed(1)}</Label><Slider value={[postProcessingSettings.sharpen?.radius || 1.0]} min={0.1} max={3.0} step={0.1} disabled/>
                    </>}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        
        {/* Tone Mapping */}
         <Accordion type="single" collapsible className="w-full border rounded-md">
            <AccordionItem value="effect-tonemapping" className="border-b-0">
                 <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center justify-between w-full">
                         <span className="flex items-center gap-1.5"><Eye size={14}/> Tone Mapping</span>
                         <Switch checked={postProcessingSettings.toneMapping?.enabled} onCheckedChange={()=>handleToggle('toneMapping','enabled')} onClick={(e)=>e.stopPropagation()}/>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    {postProcessingSettings.toneMapping?.enabled && <>
                        <Label htmlFor="tonemap-operator">Operator</Label>
                        <Select value={postProcessingSettings.toneMapping?.operator || 'none'} onValueChange={v => handleSelectChange('toneMapping', 'operator', v)} >
                            <SelectTrigger id="tonemap-operator" className="h-7 text-xs"><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None (Linear)</SelectItem>
                                <SelectItem value="reinhard">Reinhard</SelectItem>
                                <SelectItem value="aces_film">ACES Filmic</SelectItem>
                                <SelectItem value="filmic_hejl">Filmic (Hejl)</SelectItem>
                                <SelectItem value="uncharted2">Uncharted 2</SelectItem>
                            </SelectContent>
                        </Select>
                        <Label>Exposure Bias (WIP): {(postProcessingSettings.toneMapping?.exposureBias || 0).toFixed(2)}</Label><Slider value={[postProcessingSettings.toneMapping?.exposureBias || 0]} min={-2} max={2} step={0.01} disabled/>
                    </>}
                </AccordionContent>
            </AccordionItem>
        </Accordion>

         {/* Film Grain */}
        <Accordion type="single" collapsible className="w-full border rounded-md">
            <AccordionItem value="effect-filmgrain" className="border-b-0">
                 <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center justify-between w-full">
                         <span className="flex items-center gap-1.5"><SlidersHorizontal size={14}/> Film Grain (WIP)</span>
                         <Switch checked={postProcessingSettings.filmGrain?.enabled} onCheckedChange={()=>handleToggle('filmGrain','enabled')} onClick={(e)=>e.stopPropagation()} disabled/>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    {postProcessingSettings.filmGrain?.enabled && <>
                        <Label>Intensity: {(postProcessingSettings.filmGrain?.intensity || 0.1).toFixed(2)}</Label><Slider value={[postProcessingSettings.filmGrain?.intensity || 0.1]} min={0} max={1} step={0.01} disabled/>
                        <Label>Size: {(postProcessingSettings.filmGrain?.size || 1.0).toFixed(2)}</Label><Slider value={[postProcessingSettings.filmGrain?.size || 1.0]} min={0.1} max={5} step={0.1} disabled/>
                        <div className="flex items-center space-x-2"><Checkbox id="filmgrain-animated" checked={!!postProcessingSettings.filmGrain?.animated} disabled/><Label htmlFor="filmgrain-animated" className="font-normal">Animated</Label></div>
                    </>}
                </AccordionContent>
            </AccordionItem>
        </Accordion>

         {/* Lens Flares */}
        <Accordion type="single" collapsible className="w-full border rounded-md">
            <AccordionItem value="effect-lensflares" className="border-b-0">
                 <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center justify-between w-full">
                         <span className="flex items-center gap-1.5"><Sun size={14}/> Lens Flares (WIP)</span>
                         <Switch checked={postProcessingSettings.lensFlares?.enabled} onCheckedChange={()=>handleToggle('lensFlares','enabled')} onClick={(e)=>e.stopPropagation()} disabled/>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    {postProcessingSettings.lensFlares?.enabled && <>
                        <Label htmlFor="lensflare-type">Type</Label>
                        <Select value={postProcessingSettings.lensFlares?.type || 'anamorphic'} disabled>
                            <SelectTrigger className="h-7 text-xs"><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="anamorphic">Anamorphic</SelectItem><SelectItem value="ghosts">Ghosts & Halos</SelectItem></SelectContent>
                        </Select>
                        <Button variant="outline" size="xs" className="w-full h-7 text-[10px]" disabled><UploadCloud size={12} className="mr-1"/>Upload Flare Texture</Button>
                        <Label>Intensity: {(postProcessingSettings.lensFlares?.intensity || 0.2).toFixed(2)}</Label><Slider value={[postProcessingSettings.lensFlares?.intensity || 0.2]} min={0} max={1} step={0.01} disabled/>
                        <Label>Threshold: {(postProcessingSettings.lensFlares?.threshold || 0.9).toFixed(2)}</Label><Slider value={[postProcessingSettings.lensFlares?.threshold || 0.9]} min={0} max={1} step={0.01} disabled/>
                        <Label>Count: {postProcessingSettings.lensFlares?.count || 5}</Label><Slider value={[postProcessingSettings.lensFlares?.count || 5]} min={1} max={20} step={1} disabled/>
                        <Label>Scale: {(postProcessingSettings.lensFlares?.scale || 1).toFixed(2)}</Label><Slider value={[postProcessingSettings.lensFlares?.scale || 1]} min={0.1} max={5} step={0.1} disabled/>
                        <Label htmlFor="lensflare-color">Color</Label><Input id="lensflare-color" type="color" value={postProcessingSettings.lensFlares?.color || '#FFFFFF'} className="h-7 w-full" disabled/>
                    </>}
                </AccordionContent>
            </AccordionItem>
        </Accordion>


        {/* Depth of Field (Post) */}
        <Accordion type="single" collapsible className="w-full border rounded-md">
            <AccordionItem value="effect-dofpost" className="border-b-0">
                 <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center justify-between w-full">
                         <span className="flex items-center gap-1.5"><Aperture size={14}/> Depth of Field (Post - WIP)</span>
                         <Switch checked={postProcessingSettings.depthOfField_Post?.enabled} onCheckedChange={()=>handleToggle('depthOfField_Post','enabled')} onClick={(e)=>e.stopPropagation()} disabled/>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    {postProcessingSettings.depthOfField_Post?.enabled && <>
                        <Label>Focus Distance: {(postProcessingSettings.depthOfField_Post?.focusDistance || 10).toFixed(1)}</Label><Slider value={[postProcessingSettings.depthOfField_Post?.focusDistance || 10]} min={0.1} max={100} step={0.1} disabled/>
                        <Label>Aperture (f-stop): {(postProcessingSettings.depthOfField_Post?.aperture || 2.8).toFixed(1)}</Label><Slider value={[postProcessingSettings.depthOfField_Post?.aperture || 2.8]} min={0.5} max={32} step={0.1} disabled/>
                        <Label>Focal Length (mm): {(postProcessingSettings.depthOfField_Post?.focalLength || 50).toFixed(0)}</Label><Slider value={[postProcessingSettings.depthOfField_Post?.focalLength || 50]} min={10} max={300} step={1} disabled/>
                        <Label htmlFor="dof-bokeh">Bokeh Shape</Label>
                        <Select value={postProcessingSettings.depthOfField_Post?.bokehShape || 'circle'} disabled>
                            <SelectTrigger className="h-7 text-xs"><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="circle">Circle</SelectItem><SelectItem value="hexagon">Hexagon</SelectItem><SelectItem value="custom_texture">Custom Texture (WIP)</SelectItem></SelectContent>
                        </Select>
                        <Label>Bokeh Scale: {(postProcessingSettings.depthOfField_Post?.bokehScale || 1).toFixed(2)}</Label><Slider value={[postProcessingSettings.depthOfField_Post?.bokehScale || 1]} min={0.1} max={5} step={0.1} disabled/>
                    </>}
                </AccordionContent>
            </AccordionItem>
        </Accordion>



        <p className="text-xs text-muted-foreground text-center pt-1 italic">Post-Processing effects for rendering. Most are WIP.</p>
      </div>
      </ScrollArea>
      </AccordionContent>
    </AccordionItem>
  );
};

export default PostProcessingEffectsPanel;
