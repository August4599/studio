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
import type { SceneData, SceneObject } from "@/types"; 
import { Save, Trash2Icon, LogOut, Import, Loader2, Settings } from "lucide-react"; 
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
import { parseDxfToCadPlan } from "@/lib/cad-importer";


const ScenePanel = () => {
  const { importCadPlan, clearCurrentProjectScene, getCurrentSceneData } = useScene();
  const { currentProject, saveCurrentProjectScene, closeProject, isLoading: isProjectLoading } = useProject(); 
  const cadFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isImportingCad, setIsImportingCad] = useState(false);

  const handleSaveCurrentProject = async () => {
    if (!currentProject || isProjectLoading || isImportingCad) return;
    const sceneDataToSave = getCurrentSceneData();
    await saveCurrentProjectScene(sceneDataToSave);
    toast({ title: "Project Saved", description: `${currentProject.name} has been saved.` });
  };
  
  const handleClearProjectScene = () => {
    if (!currentProject || isProjectLoading || isImportingCad) return;
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
    toast({ 
        title: "Importing CAD Plan", 
        description: `Processing ${file.name}... This may take a moment.`, 
        duration: 10000 
    });
    console.log(`[CAD Import] Started processing ${file.name}`);

    try {
      const fileContent = await file.text(); 
      console.log(`[CAD Import] File read successfully. Parsing DXF...`);
        
      const parsedPlanObject = parseDxfToCadPlan(fileContent);
      console.log(`[CAD Import] DXF parsed. Result:`, parsedPlanObject);
        
      if (parsedPlanObject) {
        const importedPlan = await importCadPlan(parsedPlanObject as Partial<SceneObject>); // Cast as Partial<SceneObject>
        if (importedPlan) {
          toast({
            title: "DXF Imported Successfully",
            description: `${importedPlan.name} added to the scene.`,
          });
        } else {
            toast({
                title: "DXF Import Issue",
                description: `Could not process the parsed CAD plan from ${file.name}.`,
                variant: "default"
            });
        }
      } else {
        toast({
          title: "DXF Import Issue",
          description: `No processable plan data found or error parsing ${file.name}. Check console for details.`,
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error("[CAD Import] Error importing CAD file:", error);
      toast({
        title: "CAD Import Failed",
        description: `Could not import ${file.name}. ${error.message || "An unknown error occurred."}`,
        variant: "destructive",
      });
    } finally {
      console.log("[CAD Import] Import process finished.");
      setIsImportingCad(false);
      if (cadFileInputRef.current) {
        cadFileInputRef.current.value = "";
      }
    }
  };


  return (
    <AccordionItem value="item-scene">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Settings size={18} /> Project &amp; Scene
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-3 p-2">
        {currentProject && (
          <Button onClick={handleSaveCurrentProject} className="w-full text-sm h-9" size="sm" variant="default" disabled={isProjectLoading || isImportingCad}> {/* Updated size */}
            {isProjectLoading && !isImportingCad ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />} {/* Updated icon size */}
            Save Project ({currentProject.name})
          </Button>
        )}
        
        <Button 
          onClick={triggerCadFileImport} 
          className="w-full text-sm h-9" // Updated size
          size="sm" 
          variant="outline" 
          disabled={isProjectLoading || !currentProject || isImportingCad}
        >
          {isImportingCad ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Import size={16} className="mr-2" />} {/* Updated icon size */}
          {isImportingCad ? "Importing CAD..." : "Import CAD Plan (.dxf)"}
        </Button>
        <Input 
            type="file" 
            ref={cadFileInputRef} 
            onChange={handleCadFileImport} 
            accept=".dxf" 
            className="hidden" 
            disabled={isImportingCad}
        />
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full text-sm h-9" size="sm" disabled={isProjectLoading || !currentProject || isImportingCad}> {/* Updated size */}
                <Trash2Icon size={16} className="mr-2" /> Clear Scene {/* Updated icon size */}
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

        <Button onClick={handleBackToProjects} className="w-full text-sm h-9" size="sm" variant="outline" disabled={isProjectLoading || isImportingCad}> {/* Updated size */}
          <LogOut size={16} className="mr-2" /> Back to Projects {/* Updated icon size */}
        </Button>

      </AccordionContent>
    </AccordionItem>
  );
};

export default ScenePanel;
