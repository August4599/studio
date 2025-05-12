"use client";

import { Accordion } from "@/components/ui/accordion";
import LightingPanel from "./lighting-panel";
import ScenePanel from "./scene-panel";
import ToolsPanel from "./tools-panel";
import ObjectPropertiesPanel from "./object-properties-panel";
import MaterialsPanel from "./materials-panel";
import RenderSettingsPanel from "./render-settings-panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useScene } from "@/context/scene-context";
import type { AppMode } from "@/types";

const MainSidebar = () => {
  const { appMode, selectedObjectId } = useScene();

  const getPanelsForMode = (mode: AppMode) => {
    switch (mode) {
      case 'modelling':
        return (
          <>
            <ToolsPanel />
            {selectedObjectId && <ObjectPropertiesPanel />}
            <MaterialsPanel /> {/* Keep materials accessible for quick assignment */}
            <LightingPanel />
            <ScenePanel />
          </>
        );
      case 'texturing':
        return (
          <>
            <MaterialsPanel />
            {selectedObjectId && <ObjectPropertiesPanel />} 
            <LightingPanel />
            <ScenePanel />
          </>
        );
      case 'rendering':
        return (
          <>
            <RenderSettingsPanel />
            <LightingPanel />
            {selectedObjectId && <ObjectPropertiesPanel />} {/* Allow final tweaks */}
            <MaterialsPanel /> {/* Allow final material checks */}
            <ScenePanel />
          </>
        );
      default:
        return null;
    }
  };

  const getDefaultOpenItems = (mode: AppMode) => {
    let items: string[] = [];
    switch (mode) {
      case 'modelling':
        items = ['item-tools'];
        if (selectedObjectId) items.push('item-object-props');
        else items.push('item-materials'); // Open materials if no object selected
        items.push('item-lighting');
        break;
      case 'texturing':
        items = ['item-materials'];
        if (selectedObjectId) items.push('item-object-props');
        items.push('item-lighting');
        break;
      case 'rendering':
        items = ['item-render-settings', 'item-lighting'];
        if (selectedObjectId) items.push('item-object-props');
        break;
      default:
        items = [];
    }
    return items.filter(Boolean) as string[];
  }

  return (
    <ScrollArea className="h-full p-1">
      {/* Key ensures Accordion re-initializes with new defaultValues when appMode or selection changes */}
      <Accordion type="multiple" defaultValue={getDefaultOpenItems(appMode)} className="w-full" key={`${appMode}-${selectedObjectId || 'no-selection'}`}>
        {getPanelsForMode(appMode)}
      </Accordion>
    </ScrollArea>
  );
};

export default MainSidebar;
