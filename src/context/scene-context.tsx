
"use client";

import type React from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { SceneData, SceneObject, MaterialProperties, AmbientLightProps, DirectionalLightProps, PrimitiveType, ToolType, AppMode } from '@/types';
import { DEFAULT_MATERIAL_ID, DEFAULT_MATERIAL_NAME } from '@/types';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

interface SceneContextType extends Omit<SceneData, 'objects' | 'materials' | 'appMode'> {
  objects: SceneObject[];
  materials: MaterialProperties[];
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  addObject: (type: PrimitiveType, materialId?: string) => SceneObject;
  updateObject: (id: string, updates: Partial<SceneObject>) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  addMaterial: (props?: Partial<Omit<MaterialProperties, 'id'>>) => MaterialProperties;
  updateMaterial: (id: string, updates: Partial<MaterialProperties>) => void;
  removeMaterial: (id: string) => void;
  getMaterialById: (id: string) => MaterialProperties | undefined;
  updateAmbientLight: (updates: Partial<AmbientLightProps>) => void;
  updateDirectionalLight: (updates: Partial<DirectionalLightProps>) => void;
  loadScene: (data: SceneData) => void;
  clearScene: () => void;
  selectedObjectId: string | null | undefined;
  activeTool: ToolType | undefined;
  setActiveTool: (tool: ToolType | undefined) => void;
}

const SceneContext = createContext<SceneContextType | undefined>(undefined);

const initialDefaultMaterial: MaterialProperties = {
  id: DEFAULT_MATERIAL_ID,
  name: DEFAULT_MATERIAL_NAME,
  color: '#cccccc',
  roughness: 0.5,
  metalness: 0.5,
};

const initialSceneData: SceneData = {
  objects: [],
  materials: [initialDefaultMaterial],
  ambientLight: {
    color: '#ffffff',
    intensity: 0.5,
  },
  directionalLight: {
    color: '#ffffff',
    intensity: 1.0,
    position: [5, 10, 7.5],
    castShadow: true,
    shadowBias: -0.0001,
  },
  selectedObjectId: null,
  activeTool: 'select',
  appMode: 'modelling',
};

export const SceneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sceneData, setSceneData] = useState<SceneData>(initialSceneData);

  const setAppMode = useCallback((mode: AppMode) => {
    setSceneData(prev => ({ ...prev, appMode: mode, activeTool: 'select', selectedObjectId: null })); // Reset tool and selection on mode change
  }, []);

  const addObject = useCallback((type: PrimitiveType, materialId: string = DEFAULT_MATERIAL_ID): SceneObject => {
    const newObject: SceneObject = {
      id: uuidv4(),
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${sceneData.objects.filter(o => o.type === type).length + 1}`,
      position: [0, 0.5, 0], // Default position, adjust based on primitive
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      dimensions: type === 'cube' ? { width: 1, height: 1, depth: 1 } : 
                  type === 'cylinder' ? { radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 32 } :
                  type === 'plane' ? { width: 10, height: 10 } : {},
      materialId: materialId,
    };
    if (type === 'plane') newObject.position = [0,0,0];

    setSceneData(prev => ({
      ...prev,
      objects: [...prev.objects, newObject],
    }));
    return newObject;
  }, [sceneData.objects]);

  const updateObject = useCallback((id: string, updates: Partial<SceneObject>) => {
    setSceneData(prev => ({
      ...prev,
      objects: prev.objects.map(obj => obj.id === id ? { ...obj, ...updates } : obj),
    }));
  }, []);

  const removeObject = useCallback((id: string) => {
    setSceneData(prev => ({
      ...prev,
      objects: prev.objects.filter(obj => obj.id !== id),
      selectedObjectId: prev.selectedObjectId === id ? null : prev.selectedObjectId,
    }));
  }, []);

  const selectObject = useCallback((id: string | null) => {
    setSceneData(prev => ({ ...prev, selectedObjectId: id }));
  }, []);
  
  const addMaterial = useCallback((props?: Partial<Omit<MaterialProperties, 'id'>>): MaterialProperties => {
    const newMaterial: MaterialProperties = {
      id: uuidv4(),
      name: `Material ${sceneData.materials.length}`,
      color: '#ffffff',
      roughness: 0.5,
      metalness: 0.5,
      ...props,
    };
    setSceneData(prev => ({
      ...prev,
      materials: [...prev.materials, newMaterial],
    }));
    return newMaterial;
  }, [sceneData.materials.length]);

  const updateMaterial = useCallback((id: string, updates: Partial<MaterialProperties>) => {
    setSceneData(prev => ({
      ...prev,
      materials: prev.materials.map(mat => mat.id === id ? { ...mat, ...updates } : mat),
    }));
  }, []);

  const removeMaterial = useCallback((id: string) => {
    if (id === DEFAULT_MATERIAL_ID) return; // Cannot remove default material
    setSceneData(prev => ({
      ...prev,
      materials: prev.materials.filter(mat => mat.id !== id),
      // Optionally, re-assign objects using this material to default
      objects: prev.objects.map(obj => obj.materialId === id ? { ...obj, materialId: DEFAULT_MATERIAL_ID } : obj),
    }));
  }, []);

  const getMaterialById = useCallback((id: string): MaterialProperties | undefined => {
    return sceneData.materials.find(mat => mat.id === id);
  }, [sceneData.materials]);

  const updateAmbientLight = useCallback((updates: Partial<AmbientLightProps>) => {
    setSceneData(prev => ({ ...prev, ambientLight: { ...prev.ambientLight, ...updates } }));
  }, []);

  const updateDirectionalLight = useCallback((updates: Partial<DirectionalLightProps>) => {
    setSceneData(prev => ({ ...prev, directionalLight: { ...prev.directionalLight, ...updates } }));
  }, []);

  const loadScene = useCallback((data: SceneData) => {
    if (data && data.objects && data.materials && data.ambientLight && data.directionalLight) {
      let materials = data.materials;
      if (!materials.find(m => m.id === DEFAULT_MATERIAL_ID)) {
        materials = [initialDefaultMaterial, ...materials];
      }
      setSceneData({...initialSceneData, ...data, materials, appMode: data.appMode || 'modelling', activeTool: data.activeTool || 'select'});
    } else {
      console.error("Invalid scene data format");
    }
  }, []);

  const clearScene = useCallback(() => {
    const currentAppMode = sceneData.appMode;
    const newInitialData = {
        ...initialSceneData,
        appMode: currentAppMode, // Preserve current app mode
        materials: [initialDefaultMaterial], 
        objects: [],
        selectedObjectId: null,
        activeTool: 'select',
    };
    setSceneData(newInitialData);
  }, [sceneData.appMode]);

  const setActiveTool = useCallback((tool: ToolType | undefined) => {
    setSceneData(prev => ({ ...prev, activeTool: tool }));
  }, []);
  
  const contextValue = useMemo(() => ({
    ...sceneData,
    setAppMode,
    addObject,
    updateObject,
    removeObject,
    selectObject,
    addMaterial,
    updateMaterial,
    removeMaterial,
    getMaterialById,
    updateAmbientLight,
    updateDirectionalLight,
    loadScene,
    clearScene,
    activeTool: sceneData.activeTool,
    setActiveTool,
  }), [sceneData, setAppMode, addObject, updateObject, removeObject, selectObject, addMaterial, updateMaterial, removeMaterial, getMaterialById, updateAmbientLight, updateDirectionalLight, loadScene, clearScene, setActiveTool]);

  return (
    <SceneContext.Provider value={contextValue}>
      {children}
    </SceneContext.Provider>
  );
};

export const useScene = (): SceneContextType => {
  const context = useContext(SceneContext);
  if (context === undefined) {
    throw new Error('useScene must be used within a SceneProvider');
  }
  return context;
};
