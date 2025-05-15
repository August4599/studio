
"use client";
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Share2, SquareFunction, Palette as PaletteIcon, Image as ImageIcon, Combine, Wand2Icon } from 'lucide-react';
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

const NodePlaceholder: React.FC<{ title: string; color: string; icon?: React.ReactNode; inputs?: number; outputs?: number; position: { top: string; left: string } }> = 
  ({ title, color, icon, inputs = 1, outputs = 1, position }) => (
  <div 
    className={cn(
      "absolute w-40 bg-card border rounded-md shadow-lg text-foreground p-2 text-xs",
      `border-${color}-500/50`
    )}
    style={{ top: position.top, left: position.left }}
  >
    <div className={cn("font-semibold mb-1 pb-1 border-b flex items-center gap-1.5", `border-${color}-500/30 text-${color}-400`)}>
      {icon || <Share2 size={12}/>} {title}
    </div>
    <div className="flex justify-between text-muted-foreground">
      <div>{Array.from({length: inputs}).map((_, i) => <div key={i} className="my-1">Input {i+1} &bull;</div>)}</div>
      <div className="text-right">{Array.from({length: outputs}).map((_, i) => <div key={i} className="my-1">&bull; Output {i+1}</div>)}</div>
    </div>
  </div>
);

const NodeEditorPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const getNodeEditorTitle = () => "Procedural Editor (Geometry & Materials)";
  
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
          {/* Placeholder Nodes Visual */}
          <NodePlaceholder title="Geometry Input" color="green" icon={<Combine size={12}/>} inputs={0} outputs={1} position={{top: '2rem', left: '2rem'}} />
          <NodePlaceholder title="Transform" color="blue" icon={<SquareFunction size={12}/>} inputs={2} outputs={1} position={{top: '6rem', left: '16rem'}} />
          <NodePlaceholder title="Image Texture" color="purple" icon={<ImageIcon size={12}/>} inputs={1} outputs={1} position={{top: '14rem', left: '2rem'}} />
          <NodePlaceholder title="Principled BSDF" color="orange" icon={<Wand2Icon size={12}/>} inputs={5} outputs={1} position={{top: '10rem', left: '30rem'}} />
          <NodePlaceholder title="Material Output" color="red" icon={<PaletteIcon size={12}/>} inputs={1} outputs={0} position={{top: '8rem', left: '44rem'}} />

          {/* Placeholder Connections (simple SVG lines) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
            {/* Geom Input -> Transform */}
            <line x1="calc(2rem + 10rem)" y1="calc(2rem + 1.5rem)" x2="calc(16rem + 0.5rem)" y2="calc(6rem + 1.5rem)" stroke="hsl(var(--border))" strokeWidth="2" />
            {/* Transform -> Material Output (as Geometry) */}
            {/* <line x1="calc(16rem + 10rem)" y1="calc(6rem + 1.5rem)" x2="calc(44rem + 0.5rem)" y2="calc(8rem + 1.5rem)" stroke="hsl(var(--border))" strokeWidth="2" /> */}
            {/* Image Texture -> Principled BSDF */}
            <line x1="calc(2rem + 10rem)" y1="calc(14rem + 1.5rem)" x2="calc(30rem + 0.5rem)" y2="calc(10rem + 2.5rem)" stroke="hsl(var(--border))" strokeWidth="2" />
            {/* Principled BSDF -> Material Output */}
            <line x1="calc(30rem + 10rem)" y1="calc(10rem + 1.5rem)" x2="calc(44rem + 0.5rem)" y2="calc(8rem + 1.5rem)" stroke="hsl(var(--border))" strokeWidth="2" />
          </svg>
           <p className="absolute bottom-2 right-2 text-xs text-muted-foreground italic">Node Editor (WIP) - Visual Placeholder</p>
        </div>
      )}
    </div>
  );
};

export default NodeEditorPanel;
