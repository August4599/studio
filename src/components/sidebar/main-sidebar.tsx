
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LightingPanel from "./lighting-panel";
import ScenePanel from "./scene-panel";
import ObjectPropertiesPanel from "./object-properties-panel";
import MaterialsPanelAccordion from "./materials-panel";
import RenderSettingsPanel from "./render-settings-panel";
import CameraSettingsPanel from "./camera-settings-panel";
import WorldSettingsPanel from "./world-settings-panel";
import ObjectHierarchyPanel from "./object-hierarchy-panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useScene } from "@/context/scene-context";
import { BoxSelect, Palette, Globe, Video, Image as ImageIconLucide, Construction, Settings2 } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";

const MainSidebar = () => {
  const { appMode, selectedObjectId } = useScene();

  const getDefaultTabValue = () => {
    if (appMode === 'rendering') return 'render';
    if (selectedObjectId) return 'selection';
    return 'scene';
  };

  const modellingDefaultAccordions = ['item-object-props', 'item-materials', 'item-object-hierarchy', 'item-lighting', 'item-world-settings'];
  const renderingDefaultAccordions = ['item-render-settings', 'item-camera-settings', 'item-object-hierarchy', 'item-lighting', 'item-world-settings'];


  const getPanelsForMode = (mode: 'modelling' | 'rendering', tab: string) => {
    switch (tab) {
      case 'selection':
        return selectedObjectId ? <ObjectPropertiesPanel /> : <div className="p-4 text-center text-sm text-muted-foreground">Select an object to see its properties.</div>;
      case 'materials':
        return <MaterialsPanelAccordion />;
      case 'scene':
        return (
          <>
            <ObjectHierarchyPanel />
            <LightingPanel />
            <WorldSettingsPanel />
          </>
        );
      case 'render':
        return <RenderSettingsPanel />;
      case 'camera':
        return <CameraSettingsPanel />;
      case 'project': // Mobile only
        return <ScenePanel />;
      default:
        return null;
    }
  };


  return (
    <div className="flex flex-col h-full bg-card">
      <Tabs defaultValue={getDefaultTabValue()} className="flex flex-col flex-grow overflow-hidden" key={appMode + (selectedObjectId || 'none') + '-tabs'}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 h-12 rounded-none border-b p-0 sticky top-0 z-10 bg-card shadow-sm flex-none">
          {appMode === 'modelling' ? (
            <>
              <TabsTrigger value="selection" className="flex-1 flex items-center justify-center gap-1.5 text-xs h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <BoxSelect size={16} /> Selection
              </TabsTrigger>
              <TabsTrigger value="materials" className="flex-1 flex items-center justify-center gap-1.5 text-xs h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Palette size={16} /> Materials
              </TabsTrigger>
              <TabsTrigger value="scene" className="flex-1 flex items-center justify-center gap-1.5 text-xs h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Globe size={16} /> Scene
              </TabsTrigger>
               <TabsTrigger value="project" className="flex-1 flex items-center justify-center gap-1.5 text-xs h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary md:hidden">
                <Settings2 size={16}/> Project
              </TabsTrigger>
            </>
          ) : ( // Visualize & Export Mode
            <>
              <TabsTrigger value="render" className="flex-1 flex items-center justify-center gap-1.5 text-xs h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <ImageIconLucide size={16} /> Render
              </TabsTrigger>
              <TabsTrigger value="camera" className="flex-1 flex items-center justify-center gap-1.5 text-xs h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Video size={16} /> Camera
              </TabsTrigger>
               <TabsTrigger value="scene" className="flex-1 flex items-center justify-center gap-1.5 text-xs h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Globe size={16} /> Scene
              </TabsTrigger>
               <TabsTrigger value="project" className="flex-1 flex items-center justify-center gap-1.5 text-xs h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary md:hidden">
                <Settings2 size={16}/> Project
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <ScrollArea className="flex-grow p-1">
            <TabsContent value="selection" className="p-0 m-0">
              <Accordion type="multiple" defaultValue={modellingDefaultAccordions} className="w-full">
                 {getPanelsForMode(appMode, 'selection')}
              </Accordion>
            </TabsContent>

            <TabsContent value="materials" className="p-0 m-0">
                <Accordion type="multiple" defaultValue={modellingDefaultAccordions} className="w-full">
                   {getPanelsForMode(appMode, 'materials')}
                </Accordion>
            </TabsContent>

            <TabsContent value="scene" className="p-0 m-0">
                <Accordion type="multiple" defaultValue={appMode === 'modelling' ? modellingDefaultAccordions : renderingDefaultAccordions} className="w-full">
                    {getPanelsForMode(appMode, 'scene')}
                </Accordion>
            </TabsContent>
            
            <TabsContent value="project" className="p-0 m-0 md:hidden">
                <Accordion type="multiple" defaultValue={['item-scene']} className="w-full">
                     {getPanelsForMode(appMode, 'project')}
                </Accordion>
            </TabsContent>

            <TabsContent value="render" className="p-0 m-0">
                {appMode === 'rendering' && (
                    <Accordion type="multiple" defaultValue={renderingDefaultAccordions} className="w-full">
                        {getPanelsForMode(appMode, 'render')}
                    </Accordion>
                )}
            </TabsContent>
            <TabsContent value="camera" className="p-0 m-0">
                {appMode === 'rendering' && (
                    <Accordion type="multiple" defaultValue={renderingDefaultAccordions} className="w-full">
                        {getPanelsForMode(appMode, 'camera')}
                    </Accordion>
                )}
            </TabsContent>
        </ScrollArea>
      </Tabs>
       <div className="hidden md:block p-1 border-t">
          <Accordion type="single" collapsible defaultValue={'item-scene'} className="w-full">
            <ScenePanel />
          </Accordion>
        </div>
    </div>
  );
};

export default MainSidebar;
