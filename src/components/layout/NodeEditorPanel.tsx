
"use client";
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Share2, SquareFunction, Palette as PaletteIcon, Image as ImageIcon, Combine, Wand2Icon, Settings, Sigma, Type, Sun } from 'lucide-react'; // Added more icons
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
  color: string; // Tailwind color class prefix e.g., 'green', 'blue'
  icon?: React.ReactNode;
  inputs?: Array<{name: string; type: string}>;
  outputs?: Array<{name: string; type: string}>;
  position: { top: string; left: string };
  nodeType?: 'geometry' | 'shader' | 'texture' | 'utility' | 'input' | 'output';
  width?: string; // e.g. 'w-48'
}

const NodePlaceholder: React.FC<NodePlaceholderProps> = 
  ({ title, color, icon, inputs = [{name: 'Input', type: 'any'}], outputs = [{name: 'Output', type: 'any'}], position, nodeType = 'utility', width = "w-48" }) => (
  <div 
    className={cn(
      "absolute bg-card border rounded-lg shadow-xl text-foreground p-2.5 text-xs flex flex-col",
      `border-${color}-500/60 shadow-${color}-500/10`, // More subtle shadow
      width
    )}
    style={{ top: position.top, left: position.left }}
    data-node-type={nodeType}
  >
    <div className={cn("font-semibold mb-2 pb-1.5 border-b flex items-center gap-2", `border-${color}-500/40 text-${color}-400`)}>
      {icon || <Share2 size={14}/>} {title}
    </div>
    <div className="flex justify-between text-muted-foreground/80 flex-grow">
      {/* Inputs */}
      <div className="space-y-1.5 pr-2">
        {inputs.map((input, i) => (
            <div key={`in-${i}`} className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-primary/50 border border-primary/70 mr-1.5 shrink-0"></div>
                <span className="truncate text-[11px]" title={`${input.name} (${input.type})`}>{input.name}</span>
            </div>
        ))}
      </div>
      {/* Outputs */}
      <div className="space-y-1.5 pl-2 text-right">
        {outputs.map((output, i) => (
             <div key={`out-${i}`} className="flex items-center justify-end">
                <span className="truncate text-[11px]" title={`${output.name} (${output.type})`}>{output.name}</span>
                <div className="w-2 h-2 rounded-full bg-accent/50 border border-accent/70 ml-1.5 shrink-0"></div>
            </div>
        ))}
      </div>
    </div>
  </div>
);

const NodeEditorPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); // Default to closed

  const getNodeEditorTitle = () => "Procedural Editor (Geometry & Materials - WIP)";
  
  return (
    <div className={cn(
      "flex-none flex flex-col bg-background border-t overflow-hidden transition-all duration-300 ease-in-out shadow-inner",
      isOpen ? "h-[35%] min-h-[250px]" : "h-12"
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
        <div className="flex-grow p-4 relative bg-muted/10 overflow-auto">
          {/* Input Nodes */}
          <NodePlaceholder title="Geometry Input" color="green" icon={<Combine size={14}/>} inputs={[]} outputs={[{name:'Geometry', type:'Geometry'}]} position={{top: '2rem', left: '2rem'}} nodeType="input" />
          <NodePlaceholder title="Object Info" color="blue" icon={<Settings size={14}/>} inputs={[]} outputs={[{name:'Location', type:'Vector'}, {name:'Rotation', type:'Vector'}, {name:'Scale', type:'Vector'}]} position={{top: '10rem', left: '2rem'}} nodeType="input" width="w-52"/>
          <NodePlaceholder title="Image Texture" color="purple" icon={<ImageIcon size={14}/>} inputs={[{name:'UV', type:'Vector'}]} outputs={[{name:'Color', type:'Color'}, {name:'Alpha', type:'Float'}]} position={{top: '18rem', left: '2rem'}} nodeType="texture" width="w-56"/>
          <NodePlaceholder title="RGB Color" color="pink" icon={<PaletteIcon size={14}/>} inputs={[]} outputs={[{name:'Color', type:'Color'}]} position={{top: '26rem', left: '2rem'}} nodeType="input"/>
          <NodePlaceholder title="Value" color="gray" icon={<Type size={14}/>} inputs={[]} outputs={[{name:'Value', type:'Float'}]} position={{top: '32rem', left: '2rem'}} nodeType="input"/>


          {/* Geometry Nodes */}
          <NodePlaceholder title="Transform Geometry" color="blue" icon={<SquareFunction size={14}/>} inputs={[{name:'Geometry', type:'Geometry'}, {name:'Translation', type:'Vector'}, {name:'Rotation', type:'Vector'}, {name:'Scale', type:'Vector'}]} outputs={[{name:'Geometry', type:'Geometry'}]} position={{top: '4rem', left: '20rem'}} nodeType="geometry" width="w-60"/>
          <NodePlaceholder title="Extrude Mesh" color="blue" icon={<Sigma size={14}/>} inputs={[{name:'Mesh', type:'Geometry'}, {name:'Offset Scale', type:'Float'}]} outputs={[{name:'Mesh', type:'Geometry'}]} position={{top: '14rem', left: '20rem'}} nodeType="geometry" width="w-56"/>

          {/* Shader Nodes */}
          <NodePlaceholder title="Principled BSDF" color="orange" icon={<Wand2Icon size={14}/>} 
            inputs={[
                {name:'Base Color', type:'Color'}, {name:'Metallic', type:'Float'}, {name:'Roughness', type:'Float'}, {name:'Normal', type:'Vector'}, {name:'Emission', type:'Color'}
            ]} 
            outputs={[{name:'BSDF', type:'Shader'}]} position={{top: '10rem', left: '40rem'}} nodeType="shader" width="w-60"/>
          <NodePlaceholder title="Mix Shader" color="yellow" icon={<Share2 size={14}/>} inputs={[{name:'Factor', type:'Float'}, {name:'Shader 1', type:'Shader'}, {name:'Shader 2', type:'Shader'}]} outputs={[{name:'Shader', type:'Shader'}]} position={{top: '22rem', left: '40rem'}} nodeType="shader" width="w-56"/>
          
          {/* Output Nodes */}
          <NodePlaceholder title="Material Output" color="red" icon={<PaletteIcon size={14}/>} inputs={[{name:'Surface', type:'Shader'}, {name:'Displacement', type:'Vector'}]} outputs={[]} position={{top: '16rem', left: '60rem'}} nodeType="output"/>
          <NodePlaceholder title="Scene Output" color="teal" icon={<Sun size={14}/>} inputs={[{name:'Geometry', type:'Geometry'}]} outputs={[]} position={{top: '6rem', left: '60rem'}} nodeType="output"/>


          {/* Placeholder Connections (simple SVG lines) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
            {/* Geom Input -> Transform Geom */}
            <line x1="calc(2rem + 12rem)" y1="calc(2rem + 2.5rem)" x2="calc(20rem + 0.5rem)" y2="calc(4rem + 1.5rem)" stroke="hsl(var(--border))" strokeWidth="1.5" />
            {/* Transform Geom -> Scene Output */}
            <line x1="calc(20rem + 15rem)" y1="calc(4rem + 2.5rem)" x2="calc(60rem + 0.5rem)" y2="calc(6rem + 1.5rem)" stroke="hsl(var(--border))" strokeWidth="1.5" />
            
            {/* Image Texture -> Principled BSDF (Base Color) */}
            <line x1="calc(2rem + 14rem)" y1="calc(18rem + 1.5rem)" x2="calc(40rem + 0.5rem)" y2="calc(10rem + 1.5rem)" stroke="hsl(var(--border))" strokeWidth="1.5" />
            {/* Principled BSDF -> Material Output */}
            <line x1="calc(40rem + 15rem)" y1="calc(10rem + 2.5rem)" x2="calc(60rem + 0.5rem)" y2="calc(16rem + 1.5rem)" stroke="hsl(var(--border))" strokeWidth="1.5" />
             {/* RGB Color -> Principled BSDF (Emission) */}
            <line x1="calc(2rem + 12rem)" y1="calc(26rem + 1.5rem)" x2="calc(40rem + 0.5rem)" y2="calc(10rem + 5.5rem)" stroke="hsl(var(--border))" strokeWidth="1.5" />
          </svg>
           <p className="absolute bottom-2 right-2 text-xs text-muted-foreground italic">Node Editor (WIP) - Visual Placeholder</p>
        </div>
      )}
    </div>
  );
};

export default NodeEditorPanel;
