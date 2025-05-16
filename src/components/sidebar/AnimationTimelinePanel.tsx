
"use client";
import React, { useState } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Film, Play, Pause, SkipForward, SkipBack, PlusCircle, Key, Clock, SlidersHorizontal, Trash2, Rows, Maximize, Camera, Box, Palette as PaletteIcon, Link2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


// Mock keyframe structure
interface Keyframe {
  id: string;
  time: number; // in seconds or frames
  value: any; // e.g. position as [x,y,z], rotation as [x,y,z], color as hex, visibility as boolean
  interpolation?: 'linear' | 'bezier' | 'step';
}

interface AnimationTrack {
  id: string;
  name: string;
  targetId: string; // ID of the object, light, material, or camera
  targetType: 'object_transform' | 'object_property' | 'material_property' | 'light_property' | 'camera_property';
  property: string; // e.g., 'position', 'rotation.y', 'color', 'intensity', 'fov'
  keyframes: Keyframe[];
  expanded?: boolean;
}


const AnimationTimelinePanel = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(10); // e.g., 10 seconds
  const [fps, setFps] = useState(24);
  const [tracks, setTracks] = useState<AnimationTrack[]>([
    { id: 'track-cam-pos', name: 'Main Camera: Position', targetId: 'main-camera', targetType: 'camera_property', property: 'position', keyframes: []},
    { id: 'track-cube1-rot', name: 'Cube 1: Rotation Y', targetId: 'cube-obj-id-1', targetType: 'object_transform', property: 'rotation.y', keyframes: []},
    { id: 'track-light1-int', name: 'Spot Light: Intensity', targetId: 'spot-light-id-1', targetType: 'light_property', property: 'intensity', keyframes: []},
    { id: 'track-mat1-color', name: 'Wood Material: Base Color', targetId: 'wood-mat-id', targetType: 'material_property', property: 'color', keyframes: [{id:'k1', time:2, value:'#FF0000'}, {id:'k2', time:5, value:'#00FF00'}]},
  ]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  const selectedTrack = tracks.find(t => t.id === selectedTrackId);

  const handleAddKeyframe = (trackId: string) => {
    // WIP: Get current value of the property for the targetId
    console.log(`WIP: Add keyframe to track ${trackId} at time ${currentTime}`);
  };

  return (
    <AccordionItem value="item-animation-timeline">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Film size={18} /> Animation & Timeline
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-2 p-1 text-xs">
        {/* Playback Controls */}
        <div className="flex items-center justify-between gap-1 p-1 border rounded-md bg-muted/30">
            <div className="flex gap-0.5">
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Go to Start (WIP)" disabled><SkipBack size={16}/></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title={isPlaying ? "Pause (WIP)" : "Play (WIP)"} onClick={() => setIsPlaying(!isPlaying)} disabled>
                    {isPlaying ? <Pause size={16}/> : <Play size={16}/>}
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Go to End (WIP)" disabled><SkipForward size={16}/></Button>
            </div>
            <div className="flex items-center gap-1">
                 <Label htmlFor="anim-current-frame" className="sr-only">Current Frame</Label>
                 <Input id="anim-current-frame" type="number" value={Math.round(currentTime * fps)} onChange={e=>setCurrentTime(parseInt(e.target.value)/fps)} className="h-6 w-14 text-xs text-center" disabled title="Current Frame"/>
                 <span className="text-muted-foreground">/ {Math.round(totalDuration * fps)}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Add Keyframe to Selected Track (WIP)" onClick={() => selectedTrackId && handleAddKeyframe(selectedTrackId)} disabled={!selectedTrackId}><Key size={16}/></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Record Auto-Keyframes (WIP)" disabled><div className="w-3 h-3 rounded-full bg-red-500 border border-red-700"></div></Button>
        </div>

        {/* Timeline Scrubber & Settings */}
        <div className="space-y-1 p-1 border rounded-md">
            <div className="flex justify-between items-center text-muted-foreground">
                <span>{currentTime.toFixed(2)}s</span>
                <Input type="number" value={currentTime} onChange={e=>setCurrentTime(parseFloat(e.target.value))} step="0.01" className="h-6 w-16 text-xs mx-1" disabled/>
                <span>{totalDuration.toFixed(2)}s</span>
            </div>
            <Slider 
                value={[currentTime]} 
                onValueChange={([v]) => setCurrentTime(v)} 
                min={0} max={totalDuration} step={1/fps} 
                className="my-1"
                disabled
            />
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1"><Label htmlFor="anim-duration" className="whitespace-nowrap">Duration(s):</Label><Input type="number" id="anim-duration" value={totalDuration} onChange={e=>setTotalDuration(parseFloat(e.target.value))} min="0.1" step="0.1" className="h-6 text-xs w-12" disabled/></div>
                <div className="flex items-center gap-1"><Label htmlFor="anim-fps" className="whitespace-nowrap">FPS:</Label><Input type="number" id="anim-fps" value={fps} onChange={e=>setFps(parseInt(e.target.value))} min="1" step="1" className="h-6 text-xs w-10" disabled/></div>
                 <Button variant="outline" size="xs" className="h-6 text-[10px]" disabled>Render Animation (WIP)</Button>
            </div>
        </div>

        {/* Track List / Keyframe Editor Placeholder */}
        <div className="p-1 border rounded-md space-y-1">
            <div className="flex justify-between items-center">
                <Label className="font-medium">Tracks (WIP)</Label>
                <div className="flex gap-1">
                    <Select disabled>
                        <SelectTrigger className="h-6 text-[10px] px-1.5"><PlusCircle size={10} className="mr-0.5"/> Add Track</SelectTrigger>
                        <SelectContent>
                            <SelectItem value="obj-transform" className="text-xs">Object Transform</SelectItem>
                            <SelectItem value="obj-property" className="text-xs">Object Property</SelectItem>
                            <SelectItem value="cam-property" className="text-xs">Camera Property</SelectItem>
                            <SelectItem value="light-property" className="text-xs">Light Property</SelectItem>
                            <SelectItem value="mat-property" className="text-xs">Material Property</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="xs" className="h-6 text-[10px]" disabled><Maximize size={10} className="mr-0.5"/> Expand All</Button>
                </div>
            </div>
            <ScrollArea className="h-[150px] border rounded-sm bg-muted/20 p-1">
                {tracks.map(track => (
                    <div key={track.id} 
                        className={`p-1.5 border-b last:border-b-0 text-xs hover:bg-accent/20 cursor-pointer ${selectedTrackId === track.id ? 'bg-primary/30' : ''}`} 
                        onClick={()=>setSelectedTrackId(track.id)}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                                {track.targetType === 'camera_property' ? <Camera size={10}/> : track.targetType === 'object_transform' ? <Box size={10}/> : track.targetType === 'light_property' ? <SlidersHorizontal size={10}/> : <PaletteIcon size={10}/>}
                                <span>{track.name}</span>
                            </div>
                            <div className="flex gap-0.5">
                                <Button variant="ghost" size="icon" className="h-5 w-5 opacity-50 hover:opacity-100" title="Link to Object (WIP)" disabled><Link2 size={10}/></Button>
                                <Button variant="ghost" size="icon" className="h-5 w-5 opacity-50 hover:opacity-100" title="Track Settings (WIP)" disabled><SlidersHorizontal size={10}/></Button>
                                <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive opacity-50 hover:opacity-100" title="Delete Track (WIP)" disabled><Trash2 size={10}/></Button>
                            </div>
                        </div>
                        {/* Placeholder for keyframes on this track */}
                        <div className="h-3 bg-background/30 rounded-sm mt-0.5 relative border border-muted/30 overflow-hidden">
                           {track.keyframes.map(kf => (
                               <div key={kf.id} className="absolute w-1 h-full bg-primary top-0" style={{left: `${(kf.time/totalDuration)*100}%`}} title={`Key at ${kf.time}s`}></div>
                           ))}
                        </div>
                    </div>
                ))}
                {tracks.length === 0 && <p className="text-center text-muted-foreground text-xs py-4">No animation tracks.</p>}
            </ScrollArea>
             {selectedTrack && (
                <div className="p-1 border-t mt-1 space-y-1">
                    <Label className="font-medium text-[11px]">Keyframe Editor for: {selectedTrack.name} (WIP)</Label>
                     {/* Placeholder for keyframe list or curve editor */}
                    <div className="h-20 bg-muted/30 rounded-sm p-2 text-center text-muted-foreground text-[10px] flex items-center justify-center">
                        Keyframe values and curve editor will appear here.
                    </div>
                    <Button variant="outline" size="xs" className="h-6 text-[10px]" disabled>Open Curve Editor (WIP)</Button>
                </div>
             )}
        </div>
        
        <p className="text-xs text-muted-foreground text-center pt-1 italic">Animation & Timeline panel (WIP) - Placeholder for keyframing, curve editing, and advanced animation controls.</p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default AnimationTimelinePanel;
