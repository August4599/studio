
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
import { Palette, Settings2, Text, Ruler } from 'lucide-react';

const ToolPropertiesPanel: React.FC = () => {
  const { activeTool, drawingState, setDrawingState, measurementUnit, setMeasurementUnit, activePaintMaterialId, getMaterialById } = useScene();

  const renderToolOptions = () => {
    switch (activeTool) {
      case 'polygon':
        return (
          <div className="space-y-2">
            <Label htmlFor="polygon-sides" className="text-xs font-medium">Sides</Label>
            <Input
              id="polygon-sides"
              type="number"
              min="3"
              max="32"
              step="1"
              value={drawingState.polygonSides || 6}
              onChange={(e) => setDrawingState({ polygonSides: parseInt(e.target.value) || 6 })}
              className="h-8 text-xs"
            />
          </div>
        );
      case 'tape':
      case 'protractor': // Protractor might share some units or have its own angle units later
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
            {activeTool === 'tape' && (
                 <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="tape-snap-endpoints" disabled/>
                    <Label htmlFor="tape-snap-endpoints" className="text-xs font-normal text-muted-foreground">Snap to Endpoints (WIP)</Label>
                </div>
            )}
             {activeTool === 'protractor' && (
                 <p className="text-xs text-muted-foreground italic">Protractor options (WIP)</p>
            )}
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
              <SelectContent><SelectItem value="default">Default Font</SelectItem></SelectContent>
            </Select>
            <Label htmlFor="text-tool-size" className="text-xs font-medium">Size (WIP)</Label>
            <Input id="text-tool-size" type="number" defaultValue="1" className="h-8 text-xs" disabled />
          </div>
        );
      case 'paint':
        const selectedMaterial = activePaintMaterialId ? getMaterialById(activePaintMaterialId) : null;
        return (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Paint Material</Label>
            {selectedMaterial ? (
              <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                <div style={{ backgroundColor: selectedMaterial.color }} className="w-4 h-4 rounded-sm border shrink-0" />
                <span className="text-xs truncate">{selectedMaterial.name || "Unnamed Material"}</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Select a material from the Materials panel to paint with.</p>
            )}
            <p className="text-xs text-muted-foreground italic">Sample Mode (All Faces, Connected Faces - WIP)</p>
          </div>
        );
      // Add more cases for other tools with specific properties
      // e.g., Line tool: Length input, Angle input (WIP)
      // e.g., Arc tool: Radius, Segments, Start/End Angle (WIP)
      // e.g., Push/Pull: Distance input (WIP)
      default:
        return <p className="text-xs text-muted-foreground italic text-center py-2">No specific properties for this tool.</p>;
    }
  };

  const getToolIcon = () => {
    switch(activeTool) {
      case 'tape': return <Ruler size={16} className="text-primary" />;
      case 'polygon': return <Settings2 size={16} className="text-primary" />;
      case 'addText': return <Text size={16} className="text-primary" />;
      case 'paint': return <Palette size={16} className="text-primary" />;
      default: return <Settings2 size={16} className="text-muted-foreground" />;
    }
  }

  return (
    <div className="p-3 border-b">
      <div className="flex items-center gap-2 mb-2">
        {getToolIcon()}
        <h3 className="text-sm font-semibold">
          {activeTool ? `${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} Tool` : "Tool Properties"}
        </h3>
      </div>
      <div className="max-h-48 overflow-y-auto pr-1">
        {renderToolOptions()}
      </div>
    </div>
  );
};

export default ToolPropertiesPanel;
