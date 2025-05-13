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
import { SquarePen, Trash2 } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

const VectorInput: React.FC<{
  label: string;
  value: [number, number, number];
  onChange: (index: number, newValue: number) => void;
  step?: number;
  min?: number;
  max?: number;
  isDegrees?: boolean; 
}> = ({ label, value, onChange, step = 0.1, min = -1000, max = 1000, isDegrees = false }) => (
  <div className="space-y-1">
    <Label className="text-xs font-medium">{label} {isDegrees ? '(°)' : ''}</Label>
    <div className="grid grid-cols-3 gap-2">
      {['X', 'Y', 'Z'].map((axis, idx) => (
        <Input
          key={axis}
          type="number"
          aria-label={`${label} ${axis}`}
          value={isDegrees ? parseFloat((value[idx] * 180 / Math.PI).toFixed(1)) : value[idx]}
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
          className="h-9 text-sm" // Updated size
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
}> = ({ label, value, onChange, step = 0.1, min = 0.01, max = 1000 }) => (
  <div className="space-y-1">
    <Label htmlFor={`dim-${label.toLowerCase()}`} className="text-xs font-medium">{label}</Label>
    <Input
      id={`dim-${label.toLowerCase()}`}
      type="number"
      value={value === undefined || isNaN(value) ? '' : value}
      onChange={(e) => {
        let numValue = parseFloat(e.target.value);
        if (isNaN(numValue)) numValue = min; 
        onChange(Math.max(min, numValue)); 
      }}
      step={step}
      min={min}
      max={max}
      className="h-9 text-sm" // Updated size
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
    if (selectedObject) {
      let validatedValue = newValue;
      if (field === 'scale') {
        const MIN_SCALE = 0.01;
        if (validatedValue <= 0) {
          validatedValue = MIN_SCALE;
          toast({title: "Scale Adjusted", description: "Scale cannot be zero or negative. Set to minimum.", variant: "default", duration: 2000});
        }
      }
      const currentVector = [...selectedObject[field]] as [number, number, number];
      currentVector[index] = validatedValue; 
      updateObject(selectedObject.id, { [field]: currentVector });
    }
  }, [selectedObject, updateObject, toast]);

  const handleDimensionChange = useCallback((dimField: keyof SceneObject['dimensions'], newValue: number) => {
    if (selectedObject) {
      const newDimensions = { ...selectedObject.dimensions, [dimField]: newValue };
      updateObject(selectedObject.id, { dimensions: newDimensions });
    }
  }, [selectedObject, updateObject]);
  
  const handleMaterialChange = useCallback((newMaterialId: string) => {
    if (selectedObject) {
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

  if (!selectedObject) {
    return (
        <AccordionItem value="item-object-props" className="border-b-0">
            <AccordionTrigger className="hover:no-underline text-sm text-muted-foreground justify-center p-3">
                No object selected
            </AccordionTrigger>
        </AccordionItem>
    );
  }
  
  const currentMaterial = getMaterialById(selectedObject.materialId);

  return (
    <AccordionItem value="item-object-props">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <SquarePen size={18} /> Object Properties
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-3 p-2">
        <div className="space-y-1">
          <Label htmlFor="object-name" className="text-xs font-medium">Name</Label>
          <Input 
            id="object-name"
            value={selectedObject.name} 
            onChange={(e) => handleInputChange('name', e.target.value)} 
            className="h-9 text-sm" // Updated size
          />
        </div>

        <VectorInput label="Position" value={selectedObject.position} onChange={(idx, val) => handleVectorChange('position', idx, val)} step={0.1} />
        <VectorInput label="Rotation" value={selectedObject.rotation} onChange={(idx, val) => handleVectorChange('rotation', idx, val)} isDegrees={true} step={1} />
        <VectorInput label="Scale" value={selectedObject.scale} onChange={(idx, val) => handleVectorChange('scale', idx, val)} step={0.05} min={0.01}/>

        <h4 className="font-semibold text-xs pt-2 border-t mt-2 mb-1">Dimensions</h4>
        {selectedObject.type === 'cube' && (
          <>
            <DimensionInput label="Width (X)" value={selectedObject.dimensions.width} onChange={val => handleDimensionChange('width', val)} />
            <DimensionInput label="Height (Y)" value={selectedObject.dimensions.height} onChange={val => handleDimensionChange('height', val)} />
            <DimensionInput label="Depth (Z)" value={selectedObject.dimensions.depth} onChange={val => handleDimensionChange('depth', val)} />
          </>
        )}
        {selectedObject.type === 'cylinder' && (
          <>
            <DimensionInput label="Radius Top" value={selectedObject.dimensions.radiusTop} onChange={val => handleDimensionChange('radiusTop', val)} />
            <DimensionInput label="Radius Bottom" value={selectedObject.dimensions.radiusBottom} onChange={val => handleDimensionChange('radiusBottom', val)} />
            <DimensionInput label="Height" value={selectedObject.dimensions.height} onChange={val => handleDimensionChange('height', val)} />
            <DimensionInput label="Segments" value={selectedObject.dimensions.radialSegments} onChange={val => handleDimensionChange('radialSegments', Math.max(3, Math.round(val)))} step={1} min={3} max={128}/>
          </>
        )}
        {selectedObject.type === 'plane' && (
          <>
            <DimensionInput label="Width" value={selectedObject.dimensions.width} onChange={val => handleDimensionChange('width', val)} />
            <DimensionInput label="Height" value={selectedObject.dimensions.height} onChange={val => handleDimensionChange('height', val)} />
          </>
        )}
        {selectedObject.type === 'sphere' && (
          <>
            <DimensionInput label="Radius" value={selectedObject.dimensions.radius} onChange={val => handleDimensionChange('radius', val)} />
            <DimensionInput label="Width Segments" value={selectedObject.dimensions.radialSegments} onChange={val => handleDimensionChange('radialSegments', Math.max(3, Math.round(val)))} step={1} min={3} max={128}/>
            <DimensionInput label="Height Segments" value={selectedObject.dimensions.heightSegments} onChange={val => handleDimensionChange('heightSegments', Math.max(2, Math.round(val)))} step={1} min={2} max={64}/>
          </>
        )}
        {selectedObject.type === 'cone' && (
          <>
            <DimensionInput label="Radius" value={selectedObject.dimensions.radius} onChange={val => handleDimensionChange('radius', val)} />
            <DimensionInput label="Height" value={selectedObject.dimensions.height} onChange={val => handleDimensionChange('height', val)} />
            <DimensionInput label="Radial Segments" value={selectedObject.dimensions.radialSegments} onChange={val => handleDimensionChange('radialSegments', Math.max(3, Math.round(val)))} step={1} min={3} max={128}/>
          </>
        )}
        {selectedObject.type === 'torus' && (
          <>
            <DimensionInput label="Major Radius" value={selectedObject.dimensions.radius} onChange={val => handleDimensionChange('radius', val)} />
            <DimensionInput label="Tube Radius" value={selectedObject.dimensions.tube} onChange={val => handleDimensionChange('tube', val)} />
            <DimensionInput label="Radial Segments" value={selectedObject.dimensions.radialSegments} onChange={val => handleDimensionChange('radialSegments', Math.max(3, Math.round(val)))} step={1} min={3} max={64}/>
            <DimensionInput label="Tubular Segments" value={selectedObject.dimensions.tubularSegments} onChange={val => handleDimensionChange('tubularSegments', Math.max(3, Math.round(val)))} step={1} min={3} max={128}/>
          </>
        )}
         {selectedObject.type === 'polygon' && (
          <>
            <DimensionInput label="Radius" value={selectedObject.dimensions.radius} onChange={val => handleDimensionChange('radius', val)} />
            <DimensionInput label="Sides" value={selectedObject.dimensions.sides} onChange={val => handleDimensionChange('sides', Math.max(3, Math.round(val)))} step={1} min={3} max={32}/>
            {/* Placeholder for potential future extrusion/depth for polygons */}
            {/* <DimensionInput label="Depth (Extrusion)" value={selectedObject.dimensions.depth} onChange={val => handleDimensionChange('depth', val)} /> */}
          </>
        )}
        {selectedObject.type === 'text' && (
          <>
            <div className="space-y-1">
              <Label htmlFor="text-content" className="text-xs font-medium">Text Content (Placeholder)</Label>
              <Textarea 
                id="text-content" 
                value={selectedObject.dimensions.text || ""}
                onChange={(e) => handleInputChange('dimensions.text', e.target.value)}
                className="h-16 text-sm" // Updated size
                placeholder="Enter 3D text (feature in development)"
              />
            </div>
            <DimensionInput label="Font Size (Placeholder)" value={selectedObject.dimensions.fontSize} onChange={val => handleDimensionChange('fontSize', val)} min={0.1} max={10} />
            <DimensionInput label="Width (Bound)" value={selectedObject.dimensions.width} onChange={val => handleDimensionChange('width', val)} />
            <DimensionInput label="Height (Bound)" value={selectedObject.dimensions.height} onChange={val => handleDimensionChange('height', val)} />
            <DimensionInput label="Depth/Extrusion" value={selectedObject.dimensions.depth} onChange={val => handleDimensionChange('depth', val)} min={0.01} max={5} />
            <p className="text-xs text-muted-foreground italic">Actual TextGeometry rendering is a future feature. Dimensions control the placeholder.</p>
          </>
        )}
        {selectedObject.type === 'cadPlan' && (
            <p className="text-xs text-muted-foreground italic p-2 bg-muted/30 rounded-md">
              This is an imported CAD Plan. Its geometry is defined by the imported file. You can adjust its overall position, rotation, and scale. Individual line editing is not yet supported.
            </p>
        )}


        <div className="space-y-1 pt-2 border-t mt-2">
            <Label htmlFor="object-material" className="text-xs font-medium">Material</Label>
            <Select value={selectedObject.materialId} onValueChange={handleMaterialChange}>
              <SelectTrigger id="object-material" className="h-9 text-sm"> {/* Updated size */}
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {materials.map(material => (
                  <SelectItem key={material.id} value={material.id} className="text-sm"> {/* Updated text size */}
                    <div className="flex items-center gap-2">
                        <div style={{backgroundColor: material.color}} className="w-3 h-3 rounded-sm border shrink-0"/>
                        <span>{material.name || material.id}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentMaterial && (
                 <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 pl-1">
                    <div style={{backgroundColor: currentMaterial.color}} className="w-3 h-3 rounded-sm border shrink-0"/>
                    <span>Current: {currentMaterial.name || currentMaterial.id}</span>
                </div>
            )}
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="w-full text-sm h-9 mt-3"> {/* Updated size */}
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

      </AccordionContent>
    </AccordionItem>
  );
};

export default ObjectPropertiesPanel;
