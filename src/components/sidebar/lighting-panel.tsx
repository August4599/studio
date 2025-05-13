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
import type { AmbientLightProps, DirectionalLightSceneProps, PointLightSceneProps, SpotLightSceneProps, AreaLightSceneProps, SceneLight, LightType } from "@/types";
import { Lightbulb, Sun, LampDesk, LampCeiling, LampWallUp, Trash2, PlusCircle, Edit3, Eye, EyeOff } from "lucide-react";
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
  light: SceneLight | DirectionalLightSceneProps; // DirectionalLight is special
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
  
  const LightIcon = editedLight.type === 'point' ? LampDesk : editedLight.type === 'spot' ? LampCeiling : editedLight.type === 'area' ? LampWallUp : Sun;

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><LightIcon size={18}/> Edit Light: {editedLight.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1 pr-3">
          <div className="grid gap-4 py-4">
            {!isDirectional && // Name editable for other lights
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="light-name" className="text-right text-xs">Name</Label>
                <Input id="light-name" value={editedLight.name} onChange={(e) => handleChange('name', e.target.value)} className="col-span-3 h-9 text-sm" />
              </div>
            }
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="light-color" className="text-right text-xs">Color</Label>
              <Input id="light-color" type="color" value={editedLight.color} onChange={(e) => handleChange('color', e.target.value)} className="col-span-3 h-9" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="light-intensity" className="text-xs">Intensity: {editedLight.intensity.toFixed(2)}</Label>
              <Slider id="light-intensity" min={0} max={editedLight.type === 'area' ? 20 : 5} step={0.05} value={[editedLight.intensity]} onValueChange={([val]) => handleChange('intensity', val)} />
            </div>

            {(editedLight.type === 'directional' || editedLight.type === 'point' || editedLight.type === 'spot' || editedLight.type === 'area') && (
                 <VectorInput label="Position" value={(editedLight as any).position} onChange={(idx, val) => handleVectorChange('position', idx, val)} step={0.1} />
            )}
            {editedLight.type === 'spot' && (
                 <VectorInput label="Target Position" value={(editedLight as SpotLightSceneProps).targetPosition} onChange={(idx, val) => handleVectorChange('targetPosition', idx, val)} step={0.1} />
            )}
             {editedLight.type === 'area' && (
                 <VectorInput label="Rotation (Euler)" value={(editedLight as AreaLightSceneProps).rotation} onChange={(idx, val) => handleVectorChange('rotation', idx, val)} step={0.05} />
            )}

            {(editedLight.type === 'point' || editedLight.type === 'spot') && (
                <>
                    <div className="space-y-1">
                        <Label htmlFor="light-distance" className="text-xs">Distance: {((editedLight as PointLightSceneProps).distance || 0).toFixed(1)}</Label>
                        <Slider id="light-distance" min={0} max={50} step={0.5} value={[((editedLight as PointLightSceneProps).distance || 0)]} onValueChange={([val]) => handleChange('distance', val)} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="light-decay" className="text-xs">Decay: {((editedLight as PointLightSceneProps).decay || 0).toFixed(1)}</Label>
                        <Slider id="light-decay" min={0} max={5} step={0.1} value={[((editedLight as PointLightSceneProps).decay || 0)]} onValueChange={([val]) => handleChange('decay', val)} />
                    </div>
                </>
            )}
            {editedLight.type === 'spot' && (
                 <>
                    <div className="space-y-1">
                        <Label htmlFor="light-angle" className="text-xs">Angle (degrees): {(((editedLight as SpotLightSceneProps).angle || 0) * 180 / Math.PI).toFixed(1)}</Label>
                        <Slider id="light-angle" min={0} max={90} step={1} value={[((editedLight as SpotLightSceneProps).angle || 0) * 180 / Math.PI]} onValueChange={([val]) => handleChange('angle', val * Math.PI / 180)} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="light-penumbra" className="text-xs">Penumbra: {((editedLight as SpotLightSceneProps).penumbra || 0).toFixed(2)}</Label>
                        <Slider id="light-penumbra" min={0} max={1} step={0.01} value={[((editedLight as SpotLightSceneProps).penumbra || 0)]} onValueChange={([val]) => handleChange('penumbra', val)} />
                    </div>
                </>
            )}
            {editedLight.type === 'area' && (
                <>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label htmlFor="area-width" className="text-xs">Width</Label>
                            <Input id="area-width" type="number" min="0.1" step="0.1" value={(editedLight as AreaLightSceneProps).width || 1} onChange={(e) => handleChange('width', parseFloat(e.target.value))} className="h-9 text-sm" />
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="area-height" className="text-xs">Height</Label>
                            <Input id="area-height" type="number" min="0.1" step="0.1" value={(editedLight as AreaLightSceneProps).height || 1} onChange={(e) => handleChange('height', parseFloat(e.target.value))} className="h-9 text-sm" />
                        </div>
                    </div>
                </>
            )}

            {(editedLight.type === 'directional' || editedLight.type === 'point' || editedLight.type === 'spot') && (
                <>
                    <div className="flex items-center space-x-2 pt-1">
                        <Checkbox 
                            id="light-castShadow" 
                            checked={(editedLight as DirectionalLightSceneProps | PointLightSceneProps | SpotLightSceneProps).castShadow} 
                            onCheckedChange={(checked) => handleChange('castShadow', !!checked)}
                        />
                        <Label htmlFor="light-castShadow" className="text-xs font-normal">Cast Shadows</Label>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="light-shadowBias" className="text-xs">Shadow Bias: {((editedLight as DirectionalLightSceneProps | PointLightSceneProps | SpotLightSceneProps).shadowBias || 0).toFixed(5)}</Label>
                        <Slider
                        id="light-shadowBias"
                        min={-0.01} max={0.01} step={0.0001}
                        value={[((editedLight as DirectionalLightSceneProps | PointLightSceneProps | SpotLightSceneProps).shadowBias || 0)]}
                        onValueChange={([val]) => handleChange('shadowBias', val)}
                        disabled={!(editedLight as DirectionalLightSceneProps | PointLightSceneProps | SpotLightSceneProps).castShadow}
                        />
                    </div>
                </>
            )}
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


  return (
    <AccordionItem value="item-lighting">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Lightbulb size={18} /> Lighting
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 p-2">
        {/* Ambient Light Controls */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Ambient Light</h4>
          <div className="space-y-1">
            <Label htmlFor="ambient-color" className="text-xs">Color</Label>
            <Input
              id="ambient-color"
              type="color"
              value={ambientLight.color}
              onChange={(e) => handleAmbientChange('color', e.target.value)}
              className="h-9 w-full" // Updated size
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ambient-intensity" className="text-xs">Intensity: {ambientLight.intensity.toFixed(2)}</Label>
            <Slider
              id="ambient-intensity"
              min={0} max={2} step={0.01}
              value={[ambientLight.intensity]}
              onValueChange={([val]) => handleAmbientChange('intensity', val)}
            />
          </div>
        </div>

        {/* Directional Light Controls (Fixed) */}
        <div className="space-y-2 border-t pt-3 mt-3">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-sm flex items-center gap-1"><Sun size={16}/> Directional Light</h4>
             {selectedLightForDialog && selectedLightForDialog.id === directionalLight.id && (
                <LightEditorDialog 
                    light={directionalLight} 
                    onSave={(_, updates) => updateDirectionalLight(updates as Partial<DirectionalLightSceneProps>)}
                    trigger={<Button variant="ghost" size="icon" className="h-7 w-7"><Edit3 size={14}/></Button>} // Updated size
                    isDirectional={true}
                />
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="directional-color" className="text-xs">Color</Label>
            <Input
              id="directional-color"
              type="color"
              value={directionalLight.color}
              onChange={(e) => handleDirLightChange('color', e.target.value)}
              className="h-9 w-full" // Updated size
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="directional-intensity" className="text-xs">Intensity: {directionalLight.intensity.toFixed(2)}</Label>
            <Slider
              id="directional-intensity"
              min={0} max={5} step={0.01}
              value={[directionalLight.intensity]}
              onValueChange={([val]) => handleDirLightChange('intensity', val)}
            />
          </div>
          <VectorInput label="Position" value={directionalLight.position} onChange={(idx, val) => handleDirLightChange(`position.${idx}` as any, val)} step={0.5}/>
          <div className="flex items-center space-x-2 pt-1">
            <Checkbox 
                id="dir-cast-shadow" 
                checked={directionalLight.castShadow} 
                onCheckedChange={(checked) => handleDirLightChange('castShadow', !!checked)}
            />
            <Label htmlFor="dir-cast-shadow" className="text-xs font-normal">Cast Shadows</Label>
          </div>
           <div className="space-y-1">
            <Label htmlFor="directional-shadowBias" className="text-xs">Shadow Bias: {directionalLight.shadowBias.toFixed(5)}</Label>
            <Slider
              id="directional-shadowBias"
              min={-0.01} max={0.01} step={0.0001}
              value={[directionalLight.shadowBias]}
              onValueChange={([val]) => handleDirLightChange('shadowBias', val)}
            />
          </div>
           <div className="flex items-center space-x-2 pt-1">
            <Checkbox 
                id="dir-visible" 
                checked={directionalLight.visible ?? true} 
                onCheckedChange={(checked) => handleDirLightChange('visible', !!checked)}
            />
            <Label htmlFor="dir-visible" className="text-xs font-normal">Visible</Label>
          </div>
        </div>

        {/* Other Lights (Point, Spot, Area) */}
        <div className="space-y-2 border-t pt-3 mt-3">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm">Other Lights</h4>
                <Select onValueChange={(type: Exclude<LightType, 'ambient' | 'directional'>) => handleAddLight(type)}>
                    <SelectTrigger className="h-9 w-auto text-sm px-3 py-1"> {/* Updated size & text */}
                        <PlusCircle size={14} className="mr-1" /> Add Light
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="point" className="text-sm"><LampDesk size={14} className="inline mr-2"/> Point Light</SelectItem> {/* Updated text size */}
                        <SelectItem value="spot" className="text-sm"><LampCeiling size={14} className="inline mr-2"/> Spot Light</SelectItem> {/* Updated text size */}
                        <SelectItem value="area" className="text-sm"><LampWallUp size={14} className="inline mr-2"/> Area Light</SelectItem> {/* Updated text size */}
                    </SelectContent>
                </Select>
            </div>
            <ScrollArea className="h-[150px] w-full rounded-md border p-1">
                {otherLights.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No other lights yet.</p>}
                <div className="space-y-1">
                    {otherLights.map(light => {
                        const LightIcon = light.type === 'point' ? LampDesk : light.type === 'spot' ? LampCeiling : LampWallUp;
                        return (
                            <div key={light.id} className={cn("flex items-center justify-between p-1.5 rounded-md text-sm hover:bg-muted/50", selectedLightId === light.id && "bg-muted")}> {/* Updated text size */}
                                <button className="flex items-center gap-1.5 overflow-hidden flex-grow text-left" onClick={() => setSelectedLightId(light.id)}>
                                    <LightIcon size={14} className={cn(!light.visible && "opacity-50")}/>
                                    <span className={cn("truncate", !light.visible && "line-through text-muted-foreground")}>{light.name}</span>
                                </button>
                                <div className="flex items-center shrink-0">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleToggleLightVisibility(light.id)}> {/* Updated size */}
                                        {light.visible ? <Eye size={14}/> : <EyeOff size={14}/>}
                                    </Button>
                                    {selectedLightForDialog && selectedLightForDialog.id === light.id && (
                                        <LightEditorDialog 
                                            light={light} 
                                            onSave={updateLight}
                                            trigger={<Button variant="ghost" size="icon" className="h-7 w-7"><Edit3 size={14}/></Button>} // Updated size
                                        />
                                    )}
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleRemoveLight(light.id)}> {/* Updated size */}
                                        <Trash2 size={14}/>
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </ScrollArea>
        </div>

      </AccordionContent>
    </AccordionItem>
  );
};

export default LightingPanel;
