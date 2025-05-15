
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
import type { SceneObject } from "@/types"; 
import { SquarePen, Trash2, PlusCircle, Layers as LayersIcon, Lock, Unlock, Group, Ungroup, Sigma, Bevel, Shell, BoxSelect, Link, Copy, ExternalLink, Info, Rotate3d, ScaleIcon, MoveIcon as TransformMoveIcon } from "lucide-react";
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
  const { selectedObjectId, objects, updateObject, removeObject, materials, getMaterialById } = useScene();
  const [selectedObject, setSelectedObject] = useState<SceneObject | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedObjectId) {
      const obj = objects.find(o => o.id === selectedObjectId);
      setSelectedObject(obj || null);
    } else {
      setSelectedObject(null);
    }
  }, [selectedObjectId, objects]);

  const handleInputChange = useCallback((field: keyof SceneObject | `dimensions.text`, value: any) => {
    if (selectedObject) {
      if (field === 'dimensions.text') {
        const newDimensions = { ...selectedObject.dimensions, text: value as string };
        updateObject(selectedObject.id, { dimensions: newDimensions });
      } else {
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

  // Mock layers for dropdown - in a real app, this would come from LayersPanel/Context
  const mockLayers = [
    { id: 'default-layer-0', name: 'Default Layer' },
    { id: 'layer-walls', name: 'Walls' },
    { id: 'layer-furniture', name: 'Furniture' },
  ];


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
                        <Label htmlFor="object-layer">Layer (Tag) (WIP)</Label>
                        <Select value={selectedObject.layerId || 'default-layer-0'} onValueChange={(val) => handleInputChange('layerId', val)} disabled={isLocked}>
                            <SelectTrigger id="object-layer" className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {mockLayers.map(layer => <SelectItem key={layer.id} value={layer.id} className="text-sm">{layer.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-1"> {/* Component/Group Info Placeholder */}
                        <Label className="text-xs">Component/Group Info (WIP)</Label>
                        <div className="p-2 bg-muted/30 rounded-md text-xs text-muted-foreground">
                            {selectedObject.isGroup ? "This is a Group." : (selectedObject.parentId ? `Instance of: Component XYZ (WIP)` : "Not a component/group.")}
                            { (selectedObject.isGroup || selectedObject.parentId) && <Button variant="outline" size="xs" className="mt-1 h-6 text-[10px]" disabled>Edit Group/Component</Button>}
                        </div>
                    </div>
                     <div className="space-y-1"> {/* Calculated Info Placeholder */}
                        <Label className="text-xs">Calculated Info (WIP)</Label>
                        <div className="p-2 bg-muted/30 rounded-md text-xs text-muted-foreground">
                            <p>Volume: N/A m³</p>
                            <p>Surface Area: N/A m²</p>
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
                    {/* ... (other primitive dimension inputs remain similar, add disabled={isLocked}) ... */}
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
                            disabled // Text rendering itself is WIP
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
        

        {/* Material Assignment Section - Simplified to a display and button to go to material editor */}
        <div className="pt-2 border-t mt-2 space-y-1">
            <Label className="text-xs font-medium">Material</Label>
            <div className="p-2 bg-muted/30 rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {currentMaterial && <div style={{backgroundColor: currentMaterial.color}} className="w-4 h-4 rounded-sm border shrink-0"/>}
                    <span className="text-xs truncate">{currentMaterial ? (currentMaterial.name || currentMaterial.id) : "No Material"}</span>
                </div>
                <Button variant="outline" size="xs" className="h-6 text-[10px]" disabled>Edit Material (Go to Materials Tab)</Button>
            </div>
        </div>
        
        {/* Modifier Stack Placeholder */}
        <div className="pt-2 border-t mt-2">
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-modifiers">
                    <AccordionTrigger className="text-xs hover:no-underline py-2">
                        <div className="flex items-center gap-1.5"><Sigma size={14}/> Modifier Stack (WIP)</div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 p-1">
                        <ScrollArea className="h-[120px] border rounded-sm p-1 bg-muted/20">
                            <p className="text-center text-muted-foreground text-[10px] py-2">No modifiers applied.</p>
                            {/* Placeholder for modifier list items: 
                                <div className="text-[10px] p-1 border-b">Bevel Modifier (Strength: 0.1, Segments: 2)</div>
                            */}
                        </ScrollArea>
                        <Select disabled>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Add Modifier"/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bevel" className="text-xs"><Bevel size={12} className="inline mr-1"/> Bevel</SelectItem>
                                <SelectItem value="subdivision" className="text-xs"><Shell size={12} className="inline mr-1"/> Subdivision Surface</SelectItem>
                                <SelectItem value="solidify" className="text-xs"><LayersIcon size={12} className="inline mr-1"/> Solidify</SelectItem>
                                <SelectItem value="array" className="text-xs"><Copy size={12} className="inline mr-1"/> Array</SelectItem>
                                <SelectItem value="mirror" className="text-xs"><Link size={12} className="inline mr-1"/> Mirror</SelectItem>
                                <SelectItem value="boolean" className="text-xs"><Sigma size={12} className="inline mr-1"/> Boolean</SelectItem>
                                <SelectItem value="displacement" className="text-xs"><ExternalLink size={12} className="inline mr-1"/> Displacement</SelectItem>
                                <SelectItem value="lattice" className="text-xs"><Grid3X3 size={12} className="inline mr-1"/> Lattice (WIP)</SelectItem>
                            </SelectContent>
                        </Select>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
        
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
