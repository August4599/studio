"use client";

import { Accordion } from "@/components/ui/accordion";
// import ObjectPanel from "./object-panel"; // Removed
// import MaterialPanel from "./material-panel"; // Removed
import LightingPanel from "./lighting-panel";
import ScenePanel from "./scene-panel";
import { ScrollArea } from "@/components/ui/scroll-area";
// Icons Shapes and Palette no longer needed here
// import { Shapes, Palette, Lightbulb, Save } from "lucide-react"; 

const MainSidebar = () => {
  return (
    <ScrollArea className="h-full p-1">
      <Accordion type="multiple" defaultValue={['item-lighting', 'item-scene']} className="w-full">
        {/* <ObjectPanel /> // Removed */}
        {/* <MaterialPanel /> // Removed */}
        <LightingPanel />
        <ScenePanel />
      </Accordion>
    </ScrollArea>
  );
};

export default MainSidebar;
