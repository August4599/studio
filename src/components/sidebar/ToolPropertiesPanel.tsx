
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
import { Palette, Settings2, Text, Ruler, MousePointer2, Move, RotateCcw, Maximize2, ChevronsUpDown, Eraser, Square, Minus, Circle as LucideCircle, Hexagon, Edit3, Spline } from 'lucide-react';

const ToolPropertiesPanel: React.FC = () => {
  const { activeTool, drawingState, setDrawingState, measurementUnit, setMeasurementUnit, activePaintMaterialId, getMaterialById } = useScene();

  const renderToolOptions = () => {
    switch (activeTool) {
      case 'select':
        return (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground italic">Selection Filters (WIP)</p>
            <div className="flex items-center space-x-2">
              <Checkbox id="filter-type" disabled/>
              <Label htmlFor="filter-type" className="text-xs font-normal text-muted-foreground">Filter by Type</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="filter-layer" disabled/>
              <Label htmlFor="filter-layer" className="text-xs font-normal text-muted-foreground">Filter by Layer/Tag</Label>
            </div>
          </div>
        );
      case 'move':
      case 'rotate':
      case 'scale':
        return (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Precise Transform (WIP)</Label>
            <div className="grid grid-cols-3 gap-1">
              <Input type="number" placeholder="X" className="h-7 text-xs" disabled/>
              <Input type="number" placeholder="Y" className="h-7 text-xs" disabled/>
              <Input type="number" placeholder="Z" className="h-7 text-xs" disabled/>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="axis-constraint" disabled/>
                <Label htmlFor="axis-constraint" className="text-xs font-normal text-muted-foreground">Axis Constraint (X,Y,Z keys)</Label>
            </div>
          </div>
        );
      case 'line':
        return (
          <div className="space-y-2">
            <Label htmlFor="line-length" className="text-xs font-medium">Length (WIP)</Label>
            <Input id="line-length" type="number" placeholder="Enter length" className="h-8 text-xs" disabled/>
            <div className="flex items-center space-x-2">
                <Checkbox id="line-angle-snap" disabled/>
                <Label htmlFor="line-angle-snap" className="text-xs font-normal text-muted-foreground">Angle Snapping</Label>
            </div>
          </div>
        );
      case 'rectangle':
        return (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Dimensions (WIP)</Label>
             <div className="grid grid-cols-2 gap-1">
                <Input type="number" placeholder="Width" className="h-7 text-xs" disabled/>
                <Input type="number" placeholder="Height" className="h-7 text-xs" disabled/>
            </div>
          </div>
        );
      case 'circle':
        return (
          <div className="space-y-2">
            <Label htmlFor="circle-radius" className="text-xs font-medium">Radius (WIP)</Label>
            <Input id="circle-radius" type="number" placeholder="Enter radius" className="h-8 text-xs" disabled/>
            <Label htmlFor="circle-segments" className="text-xs font-medium">Segments (WIP)</Label>
            <Input id="circle-segments" type="number" defaultValue="32" className="h-8 text-xs" disabled/>
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
              max="64" // Increased max
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
        return <p className="text-xs text-muted-foreground italic">Arc properties (WIP: Center, Radius, Start/End Angle, Segments).</p>;
      case 'freehand':
        return <p className="text-xs text-muted-foreground italic">Freehand tool options (WIP: Smoothing).</p>;
      case 'pushpull':
        return (
          <div className="space-y-2">
            <Label htmlFor="pushpull-distance" className="text-xs font-medium">Distance (WIP)</Label>
            <Input id="pushpull-distance" type="number" placeholder="Enter distance" className="h-8 text-xs" disabled/>
            <div className="flex items-center space-x-2">
                <Checkbox id="pushpull-newoffset" disabled/>
                <Label htmlFor="pushpull-newoffset" className="text-xs font-normal text-muted-foreground">Create New Offset Face</Label>
            </div>
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
         return <p className="text-xs text-muted-foreground italic">Protractor options (WIP: Angle display, Guide creation).</p>;
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
                    <SelectItem value="all" className="text-xs">All Faces</SelectItem>
                    <SelectItem value="connected" className="text-xs">Connected Faces</SelectItem>
                    <SelectItem value="same-material" className="text-xs">Faces with Same Material</SelectItem>
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
                    <SelectItem value="objects" className="text-xs">Delete Objects</SelectItem>
                    <SelectItem value="edges" className="text-xs">Soften/Smooth Edges</SelectItem>
                    <SelectItem value="hide-edges" className="text-xs">Hide Edges</SelectItem>
                </SelectContent>
            </Select>
          </div>
        );
      default:
        return <p className="text-xs text-muted-foreground italic text-center py-2">No specific properties for this tool.</p>;
    }
  };

  const getToolIconAndName = () => {
    let icon = <Settings2 size={16} className="text-muted-foreground" />;
    let name = "Tool Properties";

    if(activeTool) {
        name = `${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} Tool`;
        switch(activeTool) {
            case 'select': icon = <MousePointer2 size={16} className="text-primary"/>; break;
            case 'move': icon = <Move size={16} className="text-primary"/>; break;
            case 'rotate': icon = <RotateCcw size={16} className="text-primary"/>; break;
            case 'scale': icon = <Maximize2 size={16} className="text-primary"/>; break;
            case 'line': icon = <Minus size={16} className="text-primary"/>; break;
            case 'rectangle': icon = <Square size={16} className="text-primary"/>; break;
            case 'circle': icon = <LucideCircle size={16} className="text-primary"/>; break;
            case 'polygon': icon = <Hexagon size={16} className="text-primary"/>; break;
            case 'arc': icon = <Spline size={16} className="text-primary"/>; break;
            case 'freehand': icon = <Edit3 size={16} className="text-primary"/>; break;
            case 'pushpull': icon = <ChevronsUpDown size={16} className="text-primary"/>; break;
            case 'tape': icon = <Ruler size={16} className="text-primary" />; break;
            case 'addText': icon = <Text size={16} className="text-primary" />; break;
            case 'paint': icon = <Palette size={16} className="text-primary" />; break;
            case 'eraser': icon = <Eraser size={16} className="text-primary" />; break;
            default: icon = <Settings2 size={16} className="text-primary"/>; break;
        }
    }
    return { icon, name };
  }

  const { icon, name } = getToolIconAndName();

  return (
    <div className="p-3 border-b">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-sm font-semibold">
          {name}
        </h3>
      </div>
      <div className="max-h-60 overflow-y-auto pr-1 space-y-3"> {/* Added space-y-3 */}
        {renderToolOptions()}
      </div>
    </div>
  );
};

export default ToolPropertiesPanel;
