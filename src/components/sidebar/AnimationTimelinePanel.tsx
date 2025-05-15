
"use client";
import React, { useState } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Film, Play, Pause, SkipForward, SkipBack, PlusCircle, Key, Clock, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

// Mock keyframe structure
interface Keyframe {
  id: string;
  time: number; // in seconds or frames
  objectId?: string; // if object animation
  cameraState?: any; // if camera animation
  properties?: Record<string, any>; // animated properties
}

const AnimationTimelinePanel = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(10); // e.g., 10 seconds
  const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null); // e.g., 'Camera Path' or object ID

  const mockTracks = [
    { id: 'camera-main', name: 'Main Camera Animation', type: 'camera' },
    { id: 'cube-1-pos', name: 'Cube 1: Position', type: 'object' },
    { id: 'sphere-2-vis', name: 'Sphere 2: Visibility', type: 'object' },
  ];

  return (
    <AccordionItem value="item-animation-timeline">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Film size={18} /> Animation & Timeline
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-2 p-1 text-xs">
        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-1 p-1 border rounded-md bg-muted/30">
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Go to Start (WIP)" disabled><SkipBack size={16}/></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" title={isPlaying ? "Pause (WIP)" : "Play (WIP)"} onClick={() => setIsPlaying(!isPlaying)} disabled>
                {isPlaying ? <Pause size={16}/> : <Play size={16}/>}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Go to End (WIP)" disabled><SkipForward size={16}/></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Add Keyframe (WIP)" disabled><Key size={16}/></Button>
        </div>

        {/* Timeline Scrubber */}
        <div className="space-y-1 p-1">
            <div className="flex justify-between items-center text-muted-foreground">
                <span>{currentTime.toFixed(2)}s</span>
                <span>{totalDuration.toFixed(2)}s</span>
            </div>
            <Slider 
                value={[currentTime]} 
                onValueChange={([v]) => setCurrentTime(v)} 
                min={0} max={totalDuration} step={0.01} 
                className="my-1"
                disabled
            />
            <div className="flex items-center gap-2">
                <Label htmlFor="anim-duration" className="whitespace-nowrap">Duration (s):</Label>
                <Input type="number" id="anim-duration" value={totalDuration} onChange={e=>setTotalDuration(parseFloat(e.target.value))} min="0.1" step="0.1" className="h-7 text-xs w-16" disabled/>
                <Label htmlFor="anim-fps" className="whitespace-nowrap">FPS:</Label>
                <Input type="number" id="anim-fps" defaultValue="24" min="1" step="1" className="h-7 text-xs w-12" disabled/>
            </div>
        </div>

        {/* Track List / Keyframe Editor Placeholder */}
        <div className="p-1 border rounded-md space-y-1">
            <div className="flex justify-between items-center">
                <Label className="font-medium">Tracks (WIP)</Label>
                <Button variant="outline" size="xs" className="h-6 text-[10px]" disabled><PlusCircle size={12} className="mr-1"/> Add Track</Button>
            </div>
            <ScrollArea className="h-[100px] border rounded-sm bg-muted/20 p-1">
                {mockTracks.map(track => (
                    <div key={track.id} className="p-1.5 border-b last:border-b-0 text-xs hover:bg-accent/20 cursor-pointer flex justify-between items-center" onClick={()=>setSelectedTrack(track.id)}>
                        <span>{track.name}</span>
                        <div className="flex gap-0.5">
                            <Button variant="ghost" size="icon" className="h-5 w-5 opacity-50 hover:opacity-100" title="Track Settings (WIP)" disabled><SlidersHorizontal size={10}/></Button>
                            <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive opacity-50 hover:opacity-100" title="Delete Track (WIP)" disabled><Trash2 size={10}/></Button>
                        </div>
                    </div>
                ))}
                {mockTracks.length === 0 && <p className="text-center text-muted-foreground text-xs py-4">No animation tracks.</p>}
            </ScrollArea>
             {selectedTrack && <p className="text-[10px] italic text-muted-foreground mt-1">Selected Track: {mockTracks.find(t=>t.id === selectedTrack)?.name} (Keyframe editor placeholder)</p>}
        </div>
        
        <p className="text-xs text-muted-foreground text-center pt-1 italic">Animation & Timeline panel (WIP) - Placeholder for keyframing and animation controls.</p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default AnimationTimelinePanel;
