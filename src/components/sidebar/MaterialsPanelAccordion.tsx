

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
import type { MaterialProperties, AdvancedMaterialType, UVWMappingType, BRDFModelType, UVWProjectionAxis } from "@/types";
import { DEFAULT_MATERIAL_ID, DEFAULT_MATERIAL_NAME } from "@/types";
import { Palette, PlusCircle, Trash2, Edit3, UploadCloud, CheckCircle2, Paintbrush, Sparkles, Eye, Layers, ShieldCheck, Droplets, Diamond, GalleryThumbnails, Sun, Settings, RotateCcw, Move as MoveIcon, StretchHorizontal, Type, Box, Cylinder, Plane, Globe, Cone, Torus, Workflow, RefreshCcw, Save, Copy, ChevronsUpDown, Wand2Icon, Image as ImageIcon, GitBranchPlus, Droplet as DropletIcon, Wind as WindIcon, Columns, Palette as ColorPaletteIcon, DraftingCompass, AlignHorizontalSpaceAround } from "lucide-react"; 
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
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  disabled?: boolean;
}> = ({ label, value = [1,1], onChange, step = 0.1, className, disabled = false }) => (
  <div className={cn("space-y-1", className)}>
    <Label className="text-xs font-medium">{label}</Label>
    <div className="grid grid-cols-2 gap-2">
      {['U', 'V'].map((axis, idx) => ( 
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
          disabled={disabled}
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
  channel?: string; 
  disabled?: boolean;
}> = ({ label, currentUrl, onTextureUpload, onTextureClear, className, channel, disabled = false }) => {
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
  
  const aiHint = channel ? `${channel} texture` : "texture map";

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
              data-ai-hint={aiHint}
              disabled={disabled}
            >
            <UploadCloud size={14} className="mr-2" /> Upload Image
            </Button>
            <Input
              id={`mat-${label.toLowerCase().replace(/\s/g, '-')}`}
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg, image/webp, image/hdr, image/exr, image/tga, image/tiff" 
              disabled={disabled}
            />
            {fileName && (
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-70 hover:opacity-100 shrink-0" onClick={handleClearTexture} title="Clear texture" disabled={disabled}>
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
  const { toast } = useToast();

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
  
  const handleSliderChange = (field: keyof MaterialProperties, value: number[]) => {
    setEditedMaterial(prev => ({ ...prev, [field]: value[0] }));
  };

  const handleTextureUpload = (field: keyof MaterialProperties, dataUrl: string) => {
    handleChange(field, dataUrl);
  };

  const handleTextureClear = (field: keyof MaterialProperties) => {
    setEditedMaterial(prev => ({ ...prev, [field]: undefined }));
  };
  
  const handleVector2Change = (field: keyof MaterialProperties, newValue: [number,number]) => {
    handleChange(field, newValue);
  }

  const handleSave = () => {
    onSave(editedMaterial);
    toast({title: "Material Saved", description: `Properties for "${editedMaterial.name}" updated.`});
  };
  
  const defaultOpenAccordions = ['basic-props', 'texture-maps', 'uvw-mapping'];

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl"> 
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ColorPaletteIcon size={20}/> Edit Material: {editedMaterial.name || "Unnamed Material"}</DialogTitle>
          <DialogDescription className="text-xs">Adjust PBR properties, textures, UVW mapping, and advanced settings for the material.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] md:max-h-[75vh] p-1 pr-3 -mr-2"> 
          <Accordion type="multiple" defaultValue={defaultOpenAccordions} className="w-full space-y-3 text-xs">
            
            <AccordionItem value="basic-props">
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                <Diamond size={16} className="mr-2"/> Basic PBR Properties
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="mat-name" className="text-right">Name</Label>
                  <Input id="mat-name" value={editedMaterial.name || ""} onChange={(e) => handleChange('name', e.target.value)} className="col-span-3 h-9 text-sm" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mat-type" className="text-right">Material Type (WIP)</Label>
                    <Select value={editedMaterial.materialType || 'generic_pbr'} onValueChange={(val) => handleChange('materialType', val as AdvancedMaterialType)} >
                        <SelectTrigger id="mat-type" className="col-span-3 h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="generic_pbr" className="text-sm flex items-center gap-2"><Workflow size={14}/> Generic PBR</SelectItem>
                            <SelectItem value="glass_refractive" className="text-sm flex items-center gap-2"><Layers size={14}/> Glass (Refractive)</SelectItem>
                            <SelectItem value="water_liquid" className="text-sm flex items-center gap-2"><DropletIcon size={14}/> Water / Liquid</SelectItem>
                            <SelectItem value="foliage_two_sided" className="text-sm flex items-center gap-2"><ImageIcon size={14}/> Foliage (Two-Sided)</SelectItem>
                            <SelectItem value="car_paint_clearcoat" className="text-sm flex items-center gap-2"><ShieldCheck size={14}/> Car Paint (Clearcoat)</SelectItem>
                            <SelectItem value="cloth_sheen" className="text-sm flex items-center gap-2"><StretchHorizontal size={14}/> Cloth (Sheen)</SelectItem>
                            <SelectItem value="emissive_light_source" className="text-sm flex items-center gap-2"><Sun size={14}/> Emissive Light</SelectItem>
                            <SelectItem value="metal_anisotropic" className="text-sm flex items-center gap-2"><AlignHorizontalSpaceAround size={14}/> Metal (Anisotropic)</SelectItem>
                            <SelectItem value="plastic_sss_translucent" className="text-sm flex items-center gap-2"><Box size={14}/> Plastic (SSS/Translucent)</SelectItem>
                            <SelectItem value="wood_textured" className="text-sm flex items-center gap-2"><Columns size={14}/> Wood (Textured)</SelectItem>
                            <SelectItem value="concrete_rough" className="text-sm flex items-center gap-2"><DraftingCompass size={14}/> Concrete (Rough)</SelectItem>
                            <SelectItem value="velvet_fabric" className="text-sm flex items-center gap-2">Velvet Fabric</SelectItem>
                            <SelectItem value="skin_sss_detailed" className="text-sm flex items-center gap-2">Skin (SSS)</SelectItem>
                            <SelectItem value="hair_bsdf" className="text-sm flex items-center gap-2">Hair BSDF (WIP)</SelectItem>
                            <SelectItem value="toon_stylized" className="text-sm flex items-center gap-2">Toon / Stylized (WIP)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="mat-color" className="text-right">Base Color</Label>
                  <Input id="mat-color" type="color" value={editedMaterial.color} onChange={(e) => handleChange('color', e.target.value)} className="col-span-3 h-9" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="mat-roughness">Roughness: {(editedMaterial.roughness ?? 0).toFixed(2)}</Label>
                  <Slider id="mat-roughness" min={0} max={1} step={0.01} value={[editedMaterial.roughness ?? 0]} onValueChange={(val) => handleSliderChange('roughness', val)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="mat-metalness">Metalness: {(editedMaterial.metalness ?? 0).toFixed(2)}</Label>
                  <Slider id="mat-metalness" min={0} max={1} step={0.01} value={[editedMaterial.metalness ?? 0]} onValueChange={(val) => handleSliderChange('metalness', val)} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="texture-maps">
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                <GalleryThumbnails size={16} className="mr-2"/> Texture Maps
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-3">
                <TextureInput label="Albedo (Base Color) Map" currentUrl={editedMaterial.map} onTextureUpload={(dataUrl) => handleTextureUpload('map', dataUrl)} onTextureClear={() => handleTextureClear('map')} channel="albedo"/>
                <TextureInput label="Normal Map" currentUrl={editedMaterial.normalMap} onTextureUpload={(dataUrl) => handleTextureUpload('normalMap', dataUrl)} onTextureClear={() => handleTextureClear('normalMap')} channel="normal"/>
                <Vector2Input label="Normal Scale" value={editedMaterial.normalScale ?? [1,1]} onChange={(val) => handleVector2Change('normalScale', val)} step={0.05} disabled={!editedMaterial.normalMap} />
                <TextureInput label="Roughness Map" currentUrl={editedMaterial.roughnessMap} onTextureUpload={(dataUrl) => handleTextureUpload('roughnessMap', dataUrl)} onTextureClear={() => handleTextureClear('roughnessMap')} channel="roughness"/>
                <TextureInput label="Metalness Map" currentUrl={editedMaterial.metalnessMap} onTextureUpload={(dataUrl) => handleTextureUpload('metalnessMap', dataUrl)} onTextureClear={() => handleTextureClear('metalnessMap')} channel="metalness"/>
                <TextureInput label="Ambient Occlusion (AO) Map" currentUrl={editedMaterial.aoMap} onTextureUpload={(dataUrl) => handleTextureUpload('aoMap', dataUrl)} onTextureClear={() => handleTextureClear('aoMap')} channel="ambient occlusion"/>
                <div className="space-y-1">
                  <Label htmlFor="mat-aoIntensity">AO Intensity: {(editedMaterial.aoIntensity ?? 1.0).toFixed(2)}</Label>
                  <Slider id="mat-aoIntensity" min={0} max={2} step={0.01} value={[editedMaterial.aoIntensity ?? 1.0]} onValueChange={(val) => handleSliderChange('aoIntensity', val)} disabled={!editedMaterial.aoMap} />
                </div>
                <TextureInput label="Displacement/Height Map" currentUrl={editedMaterial.displacementMap} onTextureUpload={(dataUrl) => handleTextureUpload('displacementMap', dataUrl)} onTextureClear={() => handleTextureClear('displacementMap')} channel="displacement"/>
                <div className="space-y-1">
                    <Label htmlFor="mat-displacementScale">Displacement Scale: {(editedMaterial.displacementScale ?? 0.1).toFixed(3)}</Label>
                    <Slider id="mat-displacementScale" min={-1} max={1} step={0.001} value={[editedMaterial.displacementScale ?? 0.1]} onValueChange={(val) => handleSliderChange('displacementScale', val)} disabled={!editedMaterial.displacementMap}/>
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="mat-displacementBias">Displacement Bias: {(editedMaterial.displacementBias ?? 0).toFixed(3)}</Label>
                    <Slider id="mat-displacementBias" min={-1} max={1} step={0.001} value={[editedMaterial.displacementBias ?? 0]} onValueChange={(val) => handleSliderChange('displacementBias', val)} disabled={!editedMaterial.displacementMap}/>
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="mat-tessellationLevel">Tessellation Level (WIP): {(editedMaterial.tessellationLevel ?? 0)}</Label>
                    <Slider id="mat-tessellationLevel" min={0} max={16} step={1} value={[editedMaterial.tessellationLevel ?? 0]} onValueChange={(val) => handleSliderChange('tessellationLevel', val)} disabled={!editedMaterial.displacementMap}/>
                </div>
              </AccordionContent>
            </AccordionItem>

             <AccordionItem value="uvw-mapping">
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                <MoveIcon size={16} className="mr-2"/> UVW Mapping & Tiling
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                 <Select value={editedMaterial.uvwMappingType || 'uv_channel'} onValueChange={val => handleChange('uvwMappingType', val as UVWMappingType)} disabled>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="uv_channel" className="text-sm">UV Channel</SelectItem>
                        <SelectItem value="box" className="text-sm">Box Mapping</SelectItem>
                        <SelectItem value="planar" className="text-sm">Planar Mapping</SelectItem>
                        <SelectItem value="cylindrical" className="text-sm">Cylindrical Mapping</SelectItem>
                        <SelectItem value="spherical" className="text-sm">Spherical Mapping</SelectItem>
                        <SelectItem value="triplanar" className="text-sm">Triplanar (World Space)</SelectItem>
                    </SelectContent>
                </Select>
                <Vector2Input label="Tiling (U, V)" value={editedMaterial.uvTiling ?? [1,1]} onChange={(val) => handleVector2Change('uvTiling', val)} step={0.01} />
                <Vector2Input label="Offset (U, V)" value={editedMaterial.uvOffset ?? [0,0]} onChange={(val) => handleVector2Change('uvOffset', val)} step={0.01} />
                <div className="space-y-1">
                    <Label htmlFor="mat-uvRotation">Rotation (°): {(editedMaterial.uvRotation ?? 0).toFixed(1)}</Label>
                    <Slider id="mat-uvRotation" min={0} max={360} step={0.1} value={[editedMaterial.uvRotation ?? 0]} onValueChange={(val) => handleSliderChange('uvRotation', val)} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="mat-uvRealWorldScale" checked={!!editedMaterial.uvRealWorldScale} onCheckedChange={checked => handleChange('uvRealWorldScale', !!checked)} disabled/>
                        <Label htmlFor="mat-uvRealWorldScale" className="font-normal text-xs">Real-World Scale (WIP)</Label>
                    </div>
                    <div className="flex items-center justify-between">
                         <Label htmlFor="mat-uvChannel" className="text-xs">UV Channel:</Label>
                         <Input id="mat-uvChannel" type="number" min="0" max="15" step="1" defaultValue={editedMaterial.uvChannel || 0} className="h-7 w-16 text-xs" disabled/>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                         <Checkbox id="mat-uvFlipU" checked={!!editedMaterial.uvFlip?.u} onCheckedChange={checked => handleChange('uvFlip', {...editedMaterial.uvFlip, u: !!checked})} disabled/>
                        <Label htmlFor="mat-uvFlipU" className="font-normal text-xs">Flip U (WIP)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                         <Checkbox id="mat-uvFlipV" checked={!!editedMaterial.uvFlip?.v} onCheckedChange={checked => handleChange('uvFlip', {...editedMaterial.uvFlip, v: !!checked})} disabled/>
                        <Label htmlFor="mat-uvFlipV" className="font-normal text-xs">Flip V (WIP)</Label>
                    </div>
                </div>
                {editedMaterial.uvwMappingType === 'planar' && (
                    <Select value={editedMaterial.uvProjectionAxis || 'y'} onValueChange={val => handleChange('uvProjectionAxis', val as UVWProjectionAxis)} disabled>
                        <SelectTrigger className="h-9 text-sm mt-2"><SelectValue placeholder="Projection Axis"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="x" className="text-sm">X Axis</SelectItem>
                            <SelectItem value="y" className="text-sm">Y Axis</SelectItem>
                            <SelectItem value="z" className="text-sm">Z Axis</SelectItem>
                        </SelectContent>
                    </Select>
                )}
                {(editedMaterial.uvwMappingType === 'box' || editedMaterial.uvwMappingType === 'triplanar') && (
                    <div className="space-y-1 mt-2">
                        <Label htmlFor="mat-uvBoxProjectionBlend">Projection Blend (WIP): {(editedMaterial.uvBoxProjectionBlend ?? 0).toFixed(2)}</Label>
                        <Slider id="mat-uvBoxProjectionBlend" min={0} max={1} step={0.01} value={[editedMaterial.uvBoxProjectionBlend ?? 0]} onValueChange={(val) => handleSliderChange('uvBoxProjectionBlend', val)} disabled/>
                    </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="emission">
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                <Sun size={16} className="mr-2"/> Emission
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mat-emissive" className="text-right">Emissive Color</Label>
                    <Input id="mat-emissive" type="color" value={editedMaterial.emissive || '#000000'} onChange={(e) => handleChange('emissive', e.target.value)} className="col-span-3 h-9" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="mat-emissiveIntensity">Intensity: {(editedMaterial.emissiveIntensity ?? 0).toFixed(2)}</Label>
                    <Slider id="mat-emissiveIntensity" min={0} max={50} step={0.1} value={[editedMaterial.emissiveIntensity ?? 0]} onValueChange={(val) => handleSliderChange('emissiveIntensity', val)} />
                </div>
                <TextureInput label="Emissive Map" currentUrl={editedMaterial.emissiveMap} onTextureUpload={(dataUrl) => handleTextureUpload('emissiveMap', dataUrl)} onTextureClear={() => handleTextureClear('emissiveMap')} channel="emissive"/>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="transparency-refraction">
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                <Eye size={16} className="mr-2"/> Transparency &amp; Refraction
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                 <div className="flex items-center space-x-2">
                    <Checkbox id="mat-transparent" checked={!!editedMaterial.transparent} onCheckedChange={(checked) => handleChange('transparent', !!checked)} />
                    <Label htmlFor="mat-transparent" className="font-normal">Enable Transparency</Label>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="mat-opacity">Opacity: {(editedMaterial.opacity ?? 1).toFixed(2)}</Label>
                    <Slider id="mat-opacity" min={0} max={1} step={0.01} value={[editedMaterial.opacity ?? 1]} onValueChange={(val) => handleSliderChange('opacity', val)} disabled={!editedMaterial.transparent}/>
                </div>
                <TextureInput label="Alpha/Opacity Map" currentUrl={editedMaterial.alphaMap} onTextureUpload={(dataUrl) => handleTextureUpload('alphaMap', dataUrl)} onTextureClear={() => handleTextureClear('alphaMap')} channel="opacity"/>
                <Select value={editedMaterial.alphaMode || 'blend'} onValueChange={(val) => handleChange('alphaMode', val as MaterialProperties['alphaMode'])} disabled={!editedMaterial.transparent}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Alpha Mode"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="opaque" className="text-sm">Opaque</SelectItem>
                        <SelectItem value="blend" className="text-sm">Blend</SelectItem>
                        <SelectItem value="mask" className="text-sm">Mask (Alpha Test)</SelectItem>
                    </SelectContent>
                </Select>
                {editedMaterial.alphaMode === 'mask' && (
                     <div className="space-y-1">
                        <Label htmlFor="mat-alphaCutoff">Alpha Cutoff: {(editedMaterial.alphaCutoff ?? 0.5).toFixed(2)}</Label>
                        <Slider id="mat-alphaCutoff" min={0} max={1} step={0.01} value={[editedMaterial.alphaCutoff ?? 0.5]} onValueChange={(val) => handleSliderChange('alphaCutoff', val)} />
                    </div>
                )}
                 <div className="space-y-1">
                    <Label htmlFor="mat-ior">IOR (Index of Refraction): {(editedMaterial.ior ?? 1.5).toFixed(2)}</Label>
                    <Slider id="mat-ior" min={1} max={2.5} step={0.01} value={[editedMaterial.ior ?? 1.5]} onValueChange={(val) => handleSliderChange('ior', val)} disabled={!editedMaterial.transparent}/>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mat-refractionColor" className="text-right">Refraction Color (WIP)</Label>
                    <Input id="mat-refractionColor" type="color" value={editedMaterial.refractionColor || '#FFFFFF'} onChange={(e) => handleChange('refractionColor', e.target.value)} className="col-span-3 h-9" disabled={!editedMaterial.transparent}/>
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="mat-refractionGlossiness">Refraction Glossiness (WIP): {(editedMaterial.refractionGlossiness ?? 1).toFixed(2)}</Label>
                    <Slider id="mat-refractionGlossiness" min={0} max={1} step={0.01} value={[editedMaterial.refractionGlossiness ?? 1]} onValueChange={(val) => handleSliderChange('refractionGlossiness', val)} disabled={!editedMaterial.transparent}/>
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="mat-transmission">Transmission (Glass Thickness): {(editedMaterial.transmission ?? 0).toFixed(2)}</Label>
                    <Slider id="mat-transmission" min={0} max={1} step={0.01} value={[editedMaterial.transmission ?? 0]} onValueChange={(val) => handleSliderChange('transmission', val)} disabled={!editedMaterial.transparent}/>
                </div>
                <TextureInput label="Transmission Map (WIP)" currentUrl={editedMaterial.transmissionMap} onTextureUpload={(dataUrl) => handleTextureUpload('transmissionMap', dataUrl)} onTextureClear={() => handleTextureClear('transmissionMap')} channel="transmission" disabled={!editedMaterial.transparent}/>
                <div className="flex items-center space-x-2">
                    <Checkbox id="mat-thinWalled" checked={!!editedMaterial.thinWalled} onCheckedChange={(checked) => handleChange('thinWalled', !!checked)} disabled={!editedMaterial.transparent}/>
                    <Label htmlFor="mat-thinWalled" className="font-normal">Thin-Walled (Single-Sided Glass/Foliage)</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="mat-twoSided" checked={!!editedMaterial.twoSided} onCheckedChange={(checked) => handleChange('twoSided', !!checked)} />
                    <Label htmlFor="mat-twoSided" className="font-normal">Render Two-Sided</Label>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="clearcoat-sheen">
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                <ShieldCheck size={16} className="mr-2"/> Clearcoat &amp; Sheen
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <Label className="font-medium">Clearcoat (Car Paint, Lacquer)</Label>
                <div className="space-y-1">
                    <Label htmlFor="mat-clearcoat">Intensity: {(editedMaterial.clearcoat ?? 0).toFixed(2)}</Label>
                    <Slider id="mat-clearcoat" min={0} max={1} step={0.01} value={[editedMaterial.clearcoat ?? 0]} onValueChange={(val) => handleSliderChange('clearcoat', val)} />
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="mat-clearcoatIOR">Clearcoat IOR (WIP): {(editedMaterial.clearcoatIOR ?? 1.5).toFixed(2)}</Label>
                    <Slider id="mat-clearcoatIOR" min={1} max={2.5} step={0.01} value={[editedMaterial.clearcoatIOR ?? 1.5]} onValueChange={(val) => handleSliderChange('clearcoatIOR', val)} disabled={!editedMaterial.clearcoat || editedMaterial.clearcoat === 0}/>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="mat-clearcoat-roughness">Roughness: {(editedMaterial.clearcoatRoughness ?? 0).toFixed(2)}</Label>
                    <Slider id="mat-clearcoat-roughness" min={0} max={1} step={0.01} value={[editedMaterial.clearcoatRoughness ?? 0]} onValueChange={(val) => handleSliderChange('clearcoatRoughness', val)} disabled={!editedMaterial.clearcoat || editedMaterial.clearcoat === 0}/>
                </div>
                <TextureInput label="Clearcoat Map" currentUrl={editedMaterial.clearcoatMap} onTextureUpload={(dataUrl) => handleTextureUpload('clearcoatMap', dataUrl)} onTextureClear={() => handleTextureClear('clearcoatMap')} channel="clearcoat" disabled={!editedMaterial.clearcoat || editedMaterial.clearcoat === 0}/>
                <TextureInput label="Clearcoat Roughness Map" currentUrl={editedMaterial.clearcoatRoughnessMap} onTextureUpload={(dataUrl) => handleTextureUpload('clearcoatRoughnessMap', dataUrl)} onTextureClear={() => handleTextureClear('clearcoatRoughnessMap')} channel="clearcoat roughness" disabled={!editedMaterial.clearcoat || editedMaterial.clearcoat === 0}/>
                <TextureInput label="Clearcoat Normal Map" currentUrl={editedMaterial.clearcoatNormalMap} onTextureUpload={(dataUrl) => handleTextureUpload('clearcoatNormalMap', dataUrl)} onTextureClear={() => handleTextureClear('clearcoatNormalMap')} channel="clearcoat normal" disabled={!editedMaterial.clearcoat || editedMaterial.clearcoat === 0}/>
                
                <Label className="font-medium pt-2 border-t mt-2">Sheen (Cloth, Velvet)</Label>
                 <div className="space-y-1">
                    <Label htmlFor="mat-sheen">Intensity: {(editedMaterial.sheen ?? 0).toFixed(2)}</Label>
                    <Slider id="mat-sheen" min={0} max={1} step={0.01} value={[editedMaterial.sheen ?? 0]} onValueChange={(val) => handleSliderChange('sheen', val)} />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mat-sheenColor" className="text-right">Sheen Color</Label>
                    <Input id="mat-sheenColor" type="color" value={editedMaterial.sheenColor || '#FFFFFF'} onChange={(e) => handleChange('sheenColor', e.target.value)} className="col-span-3 h-9" disabled={!editedMaterial.sheen || editedMaterial.sheen === 0}/>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mat-sheenTint" className="text-right">Sheen Tint (WIP)</Label>
                    <Input id="mat-sheenTint" type="color" value={editedMaterial.sheenTint || '#FFFFFF'} onChange={(e) => handleChange('sheenTint', e.target.value)} className="col-span-3 h-9" disabled={!editedMaterial.sheen || editedMaterial.sheen === 0}/>
                </div>
                <TextureInput label="Sheen Color Map" currentUrl={editedMaterial.sheenColorMap} onTextureUpload={(dataUrl) => handleTextureUpload('sheenColorMap', dataUrl)} onTextureClear={() => handleTextureClear('sheenColorMap')} channel="sheen" disabled={!editedMaterial.sheen || editedMaterial.sheen === 0}/>
                 <div className="space-y-1">
                    <Label htmlFor="mat-sheenRoughness">Sheen Roughness: {(editedMaterial.sheenRoughness ?? 0.3).toFixed(2)}</Label>
                    <Slider id="mat-sheenRoughness" min={0} max={1} step={0.01} value={[editedMaterial.sheenRoughness ?? 0.3]} onValueChange={(val) => handleSliderChange('sheenRoughness', val)} disabled={!editedMaterial.sheen || editedMaterial.sheen === 0}/>
                </div>
                <TextureInput label="Sheen Roughness Map" currentUrl={editedMaterial.sheenRoughnessMap} onTextureUpload={(dataUrl) => handleTextureUpload('sheenRoughnessMap', dataUrl)} onTextureClear={() => handleTextureClear('sheenRoughnessMap')} channel="sheen roughness" disabled={!editedMaterial.sheen || editedMaterial.sheen === 0}/>
              </AccordionContent>
            </AccordionItem>

             <AccordionItem value="sss-anisotropy">
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                <Droplets size={16} className="mr-2"/> SSS &amp; Anisotropy
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <Label className="font-medium">Subsurface Scattering (Skin, Wax)</Label>
                 <div className="space-y-1">
                    <Label htmlFor="mat-sss">Weight: {(editedMaterial.subsurfaceScattering ?? 0).toFixed(2)}</Label>
                    <Slider id="mat-sss" min={0} max={1} step={0.01} value={[editedMaterial.subsurfaceScattering ?? 0]} onValueChange={(val) => handleSliderChange('subsurfaceScattering', val)} />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mat-sssColor" className="text-right">SSS Color</Label>
                    <Input id="mat-sssColor" type="color" value={editedMaterial.subsurfaceColor || '#FFFFFF'} onChange={(e) => handleChange('subsurfaceColor', e.target.value)} className="col-span-3 h-9" disabled={!editedMaterial.subsurfaceScattering || editedMaterial.subsurfaceScattering === 0}/>
                </div>
                <TextureInput label="SSS Color Map" currentUrl={editedMaterial.subsurfaceColorMap} onTextureUpload={(dataUrl) => handleTextureUpload('subsurfaceColorMap', dataUrl)} onTextureClear={() => handleTextureClear('subsurfaceColorMap')} channel="sss color" disabled={!editedMaterial.subsurfaceScattering || editedMaterial.subsurfaceScattering === 0}/>
                {/* SSS Radius Vector Input - WIP */}
                 <div className="space-y-1">
                    <Label className="text-xs">SSS Radius [R,G,B] (WIP): {`[${(editedMaterial.subsurfaceRadius?.[0] ?? 0).toFixed(2)}, ${(editedMaterial.subsurfaceRadius?.[1] ?? 0).toFixed(2)}, ${(editedMaterial.subsurfaceRadius?.[2] ?? 0).toFixed(2)}]`}</Label>
                    <p className="text-xs text-muted-foreground">Complex radius control coming soon.</p>
                </div>
                <TextureInput label="SSS Radius Map (WIP)" currentUrl={editedMaterial.subsurfaceRadiusMap} onTextureUpload={(dataUrl) => handleTextureUpload('subsurfaceRadiusMap', dataUrl)} onTextureClear={() => handleTextureClear('subsurfaceRadiusMap')} channel="sss radius" disabled/>


                <Label className="font-medium pt-2 border-t mt-2">Anisotropy (Brushed Metal)</Label>
                <div className="space-y-1">
                    <Label htmlFor="mat-anisotropy">Intensity: {(editedMaterial.anisotropy ?? 0).toFixed(2)}</Label>
                    <Slider id="mat-anisotropy" min={0} max={1} step={0.01} value={[editedMaterial.anisotropy ?? 0]} onValueChange={(val) => handleSliderChange('anisotropy', val)} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="mat-anisotropyRotation">Rotation (°): {(editedMaterial.anisotropyRotation ?? 0).toFixed(1)}</Label>
                    <Slider id="mat-anisotropyRotation" min={0} max={360} step={0.1} value={[editedMaterial.anisotropyRotation ?? 0]} onValueChange={(val) => handleSliderChange('anisotropyRotation', val)} disabled={!editedMaterial.anisotropy || editedMaterial.anisotropy === 0}/>
                </div>
                <TextureInput label="Anisotropy Map" currentUrl={editedMaterial.anisotropyMap} onTextureUpload={(dataUrl) => handleTextureUpload('anisotropyMap', dataUrl)} onTextureClear={() => handleTextureClear('anisotropyMap')} channel="anisotropy" disabled={!editedMaterial.anisotropy || editedMaterial.anisotropy === 0}/>
                <TextureInput label="Anisotropy Rotation Map (WIP)" currentUrl={editedMaterial.anisotropyRotationMap} onTextureUpload={(dataUrl) => handleTextureUpload('anisotropyRotationMap', dataUrl)} onTextureClear={() => handleTextureClear('anisotropyRotationMap')} channel="anisotropy rotation" disabled/>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="advanced-options">
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                <Settings size={16} className="mr-2"/> Advanced Options
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mat-brdf" className="text-right">BRDF Type (WIP)</Label>
                    <Select value={editedMaterial.brdfType || 'ggx'} onValueChange={(val) => handleChange('brdfType', val as BRDFModelType)} disabled>
                        <SelectTrigger id="mat-brdf" className="col-span-3 h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ggx" className="text-sm">GGX (Default)</SelectItem>
                            <SelectItem value="beckmann" className="text-sm">Beckmann</SelectItem>
                            <SelectItem value="phong" className="text-sm">Phong</SelectItem>
                            <SelectItem value="blinn_phong" className="text-sm">Blinn-Phong</SelectItem>
                            <SelectItem value="ward" className="text-sm">Ward (Anisotropic)</SelectItem>
                            <SelectItem value="cook_torrance" className="text-sm">Cook-Torrance</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="mat-translucency">Translucency (WIP): {(editedMaterial.translucency ?? 0).toFixed(2)}</Label>
                    <Slider id="mat-translucency" min={0} max={1} step={0.01} value={[editedMaterial.translucency ?? 0]} onValueChange={(val) => handleSliderChange('translucency', val)} disabled/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mat-translucencyColor" className="text-right">Translucency Color (WIP)</Label>
                    <Input id="mat-translucencyColor" type="color" value={editedMaterial.translucencyColor || '#FFFFFF'} onChange={(e) => handleChange('translucencyColor', e.target.value)} className="col-span-3 h-9" disabled/>
                </div>
                <TextureInput label="Translucency Map (WIP)" currentUrl={editedMaterial.translucencyMap} onTextureUpload={(dataUrl) => handleTextureUpload('translucencyMap', dataUrl)} onTextureClear={() => handleTextureClear('translucencyMap')} channel="translucency" disabled/>
                <div className="pt-2 border-t mt-2">
                    <Button variant="outline" size="sm" className="w-full h-8 text-xs" disabled>Texture Baking Tools (WIP)...</Button>
                </div>
              </AccordionContent>
            </AccordionItem>


          </Accordion>
        </ScrollArea>
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" size="sm">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" onClick={handleSave} size="sm">Apply & Close</Button>
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
    const selectedObj = objects.find(o => o.id === selectedObjectId);
    if(selectedObj?.locked){
        toast({ title: "Object Locked", description: `${selectedObj.name} is locked. Cannot assign material.`, variant: "destructive" });
        return;
    }
    updateObject(selectedObjectId, { materialId: selectedMaterialForList });
    const materialName = materials.find(m => m.id === selectedMaterialForList)?.name || "Selected Material";
    const objectName = selectedObj?.name || "Selected Object";
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
      <AccordionContent className="space-y-3 p-1 text-xs">
        <div className="flex gap-2">
            <Button onClick={handleAddNewMaterial} size="sm" className="flex-1 text-xs h-8" variant="outline"> 
              <PlusCircle size={14} className="mr-2" /> New
            </Button>
            <Button size="sm" className="text-xs h-8" variant="outline" disabled><Copy size={14} className="mr-1"/>Duplicate (WIP)</Button>
            <Button size="sm" className="text-xs h-8" variant="outline" disabled><RefreshCcw size={14} className="mr-1"/>Reset (WIP)</Button>
        </div>
        
        <ScrollArea className="h-[200px] w-full rounded-md border p-1">
          {materials.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No materials yet.</p>}
          <div className="space-y-0.5">
            {materials.map((material) => (
              <div 
                key={material.id} 
                className={cn(
                  "flex items-center justify-between p-1.5 rounded-md cursor-pointer hover:bg-muted/50", 
                  selectedMaterialForList === material.id && 'bg-muted ring-1 ring-primary',
                  activePaintMaterialId === material.id && activeTool === 'paint' && 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                )}
                onClick={() => handleMaterialClick(material.id)}
                title={material.name || material.id}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div style={{ backgroundColor: material.color, opacity: material.opacity ?? 1 }} className="w-4 h-4 rounded-sm border shrink-0" />
                  <span className="truncate flex-grow text-xs">{material.name || material.id}</span>
                   {activePaintMaterialId === material.id && activeTool === 'paint' && (
                    <Paintbrush size={12} className="text-primary shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {materialForEditingDialog && materialForEditingDialog.id === material.id && (
                     <MaterialEditorDialog 
                        material={materialForEditingDialog}
                        onSave={(updatedMat) => {
                            updateMaterial(updatedMat.id, updatedMat);
                        }}
                        trigger={
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-70 hover:opacity-100" 
                              title="Edit Material"
                            >
                                <Edit3 size={14} />
                            </Button>
                        }
                     />
                  )}
                  {material.id !== DEFAULT_MATERIAL_ID && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-70 hover:opacity-100 text-destructive hover:text-destructive" title="Delete Material"> 
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
             <Button onClick={handleAssignToSelectedObject} size="sm" variant="outline" className="w-full text-xs h-8"> 
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
         <p className="text-[10px] text-muted-foreground text-center pt-1 italic">Full material editor & library (WIP).</p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default MaterialsPanelAccordion; 

