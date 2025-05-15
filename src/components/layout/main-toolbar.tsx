
"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers3, Aperture, FolderArchive, Save, Undo, Redo } from "lucide-react";
import { useScene } from '@/context/scene-context';
import { useProject } from '@/context/project-context';
import type { AppMode } from '@/types';

const AppModeSwitcher: React.FC = () => {
  const { appMode, setAppMode } = useScene();
  const [currentMode, setCurrentMode] = React.useState<AppMode>(appMode || 'modelling');

  React.useEffect(() => {
    setCurrentMode(appMode || 'modelling');
  }, [appMode]);
  
  const handleModeChange = (mode: string) => {
    setAppMode(mode as AppMode);
    setCurrentMode(mode as AppMode);
  };

  return (
    <Tabs value={currentMode} onValueChange={handleModeChange} className="w-auto">
      <TabsList className="grid grid-cols-2 h-9 rounded-md p-0 bg-muted/60 border">
        <TabsTrigger 
          value="modelling" 
          className="h-full rounded-l-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm px-4 text-xs"
        >
          <Layers3 size={14} className="mr-1.5" /> Shape & Material
        </TabsTrigger>
        <TabsTrigger 
          value="rendering" 
          className="h-full rounded-r-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm px-4 text-xs"
        >
          <Aperture size={14} className="mr-1.5" /> Visualize & Export
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

const MainToolbar: React.FC = () => {
  const { currentProject, closeProject, saveCurrentProjectScene } = useProject();
  const { getCurrentSceneData } = useScene();

  const handleSaveProject = () => {
    if (currentProject) {
      const sceneData = getCurrentSceneData();
      saveCurrentProjectScene(sceneData);
      // Add toast notification for save
    }
  };

  return (
    <div className="flex items-center justify-between border-b bg-card shadow-sm h-14 px-4 flex-none">
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-primary">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>
        <h1 className="text-xl font-semibold hidden sm:block">ArchiVision</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" title="Save Project (WIP)" onClick={handleSaveProject} disabled={!currentProject}>
          <Save size={18} />
        </Button>
        <Button variant="ghost" size="icon" title="Undo (WIP)" disabled>
          <Undo size={18} />
        </Button>
        <Button variant="ghost" size="icon" title="Redo (WIP)" disabled>
          <Redo size={18} />
        </Button>
      </div>

      <AppModeSwitcher />
      
      <div className="flex items-center gap-2">
         <Button variant="outline" size="sm" onClick={closeProject}>
            <FolderArchive size={16} className="mr-2"/> {currentProject?.name || "Projects"}
         </Button>
         {/* Placeholder for User Profile/Settings Dropdown */}
         <Button variant="ghost" size="icon" title="User Settings (WIP)" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
         </Button>
      </div>
    </div>
  );
};

export default MainToolbar;
