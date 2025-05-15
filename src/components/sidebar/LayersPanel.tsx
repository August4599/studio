
"use client";
import React, { useState } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layers, Eye, EyeOff, Lock, Unlock, PlusCircle, Trash2, Edit3, Check, X, Palette as ColorPaletteIcon } from 'lucide-react'; // Added Palette for color
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mock data structure for layers - replace with actual context/state later
interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color?: string; // Optional color for layer identification
  objectCount?: number; // WIP: Number of objects in this layer
}

const LayersPanel = () => {
  const { toast } = useToast();
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'layer-0', name: 'Default Layer', visible: true, locked: false, color: '#888888', objectCount: 0 },
    { id: 'layer-1', name: 'Walls', visible: true, locked: false, color: '#FF5733', objectCount: 0 },
    { id: 'layer-2', name: 'Furniture', visible: false, locked: true, color: '#33C4FF', objectCount: 0 },
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string>('layer-0');
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingLayerName, setEditingLayerName] = useState<string>('');
  const [editingLayerColor, setEditingLayerColor] = useState<string>('#888888');

  const handleAddLayer = () => {
    const newLayerName = `Layer ${layers.length}`;
    // In a real app, this would update global state via context
    setLayers([...layers, { id: `layer-${Date.now()}`, name: newLayerName, visible: true, locked: false, color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`, objectCount: 0 }]);
    toast({ title: "Layer Added (WIP)", description: `${newLayerName} created.` });
  };

  const handleDeleteLayer = (id: string) => {
    if (id === 'layer-0') {
      toast({ title: "Action Denied (WIP)", description: "Cannot delete the Default Layer.", variant: "destructive" });
      return;
    }
    setLayers(layers.filter(layer => layer.id !== id));
    toast({ title: "Layer Deleted (WIP)", description: "Layer removed." });
    if (activeLayerId === id) setActiveLayerId('layer-0');
    if (editingLayerId === id) setEditingLayerId(null);
  };

  const handleToggleVisibility = (id: string) => {
    setLayers(layers.map(layer => layer.id === id ? { ...layer, visible: !layer.visible } : layer));
  };

  const handleToggleLock = (id: string) => {
     if (id === 'layer-0' && layers.find(l=>l.id === id)?.locked) {
      toast({ title: "Action Denied (WIP)", description: "Default Layer cannot be locked in this demo.", variant: "default" });
      return;
    }
    setLayers(layers.map(layer => layer.id === id ? { ...layer, locked: !layer.locked } : layer));
  };
  
  const handleStartEdit = (layer: Layer) => {
    setEditingLayerId(layer.id);
    setEditingLayerName(layer.name);
    setEditingLayerColor(layer.color || '#888888');
  };

  const handleSaveEdit = () => {
    if (editingLayerId && editingLayerName.trim() !== "") {
      setLayers(layers.map(layer => layer.id === editingLayerId ? { ...layer, name: editingLayerName.trim(), color: editingLayerColor } : layer));
      toast({ title: "Layer Updated (WIP)" });
    }
    setEditingLayerId(null);
  };


  return (
    <AccordionItem value="item-layers">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Layers size={18} /> Layers (Tags)
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-2 p-1 text-xs">
        <Button onClick={handleAddLayer} size="sm" className="w-full text-xs h-8" variant="outline">
          <PlusCircle size={14} className="mr-2" /> Add New Layer (WIP)
        </Button>
        <ScrollArea className="h-[180px] w-full rounded-md border p-1">
          {layers.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No layers defined.</p>}
          <div className="space-y-0.5">
            {layers.map((layer) => (
              <div
                key={layer.id}
                className={cn(
                  "flex items-center justify-between p-1.5 rounded-md hover:bg-muted/50 cursor-pointer",
                  activeLayerId === layer.id && "bg-primary/20 ring-1 ring-primary"
                )}
                onClick={() => { if(!editingLayerId) setActiveLayerId(layer.id)}}
              >
                <div className="flex items-center gap-1.5 overflow-hidden flex-grow">
                    <input type="radio" name="active-layer" value={layer.id} checked={activeLayerId === layer.id} onChange={() => setActiveLayerId(layer.id)} className="form-radio h-3 w-3 text-primary focus:ring-primary border-muted-foreground shrink-0"/>
                    {editingLayerId === layer.id ? (
                         <Input 
                            type="text" 
                            value={editingLayerName} 
                            onChange={(e) => setEditingLayerName(e.target.value)} 
                            className="h-6 text-xs px-1 flex-grow mr-1" 
                            autoFocus
                            onBlur={handleSaveEdit}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
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
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-60 hover:opacity-100" onClick={() => handleStartEdit(layer)} disabled={layer.id === 'layer-0'} title="Edit Layer"><Edit3 size={12}/></Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-60 hover:opacity-100" onClick={() => handleToggleVisibility(layer.id)} title={layer.visible ? "Hide Layer" : "Show Layer"}>
                    {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-60 hover:opacity-100" onClick={() => handleToggleLock(layer.id)} disabled={layer.id === 'layer-0'} title={layer.locked ? "Unlock Layer" : "Lock Layer"}>
                    {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                  </Button>
                  {layer.id !== 'layer-0' && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive opacity-60 hover:opacity-100" onClick={() => handleDeleteLayer(layer.id)} title="Delete Layer">
                      <Trash2 size={12} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <p className="text-xs text-muted-foreground text-center pt-1 italic">Layers panel (WIP) - Object assignment & filtering pending.</p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default LayersPanel;
