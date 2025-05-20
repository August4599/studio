
"use client";

import React, { useEffect }from 'react';
import dynamic from 'next/dynamic';
import { SceneProvider, useScene } from "@/context/scene-context";
import { ProjectProvider, useProject } from "@/context/project-context";
import MainToolbar from '@/components/layout/main-toolbar';
import ToolsSidebar from '@/components/sidebar/ToolsSidebar';
import RightInspectorPanel from '@/components/sidebar/RightInspectorPanel';
import StatusBar from '@/components/layout/StatusBar';
import ViewportOverlayControls from '@/components/scene/ViewportOverlayControls';
import ProjectDashboard from '@/components/project/project-dashboard';
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import type { ToolType, PrimitiveType } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar"; // Removed unused Sidebar components from here
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

const SceneViewer = dynamic(() => import('@/components/scene/viewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-muted/50">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Loading 3D Viewer...</span>
    </div>
  ),
});

const ArchiVisionLayout: React.FC = () => {
  const { addObject, triggerZoomExtents, selectedObjectId, removeObject: removeObjectFromContext, setActiveTool, activeTool, setDrawingState } = useScene();
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const key = event.key.toUpperCase();
      let toolToSet: ToolType | undefined = undefined;
      let newObjectToAdd: PrimitiveType | undefined = undefined;
      let toolLabel: string | undefined = undefined;

      if (!event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
        switch (key) {
          case 'Q': toolToSet = 'select'; toolLabel = 'Select'; break;
          case 'W': toolToSet = 'move'; toolLabel = 'Move'; break;
          case 'E': toolToSet = 'rotate'; toolLabel = 'Rotate'; break;
          case 'R': toolToSet = 'scale'; toolLabel = 'Scale'; break;
          case 'L': toolToSet = 'line'; toolLabel = 'Line'; break;
          case 'B': 
            if (activeTool === 'paint') {
                toast({ title: "Paint Tool", description: "Paint tool already active. Select material from panel."});
            } else {
                toolToSet = 'paint'; toolLabel = 'Paint Bucket';
            }
            break;
          case 'P': toolToSet = 'pushpull'; toolLabel = 'Push/Pull'; break;
          case 'T': toolToSet = 'tape'; toolLabel = 'Tape Measure'; break;
          case 'F':
            triggerZoomExtents(selectedObjectId || undefined);
            toast({ title: "View Reset", description: selectedObjectId ? "Zoomed to selected object." : "Zoomed to fit all objects." });
            return; 
          case ' ': 
            event.preventDefault(); 
            toolToSet = 'select';
            toolLabel = 'Select';
            break;
          case 'ESCAPE':
            setActiveTool('select'); 
            setDrawingState({ isActive: false, startPoint: null, currentPoint: null, pushPullFaceInfo: null, measureDistance: null });
            toast({ title: "Tool Reset", description: "Switched to Select tool. Drawing cancelled." });
            return;
          case 'DELETE':
            if (selectedObjectId) {
              const removedObject = removeObjectFromContext(selectedObjectId); // Call the context function
              if (removedObject) {
                toast({ title: "Object Deleted", description: `${removedObject.name} removed from scene.` });
              } else {
                // This case should ideally not happen if selectedObjectId was valid
                toast({ title: "Delete Error", description: "Selected object could not be found to delete.", variant: "destructive" });
              }
            }
            return;
        }
      }

      if (event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
        switch (key) {
          case 'A': 
            event.preventDefault();
            newObjectToAdd = 'cube';
            break;
          case 'C': 
             event.preventDefault();
             toolToSet = 'circle';
             toolLabel = 'Circle Tool';
             break;
          case 'R': // Shift + R for Rectangle tool
            event.preventDefault();
            toolToSet = 'rectangle';
            toolLabel = 'Rectangle Tool';
            break;
        }
      }

      if (toolToSet) {
        setActiveTool(toolToSet);
        if (toolLabel) {
          toast({ title: "Tool Changed", description: `${toolLabel} tool activated.` });
        }
      }
      if (newObjectToAdd) {
        addObject(newObjectToAdd as Exclude<PrimitiveType, 'cadPlan'>);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setActiveTool, addObject, toast, triggerZoomExtents, selectedObjectId, activeTool, setDrawingState, removeObjectFromContext]);


  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
      <MainToolbar />
      <div className="flex flex-row flex-grow overflow-hidden">
        <ToolsSidebar />
        <ResizablePanelGroup direction="vertical" className="flex-grow">
          <ResizablePanel defaultSize={100}>
            <div className="flex-grow relative h-full w-full">
              <SceneViewer />
              <ViewportOverlayControls />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        <RightInspectorPanel />
      </div>
      <StatusBar />
    </div>
  );
};

const AppCore: React.FC = () => {
  const { currentProject, isLoading } = useProject();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-4 text-lg">Loading ArchiVision...</span>
      </div>
    );
  }

  if (!currentProject) {
    return <ProjectDashboard />;
  }

  return (
    <SceneProvider key={currentProject.id} initialSceneOverride={currentProject.sceneData}>
      <ArchiVisionLayout />
    </SceneProvider>
  );
};

export default function ArchiVisionAppPage() {
  return (
    <ProjectProvider>
      <SidebarProvider defaultOpen side="left"> 
        <AppCore />
      </SidebarProvider>
      <Toaster />
    </ProjectProvider>
  );
}
