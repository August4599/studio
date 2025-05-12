
"use client";

import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useScene } from "@/context/scene-context";
import type { ToolType } from "@/types";
import { 
  MousePointer2, 
  Move, 
  RotateCcw, 
  Maximize2, // Scale
  Construction, // Tools section icon
  PlusSquare, // Add Primitive
  Cube, // For Add Cube specifically
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";


interface ToolConfig {
  id: ToolType;
  label: string;
  icon: React.ElementType;
  action?: () => void; // Optional action for tools that execute immediately
}

const ToolsPanel = () => {
  const { activeTool, setActiveTool, addObject } = useScene();
  const { toast } = useToast();

  const handleAddCube = () => {
    const newCube = addObject('cube');
    toast({
      title: "Object Added",
      description: `Added ${newCube.name} to the scene.`,
    });
    setActiveTool('select'); // Switch to select tool after adding
  };

  const toolsConfig: ToolConfig[] = [
    { id: 'select', label: 'Select', icon: MousePointer2 },
    { id: 'move', label: 'Move', icon: Move },
    { id: 'rotate', label: 'Rotate', icon: RotateCcw },
    { id: 'scale', label: 'Scale', icon: Maximize2 },
    // Placeholder for more direct modeling tools in future
  ];
  
  // Primitive creation tools, separate section or buttons
  const primitiveToolsConfig: ToolConfig[] = [
      { id: 'addCube', label: 'Add Cube', icon: Cube, action: handleAddCube },
      // Future: Add Sphere, Cylinder, Plane buttons here
  ];


  return (
    <AccordionItem value="item-tools">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Construction size={18} /> Modeling Tools
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-2 space-y-3">
        <TooltipProvider delayDuration={100}>
          <Label className="text-xs font-medium text-muted-foreground px-1">Transform Tools</Label>
          <div className="grid grid-cols-4 gap-1"> {/* Adjusted grid to 4 for better fit */}
            {toolsConfig.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTool === tool.id ? "secondary" : "outline"}
                    size="icon"
                    className="w-full h-14 flex flex-col items-center justify-center gap-1 p-1"
                    onClick={() => {
                      setActiveTool(tool.id);
                      if (tool.action) tool.action();
                    }}
                    aria-label={tool.label}
                  >
                    <tool.icon size={20} />
                    <span className="text-[10px] leading-tight">{tool.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{tool.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          
          <Label className="text-xs font-medium text-muted-foreground px-1 pt-2 block">Add Primitives</Label>
          <div className="grid grid-cols-4 gap-1">
             {primitiveToolsConfig.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={"outline"} // Always outline for action buttons
                    size="icon"
                    className="w-full h-14 flex flex-col items-center justify-center gap-1 p-1"
                    onClick={() => {
                      if (tool.action) tool.action();
                    }}
                    aria-label={tool.label}
                  >
                    <tool.icon size={20} />
                    <span className="text-[10px] leading-tight">{tool.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{tool.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ToolsPanel;

```