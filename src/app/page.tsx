
"use client";

import React, { useState, useEffect }from 'react';
import { SceneProvider, useScene } from "@/context/scene-context";
import { ProjectProvider, useProject } from "@/context/project-context";
import SceneViewer from "@/components/scene/viewer";
import MainToolbar from '@/components/layout/main-toolbar';
import ToolsSidebar from '@/components/sidebar/tools-sidebar';
import RightInspectorPanel from '@/components/sidebar/RightInspectorPanel';
import NodeEditorPanel from '@/components/layout/NodeEditorPanel';
import StatusBar from '@/components/layout/StatusBar';
import ViewportOverlayControls from '@/components/scene/ViewportOverlayControls';
import ProjectDashboard from '@/components/project/project-dashboard';
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import type { ToolType, PrimitiveType } from '@/types';
import { useToast } from "@/hooks/use-toast";

const ArchiVisionLayout: React.FC = () => {
  const { addObject, triggerZoomExtents, selectedObjectId, setActiveTool } = useScene();
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      // Ignore shortcuts if an input, textarea, or contentEditable element is focused
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const key = event.key.toUpperCase();
      let toolToSet: ToolType | undefined = undefined;
      let newObjectToAdd: PrimitiveType | undefined = undefined;
      let toolLabel: string | undefined = undefined;

      // Standard tool shortcuts (no modifiers)
      if (!event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
        switch (key) {
          case 'Q': toolToSet = 'select'; toolLabel = 'Select'; break;
          case 'W': toolToSet = 'move'; toolLabel = 'Move'; break;
          case 'E': toolToSet = 'rotate'; toolLabel = 'Rotate'; break;
          case 'R': toolToSet = 'scale'; toolLabel = 'Scale'; break;
          case 'L': toolToSet = 'line'; toolLabel = 'Line'; break;
          case 'B': toolToSet = 'paint'; toolLabel = 'Paint'; break;
          case 'P': toolToSet = 'pushpull'; toolLabel = 'Push/Pull'; break;
          case 'T': toolToSet = 'tape'; toolLabel = 'Tape Measure'; break;
          case 'F':
            triggerZoomExtents(selectedObjectId || undefined);
            toast({ title: "View Reset", description: selectedObjectId ? "Zoomed to selected object." : "Zoomed to fit all objects." });
            return; // Direct action, no tool change
          case ' ': // Spacebar for Select tool
            event.preventDefault(); // Prevent page scroll
            toolToSet = 'select';
            toolLabel = 'Select';
            break;
          case 'ESCAPE':
            setActiveTool('select'); // Reset to select tool
            toast({ title: "Tool Reset", description: "Switched to Select tool." });
            return; // Direct action
        }
      }

      // Add primitive shortcuts (Shift + Key)
      if (event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
        switch (key) {
          case 'A': // Shift + A for Add Cube
            event.preventDefault();
            newObjectToAdd = 'cube';
            break;
          case 'C': // Shift + C for Circle tool
             event.preventDefault();
             toolToSet = 'circle';
             toolLabel = 'Circle Tool';
             break;
          // Add more Shift + Key shortcuts here for other primitives or tools if needed
          // Example for rectangle tool with Shift + R (if not conflicting)
          // case 'R':
          //   event.preventDefault();
          //   toolToSet = 'rectangle';
          //   toolLabel = 'Rectangle Tool';
          //   break;
        }
      }

      if (toolToSet) {
        setActiveTool(toolToSet);
        if (toolLabel) {
          toast({ title: "Tool Changed", description: `${toolLabel} tool activated.` });
        }
      }
      if (newObjectToAdd) {
        addObject(newObjectToAdd as Exclude<PrimitiveType, 'cadPlan' | 'cadPlan'>);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setActiveTool, addObject, toast, triggerZoomExtents, selectedObjectId]);


  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
      <MainToolbar />
      <div className="flex flex-row flex-grow overflow-hidden">
        <ToolsSidebar />
        <div className="flex flex-col flex-grow relative overflow-hidden">
          <div className="flex-grow relative">
            <SceneViewer />
            <ViewportOverlayControls />
          </div>
          <NodeEditorPanel />
        </div>
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
      <AppCore />
      <Toaster />
    </ProjectProvider>
  );
}
