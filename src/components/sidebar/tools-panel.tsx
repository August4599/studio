
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
  PenTool, // Replaced Minus with PenTool for Line
  RectangleHorizontal, 
  Circle, 
  BoxSelect, // For Push/Pull (SketchUp like extrusion tool)
  Move, 
  RotateCcw, 
  Maximize2, // Replaced Expand with Maximize2 for Scale
  Eraser,
  Construction // Placeholder for Tools section icon
} from "lucide-react";

interface ToolConfig {
  id: ToolType;
  label: string;
  icon: React.ElementType;
}

const toolsConfig: ToolConfig[] = [
  { id: 'select', label: 'Select', icon: MousePointer2 },
  { id: 'line', label: 'Line', icon: PenTool },
  { id: 'rectangle', label: 'Rectangle', icon: RectangleHorizontal },
  { id: 'circle', label: 'Circle', icon: Circle },
  { id: 'pushpull', label: 'Push/Pull', icon: BoxSelect },
  { id: 'move', label: 'Move', icon: Move },
  { id: 'rotate', label: 'Rotate', icon: RotateCcw },
  { id: 'scale', label: 'Scale', icon: Maximize2 },
  { id: 'eraser', label: 'Eraser', icon: Eraser },
];

const ToolsPanel = () => {
  const { activeTool, setActiveTool } = useScene();

  return (
    <AccordionItem value="item-tools">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Construction size={18} /> Modeling Tools
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-2">
        <TooltipProvider delayDuration={100}>
          <div className="grid grid-cols-3 gap-2">
            {toolsConfig.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTool === tool.id ? "secondary" : "outline"}
                    size="icon"
                    className="w-full h-16 flex flex-col items-center justify-center gap-1"
                    onClick={() => setActiveTool(tool.id)}
                    aria-label={tool.label}
                  >
                    <tool.icon size={24} />
                    <span className="text-xs">{tool.label}</span>
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
