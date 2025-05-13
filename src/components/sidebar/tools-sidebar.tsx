"use client";
import React from 'react';
import ToolsPanel from "./tools-panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { Construction } from 'lucide-react';

const ToolsSidebar = () => {
  return (
    <div className="flex flex-col h-full bg-card text-card-foreground">
      <div className="p-3 flex items-center gap-2 border-b h-12 flex-none">
        <Construction className="w-6 h-6 text-primary" />
        <h2 className="text-lg font-semibold">Modeling Tools</h2>
      </div>
      <ScrollArea className="flex-grow p-1">
        <Accordion type="multiple" defaultValue={['item-tools']} className="w-full">
          <ToolsPanel />
        </Accordion>
      </ScrollArea>
      {/* Optional: Footer for ToolsSidebar if needed
      <div className="p-2 border-t text-center flex-none">
        <p className="text-xs text-muted-foreground">Interactive Tools</p>
      </div> 
      */}
    </div>
  );
};
export default ToolsSidebar;
