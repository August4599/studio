
"use client";

import React, { useCallback, useState, useEffect } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useScene } from "@/context/scene-context";
import type { AmbientLightProps, DirectionalLightSceneProps, PointLightSceneProps, SpotLightSceneProps, AreaLightSceneProps, SceneLight, LightType, SkyLightSceneProps, PhotometricLightSceneProps, MeshLightSceneProps } from "@/types";
import { Lightbulb, Sun, LampDesk, LampCeiling, LampWallUp, Trash2, PlusCircle, Edit3, Eye, EyeOff, HelpCircle, Users, FileText, Cpu, ServerCog, SigmaSquare } from "lucide-react"; // Added more icons for new light types
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";


const VectorInput: React.FC<{label: string; value: [number,number,number] | undefined; onChange: (idx: number, val: string) => void; step?: number, disabled?: boolean}> = ({label, value = [0,0,0], onChange, step = 0.1, disabled}) => (
  <div>
      <Label className="text-xs font-medium">{label}</Label>
      <div className="grid grid-cols-3 gap-2 mt-1">
          {['X', 'Y', 'Z'].map((axis, idx) => (
              <div key={axis}>
                  <Label htmlFor={`${label}-${axis}`} className="text-xs">{axis}</Label>
                  <Input id={`${label}-${axis}`} type="number" value={value[idx]} onChange={e => onChange(idx, e.target.value)} className="h-9 text-sm" step={step} disabled={disabled} />
              </div>
          ))}
      </div>
  </div>
);

const LightEditorDialog: React.FC<{
  light: SceneLight | DirectionalLightSceneProps; 
  onSave: (id: string, updates: Partial<SceneLight>) => void;
  trigger: React.ReactNode;
  isDirectional?: boolean;
}> = ({ light, onSave, trigger, isDirectional = false }) => {
  const [editedLight, setEditedLight] = useState(light);

  useEffect(() => {
    setEditedLight(light);
  }, [light]);

  const handleChange = (field: keyof SceneLight, value: any) => {
    setEditedLight(prev => ({ ...prev, [field]: value } as SceneLight));
  };
  
  const handleVectorChange = (field: 'position' | 'targetPosition' | 'rotation', index: number, newValue: string) => {
    const parsedValue = parseFloat(newValue) || 0;
    setEditedLight(prev => {
        const currentVector = [...((prev as any)[field] || [0,0,0])] as [number,number,number];
        currentVector[index] = parsedValue;
        return { ...prev, [field]: currentVector } as SceneLight;
    });
  };

  const handleSave = () => {
    onSave(editedLight.id, editedLight);
  };
  
  const getLightIcon = (type: LightType) => {
    switch(type) {
        case 'point': return LampDesk;
        case 'spot': return LampCeiling;
        case 'area':
        case 'quad':
        case 'disk':
        case 'sphere': // Using area light icon for these too
        case 'cylinder_light': return LampWallUp;
        case 'directional': return Sun;
        case 'skylight': return CloudCog; // Placeholder for Dome/Skylight
        case 'photometric': return FileText; // Placeholder for IES
        case 'mesh_light': return Cpu; // Placeholder for Mesh Light
        default: return HelpCircle;
    }
  }
  const LightIcon = getLightIcon(editedLight.type);


  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><LightIcon size={18}/> Edit Light: {editedLight.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1 pr-3">
          <div className="grid gap-3 py-4 text-xs">
            {!isDirectional && 
              <div className="grid grid-cols-4 items-center gap-3">
                <Label htmlFor="light-name" className="text-right">Name</Label>
                <Input id="light-name" value={editedLight.name} onChange={(e) => handleChange('name', e.target.value)} className="col-span-3 h-8" />
              </div>
            }
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="light-color" className="text-right">Color</Label>
              <Input id="light-color" type="color" value={editedLight.color} onChange={(e) => handleChange('color', e.target.value)} className="col-span-3 h-8" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="light-intensity">Intensity: {editedLight.intensity.toFixed(2)}</Label>
              <Slider id="light-intensity" min={0} max={editedLight.type === 'area' ? 100 : (editedLight.type === 'directional' ? 10 : 50)} step={0.05} value={[editedLight.intensity]} onValueChange={([val]) => handleChange('intensity', val)} />
            </div>

            {(editedLight.type === 'directional' || editedLight.type === 'point' || editedLight.type === 'spot' || editedLight.type === 'area' || editedLight.type === 'photometric' || editedLight.type === 'mesh_light') && (
                 <VectorInput label="Position" value={(editedLight as any).position} onChange={(idx, val) => handleVectorChange('position', idx, val)} step={0.1} />
            )}
            {(editedLight.type === 'spot' || editedLight.type === 'photometric') && (
                 <VectorInput label="Target Position" value={(editedLight as SpotLightSceneProps | PhotometricLightSceneProps).targetPosition} onChange={(idx, val) => handleVectorChange('targetPosition', idx, val)} step={0.1} />
            )}
             {editedLight.type === 'area' && (
                 <VectorInput label="Rotation (Euler)" value={(editedLight as AreaLightSceneProps).rotation} onChange={(idx, val) => handleVectorChange('rotation', idx, val)} step={0.05} />
            )}

            {(editedLight.type === 'point' || editedLight.type === 'spot') && (
                <>
                    <div className="space-y-1">
                        <Label htmlFor="light-distance">Distance: {((editedLight as PointLightSceneProps).distance || 0).toFixed(1)}</Label>
                        <Slider id="light-distance" min={0} max={100} step={0.5} value={[((editedLight as PointLightSceneProps).distance || 0)]} onValueChange={([val]) => handleChange('distance', val)} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="light-decay">Decay: {((editedLight as PointLightSceneProps).decay || 2).toFixed(1)}</Label>
                        <Slider id="light-decay" min={0} max={5} step={0.1} value={[((editedLight as PointLightSceneProps).decay || 2)]} onValueChange={([val]) => handleChange('decay', val)} />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="light-radius">Source Radius (Softness): {((editedLight as PointLightSceneProps).radius || 0).toFixed(2)}</Label>
                        <Slider id="light-radius" min={0} max={2} step={0.01} value={[((editedLight as PointLightSceneProps).radius || 0)]} onValueChange={([val]) => handleChange('radius', val)} />
                    </div>
                </>
            )}
            {editedLight.type === 'spot' && (
                 <>
                    <div className="space-y-1">
                        <Label htmlFor="light-angle">Angle (degrees): {(((editedLight as SpotLightSceneProps).angle || Math.PI/4) * 180 / Math.PI).toFixed(1)}</Label>
                        <Slider id="light-angle" min={0} max={170} step={1} value={[(((editedLight as SpotLightSceneProps).angle || Math.PI/4) * 180 / Math.PI)]} onValueChange={([val]) => handleChange('angle', val * Math.PI / 180)} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="light-penumbra">Penumbra: {((editedLight as SpotLightSceneProps).penumbra || 0.1).toFixed(2)}</Label>
                        <Slider id="light-penumbra" min={0} max={1} step={0.01} value={[((editedLight as SpotLightSceneProps).penumbra || 0.1)]} onValueChange={([val]) => handleChange('penumbra', val)} />
                    </div>
                    <Label htmlFor="spot-ies">IES Profile (WIP)</Label><Input id="spot-ies" placeholder="path/to/profile.ies" className="h-8" disabled/>
                </>
            )}
            {editedLight.type === 'area' && (
                <>
                    <Label htmlFor="area-shape">Shape (WIP)</Label>
                    <Select value={(editedLight as AreaLightSceneProps).shape || 'rectangle'} onValueChange={val => handleChange('shape', val as any)} disabled>
                        <SelectTrigger id="area-shape" className="h-8"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="rectangle">Rectangle</SelectItem>
                            <SelectItem value="disk">Disk</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label htmlFor="area-width">Width</Label>
                            <Input id="area-width" type="number" min="0.1" step="0.1" value={(editedLight as AreaLightSceneProps).width || 2} onChange={(e) => handleChange('width', parseFloat(e.target.value))} className="h-8" />
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="area-height">Height</Label>
                            <Input id="area-height" type="number" min="0.1" step="0.1" value={(editedLight as AreaLightSceneProps).height || 1} onChange={(e) => handleChange('height', parseFloat(e.target.value))} className="h-8" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2"><Checkbox id="area-portal" checked={!!(editedLight as AreaLightSceneProps).isPortal} disabled/><Label htmlFor="area-portal" className="font-normal">Skylight Portal (WIP)</Label></div>
                </>
            )}
            {editedLight.type === 'skylight' && (
                <>
                 <Label htmlFor="skylight-hdri">HDRI Path (WIP)</Label><Input id="skylight-hdri" placeholder="path/to/hdri.hdr" className="h-8" disabled/>
                 <Label>HDRI Rotation (WIP): {((editedLight as SkyLightSceneProps).hdriRotation || 0)}°</Label><Slider value={[0]} disabled/>
                 <div className="flex items-center space-x-2"><Checkbox id="skylight-usesun" checked={!!(editedLight as SkyLightSceneProps).useSun} disabled/><Label htmlFor="skylight-usesun" className="font-normal">HDRI Sun Shadows (WIP)</Label></div>
                </>
            )}
             {editedLight.type === 'photometric' && (
                <>
                 <Label htmlFor="photometric-ies">IES File Path (WIP)</Label><Input id="photometric-ies" placeholder="path/to/light.ies" className="h-8" disabled/>
                 <Label htmlFor="photometric-filter">Filter Color (WIP)</Label><Input id="photometric-filter" type="color" value={(editedLight as PhotometricLightSceneProps).filterColor || '#FFFFFF'} className="h-8 w-full" disabled/>
                </>
            )}
             {editedLight.type === 'mesh_light' && (
                <>
                 <Label htmlFor="meshlight-object">Mesh Object ID (WIP)</Label><Input id="meshlight-object" placeholder="Select object from scene" className="h-8" disabled/>
                </>
            )}


            {(editedLight.type !== 'skylight' && editedLight.type !== 'area' && editedLight.type !== 'mesh_light') && ( // Area and mesh lights have specific shadow controls
                <>
                    <div className="flex items-center space-x-2 pt-1">
                        <Checkbox 
                            id="light-castShadow" 
                            checked={(editedLight as DirectionalLightSceneProps | PointLightSceneProps | SpotLightSceneProps).castShadow} 
                            onCheckedChange={(checked) => handleChange('castShadow', !!checked)}
                        />
                        <Label htmlFor="light-castShadow" className="font-normal">Cast Shadows</Label>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="light-shadowBias">Shadow Bias: {((editedLight as DirectionalLightSceneProps | PointLightSceneProps | SpotLightSceneProps).shadowBias || 0).toFixed(5)}</Label>
                        <Slider
                        id="light-shadowBias"
                        min={-0.01} max={0.01} step={0.0001}
                        value={[((editedLight as DirectionalLightSceneProps | PointLightSceneProps | SpotLightSceneProps).shadowBias || 0)]}
                        onValueChange={([val]) => handleChange('shadowBias', val)}
                        disabled={!(editedLight as DirectionalLightSceneProps | PointLightSceneProps | SpotLightSceneProps).castShadow}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="light-shadowRadius">Shadow Radius (Softness): {((editedLight as DirectionalLightSceneProps | PointLightSceneProps | SpotLightSceneProps).shadowRadius || 0).toFixed(2)}</Label>
                        <Slider id="light-shadowRadius" min={0} max={5} step={0.05} value={[((editedLight as DirectionalLightSceneProps | PointLightSceneProps | SpotLightSceneProps).shadowRadius || 0)]} onValueChange={([val]) => handleChange('shadowRadius', val)} disabled={!(editedLight as DirectionalLightSceneProps | PointLightSceneProps | SpotLightSceneProps).castShadow}/>
                    </div>
                </>
            )}
             <div className="space-y-1">
                <Label htmlFor="light-volumetric">Volumetric Contribution (WIP): {((editedLight as BaseLightProps).volumetricContribution || 1).toFixed(2)}</Label>
                <Slider id="light-volumetric" min={0} max={1} step={0.01} value={[((editedLight as BaseLightProps).volumetricContribution || 1)]} onValueChange={([val]) => handleChange('volumetricContribution', val)} disabled/>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="outline" size="sm">Cancel</Button></DialogClose>
          <DialogClose asChild><Button type="submit" onClick={handleSave} size="sm">Save Changes</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};



const LightingPanel = () => {
  const { 
    ambientLight, directionalLight, otherLights = [], 
    updateAmbientLight, updateDirectionalLight, 
    addLight, updateLight, removeLight, getLightById
  } = useScene();
  const { toast } = useToast();
  const [selectedLightId, setSelectedLightId] = useState<string | null>(null);
  
  const handleAmbientChange = useCallback((property: keyof AmbientLightProps, value: any) => {
    updateAmbientLight({ [property]: value });
  }, [updateAmbientLight]);

  const handleDirLightChange = useCallback((property: keyof DirectionalLightSceneProps | `position.${number}`, value: any) => {
    if (typeof property === 'string' && property.startsWith('position.')) {
        const index = parseInt(property.split('.')[1]);
        const newPosition = [...directionalLight.position] as [number, number, number];
        newPosition[index] = parseFloat(value) || 0;
        updateDirectionalLight({ position: newPosition });
    } else {
        updateDirectionalLight({ [property as keyof DirectionalLightSceneProps]: value });
    }
  }, [directionalLight.position, updateDirectionalLight]);

  const handleAddLight = (type: Exclude<LightType, 'ambient' | 'directional'>) => {
    const newLight = addLight(type);
    toast({ title: "Light Added", description: `${newLight.name} added to the scene.`});
    setSelectedLightId(newLight.id);
  };

  const handleRemoveLight = (id: string) => {
    removeLight(id);
    toast({ title: "Light Removed", description: `Light removed from the scene.`});
    if (selectedLightId === id) setSelectedLightId(null);
  };

  const handleToggleLightVisibility = (id: string) => {
    const light = getLightById(id) || (id === directionalLight.id ? directionalLight : null);
    if (light) {
      if(id === directionalLight.id) {
        updateDirectionalLight({ visible: !directionalLight.visible });
      } else {
        updateLight(id, { visible: !light.visible });
      }
      toast({ title: `Light ${light.visible ? "Hidden" : "Shown"}`, description: `${light.name} visibility updated.`})
    }
  };

  const selectedLightForDialog = selectedLightId ? (selectedLightId === directionalLight.id ? directionalLight : getLightById(selectedLightId)) : null;

  const getLightIcon = (type: LightType | undefined) => {
    if(!type) return HelpCircle;
    switch(type) {
        case 'point': return LampDesk;
        case 'spot': return LampCeiling;
        case 'area':
        case 'quad':
        case 'disk':
        case 'sphere':
        case 'cylinder_light': return LampWallUp;
        case 'directional': return Sun;
        case 'skylight': return CloudCog; 
        case 'photometric': return FileText; 
        case 'mesh_light': return Cpu; 
        default: return HelpCircle;
    }
  }


  return (
    <AccordionItem value="item-lighting">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Lightbulb size={18} /> Lighting
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-3 p-1 text-xs">
        <ScrollArea className="h-[calc(100vh-200px)] p-1"> {/* Adjust height */}
        <div className="space-y-3">
        {/* Ambient Light Controls */}
        <Accordion type="single" collapsible className="w-full border rounded-md" defaultValue="ambient-light-sub">
            <AccordionItem value="ambient-light-sub" className="border-b-0">
                <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center gap-1.5"><SigmaSquare size={14}/> Ambient Light</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    <Label htmlFor="ambient-color">Color</Label>
                    <Input id="ambient-color" type="color" value={ambientLight.color} onChange={(e) => handleAmbientChange('color', e.target.value)} className="h-8 w-full"/>
                    <Label htmlFor="ambient-intensity">Intensity: {ambientLight.intensity.toFixed(2)}</Label>
                    <Slider id="ambient-intensity" min={0} max={3} step={0.01} value={[ambientLight.intensity]} onValueChange={([val]) => handleAmbientChange('intensity', val)}/>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        {/* Directional Light Controls (Fixed) */}
        <Accordion type="single" collapsible className="w-full border rounded-md" defaultValue="dir-light-sub">
            <AccordionItem value="dir-light-sub" className="border-b-0">
                 <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center gap-1.5"><Sun size={14}/> Directional Light (Sun)</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    <div className="flex justify-end">
                         {selectedLightForDialog && selectedLightForDialog.id === directionalLight.id && (
                            <LightEditorDialog 
                                light={directionalLight} 
                                onSave={(_, updates) => updateDirectionalLight(updates as Partial<DirectionalLightSceneProps>)}
                                trigger={<Button variant="ghost" size="icon" className="h-7 w-7"><Edit3 size={14}/></Button>}
                                isDirectional={true}
                            />
                        )}
                    </div>
                    <Label htmlFor="directional-color">Color</Label>
                    <Input id="directional-color" type="color" value={directionalLight.color} onChange={(e) => handleDirLightChange('color', e.target.value)} className="h-8 w-full"/>
                    <Label htmlFor="directional-intensity">Intensity: {directionalLight.intensity.toFixed(2)}</Label>
                    <Slider id="directional-intensity" min={0} max={10} step={0.01} value={[directionalLight.intensity]} onValueChange={([val]) => handleDirLightChange('intensity', val)}/>
                    <VectorInput label="Position (Direction From)" value={directionalLight.position} onChange={(idx, val) => handleDirLightChange(`position.${idx}` as any, val)} step={0.5}/>
                    <div className="flex items-center space-x-2 pt-1">
                        <Checkbox id="dir-cast-shadow" checked={directionalLight.castShadow} onCheckedChange={(checked) => handleDirLightChange('castShadow', !!checked)}/>
                        <Label htmlFor="dir-cast-shadow" className="font-normal">Cast Shadows</Label>
                    </div>
                    <Label htmlFor="directional-shadowBias">Shadow Bias: {directionalLight.shadowBias.toFixed(5)}</Label>
                    <Slider id="directional-shadowBias" min={-0.01} max={0.01} step={0.0001} value={[directionalLight.shadowBias]} onValueChange={([val]) => handleDirLightChange('shadowBias', val)}/>
                    <div className="flex items-center space-x-2 pt-1">
                        <Checkbox id="dir-visible" checked={directionalLight.visible ?? true} onCheckedChange={(checked) => handleDirLightChange('visible', !!checked)}/>
                        <Label htmlFor="dir-visible" className="font-normal">Visible</Label>
                    </div>
                     <Label htmlFor="dir-sunangle">Sun Angle (Softness - WIP): {(directionalLight.sunAngle || 0.5).toFixed(2)}°</Label>
                     <Slider id="dir-sunangle" min={0.1} max={5} step={0.01} value={[directionalLight.sunAngle || 0.5]} onValueChange={([val]) => handleDirLightChange('sunAngle', val)} disabled/>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        {/* Other Lights (Point, Spot, Area, etc.) */}
        <Accordion type="single" collapsible className="w-full border rounded-md" defaultValue="other-lights-sub">
            <AccordionItem value="other-lights-sub" className="border-b-0">
                 <AccordionTrigger className="text-xs hover:no-underline px-2 py-2">
                    <div className="flex items-center gap-1.5"><LampDesk size={14}/> Scene Lights</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    <Select onValueChange={(type: Exclude<LightType, 'ambient' | 'directional'>) => handleAddLight(type)}>
                        <SelectTrigger className="h-8 w-full text-xs">
                            <PlusCircle size={12} className="mr-1" /> Add Light
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="point" className="text-xs"><LampDesk size={14} className="inline mr-2"/> Point Light</SelectItem>
                            <SelectItem value="spot" className="text-xs"><LampCeiling size={14} className="inline mr-2"/> Spot Light</SelectItem>
                            <SelectItem value="area" className="text-xs"><LampWallUp size={14} className="inline mr-2"/> Area Light (Rect)</SelectItem>
                            <SelectItem value="sphere" className="text-xs" disabled><LampWallUp size={14} className="inline mr-2"/> Sphere Light (WIP)</SelectItem>
                            <SelectItem value="disk" className="text-xs" disabled><LampWallUp size={14} className="inline mr-2"/> Disk Light (WIP)</SelectItem>
                            <SelectItem value="skylight" className="text-xs" disabled><CloudCog size={14} className="inline mr-2"/> Skylight/Dome (WIP)</SelectItem>
                            <SelectItem value="photometric" className="text-xs" disabled><FileText size={14} className="inline mr-2"/> Photometric/IES (WIP)</SelectItem>
                            <SelectItem value="mesh_light" className="text-xs" disabled><Cpu size={14} className="inline mr-2"/> Mesh Light (WIP)</SelectItem>
                        </SelectContent>
                    </Select>
                    <ScrollArea className="h-[150px] w-full rounded-sm border p-1 mt-1">
                        {otherLights.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No scene lights added.</p>}
                        <div className="space-y-0.5">
                            {otherLights.map(light => {
                                const CurrentLightIcon = getLightIcon(light.type);
                                return (
                                    <div key={light.id} className={cn("flex items-center justify-between p-1.5 rounded-sm text-xs hover:bg-muted/50", selectedLightId === light.id && "bg-muted ring-1 ring-primary")}>
                                        <button className="flex items-center gap-1.5 overflow-hidden flex-grow text-left" onClick={() => setSelectedLightId(light.id)}>
                                            <CurrentLightIcon size={12} className={cn(!light.visible && "opacity-50")}/>
                                            <span className={cn("truncate", !light.visible && "line-through text-muted-foreground")}>{light.name}</span>
                                        </button>
                                        <div className="flex items-center shrink-0">
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleToggleLightVisibility(light.id)}>
                                                {light.visible ? <Eye size={12}/> : <EyeOff size={12}/>}
                                            </Button>
                                            {selectedLightForDialog && selectedLightForDialog.id === light.id && (
                                                <LightEditorDialog 
                                                    light={light} 
                                                    onSave={updateLight}
                                                    trigger={<Button variant="ghost" size="icon" className="h-6 w-6"><Edit3 size={12}/></Button>}
                                                />
                                            )}
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleRemoveLight(light.id)}>
                                                <Trash2 size={12}/>
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </ScrollArea>
                     <p className="text-[10px] text-muted-foreground italic text-center pt-1">Light Lister and advanced properties (IES, Portals, etc.) are WIP.</p>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        </div>
        </ScrollArea>
      </AccordionContent>
    </AccordionItem>
  );
};

export default LightingPanel;
