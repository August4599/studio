"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LightingPanel from "./lighting-panel";
import ScenePanel from "./scene-panel";
import ObjectPropertiesPanel from "./object-properties-panel";
import MaterialsPanel from "./materials-panel";
import RenderSettingsPanel from "./render-settings-panel";
import CameraSettingsPanel from "./camera-settings-panel"; 
import WorldSettingsPanel from "./world-settings-panel";
import ObjectHierarchyPanel from "./object-hierarchy-panel"; 
import { ScrollArea } from "@/components/ui/scroll-area";
import { useScene } from "@/context/scene-context";
import type { AppMode } from "@/types";
import { Settings2, BoxSelect, Palette, Globe, Video, Image as ImageIconLucide, Construction, SlidersHorizontal } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";

const MainSidebar = () => {
  const { appMode, selectedObjectId } = useScene();

  const getDefaultTabValue = () => {
    if (appMode === 'rendering') return 'render';
    if (selectedObjectId) return 'selection';
    return 'scene';
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <Tabs defaultValue={getDefaultTabValue()} className="flex flex-col flex-grow overflow-hidden" key={appMode + (selectedObjectId || 'none')}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 h-12 rounded-none border-b p-0 sticky top-0 z-10 bg-card shadow-sm flex-none">
          {appMode === 'modelling' ? (
            <>
              <TabsTrigger value="selection" className="flex-1 flex items-center justify-center gap-1.5 text-xs h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-muted/50 data-[state=active]:text-primary">
                <BoxSelect size={16} /> Selection
              </TabsTrigger>
              <TabsTrigger value="materials" className="flex-1 flex items-center justify-center gap-1.5 text-xs h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-muted/50 data-[state=active]:text-primary">
                <Palette size={16} /> Materials
              </TabsTrigger>
              <TabsTrigger value="scene" className="flex-1 flex items-center justify-center gap-1.5 text-xs h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-muted/50 data-[state=active]:text-primary">
                <Globe size={16} /> Scene
              </TabsTrigger>
               <TabsTrigger value="project" className="flex-1 flex items-center justify-center gap-1.5 text-xs h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-muted/50 data-[state=active]:text-primary md:hidden">
                <Construction size={16}/> Project
              </TabsTrigger>
            </>
          ) : ( // Visualize & Export Mode
            <>
              <TabsTrigger value="render" className="flex-1 flex items-center justify-center gap-1.5 text-xs h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-muted/50 data-[state=active]:text-primary">
                <ImageIconLucide size={16} /> Render
              </TabsTrigger>
              <TabsTrigger value="camera" className="flex-1 flex items-center justify-center gap-1.5 text-xs h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-muted/50 data-[state=active]:text-primary">
                <Video size={16} /> Camera
              </TabsTrigger>
               <TabsTrigger value="scene" className="flex-1 flex items-center justify-center gap-1.5 text-xs h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-muted/50 data-[state=active]:text-primary">
                <Globe size={16} /> Scene
              </TabsTrigger>
               <TabsTrigger value="project" className="flex-1 flex items-center justify-center gap-1.5 text-xs h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-muted/50 data-[state=active]:text-primary md:hidden">
                <Construction size={16}/> Project
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <ScrollArea className="flex-grow p-1"> {/* Added padding to scroll area */}
            <TabsContent value="selection" className="p-0 m-0">
              <Accordion type="multiple" defaultValue={['item-object-props']} className="w-full">
                {selectedObjectId ? <ObjectPropertiesPanel /> : <div className="p-4 text-center text-sm text-muted-foreground">Select an object to see its properties.</div>}
              </Accordion>
            </TabsContent>

            <TabsContent value="materials" className="p-0 m-0">
                <Accordion type="multiple" defaultValue={['item-materials']} className="w-full">
                    <MaterialsPanel />
                </Accordion>
            </TabsContent>

            <TabsContent value="scene" className="p-0 m-0">
                <Accordion type="multiple" defaultValue={['item-object-hierarchy', 'item-lighting', 'item-world-settings']} className="w-full">
                    <ObjectHierarchyPanel />
                    <LightingPanel />
                    <WorldSettingsPanel />
                </Accordion>
            </TabsContent>
            
            <TabsContent value="project" className="p-0 m-0 md:hidden"> {/* Project Tab content for mobile */}
                <Accordion type="multiple" defaultValue={['item-scene']} className="w-full">
                    <ScenePanel />
                </Accordion>
            </TabsContent>

            <TabsContent value="render" className="p-0 m-0">
                {appMode === 'rendering' && (
                    <Accordion type="multiple" defaultValue={['item-render-settings']} className="w-full">
                        <RenderSettingsPanel />
                    </Accordion>
                )}
            </TabsContent>
            <TabsContent value="camera" className="p-0 m-0">
                {appMode === 'rendering' && (
                    <Accordion type="multiple" defaultValue={['item-camera-settings']} className="w-full">
                        <CameraSettingsPanel />
                    </Accordion>
                )}
            </TabsContent>
        </ScrollArea>
      </Tabs>
       {/* Project Panel for desktop, outside tabs, always visible */}
       <div className="hidden md:block p-1 border-t">
          <Accordion type="single" collapsible defaultValue={'item-scene'} className="w-full">
            <ScenePanel />
          </Accordion>
        </div>
    </div>
  );
};

export default MainSidebar;
