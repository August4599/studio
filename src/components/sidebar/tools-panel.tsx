
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
  Box, // For Add Cube specifically (replaces Cube)
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
  Eye, // Orbit tool (Orbit controls are active by default)
  Copy, // Offset tool
  Scissors // Tape Measure / Protractor (could be split)
} from "lucide-react";
import { Label } from "@/components/ui/label";
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

  // SketchUp-inspired tools. Some are direct, some are conceptual.
  const mainTools: ToolConfig[] = [
    { id: 'select', label: 'Select', icon: MousePointer2 },
    { id: 'line', label: 'Line', icon: PenTool },
    { id: 'arc', label: 'Arc', icon: Spline }, // Generic for arcs
    { id: 'rectangle', label: 'Rectangle', icon: Shapes }, // Generic for shapes
    // { id: 'circle', label: 'Circle', icon: CircleIcon }, // Could be sub-tool of Shapes
    // { id: 'polygon', label: 'Polygon', icon: Hexagon }, // Could be sub-tool of Shapes
  ];

  const modificationTools: ToolConfig[] = [
    { id: 'pushpull', label: 'Push/Pull', icon: ChevronsUpDown },
    { id: 'move', label: 'Move', icon: Move },
    { id: 'rotate', label: 'Rotate', icon: RotateCcw },
    { id: 'scale', label: 'Scale', icon: Maximize2 },
    { id: 'offset', label: 'Offset', icon: Copy }, // conceptual
  ];
  
  const utilityTools: ToolConfig[] = [
    { id: 'tape', label: 'Tape', icon: Scissors }, // Tape measure
    // { id: 'dimensions', label: 'Dimensions', icon: Ruler }, // Not a direct tool, but for display
    { id: 'text', label: '3D Text', icon: Type },
    { id: 'paint', label: 'Paint', icon: PaintBucket },
    { id: 'eraser', label: 'Eraser', icon: Eraser },
  ];
  
  // Camera tools are usually handled by OrbitControls, but can have explicit buttons
  // const cameraTools: ToolConfig[] = [
  //   { id: 'orbit', label: 'Orbit', icon: Eye }, // Default
  //   { id: 'pan', label: 'Pan', icon: Hand },
  //   { id: 'zoom', label: 'Zoom', icon: ZoomIn }, // OrbitControls handles this
  // ];
  
  const primitiveToolsConfig: ToolConfig[] = [
      { id: 'addCube', label: 'Add Cube', icon: Box, action: handleAddCube },
      // Future: Add Sphere, Cylinder, Plane buttons here
  ];

  const renderToolSection = (title: string, tools: ToolConfig[]) => (
    <>
      <Label className="text-xs font-medium text-muted-foreground px-1 pt-2 block">{title}</Label>
      <div className="grid grid-cols-4 gap-1">
        {tools.map((tool) => (
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
          {renderToolSection("Drawing & Selection", mainTools)}
          {renderToolSection("Modification", modificationTools)}
          {renderToolSection("Utilities", utilityTools)}
          {/* {renderToolSection("Camera", cameraTools)} // If explicit camera tools are needed */}
          {renderToolSection("Add Primitives", primitiveToolsConfig)}
        </TooltipProvider>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ToolsPanel;
