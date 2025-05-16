
"use client";
import React from 'react';
import { ChevronDown, ChevronUp, Share2, SquareFunction, Palette as PaletteIcon, Image as ImageIcon, Combine, Wand2Icon, Settings, Sigma, Type, Sun, BrainCircuit, Box, Cylinder, Plane, Globe, Torus, MessageSquare, FileInput, FileOutput, Shuffle, Filter, GitCompareArrows, Layers, GitBranchPlus, AlignHorizontalSpaceAround, Blend, Cog, Cpu, Database, DownloadCloud, FunctionSquare, GitFork, ListFilter, Network, Puzzle, Rows, SigmaSquare, SlidersHorizontal, Variable, Zap, Anchor, Atom, BarChart, Bold, Bot, CircleDot, CloudCog, Code2, Coins, Component, ConciergeBell, Copyleft, Crop, Crosshair, Dices, Diff, Disc2, Disc3, Donut, DraftingCompass, Eraser, ExpandIcon, ExternalLinkIcon, Fingerprint, Frame, Gem, GitCommit, GitMerge, GitPullRequest, GitPullRequestClosed, GitPullRequestDraft, HardDrive, Hash, Heading1, Heading2, HelpCircle, Highlighter, History, Hourglass, Indent, InfoIcon, Italic, IterationCcw, IterationCw, KanbanSquare, KeySquare, Languages, LayoutDashboard, Link2, ListChecks, ListMinus, ListOrdered, ListPlus, ListTree, LogIn, LogOutIcon, Mail, MapPinIcon, Maximize, MenuSquare, Mic2, Minimize, MinusSquare, MoonStar, MousePointerClick, Music2, Navigation2, Option, PackageCheck, Percent, PilcrowSquare, PlayCircle, Podcast, Pointer, QuoteIcon, Rat, RectangleHorizontal, Repeat, Route, Rss, RulerIcon, Scaling, ScatterChart, SearchCode, ServerCog, ShapesIcon, ShieldAlert, ShoppingBasket, Snowflake, SortAsc, SortDesc, SpellCheck, SquareCode, StarHalf, Strikethrough, Subscript, Superscript, SwissFranc, Table2, TagIcon, TerminalSquare, TextCursorInput, TextSelect, ThermometerIcon, ThumbsDown, ThumbsUp, ToggleLeftIcon, ToggleRightIcon, Tool, TreesIcon, UnderlineIcon, UnfoldHorizontal, UnfoldVertical, Unlink2, UploadCloudIcon, Volume1, Volume2, VolumeX, Wallet, Webcam, Wifi, WindIcon, Wrench, YoutubeIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
  inputs?: Array<{name: string; type: string; color?: string}>; 
  outputs?: Array<{name: string; type: string; color?: string}>; 
  position: { top: string; left: string };
  nodeType?: 'input' | 'output' | 'geometry' | 'shader' | 'texture' | 'color' | 'vector' | 'converter' | 'utility' | 'group' | 'layout';
  width?: string; 
  isGroup?: boolean; 
  groupLabel?: string; 
}

const NodePlaceholder: React.FC<NodePlaceholderProps> = 
  ({ title, color, icon, inputs = [{name: 'Input', type: 'any'}], outputs = [{name: 'Output', type: 'any'}], position, nodeType = 'utility', width = "w-48", isGroup=false, groupLabel }) => {
  const nodeTypeColorClass = `border-${color}-500/60 shadow-${color}-500/10`;
  const nodeCategoryColor = 
    nodeType === 'input' ? 'bg-sky-500/20 border-sky-500/50' :
    nodeType === 'output' ? 'bg-rose-500/20 border-rose-500/50' :
    nodeType === 'geometry' ? 'bg-green-500/20 border-green-500/50' :
    nodeType === 'shader' ? 'bg-amber-500/20 border-amber-500/50' :
    nodeType === 'texture' ? 'bg-purple-500/20 border-purple-500/50' :
    nodeType === 'color' ? 'bg-pink-500/20 border-pink-500/50' :
    nodeType === 'vector' ? 'bg-teal-500/20 border-teal-500/50' :
    nodeType === 'converter' ? 'bg-cyan-500/20 border-cyan-500/50' :
    'bg-slate-500/20 border-slate-500/50';
  
  return (
  <div 
    className={cn(
      "absolute bg-card border rounded-lg shadow-xl text-foreground p-2.5 text-xs flex flex-col",
      nodeTypeColorClass,
      width,
      isGroup && "border-dashed border-muted-foreground/30 bg-muted/10 p-4 pt-8" 
    )}
    style={{ top: position.top, left: position.left }}
    data-node-type={nodeType}
  >
    {isGroup && groupLabel && <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-background px-2 py-0.5 rounded-full text-muted-foreground text-[10px] border border-muted-foreground/30">{groupLabel}</div>}
    <div className={cn("font-semibold mb-2 pb-1.5 border-b flex items-center gap-2", `border-${color}-500/40 text-${color}-400`, isGroup && `text-${color}-300`, nodeCategoryColor, "px-2 py-1 -mx-2.5 -mt-2.5 rounded-t-md")}>
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
};

interface NodeEditorPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

const NodeEditorPanel: React.FC<NodeEditorPanelProps> = ({ isOpen, onToggle }) => {
  const getNodeEditorTitle = () => "Procedural Editor (Geometry, Materials, Compositing - WIP)";
  
  const typeColors = {
    geometry: 'green',
    shader: 'amber',
    texture: 'purple',
    color: 'pink',
    vector: 'teal',
    float: 'slate', 
    int: 'blue',
    boolean: 'red',
    string: 'yellow',
    image: 'indigo',
    camera: 'cyan',
    light: 'lime',
    object: 'orange',
    collection: 'rose',
    any: 'gray', 
    converter: 'cyan',
    utility: 'gray',
    input: 'sky',
    output: 'rose',
  };

  return (
    <div className={cn(
      "flex-none flex flex-col bg-background border-t overflow-hidden transition-all duration-300 ease-in-out shadow-inner h-full"
    )}>
      <div 
        className="p-3 border-b bg-card/80 flex justify-between items-center h-12 cursor-pointer hover:bg-muted/30" 
        onClick={onToggle}
      >
        <h2 className="text-base font-semibold text-foreground flex items-center">
          <NodeEditorIcon />
          {getNodeEditorTitle()}
        </h2>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7" 
          aria-label={isOpen ? "Close Procedural Editor" : "Open Procedural Editor"}
        >
          {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </Button>
      </div>
      {isOpen && (
        <div className="flex-grow p-4 relative bg-muted/10 overflow-auto">
          {/* Group: Input Nodes */}
          <NodePlaceholder isGroup={true} groupLabel="Inputs" title="" color="slate" position={{top: '1rem', left: '1rem'}} width="w-[28rem]" />
          <NodePlaceholder title="Object Info" color={typeColors.input} icon={<InfoIcon size={14}/>} inputs={[]} outputs={[{name:'Location', type:'Vector', color:typeColors.vector}, {name:'Rotation', type:'Vector', color:typeColors.vector}, {name:'Scale', type:'Vector', color:typeColors.vector}, {name:'Geometry', type:'Geometry', color:typeColors.geometry}]} position={{top: '3rem', left: '2rem'}} nodeType="input" width="w-48"/>
          <NodePlaceholder title="Camera Data" color={typeColors.input} icon={<CameraIcon size={14}/>} inputs={[]} outputs={[{name:'View Vector', type:'Vector', color:typeColors.vector}, {name:'View Depth', type:'Float', color:typeColors.float}]} position={{top: '3rem', left: '16rem'}} nodeType="input" width="w-48"/>
          <NodePlaceholder title="Value" color={typeColors.input} icon={<SlidersHorizontal size={14}/>} inputs={[]} outputs={[{name:'Value', type:'Float', color:typeColors.float}]} position={{top: '10rem', left: '2rem'}} nodeType="input" width="w-36"/>
          <NodePlaceholder title="RGB Color" color={typeColors.input} icon={<PaletteIcon size={14}/>} inputs={[]} outputs={[{name:'Color', type:'Color', color:typeColors.color}]} position={{top: '10rem', left: '13rem'}} nodeType="input" width="w-40"/>
          <NodePlaceholder title="Scene Time" color={typeColors.input} icon={<Hourglass size={14}/>} inputs={[]} outputs={[{name:'Seconds', type:'Float', color:typeColors.float}, {name:'Frame', type:'Int', color:typeColors.int}]} position={{top: '10rem', left: '24rem'}} nodeType="input" width="w-40"/>

          {/* Group: Geometry Primitives */}
          <NodePlaceholder isGroup={true} groupLabel="Geometry Primitives" title="" color="slate" position={{top: '17rem', left: '1rem'}} width="w-[28rem]" />
          <NodePlaceholder title="Cube" color={typeColors.geometry} icon={<Box size={14}/>} inputs={[{name:'Size',type:'Vector', color:typeColors.vector}]} outputs={[{name:'Mesh', type:'Geometry', color:typeColors.geometry}]} position={{top: '19rem', left: '2rem'}} nodeType="geometry" width="w-40"/>
          <NodePlaceholder title="Sphere" color={typeColors.geometry} icon={<Globe size={14}/>} inputs={[{name:'Radius',type:'Float', color:typeColors.float}, {name:'Segments',type:'Int', color:typeColors.int}]} outputs={[{name:'Mesh', type:'Geometry', color:typeColors.geometry}]} position={{top: '19rem', left: '13rem'}} nodeType="geometry" width="w-44"/>
          <NodePlaceholder title="Cylinder" color={typeColors.geometry} icon={<Cylinder size={14}/>} inputs={[{name:'Radius',type:'Float', color:typeColors.float}, {name:'Height',type:'Float', color:typeColors.float}]} outputs={[{name:'Mesh', type:'Geometry', color:typeColors.geometry}]} position={{top: '19rem', left: '24rem'}} nodeType="geometry" width="w-44"/>

          {/* Group: Geometry Operations */}
          <NodePlaceholder isGroup={true} groupLabel="Geometry Operations" title="" color="slate" position={{top: '1rem', left: '32rem'}} width="w-[32rem]" />
          <NodePlaceholder title="Transform Geometry" color={typeColors.geometry} icon={<SquareFunction size={14}/>} inputs={[{name:'Geometry', type:'Geometry', color:typeColors.geometry}, {name:'Translation', type:'Vector', color:typeColors.vector}, {name:'Rotation', type:'Vector', color:typeColors.vector}, {name:'Scale', type:'Vector', color:typeColors.vector}]} outputs={[{name:'Geometry', type:'Geometry', color:typeColors.geometry}]} position={{top: '3rem', left: '33rem'}} nodeType="geometry" width="w-60"/>
          <NodePlaceholder title="Extrude Mesh" color={typeColors.geometry} icon={<Sigma size={14}/>} inputs={[{name:'Mesh', type:'Geometry', color:typeColors.geometry}, {name:'Offset Scale', type:'Float', color:typeColors.float}]} outputs={[{name:'Mesh', type:'Geometry', color:typeColors.geometry}]} position={{top: '3rem', left: '50rem'}} nodeType="geometry" width="w-56"/>
          <NodePlaceholder title="Bevel" color={typeColors.geometry} icon={<Puzzle size={14}/>} inputs={[{name:'Mesh',type:'Geometry', color:typeColors.geometry}, {name:'Amount',type:'Float', color:typeColors.float}, {name:'Segments',type:'Int', color:typeColors.int}]} outputs={[{name:'Mesh', type:'Geometry', color:typeColors.geometry}]} position={{top: '12rem', left: '33rem'}} nodeType="geometry" width="w-52"/>
          <NodePlaceholder title="Boolean" color={typeColors.geometry} icon={<GitCompareArrows size={14}/>} inputs={[{name:'A',type:'Geometry', color:typeColors.geometry}, {name:'B',type:'Geometry', color:typeColors.geometry}, {name:'Operation',type:'String', color:typeColors.string}]} outputs={[{name:'Result', type:'Geometry', color:typeColors.geometry}]} position={{top: '12rem', left: '49rem'}} nodeType="geometry" width="w-52"/>
          <NodePlaceholder title="Subdivision Surface" color={typeColors.geometry} icon={<Layers size={14}/>} inputs={[{name:'Mesh',type:'Geometry', color:typeColors.geometry}, {name:'Levels',type:'Int', color:typeColors.int}]} outputs={[{name:'Mesh', type:'Geometry', color:typeColors.geometry}]} position={{top: '21rem', left: '33rem'}} nodeType="geometry" width="w-60"/>
          <NodePlaceholder title="Merge by Distance" color={typeColors.geometry} icon={<Unlink2 size={14}/>} inputs={[{name:'Geometry', type:'Geometry', color:typeColors.geometry}, {name:'Distance',type:'Float', color:typeColors.float}]} outputs={[{name:'Geometry', type:'Geometry', color:typeColors.geometry}]} position={{top: '21rem', left: '50rem'}} nodeType="geometry" width="w-60"/>
          <NodePlaceholder title="Scatter Points" color={typeColors.geometry} icon={<ScatterChart size={14}/>} inputs={[{name:'Geometry', type:'Geometry', color:typeColors.geometry}, {name:'Density', type:'Float', color:typeColors.float}]} outputs={[{name:'Points', type:'Geometry', color:typeColors.geometry}]} position={{top: '30rem', left: '33rem'}} nodeType="geometry" width="w-56"/>

          {/* Group: Texture Nodes */}
          <NodePlaceholder isGroup={true} groupLabel="Texture Nodes" title="" color="slate" position={{top: '1rem', left: '67rem'}} width="w-[30rem]" />
          <NodePlaceholder title="Image Texture" color={typeColors.texture} icon={<ImageIcon size={14}/>} inputs={[{name:'Vector', type:'Vector', color:typeColors.vector}]} outputs={[{name:'Color', type:'Color', color:typeColors.color}, {name:'Alpha', type:'Float', color:typeColors.float}]} position={{top: '3rem', left: '68rem'}} nodeType="texture" width="w-52"/>
          <NodePlaceholder title="Noise Texture" color={typeColors.texture} icon={<Waves size={14}/>} inputs={[{name:'Vector', type:'Vector', color:typeColors.vector}, {name:'Scale', type:'Float', color:typeColors.float}, {name:'Detail', type:'Float', color:typeColors.float}]} outputs={[{name:'Fac', type:'Float', color:typeColors.float}, {name:'Color', type:'Color', color:typeColors.color}]} position={{top: '10rem', left: '68rem'}} nodeType="texture" width="w-60"/>
          <NodePlaceholder title="Voronoi Texture" color={typeColors.texture} icon={<Donut size={14}/>} inputs={[{name:'Vector', type:'Vector', color:typeColors.vector}, {name:'Scale', type:'Float', color:typeColors.float}]} outputs={[{name:'Distance', type:'Float', color:typeColors.float}, {name:'Color', type:'Color', color:typeColors.color}]} position={{top: '18rem', left: '68rem'}} nodeType="texture" width="w-60"/>
          <NodePlaceholder title="Gradient Texture" color={typeColors.texture} icon={<Blend size={14}/>} inputs={[{name:'Vector',type:'Vector', color:typeColors.vector}]} outputs={[{name:'Color', type:'Color', color:typeColors.color}, {name:'Fac', type:'Float', color:typeColors.float}]} position={{top: '26rem', left: '68rem'}} nodeType="texture" width="w-56"/>
          <NodePlaceholder title="Musgrave Texture" color={typeColors.texture} icon={<Disc3 size={14}/>} inputs={[{name:'Vector',type:'Vector', color:typeColors.vector}, {name:'Scale',type:'Float', color:typeColors.float}]} outputs={[{name:'Fac', type:'Float', color:typeColors.float}]} position={{top: '34rem', left: '68rem'}} nodeType="texture" width="w-60"/>

          {/* Group: Shader Nodes */}
          <NodePlaceholder isGroup={true} groupLabel="Shaders" title="" color="slate" position={{top: '1rem', left: '100rem'}} width="w-[34rem]" />
          <NodePlaceholder title="Principled BSDF" color={typeColors.shader} icon={<Wand2Icon size={14}/>} 
            inputs={[
                {name:'Base Color', type:'Color', color:typeColors.color}, {name:'Metallic', type:'Float', color:typeColors.float}, {name:'Roughness', type:'Float', color:typeColors.float}, {name:'Normal', type:'Vector', color:typeColors.vector}, {name:'Emission', type:'Color', color:typeColors.color}
            ]} 
            outputs={[{name:'BSDF', type:'Shader', color:typeColors.shader}]} position={{top: '3rem', left: '101rem'}} nodeType="shader" width="w-60"/>
          <NodePlaceholder title="Emission" color={typeColors.shader} icon={<LightbulbIcon size={14}/>} inputs={[{name:'Color', type:'Color', color:typeColors.color}, {name:'Strength', type:'Float', color:typeColors.float}]} outputs={[{name:'Emission', type:'Shader', color:typeColors.shader}]} position={{top: '13rem', left: '101rem'}} nodeType="shader" width="w-56"/>
          <NodePlaceholder title="Glass BSDF" color={typeColors.shader} icon={<Gem size={14}/>} inputs={[{name:'Color', type:'Color', color:typeColors.color}, {name:'Roughness', type:'Float', color:typeColors.float}, {name:'IOR', type:'Float', color:typeColors.float}]} outputs={[{name:'BSDF', type:'Shader', color:typeColors.shader}]} position={{top: '13rem', left: '118rem'}} nodeType="shader" width="w-60"/>
          <NodePlaceholder title="Transparent BSDF" color={typeColors.shader} icon={<Frame size={14}/>} inputs={[{name:'Color', type:'Color', color:typeColors.color}]} outputs={[{name:'BSDF', type:'Shader', color:typeColors.shader}]} position={{top: '22rem', left: '101rem'}} nodeType="shader" width="w-60"/>
          <NodePlaceholder title="Mix Shader" color={typeColors.shader} icon={<Shuffle size={14}/>} inputs={[{name:'Fac', type:'Float', color:typeColors.float}, {name:'Shader 1', type:'Shader', color:typeColors.shader}, {name:'Shader 2', type:'Shader', color:typeColors.shader}]} outputs={[{name:'Shader', type:'Shader', color:typeColors.shader}]} position={{top: '31rem', left: '101rem'}} nodeType="shader" width="w-56"/>
          <NodePlaceholder title="Add Shader" color={typeColors.shader} icon={<GitBranchPlus size={14}/>} inputs={[{name:'Shader 1', type:'Shader', color:typeColors.shader}, {name:'Shader 2', type:'Shader', color:typeColors.shader}]} outputs={[{name:'Shader', type:'Shader', color:typeColors.shader}]} position={{top: '31rem', left: '118rem'}} nodeType="shader" width="w-56"/>
          
          {/* Group: Color / Vector / Converter Nodes */}
          <NodePlaceholder isGroup={true} groupLabel="Color & Vector & Converters" title="" color="slate" position={{top: '28rem', left: '1rem'}} width="w-[28rem]" />
          <NodePlaceholder title="ColorRamp" color={typeColors.converter} icon={<GitBranchPlus size={14}/>} inputs={[{name:'Fac', type:'Float', color:typeColors.float}]} outputs={[{name:'Color', type:'Color', color:typeColors.color}, {name:'Alpha', type:'Float', color:typeColors.float}]} position={{top: '30rem', left: '2rem'}} nodeType="converter" width="w-48"/>
          <NodePlaceholder title="Vector Math" color={typeColors.converter} icon={<SigmaSquare size={14}/>} inputs={[{name:'Vector A', type:'Vector', color:typeColors.vector},{name:'Vector B', type:'Vector', color:typeColors.vector}]} outputs={[{name:'Vector', type:'Vector', color:typeColors.vector}]} position={{top: '30rem', left: '15rem'}} nodeType="converter" width="w-52"/>
          <NodePlaceholder title="Mapping" color={typeColors.vector} icon={<Network size={14}/>} inputs={[{name:'Vector', type:'Vector', color:typeColors.vector}, {name:'Location', type:'Vector', color:typeColors.vector}, {name:'Rotation', type:'Vector', color:typeColors.vector}, {name:'Scale', type:'Vector', color:typeColors.vector}]} outputs={[{name:'Vector', type:'Vector', color:typeColors.vector}]} position={{top: '38rem', left: '2rem'}} nodeType="vector" width="w-60"/>

          {/* Group: Outputs */}
           <NodePlaceholder isGroup={true} groupLabel="Outputs" title="" color="slate" position={{top: '1rem', left: '137rem'}} width="w-48" />
          <NodePlaceholder title="Material Output" color={typeColors.output} icon={<FileOutput size={14}/>} inputs={[{name:'Surface', type:'Shader', color:typeColors.shader}, {name:'Displacement', type:'Vector', color:typeColors.vector}]} outputs={[]} position={{top: '3rem', left: '138rem'}} nodeType="output" width="w-44"/>
          <NodePlaceholder title="Geometry Output" color={typeColors.output} icon={<FileOutput size={14}/>} inputs={[{name:'Geometry', type:'Geometry', color:typeColors.geometry}]} outputs={[]} position={{top: '10rem', left: '138rem'}} nodeType="output" width="w-44"/>

          {/* Placeholder Connections (simple SVG lines) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
            {/* Cube Mesh -> Transform Geometry */}
            <line x1="calc(2rem + 10rem + 0.5rem)" y1="calc(19rem + 3.5rem)" x2="calc(33rem + 0.5rem)" y2="calc(3rem + 1.5rem)" stroke="hsl(var(--border))" strokeWidth="1.5" />
            {/* Transform Geom -> Geometry Output */}
            <line x1="calc(48rem - 0.5rem + 15rem)" y1="calc(3rem + 2.5rem)" x2="calc(138rem + 0.5rem)" y2="calc(10rem + 1.5rem)" stroke="hsl(var(--border))" strokeWidth="1.5" />
            
            {/* Image Texture Color -> Principled BSDF Base Color */}
            <line x1="calc(68rem + 13rem + 0.5rem)" y1="calc(3rem + 1.5rem)" x2="calc(101rem + 0.5rem)" y2="calc(3rem + 1.5rem)" stroke="hsl(var(--border))" strokeWidth="1.5" />
            {/* Principled BSDF -> Material Output Surface */}
            <line x1="calc(116rem - 0.5rem + 15rem)" y1="calc(3rem + 2.5rem)" x2="calc(138rem + 0.5rem)" y2="calc(3rem + 1.5rem)" stroke="hsl(var(--border))" strokeWidth="1.5" />
            {/* Noise Fac -> ColorRamp Fac */}
             <line x1="calc(68rem + 15rem + 0.5rem)" y1="calc(10rem + 1.5rem)" x2="calc(2rem + 0.5rem)" y2="calc(30rem + 1.5rem)" stroke="hsl(var(--border))" strokeWidth="1.5" />
            {/* ColorRamp Color -> Principled BSDF Emission (example of longer connection) */}
            <line x1="calc(2rem + 12rem + 0.5rem)" y1="calc(30rem + 1.5rem)" x2="calc(101rem + 0.5rem)" y2="calc(3rem + 5.5rem)" stroke="hsl(var(--border))" strokeWidth="1.5" />
          </svg>
           <p className="absolute bottom-2 right-2 text-xs text-muted-foreground italic">Node Editor (WIP) - Visual Placeholder</p>
        </div>
      )}
    </div>
  );
};

export default NodeEditorPanel;
