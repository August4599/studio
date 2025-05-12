"use client";
import React from 'react';
import ToolsPanel from "./tools-panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { Construction } from 'lucide-react';

const ToolsSidebar = () => {
  return (
    <div className="flex flex-col h-full bg-card border-r shadow-sm text-card-foreground">
      <div className="p-3 flex items-center gap-2 border-b h-16"> {/* Fixed height for header */}
        <Construction className="w-6 h-6 text-accent" />
        <h2 className="text-lg font-semibold">Tools</h2>
      </div>
      <ScrollArea className="flex-grow">
        {/* ToolsPanel returns an AccordionItem, so it needs an Accordion root */}
        <Accordion type="multiple" defaultValue={['item-tools']} className="w-full p-1">
          <ToolsPanel />
        </Accordion>
      </ScrollArea>
      <div className="p-2 border-t text-center">
        <p className="text-xs text-muted-foreground">Modeling Tools</p>
      </div>
    </div>
  );
};
export default ToolsSidebar;