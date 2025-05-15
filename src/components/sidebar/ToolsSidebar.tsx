
"use client";
import React from 'react';
import ToolsPanel from "./ToolsPanel"; 
import ToolPropertiesPanel from './ToolPropertiesPanel';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { Construction, Settings2 } from 'lucide-react';
import { useScene } from '@/context/scene-context'; 
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

const ToolsSidebar: React.FC = () => {
  const { appMode } = useScene(); 

  if (appMode !== 'modelling') {
    return null; 
  }

  return (
    <div className="w-64 flex flex-col h-full bg-card text-card-foreground border-r shadow-lg flex-none">
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={65} minSize={40}>
          <div className="p-3 flex items-center gap-2 border-b h-12 flex-none">
            <Construction className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold">Modeling Tools</h2>
          </div>
          <ScrollArea className="flex-grow p-1">
            <Accordion type="multiple" defaultValue={['item-tools']} className="w-full">
              <ToolsPanel />
            </Accordion>
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={35} minSize={20}>
          <div className="p-3 flex items-center gap-2 border-b h-12 flex-none">
             <Settings2 className="w-5 h-5 text-primary" />
             <h2 className="text-base font-semibold">Tool Options</h2>
          </div>
          <ScrollArea className="flex-grow p-2">
            <ToolPropertiesPanel />
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ToolsSidebar;
