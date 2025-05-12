"use client";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScene } from "@/context/scene-context";
import type { PrimitiveType, SceneObject } from "@/types";
import { Shapes, Trash2, PlusCircle } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";

const ObjectPanel = () => {
  const { objects, addObject, updateObject, removeObject, selectedObjectId, selectObject, getMaterialById } = useScene();
  const [selectedObjectData, setSelectedObjectData] = useState<SceneObject | null>(null);

  useEffect(() => {
    if (selectedObjectId) {
      setSelectedObjectData(objects.find(obj => obj.id === selectedObjectId) || null);
    } else {
      setSelectedObjectData(null);
    }
  }, [selectedObjectId, objects]);

  const handleAddObject = (type: PrimitiveType) => {
    addObject(type);
  };

  const handleInputChange = useCallback((field: keyof SceneObject | `dimensions.${string}` | `position.${number}` | `rotation.${number}` | `scale.${number}`, value: string | number) => {
    if (!selectedObjectId || !selectedObjectData) return;

    const parsedValue = typeof value === 'string' && (field.startsWith('position') || field.startsWith('rotation') || field.startsWith('scale') || field.startsWith('dimensions')) ? parseFloat(value) : value;

    if (typeof parsedValue === 'number' && isNaN(parsedValue)) return; // Prevent NaN values

    let newUpdates: Partial<SceneObject> = {};

    if (field.startsWith('dimensions.')) {
      const dimensionKey = field.split('.')[1] as keyof SceneObject['dimensions'];
      newUpdates.dimensions = { ...selectedObjectData.dimensions, [dimensionKey]: parsedValue as number };
    } else if (field.startsWith('position.')) {
      const index = parseInt(field.split('.')[1]);
      const newPosition = [...selectedObjectData.position] as [number, number, number];
      newPosition[index] = parsedValue as number;
      newUpdates.position = newPosition;
    } else if (field.startsWith('rotation.')) {
       const index = parseInt(field.split('.')[1]);
      const newRotation = [...selectedObjectData.rotation] as [number, number, number];
      // Convert degrees to radians for internal storage if needed, or keep as degrees if UI is degrees
      newRotation[index] = parsedValue as number; // Assuming direct input in radians or degrees, consistent with viewer
      newUpdates.rotation = newRotation;
    } else if (field.startsWith('scale.')) {
       const index = parseInt(field.split('.')[1]);
      const newScale = [...selectedObjectData.scale] as [number, number, number];
      newScale[index] = parsedValue as number;
      newUpdates.scale = newScale;
    } else {
      newUpdates = { [field as keyof SceneObject]: parsedValue };
    }
    
    updateObject(selectedObjectId, newUpdates);
  }, [selectedObjectId, selectedObjectData, updateObject]);


  const renderDimensionControls = () => {
    if (!selectedObjectData) return null;
    const { type, dimensions } = selectedObjectData;

    switch (type) {
      case 'cube':
        return (
          <>
            <DimensionInput label="Width" value={dimensions.width || 0} onChange={val => handleInputChange('dimensions.width', val)} />
            <DimensionInput label="Height" value={dimensions.height || 0} onChange={val => handleInputChange('dimensions.height', val)} />
            <DimensionInput label="Depth" value={dimensions.depth || 0} onChange={val => handleInputChange('dimensions.depth', val)} />
          </>
        );
      case 'cylinder':
        return (
          <>
            <DimensionInput label="Radius Top" value={dimensions.radiusTop || 0} onChange={val => handleInputChange('dimensions.radiusTop', val)} />
            <DimensionInput label="Radius Bottom" value={dimensions.radiusBottom || 0} onChange={val => handleInputChange('dimensions.radiusBottom', val)} />
            <DimensionInput label="Height" value={dimensions.height || 0} onChange={val => handleInputChange('dimensions.height', val)} />
            <DimensionInput label="Segments" value={dimensions.radialSegments || 32} onChange={val => handleInputChange('dimensions.radialSegments', val)} />
          </>
        );
      case 'plane':
        return (
          <>
            <DimensionInput label="Width" value={dimensions.width || 0} onChange={val => handleInputChange('dimensions.width', val)} />
            <DimensionInput label="Height (Depth)" value={dimensions.height || 0} onChange={val => handleInputChange('dimensions.height', val)} />
          </>
        );
      default:
        return null;
    }
  };

  const DimensionInput: React.FC<{label: string; value: number; onChange: (value: string) => void;}> = ({ label, value, onChange }) => (
    <div className="grid grid-cols-3 items-center gap-2">
      <Label htmlFor={`${label}-dim`} className="col-span-1 text-xs">{label}</Label>
      <Input id={`${label}-dim`} type="number" value={value} onChange={e => onChange(e.target.value)} className="col-span-2 h-8 text-xs" step={0.1}/>
    </div>
  );
  
  const VectorInput: React.FC<{label: string; value: [number,number,number]; onChange: (idx: number, val: string) => void; unit?: string}> = ({label, value, onChange, unit}) => (
    <div>
        <Label className="text-sm font-medium">{label} {unit && `(${unit})`}</Label>
        <div className="grid grid-cols-3 gap-2 mt-1">
            {['X', 'Y', 'Z'].map((axis, idx) => (
                <div key={axis}>
                    <Label htmlFor={`${label}-${axis}`} className="text-xs">{axis}</Label>
                    <Input id={`${label}-${axis}`} type="number" value={value[idx]} onChange={e => onChange(idx, e.target.value)} className="h-8 text-xs" step={label === 'Scale' ? 0.1 : (label === 'Rotation' ? 1 : 0.1)} />
                </div>
            ))}
        </div>
    </div>
  );


  return (
    <AccordionItem value="item-objects">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Shapes size={18} /> Objects
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 p-2">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Add Primitive</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => handleAddObject('cube')}>Cube</Button>
            <Button variant="outline" size="sm" onClick={() => handleAddObject('cylinder')}>Cylinder</Button>
            <Button variant="outline" size="sm" onClick={() => handleAddObject('plane')}>Plane</Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Scene Objects ({objects.length})</Label>
          {objects.length === 0 ? (
            <p className="text-xs text-muted-foreground">No objects in scene. Add one above.</p>
          ) : (
            <Select onValueChange={selectObject} value={selectedObjectId || ""}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select an object" />
              </SelectTrigger>
              <SelectContent>
                {objects.map(obj => (
                  <SelectItem key={obj.id} value={obj.id} className="text-xs">
                    {obj.name} ({obj.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        {selectedObjectData && (
          <div className="space-y-3 border-t pt-3 mt-3">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm">Edit: {selectedObjectData.name}</h4>
                <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => removeObject(selectedObjectData.id)}>
                    <Trash2 size={14} />
                </Button>
            </div>
            <div>
                <Label htmlFor="obj-name" className="text-xs">Name</Label>
                <Input id="obj-name" value={selectedObjectData.name} onChange={e => handleInputChange('name', e.target.value)} className="h-8 text-xs"/>
            </div>

            <VectorInput label="Position" value={selectedObjectData.position} onChange={(idx, val) => handleInputChange(`position.${idx}` as any, val)} />
            <VectorInput label="Rotation" value={selectedObjectData.rotation.map(r => parseFloat((r * 180 / Math.PI).toFixed(2))) as [number,number,number]} onChange={(idx, val) => handleInputChange(`rotation.${idx}` as any, parseFloat(val) * Math.PI / 180)} unit="deg"/>
            <VectorInput label="Scale" value={selectedObjectData.scale} onChange={(idx, val) => handleInputChange(`scale.${idx}` as any, val)} />
            
            <div>
                <Label className="text-sm font-medium">Dimensions</Label>
                <div className="space-y-1 mt-1">
                    {renderDimensionControls()}
                </div>
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default ObjectPanel;
