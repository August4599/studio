
"use client";

import { Accordion } from "@/components/ui/accordion";
import LightingPanel from "./lighting-panel";
import ScenePanel from "./scene-panel";
import ToolsPanel from "./tools-panel";
import ObjectPropertiesPanel from "./object-properties-panel"; // New
import MaterialsPanel from "./materials-panel"; // New
import RenderSettingsPanel from "./render-settings-panel"; // New
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
            <LightingPanel />
            <ScenePanel />
          </>
        );
      case 'texturing':
        return (
          <>
            <MaterialsPanel />
            {selectedObjectId && <ObjectPropertiesPanel />} 
            <LightingPanel /> {/* Added LightingPanel to texturing mode */}
            <ScenePanel />
          </>
        );
      case 'rendering':
        return (
          <>
            <RenderSettingsPanel />
            <LightingPanel />
            <ScenePanel />
          </>
        );
      default:
        return null;
    }
  };

  const getDefaultOpenItems = (mode: AppMode) => {
    switch (mode) {
      case 'modelling':
        return ['item-tools', selectedObjectId ? 'item-object-props' : undefined, 'item-lighting'].filter(Boolean) as string[];
      case 'texturing':
        return ['item-materials', selectedObjectId ? 'item-object-props' : undefined, 'item-lighting'].filter(Boolean) as string[];
      case 'rendering':
        return ['item-render-settings', 'item-lighting'].filter(Boolean) as string[];
      default:
        return [];
    }
  }

  return (
    <ScrollArea className="h-full p-1">
      <Accordion type="multiple" defaultValue={getDefaultOpenItems(appMode)} className="w-full" key={appMode + (selectedObjectId || '')}> {/* Added key to force re-render on mode/selection change for defaultValue */}
        {getPanelsForMode(appMode)}
      </Accordion>
    </ScrollArea>
  );
};

export default MainSidebar;
