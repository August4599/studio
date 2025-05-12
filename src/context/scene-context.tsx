"use client";

import type React from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { SceneData, SceneObject, MaterialProperties, AmbientLightProps, DirectionalLightProps, PrimitiveType } from '@/types';
import { DEFAULT_MATERIAL_ID } from '@/types';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

interface SceneContextType extends Omit<SceneData, 'objects' | 'materials'> {
  objects: SceneObject[]; // Keep for viewer consumption
  materials: MaterialProperties[]; // Keep for viewer consumption
  // addObject: (type: PrimitiveType) => void; // Removed
  updateObject: (id: string, updates: Partial<SceneObject>) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  // addMaterial: (material: Partial<Omit<MaterialProperties, 'id'>>) => string; // Removed
  updateMaterial: (id: string, updates: Partial<MaterialProperties>) => void; // Retained for potential use with node-selected materials
  getMaterialById: (id: string) => MaterialProperties | undefined;
  updateAmbientLight: (updates: Partial<AmbientLightProps>) => void;
  updateDirectionalLight: (updates: Partial<DirectionalLightProps>) => void;
  loadScene: (data: SceneData) => void;
  clearScene: () => void;
  selectedObjectId: string | null | undefined;
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

  // addObject removed - object creation will be handled by a node system
  // const addObject = useCallback((type: PrimitiveType) => { ... });

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

  // addMaterial removed - material creation will be handled by a node system
  // const addMaterial = useCallback((materialProps: Partial<Omit<MaterialProperties, 'id'>>): string => { ... });
  
  const updateMaterial = useCallback((id: string, updates: Partial<MaterialProperties>) => {
    // If updating the default material, a new material should ideally be created and assigned to objects using it.
    // This logic might need refinement depending on how node-based material assignment works.
    // For now, allow updating existing materials, including the default one (though UI for this is removed).
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
    if (data && data.objects && data.materials && data.ambientLight && data.directionalLight) {
      // Ensure default material exists if loaded scene doesn't have it or if materials array is empty
      let materials = data.materials;
      if (!materials.find(m => m.id === DEFAULT_MATERIAL_ID)) {
        materials = [initialDefaultMaterial, ...materials];
      }
      setSceneData({...data, materials});
    } else {
      console.error("Invalid scene data format");
    }
  }, []);

  const clearScene = useCallback(() => {
    // Ensure initialSceneData is truly the initial state with default material
    const newInitialData = {
        ...initialSceneData,
        materials: [initialDefaultMaterial], // Ensure default material is present
        objects: [],
        selectedObjectId: null,
    };
    setSceneData(newInitialData);
  }, []);
  
  const contextValue = useMemo(() => ({
    ...sceneData, // Includes objects, materials, ambientLight, directionalLight, selectedObjectId
    // addObject, // Removed
    updateObject,
    removeObject,
    selectObject,
    // addMaterial, // Removed
    updateMaterial,
    getMaterialById,
    updateAmbientLight,
    updateDirectionalLight,
    loadScene,
    clearScene,
  }), [sceneData, updateObject, removeObject, selectObject, updateMaterial, getMaterialById, updateAmbientLight, updateDirectionalLight, loadScene, clearScene]);

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
