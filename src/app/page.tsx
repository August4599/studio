
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
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Workflow, ChevronDown, ChevronUp, Layers3, Orbit, Settings2, Construction, Loader2, Image as ImageIconLucide } from "lucide-react"; 
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
    <Tabs value={currentMode} onValueChange={handleModeChange} className="w-full bg-card border-b shadow-sm flex-none">
      <TabsList className="grid w-full grid-cols-2 h-12 rounded-none border-b-0 p-0">
        <TabsTrigger 
          value="modelling" 
          className="h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-muted/50 data-[state=active]:text-primary flex items-center gap-2 text-sm font-medium"
        >
          <Layers3 size={16} /> Shape & Material
        </TabsTrigger>
        <TabsTrigger 
          value="rendering" 
          className="h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-muted/50 data-[state=active]:text-primary flex items-center gap-2 text-sm font-medium"
        >
          <Orbit size={16} /> Visualize & Export
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
  const getNodeEditorTitle = () => "Advanced Operations";
  
  const getNodeEditorPlaceholder = () => {
    return "Unlock advanced architectural workflows with node-based procedural modeling, custom material shaders, and rendering composites. Coming soon to ArchiVision!";
  }

  return (
    <div className={cn(
      "flex-none flex flex-col bg-background border-t overflow-hidden transition-all duration-300 ease-in-out shadow-inner",
      isNodeEditorOpen ? "h-[35%] min-h-[200px]" : "h-12"
    )}>
      <div className="p-3 border-b bg-card/80 dark:bg-card/60 flex justify-between items-center h-12 cursor-pointer hover:bg-muted/30" onClick={() => setIsNodeEditorOpen(!isNodeEditorOpen)}>
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
  const { appMode, setActiveTool, addObject } = useScene();
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return; // Don't trigger shortcuts if an input field is active
      }

      const key = event.key.toUpperCase();
      let toolToSet: ToolType | undefined = undefined;
      let newObjectToAdd: PrimitiveType | undefined = undefined;
      let toolLabel: string | undefined = undefined;

      // Tool shortcuts (no modifiers)
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
          case ' ': // Space key
            event.preventDefault(); // Prevent default space behavior (like scrolling)
            toolToSet = 'select'; 
            toolLabel = 'Select'; 
            break;
          case 'ESCAPE': // Escape key to revert to select tool or clear drawing state
            setActiveTool('select'); // Default to select tool
            toast({ title: "Tool Reset", description: "Switched to Select tool." });
            return; 
        }
      }
      
      // Add object shortcuts (Shift + Key)
      if (event.shiftKey && !event.ctrlKey && !event.altKey) {
        switch (key) {
            case 'A': // Shift + A (Common for Add Menu)
                event.preventDefault(); 
                newObjectToAdd = 'cube'; // Default to cube, or open an "add menu" in future
                break;
            case 'C': // Shift + C for Circle tool
                event.preventDefault();
                toolToSet = 'circle';
                toolLabel = 'Circle Tool';
                break;
            // case 'R': // Shift + R for Rectangle tool - 'R' is already scale tool
            //     event.preventDefault();
            //     toolToSet = 'rectangle';
            //     toolLabel = 'Rectangle Tool';
            //     break;
        }
      }

      if (toolToSet) {
        setActiveTool(toolToSet);
        toast({ title: "Tool Changed", description: `${toolLabel || toolToSet.charAt(0).toUpperCase() + toolToSet.slice(1)} tool activated.` });
      }
      if (newObjectToAdd) {
        addObject(newObjectToAdd); // Toast for added object is handled in addObject
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setActiveTool, addObject, toast]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {appMode === 'modelling' && (
        <div className="w-64 flex-none hidden md:flex flex-col bg-card border-r shadow-sm">
          <ToolsSidebar />
        </div>
      )}

      <div className="flex flex-col flex-grow overflow-hidden">
        <AppModeSwitcher /> 

        <SidebarProvider defaultOpen side="right">
          <div className="flex flex-row flex-grow overflow-hidden">
            <div className="flex flex-col flex-grow bg-background relative overflow-hidden">
              
              <div className="p-2 md:hidden border-b flex items-center justify-between sticky top-0 bg-card z-20 shadow-sm h-12">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-primary">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                  </svg>
                  <h1 className="text-lg font-semibold">ArchiVision</h1>
                </div>
                {appMode === 'modelling' && ( 
                    <DialogTriggerForTools />
                )}
                <SidebarTrigger /> 
              </div>
              
              <div className="flex-grow overflow-hidden relative">
                <SceneViewer />
                <ViewToolbar />
              </div>
            </div>

            <Sidebar variant="sidebar" collapsible="icon" side="right" className="border-l shadow-lg w-72 md:w-80 bg-card">
              <SidebarHeader className="p-3 flex justify-between items-center h-12">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-6 h-6 text-primary" />
                  <h1 className="text-xl font-semibold group-data-[collapsible=icon]:hidden">Properties</h1>
                </div>
                <SidebarTrigger /> 
              </SidebarHeader>
              <SidebarContent>
                <MainSidebar />
              </SidebarContent>
              <SidebarFooter className="p-2 group-data-[collapsible=icon]:hidden border-t">
                <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ArchiVision</p>
              </SidebarFooter>
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

