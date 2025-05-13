"use client";

import React, { useRef, useState } from "react"; // Added useState for future use if needed
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useScene } from "@/context/scene-context";
import { useProject } from "@/context/project-context"; 
import type { SceneData } from "@/types"; 
import { Save, Upload, Trash2Icon, LogOut, Import } from "lucide-react";
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


const ScenePanel = () => {
  const { loadScene: loadSceneIntoContext, clearCurrentProjectScene, getCurrentSceneData } = useScene();
  const { currentProject, saveCurrentProjectScene, closeProject, isLoading: isProjectLoading } = useProject(); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSaveCurrentProject = async () => {
    if (!currentProject || isProjectLoading) return;
    const sceneDataToSave = getCurrentSceneData();
    await saveCurrentProjectScene(sceneDataToSave);
    toast({ title: "Project Saved", description: `${currentProject.name} has been saved.` });
  };
  
  const handleClearProjectScene = () => {
    if (!currentProject || isProjectLoading) return;
    clearCurrentProjectScene(); 
    const clearedSceneData = getCurrentSceneData(); 
    saveCurrentProjectScene(clearedSceneData).then(() => {
         toast({ title: "Scene Cleared", description: `The scene in ${currentProject.name} has been reset.` });
    });
  };

  const handleImportSceneFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentProject || isProjectLoading) {
        toast({ title: "No Project Open", description: "Please open or create a project to import a scene.", variant: "destructive"});
        if (event.target) event.target.value = ""; // Reset file input
        return;
    }
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (json.objects && json.materials && json.ambientLight && json.directionalLight) {
            loadSceneIntoContext(json as SceneData); 
            saveCurrentProjectScene(json as SceneData).then(() => {
                 toast({ title: "Scene Imported", description: `Scene data imported into ${currentProject.name}.` });
            });
          } else {
            throw new Error("Invalid ArchiVision scene file format.");
          }
        } catch (error) {
          console.error("Failed to import scene:", error);
          toast({ title: "Import Error", description: `Failed to import scene: ${(error as Error).message}`, variant: "destructive" });
        }
      };
      reader.readAsText(file);
    }
    if (event.target) {
        event.target.value = ""; 
    }
  };

  const triggerFileImport = () => {
    fileInputRef.current?.click();
  };

  const handleBackToProjects = () => {
    if (isProjectLoading) return;
    closeProject();
  };

  const handleImportCadPlan = () => {
    if (!currentProject || isProjectLoading) {
        toast({ title: "No Project Open", description: "Please open or create a project to import a CAD plan.", variant: "destructive"});
        return;
    }
    // Placeholder for actual CAD import logic
    toast({
      title: "CAD Import (In Development)",
      description: "Functionality to import DWG/DXF files is currently under development. This feature requires a complex CAD file parser and geometry conversion.",
      variant: "default",
      duration: 5000,
    });
    // Actual implementation would involve:
    // 1. Triggering a file input for .dwg or .dxf files.
    // 2. Using a client-side or server-side library to parse the CAD file.
    //    (e.g., 'dxf-parser' for DXF, or more complex solutions for DWG).
    // 3. Converting CAD entities (lines, polylines, arcs, etc.) into Three.js geometries or SceneObject definitions.
    // 4. Adding these new objects to the scene via addObject or a similar mechanism.
  };

  return (
    <AccordionItem value="item-scene">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Save size={18} /> Project & Scene
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-3 p-2">
        {currentProject && (
          <Button onClick={handleSaveCurrentProject} className="w-full text-xs" size="sm" variant="default" disabled={isProjectLoading}>
            <Save size={14} className="mr-2" /> Save Project ({currentProject.name})
          </Button>
        )}
        
        <Button onClick={triggerFileImport} className="w-full text-xs" size="sm" variant="outline" disabled={isProjectLoading || !currentProject}>
          <Import size={14} className="mr-2" /> Import Scene File (.json)
        </Button>
        <Input type="file" ref={fileInputRef} onChange={handleImportSceneFile} accept=".json" className="hidden" />

        <Button 
          onClick={handleImportCadPlan} 
          className="w-full text-xs" 
          size="sm" 
          variant="outline" 
          disabled={isProjectLoading || !currentProject}
        >
          <Import size={14} className="mr-2" /> Import CAD Plan (.dwg, .dxf)
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full text-xs" size="sm" disabled={isProjectLoading || !currentProject}>
                <Trash2Icon size={14} className="mr-2" /> Clear Scene in Project
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will remove all objects and reset lighting for the current project scene ('{currentProject?.name}'). This will be saved and cannot be easily undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProjectLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearProjectScene} disabled={isProjectLoading}>
                Clear Scene
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button onClick={handleBackToProjects} className="w-full text-xs" size="sm" variant="outline" disabled={isProjectLoading}>
          <LogOut size={14} className="mr-2" /> Back to Projects
        </Button>

      </AccordionContent>
    </AccordionItem>
  );
};

export default ScenePanel;