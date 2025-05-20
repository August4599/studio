
"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useScene } from "@/context/scene-context";
import { Palette, Video, Aperture, Lightbulb, Puzzle, Film, Wand2, SunMoon, SlidersHorizontal, Sigma, Edit, LayoutList } from "lucide-react";

// Import all necessary panel components
import ToolPropertiesPanel from "./ToolPropertiesPanel";
import ObjectPropertiesPanel from "./object-properties-panel";
import MaterialsPanelAccordion from "./materials-panel";
import ObjectHierarchyPanel from "./object-hierarchy-panel";
import LayersPanel from "./LayersPanel"; 
import ScenesPanel from "./ScenesPanel";   
import StylesPanel from "./StylesPanel";   
import ShadowsPanel from "./ShadowsPanel"; 
import LightingPanel from "./lighting-panel";
// WorldSettingsPanel was conceptually replaced by EnvironmentPanel for rendering,
// but some aspects might be in StylesPanel or a simplified World for modelling.
// Let's assume EnvironmentPanel handles the bulk of "World" settings for rendering.
import EnvironmentPanel from './EnvironmentPanel'; 
import CameraSettingsPanel from "./camera-settings-panel";
import RenderSettingsPanel from "./render-settings-panel";
import AssetLibraryPanel from "./AssetLibraryPanel"; 
import AnimationTimelinePanel from "./AnimationTimelinePanel"; 
import PostProcessingEffectsPanel from "./PostProcessingEffectsPanel"; 

const RightInspectorPanel: React.FC = () => {
  const { appMode } = useScene();

  const modellingDefaultTab = "selection"; 
  const renderingDefaultTab = "render-settings";
  const defaultTab = appMode === 'modelling' ? modellingDefaultTab : renderingDefaultTab;

  return (
    <div className="w-80 md:w-96 flex flex-col h-full bg-card text-card-foreground border-l shadow-lg flex-none overflow-hidden">
      {appMode === 'modelling' && (
        <div className="p-1 border-b flex-none">
          <ToolPropertiesPanel />
        </div>
      )}
      
      <Tabs defaultValue={defaultTab} className="flex flex-col flex-grow overflow-hidden" key={appMode}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 h-auto rounded-none border-b p-0 sticky top-0 z-10 bg-card shadow-sm flex-none min-h-10">
          {appMode === 'modelling' ? (
            <>
              <TabsTrigger value="selection" className="text-xs px-2 py-2.5"><Edit size={14}/> Modify</TabsTrigger>
              <TabsTrigger value="structure" className="text-xs px-2 py-2.5"><LayoutList size={14}/> Structure</TabsTrigger>
              <TabsTrigger value="materials" className="text-xs px-2 py-2.5"><Palette size={14}/> Materials</TabsTrigger>
              <TabsTrigger value="display" className="text-xs px-2 py-2.5"><SlidersHorizontal size={14}/> Display</TabsTrigger>
            </>
          ) : ( 
            <>
              <TabsTrigger value="render-settings" className="text-xs px-2 py-2.5"><Aperture size={14}/> Render</TabsTrigger>
              <TabsTrigger value="environment" className="text-xs px-2 py-2.5"><SunMoon size={14}/> Environment</TabsTrigger>
              <TabsTrigger value="lighting" className="text-xs px-2 py-2.5"><Lightbulb size={14}/> Lights</TabsTrigger>
              <TabsTrigger value="cameras" className="text-xs px-2 py-2.5"><Video size={14}/> Cameras</TabsTrigger>
              <TabsTrigger value="shading" className="text-xs px-2 py-2.5"><Palette size={14}/> Shading</TabsTrigger>
              <TabsTrigger value="effects" className="text-xs px-2 py-2.5"><Wand2 size={14}/> Post Effects</TabsTrigger>
              <TabsTrigger value="assets" className="text-xs px-2 py-2.5"><Puzzle size={14}/> Assets</TabsTrigger>
              <TabsTrigger value="animation" className="text-xs px-2 py-2.5"><Film size={14}/> Animation</TabsTrigger>
            </>
          )}
        </TabsList>
        
        <ScrollArea className="flex-grow p-1">
          {appMode === 'modelling' ? (
            <>
              <TabsContent value="selection" className="p-0 m-0">
                <Accordion type="multiple" defaultValue={['item-object-props']} className="w-full">
                  <ObjectPropertiesPanel />
                  <AccordionItem value="item-modifiers-wip">
                    <AccordionTrigger className="hover:no-underline text-xs px-2 py-2"><Sigma size={14}/> Modifiers (WIP)</AccordionTrigger>
                    <AccordionContent className="p-2 text-xs text-muted-foreground italic">Apply and manage object modifiers (e.g., Bevel, Subdivision, Array).</AccordionContent>
                  </AccordionItem>
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
          ) : ( 
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
