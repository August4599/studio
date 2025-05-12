
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
  Circle as LucideCircle, // For Add Cylinder (renamed to avoid conflict)
  LayoutPanelLeft, // For Add Plane
  Type as TextIcon, // Text tool (Lucide 'Type' icon)
  Square, // Rectangle tool (Shapes was too generic)
  PenTool, // Line/Freehand tool
  Spline, // Arc tool
  Eraser, // Eraser tool
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
     // setActiveTool('select'); // Done by addObject now
  };
  
  const handleAddTextPlaceholder = () => {
    const newObj = addObject('text'); 
    toast({
      title: "3D Text Added",
      description: `${newObj.name} (placeholder) added. Full text geometry is a future feature.`,
    });
    // setActiveTool('select'); // Done by addObject now
  };

  const placeholderToolAction = (toolLabel: string, toolId: ToolType) => {
    setActiveTool(toolId); // Still activate the tool
    toast({
      title: `${toolLabel} Selected`,
      description: "This tool's drawing functionality is under development. Tool selected.",
      duration: 3000,
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


  const primitiveTools: ToolConfig[] = [
    { id: 'addCube', label: 'Cube', icon: Box, action: () => handleAddPrimitive('cube') },
    { id: 'addCylinder', label: 'Cylinder', icon: LucideCircle, action: () => handleAddPrimitive('cylinder')},
    { id: 'addPlane', label: 'Plane', icon: LayoutPanelLeft, action: () => handleAddPrimitive('plane')},
  ];

  const drawingTools: ToolConfig[] = [
    { id: 'select', label: 'Select', icon: MousePointer2, action: () => setActiveTool('select') },
    { id: 'line', label: 'Line', icon: PenTool, action: () => placeholderToolAction('Line', 'line') }, // Keep as placeholder action
    { id: 'arc', label: 'Arc', icon: Spline, action: () => placeholderToolAction('Arc', 'arc') }, 
    { id: 'rectangle', label: 'Rectangle', icon: Square, action: () => setActiveTool('rectangle') }, 
  ];

  const modificationTools: ToolConfig[] = [
    { id: 'move', label: 'Move', icon: Move, action: () => setActiveTool('move') }, 
    { id: 'rotate', label: 'Rotate', icon: RotateCcw, action: () => setActiveTool('rotate') }, 
    { id: 'scale', label: 'Scale', icon: Maximize2, action: () => setActiveTool('scale') },   
    { id: 'pushpull', label: 'Push/Pull', icon: ChevronsUpDown, isPlaceholder: true, action: () => placeholderToolAction('Push/Pull', 'pushpull') },
    { id: 'offset', label: 'Offset', icon: Copy, isPlaceholder: true, action: () => placeholderToolAction('Offset', 'offset') }, 
  ];
  
  const utilityTools: ToolConfig[] = [
    { id: 'tape', label: 'Measure', icon: Ruler, isPlaceholder: true, action: () => placeholderToolAction('Measure', 'tape') }, 
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
                  } else if (tool.id) { // Fallback for tools without specific action, just set active
                     setActiveTool(tool.id);
                     if (tool.isPlaceholder) { // Should be covered by placeholderToolAction now
                       placeholderToolAction(tool.label, tool.id);
                     }
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
