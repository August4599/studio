
"use client";

import type React from 'react';
import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import type { SceneData, SceneObject, MaterialProperties, AmbientLightProps, DirectionalLightProps, PrimitiveType, ToolType, AppMode, DrawingState, SceneObjectDimensions, PushPullFaceInfo } from '@/types';
import { DEFAULT_MATERIAL_ID, DEFAULT_MATERIAL_NAME } from '@/types';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { getDefaultSceneData } from '@/lib/project-manager'; // To get default scene for new projects


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
  loadScene: (data: SceneData) => void; // Now primarily for internal use / project loading
  clearCurrentProjectScene: () => void; // Renamed from clearScene
  selectedObjectId: string | null | undefined;
  activeTool: ToolType | undefined;
  setActiveTool: (tool: ToolType | undefined) => void;
  setActivePaintMaterialId: (materialId: string | null) => void;
  setDrawingState: (newState: Partial<DrawingState>) => void;
  getCurrentSceneData: () => SceneData; // To provide data for saving
}

const SceneContext = createContext<SceneContextType | undefined>(undefined);

const initialSceneDataBlueprint: SceneData = getDefaultSceneData();

export const SceneProvider: React.FC<{ children: React.ReactNode, initialSceneOverride?: SceneData }> = ({ children, initialSceneOverride }) => {
  const [sceneData, setSceneData] = useState<SceneData>(() => initialSceneOverride || initialSceneDataBlueprint);

  // Effect to re-initialize if initialSceneOverride changes (e.g. opening a different project)
  useEffect(() => {
    if (initialSceneOverride) {
      setSceneData(initialSceneOverride);
    }
  }, [initialSceneOverride]);


  const setAppMode = useCallback((mode: AppMode) => {
    if (mode === 'modelling' || mode === 'rendering') {
      setSceneData(prev => ({ ...prev, appMode: mode, activeTool: 'select', selectedObjectId: null, drawingState: {isActive: false, tool: null, startPoint: null} }));
    } else {
      setSceneData(prev => ({ ...prev, appMode: 'modelling', activeTool: 'select', selectedObjectId: null, drawingState: {isActive: false, tool: null, startPoint: null} }));
    }
  }, []);

  const addObject = useCallback((type: PrimitiveType, initialProps?: Partial<Omit<SceneObject, 'id' | 'type'>>): SceneObject => {
    const baseName = type.charAt(0).toUpperCase() + type.slice(1);
    const count = sceneData.objects.filter(o => o.type === type && o.name.startsWith(baseName)).length + 1;

    let defaultDimensions: SceneObjectDimensions = {};
    let defaultPosition: [number, number, number] = [0, 0.5, 0];
    let defaultRotation: [number, number, number] = [0, 0, 0];
    let defaultScale: [number, number, number] = [1, 1, 1];

    switch (type) {
      case 'cube':
        defaultDimensions = { width: 1, height: 1, depth: 1 };
        defaultPosition = [0, Math.max(0.001, (initialProps?.dimensions?.height ?? defaultDimensions.height ?? 1)) / 2, 0];
        break;
      case 'cylinder':
        defaultDimensions = { radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 32 };
        defaultPosition = [0, Math.max(0.001, (initialProps?.dimensions?.height ?? defaultDimensions.height ?? 1)) / 2, 0];
        break;
      case 'plane':
        defaultDimensions = { width: 10, height: 10 }; 
        defaultPosition = [0, 0, 0]; 
        defaultRotation = [-Math.PI / 2, 0, 0]; 
        break;
      case 'text':
        defaultDimensions = { text: "3D Text", fontSize: 1, depth: 0.2, width: 2, height: 0.5 };
        defaultPosition = [0, Math.max(0.001, (initialProps?.dimensions?.height ?? defaultDimensions.height ?? 0.5)) / 2, 0]; 
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
      activeTool: (prev.activeTool && ['addCube', 'addCylinder', 'addPlane', 'addText', 'rectangle', 'tape', 'pushpull'].includes(prev.activeTool)) ? 'select' : prev.activeTool,
      drawingState: {isActive: false, tool: null, startPoint: null}, 
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
          
          const isYUpObject = (updatedObj.type === 'cube' || updatedObj.type === 'cylinder' || updatedObj.type === 'text');
          const heightChanged = updates.dimensions?.height !== undefined && updates.dimensions.height !== obj.dimensions.height;
          const positionNotExplicitlySet = updates.position === undefined;
          const isUpright = Math.abs(updatedObj.rotation[0]) < 0.01 && Math.abs(updatedObj.rotation[2]) < 0.01; 


          if (isYUpObject && heightChanged && positionNotExplicitlySet && isUpright) {
            updatedObj.position = [...updatedObj.position]; 
            updatedObj.position[1] = Math.max(0.001, (updatedObj.dimensions.height || 1)) / 2;
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
    setSceneData(prev => {
      const preserveActiveDrawing = prev.drawingState.isActive &&
                                    (
                                      (prev.drawingState.tool === 'pushpull' && prev.drawingState.pushPullFaceInfo?.objectId === id) ||
                                      (prev.drawingState.tool === 'rectangle' && prev.drawingState.startPoint !== null) ||
                                      (prev.drawingState.tool === 'tape' && prev.drawingState.startPoint !== null && prev.drawingState.measureDistance === null)
                                    );
  
      return {
        ...prev,
        selectedObjectId: id,
        drawingState: preserveActiveDrawing ? prev.drawingState : { ...prev.drawingState, isActive: false }
      };
    });
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
    // This function is now mainly for loading a new project's scene data
    if (data && data.objects && data.materials && data.ambientLight && data.directionalLight) {
      setSceneData(data);
    } else {
      console.error("Invalid scene data provided to loadScene");
      setSceneData(getDefaultSceneData()); // Fallback to default
    }
  }, []);

  const clearCurrentProjectScene = useCallback(() => {
    // This will effectively reset the scene to its default state for the current project
    // The actual persistence of this cleared state is handled by ProjectContext calling save
    setSceneData(getDefaultSceneData());
  }, []);
  
  const getCurrentSceneData = useCallback((): SceneData => {
    // Exclude functions, only return serializable data
    const { 
      objects, materials, ambientLight, directionalLight, 
      selectedObjectId, activeTool, activePaintMaterialId, appMode, drawingState 
    } = sceneData;
    return { 
      objects, materials, ambientLight, directionalLight, 
      selectedObjectId, activeTool, activePaintMaterialId, appMode, drawingState 
    };
  }, [sceneData]);


  const setActiveTool = useCallback((tool: ToolType | undefined) => {
    setSceneData(prev => {
      let newActivePaintMaterialId = prev.activePaintMaterialId;
      let newDrawingState: DrawingState = {isActive: false, tool: null, startPoint: null}; 
      
      if (tool === 'paint') {
        // Keep activePaintMaterialId if switching to paint
      } else {
        newActivePaintMaterialId = null; 
      }

      const drawingTools: ToolType[] = ['rectangle', 'line', 'arc', 'tape', 'pushpull'];
      if (tool && drawingTools.includes(tool)) {
        newDrawingState.tool = tool as 'rectangle' | 'line' | 'arc' | 'tape' | 'pushpull';
      }
      
      const selectionPreservingTools: ToolType[] = ['select', 'move', 'rotate', 'scale', 'paint', 'pushpull'];
      let newSelectedObjectId = prev.selectedObjectId;
      if (tool && !selectionPreservingTools.includes(tool)) {
        newSelectedObjectId = null;
      }

      return { 
        ...prev, 
        activeTool: tool, 
        activePaintMaterialId: newActivePaintMaterialId, 
        drawingState: newDrawingState, 
        selectedObjectId: newSelectedObjectId 
      };
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
    clearCurrentProjectScene,
    activeTool: sceneData.activeTool,
    setActiveTool,
    activePaintMaterialId: sceneData.activePaintMaterialId,
    setActivePaintMaterialId,
    setDrawingState,
    getCurrentSceneData,
  }), [sceneData, setAppMode, addObject, updateObject, removeObject, selectObject, addMaterial, updateMaterial, removeMaterial, getMaterialById, updateAmbientLight, updateDirectionalLight, loadScene, clearCurrentProjectScene, setActiveTool, setActivePaintMaterialId, setDrawingState, getCurrentSceneData]);

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
