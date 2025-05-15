

export type PrimitiveType = 'cube' | 'cylinder' | 'plane' | 'text' | 'sphere' | 'cone' | 'torus' | 'polygon' | 'cadPlan' | 'circle'; 

export interface MaterialProperties {
  id: string;
  name?: string; 
  color: string; // Base diffuse color
  roughness: number;
  metalness: number;
  map?: string; // Base color texture (albedo)
  normalMap?: string;
  normalScale?: [number, number]; 
  roughnessMap?: string;
  metalnessMap?: string;
  aoMap?: string; // Ambient Occlusion map
  emissive?: string; // Emissive color
  emissiveIntensity?: number;
  emissiveMap?: string; // Emissive texture (WIP)
  opacity?: number; 
  transparent?: boolean; 
  alphaMap?: string; 
  ior?: number; // Index of Refraction (for transparency/glass)
  displacementMap?: string;
  displacementScale?: number;
  displacementBias?: number;
  clearcoat?: number; // For car paint like effects
  clearcoatRoughness?: number; 
  clearcoatNormalMap?: string; 
  clearcoatMap?: string; // WIP
  sheen?: number; // WIP for cloth/velvet
  sheenColor?: string; // WIP
  sheenRoughness?: number; // WIP
  sheenColorMap?: string; // WIP
  subsurfaceScattering?: number; // WIP (Weight/Factor)
  subsurfaceColor?: string; // WIP (Radius color)
  subsurfaceRadius?: [number, number, number]; // WIP (Actual radius per channel)
  anisotropy?: number; // WIP for brushed metal
  anisotropyRotation?: number; // WIP (Angle in degrees or radians)
  anisotropyMap?: string; // WIP

  // UVW Mapping Placeholders (WIP)
  uvwMappingType?: 'box' | 'planar' | 'cylindrical' | 'spherical' | 'triplanar' | 'channel';
  uvTiling?: [number, number];
  uvOffset?: [number, number];
  uvRotation?: number; // Angle in degrees
  uvChannel?: number; // For multi-UV setups

  // Conceptual Material Type (D5/V-Ray inspired - for UI grouping/presets)
  materialType?: 'generic' | 'glass' | 'water' | 'foliage' | 'car_paint' | 'cloth' | 'leather' | 'metal' | 'plastic' | 'wood' | 'concrete' | 'emissive_light';
  twoSided?: boolean; 
}

export interface CadPlanLine {
  start: [number, number]; 
  end: [number, number];   
}

export interface CadPlanData {
  lines: CadPlanLine[];
}

export interface SceneObjectDimensions {
  width?: number; 
  height?: number; 
  depth?: number; 
  radius?: number; 
  radiusTop?: number; 
  radiusBottom?: number; 
  radialSegments?: number; 
  heightSegments?: number; 
  tube?: number; 
  tubularSegments?: number; 
  arc?: number; 
  sides?: number; 
  text?: string; 
  fontSize?: number; 
}

export interface SceneObject {
  id:string;
  type: PrimitiveType;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number]; 
  scale: [number, number, number];
  dimensions: SceneObjectDimensions; 
  materialId: string; 
  visible?: boolean; 
  planData?: CadPlanData; 
  locked?: boolean; 
  layerId?: string; 
  modifiers?: any[]; 
  parentId?: string; // WIP for grouping
  isGroup?: boolean; // WIP for grouping
}

export interface AmbientLightProps {
  color: string;
  intensity: number;
}

export type LightType = 'ambient' | 'directional' | 'point' | 'spot' | 'area' | 'skylight' | 'photometric'; // Added more types

export interface BaseLightProps {
  id: string;
  name: string;
  type: LightType;
  color: string;
  intensity: number;
  visible?: boolean;
}
export interface DirectionalLightSceneProps extends BaseLightProps {
  type: 'directional';
  position: [number, number, number]; 
  castShadow: boolean;
  shadowBias: number;
  sunAngle?: number; 
  sunSize?: number;
}
export interface PointLightSceneProps extends BaseLightProps {
  type: 'point';
  position: [number, number, number];
  distance?: number;
  decay?: number; // 0: none, 1: linear, 2: quadratic
  castShadow?: boolean;
  shadowBias?: number;
  radius?: number; // For soft shadows / area point light
}

export interface SpotLightSceneProps extends BaseLightProps {
  type: 'spot';
  position: [number, number, number];
  targetPosition?: [number, number, number]; 
  angle?: number; 
  penumbra?: number; 
  distance?: number;
  decay?: number;
  castShadow?: boolean;
  shadowBias?: number;
  iesProfile?: string; // Path to IES file (WIP)
  barnDoors?: { top: number, bottom: number, left: number, right: number }; // WIP
}

export interface AreaLightSceneProps extends BaseLightProps {
  type: 'area'; 
  position: [number, number, number];
  rotation?: [number, number, number]; 
  width?: number;
  height?: number;
  shape?: 'rectangle' | 'disk' | 'sphere' | 'cylinder'; // WIP
  isPortal?: boolean; 
  texture?: string; // WIP for textured area lights
  twoSided?: boolean; // WIP
}

export interface SkyLightSceneProps extends BaseLightProps { // D5/V-Ray inspired
    type: 'skylight';
    hdriPath?: string; // Path to HDRI texture
    hdriRotation?: number; // Degrees
    useSun?: boolean; // Link to directional light as sun
}
export interface PhotometricLightSceneProps extends BaseLightProps { // 3ds Max/V-Ray
    type: 'photometric';
    position: [number,number,number];
    targetPosition?: [number,number,number];
    iesFilePath?: string;
    filterColor?: string;
    shadowSamples?: number;
}


export type SceneLight = DirectionalLightSceneProps | PointLightSceneProps | SpotLightSceneProps | AreaLightSceneProps | SkyLightSceneProps | PhotometricLightSceneProps;


export type ToolType = 
  | 'select' 
  | 'line' 
  | 'rectangle' 
  | 'rotatedRectangle' 
  | 'circle'
  | 'arc' // Main category
  | 'arc2Point' 
  | 'arc3Point' 
  | 'pie' 
  | 'polygon'
  | 'freehand'
  | 'pushpull' 
  | 'move' 
  | 'rotate' 
  | 'scale' 
  | 'offset' 
  | 'followme' 
  | 'intersectFaces' 
  | 'outerShell' // Placeholder for Solid Tools
  | 'tape' 
  | 'protractor' 
  | 'dimension' 
  | 'axes' 
  | 'sectionPlane' 
  | 'addText' 
  | 'paint'
  | 'eraser'
  | 'orbit' 
  | 'pan'
  | 'zoom' // Could be specific zoom tool
  | 'zoomWindow' // WIP
  | 'zoomExtents'
  // Primitive adding tools (less direct usage if using menus/outliner for creation)
  | 'addCube'
  | 'addCylinder'
  | 'addPlane'
  | 'addSphere'
  | 'addCone'
  | 'addTorus';


export interface PushPullFaceInfo {
  objectId: string;
  initialMeshWorldPosition: [number, number, number];
  initialLocalIntersectPoint: [number,number,number];
  initialWorldIntersectionPoint: [number, number, number]; 
  localFaceNormal: [number,number,number]; 
  worldFaceNormal: [number,number,number]; 
  originalDimensions: SceneObjectDimensions;
  originalPosition: [number, number, number];
  originalRotation: [number, number, number]; 
  originalType: PrimitiveType;
}

export type MeasurementUnit = 'units' | 'm' | 'cm' | 'mm' | 'ft' | 'in';

export interface DrawingState {
  isActive: boolean;
  tool: ToolType | null; 
  startPoint: [number, number, number] | null;
  currentPoint?: [number, number, number] | null;
  measureDistance?: number | null; 
  pushPullFaceInfo?: PushPullFaceInfo | null;
  polygonSides?: number; 
}


export const AVAILABLE_TOOLS: { id: ToolType; label: string; icon?: React.ElementType, isWip?: boolean }[] = [
  { id: 'select', label: 'Select' },
  { id: 'line', label: 'Line' }, 
  { id: 'rectangle', label: 'Rectangle' }, 
  { id: 'circle', label: 'Circle' },
  { id: 'arc', label: 'Arc', isWip: true }, 
  { id: 'polygon', label: 'Polygon' },
  { id: 'freehand', label: 'Freehand', isWip: true },
  { id: 'pushpull', label: 'Push/Pull' },
  { id: 'move', label: 'Move' },
  { id: 'rotate', label: 'Rotate' },
  { id: 'scale', label: 'Scale' },
  { id: 'offset', label: 'Offset', isWip: true },
  { id: 'tape', label: 'Measure' },
  { id: 'protractor', label: 'Protractor', isWip: true },
  { id: 'addText', label: '3D Text' },
  { id: 'paint', label: 'Paint Bucket' },
  { id: 'eraser', label: 'Eraser' },
  { id: 'pan', label: 'Pan', isWip: true },
  { id: 'zoomExtents', label: 'Zoom Extents' },
  { id: 'addCube', label: 'Add Cube'},
  { id: 'addCylinder', label: 'Add Cylinder'},
  { id: 'addPlane', label: 'Add Plane'},
  { id: 'addSphere', label: 'Add Sphere'},
  { id: 'addCone', label: 'Add Cone'},
  { id: 'addTorus', label: 'Add Torus'},
];

export type AppMode = 'modelling' | 'rendering'; 

export type ViewPreset = 'top' | 'bottom' | 'front' | 'back' | 'left' | 'right' | 'perspective' | 'isoTopRight' | 'isoTopLeft'; // Added ISO views

export type RenderEngineType = 'cycles' | 'eevee' | 'path_traced_rt' | 'vray_mock' | 'corona_mock'; // Added more mock engines

export interface RenderSettings {
  engine: RenderEngineType;
  resolution: string; 
  outputFormat: 'png' | 'jpeg' | 'exr' | 'tiff' | 'mp4' | 'avi'; // Added more formats
  samples: number; 
  denoiser?: 'none' | 'optix' | 'oidn' | 'intel_gauss' | 'vray_denoiser_mock' | 'corona_denoiser_mock'; 
  timeLimit?: number; 
  giMode?: 'brute_force' | 'irradiance_cache' | 'light_cache' | 'path_tracing_gi'; 
  caustics?: boolean;
  renderElements?: string[]; 
  outputPath?: string;
  colorManagement?: { displayDevice: string, viewTransform: string, look: string, exposure: number, gamma: number, lutFile?: string }; // Added LUT
  distributedRendering?: { enabled: boolean; slaves: string[] }; // WIP
  frameRange?: string; // WIP for animation e.g., "1-100, 150"
}

export interface SceneLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color?: string; // For UI identification
  objectCount?: number; // Dynamic, not stored in localStorage directly for now
}

export interface SavedSceneView { // For "Scenes" panel
  id: string;
  name: string;
  thumbnail?: string; // data URL
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  cameraFov: number;
  // layerVisibilityStates: Record<string, boolean>; // WIP
  // activeStyle: string; // WIP
}


export interface SceneData {
  objects: SceneObject[];
  materials: MaterialProperties[];
  ambientLight: AmbientLightProps; 
  directionalLight: DirectionalLightSceneProps; 
  otherLights?: SceneLight[]; 
  selectedObjectId?: string | null;
  activeTool?: ToolType;
  activePaintMaterialId?: string | null;
  appMode: AppMode; 
  drawingState: DrawingState;
  measurementUnit?: MeasurementUnit; 
  requestedViewPreset?: ViewPreset | null; 
  zoomExtentsTrigger?: { timestamp: number; targetObjectId?: string }; 
  cameraFov?: number; 
  worldBackgroundColor?: string; 
  renderSettings?: RenderSettings;
  
  layers?: SceneLayer[]; 
  savedViews?: SavedSceneView[]; 
  activeLayerId?: string;
  
  environment?: {
    hdriPath?: string;
    hdriIntensity?: number;
    hdriRotation?: number;
    usePhysicalSky?: boolean;
    physicalSkySettings?: { 
        turbidity: number, 
        sunPositionMode: 'manual' | 'datetime_location', 
        azimuth: number, 
        altitude: number, 
        intensity: number,
        sunDiskSize: number,
        groundAlbedo: number,
        // Datetime location WIP
        date?: string, // YYYY-MM-DD
        time?: string, // HH:MM
        latitude?: number,
        longitude?: number,
    };
    fog?: { 
        enabled: boolean, 
        color: string, 
        density: number, 
        heightFog?: boolean, // D5 style height fog
        heightFalloff?: number, // D5 style
        startDistance?: number, // SketchUp style
        endDistance?: number, // SketchUp style
    };
    volumetricLighting?: { // D5 style
        enabled: boolean;
        samples?: number;
        scattering?: number;
    };
    atmosphere?: { // D5 style
        haze?: number;
        ozone?: number;
    };
    weatherEffects?: { // D5 placeholder
        rain?: { enabled: boolean; intensity: number; puddleAmount: number };
        snow?: { enabled: boolean; accumulation: number; melting: number };
    }
  };
}

export const DEFAULT_MATERIAL_ID = 'default-material-archvision'; // Make more unique
export const DEFAULT_MATERIAL_NAME = 'ArchiVision Default';

export const DEFAULT_LAYER_ID = 'default-layer-0';
export const DEFAULT_LAYER_NAME = 'Default Layer';
