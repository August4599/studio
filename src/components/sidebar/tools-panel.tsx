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
  MousePointer2, 
  Move, 
  RotateCcw, 
  Maximize2, 
  Construction, 
  Box, 
  Circle as LucideCircle, 
  LayoutPanelLeft, 
  Type as TextIcon, 
  Square, 
  PenTool, 
  Spline, 
  Eraser, 
  ChevronsUpDown, 
  PaintBucket, 
  Copy, 
  Ruler, 
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";


interface ToolConfig {
  id: ToolType;
  label: string;
  icon: React.ElementType;
  action?: () => void;
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
  };
  
  const handleAddTextPlaceholder = () => {
    const newObj = addObject('text'); 
    toast({
      title: "3D Text Added",
      description: `${newObj.name} (placeholder) added. Full text geometry is a future feature.`,
    });
  };
  
  const handleEraserToolActivate = () => {
    setActiveTool('eraser');
    toast({
      title: "Eraser Tool Active",
      description: "Click on an object in the scene to delete it.",
    });
  };
  
  const handlePaintToolActivate = () => {
    setActiveTool('paint');
    toast({
      title: "Paint Tool Active",
      description: "Select a material from the Materials panel, then click an object to apply it.",
    });
  };

  const handleMeasureToolActivate = () => {
    setActiveTool('tape');
    toast({
      title: "Measure Tool Active",
      description: "Click two points on the XZ plane to measure the distance.",
    });
  };

  const activateGenericTool = (toolId: ToolType, toolLabel: string, message?: string) => {
    setActiveTool(toolId);
    toast({
      title: `${toolLabel} Selected`,
      description: message || `The ${toolLabel.toLowerCase()} is now active.`,
      duration: 3000,
    });
  };
  
  const handlePushPullActivate = () => {
    setActiveTool('pushpull');
    toast({
      title: "Push/Pull Tool Active",
      description: "Select a cube to interact. Full geometry modification is planned for future updates.",
    });
  };


  const primitiveTools: ToolConfig[] = [
    { id: 'addCube', label: 'Cube', icon: Box, action: () => handleAddPrimitive('cube') },
    { id: 'addCylinder', label: 'Cylinder', icon: LucideCircle, action: () => handleAddPrimitive('cylinder')},
    { id: 'addPlane', label: 'Plane', icon: LayoutPanelLeft, action: () => handleAddPrimitive('plane')},
  ];

  const drawingTools: ToolConfig[] = [
    { id: 'select', label: 'Select', icon: MousePointer2, action: () => setActiveTool('select') },
    { id: 'line', label: 'Line', icon: PenTool, action: () => activateGenericTool('line', 'Line Tool', 'Line drawing functionality is under development.') }, 
    { id: 'arc', label: 'Arc', icon: Spline, action: () => activateGenericTool('arc', 'Arc Tool', 'Arc drawing functionality is under development.') }, 
    { id: 'rectangle', label: 'Rectangle', icon: Square, action: () => setActiveTool('rectangle') }, 
  ];

  const modificationTools: ToolConfig[] = [
    { id: 'move', label: 'Move', icon: Move, action: () => setActiveTool('move') }, 
    { id: 'rotate', label: 'Rotate', icon: RotateCcw, action: () => setActiveTool('rotate') }, 
    { id: 'scale', label: 'Scale', icon: Maximize2, action: () => setActiveTool('scale') },   
    { id: 'pushpull', label: 'Push/Pull', icon: ChevronsUpDown, action: handlePushPullActivate },
    { id: 'offset', label: 'Offset', icon: Copy, action: () => activateGenericTool('offset', 'Offset Tool', 'Offset functionality is under development.') }, 
  ];
  
  const utilityTools: ToolConfig[] = [
    { id: 'tape', label: 'Measure', icon: Ruler, action: handleMeasureToolActivate }, 
    { id: 'addText', label: '3D Text', icon: TextIcon, action: handleAddTextPlaceholder },
    { id: 'paint', label: 'Paint', icon: PaintBucket, action: handlePaintToolActivate },
    { id: 'eraser', label: 'Eraser', icon: Eraser, action: handleEraserToolActivate },
  ];
  
  const renderToolSection = (title: string, tools: ToolConfig[]) => (
    <>
      <Label className="text-xs font-medium text-muted-foreground px-1 pt-2 pb-1 block">{title}</Label>
      <div className={`grid grid-cols-${Math.min(tools.length, 4)} gap-1`}>
        {tools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === tool.id ? "secondary" : "outline"}
                size="icon"
                className="w-full h-14 flex flex-col items-center justify-center gap-1 p-1 border hover:bg-primary/20 focus:ring-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                onClick={() => {
                  if (tool.action) {
                     tool.action();
                  } else if (tool.id) { 
                     setActiveTool(tool.id);
                  }
                }}
                aria-label={tool.label}
                data-state={activeTool === tool.id ? 'active' : 'inactive'}
              >
                <tool.icon size={20} className={activeTool === tool.id ? "text-primary-foreground" : "text-foreground/80"}/>
                <span className={`text-[10px] leading-tight text-center ${activeTool === tool.id ? "text-primary-foreground font-medium" : "text-muted-foreground"}`}>{tool.label}</span>
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
