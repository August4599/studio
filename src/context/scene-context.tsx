"use client";

import type React from 'react';
import { createContext, useCallback, useContext, useMemo, useState, useEffect, useRef } from 'react';
import type { SceneData, SceneObject, MaterialProperties, AmbientLightProps, DirectionalLightSceneProps, SceneLight, LightType, PrimitiveType, ToolType, AppMode, DrawingState, SceneObjectDimensions, PushPullFaceInfo, ViewPreset } from '@/types';
import { DEFAULT_MATERIAL_ID, DEFAULT_MATERIAL_NAME } from '@/types';
import { v4 as uuidv4 } from 'uuid'; 
import { getDefaultSceneData } from '@/lib/project-manager'; 

const IMPORT_CHUNK_SIZE = 50; // Process 50 objects at a time
const IMPORT_CHUNK_DELAY = 50; // Delay in ms between chunks

interface SceneContextType extends Omit<SceneData, 'objects' | 'materials' | 'appMode' | 'activePaintMaterialId' | 'drawingState' | 'otherLights' | 'requestedViewPreset'> {
  objects: SceneObject[];
  materials: MaterialProperties[];
  otherLights: SceneLight[];
  appMode: AppMode;
  activePaintMaterialId: string | null | undefined;
  drawingState: DrawingState;
  requestedViewPreset: ViewPreset | null | undefined;
  setAppMode: (mode: AppMode) => void;
  addObject: (type: PrimitiveType, initialProps?: Partial<Omit<SceneObject, 'id' | 'type'>>) => SceneObject;
  addImportedObjects: (importedObjectsData: Partial<SceneObject>[]) => Promise<SceneObject[]>;
  updateObject: (id: string, updates: Partial<SceneObject>) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  addMaterial: (props?: Partial<Omit<MaterialProperties, 'id'>>) => MaterialProperties;
  updateMaterial: (id: string, updates: Partial<MaterialProperties>) => void;
  removeMaterial: (id: string) => void;
  getMaterialById: (id: string) => MaterialProperties | undefined;
  updateAmbientLight: (updates: Partial<AmbientLightProps>) => void;
  updateDirectionalLight: (updates: Partial<DirectionalLightSceneProps>) => void;
  addLight: (type: Exclude<LightType, 'ambient' | 'directional'>, props?: Partial<Omit<SceneLight, 'id' | 'type' | 'name'>>) => SceneLight;
  updateLight: (id: string, updates: Partial<SceneLight>) => void;
  removeLight: (id: string) => void;
  getLightById: (id: string) => SceneLight | undefined;
  loadScene: (data: SceneData) => void; 
  clearCurrentProjectScene: () => void; 
  selectedObjectId: string | null | undefined;
  activeTool: ToolType | undefined;
  setActiveTool: (tool: ToolType | undefined) => void;
  setActivePaintMaterialId: (materialId: string | null) => void;
  setDrawingState: (newState: Partial<DrawingState>) => void;
  getCurrentSceneData: () => SceneData; 
  setCameraViewPreset: (preset: ViewPreset | null) => void;
}

const SceneContext = createContext<SceneContextType | undefined>(undefined);

const initialSceneDataBlueprint: SceneData = getDefaultSceneData();

export const SceneProvider: React.FC<{ children: React.ReactNode, initialSceneOverride?: SceneData }> = ({ children, initialSceneOverride }) => {
  const [sceneData, setSceneData] = useState<SceneData>(() => initialSceneOverride || initialSceneDataBlueprint);

  const sceneObjectsRef = useRef(sceneData.objects);
  const sceneMaterialsRef = useRef(sceneData.materials);
  const sceneOtherLightsRef = useRef(sceneData.otherLights);


  useEffect(() => {
    if (initialSceneOverride) {
      setSceneData(initialSceneOverride);
    }
  }, [initialSceneOverride]);

  useEffect(() => {
    sceneObjectsRef.current = sceneData.objects;
    sceneMaterialsRef.current = sceneData.materials;
    sceneOtherLightsRef.current = sceneData.otherLights;
  }, [sceneData.objects, sceneData.materials, sceneData.otherLights]);


  const setAppMode = useCallback((mode: AppMode) => {
    if (mode === 'modelling' || mode === 'rendering') {
      setSceneData(prev => ({ ...prev, appMode: mode, activeTool: 'select', selectedObjectId: null, drawingState: {...getDefaultSceneData().drawingState, tool: null } }));
    } else {
      setSceneData(prev => ({ ...prev, appMode: 'modelling', activeTool: 'select', selectedObjectId: null, drawingState: {...getDefaultSceneData().drawingState, tool: null } }));
    }
  }, []);

  const addObject = useCallback((type: PrimitiveType, initialProps?: Partial<Omit<SceneObject, 'id' | 'type'>>): SceneObject => {
    const currentObjects = sceneObjectsRef.current; 
    const baseName = type.charAt(0).toUpperCase() + type.slice(1);
    
    let maxNum = 0;
    currentObjects.filter(o => o.name.startsWith(baseName)).forEach(o => {
        const match = o.name.match(new RegExp(`^${baseName}\\s*(\\d+)$`));
        if (match && match[1]) {
            maxNum = Math.max(maxNum, parseInt(match[1]));
        }
    });
    const count = maxNum + 1;

    let defaultDimensions: SceneObjectDimensions = {};
    let defaultPosition: [number, number, number] = [0, 0, 0];
    let defaultRotation: [number, number, number] = [0, 0, 0];
    let defaultScale: [number, number, number] = [1, 1, 1];

    switch (type) {
      case 'cube':
        defaultDimensions = { width: 1, height: 1, depth: 1 };
        defaultPosition = [0, (initialProps?.dimensions?.height ?? defaultDimensions.height ?? 1) / 2, 0];
        break;
      case 'cylinder':
        defaultDimensions = { radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 32 };
        defaultPosition = [0, (initialProps?.dimensions?.height ?? defaultDimensions.height ?? 1) / 2, 0];
        break;
      case 'plane':
        defaultDimensions = { width: 10, height: 10 }; 
        defaultPosition = [0, 0, 0]; 
        defaultRotation = [-Math.PI / 2, 0, 0]; 
        break;
      case 'text':
        defaultDimensions = { text: "3D Text", fontSize: 1, depth: 0.2, width: 2, height: 0.5 };
        defaultPosition = [0, (initialProps?.dimensions?.height ?? defaultDimensions.height ?? 0.5) / 2, 0]; 
        break;
      case 'sphere':
        defaultDimensions = { radius: 0.5, widthSegments: 32, heightSegments: 16 };
        defaultPosition = [0, (initialProps?.dimensions?.radius ?? defaultDimensions.radius ?? 0.5), 0];
        break;
      case 'cone':
        defaultDimensions = { radius: 0.5, height: 1, radialSegments: 32 };
        defaultPosition = [0, (initialProps?.dimensions?.height ?? defaultDimensions.height ?? 1) / 2, 0];
        break;
      case 'torus':
        defaultDimensions = { radius: 0.5, tube: 0.2, radialSegments: 16, tubularSegments: 32 };
        defaultPosition = [0, (initialProps?.dimensions?.tube ?? defaultDimensions.tube ?? 0.2), 0];
        break;
      case 'polygon': 
        defaultDimensions = { radius: 0.5, sides: 6 };
        defaultPosition = [0, 0, 0]; 
        defaultRotation = [-Math.PI / 2, 0, 0];
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
      activeTool: (prev.activeTool && ['addCube', 'addCylinder', 'addPlane', 'addText', 'rectangle', 'tape', 'pushpull', 'addSphere', 'addCone', 'addTorus', 'addPolygon', 'circle', 'line'].includes(prev.activeTool || '')) ? 'select' : prev.activeTool,
      drawingState: {...getDefaultSceneData().drawingState, tool: null, startPoint: null}, 
    }));
    return newObject;
  }, []); 

  const addObjectsChunk = useCallback((objectChunkData: Partial<SceneObject>[]): SceneObject[] => {
    const newSceneObjects: SceneObject[] = objectChunkData.map((objData, index) => {
        const baseName = objData.type ? `${objData.type.charAt(0).toUpperCase() + objData.type.slice(1)}` : 'ImportedObject';
        const nameSuffix = objectChunkData.length > 1 ? `_chunk_item_${index + 1}` : '';
        
        let defaultDimensions: SceneObjectDimensions = {};
        let defaultPosition: [number, number, number] = [0, 0, 0];
        let defaultRotation: [number, number, number] = [0, 0, 0];

        switch (objData.type) {
            case 'cube':
                defaultDimensions = { width: 1, height: 1, depth: 1 };
                defaultPosition = [0, (objData.dimensions?.height ?? 1) / 2, 0];
                break;
            case 'plane': 
                defaultDimensions = { width: 1, height: 1 }; 
                defaultPosition = [0, 0, 0];
                defaultRotation = [-Math.PI / 2, 0, 0]; 
                break;
            default:
                 defaultDimensions = { width: 1, height: 1, depth: 1 };
        }

        return {
            id: objData.id || uuidv4(),
            type: objData.type || 'cube', 
            name: objData.name || `${baseName}${nameSuffix}`,
            position: objData.position || defaultPosition,
            rotation: objData.rotation || defaultRotation,
            scale: objData.scale || [1, 1, 1],
            dimensions: { ...defaultDimensions, ...objData.dimensions },
            materialId: objData.materialId || DEFAULT_MATERIAL_ID,
        };
    });

    setSceneData(prev => ({
        ...prev,
        objects: [...prev.objects, ...newSceneObjects],
        selectedObjectId: newSceneObjects.length > 0 ? newSceneObjects[newSceneObjects.length -1].id : prev.selectedObjectId,
        activeTool: 'select',
        drawingState: { ...getDefaultSceneData().drawingState, tool: null, startPoint: null },
    }));
    return newSceneObjects;
  }, []);

  const addImportedObjects = useCallback(async (importedObjectsData: Partial<SceneObject>[]): Promise<SceneObject[]> => {
    console.log(`Starting to import ${importedObjectsData.length} objects in chunks.`);
    const allAddedObjects: SceneObject[] = [];
    for (let i = 0; i < importedObjectsData.length; i += IMPORT_CHUNK_SIZE) {
        const chunk = importedObjectsData.slice(i, i + IMPORT_CHUNK_SIZE);
        console.log(`Processing chunk ${i / IMPORT_CHUNK_SIZE + 1}: ${chunk.length} objects`);
        const addedInChunk = addObjectsChunk(chunk);
        allAddedObjects.push(...addedInChunk);
        // Yield to the event loop to keep UI responsive
        await new Promise(resolve => setTimeout(resolve, IMPORT_CHUNK_DELAY));
    }
    console.log(`Finished importing all ${allAddedObjects.length} objects.`);
    return allAddedObjects;
  }, [addObjectsChunk]);


  const updateObject = useCallback((id: string, updates: Partial<SceneObject>) => {
    setSceneData(prev => ({
      ...prev,
      objects: prev.objects.map(obj => {
        if (obj.id === id) {
          const updatedObj = { ...obj, ...updates };
          if (updates.dimensions) {
            updatedObj.dimensions = { ...obj.dimensions, ...updates.dimensions };
          }
          
          const isYUpObject = ['cube', 'cylinder', 'text', 'sphere', 'cone'].includes(updatedObj.type);
          const isTorus = updatedObj.type === 'torus';
          
          let heightLikeDimensionKey: keyof SceneObjectDimensions | null = null;
          if (updatedObj.type === 'sphere') heightLikeDimensionKey = 'radius';
          else if (updatedObj.type === 'torus') heightLikeDimensionKey = 'tube';
          else if (updatedObj.dimensions.height !== undefined) heightLikeDimensionKey = 'height';

          const heightChanged = heightLikeDimensionKey ? (updates.dimensions?.[heightLikeDimensionKey] !== undefined && updates.dimensions?.[heightLikeDimensionKey] !== obj.dimensions[heightLikeDimensionKey]) : false;
          const positionNotExplicitlySet = updates.position === undefined;
          const isUpright = Math.abs(updatedObj.rotation[0]) < 0.01 && Math.abs(updatedObj.rotation[2]) < 0.01; 

          if ((isYUpObject || isTorus) && heightChanged && positionNotExplicitlySet && isUpright) {
            updatedObj.position = [...updatedObj.position]; 
            let yPos = 0;
            if (updatedObj.type === 'sphere') yPos = updatedObj.dimensions.radius || 0;
            else if (updatedObj.type === 'torus') yPos = updatedObj.dimensions.tube || 0;
            else yPos = (updatedObj.dimensions.height || 0) / 2;
            updatedObj.position[1] = Math.max(0.001, yPos);
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
                                      (['rectangle', 'circle', 'polygon', 'line', 'freehand', 'arc'].includes(prev.drawingState.tool || '') && prev.drawingState.startPoint !== null) ||
                                      (['tape', 'protractor'].includes(prev.drawingState.tool || '') && prev.drawingState.startPoint !== null && prev.drawingState.measureDistance === null)
                                    );
  
      return {
        ...prev,
        selectedObjectId: id,
        drawingState: preserveActiveDrawing ? prev.drawingState : { ...prev.drawingState, isActive: false }
      };
    });
  }, []);
  
  const addMaterial = useCallback((props?: Partial<Omit<MaterialProperties, 'id'>>): MaterialProperties => {
    const defaultMatProps = getDefaultSceneData().materials[0];
    const currentMaterials = sceneMaterialsRef.current;
    const newMaterial: MaterialProperties = {
      ...defaultMatProps,
      id: uuidv4(),
      name: `Material ${currentMaterials.length +1}`, 
      ...props,
    };
    setSceneData(prev => ({
      ...prev,
      materials: [...prev.materials, newMaterial],
    }));
    return newMaterial;
  }, []);

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
    return sceneMaterialsRef.current.find(mat => mat.id === id);
  }, []);

  const updateAmbientLight = useCallback((updates: Partial<AmbientLightProps>) => {
    setSceneData(prev => ({ ...prev, ambientLight: { ...prev.ambientLight, ...updates } }));
  }, []);

  const updateDirectionalLight = useCallback((updates: Partial<DirectionalLightSceneProps>) => {
    setSceneData(prev => ({ ...prev, directionalLight: { ...prev.directionalLight, ...updates } }));
  }, []);

  const addLight = useCallback((type: Exclude<LightType, 'ambient' | 'directional'>, props?: Partial<Omit<SceneLight, 'id' | 'type' | 'name'>>): SceneLight => {
    const currentOtherLights = sceneOtherLightsRef.current;
    const baseName = type.charAt(0).toUpperCase() + type.slice(1) + " Light";
    const count = (currentOtherLights?.filter(l => l.type === type).length || 0) + 1;
    
    let newLight: SceneLight;
    const baseLightProps = {
      id: uuidv4(),
      name: `${baseName} ${count}`,
      color: '#ffffff',
      intensity: 1,
      visible: true,
      ...props, 
    };

    switch(type) {
      case 'point':
        newLight = { ...baseLightProps, type, position: [0,2,0], distance: 10, decay: 2, castShadow: true, shadowBias: -0.005 };
        break;
      case 'spot':
        newLight = { ...baseLightProps, type, position: [0,3,0], targetPosition: [0,0,0], angle: Math.PI / 4, penumbra: 0.1, distance: 10, decay: 2, castShadow: true, shadowBias: -0.005 };
        break;
      case 'area': 
        newLight = { ...baseLightProps, type, position: [0,2,0], rotation: [0,0,0], width: 2, height: 1, intensity: 5 };
        break;
      default:
        throw new Error(`Unsupported light type: ${type}`);
    }
    
    setSceneData(prev => ({
      ...prev,
      otherLights: [...(prev.otherLights || []), newLight as SceneLight],
    }));
    return newLight as SceneLight;
  }, []);

  const updateLight = useCallback((id: string, updates: Partial<SceneLight>) => {
    setSceneData(prev => ({
      ...prev,
      otherLights: (prev.otherLights || []).map(light => light.id === id ? { ...light, ...updates } : light),
    }));
  }, []);

  const removeLight = useCallback((id: string) => {
    setSceneData(prev => ({
      ...prev,
      otherLights: (prev.otherLights || []).filter(light => light.id !== id),
    }));
  }, []);

  const getLightById = useCallback((id: string): SceneLight | undefined => {
    return sceneOtherLightsRef.current?.find(l => l.id === id);
  }, []);


  const loadScene = useCallback((data: SceneData) => {
    if (data && data.objects && data.materials && data.ambientLight && data.directionalLight) {
      setSceneData({
        ...getDefaultSceneData(), 
        ...data, 
        otherLights: data.otherLights || [], 
        drawingState: data.drawingState || getDefaultSceneData().drawingState, 
      });
    } else {
      console.error("Invalid scene data provided to loadScene");
      setSceneData(getDefaultSceneData()); 
    }
  }, []);

  const clearCurrentProjectScene = useCallback(() => {
    setSceneData(getDefaultSceneData());
  }, []);
  
  const getCurrentSceneData = useCallback((): SceneData => {
    const { 
      objects, materials, ambientLight, directionalLight, otherLights,
      selectedObjectId, activeTool, activePaintMaterialId, appMode, drawingState, requestedViewPreset
    } = sceneData;
    return { 
      objects, materials, ambientLight, directionalLight, otherLights: otherLights || [],
      selectedObjectId, activeTool, activePaintMaterialId, appMode, drawingState, requestedViewPreset
    };
  }, [sceneData]);


  const setActiveTool = useCallback((tool: ToolType | undefined) => {
    setSceneData(prev => {
      let newActivePaintMaterialId = prev.activePaintMaterialId;
      let newDrawingState: DrawingState = { ...getDefaultSceneData().drawingState };
      
      if (tool !== 'paint') {
        newActivePaintMaterialId = null; 
      }

      const drawingTools: ToolType[] = ['rectangle', 'line', 'arc', 'tape', 'pushpull', 'circle', 'polygon', 'freehand', 'protractor'];
      if (tool && drawingTools.includes(tool)) {
        newDrawingState.tool = tool as DrawingState['tool'];
        if (tool === 'polygon') newDrawingState.polygonSides = prev.drawingState.polygonSides || 6;
      }
      
      const selectionPreservingTools: ToolType[] = ['select', 'move', 'rotate', 'scale', 'paint', 'pushpull', 'orbit', 'pan', 'zoom', 'zoomExtents', 'axes'];
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

  const setCameraViewPreset = useCallback((preset: ViewPreset | null) => {
    setSceneData(prev => ({ ...prev, requestedViewPreset: preset }));
  }, []);
  
  const contextValue = useMemo(() => ({
    ...sceneData,
    setAppMode,
    addObject,
    addImportedObjects,
    updateObject,
    removeObject,
    selectObject,
    addMaterial,
    updateMaterial,
    removeMaterial,
    getMaterialById,
    updateAmbientLight,
    updateDirectionalLight,
    addLight,
    updateLight,
    removeLight,
    getLightById,
    loadScene,
    clearCurrentProjectScene,
    activeTool: sceneData.activeTool,
    setActiveTool,
    activePaintMaterialId: sceneData.activePaintMaterialId,
    setActivePaintMaterialId,
    setDrawingState,
    getCurrentSceneData,
    requestedViewPreset: sceneData.requestedViewPreset,
    setCameraViewPreset,
  }), [sceneData, setAppMode, addObject, addImportedObjects, updateObject, removeObject, selectObject, addMaterial, updateMaterial, removeMaterial, getMaterialById, updateAmbientLight, updateDirectionalLight, addLight, updateLight, removeLight, getLightById, loadScene, clearCurrentProjectScene, setActiveTool, setActivePaintMaterialId, setDrawingState, getCurrentSceneData, setCameraViewPreset]);

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
