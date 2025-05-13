
"use client";

import React, { useRef } from "react";
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
import { Save, Trash2Icon, LogOut, Import } from "lucide-react"; 
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
    if (isProjectLoading) return;
    closeProject();
  };

  const triggerCadFileImport = () => {
    if (!currentProject || isProjectLoading) {
        toast({ title: "No Project Open", description: "Please open or create a project to import a CAD plan.", variant: "destructive"});
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

    if (file.name.toLowerCase().endsWith('.dxf')) {
      try {
        const fileContent = await file.text();
        const parsedObjects = parseDxfToSceneObjects(fileContent);
        
        if (parsedObjects.length > 0) {
          addImportedObjects(parsedObjects);
          toast({
            title: "DXF Imported",
            description: `${parsedObjects.length} object(s) added to the scene from ${file.name}.`,
          });
        } else {
          toast({
            title: "DXF Import Issue",
            description: `No compatible objects found or error parsing ${file.name}. Check console for details.`,
            variant: "default"
          });
        }
      } catch (error) {
        console.error("Error importing DXF file:", error);
        toast({
          title: "DXF Import Failed",
          description: `Could not import ${file.name}. Check console for details.`,
          variant: "destructive",
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
        description: "Please select a .dxf file.",
        variant: "destructive",
      });
    }

    // Reset file input
    if (cadFileInputRef.current) {
      cadFileInputRef.current.value = "";
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
          <Button onClick={handleSaveCurrentProject} className="w-full text-xs" size="sm" variant="default" disabled={isProjectLoading}>
            <Save size={14} className="mr-2" /> Save Project ({currentProject.name})
          </Button>
        )}
        
        <Button 
          onClick={triggerCadFileImport} 
          className="w-full text-xs" 
          size="sm" 
          variant="outline" 
          disabled={isProjectLoading || !currentProject}
        >
          <Import size={14} className="mr-2" /> Import CAD Plan (.dxf)
        </Button>
        <Input 
            type="file" 
            ref={cadFileInputRef} 
            onChange={handleCadFileImport} 
            accept=".dxf,.dwg" // Still accept .dwg to show message
            className="hidden" 
        />
        
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
