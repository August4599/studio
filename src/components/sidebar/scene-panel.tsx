"use client";

import React, { useRef } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useScene } from "@/context/scene-context";
import type { SceneData } from "@/types";
import { Save, Upload, Trash2Icon } from "lucide-react";
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
} from "@/components/ui/alert-dialog"


const ScenePanel = () => {
  const { objects, materials, ambientLight, directionalLight, loadScene, clearScene, selectedObjectId } = useScene();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSaveScene = () => {
    const sceneData: SceneData = { objects, materials, ambientLight, directionalLight, selectedObjectId };
    const jsonString = JSON.stringify(sceneData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "archivision-scene.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Scene Saved", description: "Scene data downloaded as JSON." });
  };

  const handleLoadScene = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          // Add more robust validation if needed
          if (json.objects && json.materials && json.ambientLight && json.directionalLight) {
            loadScene(json as SceneData);
            toast({ title: "Scene Loaded", description: "Scene data loaded successfully." });
          } else {
            throw new Error("Invalid scene file format.");
          }
        } catch (error) {
          console.error("Failed to load scene:", error);
          toast({ title: "Load Error", description: `Failed to load scene: ${(error as Error).message}`, variant: "destructive" });
        }
      };
      reader.readAsText(file);
    }
    // Reset file input to allow loading the same file again if needed
    if (event.target) {
        event.target.value = "";
    }
  };

  const triggerFileLoad = () => {
    fileInputRef.current?.click();
  };

  return (
    <AccordionItem value="item-scene">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Save size={18} /> Scene Management
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-3 p-2">
        <Button onClick={handleSaveScene} className="w-full text-xs" size="sm" variant="outline">
          <Save size={14} className="mr-2" /> Save Scene
        </Button>
        <Button onClick={triggerFileLoad} className="w-full text-xs" size="sm" variant="outline">
          <Upload size={14} className="mr-2" /> Load Scene
        </Button>
        <Input type="file" ref={fileInputRef} onChange={handleLoadScene} accept=".json" className="hidden" />
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full text-xs" size="sm">
                <Trash2Icon size={14} className="mr-2" /> Clear Scene
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will remove all objects and reset lighting to default. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                clearScene();
                toast({ title: "Scene Cleared", description: "The scene has been reset." });
              }}>
                Clear Scene
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </AccordionContent>
    </AccordionItem>
  );
};

export default ScenePanel;
