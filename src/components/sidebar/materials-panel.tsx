
"use client";

import React, { useState, useEffect } from "react";
import {
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
import { DEFAULT_MATERIAL_ID } from "@/types";
import { Palette, PlusCircle, Trash2, Edit3, UploadCloud, CheckCircle2 } from "lucide-react";
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
  AlertDialogTrigger,
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
import { fileToDataURL } from "@/lib/three-utils";

const TextureInput: React.FC<{
  label: string;
  currentUrl?: string;
  onTextureUpload: (dataUrl: string) => void;
  onTextureClear: () => void;
}> = ({ label, currentUrl, onTextureUpload, onTextureClear }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUrl) {
      // Attempt to show a generic name if a URL is already set (e.g., "texture.png")
      // This won't get the original file name if loaded from scene JSON
      setFileName(currentUrl.substring(currentUrl.lastIndexOf('/') + 1) || "Texture Applied");
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
        setFileName(file.name);
      } catch (error) {
        console.error("Error converting file to data URL:", error);
        // Optionally, show a toast error
      }
    }
  };

  const handleClearTexture = () => {
    onTextureClear();
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={`mat-${label.toLowerCase()}`} className="text-right text-xs">
        {label}
      </Label>
      <div className="col-span-3 space-y-1">
        <Input
          id={`mat-${label.toLowerCase()}`}
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="h-8 text-xs file:mr-2 file:text-xs file:font-medium file:text-primary file:bg-primary-foreground file:border-0 file:rounded file:py-1 file:px-2 hover:file:bg-primary/90 hidden"
          accept="image/png, image/jpeg, image/webp"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud size={14} className="mr-2" /> Upload {label}
        </Button>
        {fileName && (
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1 p-1 bg-muted/50 rounded">
            <span className="truncate flex-grow" title={fileName}>
              <CheckCircle2 size={12} className="inline mr-1 text-green-500" />
              {fileName}
            </span>
            <Button variant="ghost" size="icon" className="h-5 w-5 opacity-70 hover:opacity-100" onClick={handleClearTexture}>
              <Trash2 size={10} />
            </Button>
          </div>
        )}
      </div>
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
    setEditedMaterial(material);
  }, [material]);

  const handleChange = (field: keyof MaterialProperties, value: any) => {
    setEditedMaterial(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSliderChange = (field: 'roughness' | 'metalness', value: number[]) => {
    setEditedMaterial(prev => ({ ...prev, [field]: value[0] }));
  };

  const handleTextureUpload = (field: keyof MaterialProperties, dataUrl: string) => {
    handleChange(field, dataUrl);
  };

  const handleTextureClear = (field: keyof MaterialProperties) => {
    setEditedMaterial(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSave = () => {
    onSave(editedMaterial);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Material: {editedMaterial.name || "Unnamed Material"}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1 pr-3">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mat-name" className="text-right text-xs">Name</Label>
              <Input id="mat-name" value={editedMaterial.name || ""} onChange={(e) => handleChange('name', e.target.value)} className="col-span-3 h-8 text-xs" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mat-color" className="text-right text-xs">Color</Label>
              <Input id="mat-color" type="color" value={editedMaterial.color} onChange={(e) => handleChange('color', e.target.value)} className="col-span-3 h-8" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="mat-roughness" className="text-xs">Roughness: {editedMaterial.roughness.toFixed(2)}</Label>
              <Slider id="mat-roughness" min={0} max={1} step={0.01} value={[editedMaterial.roughness]} onValueChange={(val) => handleSliderChange('roughness', val)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="mat-metalness" className="text-xs">Metalness: {editedMaterial.metalness.toFixed(2)}</Label>
              <Slider id="mat-metalness" min={0} max={1} step={0.01} value={[editedMaterial.metalness]} onValueChange={(val) => handleSliderChange('metalness', val)} />
            </div>
            
            <TextureInput 
              label="Albedo" 
              currentUrl={editedMaterial.map}
              onTextureUpload={(dataUrl) => handleTextureUpload('map', dataUrl)}
              onTextureClear={() => handleTextureClear('map')}
            />
             <TextureInput 
              label="Normal" 
              currentUrl={editedMaterial.normalMap}
              onTextureUpload={(dataUrl) => handleTextureUpload('normalMap', dataUrl)}
              onTextureClear={() => handleTextureClear('normalMap')}
            />
             <TextureInput 
              label="Roughness" 
              currentUrl={editedMaterial.roughnessMap}
              onTextureUpload={(dataUrl) => handleTextureUpload('roughnessMap', dataUrl)}
              onTextureClear={() => handleTextureClear('roughnessMap')}
            />
             <TextureInput 
              label="Metalness" 
              currentUrl={editedMaterial.metalnessMap}
              onTextureUpload={(dataUrl) => handleTextureUpload('metalnessMap', dataUrl)}
              onTextureClear={() => handleTextureClear('metalnessMap')}
            />
             <TextureInput 
              label="AO Map" 
              currentUrl={editedMaterial.aoMap}
              onTextureUpload={(dataUrl) => handleTextureUpload('aoMap', dataUrl)}
              onTextureClear={() => handleTextureClear('aoMap')}
            />
          </div>
        </ScrollArea>
        <DialogFooter>
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


const MaterialsPanel = () => {
  const { materials, addMaterial, updateMaterial, removeMaterial, selectedObjectId, objects, updateObject } = useScene();
  const { toast } = useToast();
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);

  const handleAddNewMaterial = () => {
    const newMat = addMaterial({ name: `New Material ${materials.length + 1}` });
    toast({ title: "Material Added", description: `${newMat.name} created.` });
    setSelectedMaterialId(newMat.id);
  };

  const handleRemoveMaterial = (materialId: string) => {
    if (materialId === DEFAULT_MATERIAL_ID) {
      toast({ title: "Action Denied", description: "Cannot delete the default material.", variant: "destructive" });
      return;
    }
    removeMaterial(materialId);
    toast({ title: "Material Removed", description: `Material removed.` });
    if (selectedMaterialId === materialId) {
      setSelectedMaterialId(null);
    }
  };
  
  const handleAssignToSelected = () => {
    if (!selectedMaterialId) {
        toast({ title: "No Material Selected", description: "Please select a material to assign.", variant: "destructive" });
        return;
    }
    if (!selectedObjectId) {
        toast({ title: "No Object Selected", description: "Please select an object in the scene to assign the material to.", variant: "destructive" });
        return;
    }
    updateObject(selectedObjectId, { materialId: selectedMaterialId });
    const materialName = materials.find(m => m.id === selectedMaterialId)?.name || "Selected Material";
    const objectName = objects.find(o => o.id === selectedObjectId)?.name || "Selected Object";
    toast({ title: "Material Assigned", description: `${materialName} assigned to ${objectName}.`});
  }

  const selectedMaterialForEditing = materials.find(m => m.id === selectedMaterialId);

  return (
    <AccordionItem value="item-materials">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Palette size={18} /> Materials
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-3 p-1">
        <Button onClick={handleAddNewMaterial} size="sm" className="w-full text-xs">
          <PlusCircle size={14} className="mr-2" /> Add New Material
        </Button>
        
        <ScrollArea className="h-[200px] w-full rounded-md border p-2">
          {materials.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No materials yet.</p>}
          <div className="space-y-1">
            {materials.map((material) => (
              <div 
                key={material.id} 
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer text-xs hover:bg-muted/50 ${selectedMaterialId === material.id ? 'bg-muted ring-1 ring-accent' : ''}`}
                onClick={() => setSelectedMaterialId(material.id)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div style={{ backgroundColor: material.color }} className="w-4 h-4 rounded-sm border shrink-0" />
                  <span className="truncate flex-grow" title={material.name || material.id}>{material.name || material.id}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {selectedMaterialForEditing && selectedMaterialForEditing.id === material.id && (
                     <MaterialEditorDialog 
                        material={selectedMaterialForEditing}
                        onSave={(updatedMat) => {
                            updateMaterial(updatedMat.id, updatedMat);
                            toast({title: "Material Updated", description: `${updatedMat.name} saved.`});
                        }}
                        trigger={
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-70 hover:opacity-100" disabled={material.id === DEFAULT_MATERIAL_ID && material.name === "Default Material" /* Allow editing if default is renamed */}>
                                <Edit3 size={12} />
                            </Button>
                        }
                     />
                  )}
                  {material.id !== DEFAULT_MATERIAL_ID && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-70 hover:opacity-100 text-destructive hover:text-destructive">
                          <Trash2 size={12} />
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
        
        {selectedMaterialId && selectedObjectId && (
             <Button onClick={handleAssignToSelected} size="sm" variant="outline" className="w-full text-xs">
                Assign to Selected Object
             </Button>
        )}
        {selectedMaterialId && !selectedObjectId && (
            <p className="text-xs text-muted-foreground text-center">Select an object to assign this material.</p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default MaterialsPanel;
