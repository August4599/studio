
"use client";
import React from 'react';
import { useScene } from '@/context/scene-context';
import type { ToolType, MeasurementUnit } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Palette, Settings2, Text, Ruler, MousePointer2, Move, RotateCcw, Maximize2, ChevronsUpDown, Eraser, Square, Minus, Circle as LucideCircle, Hexagon, Edit3, Spline, Target, Copy, Slice, Sigma, Layers, Orbit, Hand, ZoomIn, Expand, Triangle, Disc } from 'lucide-react';

const ToolPropertiesPanel: React.FC = () => {
  const { activeTool, drawingState, setDrawingState, measurementUnit, setMeasurementUnit, activePaintMaterialId, getMaterialById } = useScene();

  const renderToolOptions = () => {
    switch (activeTool) {
      case 'select':
        return (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Selection Mode (WIP)</Label>
            <Select disabled>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="New Selection" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new" className="text-xs">New Selection</SelectItem>
                <SelectItem value="add" className="text-xs">Add to Selection (Shift)</SelectItem>
                <SelectItem value="subtract" className="text-xs">Subtract from Selection (Ctrl)</SelectItem>
                <SelectItem value="intersect" className="text-xs">Intersect with Selection (Shift+Ctrl)</SelectItem>
              </SelectContent>
            </Select>
            <Label className="text-xs font-medium pt-2">Filters (WIP)</Label>
            <div className="flex items-center space-x-2">
              <Checkbox id="filter-type" disabled/><Label htmlFor="filter-type" className="text-xs font-normal text-muted-foreground">By Type</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="filter-layer" disabled/><Label htmlFor="filter-layer" className="text-xs font-normal text-muted-foreground">By Layer/Tag</Label>
            </div>
             <div className="flex items-center space-x-2">
              <Checkbox id="filter-material" disabled/><Label htmlFor="filter-material" className="text-xs font-normal text-muted-foreground">By Material</Label>
            </div>
          </div>
        );
      case 'move':
      case 'rotate':
      case 'scale':
        const toolName = activeTool.charAt(0).toUpperCase() + activeTool.slice(1);
        return (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Precise {toolName} (WIP)</Label>
            <div className="grid grid-cols-3 gap-1">
              <Input type="number" placeholder="X / Axis" className="h-7 text-xs" disabled/>
              <Input type="number" placeholder="Y / Axis" className="h-7 text-xs" disabled/>
              <Input type="number" placeholder="Z / Value" className="h-7 text-xs" disabled/>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="axis-constraint" disabled/>
                <Label htmlFor="axis-constraint" className="text-xs font-normal text-muted-foreground">Axis Constraint (X,Y,Z)</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="transform-origin" disabled/>
                <Label htmlFor="transform-origin" className="text-xs font-normal text-muted-foreground">Use Pivot Point (WIP)</Label>
            </div>
             {activeTool === 'rotate' && <div className="flex items-center space-x-2"><Checkbox id="copy-rotate" disabled/><Label htmlFor="copy-rotate" className="text-xs font-normal text-muted-foreground">Create Copies (WIP)</Label></div>}
             {activeTool === 'scale' && <div className="flex items-center space-x-2"><Checkbox id="scale-about-center" disabled/><Label htmlFor="scale-about-center" className="text-xs font-normal text-muted-foreground">Scale About Center (WIP)</Label></div>}
          </div>
        );
      case 'line':
        return (
          <div className="space-y-2">
            <Label htmlFor="line-length" className="text-xs font-medium">Length (WIP)</Label>
            <Input id="line-length" type="number" placeholder="Enter length" className="h-8 text-xs" disabled/>
            <div className="flex items-center space-x-2">
                <Checkbox id="line-angle-snap" disabled/>
                <Label htmlFor="line-angle-snap" className="text-xs font-normal text-muted-foreground">Angle Snapping (WIP)</Label>
            </div>
             <div className="flex items-center space-x-2">
                <Checkbox id="line-guide" disabled/>
                <Label htmlFor="line-guide" className="text-xs font-normal text-muted-foreground">Create Guide (WIP)</Label>
            </div>
          </div>
        );
      case 'rectangle':
      case 'rotatedRectangle':
        return (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Dimensions (WIP)</Label>
             <div className="grid grid-cols-2 gap-1">
                <Input type="number" placeholder="Width" className="h-7 text-xs" disabled/>
                <Input type="number" placeholder="Height" className="h-7 text-xs" disabled/>
            </div>
            {activeTool === 'rotatedRectangle' && (
                <>
                <Label htmlFor="rect-angle" className="text-xs font-medium">Angle (WIP)</Label>
                <Input id="rect-angle" type="number" placeholder="Rotation angle" className="h-7 text-xs" disabled/>
                </>
            )}
          </div>
        );
      case 'circle':
      case 'pie':
        return (
          <div className="space-y-2">
            <Label htmlFor="circle-radius" className="text-xs font-medium">Radius (WIP)</Label>
            <Input id="circle-radius" type="number" placeholder="Enter radius" className="h-8 text-xs" disabled/>
            <Label htmlFor="circle-segments" className="text-xs font-medium">Segments</Label>
            <Input 
                id="circle-segments" 
                type="number" 
                min="3" max="128" step="1"
                value={drawingState.polygonSides || (activeTool === 'circle' ? 32 : 24)} 
                onChange={(e) => setDrawingState({ polygonSides: parseInt(e.target.value) || (activeTool === 'circle' ? 32 : 24) })}
                className="h-8 text-xs"
            />
            {activeTool === 'pie' && (
                <>
                    <Label htmlFor="pie-start-angle" className="text-xs font-medium">Start Angle (WIP)</Label>
                    <Input id="pie-start-angle" type="number" defaultValue="0" className="h-8 text-xs" disabled/>
                    <Label htmlFor="pie-end-angle" className="text-xs font-medium">End Angle (WIP)</Label>
                    <Input id="pie-end-angle" type="number" defaultValue="360" className="h-8 text-xs" disabled/>
                </>
            )}
          </div>
        );
      case 'polygon':
        return (
          <div className="space-y-2">
            <Label htmlFor="polygon-sides" className="text-xs font-medium">Sides</Label>
            <Input
              id="polygon-sides"
              type="number"
              min="3"
              max="64"
              step="1"
              value={drawingState.polygonSides || 6}
              onChange={(e) => setDrawingState({ polygonSides: parseInt(e.target.value) || 6 })}
              className="h-8 text-xs"
            />
            <Label htmlFor="polygon-radius" className="text-xs font-medium">Radius (WIP)</Label>
            <Input id="polygon-radius" type="number" placeholder="Enter radius" className="h-8 text-xs" disabled/>
            <Label htmlFor="polygon-type" className="text-xs font-medium">Type (WIP)</Label>
             <Select disabled>
              <SelectTrigger id="polygon-type" className="h-8 text-xs"><SelectValue placeholder="Inscribed" /></SelectTrigger>
              <SelectContent><SelectItem value="inscribed" className="text-xs">Inscribed</SelectItem><SelectItem value="circumscribed" className="text-xs">Circumscribed</SelectItem></SelectContent>
            </Select>
          </div>
        );
      case 'arc':
      case 'arc2Point':
      case 'arc3Point':
        return (
            <div className="space-y-2">
                <p className="text-xs text-muted-foreground italic">Arc properties (WIP)</p>
                <Label htmlFor="arc-radius" className="text-xs font-medium">Radius (WIP)</Label>
                <Input id="arc-radius" type="number" className="h-8 text-xs" disabled/>
                <Label htmlFor="arc-segments" className="text-xs font-medium">Segments (WIP)</Label>
                <Input id="arc-segments" type="number" defaultValue="12" className="h-8 text-xs" disabled/>
            </div>
        );
      case 'freehand':
        return (
            <div className="space-y-2">
                <p className="text-xs text-muted-foreground italic">Freehand tool options (WIP)</p>
                <Label htmlFor="freehand-smoothing" className="text-xs font-medium">Smoothing (WIP)</Label>
                <Input id="freehand-smoothing" type="range" min="0" max="1" step="0.1" defaultValue="0.5" className="h-8" disabled/>
            </div>
        );
      case 'pushpull':
        return (
          <div className="space-y-2">
            <Label htmlFor="pushpull-distance" className="text-xs font-medium">Distance (WIP)</Label>
            <Input id="pushpull-distance" type="number" placeholder="Enter distance" className="h-8 text-xs" disabled/>
            <div className="flex items-center space-x-2">
                <Checkbox id="pushpull-newoffset" disabled/>
                <Label htmlFor="pushpull-newoffset" className="text-xs font-normal text-muted-foreground">Create New Offset Face (WIP)</Label>
            </div>
          </div>
        );
      case 'offset':
        return (
            <div className="space-y-2">
                <Label htmlFor="offset-distance" className="text-xs font-medium">Distance (WIP)</Label>
                <Input id="offset-distance" type="number" placeholder="Enter offset" className="h-8 text-xs" disabled/>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="offset-both-sides" disabled/>
                    <Label htmlFor="offset-both-sides" className="text-xs font-normal text-muted-foreground">Offset Both Sides (WIP)</Label>
                </div>
            </div>
        );
      case 'followme':
        return <p className="text-xs text-muted-foreground italic">Follow Me: Select path, then profile to extrude. (WIP)</p>;
      case 'intersectFaces':
      case 'outerShell': // Assuming this is for Solid Tools
        return (
            <div className="space-y-2">
                 <Label className="text-xs font-medium">Solid Tools / Intersect (WIP)</Label>
                <Select disabled>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Operation" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="union" className="text-xs">Union</SelectItem>
                    <SelectItem value="subtract" className="text-xs">Subtract</SelectItem>
                    <SelectItem value="intersect" className="text-xs">Intersect</SelectItem>
                    <SelectItem value="trim" className="text-xs">Trim</SelectItem>
                    {activeTool === 'intersectFaces' && <SelectItem value="model" className="text-xs">Intersect with Model</SelectItem>}
                    {activeTool === 'intersectFaces' && <SelectItem value="selection" className="text-xs">Intersect with Selection</SelectItem>}
                  </SelectContent>
                </Select>
            </div>
        );
      case 'tape':
        return (
          <div className="space-y-2">
            <Label htmlFor="measure-unit" className="text-xs font-medium">Units</Label>
            <Select
              value={measurementUnit}
              onValueChange={(value: MeasurementUnit) => setMeasurementUnit(value)}
            >
              <SelectTrigger id="measure-unit" className="h-8 text-xs">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="units" className="text-xs">Units (Generic)</SelectItem>
                <SelectItem value="m" className="text-xs">Meters (m)</SelectItem>
                <SelectItem value="cm" className="text-xs">Centimeters (cm)</SelectItem>
                <SelectItem value="mm" className="text-xs">Millimeters (mm)</SelectItem>
                <SelectItem value="ft" className="text-xs">Feet (ft)</SelectItem>
                <SelectItem value="in" className="text-xs">Inches (in)</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2 pt-1">
                <Checkbox id="tape-snap-endpoints" disabled/>
                <Label htmlFor="tape-snap-endpoints" className="text-xs font-normal text-muted-foreground">Snap to Endpoints/Vertices (WIP)</Label>
            </div>
             <div className="flex items-center space-x-2">
                <Checkbox id="tape-create-guides" disabled/>
                <Label htmlFor="tape-create-guides" className="text-xs font-normal text-muted-foreground">Create Guide Lines (WIP)</Label>
            </div>
          </div>
        );
      case 'protractor':
         return (
            <div className="space-y-2">
                <p className="text-xs text-muted-foreground italic">Protractor options (WIP)</p>
                <Label htmlFor="protractor-angle" className="text-xs font-medium">Angle (WIP)</Label>
                <Input id="protractor-angle" type="number" placeholder="Enter angle" className="h-8 text-xs" disabled/>
                <div className="flex items-center space-x-2">
                    <Checkbox id="protractor-guide" disabled/>
                    <Label htmlFor="protractor-guide" className="text-xs font-normal text-muted-foreground">Create Guide (WIP)</Label>
                </div>
            </div>
         );
      case 'dimension':
        return <p className="text-xs text-muted-foreground italic">Dimension Tool options (WIP: Type, Style, Precision).</p>;
      case 'axes':
        return <p className="text-xs text-muted-foreground italic">Axes Tool: Click to place origin, then define X, Y axes. (WIP)</p>;
      case 'sectionPlane':
        return (
             <div className="space-y-2">
                <p className="text-xs text-muted-foreground italic">Section Plane options (WIP)</p>
                <Label htmlFor="section-name" className="text-xs font-medium">Name (WIP)</Label>
                <Input id="section-name" placeholder="Section Name" className="h-8 text-xs" disabled/>
                <div className="flex items-center space-x-2">
                    <Checkbox id="section-active" disabled/>
                    <Label htmlFor="section-active" className="text-xs font-normal text-muted-foreground">Active Cut (WIP)</Label>
                </div>
             </div>
        );
      case 'addText':
        return (
          <div className="space-y-2">
            <Label htmlFor="text-tool-content" className="text-xs font-medium">Text Content (WIP)</Label>
            <Input id="text-tool-content" defaultValue="3D Text" className="h-8 text-xs" disabled />
            <Label htmlFor="text-tool-font" className="text-xs font-medium">Font (WIP)</Label>
            <Select disabled>
              <SelectTrigger id="text-tool-font" className="h-8 text-xs"><SelectValue placeholder="Default Font" /></SelectTrigger>
              <SelectContent><SelectItem value="default" className="text-xs">Default Font</SelectItem></SelectContent>
            </Select>
            <Label htmlFor="text-tool-size" className="text-xs font-medium">Size (WIP)</Label>
            <Input id="text-tool-size" type="number" defaultValue="1" className="h-8 text-xs" disabled />
            <Label htmlFor="text-tool-extrusion" className="text-xs font-medium">Extrusion (WIP)</Label>
            <Input id="text-tool-extrusion" type="number" defaultValue="0.1" className="h-8 text-xs" disabled />
          </div>
        );
      case 'paint':
        const selectedMaterial = activePaintMaterialId ? getMaterialById(activePaintMaterialId) : null;
        return (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Active Paint Material</Label>
            {selectedMaterial ? (
              <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                <div style={{ backgroundColor: selectedMaterial.color }} className="w-4 h-4 rounded-sm border shrink-0" />
                <span className="text-xs truncate">{selectedMaterial.name || "Unnamed Material"}</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Select a material from the Materials panel to paint with.</p>
            )}
            <Label className="text-xs font-medium">Sample Mode (WIP)</Label>
            <Select disabled>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Paint All Faces" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all" className="text-xs">All Faces of Object</SelectItem>
                    <SelectItem value="single" className="text-xs">Single Face</SelectItem>
                    <SelectItem value="connected" className="text-xs">Connected Faces (Same Material)</SelectItem>
                    <SelectItem value="same-material-object" className="text-xs">All Faces with Same Material (Object)</SelectItem>
                    <SelectItem value="same-material-scene" className="text-xs">All Faces with Same Material (Scene)</SelectItem>
                </SelectContent>
            </Select>
          </div>
        );
       case 'eraser':
        return (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Eraser Mode (WIP)</Label>
            <Select disabled>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Delete Objects" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="objects" className="text-xs">Delete Entities</SelectItem>
                    <SelectItem value="soften" className="text-xs">Soften/Smooth Edges</SelectItem>
                    <SelectItem value="hide" className="text-xs">Hide Edges/Faces</SelectItem>
                    <SelectItem value="unsoften" className="text-xs">Unsoften Edges</SelectItem>
                </SelectContent>
            </Select>
          </div>
        );
      case 'orbit':
      case 'pan':
      case 'zoomWindow':
      case 'zoomExtents':
      case 'lookAround':
      case 'walk':
        return <p className="text-xs text-muted-foreground italic text-center py-2">Navigation tools use mouse controls. Some have specific modes (WIP).</p>;
      default:
        return <p className="text-xs text-muted-foreground italic text-center py-2">No specific properties for this tool or tool not selected.</p>;
    }
  };

  // No overall title for ToolPropertiesPanel if it's a sub-section of ToolsSidebar
  // The parent ToolsSidebar will have a "Tool Options" title for this section.

  return (
    <div className="space-y-3">
      {renderToolOptions()}
    </div>
  );
};

export default ToolPropertiesPanel;
