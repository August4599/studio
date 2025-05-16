
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
  MousePointer2, Move, RotateCcw, Maximize2, Construction, Box, Circle as LucideCircle, LayoutPanelLeft, Type as TextIcon, Square, PenTool, Spline, Eraser, ChevronsUpDown, PaintBucket, Copy, Ruler, Hand, Expand, Globe, Triangle, Disc, Hexagon, Minus, Edit3, ImageIcon, ZoomIn, Target, Settings2, Combine, Slice, Group, Layers, Orbit, GitBranchPlus, ChevronDown, Scissors, Eye as LookAroundIcon, Footprints, Users, Share2, CornerRightDown, CornerLeftUp, DraftingCompass, Move3d, Rotate3dIcon, Scale, Framer, Grid2X2, AreaChart, AlignHorizontalSpaceBetween, AlignVerticalSpaceBetween, StretchHorizontal, StretchVertical, AppWindow, Columns, Asterisk, Waves, Wind as WindIcon, CloudCog, Sparkles, ListFilter, Network, Puzzle, Rows, SigmaSquare, SlidersHorizontal, Variable, Zap, Anchor, Atom, BarChart, Bold, Bot, CircleDot, Code2, Coins, Component, ConciergeBell, Copyleft, Crop, Crosshair, Dices, Diff, Disc2, Disc3, Donut, ExpandIcon, ExternalLinkIcon, Fingerprint, Frame, Gem, GitCommit, GitMerge, GitPullRequest, GitPullRequestClosed, GitPullRequestDraft, HardDrive, Hash, Heading1, Heading2, HelpCircle, Highlighter, History, Hourglass, Indent, InfoIcon, Italic, IterationCcw, IterationCw, KanbanSquare, KeySquare, Languages, LayoutDashboard, Link2, ListChecks, ListMinus, ListOrdered, ListPlus, ListTree, LogIn, LogOutIcon, Mail, MapPinIcon, MenuSquare, Mic2, Minimize, MinusSquare, MoonStar, MousePointerClick, Music2, Navigation2, Option, PackageCheck, Percent, PilcrowSquare, PlayCircle, Podcast, Pointer, QuoteIcon, Rat, RectangleHorizontal, Repeat, Route, Rss, RulerIcon, Scaling, ScatterChart, SearchCode, ServerCog, ShapesIcon, ShieldAlert, ShoppingBasket, Snowflake, SortAsc, SortDesc, SpellCheck, SquareCode, StarHalf, Strikethrough, Subscript, Superscript, SwissFranc, Table2, TagIcon, TerminalSquare, TextCursorInput, TextSelect, ThermometerIcon, ThumbsDown, ThumbsUp, ToggleLeftIcon, ToggleRightIcon, Tool, TreesIcon, UnderlineIcon, UnfoldHorizontal, UnfoldVertical, Unlink2, UploadCloudIcon, Volume1, Volume2, VolumeX, Wallet, Webcam, Wifi, Wrench, YoutubeIcon,
  BoxSelect // Added BoxSelect
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";


interface ToolConfig {
  id: ToolType;
  label: string;
  icon: React.ElementType;
  action?: () => void;
  isWip?: boolean;
  flyoutTools?: ToolConfig[]; 
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
      description: message || `The ${toolLabel.toLowerCase()} is now active. Check Tool Options panel.`,
      duration: 3000,
    });
    setActiveFlyout(null); 
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
        { id: 'rotatedRectangle', label: 'Rotated Rect', icon: Framer, isWip: true, action: () => activateGenericTool('rotatedRectangle', 'Rotated Rectangle', 'WIP: Define base, then angle and width.')},
        { id: 'circle', label: 'Circle', icon: LucideCircle, action: () => activateGenericTool('circle', 'Circle Tool', 'Click center, drag for radius.') },
        { 
          id: 'arc', label: 'Arc Tools', icon: Spline, action: () => toggleFlyout('arc'), 
          flyoutTools: [
            {id: 'arc', label: 'Arc (Center)', icon: Spline, isWip: true, action: () => activateGenericTool('arc', 'Arc Tool (Center)', 'WIP')},
            {id: 'arc2Point', label: '2-Point Arc', icon: GitMerge, isWip: true, action: () => activateGenericTool('arc2Point', '2-Point Arc', 'WIP')},
            {id: 'arc3Point', label: '3-Point Arc', icon: Route, isWip: true, action: () => activateGenericTool('arc3Point', '3-Point Arc', 'WIP')},
            {id: 'pie', label: 'Pie', icon: GitBranchPlus, isWip: true, action: () => activateGenericTool('pie', 'Pie Tool', 'WIP')},
          ]
        }, 
        { id: 'polygon', label: 'Polygon', icon: Hexagon, action: () => activateGenericTool('polygon', 'Polygon Tool', 'Click center, drag. Set sides in Options.')},
        { id: 'freehand', label: 'Freehand', icon: Edit3, action: () => activateGenericTool('freehand', 'Freehand Tool', 'Click and drag to draw freehand lines.'), isWip: true },
      ]
    },
    {
      title: "Modification Tools",
      tools: [
        { id: 'pushpull', label: 'Push/Pull', icon: ChevronsUpDown, action: () => activateGenericTool('pushpull', 'Push/Pull Tool', 'Click a face and drag to extrude.') },
        { id: 'offset', label: 'Offset', icon: Copy, action: () => activateGenericTool('offset', 'Offset Tool', 'Select faces/edges then click to offset.'), isWip: true }, 
        { id: 'followme', label: 'Follow Me', icon: Target, action: () => activateGenericTool('followme', 'Follow Me Tool', 'Select path, then profile to extrude.'), isWip: true },
        { 
          id: 'intersectFaces', label: 'Intersect', icon: Combine, action: () => toggleFlyout('intersectFaces'), isWip: true,
          flyoutTools: [
            {id: 'intersectWithModel', label: 'With Model', icon: Combine, isWip: true, action: () => activateGenericTool('intersectWithModel', 'Intersect With Model', 'WIP')},
            {id: 'intersectWithSelection', label: 'With Selection', icon: Users, isWip: true, action: () => activateGenericTool('intersectWithSelection', 'Intersect With Selection', 'WIP')},
            {id: 'intersectWithContext', label: 'With Context', icon: Share2, isWip: true, action: () => activateGenericTool('intersectWithContext', 'Intersect With Context', 'WIP')},
          ]
        },
        { 
          id: 'outerShell', label: 'Solid Tools', icon: Layers, action: () => toggleFlyout('outerShell'), isWip: true, 
          flyoutTools: [
            {id: 'outerShell', label: 'Outer Shell', icon: BoxSelect, isWip: true, action: () => activateGenericTool('outerShell', 'Outer Shell', 'WIP')},
            {id: 'solidUnion', label: 'Union', icon: GitBranchPlus, isWip: true, action: () => activateGenericTool('solidUnion', 'Solid Union', 'WIP')},
            {id: 'solidSubtract', label: 'Subtract', icon: MinusSquare, isWip: true, action: () => activateGenericTool('solidSubtract', 'Solid Subtract', 'WIP')},
            {id: 'solidIntersect', label: 'Intersect', icon: Combine, isWip: true, action: () => activateGenericTool('solidIntersect', 'Solid Intersect', 'WIP')},
            {id: 'solidTrim', label: 'Trim', icon: Scissors, isWip: true, action: () => activateGenericTool('solidTrim', 'Solid Trim', 'WIP')},
          ]
        },
        { id: 'softenEdges', label: 'Soften Edges', icon: Waves, isWip: true, action: () => activateGenericTool('softenEdges', 'Soften Edges', 'WIP: Select edges, adjust angle in options.')},
      ]
    },
    {
      title: "Construction & Utilities",
      tools: [
        { id: 'tape', label: 'Measure', icon: Ruler, action: () => activateGenericTool('tape', 'Tape Measure', 'Click two points to measure.') }, 
        { id: 'protractor', label: 'Protractor', icon: DraftingCompass, isWip: true, action: () => activateGenericTool('protractor', 'Protractor Tool', 'Define origin, first axis, then measure angle.')}, 
        { id: 'dimension', label: 'Dimension', icon: SigmaSquare, isWip: true, action: () => activateGenericTool('dimension', 'Dimension Tool', 'WIP: Add linear, angular, radial dimensions.') },
        { id: 'axes', label: 'Axes', icon: Move3d, isWip: true, action: () => activateGenericTool('axes', 'Axes Tool', 'WIP: Relocate model axes.') }, 
        { id: 'sectionPlane', label: 'Section Plane', icon: Slice, isWip: true, action: () => activateGenericTool('sectionPlane', 'Section Plane Tool', 'WIP: Create section cuts.') },
        { id: 'addText', label: '3D Text', icon: TextIcon, action: handleAddTextPlaceholder },
        { id: 'paint', label: 'Paint', icon: PaintBucket, action: () => activateGenericTool('paint', 'Paint Bucket', 'Select material, then click object/face.') },
        { id: 'eraser', label: 'Eraser', icon: Eraser, action: () => activateGenericTool('eraser', 'Eraser Tool', 'Click objects to delete or hide/soften edges.') },
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
        { id: 'orbit', label: 'Orbit', icon: Orbit, isWip: true, action: () => activateGenericTool('orbit', 'Orbit Tool', 'Default mouse controls also orbit.') }, 
        { id: 'pan', label: 'Pan', icon: Hand, isWip: true, action: () => activateGenericTool('pan', 'Pan Tool', 'Hold middle mouse or select tool to pan view.') }, 
        { id: 'zoomExtents', label: 'Zoom Fit', icon: Expand, action: handleZoomExtents }, 
        { id: 'zoomWindow', label: 'Zoom Window', icon: ZoomIn, isWip: true, action: () => activateGenericTool('zoomWindow', 'Zoom Window', 'WIP: Drag a rectangle to zoom.') },
        { id: 'lookAround', label: 'Look Around', icon: LookAroundIcon, isWip: true, action: () => activateGenericTool('lookAround', 'Look Around Tool', 'WIP: Pivot camera from current viewpoint.')},
        { id: 'walk', label: 'Walk', icon: Footprints, isWip: true, action: () => activateGenericTool('walk', 'Walk Tool', 'WIP: Navigate scene with WASD-like controls.')},
      ]
    }
  ];
  
  const renderToolButton = (tool: ToolConfig, isFlyoutItem: boolean = false) => (
    <div key={tool.id} className="flex flex-col items-center relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={activeTool === tool.id ? "secondary" : "outline"}
            size="icon"
            className={`w-full flex flex-col items-center justify-center gap-1 p-1 border hover:bg-primary/20 focus:ring-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative ${isFlyoutItem ? 'h-12 text-[9px]' : 'h-14'}`}
            onClick={() => {
              if (tool.isWip) {
                  toast({title: "Work in Progress", description: `${tool.label} tool is not fully functional yet.`, duration: 2000});
                  // For WIP tools, we might still want to activate them to show their WIP tool properties
                  if (tool.id) setActiveTool(tool.id); 
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
    </div>
  );

  return (
    <AccordionItem value="item-tools" className="border-none"> 
      <AccordionContent className="p-0 space-y-1"> 
        <TooltipProvider delayDuration={100}>
          {toolCategories.map(category => (
            <div key={category.title} className="space-y-1 py-1 px-1"> 
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
