"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useScene } from "@/context/scene-context";
import type { MaterialProperties, SceneObject } from "@/types";
import { DEFAULT_MATERIAL_ID } from "@/types";
import { Palette, UploadCloud } from "lucide-react";
import { fileToDataURL } from "@/lib/three-utils";

const MaterialPanel = () => {
  const { selectedObjectId, objects, materials, updateMaterial, updateObject, getMaterialById, addMaterial } = useScene();
  const [selectedObject, setSelectedObject] = useState<SceneObject | null>(null);
  const [currentMaterial, setCurrentMaterial] = useState<MaterialProperties | null>(null);

  useEffect(() => {
    const obj = objects.find(o => o.id === selectedObjectId);
    setSelectedObject(obj || null);
    if (obj) {
      const mat = getMaterialById(obj.materialId);
      setCurrentMaterial(mat || null);
    } else {
      setCurrentMaterial(null);
    }
  }, [selectedObjectId, objects, getMaterialById]);

  const handleMaterialChange = useCallback((property: keyof MaterialProperties, value: any) => {
    if (!currentMaterial || !selectedObject) return;

    // If it's the default material, create a new one for this object
    let targetMaterialId = currentMaterial.id;
    if (currentMaterial.id === DEFAULT_MATERIAL_ID) {
        const newMaterialProps = { ...currentMaterial };
        delete (newMaterialProps as any).id; // remove id before creating new
        targetMaterialId = addMaterial(newMaterialProps);
        updateObject(selectedObject.id, { materialId: targetMaterialId });
        // The useEffect above will pick up the new material in the next render cycle
        // For immediate update:
        const newMat = getMaterialById(targetMaterialId);
        if (newMat) {
            setCurrentMaterial(newMat); // Update local state to reflect new material
            updateMaterial(targetMaterialId, { [property]: value });
        }
        return;
    }
    
    updateMaterial(targetMaterialId, { [property]: value });
  }, [currentMaterial, updateMaterial, addMaterial, selectedObject, updateObject, getMaterialById]);

  const handleTextureUpload = async (property: 'map' | 'normalMap' | 'roughnessMap' | 'metalnessMap' | 'aoMap', file: File | null) => {
    if (!file || !currentMaterial) return;
    try {
      const dataUrl = await fileToDataURL(file);
      // In a real app, you might upload to a server and get a URL. For simplicity, using data URLs.
      // Note: Data URLs can be very long and inefficient for large textures.
      // Consider using `URL.createObjectURL(file)` for local previews if not saving scene with embedded textures.
      handleMaterialChange(property, dataUrl);
    } catch (error) {
      console.error("Error processing texture file:", error);
      // Add toast notification for user
    }
  };
  
  const TextureInput: React.FC<{label: string; mapType: 'map' | 'normalMap' | 'roughnessMap' | 'metalnessMap' | 'aoMap'; currentValue?: string}> = 
  ({label, mapType, currentValue}) => (
    <div className="space-y-1">
      <Label htmlFor={`${mapType}-upload`} className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <Input 
            id={`${mapType}-upload`} 
            type="file" 
            accept="image/*" 
            onChange={(e) => handleTextureUpload(mapType, e.target.files ? e.target.files[0] : null)}
            className="h-8 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-sm file:border-0 file:text-xs file:bg-muted file:text-muted-foreground hover:file:bg-muted/50"
        />
        {currentValue && <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleMaterialChange(mapType, undefined)}>Clear</Button>}
      </div>
      {currentValue && <img data-ai-hint="texture preview" src={currentValue} alt={`${label} preview`} className="mt-1 h-10 w-10 object-cover rounded-sm border" />}
    </div>
  );


  if (!selectedObject || !currentMaterial) {
    return (
      <AccordionItem value="item-materials">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <Palette size={18} /> Materials & Textures
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-2">
          <p className="text-xs text-muted-foreground">Select an object to edit its material.</p>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <AccordionItem value="item-materials">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Palette size={18} /> Materials & Textures
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 p-2">
        <h4 className="font-semibold text-sm">Editing Material for: {selectedObject.name}</h4>
        
        <div className="space-y-1">
          <Label htmlFor="mat-color" className="text-xs">Color</Label>
          <Input 
            id="mat-color" 
            type="color" 
            value={currentMaterial.color} 
            onChange={(e) => handleMaterialChange('color', e.target.value)}
            className="h-8 w-full"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="mat-roughness" className="text-xs">Roughness: {currentMaterial.roughness.toFixed(2)}</Label>
          <Slider
            id="mat-roughness"
            min={0} max={1} step={0.01}
            value={[currentMaterial.roughness]}
            onValueChange={([val]) => handleMaterialChange('roughness', val)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="mat-metalness" className="text-xs">Metalness: {currentMaterial.metalness.toFixed(2)}</Label>
          <Slider
            id="mat-metalness"
            min={0} max={1} step={0.01}
            value={[currentMaterial.metalness]}
            onValueChange={([val]) => handleMaterialChange('metalness', val)}
          />
        </div>

        <div className="space-y-3 border-t pt-3 mt-3">
            <h5 className="text-sm font-medium">PBR Textures</h5>
            <TextureInput label="Diffuse Map (Albedo)" mapType="map" currentValue={currentMaterial.map} />
            <TextureInput label="Normal Map" mapType="normalMap" currentValue={currentMaterial.normalMap} />
            <TextureInput label="Roughness Map" mapType="roughnessMap" currentValue={currentMaterial.roughnessMap} />
            <TextureInput label="Metalness Map" mapType="metalnessMap" currentValue={currentMaterial.metalnessMap} />
            <TextureInput label="Ambient Occlusion (AO) Map" mapType="aoMap" currentValue={currentMaterial.aoMap} />
        </div>

      </AccordionContent>
    </AccordionItem>
  );
};

export default MaterialPanel;

