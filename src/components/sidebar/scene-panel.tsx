
"use client";

import React, { useRef, useState } from "react";
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
import { Save, Trash2Icon, LogOut, Import, Loader2 } from "lucide-react"; 
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
import { parseDxfToSceneObjects } from "@/lib/cad-importer";


const ScenePanel = () => {
  const { addImportedObjects, clearCurrentProjectScene, getCurrentSceneData } = useScene();
  const { currentProject, saveCurrentProjectScene, closeProject, isLoading: isProjectLoading } = useProject(); 
  const cadFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isImportingCad, setIsImportingCad] = useState(false);

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

  const handleBackToProjects = () => {
    if (isProjectLoading || isImportingCad) return;
    closeProject();
  };

  const triggerCadFileImport = () => {
    if (!currentProject || isProjectLoading || isImportingCad) {
        toast({ title: "Action Denied", description: "Ensure a project is open and no import is in progress.", variant: "destructive"});
        return;
    }
    cadFileInputRef.current?.click();
  };

  const handleCadFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentProject) {
      toast({ title: "Import Cancelled", description: "No file selected or no project open.", variant: "default"});
      return;
    }

    setIsImportingCad(true);
    toast({ title: "Importing CAD Plan", description: `Processing ${file.name}... This may take a moment.`, duration: 5000});

    try {
      if (file.name.toLowerCase().endsWith('.dxf')) {
        const fileContent = await file.text();
        // Offload parsing to a timeout to allow UI to update with loading state
        // This is a basic way to make it slightly less blocking, web worker would be better for true non-blocking
        await new Promise(resolve => setTimeout(resolve, 50)); 

        const parsedObjects = parseDxfToSceneObjects(fileContent);
        
        if (parsedObjects.length > 0) {
          addImportedObjects(parsedObjects);
          toast({
            title: "DXF Imported Successfully",
            description: `${parsedObjects.length} object(s) added to the scene from ${file.name}.`,
          });
        } else {
          toast({
            title: "DXF Import Issue",
            description: `No compatible objects found or error parsing ${file.name}. Check console for details.`,
            variant: "default"
          });
        }
      } else if (file.name.toLowerCase().endsWith('.dwg')) {
        toast({
          title: "DWG Import Not Supported",
          description: "Direct DWG import is not yet available. Please convert your DWG file to DXF format for import.",
          variant: "default",
          duration: 7000,
        });
      } else {
        toast({
          title: "Unsupported File Type",
          description: "Please select a .dxf file for CAD import.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error importing CAD file:", error);
      toast({
        title: "CAD Import Failed",
        description: `Could not import ${file.name}. ${error.message || "An unknown error occurred."}`,
        variant: "destructive",
      });
    } finally {
      setIsImportingCad(false);
      // Reset file input
      if (cadFileInputRef.current) {
        cadFileInputRef.current.value = "";
      }
    }
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
          <Button onClick={handleSaveCurrentProject} className="w-full text-xs" size="sm" variant="default" disabled={isProjectLoading || isImportingCad}>
            <Save size={14} className="mr-2" /> Save Project ({currentProject.name})
          </Button>
        )}
        
        <Button 
          onClick={triggerCadFileImport} 
          className="w-full text-xs" 
          size="sm" 
          variant="outline" 
          disabled={isProjectLoading || !currentProject || isImportingCad}
        >
          {isImportingCad ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Import size={14} className="mr-2" />}
          {isImportingCad ? "Importing CAD..." : "Import CAD Plan (.dxf)"}
        </Button>
        <Input 
            type="file" 
            ref={cadFileInputRef} 
            onChange={handleCadFileImport} 
            accept=".dxf,.dwg" 
            className="hidden" 
            disabled={isImportingCad}
        />
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full text-xs" size="sm" disabled={isProjectLoading || !currentProject || isImportingCad}>
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
              <AlertDialogCancel disabled={isProjectLoading || isImportingCad}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearProjectScene} disabled={isProjectLoading || isImportingCad}>
                Clear Scene
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button onClick={handleBackToProjects} className="w-full text-xs" size="sm" variant="outline" disabled={isProjectLoading || isImportingCad}>
          <LogOut size={14} className="mr-2" /> Back to Projects
        </Button>

      </AccordionContent>
    </AccordionItem>
  );
};

export default ScenePanel;

