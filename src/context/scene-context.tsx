
"use client";

import type React from 'react';
import { createContext, useCallback, useContext, useMemo, useState, useEffect, useRef } from 'react';
import type { SceneData, SceneObject, MaterialProperties, AmbientLightProps, DirectionalLightSceneProps, SceneLight, LightType, PrimitiveType, ToolType, AppMode, DrawingState, SceneObjectDimensions, PushPullFaceInfo, ViewPreset, CadPlanData, RenderSettings, MeasurementUnit, SceneLayer, CameraSettings, AnimationData, SavedSceneView, EnvironmentSettings, PostProcessingSettings } from '@/types';
import { DEFAULT_MATERIAL_ID, DEFAULT_LAYER_ID, DEFAULT_LAYER_NAME } from '@/types';
import { v4 as uuidv4 } from 'uuid'; 
import { getDefaultSceneData } from '@/lib/project-manager'; 

interface SceneContextType extends Omit<SceneData, 'objects' | 'materials' | 'appMode' | 'activePaintMaterialId' | 'drawingState' | 'otherLights' | 'requestedViewPreset' | 'zoomExtentsTrigger' | 'cameraFov' | 'worldBackgroundColor' | 'renderSettings' | 'measurementUnit' | 'layers' | 'activeLayerId' | 'cameraSettings' | 'savedCameras' | 'animationData' | 'environmentSettings' | 'postProcessingSettings' | 'savedViews'> {
  objects: SceneObject[];
  materials: MaterialProperties[];
  otherLights: SceneLight[];
  layers: SceneLayer[]; 
  activeLayerId: string; 

  appMode: AppMode;
  activePaintMaterialId: string | null | undefined;
  drawingState: DrawingState;
  measurementUnit: MeasurementUnit;
  requestedViewPreset: ViewPreset | null | undefined;
  zoomExtentsTrigger: { timestamp: number; targetObjectId?: string };
  cameraFov: number; // This is for the main viewport camera during modelling
  worldBackgroundColor: string;
  renderSettings: RenderSettings;
  cameraSettings: CameraSettings; // Main "scene" camera for rendering output
  savedCameras?: Record<string, CameraSettings>; // Library of cameras
  animationData?: AnimationData;
  environmentSettings: EnvironmentSettings;
  postProcessingSettings?: PostProcessingSettings;
  savedViews: SavedSceneView[];


  setAppMode: (mode: AppMode) => void;
  addObject: (type: Exclude<PrimitiveType, 'cadPlan'>, initialProps?: Partial<Omit<SceneObject, 'id' | 'type' | 'planData'>>) => SceneObject;
  importCadPlan: (parsedPlan: Partial<SceneObject>) => Promise<SceneObject | null>;
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
  
  addLayer: (props?: Partial<Omit<SceneLayer, 'id'>>) => SceneLayer; 
  updateLayer: (id: string, updates: Partial<SceneLayer>) => void; 
  removeLayer: (id: string) => void; 
  setActiveLayerId: (id: string) => void; 
  getLayerById: (id: string) => SceneLayer | undefined; 

  addSavedScene: (props: Partial<Omit<SavedSceneView, 'id'>>) => SavedSceneView;
  updateSavedScene: (id: string, updates: Partial<SavedSceneView>) => void;
  removeSavedScene: (id: string) => void;
  applySavedScene: (id: string) => void;


  loadScene: (data: SceneData) => void; 
  clearCurrentProjectScene: () => void; 
  selectedObjectId: string | null | undefined;
  activeTool: ToolType | undefined;
  setActiveTool: (tool: ToolType | undefined, preserveSelection?: boolean) => void;
  setActivePaintMaterialId: (materialId: string | null) => void;
  setDrawingState: (newState: Partial<DrawingState>) => void;
  setMeasurementUnit: (unit: MeasurementUnit) => void;
  getCurrentSceneData: () => SceneData; 
  setCameraViewPreset: (preset: ViewPreset | null) => void;
  triggerZoomExtents: (targetObjectId?: string) => void; 
  setZoomExtentsTriggered: () => void;
  setCameraFov: (fov: number) => void; // For modelling viewport
  setWorldBackgroundColor: (color: string) => void;
  updateRenderSettings: (settings: Partial<RenderSettings>) => void;
  updateCameraSettings: (settings: Partial<CameraSettings>) => void; // For scene/render camera
  updateEnvironmentSettings: (settings: Partial<EnvironmentSettings>) => void;
  updatePostProcessingSettings: (settings: Partial<PostProcessingSettings>) => void;
}

const SceneContext = createContext<SceneContextType | undefined>(undefined);

const initialSceneDataBlueprint: SceneData = getDefaultSceneData();

export const SceneProvider: React.FC<{ children: React.ReactNode, initialSceneOverride?: SceneData }> = ({ children, initialSceneOverride }) => {
  const [sceneData, setSceneData] = useState<SceneData>(() => {
    const data = initialSceneOverride || initialSceneDataBlueprint;
    const defaultData = getDefaultSceneData(); // Important to get fresh defaults
    return { 
      ...defaultData, 
      ...data, 
      cameraFov: data.cameraFov ?? defaultData.cameraFov,
      worldBackgroundColor: data.worldBackgroundColor ?? defaultData.worldBackgroundColor,
      renderSettings: data.renderSettings ? { ...defaultData.renderSettings, ...data.renderSettings } : defaultData.renderSettings,
      cameraSettings: data.cameraSettings ? { ...defaultData.cameraSettings!, ...data.cameraSettings } : defaultData.cameraSettings!,
      environmentSettings: data.environmentSettings ? { ...defaultData.environmentSettings!, ...data.environmentSettings } : defaultData.environmentSettings!,
      postProcessingSettings: data.postProcessingSettings ? { ...defaultData.postProcessingSettings!, ...data.postProcessingSettings } : defaultData.postProcessingSettings!,
      measurementUnit: data.measurementUnit ?? defaultData.measurementUnit,
      zoomExtentsTrigger: data.zoomExtentsTrigger || { timestamp: 0 },
      layers: data.layers && data.layers.length > 0 ? data.layers : defaultData.layers,
      activeLayerId: data.activeLayerId || defaultData.activeLayerId,
      savedViews: data.savedViews || defaultData.savedViews,
     };
  });

  const sceneObjectsRef = useRef(sceneData.objects);
  const sceneMaterialsRef = useRef(sceneData.materials);
  const sceneOtherLightsRef = useRef(sceneData.otherLights);
  const sceneLayersRef = useRef(sceneData.layers); 
  const sceneSavedViewsRef = useRef(sceneData.savedViews);


  useEffect(() => {
    if (initialSceneOverride) {
        const defaultData = getDefaultSceneData();
        setSceneData(prev => ({
            ...defaultData, 
            ...initialSceneOverride, 
            objects: initialSceneOverride.objects || prev.objects || defaultData.objects,
            materials: initialSceneOverride.materials || prev.materials || defaultData.materials,
            otherLights: initialSceneOverride.otherLights || prev.otherLights || defaultData.otherLights,
            cameraFov: initialSceneOverride.cameraFov ?? prev.cameraFov ?? defaultData.cameraFov,
            worldBackgroundColor: initialSceneOverride.worldBackgroundColor ?? prev.worldBackgroundColor ?? defaultData.worldBackgroundColor,
            renderSettings: initialSceneOverride.renderSettings ? { ...defaultData.renderSettings, ...initialSceneOverride.renderSettings} : (prev.renderSettings ?? defaultData.renderSettings),
            cameraSettings: initialSceneOverride.cameraSettings ? { ...defaultData.cameraSettings!, ...initialSceneOverride.cameraSettings} : (prev.cameraSettings ?? defaultData.cameraSettings!),
            environmentSettings: initialSceneOverride.environmentSettings ? { ...defaultData.environmentSettings!, ...initialSceneOverride.environmentSettings} : (prev.environmentSettings ?? defaultData.environmentSettings!),
            postProcessingSettings: initialSceneOverride.postProcessingSettings ? { ...defaultData.postProcessingSettings!, ...initialSceneOverride.postProcessingSettings} : (prev.postProcessingSettings ?? defaultData.postProcessingSettings!),
            measurementUnit: initialSceneOverride.measurementUnit ?? prev.measurementUnit ?? defaultData.measurementUnit,
            zoomExtentsTrigger: initialSceneOverride.zoomExtentsTrigger || prev.zoomExtentsTrigger || { timestamp: 0 },
            layers: initialSceneOverride.layers && initialSceneOverride.layers.length > 0 ? initialSceneOverride.layers : (prev.layers ?? defaultData.layers),
            activeLayerId: initialSceneOverride.activeLayerId || prev.activeLayerId || defaultData.activeLayerId,
            savedViews: initialSceneOverride.savedViews || prev.savedViews || defaultData.savedViews,
        }));
    }
  }, [initialSceneOverride]);

  useEffect(() => {
    sceneObjectsRef.current = sceneData.objects;
    sceneMaterialsRef.current = sceneData.materials;
    sceneOtherLightsRef.current = sceneData.otherLights;
    sceneLayersRef.current = sceneData.layers; 
    sceneSavedViewsRef.current = sceneData.savedViews;
  }, [sceneData.objects, sceneData.materials, sceneData.otherLights, sceneData.layers, sceneData.savedViews]); 


  const setAppMode = useCallback((mode: AppMode) => {
    if (mode === 'modelling' || mode === 'rendering') {
      setSceneData(prev => ({ ...prev, appMode: mode, activeTool: 'select', selectedObjectId: null, drawingState: {...getDefaultSceneData().drawingState, tool: null } }));
    } else {
      setSceneData(prev => ({ ...prev, appMode: 'modelling', activeTool: 'select', selectedObjectId: null, drawingState: {...getDefaultSceneData().drawingState, tool: null } }));
    }
  }, []);

  const addObject = useCallback((type: Exclude<PrimitiveType, 'cadPlan'>, initialProps?: Partial<Omit<SceneObject, 'id' | 'type' | 'planData'>>): SceneObject => {
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

    const getInitialY = (dimHeight?: number, defaultDimHeight?: number) => {
        return (dimHeight ?? defaultDimHeight ?? 1) / 2;
    };

    switch (type) {
      case 'cube':
        defaultDimensions = { width: 1, height: 1, depth: 1 };
        defaultPosition = [0, getInitialY(initialProps?.dimensions?.height, defaultDimensions.height), 0];
        break;
      case 'cylinder':
        defaultDimensions = { radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 32 };
        defaultPosition = [0, getInitialY(initialProps?.dimensions?.height, defaultDimensions.height), 0];
        break;
      case 'plane':
        defaultDimensions = { width: 10, height: 10 }; 
        defaultPosition = [0, 0, 0]; 
        defaultRotation = [-Math.PI / 2, 0, 0]; 
        break;
      case 'text': 
        defaultDimensions = { text: "3D Text", fontSize: 1, depth: 0.2, width: 2, height: 0.5 };
        defaultPosition = [0, getInitialY(initialProps?.dimensions?.height, defaultDimensions.height), 0]; 
        break;
      case 'sphere':
        defaultDimensions = { radius: 0.5, radialSegments: 32, heightSegments: 16 }; 
        defaultPosition = [0, (initialProps?.dimensions?.radius ?? defaultDimensions.radius ?? 0.5), 0];
        break;
      case 'cone':
        defaultDimensions = { radius: 0.5, height: 1, radialSegments: 32 };
        defaultPosition = [0, getInitialY(initialProps?.dimensions?.height, defaultDimensions.height), 0];
        break;
      case 'torus':
        defaultDimensions = { radius: 0.5, tube: 0.2, radialSegments: 16, tubularSegments: 32 };
        defaultPosition = [0, (initialProps?.dimensions?.tube ?? defaultDimensions.tube ?? 0.2), 0];
        break;
      case 'polygon': 
      case 'circle': 
        defaultDimensions = { radius: 0.5, sides: type === 'polygon' ? (initialProps?.dimensions?.sides || 6) : 32 };
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
      visible: initialProps?.visible ?? true,
      layerId: initialProps?.layerId || sceneData.activeLayerId || DEFAULT_LAYER_ID,
      modifiers: [], 
    };
    
    setSceneData(prev => ({
      ...prev,
      objects: [...prev.objects, newObject],
      selectedObjectId: newObject.id, 
      drawingState: {...(prev.drawingState || getDefaultSceneData().drawingState), isActive: false, startPoint: null, currentPoint: null }, 
    }));
    return newObject;
  }, [sceneData.activeLayerId]); 

  const importCadPlan = useCallback(async (parsedPlan: Partial<SceneObject>): Promise<SceneObject | null> => {
    if (!parsedPlan || parsedPlan.type !== 'cadPlan' || !parsedPlan.planData) {
        console.error("Invalid CAD plan data provided for import.");
        return null;
    }
    
    const cadPlanObject: SceneObject = {
        id: parsedPlan.id || uuidv4(),
        type: 'cadPlan',
        name: parsedPlan.name || 'Imported CAD Plan',
        position: parsedPlan.position || [0, 0.01, 0], 
        rotation: parsedPlan.rotation || [0,0,0],
        scale: parsedPlan.scale || [1,1,1],
        dimensions: parsedPlan.dimensions || { width: 1, depth: 1}, 
        materialId: parsedPlan.materialId || DEFAULT_MATERIAL_ID, 
        visible: parsedPlan.visible ?? true,
        planData: parsedPlan.planData,
        layerId: parsedPlan.layerId || sceneData.activeLayerId || DEFAULT_LAYER_ID,
    };

    setSceneData(prev => ({
        ...prev,
        objects: [...prev.objects.filter(o => o.id !== cadPlanObject.id), cadPlanObject], 
        selectedObjectId: cadPlanObject.id, 
        activeTool: 'select',
        drawingState: { ...getDefaultSceneData().drawingState, tool: null, startPoint: null },
    }));
    console.log("CAD Plan object added/updated in scene:", cadPlanObject);
    return cadPlanObject;
  }, [sceneData.activeLayerId]);


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

          const dimensionRelevantToYPos = heightLikeDimensionKey ? updatedObj.dimensions[heightLikeDimensionKey] : undefined;
          const oldDimensionRelevantToYPos = heightLikeDimensionKey ? obj.dimensions[heightLikeDimensionKey] : undefined;
          
          const dimensionChanged = dimensionRelevantToYPos !== undefined && oldDimensionRelevantToYPos !== undefined && dimensionRelevantToYPos !== oldDimensionRelevantToYPos;
          const positionNotExplicitlySet = updates.position === undefined; 
          const isUpright = Math.abs(updatedObj.rotation[0]) < 0.01 && Math.abs(updatedObj.rotation[2]) < 0.01; 

          if ((isYUpObject || isTorus) && dimensionChanged && positionNotExplicitlySet && isUpright) {
            updatedObj.position = [...updatedObj.position]; 
            let yPos = 0;
            if (updatedObj.type === 'sphere' && updatedObj.dimensions.radius !== undefined) yPos = updatedObj.dimensions.radius;
            else if (updatedObj.type === 'torus' && updatedObj.dimensions.tube !== undefined) yPos = updatedObj.dimensions.tube; 
            else if (updatedObj.dimensions.height !== undefined) yPos = updatedObj.dimensions.height / 2;
            
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
      const drawingToolsActive = prev.drawingState.isActive && 
        (
          ['rectangle', 'circle', 'polygon', 'line', 'freehand', 'arc'].includes(prev.drawingState.tool || '') ||
          (['tape', 'protractor'].includes(prev.drawingState.tool || '') && prev.drawingState.measureDistance === null)
        );
      
      const pushPullActiveOnDifferentObject = prev.drawingState.tool === 'pushpull' && prev.drawingState.pushPullFaceInfo?.objectId !== id;

      if (drawingToolsActive || pushPullActiveOnDifferentObject) {
        return {
          ...prev,
          drawingState: { ...getDefaultSceneData().drawingState }
        };
      }
      
      const preservePushPull = prev.drawingState.tool === 'pushpull' && prev.drawingState.pushPullFaceInfo?.objectId === id && id !== null;

      return {
        ...prev,
        selectedObjectId: id,
        drawingState: preservePushPull ? prev.drawingState : { ...getDefaultSceneData().drawingState } 
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
        newLight = { ...baseLightProps, type, position: [0,2,0], rotation: [0,0,0], width: 2, height: 1, intensity: 5, shape: 'rectangle' };
        break;
      // Add cases for new light types here if needed
      case 'skylight':
        newLight = { ...baseLightProps, type, intensity: 0.5 }; break;
      case 'photometric':
        newLight = { ...baseLightProps, type, position: [0,2,0], intensity: 1000, iesFilePath: '' }; break; // lumens
      case 'sphere':
        newLight = { ...baseLightProps, type: 'area', shape: 'sphere', position: [0,2,0], radius: 0.5, intensity: 5 }; break;
      case 'disk':
        newLight = { ...baseLightProps, type: 'area', shape: 'disk', position: [0,2,0], radius: 1, rotation: [0,0,0], intensity: 5 }; break;
      case 'quad': // Essentially same as rectangle area light
         newLight = { ...baseLightProps, type: 'area', shape: 'rectangle', position: [0,2,0], rotation: [0,0,0], width: 2, height: 1, intensity: 5 }; break;
      case 'cylinder_light':
          newLight = { ...baseLightProps, type: 'area', shape: 'cylinder', position: [0,1,0], radius: 0.2, height: 2, rotation: [0,0,0], intensity: 5 }; break;
      case 'mesh_light':
          newLight = { ...baseLightProps, type, meshObjectId: '', intensity: 5 }; break;
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


  // Layer Management Functions
  const addLayer = useCallback((props?: Partial<Omit<SceneLayer, 'id'>>): SceneLayer => {
    const currentLayers = sceneLayersRef.current || [];
    const newLayer: SceneLayer = {
      id: uuidv4(),
      name: `Layer ${currentLayers.length}`,
      visible: true,
      locked: false,
      color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
      ...props,
    };
    setSceneData(prev => ({
      ...prev,
      layers: [...(prev.layers || []), newLayer],
    }));
    return newLayer;
  }, []);

  const updateLayer = useCallback((id: string, updates: Partial<SceneLayer>) => {
    setSceneData(prev => ({
      ...prev,
      layers: (prev.layers || []).map(layer => layer.id === id ? { ...layer, ...updates } : layer),
    }));
  }, []);

  const removeLayer = useCallback((id: string) => {
    if (id === DEFAULT_LAYER_ID) return; 
    setSceneData(prev => ({
      ...prev,
      layers: (prev.layers || []).filter(layer => layer.id !== id),
      objects: (prev.objects || []).map(obj => obj.layerId === id ? { ...obj, layerId: DEFAULT_LAYER_ID } : obj),
      activeLayerId: prev.activeLayerId === id ? DEFAULT_LAYER_ID : prev.activeLayerId,
    }));
  }, []);

  const setActiveLayerId = useCallback((id: string) => {
    setSceneData(prev => ({ ...prev, activeLayerId: id }));
  }, []);
  
  const getLayerById = useCallback((id: string): SceneLayer | undefined => {
    return sceneLayersRef.current?.find(layer => layer.id === id);
  }, []);


  // Saved Scenes (Views) Management
  const addSavedScene = useCallback((props: Partial<Omit<SavedSceneView, 'id'>>): SavedSceneView => {
      const defaultView: Omit<SavedSceneView, 'id' | 'name'> = {
          thumbnail: 'https://placehold.co/80x50.png',
          cameraPosition: [15,15,15], // Default or capture current
          cameraTarget: [0,0,0],   // Default or capture current
          cameraFov: sceneData.cameraFov || 60, // Capture current viewport FOV
          // WIP: Capture layer visibility, styles, environment
      };
      const newView: SavedSceneView = {
          id: uuidv4(),
          name: `View ${ (sceneSavedViewsRef.current?.length || 0) + 1}`,
          ...defaultView,
          ...props,
      };
      setSceneData(prev => ({
          ...prev,
          savedViews: [...(prev.savedViews || []), newView],
      }));
      return newView;
  }, [sceneData.cameraFov]);

  const updateSavedScene = useCallback((id: string, updates: Partial<SavedSceneView>) => {
      setSceneData(prev => ({
          ...prev,
          savedViews: (prev.savedViews || []).map(view => view.id === id ? { ...view, ...updates } : view),
      }));
  }, []);

  const removeSavedScene = useCallback((id: string) => {
      setSceneData(prev => ({
          ...prev,
          savedViews: (prev.savedViews || []).filter(view => view.id !== id),
      }));
  }, []);
  
  const applySavedScene = useCallback((id: string) => {
      const viewToApply = sceneSavedViewsRef.current?.find(v => v.id === id);
      if (viewToApply) {
          // This function will trigger a re-render of SceneViewer via requestedViewPreset.
          // SceneViewer should ideally then update camera based on viewToApply.position/target.
          // For now, we'll just use the setCameraViewPreset with 'perspective' as a placeholder
          // to demonstrate a view change, but it won't use the saved coords yet.
          // TODO: SceneViewer needs to use these coords.
          setCameraViewPreset('perspective'); 
          if (viewToApply.cameraFov) setCameraFov(viewToApply.cameraFov);
          // WIP: Apply layer visibility, styles, environment from viewToApply
      }
  }, []);


  const loadScene = useCallback((data: SceneData) => {
    const defaultData = getDefaultSceneData();
    if (data && data.objects && data.materials && data.ambientLight && data.directionalLight) {
      setSceneData({
        ...defaultData, 
        ...data, 
        objects: data.objects || defaultData.objects, 
        materials: data.materials || defaultData.materials,
        otherLights: data.otherLights || defaultData.otherLights, 
        drawingState: data.drawingState || defaultData.drawingState, 
        measurementUnit: data.measurementUnit || defaultData.measurementUnit,
        zoomExtentsTrigger: data.zoomExtentsTrigger || { timestamp: 0 },
        cameraFov: data.cameraFov ?? defaultData.cameraFov,
        worldBackgroundColor: data.worldBackgroundColor ?? defaultData.worldBackgroundColor,
        renderSettings: data.renderSettings ? { ...defaultData.renderSettings, ...data.renderSettings } : defaultData.renderSettings,
        cameraSettings: data.cameraSettings ? { ...defaultData.cameraSettings!, ...data.cameraSettings } : defaultData.cameraSettings!,
        environmentSettings: data.environmentSettings ? { ...defaultData.environmentSettings!, ...data.environmentSettings } : defaultData.environmentSettings!,
        postProcessingSettings: data.postProcessingSettings ? { ...defaultData.postProcessingSettings!, ...data.postProcessingSettings } : defaultData.postProcessingSettings!,
        layers: data.layers && data.layers.length > 0 ? data.layers : defaultData.layers,
        activeLayerId: data.activeLayerId || defaultData.activeLayerId,
        savedViews: data.savedViews || defaultData.savedViews,
        animationData: data.animationData || defaultData.animationData,
      });
    } else {
      console.error("Invalid scene data provided to loadScene, loading default scene.");
      setSceneData(defaultData); 
    }
  }, []);

  const clearCurrentProjectScene = useCallback(() => {
    setSceneData(getDefaultSceneData());
  }, []);
  
  const getCurrentSceneData = useCallback((): SceneData => {
    const { 
      objects, materials, ambientLight, directionalLight, otherLights,
      selectedObjectId, activeTool, activePaintMaterialId, appMode, drawingState, measurementUnit,
      requestedViewPreset, zoomExtentsTrigger, cameraFov, worldBackgroundColor, renderSettings,
      layers, activeLayerId, cameraSettings, savedCameras, animationData, environmentSettings, postProcessingSettings, savedViews
    } = sceneData;
    return { 
      objects, materials, ambientLight, directionalLight, otherLights: otherLights || [],
      selectedObjectId, activeTool, activePaintMaterialId, appMode, drawingState, measurementUnit, 
      requestedViewPreset, zoomExtentsTrigger, cameraFov, worldBackgroundColor, renderSettings,
      layers: layers || [], activeLayerId: activeLayerId || DEFAULT_LAYER_ID,
      cameraSettings: cameraSettings || getDefaultSceneData().cameraSettings!,
      savedCameras: savedCameras || {},
      animationData: animationData || getDefaultSceneData().animationData!,
      environmentSettings: environmentSettings || getDefaultSceneData().environmentSettings!,
      postProcessingSettings: postProcessingSettings || getDefaultSceneData().postProcessingSettings!,
      savedViews: savedViews || [],
    };
  }, [sceneData]);


  const setActiveTool = useCallback((tool: ToolType | undefined, preserveSelection: boolean = false) => {
    setSceneData(prev => {
      let newActivePaintMaterialId = prev.activePaintMaterialId;
      let newDrawingState: DrawingState = { ...prev.drawingState }; 
      
      if (tool !== 'paint') {
        newActivePaintMaterialId = null; 
      }
      
      const persistentTools: ToolType[] = ['rectangle', 'line', 'arc', 'tape', 'pushpull', 'circle', 'polygon', 'freehand', 'protractor', 'eraser', 'paint'];
      
      if (tool && persistentTools.includes(tool)) {
        newDrawingState.tool = tool as DrawingState['tool'];
        if (tool === 'polygon') newDrawingState.polygonSides = prev.drawingState.polygonSides || 6;
      } else {
         newDrawingState.tool = null;
         newDrawingState.isActive = false;
         newDrawingState.startPoint = null;
         newDrawingState.currentPoint = null;
         newDrawingState.pushPullFaceInfo = null;
         if (tool !== 'tape') {
            newDrawingState.measureDistance = null;
         }
      }
      
      let newSelectedObjectId = prev.selectedObjectId;
      if (!preserveSelection && tool !== 'select' && tool !== 'move' && tool !== 'rotate' && tool !== 'scale' && tool !== 'paint' && tool !== 'pushpull') {
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

  const setMeasurementUnit = useCallback((unit: MeasurementUnit) => {
    setSceneData(prev => ({ ...prev, measurementUnit: unit }));
  }, []);

  const setCameraViewPreset = useCallback((preset: ViewPreset | null) => {
    setSceneData(prev => ({ ...prev, requestedViewPreset: preset }));
  }, []);

  const triggerZoomExtents = useCallback((targetObjectId?: string) => {
    setSceneData(prev => ({ ...prev, zoomExtentsTrigger: { timestamp: Date.now(), targetObjectId } }));
  }, []);

  const setZoomExtentsTriggered = useCallback(() => {
    setSceneData(prev => ({ ...prev, zoomExtentsTrigger: { timestamp: 0, targetObjectId: undefined } }));
  }, []);

  const setCameraFov = useCallback((fov: number) => { // For modelling viewport
    setSceneData(prev => ({ ...prev, cameraFov: fov }));
  }, []);

  const setWorldBackgroundColor = useCallback((color: string) => {
    setSceneData(prev => ({ ...prev, worldBackgroundColor: color }));
  }, []);

  const updateRenderSettings = useCallback((settings: Partial<RenderSettings>) => {
    setSceneData(prev => ({ ...prev, renderSettings: { ...(prev.renderSettings || getDefaultSceneData().renderSettings!), ...settings } as RenderSettings}));
  }, []);

  const updateCameraSettings = useCallback((settings: Partial<CameraSettings>) => { // For scene/render camera
    setSceneData(prev => ({ ...prev, cameraSettings: { ...(prev.cameraSettings || getDefaultSceneData().cameraSettings!), ...settings } as CameraSettings}));
  }, []);
  
  const updateEnvironmentSettings = useCallback((settings: Partial<EnvironmentSettings>) => {
    setSceneData(prev => ({ ...prev, environmentSettings: { ...(prev.environmentSettings || getDefaultSceneData().environmentSettings!), ...settings } as EnvironmentSettings}));
  }, []);
  
  const updatePostProcessingSettings = useCallback((settings: Partial<PostProcessingSettings>) => {
    setSceneData(prev => ({ ...prev, postProcessingSettings: { ...(prev.postProcessingSettings || getDefaultSceneData().postProcessingSettings!), ...settings } as PostProcessingSettings}));
  }, []);

  
  const contextValue = useMemo(() => ({
    ...sceneData,
    layers: sceneData.layers || [], 
    activeLayerId: sceneData.activeLayerId || DEFAULT_LAYER_ID,
    savedViews: sceneData.savedViews || [],
    environmentSettings: sceneData.environmentSettings || getDefaultSceneData().environmentSettings!,
    cameraSettings: sceneData.cameraSettings || getDefaultSceneData().cameraSettings!,
    postProcessingSettings: sceneData.postProcessingSettings || getDefaultSceneData().postProcessingSettings!,
    setAppMode,
    addObject,
    importCadPlan,
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
    addLayer, 
    updateLayer, 
    removeLayer, 
    setActiveLayerId, 
    getLayerById, 
    addSavedScene,
    updateSavedScene,
    removeSavedScene,
    applySavedScene,
    loadScene,
    clearCurrentProjectScene,
    activeTool: sceneData.activeTool,
    setActiveTool,
    activePaintMaterialId: sceneData.activePaintMaterialId,
    setActivePaintMaterialId,
    setDrawingState,
    measurementUnit: sceneData.measurementUnit ?? getDefaultSceneData().measurementUnit,
    setMeasurementUnit,
    getCurrentSceneData,
    requestedViewPreset: sceneData.requestedViewPreset,
    setCameraViewPreset,
    zoomExtentsTrigger: sceneData.zoomExtentsTrigger || { timestamp: 0 },
    triggerZoomExtents,
    setZoomExtentsTriggered,
    cameraFov: sceneData.cameraFov ?? getDefaultSceneData().cameraFov,
    setCameraFov,
    setWorldBackgroundColor,
    renderSettings: sceneData.renderSettings ?? getDefaultSceneData().renderSettings,
    updateRenderSettings,
    updateCameraSettings,
    updateEnvironmentSettings,
    updatePostProcessingSettings,
  }), [sceneData, setAppMode, addObject, importCadPlan, updateObject, removeObject, selectObject, addMaterial, updateMaterial, removeMaterial, getMaterialById, updateAmbientLight, updateDirectionalLight, addLight, updateLight, removeLight, getLightById, addLayer, updateLayer, removeLayer, setActiveLayerId, getLayerById, addSavedScene, updateSavedScene, removeSavedScene, applySavedScene, loadScene, clearCurrentProjectScene, setActiveTool, setActivePaintMaterialId, setDrawingState, setMeasurementUnit, getCurrentSceneData, setCameraViewPreset, triggerZoomExtents, setZoomExtentsTriggered, setCameraFov, setWorldBackgroundColor, updateRenderSettings, updateCameraSettings, updateEnvironmentSettings, updatePostProcessingSettings]);

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
