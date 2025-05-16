
"use client";
import React, { useState } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Camera, PlusCircle, Trash2, Edit3, Play, Settings, SlidersHorizontal, Layers, CloudSun, SunMoon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useScene } from '@/context/scene-context'; // Import useScene
import type { SavedSceneView } from '@/types'; // Import SavedSceneView

const ScenesPanel = () => {
  const { toast } = useToast();
  const { savedViews = [], addSavedScene, updateSavedScene, removeSavedScene, applySavedScene } = useScene();
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);

  const handleAddSceneUI = () => {
    const newSceneName = `Scene ${savedViews.length + 1}`;
    // In a real app, you'd capture current camera, layers, styles etc. here
    addSavedScene({ name: newSceneName }); // Pass minimal data for now
    toast({ title: "Scene Added", description: `${newSceneName} created. (WIP: Captures current view state)` });
  };

  const handleDeleteSceneUI = (id: string) => {
    removeSavedScene(id);
    toast({ title: "Scene Deleted" });
    if (selectedSceneId === id) setSelectedSceneId(null);
  };

  const handleUpdateSceneUI = (id: string) => {
    const sceneToUpdate = savedViews.find(s => s.id === id);
    if (sceneToUpdate) {
      // Capture current state and pass it to updateSavedScene
      updateSavedScene(id, { name: sceneToUpdate.name /* ... other captured states */ });
      toast({ title: "Scene Updated", description: `Settings for scene '${sceneToUpdate.name}' updated with current view. (WIP)` });
    }
  };
  
  const handleApplySceneUI = (id: string) => {
    setSelectedSceneId(id);
    applySavedScene(id); // Call context function
    const sceneName = savedViews.find(s => s.id === id)?.name || "Selected Scene";
    toast({ title: "Scene Applied", description: `View changed to '${sceneName}'.` });
  };


  return (
    <AccordionItem value="item-scenes">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Camera size={18} /> Saved Scenes (Views)
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-2 p-1 text-xs">
        <Button onClick={handleAddSceneUI} size="sm" className="w-full text-xs h-8" variant="outline">
          <PlusCircle size={14} className="mr-2" /> Add New Scene
        </Button>
        <p className="text-[10px] text-muted-foreground italic px-1">A scene saves camera, layers, styles, environment & more (WIP).</p>
        <ScrollArea className="h-[180px] w-full rounded-md border p-1">
          {savedViews.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No saved scenes.</p>}
          <div className="space-y-1">
            {savedViews.map((scene) => (
              <div
                key={scene.id}
                className={cn(
                  "flex items-center justify-between p-1.5 rounded-md text-xs hover:bg-muted/50 cursor-pointer",
                  selectedSceneId === scene.id && "bg-primary/20"
                )}
                onDoubleClick={() => handleApplySceneUI(scene.id)}
                onClick={() => setSelectedSceneId(scene.id)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <img src={scene.thumbnail || 'https://placehold.co/80x50.png'} alt={scene.name} data-ai-hint="architectural render scene" className="w-10 h-7 object-cover rounded-sm border bg-muted"/>
                  <span className="truncate" title={scene.name}>{scene.name}</span>
                </div>
                {selectedSceneId === scene.id && (
                    <div className="flex items-center shrink-0">
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-60 hover:opacity-100" title="Update Scene with Current View (WIP)" onClick={() => handleUpdateSceneUI(scene.id)}><SlidersHorizontal size={12}/></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive opacity-60 hover:opacity-100" title="Delete Scene" onClick={() => handleDeleteSceneUI(scene.id)}>
                            <Trash2 size={12} />
                        </Button>
                    </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t pt-2 mt-1 space-y-1">
            <Label className="font-medium">Scene Capture Settings (WIP)</Label>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div className="flex items-center space-x-1"><Checkbox id="scene-save-cam" defaultChecked disabled/><Label htmlFor="scene-save-cam" className="font-normal">Camera Location</Label></div>
                <div className="flex items-center space-x-1"><Checkbox id="scene-save-layers" disabled/><Label htmlFor="scene-save-layers" className="font-normal">Visible Layers</Label></div>
                <div className="flex items-center space-x-1"><Checkbox id="scene-save-styles" disabled/><Label htmlFor="scene-save-styles" className="font-normal">Display Styles</Label></div>
                <div className="flex items-center space-x-1"><Checkbox id="scene-save-shadows" disabled/><Label htmlFor="scene-save-shadows" className="font-normal">Shadow Settings</Label></div>
                <div className="flex items-center space-x-1"><Checkbox id="scene-save-env" disabled/><Label htmlFor="scene-save-env" className="font-normal">Environment</Label></div>
                <div className="flex items-center space-x-1"><Checkbox id="scene-save-fog" disabled/><Label htmlFor="scene-save-fog" className="font-normal">Fog</Label></div>
            </div>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t mt-2">
            <Button size="sm" className="flex-1 text-xs h-8" variant="outline" disabled><Play size={14} className="mr-1"/> Animate Scenes (WIP)</Button>
            <Button size="sm" className="flex-1 text-xs h-8" variant="outline" disabled><Settings size={14} className="mr-1"/> Transition Settings (WIP)</Button>
        </div>
        <p className="text-xs text-muted-foreground text-center pt-1 italic">Scenes panel (WIP) - Full functionality for saving/restoring all settings pending.</p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ScenesPanel;
