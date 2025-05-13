"use client";

import React, { useState, useEffect }from 'react';
import { SceneProvider, useScene } from "@/context/scene-context";
import { ProjectProvider, useProject } from "@/context/project-context";
import SceneViewer from "@/components/scene/viewer";
import ViewToolbar from "@/components/scene/view-toolbar";
import MainSidebar from "@/components/sidebar/main-sidebar";
import ToolsSidebar from '@/components/sidebar/tools-sidebar';
import ToolsPanel from '@/components/sidebar/tools-panel';
import ProjectDashboard from '@/components/project/project-dashboard';
import {
  SidebarProvider,
  Sidebar,
  // SidebarHeader as ShadcnSidebarHeader, // Avoid name collision
  SidebarTrigger,
  SidebarContent,
  // SidebarFooter as ShadcnSidebarFooter, // Avoid name collision
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Workflow, ChevronDown, ChevronUp, Layers3, Orbit, Settings2, Construction, Loader2, Image as ImageIconLucide, ZoomIn, FolderArchive } from "lucide-react"; 
import { cn } from "@/lib/utils";
import type { AppMode, PrimitiveType, ToolType } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import ScenePanel from '@/components/sidebar/scene-panel';


// Inline SVG for Node Editor Icon
const NodeEditorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 opacity-80">
    <rect x="3" y="3" width="7" height="7" rx="1" ry="1"></rect>
    <rect x="14" y="3" width="7" height="7" rx="1" ry="1"></rect>
    <rect x="3" y="14" width="7" height="7" rx="1" ry="1"></rect>
    <rect x="14" y="14" width="7" height="7" rx="1" ry="1"></rect>
    <line x1="10" y1="6.5" x2="14" y2="6.5"></line>
    <line x1="6.5" y1="10" x2="6.5" y2="14"></line>
    <line x1="17.5" y1="10" x2="17.5" y2="14"></line>
    <line x1="10" y1="17.5" x2="14" y2="17.5"></line>
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
    <Tabs value={currentMode} onValueChange={handleModeChange} className="w-auto">
      <TabsList className="grid grid-cols-2 h-9 rounded-md p-0 bg-muted/60 border">
        <TabsTrigger 
          value="modelling" 
          className="h-full rounded-l-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm px-4 text-xs"
        >
          <Layers3 size={14} className="mr-1.5" /> Shape & Material
        </TabsTrigger>
        <TabsTrigger 
          value="rendering" 
          className="h-full rounded-r-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm px-4 text-xs"
        >
          <Orbit size={14} className="mr-1.5" /> Visualize & Export
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

interface NodeEditorSectionProps {
  isNodeEditorOpen: boolean;
  setIsNodeEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NodeEditorSection: React.FC<NodeEditorSectionProps> = ({ isNodeEditorOpen, setIsNodeEditorOpen }) => {
  const getNodeEditorTitle = () => "Procedural Editor"; 
  
  const getNodeEditorPlaceholder = () => {
    return "Create complex geometries, custom materials, and advanced rendering effects using a node-based workflow. Define procedural rules, link parameters, and build sophisticated shaders. (Coming Soon)";
  }

  return (
    <div className={cn(
      "flex-none flex flex-col bg-background border-t overflow-hidden transition-all duration-300 ease-in-out shadow-inner",
      isNodeEditorOpen ? "h-[35%] min-h-[200px]" : "h-12"
    )}>
      <div className="p-3 border-b bg-card/80 flex justify-between items-center h-12 cursor-pointer hover:bg-muted/30" onClick={() => setIsNodeEditorOpen(!isNodeEditorOpen)}>
        <h2 className="text-base font-semibold text-foreground flex items-center">
          <NodeEditorIcon />
          {getNodeEditorTitle()}
        </h2>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7" 
          aria-label={isNodeEditorOpen ? "Collapse Node Editor" : "Expand Node Editor"}
        >
          {isNodeEditorOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </Button>
      </div>
      {isNodeEditorOpen && (
        <div className="flex-grow p-6 flex items-center justify-center text-muted-foreground overflow-auto bg-muted/10">
          <span className="italic text-sm text-center max-w-md">{getNodeEditorPlaceholder()}</span>
        </div>
      )}
    </div>
  );
}

const ArchiVisionLayout: React.FC = () => {
  const [isNodeEditorOpen, setIsNodeEditorOpen] = useState(false); 
  const { appMode, setActiveTool, addObject, triggerZoomExtents } = useScene();
  const { toast } = useToast();
  const { currentProject } = useProject();

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

      if (!event.shiftKey && !event.ctrlKey && !event.altKey) {
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
            triggerZoomExtents();
            toast({ title: "View Reset", description: "Zoomed to fit all objects." });
            return;
          case ' ': 
            event.preventDefault(); 
            toolToSet = 'select'; 
            toolLabel = 'Select'; 
            break;
          case 'ESCAPE': 
            setActiveTool('select'); 
            toast({ title: "Tool Reset", description: "Switched to Select tool." });
            return; 
        }
      }
      
      if (event.shiftKey && !event.ctrlKey && !event.altKey) {
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
            case 'R': 
                event.preventDefault();
                toolToSet = 'rectangle';
                toolLabel = 'Rectangle Tool';
                break;
        }
      }

      if (toolToSet) {
        setActiveTool(toolToSet);
        toast({ title: "Tool Changed", description: `${toolLabel || toolToSet.charAt(0).toUpperCase() + toolToSet.slice(1)} tool activated.` });
      }
      if (newObjectToAdd) {
        addObject(newObjectToAdd); 
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setActiveTool, addObject, toast, triggerZoomExtents]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {appMode === 'modelling' && (
        <div className="w-64 flex-none hidden md:flex flex-col bg-card border-r shadow-sm">
          <ToolsSidebar />
        </div>
      )}

      <div className="flex flex-col flex-grow overflow-hidden">
         {/* Top Bar: App Mode Switcher + Project Actions */}
        <div className="flex items-center justify-between border-b bg-card shadow-sm flex-none h-14 px-4">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-primary">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <h1 className="text-xl font-semibold hidden sm:block">ArchiVision</h1>
          </div>
          <AppModeSwitcher />
          <div className="w-auto"> 
            {/* Project Actions Menu/Button can go here */}
             <Button variant="outline" size="sm" onClick={() => { /* Logic to open project dashboard or menu */ console.log("Project actions clicked"); }}>
                <FolderArchive size={16} className="mr-2"/> {currentProject?.name || "Projects"}
             </Button>
          </div>
        </div>
        
        <SidebarProvider defaultOpen side="right">
          <div className="flex flex-row flex-grow overflow-hidden">
            {/* Viewport Area */}
            <div className="flex flex-col flex-grow bg-background relative overflow-hidden">
                {/* Mobile Header with Tools/Inspector Toggles */}
                <div className="p-2 md:hidden border-b flex items-center justify-between sticky top-0 bg-card z-20 shadow-sm h-12">
                    <div className="flex items-center gap-1">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-primary">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                        <h1 className="text-base font-semibold">ArchiVision</h1>
                    </div>
                    <div className="flex items-center gap-0.5">
                        {appMode === 'modelling' && <DialogTriggerForTools />}
                        <SidebarTrigger /> 
                    </div>
                </div>
              
              <div className="flex-grow overflow-hidden relative">
                <SceneViewer />
                <ViewToolbar />
              </div>
            </div>

            {/* Right Inspector Panel */}
            <Sidebar variant="sidebar" collapsible="icon" side="right" className="border-l shadow-lg w-72 md:w-80 lg:w-96 bg-card">
              <SidebarContent className="p-0 m-0"> {/* Remove padding for Tabs */}
                <MainSidebar />
              </SidebarContent>
              {/* Optional: Footer for the right sidebar */}
               {/* 
                <ShadcnSidebarFooter className="p-2 group-data-[collapsible=icon]:hidden border-t">
                  <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ArchiVision</p>
                </ShadcnSidebarFooter>
              */}
            </Sidebar>
          </div>
        </SidebarProvider>
        
        <NodeEditorSection isNodeEditorOpen={isNodeEditorOpen} setIsNodeEditorOpen={setIsNodeEditorOpen} />
      </div>
    </div>
  );
};

const DialogTriggerForTools: React.FC = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="ghost" size="icon" className="md:hidden">
        <Construction size={20} />
        <span className="sr-only">Open Tools</span>
      </Button>
    </DialogTrigger>
    <DialogContent className="p-0 m-0 h-full max-h-[90vh] w-full max-w-[90vw] sm:max-w-sm flex flex-col">
      <DialogHeader className="p-4 border-b flex-none">
        <DialogTitle className="flex items-center gap-2"><Construction size={18}/> Modeling Tools</DialogTitle>
      </DialogHeader>
      <ScrollArea className="flex-grow p-1">
        <Accordion type="multiple" defaultValue={['item-tools']} className="w-full">
          <ToolsPanel />
        </Accordion>
      </ScrollArea>
    </DialogContent>
  </Dialog>
);

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
