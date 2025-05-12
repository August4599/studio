
"use client";

import { Accordion } from "@/components/ui/accordion";
import LightingPanel from "./lighting-panel";
import ScenePanel from "./scene-panel";
import ToolsPanel from "./tools-panel";
import ObjectPropertiesPanel from "./object-properties-panel";
import MaterialsPanel from "./materials-panel";
import RenderSettingsPanel from "./render-settings-panel";
import CameraSettingsPanel from "./camera-settings-panel"; // New
import WorldSettingsPanel from "./world-settings-panel";   // New
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
            <ToolsPanel />
            <MaterialsPanel />
            <LightingPanel />
            <ScenePanel />
          </>
        );
      case 'texturing':
        return (
          <>
            {hasSelection && <ObjectPropertiesPanel />}
            <MaterialsPanel />
            <LightingPanel />
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
            <LightingPanel />
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
        items = [...objectPropsOpen, 'item-tools']; // Object props first if selected, then tools
        if (!selectedObjectId) items.push('item-materials'); // If no selection, tools and materials
        else items.push('item-materials'); // If selection, obj props, tools, then materials
        break;
      case 'texturing':
        items = [...objectPropsOpen, 'item-materials']; // Object props first if selected, then materials
        // Lighting is important for texturing preview
        items.push('item-lighting');
        break;
      case 'rendering':
        // Core render setup first
        items = ['item-render-settings', 'item-camera-settings', 'item-world-settings'];
        if (selectedObjectId) items.push('item-object-props'); // Obj props if selected
        items.push('item-lighting', 'item-materials'); // Lighting & Materials for final review
        break;
      default:
        items = [];
    }
    // Add scene panel as a generally useful, less frequently toggled panel
    // items.push('item-scene');
    // Filter out duplicates and ensure only valid strings.
    return [...new Set(items.filter(Boolean))] as string[];
  }

  return (
    <ScrollArea className="h-full p-1">
      {/* Key ensures Accordion re-initializes with new defaultValues when appMode or selection changes */}
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
