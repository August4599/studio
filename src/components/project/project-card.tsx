
"use client";

import React, { useState } from 'react';
import type { ProjectSummary } from '@/types';
import { useProject } from '@/context/project-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Edit3, Trash2, Loader2, FolderOpen, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';


interface ProjectCardProps {
  projectSummary: ProjectSummary;
  viewMode: 'grid' | 'list';
}

const ProjectCard: React.FC<ProjectCardProps> = ({ projectSummary, viewMode }) => {
  const { openProject, deleteProject, renameProject, isLoading } = useProject();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(projectSummary.name);
  const { toast } = useToast();

  const handleOpen = () => {
    if (isLoading) return;
    openProject(projectSummary.id);
  };

  const handleDelete = async () => {
    if (isLoading) return;
    await deleteProject(projectSummary.id);
    toast({ title: "Project Deleted", description: `"${projectSummary.name}" has been deleted.` });
  };

  const handleRename = async () => {
    if (isLoading || !newName.trim() || newName.trim() === projectSummary.name) {
      setIsRenaming(false);
      if (!newName.trim()) setNewName(projectSummary.name); // Reset if empty
      return;
    }
    await renameProject(projectSummary.id, newName.trim());
    toast({ title: "Project Renamed", description: `Project renamed to "${newName.trim()}".` });
    setIsRenaming(false);
  };

  const lastModifiedFormatted = formatDistanceToNow(new Date(projectSummary.lastModified), { addSuffix: true });

  const cardContent = (
    <>
      {viewMode === 'grid' && (
        <div className="aspect-[16/10] bg-muted/50 rounded-t-lg flex items-center justify-center overflow-hidden border-b">
          {projectSummary.thumbnail ? (
            <Image 
              src={projectSummary.thumbnail} 
              alt={`${projectSummary.name} thumbnail`} 
              width={300} 
              height={187} 
              className="object-cover w-full h-full" 
              data-ai-hint="architectural model"
            />
          ) : (
            <ImageIcon size={48} className="text-muted-foreground opacity-50" />
          )}
        </div>
      )}
      <CardHeader className={cn(viewMode === 'list' && "flex-row items-center gap-4 p-3")}>
        {viewMode === 'list' && (
          <div className="w-16 h-10 bg-muted/50 rounded flex items-center justify-center overflow-hidden border shrink-0">
             {projectSummary.thumbnail ? (
              <Image src={projectSummary.thumbnail} alt="" width={64} height={40} className="object-cover w-full h-full" data-ai-hint="abstract design"/>
            ) : (
              <ImageIcon size={20} className="text-muted-foreground opacity-50" />
            )}
          </div>
        )}
        <div className="flex-grow overflow-hidden">
          <CardTitle className={cn("truncate", viewMode === 'grid' ? "text-lg" : "text-base") } title={projectSummary.name}>
            {projectSummary.name}
          </CardTitle>
          <CardDescription className="text-xs">
            Last modified: {lastModifiedFormatted}
          </CardDescription>
        </div>
      </CardHeader>
      {viewMode === 'grid' && (
         <CardContent className="p-4 pt-0 text-sm">
          {/* Optional: Add short description or project stats here for grid view */}
        </CardContent>
      )}
      <CardFooter className={cn(
        "gap-2 p-4 pt-0",
        viewMode === 'list' && "p-3 border-l ml-auto flex-col sm:flex-row sm:items-center shrink-0"
      )}>
        <Button onClick={handleOpen} variant="default" size={viewMode === 'grid' ? "sm" : "xs"} className="w-full sm:w-auto" disabled={isLoading}>
          <FolderOpen size={16} className="mr-2" /> Open
          {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        </Button>
        <Dialog open={isRenaming} onOpenChange={(open) => {
            if (!open) setNewName(projectSummary.name); // Reset name if dialog is closed without saving
            setIsRenaming(open);
        }}>
          <DialogTrigger asChild>
            <Button variant="outline" size={viewMode === 'grid' ? "icon" : "xs"} className={cn(viewMode === 'list' && "w-full sm:w-auto")} disabled={isLoading}>
              <Edit3 size={viewMode === 'grid' ? 18 : 14} />
              {viewMode === 'list' && <span className="ml-1 sm:ml-2">Rename</span>}
              <span className="sr-only">Rename</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Project</DialogTitle>
              <DialogDescription>
                Enter a new name for &quot;{projectSummary.name}&quot;.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New project name"
                disabled={isLoading}
              />
            </div>
            <DialogFooter>
               <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
              </DialogClose>
              <Button onClick={handleRename} disabled={isLoading || !newName.trim() || newName.trim() === projectSummary.name}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Name
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size={viewMode === 'grid' ? "icon" : "xs"} className={cn(viewMode === 'list' && "w-full sm:w-auto")} disabled={isLoading}>
              <Trash2 size={viewMode === 'grid' ? 18 : 14} />
              {viewMode === 'list' && <span className="ml-1 sm:ml-2">Delete</span>}
              <span className="sr-only">Delete</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &quot;{projectSummary.name}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the project and all its data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Project
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </>
  );
  
  if (viewMode === 'list') {
    return (
      <Card className="flex flex-row hover:shadow-md transition-shadow duration-200">
        {cardContent}
      </Card>
    );
  }

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-200">
      {cardContent}
    </Card>
  );
};

export default ProjectCard;
