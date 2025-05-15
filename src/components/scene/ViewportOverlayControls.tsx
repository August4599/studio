
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useScene } from '@/context/scene-context';
import type { ViewPreset } from '@/types';
import { Camera, ArrowUpToLine, ArrowDownToLine, UserRound, SendToBack, ArrowLeftToLine, ArrowRightToLine, Orbit, Eye, Layers, Box } from 'lucide-react'; // Added Orbit, Eye, Layers, Box

const ViewportOverlayControls: React.FC = () => {
  const { setCameraViewPreset } = useScene();

  const viewButtons: { preset: ViewPreset; label: string; icon: React.ElementType }[] = [
    { preset: 'perspective', label: 'Perspective', icon: Orbit }, // Changed to Orbit
    { preset: 'top', label: 'Top', icon: ArrowUpToLine },
    { preset: 'bottom', label: 'Bottom', icon: ArrowDownToLine },
    { preset: 'front', label: 'Front', icon: UserRound },
    { preset: 'back', label: 'Back', icon: SendToBack },
    { preset: 'left', label: 'Left', icon: ArrowLeftToLine },
    { preset: 'right', label: 'Right', icon: ArrowRightToLine },
  ];

  // Placeholder for View Cube
  const ViewCube = () => (
    <div className="w-20 h-20 bg-muted/50 border border-border rounded-md flex items-center justify-center text-xs text-muted-foreground select-none cursor-grab active:cursor-grabbing" title="View Cube (WIP)">
      View Cube
    </div>
  );

  const shadingModeButtons = [
    { label: 'Shaded', icon: Eye, wip: false }, // Assuming 'Shaded' is the default
    { label: 'Wireframe', icon: Layers, wip: true },
    { label: 'Shaded with Edges', icon: Box, wip: true }, // Placeholder for more complex style
  ];

  return (
    <TooltipProvider delayDuration={100}>
      {/* Top-Right View Preset Buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 p-1 bg-card/70 dark:bg-card/50 border rounded-lg shadow-lg backdrop-blur-sm">
        {viewButtons.map(({ preset, label, icon: Icon }) => (
          <Tooltip key={preset}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 hover:bg-primary/20"
                onClick={() => setCameraViewPreset(preset)}
                title={label + " View"}
              >
                <Icon size={18} className="text-foreground/80" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-popover text-popover-foreground">
              <p>{label} View</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Top-Left View Cube Placeholder */}
      <div className="absolute top-3 left-3 z-10">
        <ViewCube />
      </div>

      {/* Bottom-Center Shading Mode Buttons Placeholder */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1 p-1 bg-card/70 dark:bg-card/50 border rounded-lg shadow-lg backdrop-blur-sm">
        {shadingModeButtons.map(({ label, icon: Icon, wip }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 hover:bg-primary/20 relative"
                onClick={() => { if(wip) alert(`${label} mode is a work in progress.`); }}
                title={label + (wip ? " (WIP)" : "")}
                disabled={wip}
              >
                <Icon size={18} className="text-foreground/80" />
                {wip && <span className="absolute -top-1 -right-1 text-[7px] bg-amber-500 text-white px-0.5 rounded-sm">WIP</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-popover text-popover-foreground">
              <p>{label}{wip ? " (WIP)" : ""}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default ViewportOverlayControls;
