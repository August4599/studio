
"use client";

import React, { useState, useMemo } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useScene } from '@/context/scene-context';
import { Eye, EyeOff, Trash2, LayoutList, ChevronDown, Lock, Unlock, Group, Ungroup, Search, Box, Component, Link2Off, SquareFunction, Cylinder, Plane as PlaneIcon, Globe, Cone, Torus, FileText, CaseSensitive } from 'lucide-react'; // Added more icons
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const ITEMS_PER_PAGE = 100; 

const ObjectHierarchyPanel = () => {
  const { objects, selectedObjectId, selectObject, updateObject, removeObject } = useScene();
  const { toast } = useToast();
  const [visibleItemsCount, setVisibleItemsCount] = useState(ITEMS_PER_PAGE);
  const [searchTerm, setSearchTerm] = useState("");

  const handleToggleVisibility = (id: string, currentVisibility?: boolean) => {
    updateObject(id, { visible: !(currentVisibility ?? true) });
  };
  
  const handleToggleLock = (id: string, currentLockState?: boolean) => {
    updateObject(id, { locked: !(currentLockState ?? false) });
    const obj = objects.find(o => o.id === id);
    toast({ title: `Object ${currentLockState ? "Unlocked" : "Locked"}`, description: `${obj?.name || 'Object'} is now ${currentLockState ? "editable" : "protected from changes via properties panel."}.` });
  };


  const handleDeleteObject = (id: string, name: string) => {
    removeObject(id);
    toast({ title: "Object Deleted", description: `${name} removed from scene.` });
  };

  const filteredObjects = useMemo(() => {
    return objects.filter(obj => obj.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [objects, searchTerm]);

  const displayedObjects = useMemo(() => filteredObjects.slice(0, visibleItemsCount), [filteredObjects, visibleItemsCount]);
  
  const handleLoadMore = () => {
    setVisibleItemsCount(prevCount => Math.min(prevCount + ITEMS_PER_PAGE, filteredObjects.length));
  };
  
  const getObjectIcon = (type: PrimitiveType, isGroup?: boolean, parentId?: string) => {
    if (isGroup) return <Group size={12} className="mr-1 text-blue-400 shrink-0"/>;
    if (parentId) return <Component size={12} className="mr-1 text-green-400 shrink-0"/>; 
    
    switch(type) {
        case 'cube': return <Box size={12} className="mr-1 text-muted-foreground/80 shrink-0"/>;
        case 'cylinder': return <Cylinder size={12} className="mr-1 text-muted-foreground/80 shrink-0"/>;
        case 'plane': return <PlaneIcon size={12} className="mr-1 text-muted-foreground/80 shrink-0"/>;
        case 'sphere': return <Globe size={12} className="mr-1 text-muted-foreground/80 shrink-0"/>;
        case 'cone': return <Cone size={12} className="mr-1 text-muted-foreground/80 shrink-0"/>;
        case 'torus': return <Torus size={12} className="mr-1 text-muted-foreground/80 shrink-0"/>;
        case 'text': return <CaseSensitive size={12} className="mr-1 text-muted-foreground/80 shrink-0"/>;
        case 'polygon': return <SquareFunction size={12} className="mr-1 text-muted-foreground/80 shrink-0"/>; // Placeholder for Polygon
        case 'circle': return <SquareFunction size={12} className="mr-1 text-muted-foreground/80 shrink-0"/>; // Placeholder for Circle (could use Circle icon)
        case 'cadPlan': return <FileText size={12} className="mr-1 text-purple-400 shrink-0"/>;
        default: return <Box size={12} className="mr-1 text-muted-foreground/80 shrink-0"/>;
    }
  }

  return (
    <AccordionItem value="item-object-hierarchy">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <LayoutList size={18} /> Outliner ({objects.length})
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-2 p-1 text-xs">
        <div className="flex gap-1.5 p-1">
            <div className="relative flex-grow">
                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                <Input 
                    placeholder="Search objects..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 text-xs pl-7"
                />
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled title="Create Group (WIP)"><Group size={14}/></Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled title="Make Component (WIP)"><Component size={14}/></Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled title="Ungroup/Explode (WIP)"><Link2Off size={14}/></Button>
        </div>
        <ScrollArea className="h-[250px] w-full rounded-md border">
          {displayedObjects.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4 px-2">
              {searchTerm ? "No objects match your search." : "No objects in scene."}
            </p>
          )}
          <div className="space-y-0.5 p-1">
            {displayedObjects.map((obj) => (
              <div
                key={obj.id}
                className={cn(
                  "flex items-center justify-between p-1.5 rounded-md hover:bg-muted/50 cursor-pointer",
                  selectedObjectId === obj.id && "bg-primary/20 ring-1 ring-primary"
                )}
                onClick={() => selectObject(obj.id)}
                title={`Name: ${obj.name}\nType: ${obj.type}\nLayer: ${obj.layerId || 'Default Layer'}\nID: ${obj.id.substring(0,8)}...`}
              >
                <div className="flex items-center gap-1 overflow-hidden flex-grow">
                  {getObjectIcon(obj.type, obj.isGroup, obj.parentId)}
                  <span className={cn("truncate", !(obj.visible ?? true) && "line-through text-muted-foreground/70", obj.locked && "opacity-70")}>
                    {obj.name} 
                  </span>
                </div>
                <div className="flex items-center shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-70 hover:opacity-100"
                    onClick={(e) => { e.stopPropagation(); handleToggleLock(obj.id, obj.locked); }}
                    title={obj.locked ? "Unlock Object" : "Lock Object"}
                  >
                    {obj.locked ? <Lock size={12} /> : <Unlock size={12} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-70 hover:opacity-100"
                    onClick={(e) => { e.stopPropagation(); handleToggleVisibility(obj.id, obj.visible); }}
                     title={obj.visible ?? true ? "Hide Object" : "Show Object"}
                  >
                    {obj.visible ?? true ? <Eye size={12} /> : <EyeOff size={12} />}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive opacity-70 hover:opacity-100"
                        onClick={(e) => e.stopPropagation()} 
                        title="Delete Object"
                        disabled={obj.locked}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{obj.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the object.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteObject(obj.id, obj.name)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        {filteredObjects.length > visibleItemsCount && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2 text-xs h-8"
            onClick={handleLoadMore}
          >
            <ChevronDown size={14} className="mr-2" />
            Load More ({filteredObjects.length - visibleItemsCount} remaining)
          </Button>
        )}
         <p className="text-[10px] text-muted-foreground text-center pt-1 italic">WIP: Drag & drop parenting, context menus, advanced grouping.</p>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ObjectHierarchyPanel;
