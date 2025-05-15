
"use client";
import React, { useState } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Camera, PlusCircle, Trash2, Edit3, Play, Settings, SlidersHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mock data structure for scenes - replace with actual context/state later
interface SceneView {
  id: string;
  name: string;
  thumbnail?: string; // data URL for a small preview
  // cameraPosition: [number,number,number];
  // cameraTarget: [number,number,number];
  // other settings: activeLayerStates, styleOverrides etc.
}

const ScenesPanel = () => {
  const { toast } = useToast();
  const [scenes, setScenes] = useState<SceneView[]>([
    { id: 'scene-1', name: 'Exterior Front View', thumbnail: 'https://placehold.co/80x50.png' },
    { id: 'scene-2', name: 'Interior Living Room', thumbnail: 'https://placehold.co/80x50.png' },
    { id: 'scene-3', name: 'Top Ortho View', thumbnail: 'https://placehold.co/80x50.png' },
  ]);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);

  const handleAddScene = () => {
    const newSceneName = `Scene ${scenes.length + 1}`;
    setScenes([...scenes, { id: `scene-${Date.now()}`, name: newSceneName, thumbnail: 'https://placehold.co/80x50.png' }]);
    toast({ title: "Scene Added (WIP)", description: `${newSceneName} created. Captures current view.` });
  };

  const handleDeleteScene = (id: string) => {
    setScenes(scenes.filter(scene => scene.id !== id));
    toast({ title: "Scene Deleted (WIP)" });
    if (selectedSceneId === id) setSelectedSceneId(null);
  };

  const handleUpdateScene = (id: string) => {
    toast({ title: "Scene Updated (WIP)", description: `Settings for scene '${scenes.find(s=>s.id===id)?.name}' updated with current view.` });
  };
  
  const handleApplyScene = (id: string) => {
    setSelectedSceneId(id);
    toast({ title: "Scene Applied (WIP)", description: `View changed to '${scenes.find(s=>s.id===id)?.name}'.` });
    // In real app: useScene().setCameraFromScene(id);
  };


  return (
    <AccordionItem value="item-scenes">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Camera size={18} /> Saved Scenes (Views)
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-2 p-1">
        <Button onClick={handleAddScene} size="sm" className="w-full text-xs h-8" variant="outline">
          <PlusCircle size={14} className="mr-2" /> Add New Scene (WIP)
        </Button>
        <ScrollArea className="h-[180px] w-full rounded-md border p-1">
          {scenes.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No saved scenes.</p>}
          <div className="space-y-1">
            {scenes.map((scene) => (
              <div
                key={scene.id}
                className={cn(
                  "flex items-center justify-between p-1.5 rounded-md text-xs hover:bg-muted/50 cursor-pointer",
                  selectedSceneId === scene.id && "bg-primary/20"
                )}
                onDoubleClick={() => handleApplyScene(scene.id)}
                onClick={() => setSelectedSceneId(scene.id)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <img src={scene.thumbnail} alt={scene.name} data-ai-hint="architectural render" className="w-10 h-7 object-cover rounded-sm border bg-muted"/>
                  <span className="truncate" title={scene.name}>{scene.name}</span>
                </div>
                {selectedSceneId === scene.id && (
                    <div className="flex items-center shrink-0">
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-60 hover:opacity-100" title="Update Scene (WIP)" onClick={() => handleUpdateScene(scene.id)}><SlidersHorizontal size={12}/></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive opacity-60 hover:opacity-100" title="Delete Scene (WIP)" onClick={() => handleDeleteScene(scene.id)}>
                            <Trash2 size={12} />
                        </Button>
                    </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex items-center gap-2 pt-1">
            <Button size="sm" className="flex-1 text-xs h-8" variant="outline" disabled><Play size={14} className="mr-1"/> Animate Scenes (WIP)</Button>
            <Button size="sm" className="flex-1 text-xs h-8" variant="outline" disabled><Settings size={14} className="mr-1"/> Transition Settings (WIP)</Button>
        </div>
        <p className="text-xs text-muted-foreground text-center pt-1 italic">Scenes panel (WIP) - Full functionality pending.</p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ScenesPanel;
