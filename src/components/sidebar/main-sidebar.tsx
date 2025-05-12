"use client";

import { Accordion } from "@/components/ui/accordion";
import LightingPanel from "./lighting-panel";
import ScenePanel from "./scene-panel";
// import ToolsPanel from "./tools-panel"; // REMOVED
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
      case 'modelling':
        return (
          <>
            {hasSelection && <ObjectPropertiesPanel />}
            {/* ToolsPanel removed from here */}
            <MaterialsPanel />
            <LightingPanel /> {/* Stays for modelling */}
            <CameraSettingsPanel /> 
            <WorldSettingsPanel /> 
            <ScenePanel />
          </>
        );
      case 'texturing':
        return (
          <>
            {hasSelection && <ObjectPropertiesPanel />}
            <MaterialsPanel />
            {/* LightingPanel REMOVED from texturing */}
            <CameraSettingsPanel />
            <WorldSettingsPanel />
            <ScenePanel />
          </>
        );
      case 'rendering':
        return (
          <>
            <RenderSettingsPanel />
            <CameraSettingsPanel />
            <WorldSettingsPanel />
            {hasSelection && <ObjectPropertiesPanel />}
            <MaterialsPanel />
            {/* LightingPanel REMOVED from rendering */}
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
        items = [...objectPropsOpen, 'item-materials', 'item-lighting']; 
        if (!selectedObjectId) items.push('item-scene'); // If no selection, Scene, Materials, Lighting, etc.
        items.push('item-camera-settings', 'item-world-settings');
        break;
      case 'texturing':
        items = [...objectPropsOpen, 'item-materials', 'item-camera-settings', 'item-world-settings'];
        if (!selectedObjectId) items.push('item-scene');
        break;
      case 'rendering':
        items = ['item-render-settings', 'item-camera-settings', 'item-world-settings'];
        if (selectedObjectId) items.push('item-object-props');
        items.push('item-materials'); 
        if (!selectedObjectId) items.push('item-scene');
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
        key={`${appMode}-${selectedObjectId || 'no-selection'}`}
      >
        {getPanelsForMode(appMode)}
      </Accordion>
    </ScrollArea>
  );
};

export default MainSidebar;