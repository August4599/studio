"use client";

import { Accordion } from "@/components/ui/accordion";
import ObjectPanel from "./object-panel";
import MaterialPanel from "./material-panel";
import LightingPanel from "./lighting-panel";
import ScenePanel from "./scene-panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shapes, Palette, Lightbulb, Save } from "lucide-react";

const MainSidebar = () => {
  return (
    <ScrollArea className="h-full p-1">
      <Accordion type="multiple" defaultValue={['item-objects', 'item-materials', 'item-lighting', 'item-scene']} className="w-full">
        <ObjectPanel />
        <MaterialPanel />
        <LightingPanel />
        <ScenePanel />
      </Accordion>
    </ScrollArea>
  );
};

export default MainSidebar;
