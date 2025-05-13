
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
  PenTool, // For Line / Freehand
  Spline, // For Arc
  Eraser, 
  ChevronsUpDown, // For Push/Pull
  PaintBucket, 
  Copy, // For Offset
  Ruler, // For Tape Measure
  Target, // For Protractor (or a more specific icon if available)
  Hand, // For Pan
  Expand, // For Zoom Extents
  Globe, // For Sphere (placeholder, could be more specific)
  Triangle, // For Cone (placeholder)
  Disc, // For Torus (placeholder)
  Hexagon, // For Polygon
  Minus, // For general line drawing
  Edit3 // For Freehand
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";


interface ToolConfig {
  id: ToolType;
  label: string;
  icon: React.ElementType;
  action?: () => void;
  options?: React.ReactNode; // For tools like Polygon (number of sides)
}

const ToolsPanel = () => {
  const { activeTool, setActiveTool, addObject, drawingState, setDrawingState } = useScene();
  const { toast } = useToast();

  const handleAddPrimitive = (type: PrimitiveType) => {
    const newObj = addObject(type);
    toast({
      title: "Object Added",
      description: `${newObj.name} added and selected.`,
    });
    setActiveTool('select');
  };
  
  const handleAddTextPlaceholder = () => {
    const newObj = addObject('text'); 
    toast({
      title: "3D Text Added",
      description: `${newObj.name} (placeholder) added. Full text geometry is a future feature.`,
    });
    setActiveTool('select');
  };
  
  const activateGenericTool = (toolId: ToolType, toolLabel: string, message?: string) => {
    setActiveTool(toolId);
    toast({
      title: `${toolLabel} Selected`,
      description: message || `The ${toolLabel.toLowerCase()} is now active.`,
      duration: 3000,
    });
  };

  const toolCategories: { title: string; tools: ToolConfig[] }[] = [
    {
      title: "Selection & Transformation",
      tools: [
        { id: 'select', label: 'Select', icon: MousePointer2, action: () => setActiveTool('select') },
        { id: 'move', label: 'Move', icon: Move, action: () => setActiveTool('move') }, 
        { id: 'rotate', label: 'Rotate', icon: RotateCcw, action: () => setActiveTool('rotate') }, 
        { id: 'scale', label: 'Scale', icon: Maximize2, action: () => setActiveTool('scale') },
      ]
    },
    {
      title: "Drawing Tools",
      tools: [
        { id: 'line', label: 'Line', icon: Minus, action: () => activateGenericTool('line', 'Line Tool', 'Click to define line segments.') }, 
        { id: 'rectangle', label: 'Rectangle', icon: Square, action: () => setActiveTool('rectangle') }, 
        { id: 'circle', label: 'Circle', icon: LucideCircle, action: () => activateGenericTool('circle', 'Circle Tool', 'Click center, drag for radius.') },
        { id: 'arc', label: 'Arc', icon: Spline, action: () => activateGenericTool('arc', 'Arc Tool', 'Arc drawing: define center, start, end.') }, 
        { 
          id: 'polygon', 
          label: 'Polygon', 
          icon: Hexagon, 
          action: () => activateGenericTool('polygon', 'Polygon Tool', 'Click center, drag for radius. Set sides below.'),
          options: (
            <div className="mt-1 flex items-center gap-1">
              <Label htmlFor="polygon-sides" className="text-xs whitespace-nowrap">Sides:</Label>
              <Input 
                id="polygon-sides"
                type="number" 
                min="3" max="32" step="1" 
                value={drawingState.polygonSides || 6} 
                onChange={(e) => setDrawingState({ polygonSides: parseInt(e.target.value) || 6 })}
                className="h-6 w-12 text-xs p-1"
              />
            </div>
          )
        },
        { id: 'freehand', label: 'Freehand', icon: Edit3, action: () => activateGenericTool('freehand', 'Freehand Tool', 'Click and drag to draw freehand lines.') },
      ]
    },
    {
      title: "Modification Tools",
      tools: [
        { id: 'pushpull', label: 'Push/Pull', icon: ChevronsUpDown, action: () => activateGenericTool('pushpull', 'Push/Pull Tool', 'Click a face and drag to extrude.') },
        { id: 'offset', label: 'Offset', icon: Copy, action: () => activateGenericTool('offset', 'Offset Tool', 'Select faces/edges then click to offset.') }, 
        { id: 'followme', label: 'Follow Me', icon: Target, action: () => activateGenericTool('followme', 'Follow Me Tool', 'Select path, then profile to extrude (WIP).') }, // Target is a temp icon
      ]
    },
    {
      title: "Construction & Utilities",
      tools: [
        { id: 'tape', label: 'Measure', icon: Ruler, action: () => activateGenericTool('tape', 'Tape Measure Tool', 'Click two points to measure.') }, 
        { id: 'protractor', label: 'Protractor', icon: Target, action: () => activateGenericTool('protractor', 'Protractor Tool', 'Define origin, first axis, then measure angle (WIP).') }, // Target is a temp icon
        { id: 'addText', label: '3D Text', icon: TextIcon, action: handleAddTextPlaceholder },
        { id: 'paint', label: 'Paint', icon: PaintBucket, action: () => activateGenericTool('paint', 'Paint Tool', 'Select material, then click object/face.') },
        { id: 'eraser', label: 'Eraser', icon: Eraser, action: () => activateGenericTool('eraser', 'Eraser Tool', 'Click objects to delete.') },
        // { id: 'axes', label: 'Axes', icon: Crosshair, action: () => activateGenericTool('axes', 'Axes Tool', 'Click to redefine drawing axes (WIP).') },
      ]
    },
    {
      title: "Primitive Shapes",
      tools: [
        { id: 'addCube', label: 'Cube', icon: Box, action: () => handleAddPrimitive('cube') },
        { id: 'addCylinder', label: 'Cylinder', icon: Disc, action: () => handleAddPrimitive('cylinder')}, // Disc as temp for cylinder
        { id: 'addPlane', label: 'Plane', icon: LayoutPanelLeft, action: () => handleAddPrimitive('plane')},
        { id: 'addSphere', label: 'Sphere', icon: Globe, action: () => handleAddPrimitive('sphere') },
        { id: 'addCone', label: 'Cone', icon: Triangle, action: () => handleAddPrimitive('cone') },
        { id: 'addTorus', label: 'Torus', icon: LucideCircle, action: () => handleAddPrimitive('torus') }, // Circle as temp for torus
      ]
    },
     {
      title: "Navigation",
      tools: [
        // { id: 'orbit', label: 'Orbit', icon: Eye, action: () => activateGenericTool('orbit', 'Orbit Tool', 'Orbit controls are usually active by default.') }, // Orbit is usually default
        { id: 'pan', label: 'Pan', icon: Hand, action: () => activateGenericTool('pan', 'Pan Tool', 'Hold middle mouse or select tool to pan view (WIP).') },
        { id: 'zoomExtents', label: 'Zoom Extents', icon: Expand, action: () => activateGenericTool('zoomExtents', 'Zoom Extents', 'Fit all objects in view (WIP).') },
        // { id: 'zoom', label: 'Zoom', icon: ZoomIn, action: () => activateGenericTool('zoom', 'Zoom Tool', 'Click and drag to zoom window (WIP).') },
      ]
    }
  ];
  
  const renderToolButton = (tool: ToolConfig) => (
    <div key={tool.id} className="flex flex-col items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={activeTool === tool.id ? "secondary" : "outline"}
            size="icon"
            className="w-full h-14 flex flex-col items-center justify-center gap-1 p-1 border hover:bg-primary/20 focus:ring-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            onClick={() => {
              if (tool.action) tool.action();
              else if (tool.id) setActiveTool(tool.id);
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
      {tool.options && activeTool === tool.id && <div className="mt-1 w-full">{tool.options}</div>}
    </div>
  );

  return (
    <AccordionItem value="item-tools">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Construction size={18} /> Modeling Tools
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-1 space-y-1">
        <TooltipProvider delayDuration={100}>
          {toolCategories.map(category => (
            <div key={category.title} className="space-y-1 py-1">
              <Label className="text-xs font-medium text-muted-foreground px-1 pb-1 block">{category.title}</Label>
              <div className={`grid grid-cols-3 gap-1`}> {/* Fixed 3 columns for better density */}
                {category.tools.map(renderToolButton)}
              </div>
            </div>
          ))}
        </TooltipProvider>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ToolsPanel;
