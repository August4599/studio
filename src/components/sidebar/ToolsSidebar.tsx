
"use client";
import React from 'react';
import ToolsPanel from "./ToolsPanel"; // Corrected casing
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { Construction } from 'lucide-react';
import { useScene } from '@/context/scene-context'; // Corrected import

const ToolsSidebar = () => {
  const { appMode } = useScene(); 

  // Only render tools sidebar in modelling mode
  if (appMode !== 'modelling') {
    return null; 
  }

  return (
    <div className="w-64 flex flex-col h-full bg-card text-card-foreground border-r shadow-lg flex-none">
      <div className="p-3 flex items-center gap-2 border-b h-12 flex-none">
        <Construction className="w-5 h-5 text-primary" />
        <h2 className="text-base font-semibold">Modeling Tools</h2>
      </div>
      <ScrollArea className="flex-grow p-1">
        <Accordion type="multiple" defaultValue={['item-tools']} className="w-full">
          <ToolsPanel />
        </Accordion>
      </ScrollArea>
    </div>
  );
};

export default ToolsSidebar;
