
"use client";

import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState, useMemo } from 'react';
import type { Project, ProjectSummary, SceneData } from '@/types';
import { 
  getProjects as getProjectsFromStorage, 
  getProjectById as getProjectByIdFromStorage,
  createNewProject as createNewProjectInStorage,
  updateProject as updateProjectInStorage,
  deleteProject as deleteProjectFromStorage,
  getProjectSummaries as getProjectSummariesFromStorage,
} from '@/lib/project-manager';

interface ProjectContextType {
  projects: ProjectSummary[];
  currentProject: Project | null;
  isLoading: boolean;
  createProject: (name: string) => Promise<Project | null>;
  openProject: (id: string) => Promise<void>;
  saveCurrentProjectScene: (sceneData: SceneData) => Promise<void>;
  closeProject: () => void;
  deleteProject: (id: string) => Promise<void>;
  renameProject: (id: string, newName: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setProjects(getProjectSummariesFromStorage());
    // Potentially load last opened project here
    // For now, start with no project open
    setIsLoading(false);
  }, []);

  const refreshProjectList = useCallback(() => {
    setProjects(getProjectSummariesFromStorage());
  }, []);

  const createProject = useCallback(async (name: string): Promise<Project | null> => {
    setIsLoading(true);
    try {
      const newProject = createNewProjectInStorage(name);
      refreshProjectList();
      setCurrentProject(newProject); // Automatically open the new project
      setIsLoading(false);
      return newProject;
    } catch (error) {
      console.error("Failed to create project:", error);
      setIsLoading(false);
      return null;
    }
  }, [refreshProjectList]);

  const openProject = useCallback(async (id: string) => {
    setIsLoading(true);
    const projectToOpen = getProjectByIdFromStorage(id);
    setCurrentProject(projectToOpen);
    setIsLoading(false);
  }, []);

  const saveCurrentProjectScene = useCallback(async (sceneData: SceneData) => {
    if (!currentProject) {
      console.error("No current project to save to.");
      return;
    }
    setIsLoading(true);
    const updatedProject = updateProjectInStorage(currentProject.id, { sceneData });
    if (updatedProject) {
      setCurrentProject(updatedProject); // Keep currentProject in sync
      refreshProjectList(); // Update lastModified in the list
    }
    setIsLoading(false);
  }, [currentProject, refreshProjectList]);

  const closeProject = useCallback(() => {
    setCurrentProject(null);
    // Optionally, clear last opened project ID from localStorage here
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    setIsLoading(true);
    deleteProjectFromStorage(id);
    if (currentProject?.id === id) {
      setCurrentProject(null);
    }
    refreshProjectList();
    setIsLoading(false);
  }, [currentProject, refreshProjectList]);

  const renameProject = useCallback(async (id: string, newName: string) => {
    setIsLoading(true);
    const updatedProject = updateProjectInStorage(id, { name: newName });
     if (updatedProject) {
        if (currentProject?.id === id) {
            setCurrentProject(updatedProject);
        }
        refreshProjectList();
    }
    setIsLoading(false);
  }, [currentProject, refreshProjectList]);
  

  const contextValue = useMemo(() => ({
    projects,
    currentProject,
    isLoading,
    createProject,
    openProject,
    saveCurrentProjectScene,
    closeProject,
    deleteProject,
    renameProject,
  }), [projects, currentProject, isLoading, createProject, openProject, saveCurrentProjectScene, closeProject, deleteProject, renameProject]);

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
