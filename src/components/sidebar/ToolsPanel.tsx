
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
  MousePointer2, Move, RotateCcw, Maximize2, Construction, Box, Circle as LucideCircle, LayoutPanelLeft, Type as TextIcon, Square, PenTool, Spline, Eraser, ChevronsUpDown, PaintBucket, Copy, Ruler, Hand, Expand, Globe, Triangle, Disc, Hexagon, Minus, Edit3, Image as ImageIcon, ZoomIn, Target, Settings2, Combine, Slice, Group, Layers, Orbit, GitBranchPlus // Added icons
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
// Input and Select are removed as options are moved to ToolPropertiesPanel

interface ToolConfig {
  id: ToolType;
  label: string;
  icon: React.ElementType;
  action?: () => void;
  // options?: React.ReactNode; // Options removed from here
  isWip?: boolean;
  flyoutTools?: ToolConfig[]; // For tools like Arc that have sub-tools
}

const ToolsPanel = () => {
  const { activeTool, setActiveTool, addObject, triggerZoomExtents, selectedObjectId } = useScene();
  const { toast } = useToast();
  const [activeFlyout, setActiveFlyout] = React.useState<ToolType | null>(null);

  const handleAddPrimitive = (type: PrimitiveType) => {
    const newObj = addObject(type);
    toast({
      title: "Object Added",
      description: `${newObj.name} added and selected.`,
    });
    setActiveTool('select'); // Revert to select tool after adding primitive
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
    setActiveFlyout(null); // Close any open flyout
  };

  const handleZoomExtents = () => {
    triggerZoomExtents(selectedObjectId || undefined);
    toast({ title: "View Reset", description: selectedObjectId ? "Zoomed to selected object." : "Zoomed to fit all objects." });
  }
  
  const toggleFlyout = (toolId: ToolType) => {
    setActiveFlyout(prev => prev === toolId ? null : toolId);
  };


  const toolCategories: { title: string; tools: ToolConfig[] }[] = [
    {
      title: "Selection & Transformation",
      tools: [
        { id: 'select', label: 'Select', icon: MousePointer2, action: () => activateGenericTool('select', 'Select Tool') },
        { id: 'move', label: 'Move', icon: Move, action: () => activateGenericTool('move', 'Move Tool') }, 
        { id: 'rotate', label: 'Rotate', icon: RotateCcw, action: () => activateGenericTool('rotate', 'Rotate Tool') }, 
        { id: 'scale', label: 'Scale', icon: Maximize2, action: () => activateGenericTool('scale', 'Scale Tool') },
      ]
    },
    {
      title: "Drawing Tools",
      tools: [
        { id: 'line', label: 'Line', icon: Minus, action: () => activateGenericTool('line', 'Line Tool', 'Click to define line segments.') }, 
        { id: 'rectangle', label: 'Rectangle', icon: Square, action: () => activateGenericTool('rectangle', 'Rectangle Tool') }, 
        { id: 'rotatedRectangle', label: 'Rotated Rect', icon: Square, isWip: true, action: () => activateGenericTool('rotatedRectangle', 'Rotated Rectangle Tool', 'WIP: Define base, then angle and width.')},
        { id: 'circle', label: 'Circle', icon: LucideCircle, action: () => activateGenericTool('circle', 'Circle Tool', 'Click center, drag for radius.') },
        { 
          id: 'arc', label: 'Arc', icon: Spline, action: () => toggleFlyout('arc'), 
          flyoutTools: [
            {id: 'arc2Point', label: '2-Point Arc', icon: Spline, isWip: true, action: () => activateGenericTool('arc2Point', '2-Point Arc', 'WIP')},
            {id: 'arc3Point', label: '3-Point Arc', icon: Spline, isWip: true, action: () => activateGenericTool('arc3Point', '3-Point Arc', 'WIP')},
            {id: 'pie', label: 'Pie', icon: GitBranchPlus, isWip: true, action: () => activateGenericTool('pie', 'Pie Tool', 'WIP')},
          ]
        }, 
        { id: 'polygon', label: 'Polygon', icon: Hexagon, action: () => activateGenericTool('polygon', 'Polygon Tool', 'Click center, drag. Set sides in Properties.')},
        { id: 'freehand', label: 'Freehand', icon: Edit3, action: () => activateGenericTool('freehand', 'Freehand Tool', 'Click and drag to draw freehand lines.'), isWip: true },
      ]
    },
    {
      title: "Modification Tools",
      tools: [
        { id: 'pushpull', label: 'Push/Pull', icon: ChevronsUpDown, action: () => activateGenericTool('pushpull', 'Push/Pull Tool', 'Click a face and drag to extrude.') },
        { id: 'offset', label: 'Offset', icon: Copy, action: () => activateGenericTool('offset', 'Offset Tool', 'Select faces/edges then click to offset.'), isWip: true }, 
        { id: 'followme', label: 'Follow Me', icon: Target, action: () => activateGenericTool('followme', 'Follow Me Tool', 'Select path, then profile to extrude.'), isWip: true },
        { id: 'intersectFaces', label: 'Intersect', icon: Combine, action: () => activateGenericTool('intersectFaces', 'Intersect Faces', 'WIP: With Model, With Selection, With Context.'), isWip: true },
        { id: 'outerShell', label: 'Solid Tools', icon: Layers, action: () => activateGenericTool('outerShell', 'Solid Tools', 'WIP: Union, Subtract, Trim, Intersect.'), isWip: true }, // Conceptual placeholder
      ]
    },
    {
      title: "Construction & Utilities",
      tools: [
        { id: 'tape', label: 'Measure', icon: Ruler, action: () => activateGenericTool('tape', 'Tape Measure', 'Click two points to measure.') }, 
        { id: 'protractor', label: 'Protractor', icon: Orbit, action: () => activateGenericTool('protractor', 'Protractor Tool', 'Define origin, first axis, then measure angle.'), isWip: true }, // Changed icon
        { id: 'dimension', label: 'Dimension', icon: Spline, isWip: true, action: () => activateGenericTool('dimension', 'Dimension Tool', 'WIP: Add linear dimensions.') },
        { id: 'axes', label: 'Axes', icon: Move, isWip: true, action: () => activateGenericTool('axes', 'Axes Tool', 'WIP: Relocate model axes.') }, // Reused Move icon for simplicity
        { id: 'sectionPlane', label: 'Section Plane', icon: Slice, isWip: true, action: () => activateGenericTool('sectionPlane', 'Section Plane Tool', 'WIP: Create section cuts.') },
        { id: 'addText', label: '3D Text', icon: TextIcon, action: handleAddTextPlaceholder },
        { id: 'paint', label: 'Paint', icon: PaintBucket, action: () => activateGenericTool('paint', 'Paint Bucket', 'Select material, then click object/face.') },
        { id: 'eraser', label: 'Eraser', icon: Eraser, action: () => activateGenericTool('eraser', 'Eraser Tool', 'Click objects to delete.') },
      ]
    },
    {
      title: "Primitive Shapes",
      tools: [
        { id: 'addCube', label: 'Cube', icon: Box, action: () => handleAddPrimitive('cube') },
        { id: 'addCylinder', label: 'Cylinder', icon: Disc, action: () => handleAddPrimitive('cylinder')},
        { id: 'addPlane', label: 'Plane', icon: LayoutPanelLeft, action: () => handleAddPrimitive('plane')},
        { id: 'addSphere', label: 'Sphere', icon: Globe, action: () => handleAddPrimitive('sphere') },
        { id: 'addCone', label: 'Cone', icon: Triangle, action: () => handleAddPrimitive('cone') },
        { id: 'addTorus', label: 'Torus', icon: LucideCircle, action: () => handleAddPrimitive('torus') }, 
      ]
    },
     {
      title: "Navigation",
      tools: [
        { id: 'orbit', label: 'Orbit', icon: Orbit, isWip: true, action: () => activateGenericTool('orbit', 'Orbit Tool', 'Orbit view. Default mouse controls also orbit.') }, 
        { id: 'pan', label: 'Pan', icon: Hand, action: () => activateGenericTool('pan', 'Pan Tool', 'Hold middle mouse or select tool to pan view.'), isWip: true }, 
        { id: 'zoomExtents', label: 'Zoom Fit', icon: Expand, action: handleZoomExtents }, 
        { id: 'zoomWindow', label: 'Zoom Window', icon: ZoomIn, isWip: true, action: () => activateGenericTool('zoomWindow', 'Zoom Window', 'WIP: Drag a rectangle to zoom.') },
      ]
    }
  ];
  
  const renderToolButton = (tool: ToolConfig, isFlyoutItem: boolean = false) => (
    <div key={tool.id} className="flex flex-col items-center relative"> {/* Added relative for flyout */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={activeTool === tool.id ? "secondary" : "outline"}
            size="icon"
            className={`w-full h-14 flex flex-col items-center justify-center gap-1 p-1 border hover:bg-primary/20 focus:ring-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative ${isFlyoutItem ? 'h-12 text-[9px]' : 'h-14'}`}
            onClick={() => {
              if (tool.isWip) {
                  toast({title: "Work in Progress", description: `${tool.label} tool is not fully functional yet.`, duration: 2000});
                  return;
              }
              if (tool.action) tool.action();
              else if (tool.id) setActiveTool(tool.id);
            }}
            aria-label={tool.label}
            data-state={activeTool === tool.id ? 'active' : 'inactive'}
          >
            <tool.icon size={isFlyoutItem ? 16 : 20} className={activeTool === tool.id ? "text-primary-foreground" : "text-foreground/80"}/>
            <span className={`text-[10px] leading-tight text-center ${activeTool === tool.id ? "text-primary-foreground font-medium" : "text-muted-foreground"} ${isFlyoutItem ? 'text-[9px]' : 'text-[10px]'}`}>{tool.label}</span>
            {tool.isWip && <span className="absolute top-0.5 right-0.5 text-[8px] bg-amber-500 text-white px-1 rounded-sm opacity-90">WIP</span>}
            {tool.flyoutTools && <span className="absolute bottom-0.5 right-0.5 text-muted-foreground"><ChevronDown size={10}/></span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={5}>
          <p>{tool.label}{tool.isWip ? " (WIP)" : ""}</p>
        </TooltipContent>
      </Tooltip>
      {activeFlyout === tool.id && tool.flyoutTools && (
        <div className="absolute left-full top-0 ml-1 p-1 bg-card border rounded-md shadow-lg z-20 w-40 grid grid-cols-2 gap-1">
            {tool.flyoutTools.map(flyoutTool => renderToolButton(flyoutTool, true))}
        </div>
      )}
      {/* Tool options are now removed from here and handled by ToolPropertiesPanel */}
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
              <div className={`grid grid-cols-3 gap-1`}>
                {category.tools.map(tool => renderToolButton(tool))}
              </div>
            </div>
          ))}
        </TooltipProvider>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ToolsPanel;
