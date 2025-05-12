"use client";

import type React from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { SceneData, SceneObject, MaterialProperties, AmbientLightProps, DirectionalLightProps, PrimitiveType, ToolType, AppMode, DrawingState } from '@/types';
import { DEFAULT_MATERIAL_ID, DEFAULT_MATERIAL_NAME } from '@/types';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

interface SceneContextType extends Omit<SceneData, 'objects' | 'materials' | 'appMode' | 'activePaintMaterialId' | 'drawingState'> {
  objects: SceneObject[];
  materials: MaterialProperties[];
  appMode: AppMode;
  activePaintMaterialId: string | null | undefined;
  drawingState: DrawingState;
  setAppMode: (mode: AppMode) => void;
  addObject: (type: PrimitiveType, initialProps?: Partial<Omit<SceneObject, 'id' | 'type'>>) => SceneObject;
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
  setDrawingState: (newState: Partial<DrawingState>) => void;
}

const SceneContext = createContext<SceneContextType | undefined>(undefined);

const initialDefaultMaterial: MaterialProperties = {
  id: DEFAULT_MATERIAL_ID,
  name: DEFAULT_MATERIAL_NAME,
  color: '#B0B0B0', 
  roughness: 0.6,
  metalness: 0.3,
};

const initialDrawingState: DrawingState = {
  isActive: false,
  tool: null,
  startPoint: null,
  currentPoint: null,
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
  appMode: 'modelling',
  drawingState: initialDrawingState,
};

export const SceneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sceneData, setSceneData] = useState<SceneData>(initialSceneData);

  const setAppMode = useCallback((mode: AppMode) => {
    if (mode === 'modelling' || mode === 'rendering') {
      setSceneData(prev => ({ ...prev, appMode: mode, activeTool: 'select', selectedObjectId: null, drawingState: initialDrawingState }));
    } else {
      setSceneData(prev => ({ ...prev, appMode: 'modelling', activeTool: 'select', selectedObjectId: null, drawingState: initialDrawingState }));
    }
  }, []);

  const addObject = useCallback((type: PrimitiveType, initialProps?: Partial<Omit<SceneObject, 'id' | 'type'>>): SceneObject => {
    const baseName = type.charAt(0).toUpperCase() + type.slice(1);
    const count = sceneData.objects.filter(o => o.type === type && o.name.startsWith(baseName)).length + 1;

    let defaultDimensions: SceneObject['dimensions'] = {};
    let defaultPosition: [number, number, number] = [0, 0.5, 0];
    let defaultRotation: [number, number, number] = [0, 0, 0];
    let defaultScale: [number, number, number] = [1, 1, 1];

    switch (type) {
      case 'cube':
        defaultDimensions = { width: 1, height: 1, depth: 1 };
        defaultPosition = [0, (defaultDimensions.height || 1) / 2, 0];
        break;
      case 'cylinder':
        defaultDimensions = { radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 32 };
        defaultPosition = [0, (defaultDimensions.height || 1) / 2, 0];
        break;
      case 'plane':
        defaultDimensions = { width: 10, height: 10 }; // Default large plane
        defaultPosition = [0, 0, 0]; // Centered at origin on the XZ plane
        defaultRotation = [-Math.PI / 2, 0, 0]; // Rotated to be flat on XZ by default
        break;
      case 'text':
        defaultDimensions = { text: "3D Text", fontSize: 1, depth: 0.2, width: 2, height: 0.5 };
        defaultPosition = [0, (defaultDimensions.height || 0.5) / 2, 0]; // Assume text is Y-up initially
        // For text on XZ plane, rotation would be similar to plane, but depends on text geometry generation
        break;
    }
    
    const newObject: SceneObject = {
      id: uuidv4(),
      type,
      name: initialProps?.name || `${baseName} ${count}`,
      position: initialProps?.position || defaultPosition,
      rotation: initialProps?.rotation || defaultRotation,
      scale: initialProps?.scale || defaultScale,
      dimensions: { ...defaultDimensions, ...initialProps?.dimensions },
      materialId: initialProps?.materialId || DEFAULT_MATERIAL_ID,
    };
    
    setSceneData(prev => ({
      ...prev,
      objects: [...prev.objects, newObject],
      selectedObjectId: newObject.id, 
      activeTool: (prev.activeTool === 'addCube' || prev.activeTool === 'addCylinder' || prev.activeTool === 'addPlane' || prev.activeTool === 'addText' || prev.activeTool === 'rectangle') ? 'select' : prev.activeTool,
      drawingState: initialDrawingState, 
    }));
    return newObject;
  }, [sceneData.objects]);

  const updateObject = useCallback((id: string, updates: Partial<SceneObject>) => {
    setSceneData(prev => ({
      ...prev,
      objects: prev.objects.map(obj => {
        if (obj.id === id) {
          const updatedObj = { ...obj, ...updates };
          if (updates.dimensions) {
            updatedObj.dimensions = { ...obj.dimensions, ...updates.dimensions };
          }
          // Auto-adjust Y position based on height for relevant objects, only if position is not explicitly part of the update.
          if (
            (updatedObj.type === 'cube' || updatedObj.type === 'cylinder' || updatedObj.type === 'text') &&
            updates.dimensions?.height !== undefined && 
            updates.position === undefined && // Only if position is not being set in this specific update call
            updatedObj.rotation[0] === 0 && updatedObj.rotation[2] === 0 // Heuristic: Only for Y-up objects
          ) {
            updatedObj.position = [...updatedObj.position]; 
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
    setSceneData(prev => ({ ...prev, selectedObjectId: id, drawingState: initialDrawingState }));
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
      activePaintMaterialId: prev.activePaintMaterialId === id ? null : prev.activePaintMaterialId,
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
        drawingState: data.drawingState || initialDrawingState,
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
        activePaintMaterialId: currentPaintMaterial,
        drawingState: initialDrawingState,
    });
  }, [sceneData.appMode, sceneData.activePaintMaterialId]);

  const setActiveTool = useCallback((tool: ToolType | undefined) => {
    setSceneData(prev => {
      const newActivePaintMaterialId = tool === 'paint' ? prev.activePaintMaterialId : null;
      let newDrawingState = prev.drawingState;

      const drawingTools: ToolType[] = ['rectangle', 'line', 'arc'];
      const isSwitchingToNonDrawingTool = tool === undefined || !drawingTools.includes(tool);
      const isSwitchingBetweenDrawingTools = tool && drawingTools.includes(tool) && prev.drawingState.tool !== tool;

      if (isSwitchingToNonDrawingTool || isSwitchingBetweenDrawingTools) {
        newDrawingState = initialDrawingState; // Reset fully
      }
      
      if (tool && drawingTools.includes(tool)) { // If it's a drawing tool, ensure its type is set.
          newDrawingState = { ...newDrawingState, tool: tool as 'rectangle' | 'line' | 'arc' };
      }


      return { ...prev, activeTool: tool, activePaintMaterialId: newActivePaintMaterialId, drawingState: newDrawingState };
    });
  }, []);

  const setActivePaintMaterialId = useCallback((materialId: string | null) => {
    setSceneData(prev => ({ ...prev, activePaintMaterialId: materialId}));
  }, []);

  const setDrawingState = useCallback((newState: Partial<DrawingState>) => {
    setSceneData(prev => ({
      ...prev,
      drawingState: { ...prev.drawingState, ...newState }
    }));
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
    setDrawingState,
  }), [sceneData, setAppMode, addObject, updateObject, removeObject, selectObject, addMaterial, updateMaterial, removeMaterial, getMaterialById, updateAmbientLight, updateDirectionalLight, loadScene, clearScene, setActiveTool, setActivePaintMaterialId, setDrawingState]);

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
