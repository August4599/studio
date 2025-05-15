
"use client";
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Share2, SquareFunction, Palette as PaletteIcon, Image as ImageIcon, Combine, Wand2Icon, Settings, Sigma, Type, Sun, BrainCircuit, Box, Cylinder, Plane, Globe, Torus, MessageSquare, FileInput, FileOutput, Shuffle, Filter, GitCompareArrows, VenetianBlind, Waves, TextQuote, Sparkles as EffectIcon, CameraIcon, LightbulbIcon, GroupIcon } from 'lucide-react'; // Added more icons
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Inline SVG for Node Editor Icon
const NodeEditorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 opacity-80">
    <rect x="3" y="3" width="7" height="7" rx="1" ry="1"></rect>
    <rect x="14" y="3" width="7" height="7" rx="1" ry="1"></rect>
    <rect x="3" y="14" width="7" height="7" rx="1" ry="1"></rect>
    <rect x="14" y="14" width="7" height="7" rx="1" ry="1"></rect>
    <line x1="10" y1="6.5" x2="14" y2="6.5"></line>
    <line x1="6.5" y1="10" x2="6.5" y2="14"></line>
    <line x1="17.5" y1="10" x2="17.5" y2="14"></line>
    <line x1="10" y1="17.5" x2="14" y2="17.5"></line>
  </svg>
);

interface NodePlaceholderProps {
  title: string;
  color: string; 
  icon?: React.ReactNode;
  inputs?: Array<{name: string; type: string; color?: string}>; // Optional color for input type
  outputs?: Array<{name: string; type: string; color?: string}>; // Optional color for output type
  position: { top: string; left: string };
  nodeType?: 'geometry' | 'shader' | 'texture' | 'utility' | 'input' | 'output' | 'logic' | 'compositing' | 'animation';
  width?: string; 
  isGroup?: boolean; // For visual grouping of nodes
  groupLabel?: string; // Label for the group
}

const NodePlaceholder: React.FC<NodePlaceholderProps> = 
  ({ title, color, icon, inputs = [{name: 'Input', type: 'any'}], outputs = [{name: 'Output', type: 'any'}], position, nodeType = 'utility', width = "w-48", isGroup=false, groupLabel }) => (
  <div 
    className={cn(
      "absolute bg-card border rounded-lg shadow-xl text-foreground p-2.5 text-xs flex flex-col",
      `border-${color}-500/60 shadow-${color}-500/10`,
      width,
      isGroup && "border-dashed border-muted-foreground/30 bg-muted/10 p-4 pt-8" // Group styling
    )}
    style={{ top: position.top, left: position.left }}
    data-node-type={nodeType}
  >
    {isGroup && groupLabel && <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-background px-2 py-0.5 rounded-full text-muted-foreground text-[10px] border border-muted-foreground/30">{groupLabel}</div>}
    <div className={cn("font-semibold mb-2 pb-1.5 border-b flex items-center gap-2", `border-${color}-500/40 text-${color}-400`, isGroup && `text-${color}-300`)}>
      {icon || <Share2 size={14}/>} {title}
    </div>
    <div className="flex justify-between text-muted-foreground/80 flex-grow">
      {/* Inputs */}
      <div className="space-y-1.5 pr-2">
        {inputs.map((input, i) => (
            <div key={`in-${i}`} className="flex items-center">
                <div className={cn("w-2 h-2 rounded-full border mr-1.5 shrink-0", input.color ? `bg-${input.color}-500/50 border-${input.color}-500/70` : "bg-primary/50 border-primary/70")}></div>
                <span className="truncate text-[11px]" title={`${input.name} (${input.type})`}>{input.name}</span>
            </div>
        ))}
      </div>
      {/* Outputs */}
      <div className="space-y-1.5 pl-2 text-right">
        {outputs.map((output, i) => (
             <div key={`out-${i}`} className="flex items-center justify-end">
                <span className="truncate text-[11px]" title={`${output.name} (${output.type})`}>{output.name}</span>
                <div className={cn("w-2 h-2 rounded-full border ml-1.5 shrink-0", output.color ? `bg-${output.color}-500/50 border-${output.color}-500/70` : "bg-accent/50 border-accent/70")}></div>
            </div>
        ))}
      </div>
    </div>
  </div>
);

const NodeEditorPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); 

  const getNodeEditorTitle = () => "Procedural Editor (Geometry, Materials, Compositing - WIP)";
  
  const typeColors = {
    geometry: 'blue',
    shader: 'orange',
    texture: 'purple',
    color: 'pink',
    vector: 'green',
    float: 'gray', // Number
    int: 'teal',
    boolean: 'red',
    string: 'yellow',
    image: 'indigo',
    camera: 'cyan',
    light: 'lime',
    object: 'amber',
    collection: 'rose',
    any: 'slate', // Generic
  };

  return (
    <div className={cn(
      "flex-none flex flex-col bg-background border-t overflow-hidden transition-all duration-300 ease-in-out shadow-inner",
      isOpen ? "h-[40%] min-h-[300px]" : "h-12" // Increased height
    )}>
      <div 
        className="p-3 border-b bg-card/80 flex justify-between items-center h-12 cursor-pointer hover:bg-muted/30" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-base font-semibold text-foreground flex items-center">
          <NodeEditorIcon />
          {getNodeEditorTitle()}
        </h2>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7" 
          aria-label={isOpen ? "Collapse Node Editor" : "Expand Node Editor"}
        >
          {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </Button>
      </div>
      {isOpen && (
        <div className="flex-grow p-4 relative bg-muted/10 overflow-auto"> {/* Added overflow-auto */}
          {/* Group: Geometry Primitives & Inputs */}
          <NodePlaceholder isGroup={true} groupLabel="Inputs & Primitives" title="" color="slate" position={{top: '1rem', left: '1rem'}} width="w-[36rem]" />
          <NodePlaceholder title="Cube" color={typeColors.geometry} icon={<Box size={14}/>} inputs={[{name:'Size',type:'Vector', color:typeColors.vector}]} outputs={[{name:'Geometry', type:'Geometry', color:typeColors.geometry}]} position={{top: '3rem', left: '2rem'}} nodeType="input" width="w-40"/>
          <NodePlaceholder title="Sphere" color={typeColors.geometry} icon={<Globe size={14}/>} inputs={[{name:'Radius',type:'Float', color:typeColors.float}, {name:'Segments',type:'Int', color:typeColors.int}]} outputs={[{name:'Geometry', type:'Geometry', color:typeColors.geometry}]} position={{top: '3rem', left: '13rem'}} nodeType="input" width="w-44"/>
          <NodePlaceholder title="Object Info" color={typeColors.object} icon={<Settings size={14}/>} inputs={[{name:'Object', type:'Object', color:typeColors.object}]} outputs={[{name:'Location', type:'Vector', color:typeColors.vector}, {name:'Rotation', type:'Vector', color:typeColors.vector}, {name:'Scale', type:'Vector', color:typeColors.vector}, {name:'Geometry', type:'Geometry', color:typeColors.geometry}]} position={{top: '3rem', left: '26rem'}} nodeType="input" width="w-56"/>
          
           {/* Group: Geometry Operations */}
          <NodePlaceholder isGroup={true} groupLabel="Geometry Operations" title="" color="slate" position={{top: '12rem', left: '1rem'}} width="w-[36rem]" />
          <NodePlaceholder title="Transform Geometry" color={typeColors.geometry} icon={<SquareFunction size={14}/>} inputs={[{name:'Geometry', type:'Geometry', color:typeColors.geometry}, {name:'Translation', type:'Vector', color:typeColors.vector}, {name:'Rotation', type:'Vector', color:typeColors.vector}, {name:'Scale', type:'Vector', color:typeColors.vector}]} outputs={[{name:'Geometry', type:'Geometry', color:typeColors.geometry}]} position={{top: '14rem', left: '2rem'}} nodeType="geometry" width="w-60"/>
          <NodePlaceholder title="Extrude Mesh" color={typeColors.geometry} icon={<Sigma size={14}/>} inputs={[{name:'Mesh', type:'Geometry', color:typeColors.geometry}, {name:'Offset Scale', type:'Float', color:typeColors.float}]} outputs={[{name:'Mesh', type:'Geometry', color:typeColors.geometry}]} position={{top: '14rem', left: '18rem'}} nodeType="geometry" width="w-56"/>
          <NodePlaceholder title="Boolean" color={typeColors.geometry} icon={<GitCompareArrows size={14}/>} inputs={[{name:'A',type:'Geometry', color:typeColors.geometry}, {name:'B',type:'Geometry', color:typeColors.geometry}, {name:'Operation',type:'String', color:typeColors.string}]} outputs={[{name:'Result', type:'Geometry', color:typeColors.geometry}]} position={{top: '23rem', left: '2rem'}} nodeType="geometry" width="w-52"/>
          <NodePlaceholder title="Subdivision Surface" color={typeColors.geometry} icon={<VenetianBlind size={14}/>} inputs={[{name:'Mesh',type:'Geometry', color:typeColors.geometry}, {name:'Levels',type:'Int', color:typeColors.int}]} outputs={[{name:'Mesh', type:'Geometry', color:typeColors.geometry}]} position={{top: '23rem', left: '16rem'}} nodeType="geometry" width="w-60"/>


          {/* Group: Texture & Color Inputs */}
          <NodePlaceholder isGroup={true} groupLabel="Texture & Color" title="" color="slate" position={{top: '1rem', left: '40rem'}} width="w-[34rem]" />
          <NodePlaceholder title="Image Texture" color={typeColors.texture} icon={<ImageIcon size={14}/>} inputs={[{name:'Vector', type:'Vector', color:typeColors.vector}]} outputs={[{name:'Color', type:'Color', color:typeColors.color}, {name:'Alpha', type:'Float', color:typeColors.float}]} position={{top: '3rem', left: '41rem'}} nodeType="texture" width="w-52"/>
          <NodePlaceholder title="RGB Color" color={typeColors.color} icon={<PaletteIcon size={14}/>} inputs={[]} outputs={[{name:'Color', type:'Color', color:typeColors.color}]} position={{top: '3rem', left: '56rem'}} nodeType="input" width="w-40"/>
          <NodePlaceholder title="Noise Texture" color={typeColors.texture} icon={<Waves size={14}/>} inputs={[{name:'Vector', type:'Vector', color:typeColors.vector}, {name:'Scale', type:'Float', color:typeColors.float}, {name:'Detail', type:'Float', color:typeColors.float}]} outputs={[{name:'Fac', type:'Float', color:typeColors.float}, {name:'Color', type:'Color', color:typeColors.color}]} position={{top: '10rem', left: '41rem'}} nodeType="texture" width="w-60"/>
          <NodePlaceholder title="ColorRamp" color={typeColors.color} icon={<GitBranchPlus size={14}/>} inputs={[{name:'Fac', type:'Float', color:typeColors.float}]} outputs={[{name:'Color', type:'Color', color:typeColors.color}, {name:'Alpha', type:'Float', color:typeColors.float}]} position={{top: '10rem', left: '58rem'}} nodeType="utility" width="w-48"/>

          {/* Group: Shader Nodes */}
          <NodePlaceholder isGroup={true} groupLabel="Shaders" title="" color="slate" position={{top: '20rem', left: '40rem'}} width="w-[34rem]" />
          <NodePlaceholder title="Principled BSDF" color={typeColors.shader} icon={<Wand2Icon size={14}/>} 
            inputs={[
                {name:'Base Color', type:'Color', color:typeColors.color}, {name:'Metallic', type:'Float', color:typeColors.float}, {name:'Roughness', type:'Float', color:typeColors.float}, {name:'Normal', type:'Vector', color:typeColors.vector}, {name:'Emission', type:'Color', color:typeColors.color}
            ]} 
            outputs={[{name:'BSDF', type:'Shader', color:typeColors.shader}]} position={{top: '22rem', left: '41rem'}} nodeType="shader" width="w-60"/>
          <NodePlaceholder title="Mix Shader" color={typeColors.shader} icon={<Shuffle size={14}/>} inputs={[{name:'Fac', type:'Float', color:typeColors.float}, {name:'Shader 1', type:'Shader', color:typeColors.shader}, {name:'Shader 2', type:'Shader', color:typeColors.shader}]} outputs={[{name:'Shader', type:'Shader', color:typeColors.shader}]} position={{top: '32rem', left: '41rem'}} nodeType="shader" width="w-56"/>
          
          {/* Group: Outputs */}
           <NodePlaceholder isGroup={true} groupLabel="Outputs" title="" color="slate" position={{top: '1rem', left: '77rem'}} width="w-48" />
          <NodePlaceholder title="Material Output" color="red" icon={<FileOutput size={14}/>} inputs={[{name:'Surface', type:'Shader', color:typeColors.shader}, {name:'Displacement', type:'Vector', color:typeColors.vector}]} outputs={[]} position={{top: '3rem', left: '78rem'}} nodeType="output" width="w-44"/>
          <NodePlaceholder title="Geometry Output" color="green" icon={<FileOutput size={14}/>} inputs={[{name:'Geometry', type:'Geometry', color:typeColors.geometry}]} outputs={[]} position={{top: '10rem', left: '78rem'}} nodeType="output" width="w-44"/>


          {/* Placeholder Connections (simple SVG lines) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
            {/* Cube Geom -> Transform Geom */}
            <line x1="calc(2rem + 10rem + 0.5rem)" y1="calc(3rem + 2.5rem)" x2="calc(2rem + 0.5rem)" y2="calc(14rem + 1.5rem)" stroke="hsl(var(--border))" strokeWidth="1.5" />
            {/* Transform Geom -> Geometry Output */}
            <line x1="calc(18rem - 0.5rem + 15rem)" y1="calc(14rem + 2.5rem)" x2="calc(78rem + 0.5rem)" y2="calc(10rem + 1.5rem)" stroke="hsl(var(--border))" strokeWidth="1.5" />
            
            {/* Image Texture Color -> Principled BSDF Base Color */}
            <line x1="calc(41rem + 13rem + 0.5rem)" y1="calc(3rem + 1.5rem)" x2="calc(41rem + 0.5rem)" y2="calc(22rem + 1.5rem)" stroke="hsl(var(--border))" strokeWidth="1.5" />
            {/* Principled BSDF -> Material Output Surface */}
            <line x1="calc(56rem - 0.5rem + 15rem)" y1="calc(22rem + 2.5rem)" x2="calc(78rem + 0.5rem)" y2="calc(3rem + 1.5rem)" stroke="hsl(var(--border))" strokeWidth="1.5" />
            {/* Noise Fac -> ColorRamp Fac */}
             <line x1="calc(41rem + 15rem + 0.5rem)" y1="calc(10rem + 1.5rem)" x2="calc(58rem + 0.5rem)" y2="calc(10rem + 1.5rem)" stroke="hsl(var(--border))" strokeWidth="1.5" />
            {/* ColorRamp Color -> Principled BSDF Emission */}
            <line x1="calc(58rem + 12rem + 0.5rem)" y1="calc(10rem + 1.5rem)" x2="calc(41rem + 0.5rem)" y2="calc(22rem + 5.5rem)" stroke="hsl(var(--border))" strokeWidth="1.5" />

          </svg>
           <p className="absolute bottom-2 right-2 text-xs text-muted-foreground italic">Node Editor (WIP) - Visual Placeholder</p>
        </div>
      )}
    </div>
  );
};

export default NodeEditorPanel;
