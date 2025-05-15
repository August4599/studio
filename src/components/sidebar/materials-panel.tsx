
"use client";

import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useScene } from "@/context/scene-context";
import type { MaterialProperties } from "@/types";
import { DEFAULT_MATERIAL_ID, DEFAULT_MATERIAL_NAME } from "@/types";
import { Palette, PlusCircle, Trash2, Edit3, UploadCloud, CheckCircle2, Paintbrush, Sparkles, Eye, Layers, ShieldCheck, Droplets, Diamond, GalleryThumbnails, Sun } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { fileToDataURL } from "@/lib/three-utils";
import { cn } from "@/lib/utils";
import { getDefaultSceneData } from "@/lib/project-manager";


const Vector2Input: React.FC<{
  label: string;
  value: [number, number] | undefined;
  onChange: (newValue: [number, number]) => void;
  step?: number;
  className?: string;
}> = ({ label, value = [1,1], onChange, step = 0.1, className }) => (
  <div className={cn("space-y-1", className)}>
    <Label className="text-xs font-medium">{label}</Label>
    <div className="grid grid-cols-2 gap-2">
      {['X', 'Y'].map((axis, idx) => (
        <Input
          key={axis}
          type="number"
          aria-label={`${label} ${axis}`}
          value={value[idx]}
          onChange={(e) => {
            const numValue = parseFloat(e.target.value);
            const newVector: [number, number] = [...value];
            newVector[idx] = isNaN(numValue) ? 1 : numValue;
            onChange(newVector);
          }}
          step={step}
          className="h-9 text-sm" 
        />
      ))}
    </div>
  </div>
);


const TextureInput: React.FC<{
  label: string;
  currentUrl?: string;
  onTextureUpload: (dataUrl: string) => void;
  onTextureClear: () => void;
  className?: string;
}> = ({ label, currentUrl, onTextureUpload, onTextureClear, className }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUrl) {
      setFileName(currentUrl.substring(currentUrl.lastIndexOf('/') + 1).substring(0, 25) + (currentUrl.length > 25 ? "..." : "") || "Texture Applied");
    } else {
      setFileName(null);
    }
  }, [currentUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await fileToDataURL(file);
        onTextureUpload(dataUrl);
        setFileName(file.name.substring(0, 25) + (file.name.length > 25 ? "..." : ""));
      } catch (error) {
        console.error("Error converting file to data URL:", error);
      }
    }
  };

  const handleClearTexture = () => {
    onTextureClear();
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
        <Label htmlFor={`mat-${label.toLowerCase().replace(/\s/g, '-')}`} className="text-xs font-medium">{label}</Label>
        <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-sm flex-1 h-9" 
              onClick={() => fileInputRef.current?.click()}
            >
            <UploadCloud size={14} className="mr-2" /> Upload Image
            </Button>
            <Input
              id={`mat-${label.toLowerCase().replace(/\s/g, '-')}`}
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg, image/webp, image/hdr, image/exr"
            />
            {fileName && (
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-70 hover:opacity-100 shrink-0" onClick={handleClearTexture} title="Clear texture">
                <Trash2 size={14} />
            </Button>
            )}
        </div>
         {fileName && (
            <div className="text-xs text-muted-foreground mt-1 p-1.5 bg-muted/50 rounded flex items-center">
                <CheckCircle2 size={12} className="inline mr-1.5 text-green-500 shrink-0" />
                <span className="truncate" title={fileName}>{fileName}</span>
            </div>
        )}
      </div>
  );
};


const MaterialEditorDialog: React.FC<{
  material: MaterialProperties;
  onSave: (updatedMaterial: MaterialProperties) => void;
  trigger: React.ReactNode;
}> = ({ material, onSave, trigger }) => {
  const [editedMaterial, setEditedMaterial] = useState<MaterialProperties>(material);

  useEffect(() => {
    const fullMaterial = {
        ...getDefaultSceneData().materials[0], 
        ...material 
    };
    setEditedMaterial(fullMaterial);
  }, [material]);

  const handleChange = (field: keyof MaterialProperties, value: any) => {
    setEditedMaterial(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSliderChange = (field: 'roughness' | 'metalness' | 'opacity' | 'ior' | 'emissiveIntensity' | 'displacementScale' | 'displacementBias' | 'clearcoat' | 'clearcoatRoughness', value: number[]) => {
    setEditedMaterial(prev => ({ ...prev, [field]: value[0] }));
  };

  const handleTextureUpload = (field: keyof MaterialProperties, dataUrl: string) => {
    handleChange(field, dataUrl);
  };

  const handleTextureClear = (field: keyof MaterialProperties) => {
    setEditedMaterial(prev => ({ ...prev, [field]: undefined }));
  };
  
  const handleNormalScaleChange = (newValue: [number, number]) => {
    handleChange('normalScale', newValue);
  }

  const handleSave = () => {
    onSave(editedMaterial);
  };
  
  const defaultOpenAccordions = ['basic-props', 'texture-maps'];

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Palette size={20}/> Edit Material: {editedMaterial.name || "Unnamed Material"}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] md:max-h-[75vh] p-1 pr-3 -mr-2"> 
          <Accordion type="multiple" defaultValue={defaultOpenAccordions} className="w-full space-y-3">
            
            <AccordionItem value="basic-props">
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                <Diamond size={16} className="mr-2"/> Basic Properties
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="mat-name" className="text-right text-xs">Name</Label>
                  <Input id="mat-name" value={editedMaterial.name || ""} onChange={(e) => handleChange('name', e.target.value)} className="col-span-3 h-9 text-sm" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="mat-color" className="text-right text-xs">Base Color</Label>
                  <Input id="mat-color" type="color" value={editedMaterial.color} onChange={(e) => handleChange('color', e.target.value)} className="col-span-3 h-9" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="mat-roughness" className="text-xs">Roughness: {(editedMaterial.roughness ?? 0).toFixed(2)}</Label>
                  <Slider id="mat-roughness" min={0} max={1} step={0.01} value={[editedMaterial.roughness ?? 0]} onValueChange={(val) => handleSliderChange('roughness', val)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="mat-metalness" className="text-xs">Metalness: {(editedMaterial.metalness ?? 0).toFixed(2)}</Label>
                  <Slider id="mat-metalness" min={0} max={1} step={0.01} value={[editedMaterial.metalness ?? 0]} onValueChange={(val) => handleSliderChange('metalness', val)} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="texture-maps">
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                <GalleryThumbnails size={16} className="mr-2"/> Texture Maps
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-3">
                <TextureInput label="Albedo (Base Color) Map" currentUrl={editedMaterial.map} onTextureUpload={(dataUrl) => handleTextureUpload('map', dataUrl)} onTextureClear={() => handleTextureClear('map')} />
                <TextureInput label="Normal Map" currentUrl={editedMaterial.normalMap} onTextureUpload={(dataUrl) => handleTextureUpload('normalMap', dataUrl)} onTextureClear={() => handleTextureClear('normalMap')} />
                <Vector2Input label="Normal Scale" value={editedMaterial.normalScale ?? [1,1]} onChange={handleNormalScaleChange} step={0.05} />
                <TextureInput label="Roughness Map" currentUrl={editedMaterial.roughnessMap} onTextureUpload={(dataUrl) => handleTextureUpload('roughnessMap', dataUrl)} onTextureClear={() => handleTextureClear('roughnessMap')} />
                <TextureInput label="Metalness Map" currentUrl={editedMaterial.metalnessMap} onTextureUpload={(dataUrl) => handleTextureUpload('metalnessMap', dataUrl)} onTextureClear={() => handleTextureClear('metalnessMap')} />
                <TextureInput label="Ambient Occlusion (AO) Map" currentUrl={editedMaterial.aoMap} onTextureUpload={(dataUrl) => handleTextureUpload('aoMap', dataUrl)} onTextureClear={() => handleTextureClear('aoMap')} />
                <TextureInput label="Displacement Map" currentUrl={editedMaterial.displacementMap} onTextureUpload={(dataUrl) => handleTextureUpload('displacementMap', dataUrl)} onTextureClear={() => handleTextureClear('displacementMap')} />
                <div className="space-y-1">
                    <Label htmlFor="mat-displacementScale" className="text-xs">Displacement Scale: {(editedMaterial.displacementScale ?? 1).toFixed(3)}</Label>
                    <Slider id="mat-displacementScale" min={0} max={5} step={0.001} value={[editedMaterial.displacementScale ?? 1]} onValueChange={(val) => handleSliderChange('displacementScale', val)} disabled={!editedMaterial.displacementMap}/>
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="mat-displacementBias" className="text-xs">Displacement Bias: {(editedMaterial.displacementBias ?? 0).toFixed(3)}</Label>
                    <Slider id="mat-displacementBias" min={-2} max={2} step={0.001} value={[editedMaterial.displacementBias ?? 0]} onValueChange={(val) => handleSliderChange('displacementBias', val)} disabled={!editedMaterial.displacementMap}/>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="emission">
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                <Sun size={16} className="mr-2"/> Emission
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mat-emissive" className="text-right text-xs">Emissive Color</Label>
                    <Input id="mat-emissive" type="color" value={editedMaterial.emissive || '#000000'} onChange={(e) => handleChange('emissive', e.target.value)} className="col-span-3 h-9" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="mat-emissiveIntensity" className="text-xs">Intensity: {(editedMaterial.emissiveIntensity ?? 0).toFixed(2)}</Label>
                    <Slider id="mat-emissiveIntensity" min={0} max={10} step={0.1} value={[editedMaterial.emissiveIntensity ?? 0]} onValueChange={(val) => handleSliderChange('emissiveIntensity', val)} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="transparency">
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                <Eye size={16} className="mr-2"/> Transparency &amp; Refraction
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                 <div className="flex items-center space-x-2">
                    <Checkbox id="mat-transparent" checked={editedMaterial.transparent} onCheckedChange={(checked) => handleChange('transparent', !!checked)} />
                    <Label htmlFor="mat-transparent" className="text-xs font-normal">Enable Transparency</Label>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="mat-opacity" className="text-xs">Opacity: {(editedMaterial.opacity ?? 1).toFixed(2)}</Label>
                    <Slider id="mat-opacity" min={0} max={1} step={0.01} value={[editedMaterial.opacity ?? 1]} onValueChange={(val) => handleSliderChange('opacity', val)} disabled={!editedMaterial.transparent}/>
                </div>
                <TextureInput label="Alpha Map" currentUrl={editedMaterial.alphaMap} onTextureUpload={(dataUrl) => handleTextureUpload('alphaMap', dataUrl)} onTextureClear={() => handleTextureClear('alphaMap')} />
                 <div className="space-y-1">
                    <Label htmlFor="mat-ior" className="text-xs">IOR (Index of Refraction): {(editedMaterial.ior ?? 1.5).toFixed(2)}</Label>
                    <Slider id="mat-ior" min={1} max={2.5} step={0.01} value={[editedMaterial.ior ?? 1.5]} onValueChange={(val) => handleSliderChange('ior', val)} disabled={!editedMaterial.transparent}/>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="clearcoat">
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                <ShieldCheck size={16} className="mr-2"/> Clearcoat
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="space-y-1">
                    <Label htmlFor="mat-clearcoat" className="text-xs">Intensity: {(editedMaterial.clearcoat ?? 0).toFixed(2)}</Label>
                    <Slider id="mat-clearcoat" min={0} max={1} step={0.01} value={[editedMaterial.clearcoat ?? 0]} onValueChange={(val) => handleSliderChange('clearcoat', val)} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="mat-clearcoat-roughness" className="text-xs">Roughness: {(editedMaterial.clearcoatRoughness ?? 0).toFixed(2)}</Label>
                    <Slider id="mat-clearcoat-roughness" min={0} max={1} step={0.01} value={[editedMaterial.clearcoatRoughness ?? 0]} onValueChange={(val) => handleSliderChange('clearcoatRoughness', val)} />
                </div>
                <TextureInput label="Clearcoat Normal Map" currentUrl={editedMaterial.clearcoatNormalMap} onTextureUpload={(dataUrl) => handleTextureUpload('clearcoatNormalMap', dataUrl)} onTextureClear={() => handleTextureClear('clearcoatNormalMap')} />
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </ScrollArea>
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" size="sm">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" onClick={handleSave} size="sm">Save Changes</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const MaterialsPanelAccordion = () => { 
  const { 
    materials, 
    addMaterial, 
    updateMaterial, 
    removeMaterial, 
    selectedObjectId, 
    objects, 
    updateObject,
    activeTool,
    activePaintMaterialId,
    setActivePaintMaterialId,
    getMaterialById
  } = useScene();
  const { toast } = useToast();
  const [selectedMaterialForList, setSelectedMaterialForList] = useState<string | null>(null);

  const handleMaterialClick = (materialId: string) => {
    setSelectedMaterialForList(materialId);
    if (activeTool === 'paint') {
      setActivePaintMaterialId(materialId);
      const matName = materials.find(m => m.id === materialId)?.name || "Selected Material";
      toast({ title: "Paint Material Selected", description: `${matName} is now active for painting.` });
    }
  };

  const handleAddNewMaterial = () => {
    const newMat = addMaterial({ name: `New Material ${materials.length + 1}` });
    toast({ title: "Material Added", description: `${newMat.name} created.` });
    handleMaterialClick(newMat.id); 
  };

  const handleRemoveMaterial = (materialId: string) => {
    if (materialId === DEFAULT_MATERIAL_ID) {
      toast({ title: "Action Denied", description: "Cannot delete the default material.", variant: "destructive" });
      return;
    }
    removeMaterial(materialId);
    toast({ title: "Material Removed", description: `Material removed.` });
    if (selectedMaterialForList === materialId) {
      setSelectedMaterialForList(null);
      if (activePaintMaterialId === materialId) {
        setActivePaintMaterialId(null);
      }
    }
  };
  
  const handleAssignToSelectedObject = () => {
    if (!selectedMaterialForList) {
        toast({ title: "No Material Selected", description: "Please select a material to assign.", variant: "destructive" });
        return;
    }
    if (!selectedObjectId) {
        toast({ title: "No Object Selected", description: "Please select an object in the scene to assign the material to.", variant: "destructive" });
        return;
    }
    updateObject(selectedObjectId, { materialId: selectedMaterialForList });
    const materialName = materials.find(m => m.id === selectedMaterialForList)?.name || "Selected Material";
    const objectName = objects.find(o => o.id === selectedObjectId)?.name || "Selected Object";
    toast({ title: "Material Assigned", description: `${materialName} assigned to ${objectName}.`});
  }

  const materialForEditingDialog = getMaterialById(selectedMaterialForList || '');


  return (
    <AccordionItem value="item-materials">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Palette size={18} /> Materials
          {activeTool === 'paint' && activePaintMaterialId && (
            <Paintbrush size={14} className="text-primary animate-pulse" />
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-3 p-1">
        <Button onClick={handleAddNewMaterial} size="sm" className="w-full text-sm h-9"> 
          <PlusCircle size={16} className="mr-2" /> Add New Material
        </Button>
        
        <ScrollArea className="h-[200px] w-full rounded-md border p-2">
          {materials.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No materials yet.</p>}
          <div className="space-y-1">
            {materials.map((material) => (
              <div 
                key={material.id} 
                className={cn(
                  "flex items-center justify-between p-2 rounded-md cursor-pointer text-sm hover:bg-muted/50", 
                  selectedMaterialForList === material.id && 'bg-muted ring-1 ring-primary',
                  activePaintMaterialId === material.id && activeTool === 'paint' && 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                )}
                onClick={() => handleMaterialClick(material.id)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div style={{ backgroundColor: material.color, opacity: material.opacity ?? 1 }} className="w-4 h-4 rounded-sm border shrink-0" />
                  <span className="truncate flex-grow" title={material.name || material.id}>{material.name || material.id}</span>
                   {activePaintMaterialId === material.id && activeTool === 'paint' && (
                    <Paintbrush size={12} className="text-primary shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {materialForEditingDialog && materialForEditingDialog.id === material.id && (
                     <MaterialEditorDialog 
                        material={materialForEditingDialog}
                        onSave={(updatedMat) => {
                            updateMaterial(updatedMat.id, updatedMat);
                            toast({title: "Material Updated", description: `${updatedMat.name} saved.`});
                        }}
                        trigger={
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-70 hover:opacity-100" 
                              disabled={material.id === DEFAULT_MATERIAL_ID && material.name === DEFAULT_MATERIAL_NAME && JSON.stringify(material) === JSON.stringify(getDefaultSceneData().materials[0]) }
                            >
                                <Edit3 size={14} />
                            </Button>
                        }
                     />
                  )}
                  {material.id !== DEFAULT_MATERIAL_ID && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-70 hover:opacity-100 text-destructive hover:text-destructive"> 
                          <Trash2 size={14} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {material.name || "this material"}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. Objects using this material will be reassigned the default material.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveMaterial(material.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {selectedMaterialForList && selectedObjectId && activeTool !== 'paint' && (
             <Button onClick={handleAssignToSelectedObject} size="sm" variant="outline" className="w-full text-sm h-9"> 
                Assign to Selected Object
             </Button>
        )}
        {selectedMaterialForList && !selectedObjectId && activeTool !== 'paint' && (
            <p className="text-xs text-muted-foreground text-center">Select an object to assign this material.</p>
        )}
         {activeTool === 'paint' && !activePaintMaterialId && (
            <p className="text-xs text-primary text-center">Select a material above to activate for painting.</p>
        )}
        {activeTool === 'paint' && activePaintMaterialId && (
            <p className="text-xs text-primary text-center">Paint mode active. Click objects in scene to apply.</p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default MaterialsPanelAccordion; 
