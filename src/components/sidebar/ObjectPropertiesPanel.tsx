
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useScene } from "@/context/scene-context";
import type { SceneObject, ModifierType, AppliedModifier } from "@/types"; 
import { ALL_MODIFIER_TYPES } from "@/types"; // Import ALL_MODIFIER_TYPES
import { SquarePen, Trash2, PlusCircle, Layers as LayersIcon, Lock, Unlock, Group, Ungroup, Sigma, Bevel, Shell, BoxSelect, Link, Copy, ExternalLink, Info, Rotate3d, ScaleIcon, MoveIcon as TransformMoveIcon, Grid3X3, ChevronsUpDown, ChevronDown, ChevronUp, Eye, EyeOff, CopyIcon, Replace, Edit2 } from "lucide-react"; // PlusCircle is already here
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { v4 as uuidv4 } from 'uuid';

const VectorInput: React.FC<{
  label: string;
  value: [number, number, number];
  onChange: (index: number, newValue: number) => void;
  step?: number;
  min?: number;
  max?: number;
  isDegrees?: boolean; 
  disabled?: boolean;
}> = ({ label, value, onChange, step = 0.1, min = -10000, max = 10000, isDegrees = false, disabled = false }) => (
  <div className="space-y-1">
    <Label className="text-xs font-medium">{label} {isDegrees ? '(°)' : ''}</Label>
    <div className="grid grid-cols-3 gap-2">
      {['X', 'Y', 'Z'].map((axis, idx) => (
        <Input
          key={axis}
          type="number"
          aria-label={`${label} ${axis}`}
          value={isDegrees ? parseFloat((value[idx] * 180 / Math.PI).toFixed(1)) : parseFloat(value[idx].toFixed(3))}
          onChange={(e) => {
            let numValue = parseFloat(e.target.value);
            if (isNaN(numValue)) {
              numValue = 0;
            }
            onChange(idx, isDegrees ? numValue * Math.PI / 180 : numValue);
          }}
          step={isDegrees ? 1 : step}
          min={min} 
          max={max}
          className="h-9 text-sm"
          disabled={disabled}
        />
      ))}
    </div>
  </div>
);

const DimensionInput: React.FC<{
  label: string;
  value: number | undefined;
  onChange: (newValue: number) => void;
  step?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
}> = ({ label, value, onChange, step = 0.1, min = 0.001, max = 10000, disabled = false }) => (
  <div className="space-y-1">
    <Label htmlFor={`dim-${label.toLowerCase()}`} className="text-xs font-medium">{label}</Label>
    <Input
      id={`dim-${label.toLowerCase()}`}
      type="number"
      value={value === undefined || isNaN(value) ? '' : parseFloat(value.toFixed(3))} 
      onChange={(e) => {
        let numValue = parseFloat(e.target.value);
        if (isNaN(numValue)) numValue = min; 
        onChange(Math.max(min, numValue)); 
      }}
      step={step}
      min={min}
      max={max}
      className="h-9 text-sm"
      disabled={disabled}
    />
  </div>
);


const ObjectPropertiesPanel = () => {
  const { 
    selectedObjectId, objects, updateObject, removeObject, materials, getMaterialById, layers, activeLayerId,
    addModifierToObject, renameModifier, setModifierEnabled, reorderModifier, removeModifierFromObject 
  } = useScene();
  const [selectedObject, setSelectedObject] = useState<SceneObject | null>(null);
  const [newAttrKey, setNewAttrKey] = useState<string>("");
  const [newAttrValue, setNewAttrValue] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (selectedObjectId) {
      const obj = objects.find(o => o.id === selectedObjectId);
      setSelectedObject(obj || null);
    } else {
      setSelectedObject(null);
    }
  }, [selectedObjectId, objects]);

  const handleInputChange = useCallback((field: keyof SceneObject | `dimensions.text` | `customAttributes.${string}`, value: any) => {
    if (selectedObject) {
      if (field === 'dimensions.text') {
        const newDimensions = { ...selectedObject.dimensions, text: value as string };
        updateObject(selectedObject.id, { dimensions: newDimensions });
      } else if (field.startsWith('customAttributes.')) {
        const attrKey = field.split('.')[1];
        const newAttributes = { ...(selectedObject.customAttributes || {}), [attrKey]: value };
        updateObject(selectedObject.id, { customAttributes: newAttributes });
      }
      else {
        updateObject(selectedObject.id, { [field as keyof SceneObject]: value });
      }
    }
  }, [selectedObject, updateObject]);

  const handleVectorChange = useCallback((field: 'position' | 'rotation' | 'scale', index: number, newValue: number) => {
    if (selectedObject && !selectedObject.locked) {
      let validatedValue = newValue;
      if (field === 'scale') {
        const MIN_SCALE = 0.001; 
        if (Math.abs(validatedValue) < MIN_SCALE) { 
          validatedValue = validatedValue >= 0 ? MIN_SCALE : -MIN_SCALE;
          toast({title: "Scale Adjusted", description: "Scale magnitude cannot be less than 0.001. Set to minimum magnitude.", variant: "default", duration: 2000});
        }
      }
      const currentVector = [...selectedObject[field]] as [number, number, number];
      currentVector[index] = validatedValue; 
      updateObject(selectedObject.id, { [field]: currentVector });
    }
  }, [selectedObject, updateObject, toast]);

  const handleDimensionChange = useCallback((dimField: keyof SceneObject['dimensions'], newValue: number) => {
    if (selectedObject && !selectedObject.locked) {
      const newDimensions = { ...selectedObject.dimensions, [dimField]: newValue };
      updateObject(selectedObject.id, { dimensions: newDimensions });
    }
  }, [selectedObject, updateObject]);
  
  const handleMaterialChange = useCallback((newMaterialId: string) => {
    if (selectedObject && !selectedObject.locked) {
      updateObject(selectedObject.id, { materialId: newMaterialId });
      const materialName = materials.find(m => m.id === newMaterialId)?.name || "Selected Material";
      toast({title: "Material Changed", description: `${materialName} applied to ${selectedObject.name}.`});
    }
  }, [selectedObject, updateObject, materials, toast]);

  const handleDeleteObject = () => {
    if (selectedObject) {
      removeObject(selectedObject.id);
      toast({
        title: "Object Removed",
        description: `${selectedObject.name} has been removed from the scene.`,
      });
    }
  };
  
  const handleLockToggle = () => {
    if (selectedObject) {
      updateObject(selectedObject.id, { locked: !selectedObject.locked });
      toast({title: `Object ${selectedObject.locked ? "Unlocked" : "Locked"}`, description: `${selectedObject.name} is now ${selectedObject.locked ? "unlocked and editable" : "locked and protected"}.`});
    }
  };

  const handleLayerChange = (newLayerId: string) => {
     if (selectedObject && !selectedObject.locked) {
      updateObject(selectedObject.id, { layerId: newLayerId });
      const layerName = layers.find(l => l.id === newLayerId)?.name || "Selected Layer";
      toast({title: "Layer Changed", description: `${selectedObject.name} moved to ${layerName}.`});
    }
  };

  // const modifierTypes: ModifierType[] = ['bevel', 'subdivision', 'solidify', 'array', 'mirror', 'lattice', 'boolean', 'displacement', 'skin', 'shell', 'path_deform', 'ffd', 'cloth', 'hair_fur', 'noise_modifier', 'smooth_modifier', 'uvw_map_modifier', 'edit_poly_modifier', 'curve_modifier', 'shrinkwrap_modifier'];
  // Replaced by ALL_MODIFIER_TYPES directly in the Select component

  if (!selectedObject) {
    return (
        <AccordionItem value="item-object-props" className="border-b-0">
            <AccordionTrigger className="hover:no-underline text-sm text-muted-foreground justify-center p-3">
                <BoxSelect size={18} className="mr-2"/> No Object Selected
            </AccordionTrigger>
            <AccordionContent className="p-2 text-xs text-muted-foreground italic text-center">
                Select an object in the scene or Outliner to see its properties.
            </AccordionContent>
        </AccordionItem>
    );
  }
  
  const currentMaterial = getMaterialById(selectedObject.materialId);
  const isLocked = !!selectedObject.locked;

  return (
    <AccordionItem value="item-object-props">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <SquarePen size={18} /> Entity Info &amp; Transform
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-3 p-2 text-xs">
        {/* Entity Info Section */}
        <Accordion type="single" collapsible defaultValue="entity-info-main" className="w-full border rounded-md">
            <AccordionItem value="entity-info-main" className="border-b-0">
                <AccordionTrigger className="text-xs hover:no-underline px-2 py-2.5">
                    <div className="flex items-center gap-1.5"><Info size={14}/> Entity Info</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-0">
                    <div className="space-y-1">
                        <Label htmlFor="object-name">Name</Label>
                        <Input 
                            id="object-name"
                            value={selectedObject.name} 
                            onChange={(e) => handleInputChange('name', e.target.value)} 
                            className="h-9 text-sm"
                            disabled={isLocked}
                        />
                    </div>
                     <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <span>ID: {selectedObject.id.substring(0,8)}...</span>
                        <span>Type: {selectedObject.type.charAt(0).toUpperCase() + selectedObject.type.slice(1)}</span>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="object-layer">Layer (Tag)</Label>
                        <Select value={selectedObject.layerId || activeLayerId} onValueChange={handleLayerChange} disabled={isLocked}>
                            <SelectTrigger id="object-layer" className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {layers.map(layer => <SelectItem key={layer.id} value={layer.id} className="text-sm">{layer.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-1"> 
                        <Label className="text-xs">Component/Group Info (WIP)</Label>
                        <div className="p-2 bg-muted/30 rounded-md text-xs text-muted-foreground space-y-1">
                            <p>{selectedObject.isGroup ? "This is a Group." : (selectedObject.componentInstanceId ? `Instance of: ${selectedObject.name} (Main)` : (selectedObject.isComponentDefinition ? "This is a Component Definition." : "Not a component/group."))}</p>
                            <div className="flex gap-1">
                                <Button variant="outline" size="xs" className="h-6 text-[10px]" disabled><Group size={10} className="mr-1"/>Make Group</Button>
                                <Button variant="outline" size="xs" className="h-6 text-[10px]" disabled><LayersIcon size={10} className="mr-1"/>Make Component</Button>
                                {(selectedObject.isGroup || selectedObject.componentInstanceId) && <Button variant="outline" size="xs" className="h-6 text-[10px]" disabled><ExternalLink size={10} className="mr-1"/>Edit Group/Component</Button>}
                            </div>
                        </div>
                    </div>
                     <div className="space-y-1"> 
                        <Label className="text-xs">Calculated Info (WIP)</Label>
                        <div className="p-2 bg-muted/30 rounded-md text-xs text-muted-foreground">
                            <p>Vertices: N/A, Edges: N/A, Faces: N/A</p>
                            <p>Volume: N/A m³</p>
                            <p>Surface Area: N/A m²</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-medium">Custom Attributes</Label>
                        {Object.entries(selectedObject.customAttributes || {}).map(([key, value]) => (
                            <div key={key} className="grid grid-cols-[1fr_1fr_auto] items-center gap-1 mb-1">
                              <Input
                                value={key}
                                readOnly 
                                className="h-7 text-xs bg-muted/50 border-none" 
                                placeholder="Key"
                              />
                              <Input
                                value={value as string} // Assuming string values for now
                                onChange={(e) => {
                                  if (selectedObject) {
                                    const updatedAttributes = { ...selectedObject.customAttributes, [key]: e.target.value };
                                    updateObject(selectedObject.id, { customAttributes: updatedAttributes });
                                  }
                                }}
                                onBlur={(e) => {
                                    if (selectedObject && !isLocked) { // Only toast if not locked and object exists
                                        toast({ title: "Attribute Updated", description: `Attribute '${key}' updated.`, duration: 2000 });
                                    }
                                }}
                                className="h-7 text-xs"
                                placeholder="Value"
                                disabled={isLocked}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => {
                                  if (selectedObject) {
                                    const { [key]: _, ...remainingAttributes } = selectedObject.customAttributes || {};
                                    updateObject(selectedObject.id, { customAttributes: remainingAttributes });
                                    toast({ title: "Attribute Removed", description: `Attribute '${key}' removed.`, duration: 2000 });
                                  }
                                }}
                                disabled={isLocked}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                        ))}
                        <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-1 mt-2 pt-2 border-t">
                          <Input
                            placeholder="New Key"
                            value={newAttrKey}
                            onChange={(e) => setNewAttrKey(e.target.value)}
                            className="h-7 text-xs"
                            disabled={isLocked}
                          />
                          <Input
                            placeholder="New Value"
                            value={newAttrValue}
                            onChange={(e) => setNewAttrValue(e.target.value)}
                            className="h-7 text-xs"
                            disabled={isLocked}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              if (selectedObject && newAttrKey.trim() !== "") {
                                const updatedAttributes = { ...(selectedObject.customAttributes || {}), [newAttrKey.trim()]: newAttrValue };
                                updateObject(selectedObject.id, { customAttributes: updatedAttributes });
                                setNewAttrKey("");
                                setNewAttrValue("");
                                toast({ title: "Attribute Added", description: `Attribute '${newAttrKey.trim()}' added.`});
                              } else {
                                toast({ title: "Error", description: "Attribute key cannot be empty.", variant: "destructive"});
                              }
                            }}
                            disabled={isLocked}
                            title="Add Attribute"
                          >
                            <PlusCircle size={16} />
                          </Button>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>


        {/* Transform Section */}
         <Accordion type="single" collapsible defaultValue="transform-main" className="w-full border rounded-md">
            <AccordionItem value="transform-main" className="border-b-0">
                 <AccordionTrigger className="text-xs hover:no-underline px-2 py-2.5">
                    <div className="flex items-center gap-1.5"><TransformMoveIcon size={14}/> Transform</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 p-2 pt-1">
                    <VectorInput label="Position" value={selectedObject.position} onChange={(idx, val) => handleVectorChange('position', idx, val)} step={0.01} disabled={isLocked} />
                    <VectorInput label="Rotation" value={selectedObject.rotation} onChange={(idx, val) => handleVectorChange('rotation', idx, val)} isDegrees={true} step={0.1} disabled={isLocked} />
                    <VectorInput label="Scale" value={selectedObject.scale} onChange={(idx, val) => handleVectorChange('scale', idx, val)} step={0.01} min={0.001} disabled={isLocked} />
                    <div className="flex items-center justify-end gap-2 pt-1">
                        <Button variant="outline" size="xs" className="h-6 text-[10px]" disabled={isLocked}>Reset Position</Button>
                        <Button variant="outline" size="xs" className="h-6 text-[10px]" disabled={isLocked}>Reset Rotation</Button>
                        <Button variant="outline" size="xs" className="h-6 text-[10px]" disabled={isLocked}>Reset Scale</Button>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        {/* Dimensions Section */}
         <Accordion type="single" collapsible defaultValue="dimensions-main" className="w-full border rounded-md">
            <AccordionItem value="dimensions-main" className="border-b-0">
                <AccordionTrigger className="text-xs hover:no-underline px-2 py-2.5">
                    <div className="flex items-center gap-1.5"><ScaleIcon size={14}/> Dimensions</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 p-2 pt-1">
                     {selectedObject.type === 'cube' && (
                      <>
                        <DimensionInput label="Width (X)" value={selectedObject.dimensions.width} onChange={val => handleDimensionChange('width', val)} disabled={isLocked}/>
                        <DimensionInput label="Height (Y)" value={selectedObject.dimensions.height} onChange={val => handleDimensionChange('height', val)} disabled={isLocked}/>
                        <DimensionInput label="Depth (Z)" value={selectedObject.dimensions.depth} onChange={val => handleDimensionChange('depth', val)} disabled={isLocked}/>
                      </>
                    )}
                     {selectedObject.type === 'cylinder' && (
                      <>
                        <DimensionInput label="Radius Top" value={selectedObject.dimensions.radiusTop} onChange={val => handleDimensionChange('radiusTop', val)} disabled={isLocked}/>
                        <DimensionInput label="Radius Bottom" value={selectedObject.dimensions.radiusBottom} onChange={val => handleDimensionChange('radiusBottom', val)} disabled={isLocked}/>
                        <DimensionInput label="Height" value={selectedObject.dimensions.height} onChange={val => handleDimensionChange('height', val)} disabled={isLocked}/>
                        <DimensionInput label="Segments" value={selectedObject.dimensions.radialSegments} onChange={val => handleDimensionChange('radialSegments', Math.max(3, Math.round(val)))} step={1} min={3} max={128} disabled={isLocked}/>
                      </>
                    )}
                    {selectedObject.type === 'plane' && (
                      <>
                        <DimensionInput label="Width" value={selectedObject.dimensions.width} onChange={val => handleDimensionChange('width', val)} disabled={isLocked}/>
                        <DimensionInput label="Height (Depth for XZ plane)" value={selectedObject.dimensions.height} onChange={val => handleDimensionChange('height', val)} disabled={isLocked}/>
                      </>
                    )}
                    {selectedObject.type === 'sphere' && (
                      <>
                        <DimensionInput label="Radius" value={selectedObject.dimensions.radius} onChange={val => handleDimensionChange('radius', val)} disabled={isLocked}/>
                        <DimensionInput label="Width Segments" value={selectedObject.dimensions.radialSegments} onChange={val => handleDimensionChange('radialSegments', Math.max(3, Math.round(val)))} step={1} min={3} max={128} disabled={isLocked}/>
                        <DimensionInput label="Height Segments" value={selectedObject.dimensions.heightSegments} onChange={val => handleDimensionChange('heightSegments', Math.max(2, Math.round(val)))} step={1} min={2} max={64} disabled={isLocked}/>
                      </>
                    )}
                     {selectedObject.type === 'cone' && (
                      <>
                        <DimensionInput label="Radius" value={selectedObject.dimensions.radius} onChange={val => handleDimensionChange('radius', val)} disabled={isLocked}/>
                        <DimensionInput label="Height" value={selectedObject.dimensions.height} onChange={val => handleDimensionChange('height', val)} disabled={isLocked}/>
                        <DimensionInput label="Radial Segments" value={selectedObject.dimensions.radialSegments} onChange={val => handleDimensionChange('radialSegments', Math.max(3, Math.round(val)))} step={1} min={3} max={128} disabled={isLocked}/>
                      </>
                    )}
                    {selectedObject.type === 'torus' && (
                      <>
                        <DimensionInput label="Major Radius" value={selectedObject.dimensions.radius} onChange={val => handleDimensionChange('radius', val)} disabled={isLocked}/>
                        <DimensionInput label="Tube Radius" value={selectedObject.dimensions.tube} onChange={val => handleDimensionChange('tube', val)} disabled={isLocked}/>
                        <DimensionInput label="Radial Segments" value={selectedObject.dimensions.radialSegments} onChange={val => handleDimensionChange('radialSegments', Math.max(3, Math.round(val)))} step={1} min={3} max={64} disabled={isLocked}/>
                        <DimensionInput label="Tubular Segments" value={selectedObject.dimensions.tubularSegments} onChange={val => handleDimensionChange('tubularSegments', Math.max(3, Math.round(val)))} step={1} min={3} max={128} disabled={isLocked}/>
                      </>
                    )}
                     {selectedObject.type === 'polygon' && (
                      <>
                        <DimensionInput label="Radius" value={selectedObject.dimensions.radius} onChange={val => handleDimensionChange('radius', val)} disabled={isLocked}/>
                        <DimensionInput label="Sides" value={selectedObject.dimensions.sides} onChange={val => handleDimensionChange('sides', Math.max(3, Math.round(val)))} step={1} min={3} max={64} disabled={isLocked}/>
                      </>
                    )}
                    {selectedObject.type === 'circle' && (
                      <>
                        <DimensionInput label="Radius" value={selectedObject.dimensions.radius} onChange={val => handleDimensionChange('radius', val)} disabled={isLocked}/>
                        <DimensionInput label="Segments" value={selectedObject.dimensions.sides} onChange={val => handleDimensionChange('sides', Math.max(3, Math.round(val)))} step={1} min={3} max={128} disabled={isLocked}/>
                      </>
                    )}
                    {selectedObject.type === 'text' && (
                      <>
                        <div className="space-y-1">
                          <Label htmlFor="text-content" className="text-xs font-medium">Text Content (WIP)</Label>
                          <Textarea 
                            id="text-content" 
                            value={selectedObject.dimensions.text || ""}
                            onChange={(e) => handleInputChange('dimensions.text', e.target.value)}
                            className="h-16 text-sm"
                            placeholder="Enter 3D text (WIP)"
                            disabled 
                          />
                        </div>
                        <DimensionInput label="Font Size (WIP)" value={selectedObject.dimensions.fontSize} onChange={val => handleDimensionChange('fontSize', val)} min={0.01} max={100} disabled/>
                        <DimensionInput label="Depth/Extrusion (WIP)" value={selectedObject.dimensions.depth} onChange={val => handleDimensionChange('depth', val)} min={0.001} max={50} disabled/>
                        <p className="text-xs text-muted-foreground italic">Actual TextGeometry rendering is a future feature.</p>
                      </>
                    )}
                    {selectedObject.type === 'cadPlan' && (
                        <p className="text-xs text-muted-foreground italic p-2 bg-muted/30 rounded-md">
                          This is an imported CAD Plan. Its geometry is defined by the imported file. You can adjust its overall position, rotation, and scale. Individual line editing is not yet supported.
                        </p>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        

        {/* Modifier Stack Placeholder */}
        <Accordion type="single" collapsible className="w-full border rounded-md">
            <AccordionItem value="item-modifiers">
                <AccordionTrigger className="text-xs hover:no-underline px-2 py-2.5">
                    <div className="flex items-center gap-1.5"><Sigma size={14}/> Modifier Stack</div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 p-2 pt-1">
                    <ScrollArea className="h-[120px] border rounded-sm p-1 bg-muted/20">
                        {selectedObject.modifiers && selectedObject.modifiers.length > 0 ? (
                            selectedObject.modifiers.map((mod, index) => (
                                <div key={mod.id} className="p-1.5 border-b flex flex-col group hover:bg-muted/40">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1.5">
                                            <Checkbox 
                                                id={`mod-enabled-${mod.id}`}
                                                checked={mod.enabled} 
                                                onCheckedChange={(checked) => {
                                                    setModifierEnabled(selectedObject.id, mod.id, !!checked);
                                                    toast({ title: !!checked ? "Modifier Enabled" : "Modifier Disabled", description: `'${mod.name}' is now ${!!checked ? 'enabled' : 'disabled'}.`, duration: 2000 });
                                                }}
                                                className="h-3.5 w-3.5"
                                            />
                                            <Input 
                                                value={mod.name}
                                                onChange={(e) => renameModifier(selectedObject.id, mod.id, e.target.value)}
                                                onBlur={(e) => {
                                                    toast({ title: "Modifier Renamed", description: `Modifier renamed to '${e.target.value}'.`, duration: 2000 });
                                                }}
                                                className="h-6 text-xs border-none focus:ring-1 focus:ring-primary bg-transparent p-0 flex-grow"
                                                placeholder="Modifier Name"
                                            />
                                        </div>
                                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => {
                                                reorderModifier(selectedObject.id, mod.id, 'up');
                                                toast({ title: "Modifier Reordered", description: `'${mod.name}' moved up.`, duration: 1500 });
                                            }} disabled={index === 0}><ChevronUp size={12}/></Button>
                                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => {
                                                reorderModifier(selectedObject.id, mod.id, 'down');
                                                toast({ title: "Modifier Reordered", description: `'${mod.name}' moved down.`, duration: 1500 });
                                            }} disabled={index === (selectedObject.modifiers?.length ?? 0) - 1}><ChevronDown size={12}/></Button>
                                            <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => {
                                                const oldName = mod.name;
                                                removeModifierFromObject(selectedObject.id, mod.id);
                                                toast({ title: "Modifier Removed", description: `'${oldName}' removed.`, duration: 2000 });
                                            }}><Trash2 size={10}/></Button>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground text-[9px] leading-tight ml-5">Type: {mod.type.charAt(0).toUpperCase() + mod.type.slice(1).replace(/_/g, ' ')}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground text-[10px] py-2">No modifiers applied.</p>
                        )}
                    </ScrollArea>
                    <Select 
                        onValueChange={(value) => { 
                            if (selectedObject && value) { 
                                const modifierType = value as ModifierType;
                                addModifierToObject(selectedObject.id, modifierType); 
                                const valueDisplayName = modifierType.charAt(0).toUpperCase() + modifierType.slice(1).replace(/_/g, ' ');
                                toast({ title: "Modifier Added", description: `Modifier '${valueDisplayName}' added to ${selectedObject.name}.`, duration: 2000 });
                            } 
                        }}
                        value="" // Keep it empty to allow re-selection of same value if needed, or manage selection state
                    >
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Add Modifier"/></SelectTrigger>
                        <SelectContent>
                            {ALL_MODIFIER_TYPES.map(modType => (
                                <SelectItem key={modType} value={modType} className="text-xs">
                                    {modType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <p className="text-[10px] text-muted-foreground italic">Modifier parameters and geometric effects are WIP.</p>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        
        <div className="grid grid-cols-2 gap-2 pt-2 border-t mt-2">
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleLockToggle} title={selectedObject.locked ? "Unlock Object" : "Lock Object"}>
                {selectedObject.locked ? <Unlock size={14} className="mr-1.5"/> : <Lock size={14} className="mr-1.5"/>} {selectedObject.locked ? "Unlock" : "Lock"}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="w-full text-sm h-8">
                  <Trash2 size={14} className="mr-2" /> Delete Object
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {selectedObject.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the selected object.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteObject} className="bg-destructive hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>

      </AccordionContent>
    </AccordionItem>
  );
};

export default ObjectPropertiesPanel;

    