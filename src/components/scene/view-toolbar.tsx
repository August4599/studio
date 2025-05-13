
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useScene } from '@/context/scene-context';
import type { ViewPreset } from '@/types';
import { Camera, ArrowUpToLine, ArrowDownToLine, UserRound, SendToBack, ArrowLeftToLine, ArrowRightToLine } from 'lucide-react';

const ViewToolbar: React.FC = () => {
  const { setCameraViewPreset } = useScene();

  const viewButtons: { preset: ViewPreset; label: string; icon: React.ElementType }[] = [
    { preset: 'perspective', label: 'Perspective', icon: Camera },
    { preset: 'top', label: 'Top', icon: ArrowUpToLine },
    { preset: 'bottom', label: 'Bottom', icon: ArrowDownToLine },
    { preset: 'front', label: 'Front', icon: UserRound },
    { preset: 'back', label: 'Back', icon: SendToBack },
    { preset: 'left', label: 'Left', icon: ArrowLeftToLine },
    { preset: 'right', label: 'Right', icon: ArrowRightToLine },
  ];

  return (
    <TooltipProvider delayDuration={100}>
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 p-1 bg-card/70 dark:bg-card/50 border rounded-lg shadow-lg backdrop-blur-sm">
        {viewButtons.map(({ preset, label, icon: Icon }) => (
          <Tooltip key={preset}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 hover:bg-primary/20"
                onClick={() => setCameraViewPreset(preset)}
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
    </TooltipProvider>
  );
};

export default ViewToolbar;
