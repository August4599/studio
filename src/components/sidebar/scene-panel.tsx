
"use client";

import React, { useRef } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input"; // No longer needed for JSON import
import { useScene } from "@/context/scene-context";
import { useProject } from "@/context/project-context"; 
import type { SceneData } from "@/types"; 
import { Save, Trash2Icon, LogOut, Import } from "lucide-react"; // Removed Upload icon as JSON upload is removed
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
  // const fileInputRef = useRef<HTMLInputElement>(null); // No longer needed for JSON import
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

  // handleImportSceneFile and triggerFileImport removed as JSON import is removed.

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
      description: "Functionality to import DWG/DXF files, similar to SketchUp, is currently under development. This feature will involve parsing CAD data and converting it to 3D objects within ArchiVision.",
      variant: "default",
      duration: 7000, // Increased duration for a more detailed message
    });
    // Actual implementation would involve:
    // 1. Triggering a file input for .dwg or .dxf files.
    // 2. Using a client-side or server-side library to parse the CAD file.
    //    (e.g., 'dxf-parser' for DXF, or more complex solutions for DWG like a WASM library or server-side conversion).
    // 3. Interpreting CAD entities (lines, polylines, arcs, layers, blocks etc.) and mapping them to SceneObject definitions.
    //    - This includes handling units, scale, and positioning relative to the ArchiVision scene origin.
    //    - Potentially offering options for layer import, 2D to 3D extrusion (like SketchUp's 'Push/Pull' on imported faces).
    // 4. Adding these new objects to the scene via addObject or a specialized batch import mechanism.
    // 5. This is a significant feature requiring substantial development.
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
        
        {/* JSON Import button and input removed */}
        {/* <Button onClick={triggerFileImport} className="w-full text-xs" size="sm" variant="outline" disabled={isProjectLoading || !currentProject}>
          <Import size={14} className="mr-2" /> Import Scene File (.json)
        </Button>
        <Input type="file" ref={fileInputRef} onChange={handleImportSceneFile} accept=".json" className="hidden" /> */}

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
