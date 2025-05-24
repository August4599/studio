
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Palette, Settings2, Text, Ruler, MousePointer2, Move, RotateCcw, Maximize2, ChevronsUpDown, Eraser, Square, Minus, Circle as LucideCircle, Hexagon, Edit3, Spline, Target, Copy, Slice, Sigma, Layers, Orbit, Hand, ZoomIn, Expand, Triangle, Disc, Filter, Link, Unlink, Construction, CornerRightDown, CornerLeftUp, Eye, Sparkles, Framer, Move3d, DraftingCompass, SigmaSquare, BoxSelect, GitBranchPlus, MinusSquare, Users, Share2, Scissors, Waves, PenTool, ListFilter, EyeOff, Grid, Dot, Maximize, Minimize, SplitSquareVertical, AlignHorizontalSpaceBetween } from 'lucide-react'; // Added icons

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
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox id="select-window-crossing" disabled/>
              <Label htmlFor="select-window-crossing" className="text-xs font-normal text-muted-foreground">Window/Crossing (WIP)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="select-paint" disabled/>
              <Label htmlFor="select-paint" className="text-xs font-normal text-muted-foreground">Paint Selection (WIP)</Label>
            </div>
            <Label className="text-xs font-medium pt-2">Filters (WIP)</Label>
            <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="xs" className="h-7 text-[10px]" disabled><ListFilter size={12} className="mr-1"/> By Type</Button>
                <Button variant="outline" size="xs" className="h-7 text-[10px]" disabled><Layers size={12} className="mr-1"/> By Layer/Tag</Button>
                <Button variant="outline" size="xs" className="h-7 text-[10px]" disabled><Palette size={12} className="mr-1"/> By Material</Button>
                <Button variant="outline" size="xs" className="h-7 text-[10px]" disabled><EyeOff size={12} className="mr-1"/> By Visibility</Button>
            </div>
             <Label className="text-xs font-medium pt-2">Selection Sets (WIP)</Label>
             <Input placeholder="New selection set name..." className="h-7 text-xs" disabled/>
             <Button variant="outline" size="xs" className="w-full h-7 text-[10px]" disabled>Create Selection Set</Button>
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
                <Label htmlFor="transform-origin" className="text-xs font-normal text-muted-foreground">Use Custom Pivot (WIP)</Label>
            </div>
             {activeTool === 'rotate' && <div className="flex items-center space-x-2"><Checkbox id="copy-rotate" disabled/><Label htmlFor="copy-rotate" className="text-xs font-normal text-muted-foreground">Create Copies (WIP)</Label></div>}
             {activeTool === 'scale' && <div className="flex items-center space-x-2"><Checkbox id="scale-about-center" disabled/><Label htmlFor="scale-about-center" className="text-xs font-normal text-muted-foreground">Scale Uniformly (WIP)</Label></div>}
             <Button variant="outline" size="xs" className="w-full h-7 text-[10px]" disabled>Set Transform Origin (WIP)</Button>
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
            <Label className="text-xs font-medium">Dimensions</Label>
             <div className="grid grid-cols-2 gap-1">
                <Input 
                  type="number" 
                  placeholder="Edge 1 Length" 
                  className="h-7 text-xs" 
                  value={drawingState.rectangleWidth ?? ''}
                  onChange={(e) => setDrawingState({ rectangleWidth: parseFloat(e.target.value) || 0 })}
                />
                <Input 
                  type="number" 
                  placeholder="Edge 2 Length" 
                  className="h-7 text-xs" 
                  value={drawingState.rectangleHeight ?? ''}
                  onChange={(e) => setDrawingState({ rectangleHeight: parseFloat(e.target.value) || 0 })}
                />
            </div>
            {activeTool === 'rotatedRectangle' && (
                <>
                <Label htmlFor="rect-angle" className="text-xs font-medium">Angle (Degrees)</Label>
                <Input 
                  id="rect-angle" 
                  type="number" 
                  placeholder="Rotation angle" 
                  className="h-7 text-xs" 
                  value={drawingState.rectangleAngle ?? ''}
                  onChange={(e) => setDrawingState({ rectangleAngle: parseFloat(e.target.value) || 0 })}
                />
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
                value={drawingState.polygonSides || (activeTool === 'circle' ? 32 : 24)} // Polygon sides used for circle segment count
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
                <Label className="text-xs font-medium">Arc Properties (WIP)</Label>
                <Label htmlFor="arc-radius" className="text-xs">Radius</Label>
                <Input id="arc-radius" type="number" className="h-8 text-xs" disabled/>
                <Label htmlFor="arc-segments" className="text-xs">Segments</Label>
                <Input id="arc-segments" type="number" defaultValue="12" className="h-8 text-xs" disabled/>
                 <Label htmlFor="arc-type" className="text-xs">Arc Creation Method (WIP)</Label>
                <Select value={activeTool} onValueChange={(val) => setDrawingState({ tool: val as ToolType })} disabled>
                    <SelectTrigger id="arc-type" className="h-8 text-xs"><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="arc" className="text-xs">Center, Start, End</SelectItem>
                        <SelectItem value="arc2Point" className="text-xs">2-Point Arc</SelectItem>
                        <SelectItem value="arc3Point" className="text-xs">3-Point Arc</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        );
      case 'freehand':
        return (
            <div className="space-y-2">
                <Label className="text-xs font-medium">Freehand Options (WIP)</Label>
                <Label htmlFor="freehand-smoothing" className="text-xs">Smoothing: 0.5</Label>
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
        // Ensure drawingState includes offsetDistance, offsetAllowOverlap, offsetBothSides from scene-context
        // Values will primarily be read from drawingState when tool is active.
        // Fallback to scene context's general offset settings if needed (e.g., initial activation)
        return (
            <div className="space-y-2">
                <Label htmlFor="offset-distance" className="text-xs font-medium">Offset Distance</Label>
                <Input 
                    id="offset-distance" 
                    type="number" 
                    placeholder="Enter offset" 
                    className="h-8 text-xs" 
                    value={drawingState.offsetDistance ?? scene.offsetDistance ?? 0.1}
                    onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        scene.setOffsetDistance(isNaN(val) ? 0 : val); 
                    }}
                    step="0.01"
                />
                 <div className="flex items-center space-x-2">
                    <Checkbox 
                        id="offset-both-sides"
                        checked={drawingState.offsetBothSides ?? scene.offsetBothSides ?? false}
                        onCheckedChange={(checked) => {
                            scene.setOffsetBothSides(!!checked);
                        }}
                    />
                    <Label htmlFor="offset-both-sides" className="text-xs font-normal text-muted-foreground">Offset Both Sides</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox
                        id="offset-allow-overlap"
                        checked={drawingState.offsetAllowOverlap ?? scene.offsetAllowOverlap ?? true}
                        onCheckedChange={(checked) => {
                            scene.setOffsetAllowOverlap(!!checked);
                        }}
                    />
                    <Label htmlFor="offset-allow-overlap" className="text-xs font-normal text-muted-foreground">Allow Overlap</Label>
                </div>
            </div>
        );
      case 'followme':
        return (
          <div className='space-y-1'>
            <Label className="text-xs font-medium">Follow Me (WIP)</Label>
            <Button variant="outline" size="xs" className="w-full h-7 text-[10px]" disabled><Spline size={12} className="mr-1"/> Pick Path</Button>
            <Button variant="outline" size="xs" className="w-full h-7 text-[10px]" disabled><Square size={12} className="mr-1"/> Pick Profile</Button>
          </div>
        );
      case 'intersectFaces':
      case 'intersectWithModel':
      case 'intersectWithSelection':
      case 'intersectWithContext':
        return (
          <div className='space-y-2'>
            <Label className="text-xs font-medium">Intersect Faces (WIP)</Label>
            <RadioGroup defaultValue={activeTool === 'intersectWithModel' ? 'model' : activeTool === 'intersectWithSelection' ? 'selection' : 'context'} disabled className="text-xs">
              <div className="flex items-center space-x-2"><RadioGroupItem value="model" id="int-model"/><Label htmlFor="int-model" className="font-normal">With Model</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="selection" id="int-selection"/><Label htmlFor="int-selection" className="font-normal">With Selection</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="context" id="int-context"/><Label htmlFor="int-context" className="font-normal">With Context (All)</Label></div>
            </RadioGroup>
          </div>
        );
      case 'outerShell': 
      case 'solidUnion':
      case 'solidSubtract':
      case 'solidIntersect':
      case 'solidTrim':
        let currentSolidOp = activeTool === 'outerShell' ? 'outerShell' : 
                             activeTool === 'solidUnion' ? 'union' :
                             activeTool === 'solidSubtract' ? 'subtract' :
                             activeTool === 'solidIntersect' ? 'intersect' : 'trim';
        return (
            <div className="space-y-2">
                 <Label className="text-xs font-medium">Solid Tools (WIP)</Label>
                <Select value={currentSolidOp} disabled>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outerShell" className="text-xs flex items-center gap-1"><BoxSelect size={12}/> Outer Shell</SelectItem>
                    <SelectItem value="union" className="text-xs flex items-center gap-1"><GitBranchPlus size={12}/> Union</SelectItem>
                    <SelectItem value="subtract" className="text-xs flex items-center gap-1"><MinusSquare size={12}/> Subtract</SelectItem>
                    <SelectItem value="intersect" className="text-xs flex items-center gap-1"><Combine size={12}/> Intersect</SelectItem>
                    <SelectItem value="trim" className="text-xs flex items-center gap-1"><Scissors size={12}/> Trim</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground italic">Select multiple solid groups/components to perform operations.</p>
            </div>
        );
      case 'softenEdges':
          return (
            <div className="space-y-2">
                <Label className="text-xs font-medium">Soften/Smooth Edges</Label>
                <Label htmlFor="soften-angle" className="text-xs">Angle: {drawingState.softenEdgesAngle ?? 20}°</Label>
                <Input 
                  id="soften-angle" 
                  type="range" 
                  min="0" 
                  max="180" 
                  step="1" 
                  value={drawingState.softenEdgesAngle ?? 20} 
                  onChange={(e) => setDrawingState({ softenEdgesAngle: parseInt(e.target.value) || 0 })}
                  className="h-8"
                />
                <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="soften-coplanar" 
                      checked={drawingState.softenCoplanar ?? true}
                      onCheckedChange={(checked) => setDrawingState({ softenCoplanar: !!checked })}
                    />
                    <Label htmlFor="soften-coplanar" className="text-xs font-normal text-muted-foreground">Soften Coplanar</Label>
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
            <Label className="text-xs font-medium pt-1">Snapping (WIP)</Label>
            <div className="grid grid-cols-2 gap-1">
                <div className="flex items-center space-x-1"><Checkbox id="snap-vertex" disabled/><Label htmlFor="snap-vertex" className="text-xs font-normal text-muted-foreground"><Dot size={10} className="inline"/> Vertex</Label></div>
                <div className="flex items-center space-x-1"><Checkbox id="snap-edge" disabled/><Label htmlFor="snap-edge" className="text-xs font-normal text-muted-foreground"><Minus size={10} className="inline"/> Edge</Label></div>
                <div className="flex items-center space-x-1"><Checkbox id="snap-face" disabled/><Label htmlFor="snap-face" className="text-xs font-normal text-muted-foreground"><Square size={10} className="inline"/> Face</Label></div>
                <div className="flex items-center space-x-1"><Checkbox id="snap-midpoint" disabled/><Label htmlFor="snap-midpoint" className="text-xs font-normal text-muted-foreground"><SplitSquareVertical size={10} className="inline"/> Midpoint</Label></div>
                <div className="flex items-center space-x-1"><Checkbox id="snap-perpendicular" disabled/><Label htmlFor="snap-perpendicular" className="text-xs font-normal text-muted-foreground"><CornerRightDown size={10} className="inline"/> Perp.</Label></div>
                <div className="flex items-center space-x-1"><Checkbox id="snap-parallel" disabled/><Label htmlFor="snap-parallel" className="text-xs font-normal text-muted-foreground"><AlignHorizontalSpaceBetween size={10} className="inline"/> Parallel</Label></div>
                <div className="flex items-center space-x-1"><Checkbox id="snap-grid" disabled/><Label htmlFor="snap-grid" className="text-xs font-normal text-muted-foreground"><Grid size={10} className="inline"/> Grid</Label></div>
                <div className="flex items-center space-x-1"><Checkbox id="snap-increment" disabled/><Label htmlFor="snap-increment" className="text-xs font-normal text-muted-foreground"><Maximize size={10} className="inline"/> Increment</Label></div>
                 <div className="flex items-center space-x-1"><Checkbox id="snap-extension" disabled/><Label htmlFor="snap-extension" className="text-xs font-normal text-muted-foreground"><Spline size={10} className="inline"/> Extension</Label></div>
            </div>
             <div className="flex items-center space-x-2 pt-1">
                <Checkbox id="tape-create-guides" disabled/>
                <Label htmlFor="tape-create-guides" className="text-xs font-normal text-muted-foreground">Create Guide Lines (WIP)</Label>
            </div>
          </div>
        );
      case 'protractor':
         return (
            <div className="space-y-2">
                <Label className="text-xs font-medium">Protractor Options (WIP)</Label>
                <Label htmlFor="protractor-angle" className="text-xs">Angle</Label>
                <Input id="protractor-angle" type="number" placeholder="Enter angle" className="h-8 text-xs" disabled/>
                <div className="flex items-center space-x-2">
                    <Checkbox id="protractor-guide" disabled/>
                    <Label htmlFor="protractor-guide" className="text-xs font-normal text-muted-foreground">Create Guide (WIP)</Label>
                </div>
            </div>
         );
      case 'dimension':
        return (
            <div className="space-y-2">
                <Label className="text-xs font-medium">Dimension Tool (WIP)</Label>
                <Select disabled>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Linear Dimension" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="linear" className="text-xs">Linear</SelectItem>
                        <SelectItem value="aligned" className="text-xs">Aligned</SelectItem>
                        <SelectItem value="angular" className="text-xs">Angular</SelectItem>
                        <SelectItem value="radial" className="text-xs">Radial/Diameter</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" size="xs" className="w-full h-7 text-[10px]" disabled>Dimension Style Settings...</Button>
            </div>
        );
      case 'axes':
        return (
            <div className="space-y-2">
                <Label className="text-xs font-medium">Axes Tool (WIP)</Label>
                <p className="text-xs text-muted-foreground italic">Click to place origin, then define X, Y axes to relocate model axes.</p>
                <Button variant="outline" size="xs" className="w-full h-7 text-[10px]" disabled>Reset Axes</Button>
            </div>
        );
      case 'sectionPlane':
        return (
             <div className="space-y-2">
                <Label className="text-xs font-medium">Section Plane (WIP)</Label>
                <Label htmlFor="section-name" className="text-xs">Name</Label>
                <Input id="section-name" placeholder="Section Name" className="h-8 text-xs" disabled/>
                <div className="flex items-center space-x-2">
                    <Checkbox id="section-active" disabled/>
                    <Label htmlFor="section-active" className="text-xs font-normal text-muted-foreground">Active Cut</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="section-fill" disabled/>
                    <Label htmlFor="section-fill" className="text-xs font-normal text-muted-foreground">Display Section Fill</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="section-lines" disabled/>
                    <Label htmlFor="section-lines" className="text-xs font-normal text-muted-foreground">Display Section Lines</Label>
                </div>
                <Button variant="outline" size="xs" className="w-full h-7 text-[10px]" disabled>Align View to Section</Button>
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
                </SelectContent>
            </Select>
             <Button variant="outline" size="xs" className="w-full h-7 text-[10px]" disabled><Sparkles size={12} className="mr-1"/> Sample Material (Eyedropper - WIP)</Button>
          </div>
        );
       case 'eraser':
        return (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Eraser Mode (WIP)</Label>
            <Select disabled>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Delete Entities" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="objects" className="text-xs">Delete Entities</SelectItem>
                    <SelectItem value="soften" className="text-xs">Soften/Smooth Edges</SelectItem>
                    <SelectItem value="hide" className="text-xs">Hide Edges/Faces</SelectItem>
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
        return <p className="text-xs text-muted-foreground italic text-center py-2">Navigation tool selected. Use mouse controls in the viewport.</p>;
      default:
        return <p className="text-xs text-muted-foreground italic text-center py-2">No specific properties for this tool or no tool selected.</p>;
    }
  };

  return (
    <div className="space-y-3 p-1"> 
      {renderToolOptions()}
    </div>
  );
};

export default ToolPropertiesPanel;

