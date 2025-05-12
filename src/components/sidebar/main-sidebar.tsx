
"use client";

import { Accordion } from "@/components/ui/accordion";
import LightingPanel from "./lighting-panel";
import ScenePanel from "./scene-panel";
import ToolsPanel from "./tools-panel"; // New import
import { ScrollArea } from "@/components/ui/scroll-area";

const MainSidebar = () => {
  return (
    <ScrollArea className="h-full p-1">
      <Accordion type="multiple" defaultValue={['item-tools', 'item-lighting', 'item-scene']} className="w-full">
        <ToolsPanel />
        <LightingPanel />
        <ScenePanel />
      </Accordion>
    </ScrollArea>
  );
};

export default MainSidebar;
