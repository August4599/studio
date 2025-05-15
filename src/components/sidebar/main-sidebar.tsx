
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
import { BoxSelect, Palette, Globe, Video, Image as ImageIconLucide, Settings2, Layers3, Aperture } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";

const MainSidebar = () => {
  const { appMode, selectedObjectId } = useScene();

  const getDefaultTabValue = () => {
    if (appMode === 'rendering') return 'render-output';
    return 'selection'; // Default to selection in modelling mode
  };

  // Default open accordions for Shape & Material mode
  const modellingSelectionDefaults = selectedObjectId ? ['item-object-props', 'item-materials'] : ['item-object-hierarchy'];
  const modellingSceneDefaults = ['item-object-hierarchy', 'item-scene']; // World settings collapsed

  // Default open accordions for Visualize & Export mode
  const renderingRenderOutputDefaults = ['item-render-settings', 'item-camera-settings'];
  const renderingSceneSetupDefaults = ['item-object-hierarchy', 'item-lighting', 'item-world-settings', 'item-scene'];


  const getPanelsForMode = (tab: string) => {
    if (appMode === 'modelling') {
      switch (tab) {
        case 'selection':
          return selectedObjectId ? (
            <>
              <ObjectPropertiesPanel />
              <MaterialsPanelAccordion /> 
              <ObjectHierarchyPanel /> 
            </>
          ) : (
            <>
              <MaterialsPanelAccordion />
              <ObjectHierarchyPanel />
            </>
          );
        case 'scene':
          return (
            <>
              <ObjectHierarchyPanel /> 
              <WorldSettingsPanel />
              <ScenePanel />
            </>
          );
        default:
          return null;
      }
    } else { // rendering mode
      switch (tab) {
        case 'render-output':
          return (
            <>
              <RenderSettingsPanel />
              <CameraSettingsPanel />
            </>
          );
        case 'scene-setup':
          return (
            <>
              <ObjectHierarchyPanel />
              <LightingPanel />
              <WorldSettingsPanel />
              <ScenePanel />
            </>
          );
        default:
          return null;
      }
    }
  };


  return (
    <div className="flex flex-col h-full bg-card">
      <Tabs defaultValue={getDefaultTabValue()} className="flex flex-col flex-grow overflow-hidden" key={appMode + (selectedObjectId || 'none') + '-tabs'}>
        <TabsList className="grid w-full grid-cols-2 h-12 rounded-none border-b p-0 sticky top-0 z-10 bg-card shadow-sm flex-none">
          {appMode === 'modelling' ? (
            <>
              <TabsTrigger value="selection" className="flex-1 flex items-center justify-center gap-1.5 text-xs h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <BoxSelect size={16} /> Selection & Materials
              </TabsTrigger>
              <TabsTrigger value="scene" className="flex-1 flex items-center justify-center gap-1.5 text-xs h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Layers3 size={16} /> Scene Setup
              </TabsTrigger>
            </>
          ) : ( // Visualize & Export Mode
            <>
              <TabsTrigger value="render-output" className="flex-1 flex items-center justify-center gap-1.5 text-xs h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Aperture size={16} /> Render & Camera
              </TabsTrigger>
               <TabsTrigger value="scene-setup" className="flex-1 flex items-center justify-center gap-1.5 text-xs h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Globe size={16} /> Scene Setup
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <ScrollArea className="flex-grow p-1">
            {appMode === 'modelling' && (
              <>
                <TabsContent value="selection" className="p-0 m-0">
                  <Accordion type="multiple" defaultValue={modellingSelectionDefaults} className="w-full">
                    {getPanelsForMode('selection')}
                  </Accordion>
                </TabsContent>
                <TabsContent value="scene" className="p-0 m-0">
                    <Accordion type="multiple" defaultValue={modellingSceneDefaults} className="w-full">
                        {getPanelsForMode('scene')}
                    </Accordion>
                </TabsContent>
              </>
            )}
            {appMode === 'rendering' && (
              <>
                <TabsContent value="render-output" className="p-0 m-0">
                    <Accordion type="multiple" defaultValue={renderingRenderOutputDefaults} className="w-full">
                        {getPanelsForMode('render-output')}
                    </Accordion>
                </TabsContent>
                <TabsContent value="scene-setup" className="p-0 m-0">
                    <Accordion type="multiple" defaultValue={renderingSceneSetupDefaults} className="w-full">
                        {getPanelsForMode('scene-setup')}
                    </Accordion>
                </TabsContent>
              </>
            )}
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default MainSidebar;
