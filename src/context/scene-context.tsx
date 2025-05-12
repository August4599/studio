
"use client";

import type React from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { SceneData, SceneObject, MaterialProperties, AmbientLightProps, DirectionalLightProps, PrimitiveType, ToolType, AppMode } from '@/types';
import { DEFAULT_MATERIAL_ID, DEFAULT_MATERIAL_NAME } from '@/types';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

interface SceneContextType extends Omit<SceneData, 'objects' | 'materials' | 'appMode' | 'activePaintMaterialId'> {
  objects: SceneObject[];
  materials: MaterialProperties[];
  appMode: AppMode;
  activePaintMaterialId: string | null | undefined;
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
  setActivePaintMaterialId: (materialId: string | null) => void;
}

const SceneContext = createContext<SceneContextType | undefined>(undefined);

const initialDefaultMaterial: MaterialProperties = {
  id: DEFAULT_MATERIAL_ID,
  name: DEFAULT_MATERIAL_NAME,
  color: '#B0B0B0', 
  roughness: 0.6,
  metalness: 0.3,
};

const initialSceneData: SceneData = {
  objects: [],
  materials: [initialDefaultMaterial],
  ambientLight: {
    color: '#ffffff',
    intensity: 0.7, 
  },
  directionalLight: {
    color: '#ffffff',
    intensity: 1.5, 
    position: [5, 10, 7.5],
    castShadow: true,
    shadowBias: -0.0005, 
  },
  selectedObjectId: null,
  activeTool: 'select',
  activePaintMaterialId: null,
  appMode: 'modelling', // Default app mode
};

export const SceneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sceneData, setSceneData] = useState<SceneData>(initialSceneData);

  const setAppMode = useCallback((mode: AppMode) => {
    if (mode === 'modelling' || mode === 'rendering') {
      setSceneData(prev => ({ ...prev, appMode: mode, activeTool: 'select', selectedObjectId: null }));
    } else {
      setSceneData(prev => ({ ...prev, appMode: 'modelling', activeTool: 'select', selectedObjectId: null }));
    }
  }, []);

  const addObject = useCallback((type: PrimitiveType, materialId: string = DEFAULT_MATERIAL_ID): SceneObject => {
    let newObject: SceneObject;
    const baseName = type.charAt(0).toUpperCase() + type.slice(1);
    const count = sceneData.objects.filter(o => o.type === type).length + 1;

    switch (type) {
      case 'text':
        newObject = {
          id: uuidv4(),
          type,
          name: `${baseName} Placeholder ${count}`,
          position: [0, 0.5, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          dimensions: { 
            text: "3D Text", 
            fontSize: 1, 
            depth: 0.2, // Placeholder dimension for depth/extrusion
            width: 2, height: 0.5, // Placeholder dimensions for bounding box of "text" cube
          }, 
          materialId: materialId,
        };
        // Position for text placeholder (thin cube)
        newObject.position[1] = (newObject.dimensions.height || 0.5) / 2;
        break;
      default: // cube, cylinder, plane
        newObject = {
          id: uuidv4(),
          type,
          name: `${baseName} ${count}`,
          position: [0, 0.5, 0], 
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          dimensions: type === 'cube' ? { width: 1, height: 1, depth: 1 } : 
                      type === 'cylinder' ? { radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 32 } :
                      type === 'plane' ? { width: 10, height: 10 } : {},
          materialId: materialId,
        };
        if (type === 'cube' || type === 'cylinder') {
          newObject.position[1] = (newObject.dimensions.height || 1) / 2;
        } else if (type === 'plane') {
          newObject.position = [0,0,0]; 
        }
    }
    
    setSceneData(prev => ({
      ...prev,
      objects: [...prev.objects, newObject],
      selectedObjectId: newObject.id, 
      activeTool: 'select', 
    }));
    return newObject;
  }, [sceneData.objects]);

  const updateObject = useCallback((id: string, updates: Partial<SceneObject>) => {
    setSceneData(prev => ({
      ...prev,
      objects: prev.objects.map(obj => {
        if (obj.id === id) {
          const updatedObj = { ...obj, ...updates };
          // Adjust Y position if height changes for relevant types
          if ((updatedObj.type === 'cube' || updatedObj.type === 'cylinder' || updatedObj.type === 'text') && updates.dimensions?.height !== undefined) {
            updatedObj.position[1] = (updatedObj.dimensions.height || 1) / 2;
          }
          return updatedObj;
        }
        return obj;
      }),
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
    if (id === DEFAULT_MATERIAL_ID) return; 
    setSceneData(prev => ({
      ...prev,
      materials: prev.materials.filter(mat => mat.id !== id),
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
      const defaultMaterialExists = materials.some(m => m.id === DEFAULT_MATERIAL_ID);

      if (!defaultMaterialExists) {
        const loadedDefaultByName = materials.find(m => m.name === DEFAULT_MATERIAL_NAME);
        if (loadedDefaultByName) {
          loadedDefaultByName.id = DEFAULT_MATERIAL_ID; 
          materials = materials.map(m => m.id === DEFAULT_MATERIAL_ID ? {...initialDefaultMaterial, ...m} : m);
        } else {
          materials = [initialDefaultMaterial, ...materials];
        }
      } else {
         materials = materials.map(m => m.id === DEFAULT_MATERIAL_ID ? {...initialDefaultMaterial, ...m} : m);
      }
      
      const validMaterialIds = new Set(materials.map(m => m.id));
      const objects = data.objects.map(obj => ({
        ...obj,
        materialId: validMaterialIds.has(obj.materialId) ? obj.materialId : DEFAULT_MATERIAL_ID
      }));

      const validAppMode = (data.appMode === 'modelling' || data.appMode === 'rendering') ? data.appMode : 'modelling';

      setSceneData({
        ...initialSceneData, 
        ...data, 
        materials, 
        objects, 
        appMode: validAppMode, 
        activeTool: data.activeTool || 'select',
        activePaintMaterialId: data.activePaintMaterialId || null,
      });
    } else {
      console.error("Invalid scene data format");
    }
  }, []);

  const clearScene = useCallback(() => {
    const currentAppMode = sceneData.appMode; 
    const currentPaintMaterial = sceneData.activePaintMaterialId;
    setSceneData({
        ...initialSceneData, 
        appMode: currentAppMode, 
        materials: [initialDefaultMaterial], 
        objects: [],
        selectedObjectId: null,
        activeTool: 'select',
        activePaintMaterialId: currentPaintMaterial, // Preserve active paint material
    });
  }, [sceneData.appMode, sceneData.activePaintMaterialId]);

  const setActiveTool = useCallback((tool: ToolType | undefined) => {
    setSceneData(prev => {
      // If switching away from 'paint' tool, clear the activePaintMaterialId
      const newActivePaintMaterialId = tool === 'paint' ? prev.activePaintMaterialId : null;
      return { ...prev, activeTool: tool, activePaintMaterialId: newActivePaintMaterialId };
    });
  }, []);

  const setActivePaintMaterialId = useCallback((materialId: string | null) => {
    setSceneData(prev => ({ ...prev, activePaintMaterialId: materialId}));
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
    activePaintMaterialId: sceneData.activePaintMaterialId,
    setActivePaintMaterialId,
  }), [sceneData, setAppMode, addObject, updateObject, removeObject, selectObject, addMaterial, updateMaterial, removeMaterial, getMaterialById, updateAmbientLight, updateDirectionalLight, loadScene, clearScene, setActiveTool, setActivePaintMaterialId]);

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
