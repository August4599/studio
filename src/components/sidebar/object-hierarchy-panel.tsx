
"use client";

import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useScene } from "@/context/scene-context";
import { Eye, EyeOff, Trash2, Layers } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const ObjectHierarchyPanel = () => {
  const { objects, selectedObjectId, selectObject, updateObject, removeObject } = useScene();
  const { toast } = useToast();

  const handleToggleVisibility = (id: string, currentVisibility?: boolean) => {
    updateObject(id, { visible: !(currentVisibility ?? true) });
  };

  const handleDeleteObject = (id: string, name: string) => {
    removeObject(id);
    toast({ title: "Object Deleted", description: `${name} removed from scene.` });
  };

  return (
    <AccordionItem value="item-object-hierarchy">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <Layers size={18} /> Scene Objects ({objects.length})
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-1">
        <ScrollArea className="h-[250px] w-full rounded-md border p-2">
          {objects.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No objects in scene.
            </p>
          )}
          <div className="space-y-1">
            {objects.map((obj) => (
              <div
                key={obj.id}
                className={cn(
                  "flex items-center justify-between p-1.5 rounded-md text-xs hover:bg-muted/50 cursor-pointer",
                  selectedObjectId === obj.id && "bg-primary/20 text-primary-foreground"
                )}
                onClick={() => selectObject(obj.id)}
              >
                <span className={cn("truncate", !(obj.visible ?? true) && "line-through text-muted-foreground/70")}>
                  {obj.name} ({obj.type})
                </span>
                <div className="flex items-center shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent selection when clicking visibility
                      handleToggleVisibility(obj.id, obj.visible);
                    }}
                  >
                    {obj.visible ?? true ? <Eye size={12} /> : <EyeOff size={12} />}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={(e) => e.stopPropagation()} // Prevent selection
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
      </AccordionContent>
    </AccordionItem>
  );
};

export default ObjectHierarchyPanel;
