"use client";

import React, { useState, useEffect }from 'react';
import { SceneProvider, useScene } from "@/context/scene-context";
import SceneViewer from "@/components/scene/viewer";
import MainSidebar from "@/components/sidebar/main-sidebar";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Removed TabsContent as it's not used here
import { Workflow, ChevronDown, ChevronUp, Settings, Brush, Camera as RenderIcon } from "lucide-react"; 
import { cn } from "@/lib/utils";
import type { AppMode } from '@/types';

// Inline SVG for Node Editor Icon (simple placeholder)
const NodeEditorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 opacity-80">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <circle cx="15.5" cy="8.5" r="1.5"></circle>
    <circle cx="8.5" cy="15.5" r="1.5"></circle>
    <circle cx="15.5" cy="15.5" r="1.5"></circle>
    <line x1="8.5" y1="10" x2="8.5" y2="14"></line>
    <line x1="15.5" y1="10" x2="15.5" y2="14"></line>
    <line x1="10" y1="8.5" x2="14" y2="8.5"></line>
    <line x1="10" y1="15.5" x2="14" y2="15.5"></line>
  </svg>
);

const AppModeSwitcher: React.FC = () => {
  const { appMode, setAppMode } = useScene();
  const [currentMode, setCurrentMode] = useState<AppMode>(appMode || 'modelling');

  useEffect(() => {
    setCurrentMode(appMode || 'modelling');
  }, [appMode]);
  
  const handleModeChange = (mode: string) => {
    setAppMode(mode as AppMode);
    setCurrentMode(mode as AppMode);
  };

  return (
    <Tabs value={currentMode} onValueChange={handleModeChange} className="w-full bg-background border-b shadow-sm">
      <TabsList className="grid w-full grid-cols-3 h-12 rounded-none border-b-0 p-0">
        <TabsTrigger value="modelling" className="h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:shadow-none data-[state=active]:bg-muted/50 flex items-center gap-2 text-sm font-medium">
          <Settings size={16} /> Modelling
        </TabsTrigger>
        <TabsTrigger value="texturing" className="h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:shadow-none data-[state=active]:bg-muted/50 flex items-center gap-2 text-sm font-medium">
          <Brush size={16} /> Texturing
        </TabsTrigger>
        <TabsTrigger value="rendering" className="h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:shadow-none data-[state=active]:bg-muted/50 flex items-center gap-2 text-sm font-medium">
          <RenderIcon size={16} /> Rendering
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

const NodeEditorSection: React.FC = () => {
  const { appMode } = useScene();
  const [isNodeEditorOpen, setIsNodeEditorOpen] = useState(true); // Default to open

  const getNodeEditorTitle = () => {
    switch(appMode) {
      case 'modelling': return "Geometry Nodes";
      case 'texturing': return "Shader Nodes";
      case 'rendering': return "Compositing Nodes";
      default: return "Node Editor";
    }
  }

  const getNodeEditorPlaceholder = () => {
     switch(appMode) {
      case 'modelling': return "Procedural geometry node editor. (Future Development)";
      case 'texturing': return "Create and edit materials using a node-based interface. (Future Development)";
      case 'rendering': return "Post-processing and render pass node editor. (Future Development)";
      default: return "Node-based editor area. (Future Development)";
    }
  }

  return (
    <div className={cn(
      "flex-none flex flex-col bg-background border-b border-t overflow-hidden transition-all duration-300 ease-in-out", // Added border-t
      isNodeEditorOpen ? "h-[30%] min-h-[150px]" : "h-12" // Matched collapsed height to AppModeSwitcher
    )}>
      <div className="p-3 border-b bg-muted/20 dark:bg-muted/10 flex justify-between items-center h-12"> {/* Ensure header is fixed height */}
        <h2 className="text-base font-semibold text-foreground flex items-center">
          <NodeEditorIcon />
          {getNodeEditorTitle()}
        </h2>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7" 
          onClick={() => setIsNodeEditorOpen(!isNodeEditorOpen)}
          aria-label={isNodeEditorOpen ? "Collapse Node Editor" : "Expand Node Editor"}
        >
          {isNodeEditorOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </Button>
      </div>
      {isNodeEditorOpen && (
        <div className="flex-grow p-4 flex items-center justify-center text-muted-foreground overflow-auto bg-card/30">
          <span className="italic text-sm">{getNodeEditorPlaceholder()}</span>
        </div>
      )}
    </div>
  );
}

const ArchiVisionLayout: React.FC = () => {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r shadow-md"> {/* Added shadow */}
        <SidebarHeader className="p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Workflow className="w-7 h-7 text-accent" />
            <h1 className="text-xl font-semibold group-data-[collapsible=icon]:hidden">ArchiVision</h1>
          </div>
          <SidebarTrigger className="md:hidden" />
        </SidebarHeader>
        <SidebarContent>
          <MainSidebar />
        </SidebarContent>
        <SidebarFooter className="p-2 group-data-[collapsible=icon]:hidden">
          <p className="text-xs text-muted-foreground">© 2024 ArchiVision</p>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col h-screen bg-background"> {/* Ensure bg for inset */}
        {/* Mobile Header */}
        <div className="p-2 md:hidden border-b flex items-center justify-start sticky top-0 bg-background z-20 shadow-sm">
          <SidebarTrigger />
          <div className="flex items-center gap-2 ml-2">
            <Workflow className="w-5 h-5 text-accent" />
            <h1 className="text-lg font-semibold">ArchiVision</h1>
          </div>
        </div>

        {/* App Mode Switcher */}
        <AppModeSwitcher />
        
        <div className="flex-grow flex flex-col overflow-hidden">
          {/* Scene Viewer takes up most space */}
          <div className="flex-grow overflow-hidden relative">
            <SceneViewer />
          </div>
          {/* Node Editor Area - positioned at the bottom */}
          <NodeEditorSection />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function ArchiVisionAppPage() {
  return (
    <SceneProvider>
      <ArchiVisionLayout />
      <Toaster />
    </SceneProvider>
  );
}
