
"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useScene } from "@/context/scene-context";
import { BoxSelect, Palette, Globe, Video, Image as ImageIconLucide, Settings2, Layers3 as LayersIcon, Aperture, Shapes, Lightbulb, Trees, Puzzle, Film, Wand2, Clapperboard, SunMoon, SlidersHorizontal, Sigma, Edit, Sun, Droplet, Wind, Cloud, LayoutList } from "lucide-react";

// Import all necessary panel components
// ToolPropertiesPanel is now part of ToolsSidebar
import ObjectPropertiesPanel from "./object-properties-panel";
import MaterialsPanelAccordion from "./materials-panel";
import ObjectHierarchyPanel from "./object-hierarchy-panel";
import LayersPanel from "./LayersPanel"; 
import ScenesPanel from "./ScenesPanel";   
import StylesPanel from "./StylesPanel";   
import ShadowsPanel from "./ShadowsPanel"; 
import LightingPanel from "./lighting-panel";
import EnvironmentPanel from './EnvironmentPanel'; 
import CameraSettingsPanel from "./camera-settings-panel";
import RenderSettingsPanel from "./render-settings-panel";
import AssetLibraryPanel from "./AssetLibraryPanel"; 
import AnimationTimelinePanel from "./AnimationTimelinePanel"; 
import PostProcessingEffectsPanel from "./PostProcessingEffectsPanel"; 

const RightInspectorPanel: React.FC = () => {
  const { appMode, selectedObjectId } = useScene();

  const modellingDefaultTab = selectedObjectId ? "selection" : "structure";
  const renderingDefaultTab = "render-settings"; // Default to render settings in visualize mode
  const defaultTab = appMode === 'modelling' ? modellingDefaultTab : renderingDefaultTab;

  return (
    <div className="w-80 md:w-96 flex flex-col h-full bg-card text-card-foreground border-l shadow-lg flex-none">
      {/* ToolPropertiesPanel is removed from here, now part of ToolsSidebar */}
      
      <Tabs defaultValue={defaultTab} className="flex flex-col flex-grow overflow-hidden" key={appMode}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 h-auto rounded-none border-b p-0 sticky top-0 z-10 bg-card shadow-sm flex-none min-h-12">
          {appMode === 'modelling' ? (
            <>
              <TabsTrigger value="selection" className="text-xs px-2 py-3"><Edit size={14}/> Modify</TabsTrigger>
              <TabsTrigger value="structure" className="text-xs px-2 py-3"><LayoutList size={14}/> Structure</TabsTrigger>
              <TabsTrigger value="materials" className="text-xs px-2 py-3"><Palette size={14}/> Materials</TabsTrigger>
              <TabsTrigger value="display" className="text-xs px-2 py-3"><SlidersHorizontal size={14}/> Display</TabsTrigger>
            </>
          ) : ( // Rendering Mode
            <>
              <TabsTrigger value="render-settings" className="text-xs px-2 py-3"><Aperture size={14}/> Render</TabsTrigger>
              <TabsTrigger value="environment" className="text-xs px-2 py-3"><SunMoon size={14}/> Environment</TabsTrigger>
              <TabsTrigger value="lighting" className="text-xs px-2 py-3"><Lightbulb size={14}/> Lights</TabsTrigger>
              <TabsTrigger value="cameras" className="text-xs px-2 py-3"><Video size={14}/> Cameras</TabsTrigger>
              <TabsTrigger value="shading" className="text-xs px-2 py-3"><Palette size={14}/> Shading</TabsTrigger>
              <TabsTrigger value="effects" className="text-xs px-2 py-3"><Wand2 size={14}/> Post Effects</TabsTrigger>
              <TabsTrigger value="assets" className="text-xs px-2 py-3"><Puzzle size={14}/> Assets</TabsTrigger>
              <TabsTrigger value="animation" className="text-xs px-2 py-3"><Film size={14}/> Animation</TabsTrigger>
            </>
          )}
        </TabsList>
        
        <ScrollArea className="flex-grow p-1">
          {appMode === 'modelling' ? (
            <>
              <TabsContent value="selection" className="p-0 m-0">
                <Accordion type="multiple" defaultValue={['item-object-props']} className="w-full">
                  <ObjectPropertiesPanel />
                  {/* Modifier Stack Placeholder is inside ObjectPropertiesPanel */}
                </Accordion>
              </TabsContent>
              <TabsContent value="structure" className="p-0 m-0">
                 <Accordion type="multiple" defaultValue={['item-object-hierarchy', 'item-layers']} className="w-full">
                    <ObjectHierarchyPanel />
                    <LayersPanel /> 
                </Accordion>
              </TabsContent>
              <TabsContent value="materials" className="p-0 m-0">
                <Accordion type="multiple" defaultValue={['item-materials']} className="w-full">
                  <MaterialsPanelAccordion />
                </Accordion>
              </TabsContent>
              <TabsContent value="display" className="p-0 m-0">
                <Accordion type="multiple" defaultValue={['item-styles', 'item-shadows']} className="w-full">
                  <StylesPanel />
                  <ShadowsPanel />
                </Accordion>
              </TabsContent>
            </>
          ) : ( // Rendering Mode
            <>
              <TabsContent value="render-settings" className="p-0 m-0">
                <Accordion type="multiple" defaultValue={['item-render-settings']} className="w-full">
                  <RenderSettingsPanel />
                </Accordion>
              </TabsContent>
              <TabsContent value="environment" className="p-0 m-0">
                <Accordion type="multiple" defaultValue={['item-environment']} className="w-full">
                   <EnvironmentPanel />
                </Accordion>
              </TabsContent>
              <TabsContent value="lighting" className="p-0 m-0">
                <Accordion type="multiple" defaultValue={['item-lighting']} className="w-full">
                  <LightingPanel />
                </Accordion>
              </TabsContent>
              <TabsContent value="cameras" className="p-0 m-0">
                 <Accordion type="multiple" defaultValue={['item-camera-settings', 'item-scenes']} className="w-full">
                    <CameraSettingsPanel />
                    <ScenesPanel />
                </Accordion>
              </TabsContent>
              <TabsContent value="shading" className="p-0 m-0"> 
                 <Accordion type="multiple" defaultValue={['item-materials']} className="w-full">
                    <MaterialsPanelAccordion /> 
                </Accordion>
              </TabsContent>
              <TabsContent value="effects" className="p-0 m-0">
                <Accordion type="multiple" defaultValue={['item-post-processing']} className="w-full">
                    <PostProcessingEffectsPanel />
                </Accordion>
              </TabsContent>
              <TabsContent value="assets" className="p-0 m-0">
                <Accordion type="multiple" defaultValue={['item-asset-library']} className="w-full">
                  <AssetLibraryPanel />
                </Accordion>
              </TabsContent>
              <TabsContent value="animation" className="p-0 m-0">
                <Accordion type="multiple" defaultValue={['item-animation-timeline']} className="w-full">
                    <AnimationTimelinePanel />
                </Accordion>
              </TabsContent>
            </>
          )}
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default RightInspectorPanel;
