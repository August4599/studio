
"use client";

import React, { useState } from 'react';
import { useProject } from '@/context/project-context';
import ProjectCard from './project-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderPlus, Loader2, LayoutGrid, List } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"


const ProjectDashboard: React.FC = () => {
  const { projects, createProject, isLoading: projectsLoading } = useProject();
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      // Consider adding a toast notification here
      alert("Project name cannot be empty.");
      return;
    }
    setIsCreating(true);
    await createProject(newProjectName.trim());
    setIsCreating(false);
    setNewProjectName('');
    setIsCreateDialogOpen(false);
  };
  
  const sortedProjects = [...projects].sort((a, b) => b.lastModified - a.lastModified);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground p-4 md:p-8">
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className='flex items-center gap-2'>
             <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <h1 className="text-3xl font-bold">ArchiVision Projects</h1>
          </div>
          <div className="flex items-center gap-2">
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => { if (value) setViewMode(value as 'grid' | 'list')}} size="sm">
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <FolderPlus size={18} className="mr-2" /> New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Enter a name for your new ArchiVision project.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="Project Name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    disabled={isCreating}
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isCreating}>Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleCreateProject} disabled={isCreating || !newProjectName.trim()}>
                    {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Project
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {projectsLoading && !sortedProjects.length ? (
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
           <span className="ml-2">Loading projects...</span>
        </div>
      ) : !sortedProjects.length ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-muted-foreground">
          <FolderPlus size={48} className="mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">No Projects Yet</h2>
          <p className="mb-4">Click "New Project" to get started.</p>
        </div>
      ) : (
        <ScrollArea className="flex-grow -mx-2 px-2">
          <div className={cn(
            "gap-4 pb-8",
            viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "flex flex-col space-y-3"
          )}>
            {sortedProjects.map(project => (
              <ProjectCard key={project.id} projectSummary={project} viewMode={viewMode} />
            ))}
          </div>
        </ScrollArea>
      )}
       <footer className="text-center text-xs text-muted-foreground pt-4 border-t">
        © {new Date().getFullYear()} ArchiVision. All rights reserved.
      </footer>
    </div>
  );
};

export default ProjectDashboard;
