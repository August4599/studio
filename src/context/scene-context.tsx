"use client";

import type React from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { SceneData, SceneObject, MaterialProperties, AmbientLightProps, DirectionalLightProps, PrimitiveType } from '@/types';
import { DEFAULT_MATERIAL_ID } from '@/types';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

interface SceneContextType extends SceneData {
  addObject: (type: PrimitiveType) => void;
  updateObject: (id: string, updates: Partial<SceneObject>) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  addMaterial: (material: Partial<Omit<MaterialProperties, 'id'>>) => string;
  updateMaterial: (id: string, updates: Partial<MaterialProperties>) => void;
  getMaterialById: (id: string) => MaterialProperties | undefined;
  updateAmbientLight: (updates: Partial<AmbientLightProps>) => void;
  updateDirectionalLight: (updates: Partial<DirectionalLightProps>) => void;
  loadScene: (data: SceneData) => void;
  clearScene: () => void;
}

const SceneContext = createContext<SceneContextType | undefined>(undefined);

const initialDefaultMaterial: MaterialProperties = {
  id: DEFAULT_MATERIAL_ID,
  color: '#cccccc', // Default light gray
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
};

export const SceneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sceneData, setSceneData] = useState<SceneData>(initialSceneData);

  const addObject = useCallback((type: PrimitiveType) => {
    const newObjectId = uuidv4();
    let newObject: SceneObject;
    const baseProperties = {
      id: newObjectId,
      name: `${type}-${sceneData.objects.length + 1}`,
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
      materialId: DEFAULT_MATERIAL_ID,
    };

    switch (type) {
      case 'cube':
        newObject = { ...baseProperties, type, dimensions: { width: 1, height: 1, depth: 1 } };
        break;
      case 'cylinder':
        newObject = { ...baseProperties, type, dimensions: { radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 32 } };
        break;
      case 'plane':
        newObject = { ...baseProperties, type, dimensions: { width: 10, height: 10 } }; // Plane is often used as ground
        // Adjust default position for plane to be ground
        newObject.position = [0, -0.5, 0]; // Assuming objects are 1 unit high by default
        break;
      default:
        throw new Error(`Unsupported object type: ${type}`);
    }
    setSceneData(prev => ({ ...prev, objects: [...prev.objects, newObject], selectedObjectId: newObjectId }));
  }, [sceneData.objects.length]);

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

  const addMaterial = useCallback((materialProps: Partial<Omit<MaterialProperties, 'id'>>): string => {
    const newMaterialId = uuidv4();
    const newMaterial: MaterialProperties = {
      id: newMaterialId,
      color: '#ffffff',
      roughness: 0.5,
      metalness: 0.5,
      ...materialProps,
    };
    setSceneData(prev => ({ ...prev, materials: [...prev.materials, newMaterial] }));
    return newMaterialId;
  }, []);
  
  const updateMaterial = useCallback((id: string, updates: Partial<MaterialProperties>) => {
    setSceneData(prev => ({
      ...prev,
      materials: prev.materials.map(mat => mat.id === id ? { ...mat, ...updates } : mat),
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
    // Basic validation, can be expanded
    if (data && data.objects && data.materials && data.ambientLight && data.directionalLight) {
      setSceneData(data);
    } else {
      console.error("Invalid scene data format");
      // Potentially show a toast to the user
    }
  }, []);

  const clearScene = useCallback(() => {
    setSceneData(initialSceneData);
  }, []);

  const contextValue = useMemo(() => ({
    ...sceneData,
    addObject,
    updateObject,
    removeObject,
    selectObject,
    addMaterial,
    updateMaterial,
    getMaterialById,
    updateAmbientLight,
    updateDirectionalLight,
    loadScene,
    clearScene,
  }), [sceneData, addObject, updateObject, removeObject, selectObject, addMaterial, updateMaterial, getMaterialById, updateAmbientLight, updateDirectionalLight, loadScene, clearScene]);

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
