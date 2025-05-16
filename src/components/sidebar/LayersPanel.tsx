
"use client";
import React, { useState } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layers, Eye, EyeOff, Lock, Unlock, PlusCircle, Trash2, Edit3, Check, X, Palette as ColorPaletteIcon, Tag } from 'lucide-react';
import { useScene } from '@/context/scene-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { SceneLayer } from '@/types';
import { DEFAULT_LAYER_ID, DEFAULT_LAYER_NAME } from '@/types'; // Import defaults

const LayersPanel = () => {
  const { layers, addLayer, updateLayer, removeLayer, activeLayerId, setActiveLayerId } = useScene();
  const { toast } = useToast();
  
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingLayerName, setEditingLayerName] = useState<string>('');
  const [editingLayerColor, setEditingLayerColor] = useState<string>('#888888');

  const handleAddLayerUI = () => {
    const newLayerName = `Layer ${layers.length}`; 
    const newLayerColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
    const newLayer = addLayer({ name: newLayerName, color: newLayerColor, visible: true, locked: false });
    toast({ title: "Layer Added", description: `${newLayer.name} created.` });
  };

  const handleDeleteLayerUI = (id: string) => {
    if (id === DEFAULT_LAYER_ID) {
      toast({ title: "Action Denied", description: "Cannot delete the Default Layer.", variant: "destructive" });
      return;
    }
    const layerToDelete = layers.find(l => l.id === id);
    if (layerToDelete) {
        removeLayer(id);
        toast({ title: "Layer Deleted", description: `"${layerToDelete.name}" removed.` });
        if (editingLayerId === id) setEditingLayerId(null);
    }
  };

  const handleToggleVisibility = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (layer) {
      updateLayer(id, { visible: !layer.visible });
    }
  };

  const handleToggleLock = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (layer) {
      if (id === DEFAULT_LAYER_ID && !layer.locked) { 
        // Default layer can be unlocked, but perhaps not locked by user in this simple UI
        // For now, allow toggling. More complex logic could prevent locking Default Layer.
      }
      updateLayer(id, { locked: !layer.locked });
    }
  };
  
  const handleStartEdit = (layer: SceneLayer) => {
    if (layer.id === DEFAULT_LAYER_ID) {
      toast({ title: "Action Denied", description: "Cannot edit the Default Layer's name directly.", variant: "default"});
      // Allow color editing for default layer
      setEditingLayerId(layer.id);
      setEditingLayerName(layer.name); // Keep name as is
      setEditingLayerColor(layer.color || '#888888');
      return;
    }
    setEditingLayerId(layer.id);
    setEditingLayerName(layer.name);
    setEditingLayerColor(layer.color || '#888888');
  };

  const handleSaveEdit = () => {
    if (editingLayerId && (editingLayerName.trim() !== "" || editingLayerId === DEFAULT_LAYER_ID)) {
      const updates: Partial<SceneLayer> = { color: editingLayerColor };
      if (editingLayerId !== DEFAULT_LAYER_ID) {
        updates.name = editingLayerName.trim();
      }
      updateLayer(editingLayerId, updates);
      toast({ title: "Layer Updated" });
    }
    setEditingLayerId(null);
  };


  return (
    <AccordionItem value="item-layers">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Tag size={18} /> Layers (Tags)
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-2 p-1 text-xs">
        <Button onClick={handleAddLayerUI} size="sm" className="w-full text-xs h-8" variant="outline">
          <PlusCircle size={14} className="mr-2" /> Add New Layer
        </Button>
        <ScrollArea className="h-[180px] w-full rounded-md border p-1">
          {layers.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No layers defined.</p>}
          <div className="space-y-0.5">
            {layers.map((layer) => (
              <div
                key={layer.id}
                className={cn(
                  "flex items-center justify-between p-1.5 rounded-md hover:bg-muted/50",
                  activeLayerId === layer.id && "bg-primary/20 ring-1 ring-primary"
                )}
              >
                <div 
                  className="flex items-center gap-1.5 overflow-hidden flex-grow cursor-pointer"
                  onClick={() => { if(!editingLayerId) setActiveLayerId(layer.id)}}
                >
                    <input type="radio" name="active-layer" value={layer.id} checked={activeLayerId === layer.id} onChange={() => setActiveLayerId(layer.id)} className="form-radio h-3 w-3 text-primary focus:ring-primary border-muted-foreground shrink-0 cursor-pointer"/>
                    {editingLayerId === layer.id ? (
                         <Input 
                            type="text" 
                            value={editingLayerName} 
                            onChange={(e) => setEditingLayerName(e.target.value)} 
                            className="h-6 text-xs px-1 flex-grow mr-1" 
                            autoFocus
                            onBlur={handleSaveEdit}
                            onKeyDown={(e) => {if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') setEditingLayerId(null);}}
                            disabled={layer.id === DEFAULT_LAYER_ID}
                        />
                    ) : (
                      <>
                        <div style={{backgroundColor: layer.color || '#888888'}} className="w-3 h-3 rounded-sm border shrink-0" title={`Layer color: ${layer.color}`}/>
                        <span className={cn("truncate", !layer.visible && "line-through text-muted-foreground/70")} title={layer.name}>
                            {layer.name}
                        </span>
                        <span className="text-muted-foreground/60 text-[10px] ml-auto mr-1">({layer.objectCount || 0})</span>
                      </>
                    )}
                </div>
                <div className="flex items-center shrink-0">
                  {editingLayerId === layer.id ? (
                     <>
                        <Input type="color" value={editingLayerColor} onChange={(e) => setEditingLayerColor(e.target.value)} className="h-5 w-6 p-0.5 border-none rounded-sm mr-1" title="Change layer color"/>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-green-500 hover:text-green-600" onClick={handleSaveEdit} title="Save Changes"><Check size={14}/></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={() => setEditingLayerId(null)} title="Cancel Edit"><X size={14}/></Button>
                     </> 
                  ) : (
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-60 hover:opacity-100" onClick={() => handleStartEdit(layer)} title="Edit Layer"><Edit3 size={12}/></Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-60 hover:opacity-100" onClick={() => handleToggleVisibility(layer.id)} title={layer.visible ? "Hide Layer" : "Show Layer"}>
                    {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-60 hover:opacity-100" onClick={() => handleToggleLock(layer.id)} disabled={layer.id === DEFAULT_LAYER_ID && layer.locked} title={layer.locked ? "Unlock Layer" : "Lock Layer"}>
                    {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                  </Button>
                  {layer.id !== DEFAULT_LAYER_ID && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive opacity-60 hover:opacity-100" onClick={() => handleDeleteLayerUI(layer.id)} title="Delete Layer">
                      <Trash2 size={12} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <p className="text-xs text-muted-foreground text-center pt-1 italic">Layer management (WIP for object counts and advanced filtering).</p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default LayersPanel;
