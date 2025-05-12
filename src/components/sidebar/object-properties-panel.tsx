
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
import { Slider } from "@/components/ui/slider";
import { useScene } from "@/context/scene-context";
import type { SceneObject, PrimitiveType } from "@/types";
import { SquarePen, Trash2 } from "lucide-react"; // Replaced Edit with SquarePen, added Trash2
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

const VectorInput: React.FC<{
  label: string;
  value: [number, number, number];
  onChange: (index: number, newValue: number) => void;
  step?: number;
  min?: number;
  max?: number;
}> = ({ label, value, onChange, step = 0.1, min = -100, max = 100 }) => (
  <div className="space-y-1">
    <Label className="text-xs font-medium">{label}</Label>
    <div className="grid grid-cols-3 gap-2">
      {['X', 'Y', 'Z'].map((axis, idx) => (
        <Input
          key={axis}
          type="number"
          aria-label={`${label} ${axis}`}
          value={value[idx]}
          onChange={(e) => onChange(idx, parseFloat(e.target.value) || 0)}
          step={step}
          min={min}
          max={max}
          className="h-8 text-xs"
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
}> = ({ label, value, onChange, step = 0.1, min = 0.01, max = 100 }) => (
  <div className="space-y-1">
    <Label htmlFor={`dim-${label.toLowerCase()}`} className="text-xs font-medium">{label}</Label>
    <Input
      id={`dim-${label.toLowerCase()}`}
      type="number"
      value={value === undefined ? '' : value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      step={step}
      min={min}
      max={max}
      className="h-8 text-xs"
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

  const handleInputChange = useCallback((field: keyof SceneObject, value: any) => {
    if (selectedObject) {
      updateObject(selectedObject.id, { [field]: value });
    }
  }, [selectedObject, updateObject]);

  const handleVectorChange = useCallback((field: 'position' | 'rotation' | 'scale', index: number, newValue: number) => {
    if (selectedObject) {
      const currentVector = [...selectedObject[field]] as [number, number, number];
      currentVector[index] = newValue;
      updateObject(selectedObject.id, { [field]: currentVector });
    }
  }, [selectedObject, updateObject]);

  const handleDimensionChange = useCallback((dimField: keyof SceneObject['dimensions'], newValue: number) => {
    if (selectedObject) {
      updateObject(selectedObject.id, { 
        dimensions: { ...selectedObject.dimensions, [dimField]: newValue } 
      });
    }
  }, [selectedObject, updateObject]);
  
  const handleMaterialChange = useCallback((newMaterialId: string) => {
    if (selectedObject) {
      updateObject(selectedObject.id, { materialId: newMaterialId });
    }
  }, [selectedObject, updateObject]);

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
    return null; // Don't render panel if no object is selected
  }
  
  const currentMaterial = getMaterialById(selectedObject.materialId);

  return (
    <AccordionItem value="item-object-props">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <SquarePen size={18} /> Object Properties
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 p-2">
        <div className="space-y-1">
          <Label htmlFor="object-name" className="text-xs font-medium">Name</Label>
          <Input 
            id="object-name"
            value={selectedObject.name} 
            onChange={(e) => handleInputChange('name', e.target.value)} 
            className="h-8 text-xs"
          />
        </div>

        <VectorInput label="Position" value={selectedObject.position} onChange={(idx, val) => handleVectorChange('position', idx, val)} step={0.1} />
        <VectorInput label="Rotation (°) " value={selectedObject.rotation.map(r => parseFloat((r * 180 / Math.PI).toFixed(1))) as [number,number,number]} 
          onChange={(idx, val) => {
             const newRotation = [...selectedObject.rotation] as [number,number,number];
             newRotation[idx] = val * Math.PI / 180;
             handleInputChange('rotation', newRotation);
          }} 
          step={1} 
        />
        <VectorInput label="Scale" value={selectedObject.scale} onChange={(idx, val) => handleVectorChange('scale', idx, val)} step={0.05} min={0.01}/>

        <h4 className="font-semibold text-sm pt-2 border-t mt-3">Dimensions</h4>
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

        <div className="space-y-1 pt-2 border-t mt-3">
            <Label htmlFor="object-material" className="text-xs font-medium">Material</Label>
            <Select value={selectedObject.materialId} onValueChange={handleMaterialChange}>
              <SelectTrigger id="object-material" className="h-8 text-xs">
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {materials.map(material => (
                  <SelectItem key={material.id} value={material.id} className="text-xs">
                    {material.name || material.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentMaterial && (
                 <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <div style={{backgroundColor: currentMaterial.color}} className="w-3 h-3 rounded-sm border"/>
                    <span>{currentMaterial.name || currentMaterial.id}</span>
                </div>
            )}
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="w-full text-xs mt-3">
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
              <AlertDialogAction onClick={handleDeleteObject}>
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
