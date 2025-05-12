
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
import type { ToolType, PrimitiveType } from "@/types";
import { 
  MousePointer2, // Select
  Move, 
  RotateCcw, 
  Maximize2, // Scale
  Construction, // Tools section icon
  Box, // For Add Cube
  Circle, // For Add Cylinder
  LayoutPanelLeft, // For Add Plane
  Type as TextIcon, // Text tool
  // Image as ImageIcon, // Image tool - not used for now
  Square, // Rectangle tool (Shapes was too generic)
  PenTool, // Line/Freehand tool
  Spline, // Arc tool
  Eraser, // Eraser tool
  // Hand, // Pan tool - handled by OrbitControls
  // ZoomIn, // Zoom tool - handled by OrbitControls
  ChevronsUpDown, // Push/Pull tool
  PaintBucket, // Paint Bucket tool
  Copy, // Offset tool
  Ruler, // Tape Measure / Protractor
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";


interface ToolConfig {
  id: ToolType;
  label: string;
  icon: React.ElementType;
  action?: () => void;
  isPlaceholder?: boolean; 
}

const ToolsPanel = () => {
  const { activeTool, setActiveTool, addObject } = useScene();
  const { toast } = useToast();

  const handleAddPrimitive = (type: PrimitiveType) => {
    const newObj = addObject(type);
    toast({
      title: "Object Added",
      description: `${newObj.name} added and selected.`,
    });
    // addObject in context now handles selecting and setting tool to 'select'
  };

  const placeholderToolAction = (toolLabel: string) => {
    toast({
      title: `${toolLabel} Selected`,
      description: "This tool's functionality is for future development.",
      duration: 3000,
    });
  };

  const primitiveTools: ToolConfig[] = [
    { id: 'addCube', label: 'Cube', icon: Box, action: () => handleAddPrimitive('cube') },
    { id: 'addCylinder', label: 'Cylinder', icon: Circle, action: () => handleAddPrimitive('cylinder')},
    { id: 'addPlane', label: 'Plane', icon: LayoutPanelLeft, action: () => handleAddPrimitive('plane')},
  ];

  const drawingTools: ToolConfig[] = [
    { id: 'select', label: 'Select', icon: MousePointer2 },
    { id: 'line', label: 'Line', icon: PenTool, isPlaceholder: true },
    { id: 'arc', label: 'Arc', icon: Spline, isPlaceholder: true }, 
    { id: 'rectangle', label: 'Rectangle', icon: Square, isPlaceholder: true }, 
  ];

  const modificationTools: ToolConfig[] = [
    { id: 'move', label: 'Move', icon: Move }, 
    { id: 'rotate', label: 'Rotate', icon: RotateCcw }, 
    { id: 'scale', label: 'Scale', icon: Maximize2 },   
    { id: 'pushpull', label: 'Push/Pull', icon: ChevronsUpDown, isPlaceholder: true },
    { id: 'offset', label: 'Offset', icon: Copy, isPlaceholder: true }, 
  ];
  
  const utilityTools: ToolConfig[] = [
    { id: 'tape', label: 'Measure', icon: Ruler, isPlaceholder: true }, 
    { id: 'text', label: '3D Text', icon: TextIcon, isPlaceholder: true },
    { id: 'paint', label: 'Paint', icon: PaintBucket, isPlaceholder: true },
    { id: 'eraser', label: 'Eraser', icon: Eraser, isPlaceholder: true },
  ];
  
  const renderToolSection = (title: string, tools: ToolConfig[]) => (
    <>
      <Label className="text-xs font-medium text-muted-foreground px-1 pt-2 pb-1 block">{title}</Label>
      <div className={`grid grid-cols-${Math.min(tools.length, 4)} gap-1`}> {/* Adjust grid columns */}
        {tools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === tool.id ? "secondary" : "outline"}
                size="icon"
                className="w-full h-14 flex flex-col items-center justify-center gap-1 p-1 border hover:bg-accent/80 focus:ring-accent data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                onClick={() => {
                  setActiveTool(tool.id);
                  if (tool.action) {
                     tool.action();
                  } else if (tool.isPlaceholder) {
                    placeholderToolAction(tool.label);
                  }
                }}
                aria-label={tool.label}
                data-state={activeTool === tool.id ? 'active' : 'inactive'}
              >
                <tool.icon size={20} className={activeTool === tool.id ? "text-accent-foreground" : "text-foreground/80"}/>
                <span className={`text-[10px] leading-tight text-center ${activeTool === tool.id ? "text-accent-foreground font-medium" : "text-muted-foreground"}`}>{tool.label}</span>
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
          {renderToolSection("Primitives", primitiveTools)}
          {renderToolSection("Drawing", drawingTools)}
          {renderToolSection("Modification", modificationTools)}
          {renderToolSection("Utilities", utilityTools)}
        </TooltipProvider>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ToolsPanel;
