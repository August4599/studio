
"use client";

import { Accordion } from "@/components/ui/accordion";
import LightingPanel from "./lighting-panel";
import ScenePanel from "./scene-panel";
import ObjectPropertiesPanel from "./object-properties-panel";
import MaterialsPanel from "./materials-panel";
import RenderSettingsPanel from "./render-settings-panel";
import CameraSettingsPanel from "./camera-settings-panel"; 
import WorldSettingsPanel from "./world-settings-panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useScene } from "@/context/scene-context";
import type { AppMode } from "@/types";

const MainSidebar = () => {
  const { appMode, selectedObjectId } = useScene();

  const getPanelsForMode = (mode: AppMode) => {
    const hasSelection = !!selectedObjectId;

    switch (mode) {
      case 'modelling': // Shape & Surface
        return (
          <>
            {hasSelection && <ObjectPropertiesPanel />}
            <MaterialsPanel />
            {/* LightingPanel removed from modelling, more relevant to rendering */}
            {/* CameraSettingsPanel removed from modelling */}
            <WorldSettingsPanel /> 
            <ScenePanel />
            {!hasSelection && <div className="p-4 text-center text-sm text-muted-foreground">Select an object to see its properties.</div>}
          </>
        );
      case 'rendering': // Visualize & Export
        return (
          <>
            <RenderSettingsPanel />
            <CameraSettingsPanel />
            <LightingPanel />
            <WorldSettingsPanel />
            {hasSelection && <ObjectPropertiesPanel />}
            <MaterialsPanel /> 
            <ScenePanel />
          </>
        );
      default:
        return null;
    }
  };

  const getDefaultOpenItems = (mode: AppMode) => {
    let items: string[] = [];
    const objectPropsOpen = selectedObjectId ? ['item-object-props'] : [];

    switch (mode) {
      case 'modelling':
        items = [...objectPropsOpen, 'item-materials', 'item-world-settings'];
        if (!selectedObjectId) items.push('item-scene'); // Open scene if no selection
        break;
      case 'rendering':
        items = ['item-render-settings', 'item-camera-settings', 'item-lighting', 'item-world-settings'];
        if (selectedObjectId) items.push('item-object-props');
        items.push('item-materials', 'item-scene'); 
        break;
      default:
        items = [];
    }
    return [...new Set(items.filter(Boolean))] as string[];
  }

  return (
    <ScrollArea className="h-full p-1">
      <Accordion 
        type="multiple" 
        defaultValue={getDefaultOpenItems(appMode)} 
        className="w-full" 
        key={`${appMode}-${selectedObjectId || 'no-selection'}`} // Key helps re-render accordion defaults
      >
        {getPanelsForMode(appMode)}
      </Accordion>
    </ScrollArea>
  );
};

export default MainSidebar;
