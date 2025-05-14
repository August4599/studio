
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
import { BoxSelect, Palette, Globe, Video, Image as ImageIconLucide, Settings2, Construction } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";

const MainSidebar = () => {
  const { appMode, selectedObjectId } = useScene();

  const getDefaultTabValue = () => {
    if (appMode === 'rendering') return 'render';
    if (selectedObjectId) return 'selection';
    return 'scene';
  };

  // More focused default accordions
  const modellingSelectionDefaults = ['item-object-props'];
  const modellingMaterialsDefaults = ['item-materials'];
  const modellingSceneDefaults = ['item-object-hierarchy', 'item-lighting', 'item-world-settings'];
  const modellingProjectDefaults = ['item-scene'];

  const renderingRenderDefaults = ['item-render-settings'];
  const renderingCameraDefaults = ['item-camera-settings'];
  const renderingSceneDefaults = ['item-object-hierarchy', 'item-lighting', 'item-world-settings'];
  const renderingProjectDefaults = ['item-scene'];


  const getPanelsForMode = (tab: string) => {
    switch (tab) {
      case 'selection':
        return selectedObjectId ? (
          <>
            <ObjectPropertiesPanel />
            <MaterialsPanelAccordion /> 
            <ObjectHierarchyPanel /> 
          </>
        ) : <div className="p-4 text-center text-sm text-muted-foreground">Select an object to see its properties.</div>;
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
      case 'project': // Mobile + Desktop general project settings
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
               <TabsTrigger value="project" className="flex-1 flex items-center justify-center gap-1.5 text-xs h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
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
               <TabsTrigger value="project" className="flex-1 flex items-center justify-center gap-1.5 text-xs h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Settings2 size={16}/> Project
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <ScrollArea className="flex-grow p-1">
            <TabsContent value="selection" className="p-0 m-0">
              <Accordion type="multiple" defaultValue={modellingSelectionDefaults} className="w-full">
                 {getPanelsForMode('selection')}
              </Accordion>
            </TabsContent>

            <TabsContent value="materials" className="p-0 m-0">
                <Accordion type="multiple" defaultValue={modellingMaterialsDefaults} className="w-full">
                   {getPanelsForMode('materials')}
                </Accordion>
            </TabsContent>

            <TabsContent value="scene" className="p-0 m-0">
                <Accordion type="multiple" defaultValue={appMode === 'modelling' ? modellingSceneDefaults : renderingSceneDefaults} className="w-full">
                    {getPanelsForMode('scene')}
                </Accordion>
            </TabsContent>
            
            <TabsContent value="project" className="p-0 m-0">
                <Accordion type="multiple" defaultValue={appMode === 'modelling' ? modellingProjectDefaults : renderingProjectDefaults} className="w-full">
                     {getPanelsForMode('project')}
                </Accordion>
            </TabsContent>

            <TabsContent value="render" className="p-0 m-0">
                {appMode === 'rendering' && (
                    <Accordion type="multiple" defaultValue={renderingRenderDefaults} className="w-full">
                        {getPanelsForMode('render')}
                    </Accordion>
                )}
            </TabsContent>
            <TabsContent value="camera" className="p-0 m-0">
                {appMode === 'rendering' && (
                    <Accordion type="multiple" defaultValue={renderingCameraDefaults} className="w-full">
                        {getPanelsForMode('camera')}
                    </Accordion>
                )}
            </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default MainSidebar;

