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
  Box, // For Add Cube specifically
  Type, // Text tool
  Image as ImageIcon, // Image tool
  Shapes, // Rectangle, Circle, Polygon etc.
  PenTool, // Line/Freehand tool
  Circle as CircleIcon, // Circle tool
  Spline, // Arc tool
  Eraser, // Eraser tool
  Hand, // Pan tool
  ZoomIn, // Zoom tool (though orbit controls handle zoom)
  ChevronsUpDown, // Push/Pull tool
  PaintBucket, // Paint Bucket tool
  // Eye, // Orbit tool (Orbit controls are active by default) // Commented out as orbit is default
  Copy, // Offset tool
  Scissors // Tape Measure / Protractor (could be split)
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";


interface ToolConfig {
  id: ToolType;
  label: string;
  icon: React.ElementType;
  action?: () => void;
  isPlaceholder?: boolean; // To indicate if it's a placeholder tool
}

const ToolsPanel = () => {
  const { activeTool, setActiveTool, addObject, selectObject } = useScene();
  const { toast } = useToast();

  const handleAddPrimitive = (type: 'cube' | 'cylinder' | 'plane') => {
    const newObj = addObject(type);
    toast({
      title: "Object Added",
      description: `${newObj.name} added and selected.`,
    });
    // setActiveTool('select'); // addObject now handles this
    // selectObject(newObj.id); // addObject now handles this
  };

  const placeholderToolAction = (toolLabel: string) => {
    toast({
      title: `${toolLabel} Selected`,
      description: "This tool's functionality is currently in development.",
      duration: 3000,
    });
  };

  const mainTools: ToolConfig[] = [
    { id: 'select', label: 'Select', icon: MousePointer2 },
    { id: 'line', label: 'Line', icon: PenTool, isPlaceholder: true },
    { id: 'arc', label: 'Arc', icon: Spline, isPlaceholder: true }, 
    { id: 'rectangle', label: 'Rectangle', icon: Shapes, isPlaceholder: true }, 
  ];

  const modificationTools: ToolConfig[] = [
    { id: 'pushpull', label: 'Push/Pull', icon: ChevronsUpDown, isPlaceholder: true },
    { id: 'move', label: 'Move', icon: Move, isPlaceholder: true }, // Will become active with object selection
    { id: 'rotate', label: 'Rotate', icon: RotateCcw, isPlaceholder: true }, // "
    { id: 'scale', label: 'Scale', icon: Maximize2, isPlaceholder: true },   // "
    { id: 'offset', label: 'Offset', icon: Copy, isPlaceholder: true }, 
  ];
  
  const utilityTools: ToolConfig[] = [
    { id: 'tape', label: 'Tape', icon: Scissors, isPlaceholder: true }, 
    { id: 'text', label: '3D Text', icon: Type, isPlaceholder: true },
    { id: 'paint', label: 'Paint', icon: PaintBucket, isPlaceholder: true },
    { id: 'eraser', label: 'Eraser', icon: Eraser, isPlaceholder: true },
  ];
  
  const primitiveToolsConfig: ToolConfig[] = [
      { id: 'addCube', label: 'Add Cube', icon: Box, action: () => handleAddPrimitive('cube') },
      // Future: Add Sphere, Cylinder, Plane buttons here. For now, only cube.
      // { id: 'addCylinder', label: 'Add Cylinder', icon: CylinderIcon, action: () => handleAddPrimitive('cylinder')},
      // { id: 'addPlane', label: 'Add Plane', icon: Square, action: () => handleAddPrimitive('plane')},
  ];

  const renderToolSection = (title: string, tools: ToolConfig[]) => (
    <>
      <Label className="text-xs font-medium text-muted-foreground px-1 pt-2 pb-1 block">{title}</Label>
      <div className="grid grid-cols-4 gap-1">
        {tools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === tool.id ? "secondary" : "outline"}
                size="icon"
                className="w-full h-14 flex flex-col items-center justify-center gap-1 p-1 border hover:bg-accent/80 focus:ring-accent"
                onClick={() => {
                  setActiveTool(tool.id);
                  if (tool.action) {
                     tool.action();
                  } else if (tool.isPlaceholder) {
                    placeholderToolAction(tool.label);
                  }
                }}
                aria-label={tool.label}
              >
                <tool.icon size={20} className={activeTool === tool.id ? "text-accent-foreground" : "text-foreground/80"}/>
                <span className={`text-[10px] leading-tight ${activeTool === tool.id ? "text-accent-foreground font-medium" : "text-muted-foreground"}`}>{tool.label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{tool.label}{tool.isPlaceholder ? " (WIP)" : ""}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </>
  );


  return (
    <AccordionItem value="item-tools">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Construction size={18} /> Modeling Tools
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-2 space-y-1">
        <TooltipProvider delayDuration={100}>
          {renderToolSection("Primitives", primitiveToolsConfig)}
          {renderToolSection("Drawing & Selection", mainTools)}
          {renderToolSection("Modification", modificationTools)}
          {renderToolSection("Utilities", utilityTools)}
        </TooltipProvider>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ToolsPanel;
