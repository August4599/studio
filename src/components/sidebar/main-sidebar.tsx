"use client";

import { Accordion } from "@/components/ui/accordion";
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

const MainSidebar = () => {
  const { appMode, selectedObjectId } = useScene();

  const getPanelsForMode = (mode: AppMode) => {
    const hasSelection = !!selectedObjectId;

    switch (mode) {
      case 'modelling': // Shape & Material
        return (
          <>
            <ObjectHierarchyPanel />
            {hasSelection && <ObjectPropertiesPanel />}
            <MaterialsPanel />
            <LightingPanel /> 
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
            {/* Lighting is crucial for rendering, so it remains. World settings too. */}
            <LightingPanel /> 
            <WorldSettingsPanel />
            <ObjectHierarchyPanel /> {/* Hierarchy useful in both modes */}
            {hasSelection && <ObjectPropertiesPanel />} {/* Props still useful */}
            <MaterialsPanel />  {/* Material review/tweaking might happen */}
            <ScenePanel /> {/* Scene actions like save/export might be relevant */}
          </>
        );
      default:
        return null;
    }
  };

  const getDefaultOpenItems = (mode: AppMode) => {
    let items: string[] = ['item-object-hierarchy']; 
    const objectPropsOpen = selectedObjectId ? ['item-object-props'] : [];

    switch (mode) {
      case 'modelling':
        items = [...items, ...objectPropsOpen, 'item-materials', 'item-lighting', 'item-world-settings', 'item-scene'];
        if (!selectedObjectId && !items.includes('item-scene')) items.push('item-scene'); 
        break;
      case 'rendering':
        items = [...items, 'item-render-settings', 'item-camera-settings', 'item-lighting', 'item-world-settings'];
        if (selectedObjectId) items.push(...objectPropsOpen);
        if (!items.includes('item-materials')) items.push('item-materials');
        if (!items.includes('item-scene')) items.push('item-scene'); 
        break;
    }
    return [...new Set(items.filter(Boolean))] as string[];
  }

  return (
    <ScrollArea className="h-full p-1">
      <Accordion 
        type="multiple" 
        defaultValue={getDefaultOpenItems(appMode)} 
        className="w-full" 
        key={`${appMode}-${selectedObjectId || 'no-selection'}`} 
      >
        {getPanelsForMode(appMode)}
      </Accordion>
    </ScrollArea>
  );
};

export default MainSidebar;