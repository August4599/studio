
"use client";
import React, { useState } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layers, Eye, EyeOff, Lock, Unlock, PlusCircle, Trash2, Edit3, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mock data structure for layers - replace with actual context/state later
interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

const LayersPanel = () => {
  const { toast } = useToast();
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'layer-0', name: 'Default Layer', visible: true, locked: false },
    { id: 'layer-1', name: 'Walls', visible: true, locked: false },
    { id: 'layer-2', name: 'Furniture', visible: false, locked: true },
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string>('layer-0');
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingLayerName, setEditingLayerName] = useState<string>('');

  const handleAddLayer = () => {
    const newLayerName = `Layer ${layers.length}`;
    // In a real app, this would update global state via context
    setLayers([...layers, { id: `layer-${Date.now()}`, name: newLayerName, visible: true, locked: false }]);
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
  };

  const handleSaveEdit = () => {
    if (editingLayerId && editingLayerName.trim() !== "") {
      setLayers(layers.map(layer => layer.id === editingLayerId ? { ...layer, name: editingLayerName.trim() } : layer));
      toast({ title: "Layer Renamed (WIP)" });
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
      <AccordionContent className="space-y-2 p-1">
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
                  "flex items-center justify-between p-1.5 rounded-md text-xs hover:bg-muted/50 cursor-pointer",
                  activeLayerId === layer.id && "bg-primary/20"
                )}
                onClick={() => { if(!editingLayerId) setActiveLayerId(layer.id)}}
              >
                <div className="flex items-center gap-1.5 overflow-hidden flex-grow">
                    <input type="radio" name="active-layer" value={layer.id} checked={activeLayerId === layer.id} onChange={() => setActiveLayerId(layer.id)} className="form-radio h-3 w-3 text-primary focus:ring-primary border-muted-foreground"/>
                    {editingLayerId === layer.id ? (
                         <Input 
                            type="text" 
                            value={editingLayerName} 
                            onChange={(e) => setEditingLayerName(e.target.value)} 
                            className="h-6 text-xs px-1 flex-grow" 
                            autoFocus
                            onBlur={handleSaveEdit}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                        />
                    ) : (
                        <span className={cn("truncate", !layer.visible && "line-through text-muted-foreground/70")} title={layer.name}>
                            {layer.name}
                        </span>
                    )}
                </div>
                <div className="flex items-center shrink-0">
                  {editingLayerId === layer.id ? (
                     <>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-green-500 hover:text-green-600" onClick={handleSaveEdit}><Check size={14}/></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={() => setEditingLayerId(null)}><X size={14}/></Button>
                     </> 
                  ) : (
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-60 hover:opacity-100" onClick={() => handleStartEdit(layer)} disabled={layer.id === 'layer-0'}><Edit3 size={12}/></Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-60 hover:opacity-100" onClick={() => handleToggleVisibility(layer.id)}>
                    {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-60 hover:opacity-100" onClick={() => handleToggleLock(layer.id)} disabled={layer.id === 'layer-0'}>
                    {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                  </Button>
                  {layer.id !== 'layer-0' && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive opacity-60 hover:opacity-100" onClick={() => handleDeleteLayer(layer.id)}>
                      <Trash2 size={12} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <p className="text-xs text-muted-foreground text-center pt-1 italic">Layers panel (WIP) - Full functionality pending.</p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default LayersPanel;
