
export type PrimitiveType = 'cube' | 'cylinder' | 'plane' | 'text' | 'sphere' | 'cone' | 'torus' | 'polygon' | 'cadPlan' | 'circle'; 

// Inspired by PBR properties and V-Ray/D5 material systems
export interface MaterialProperties {
  id: string;
  name?: string; 
  materialType?: 'generic' | 'glass' | 'water' | 'foliage' | 'car_paint' | 'cloth' | 'leather' | 'metal' | 'plastic' | 'wood' | 'concrete' | 'emissive_light' | 'velvet' | 'sss'; // Subsurface Scattering

  // Core PBR
  color: string; // Base diffuse color / Albedo
  map?: string; // Base color texture (albedo)
  roughness: number;
  roughnessMap?: string;
  metalness: number;
  metalnessMap?: string;
  normalMap?: string;
  normalScale?: [number, number]; 
  aoMap?: string; // Ambient Occlusion map
  aoIntensity?: number; // WIP
  
  // Emission
  emissive?: string; 
  emissiveIntensity?: number;
  emissiveMap?: string; 

  // Transparency & Refraction
  opacity?: number; 
  transparent?: boolean; 
  alphaMap?: string; 
  alphaMode?: 'opaque' | 'blend' | 'mask'; // WIP for alpha handling
  alphaCutoff?: number; // WIP for mask mode
  ior?: number; // Index of Refraction
  refractionColor?: string; // WIP: Tint for refraction
  refractionGlossiness?: number; // WIP: Blurry refraction
  thinWalled?: boolean; // WIP (for thin glass like single-sided planes)

  // Displacement / Height
  displacementMap?: string;
  displacementScale?: number;
  displacementBias?: number;
  
  // Advanced Surface
  clearcoat?: number; // For car paint like effects
  clearcoatMap?: string;
  clearcoatRoughness?: number; 
  clearcoatRoughnessMap?: string;
  clearcoatNormalMap?: string; 
  
  sheen?: number; // For cloth/velvet
  sheenColor?: string; 
  sheenColorMap?: string;
  sheenRoughness?: number; 
  sheenRoughnessMap?: string;

  // Subsurface Scattering (WIP - for skin, wax, translucent plastics)
  subsurfaceScattering?: number; // Weight/Factor
  subsurfaceColor?: string; // SSS Radius Color (overall tint)
  // subsurfaceRadius?: [number, number, number]; // Actual radius per R,G,B channel - more complex

  // Anisotropy (WIP - for brushed metal, some fabrics)
  anisotropy?: number; 
  anisotropyRotation?: number; // Angle in degrees or radians
  anisotropyMap?: string; 

  // UVW Mapping 
  uvwMappingType?: 'uv_channel' | 'box' | 'planar' | 'cylindrical' | 'spherical' | 'triplanar' | 'world_space_box'; // Added more options
  uvTiling?: [number, number];
  uvOffset?: [number, number];
  uvRotation?: number; // Angle in degrees
  uvChannel?: number; // For multi-UV setups (0, 1, 2...)
  uvRealWorldScale?: boolean; // WIP (Use real-world units for texture scaling)
  uvProjectionAxis?: 'x' | 'y' | 'z'; // For planar mapping
  uvBoxProjectionBlend?: number; // For box/triplanar blend softness

  twoSided?: boolean; 
  brdfType?: 'ggx' | 'phong' | 'blinnphong' | 'ward'; // WIP Bidirectional Reflectance Distribution Function
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
  modifiers?: any[]; // WIP: Array of modifier configurations
  parentId?: string; // WIP for grouping
  isGroup?: boolean; // WIP for grouping
  isComponentDefinition?: boolean; // WIP for component definitions
  componentInstanceId?: string; // WIP for instances of components
}

export interface AmbientLightProps {
  color: string;
  intensity: number;
}

export type LightType = 'ambient' | 'directional' | 'point' | 'spot' | 'area' | 'skylight' | 'photometric' | 'sphere' | 'disk' | 'quad'; // Added more specific area light shapes, skylight is often HDRI based

export interface BaseLightProps {
  id: string;
  name: string;
  type: LightType;
  color: string;
  intensity: number;
  visible?: boolean;
  castShadow?: boolean; // Common to most shadow-casting lights
  shadowBias?: number; // Common shadow property
  shadowRadius?: number; // Softness for shadows (Point, Spot, Area)
  shadowMapSize?: number; // Resolution (512, 1024, 2048, 4096)
}
export interface DirectionalLightSceneProps extends BaseLightProps {
  type: 'directional';
  position: [number, number, number]; // For UI helper gizmo and initial direction calc
  targetPosition?: [number,number,number]; // Optional target for gizmo, default (0,0,0)
  // castShadow: boolean; // Moved to BaseLightProps
  // shadowBias: number; // Moved to BaseLightProps
  sunAngle?: number; // Angular diameter of the sun for soft shadows
  sunSize?: number; // Alternative to sunAngle (V-Ray uses size)
  atmosphereThickness?: number; // For sky color interaction (WIP)
}
export interface PointLightSceneProps extends BaseLightProps {
  type: 'point';
  position: [number, number, number];
  distance?: number; // Attenuation distance
  decay?: number; // 0: none, 1: linear, 2: quadratic (physically correct)
  // castShadow?: boolean; // Moved
  // shadowBias?: number; // Moved
  // radius?: number; // Physical radius for soft shadows (area point light) - now shadowRadius
}

export interface SpotLightSceneProps extends BaseLightProps {
  type: 'spot';
  position: [number, number, number];
  targetPosition?: [number, number, number]; 
  angle?: number; // Cone angle (radians)
  penumbra?: number; // Cone edge softness (0-1)
  distance?: number;
  decay?: number;
  // castShadow?: boolean; // Moved
  // shadowBias?: number; // Moved
  iesProfile?: string; // Path to IES file (WIP)
  barnDoors?: { top: number, bottom: number, left: number, right: number }; // WIP: 0-1 values
  aspectRatio?: number; // For rectangular/elliptical spots (WIP)
}

export interface AreaLightSceneProps extends BaseLightProps {
  type: 'area' | 'sphere' | 'disk' | 'quad'; // More specific types for area lights
  position: [number, number, number];
  rotation?: [number, number, number]; 
  width?: number;  // For quad/rectangle
  height?: number; // For quad/rectangle
  radius?: number; // For disk/sphere
  shape?: 'rectangle' | 'disk' | 'sphere' | 'cylinder'; // Maintained for consistency if needed, but type often implies shape
  isPortal?: boolean; // For skylight portals (WIP)
  texture?: string; // Path to texture for textured area lights (WIP)
  twoSided?: boolean; 
  spread?: number; // For D5/V-Ray like area light spread control (degrees, WIP)
}

export interface SkyLightSceneProps extends BaseLightProps { 
    type: 'skylight'; // Typically HDRI based, but can also be a simple color dome
    hdriPath?: string; // Path to HDRI texture
    hdriRotation?: number; // Degrees
    useSun?: boolean; // Link to directional light as sun (WIP)
    skyModel?: 'none' | 'hosek_wilkie' | 'preetham'; // WIP Physical sky models
}
export interface PhotometricLightSceneProps extends BaseLightProps { 
    type: 'photometric';
    position: [number,number,number];
    targetPosition?: [number,number,number];
    iesFilePath?: string;
    filterColor?: string; // Color filter for the light
    // shadowSamples?: number; // Moved to BaseLightProps as shadowMapSize or similar
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
  | 'intersectWithModel'
  | 'intersectWithSelection'
  | 'intersectWithContext'
  | 'outerShell' // Solid tools category
  | 'solidUnion'
  | 'solidSubtract'
  | 'solidIntersect'
  | 'solidTrim'
  | 'softenEdges'
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
  | 'zoomWindow' 
  | 'zoomExtents'
  | 'lookAround'
  | 'walk'
  // Primitive adding tools are less "tools" and more "commands", but kept for consistency
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


export type AppMode = 'modelling' | 'rendering'; 

export type ViewPreset = 'top' | 'bottom' | 'front' | 'back' | 'left' | 'right' | 'perspective' | 'isoTopRight' | 'isoTopLeft'; 

export type RenderEngineType = 'cycles' | 'eevee' | 'path_traced_rt' | 'vray_mock' | 'corona_mock' | 'unreal_pathtracer_mock'; // Added more conceptual engines

export interface RenderSettings {
  engine: RenderEngineType;
  resolution: string; // e.g., "1920x1080"
  resolutionPreset?: 'HD' | 'FullHD' | '2K_QHD' | '4K_UHD' | 'Custom'; // For UI
  customWidth?: number; // For custom resolution
  customHeight?: number; // For custom resolution
  aspectRatioLock?: boolean;
  outputFormat: 'png' | 'jpeg' | 'exr' | 'tiff' | 'mp4' | 'avi'; 
  pngBitDepth?: 8 | 16; // WIP
  jpegQuality?: number; // WIP (0-100)
  exrDataType?: 'half' | 'float'; // WIP
  exrCompression?: 'none' | 'zip' | 'piz'; // WIP
  
  // Quality
  samples?: number; // Primary samples (Cycles, Path Tracers)
  denoiser?: 'none' | 'optix' | 'oidn' | 'intel_openimage' | 'vray_default' | 'corona_highquality'; // More specific denoisers
  timeLimit?: number; // In seconds, 0 for no limit (WIP)
  noiseThreshold?: number; // Adaptive sampling (WIP)
  
  // Advanced Engine Settings (Conceptual examples)
  giMode?: 'brute_force' | 'irradiance_cache' | 'light_cache' | 'path_tracing_gi'; // For V-Ray like engines
  caustics?: boolean; // WIP
  maxBounces?: { total: number, diffuse: number, glossy: number, transmission: number, volume: number }; // WIP
  
  // Output
  outputPath?: string; // WIP
  fileName?: string; // WIP
  overwriteExisting?: boolean; // WIP
  
  // Render Elements / AOVs (Array of strings for now, could be more structured)
  renderElements?: string[]; // e.g., ["Z-Depth", "Normals", "AO", "ObjectID", "MaterialID", "CryptomatteObject", "CryptomatteMaterial", "Reflection", "Refraction", "DiffuseFilter", "Specular", "GI", "Shadows"] (WIP)
  
  // Color Management (Inspired by Blender/ACES)
  colorManagement?: { 
    displayDevice: 'sRGB' | 'Rec.709' | 'ACES'; // WIP
    viewTransform: 'Standard' | 'Filmic' | 'Raw'; // WIP
    look?: 'None' | 'Medium Contrast' | 'High Contrast'; // WIP
    exposure: number; 
    gamma: number; 
    lutFile?: string; // Path to Look-Up Table file (WIP)
  }; 
  
  // Animation Output (WIP)
  frameRange?: string; // e.g., "1-100, 150, 200-210"
  frameStep?: number;
  fps?: number; // Frames Per Second for video output
  videoCodec?: string; // e.g., "h264", "prores" (WIP)
  videoBitrate?: number; // WIP
  
  // Distributed Rendering (WIP)
  distributedRendering?: { enabled: boolean; renderNodes: string[] }; 
}

export interface SceneLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color?: string; 
  objectCount?: number; 
}

export interface SavedSceneView { 
  id: string;
  name: string;
  thumbnail?: string; 
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  cameraFov: number;
  activeLayerVisibility?: Record<string, boolean>; // WIP
  activeStyleOverrides?: any; // WIP (e.g., specific edge style for this scene)
  environmentOverrides?: Partial<EnvironmentSettings>; // WIP
}

export interface EnvironmentSettings {
  backgroundMode: 'color' | 'gradient' | 'hdri' | 'physical_sky';
  backgroundColor?: string;
  gradientTopColor?: string; // WIP
  gradientBottomColor?: string; // WIP
  
  hdriPath?: string; 
  hdriIntensity?: number; 
  hdriRotation?: number; 
  hdriVisibleBackground?: boolean; // WIP
  hdriAffectsLighting?: boolean; // WIP
  hdriAffectsReflections?: boolean; // WIP

  usePhysicalSky?: boolean; 
  physicalSkySettings?: { 
      turbidity: number, 
      sunPositionMode: 'manual' | 'datetime_location', 
      azimuth: number, 
      altitude: number, 
      intensity: number,
      sunDiskSize: number, // Angular size of the sun
      sunDiskIntensity?: number; // Separate control for disk appearance (WIP)
      groundAlbedo: number, // Reflectivity of the ground
      date?: string, // YYYY-MM-DD
      time?: string, // HH:MM
      latitude?: number,
      longitude?: number,
      timezone?: string; // WIP
  };
  groundPlane?: { // WIP (for rendering)
    enabled: boolean;
    height: number;
    materialId?: string; // Assign a material for reflections etc.
    receiveShadows?: boolean;
  };
  fog?: { 
      enabled: boolean, 
      color: string, 
      density: number, 
      heightFog?: boolean, 
      heightFalloff?: number, 
      startDistance?: number, 
      endDistance?: number, 
      affectSky?: boolean; // WIP: Does fog affect the skybox/HDRI
  };
  volumetricLighting?: { 
      enabled: boolean;
      samples?: number; // Quality
      scattering?: number; // Density of volumetric effect
      anisotropy?: number; // Direction of scattering (forward/backward) - WIP
      maxDistance?: number; // WIP
  };
  atmosphere?: { // D5 style atmospheric controls
      haze?: number; // Overall atmospheric haze
      ozone?: number; // Color of the sky
      skyTint?: string; // WIP
      horizonBlur?: number; // WIP
  };
  weatherEffects?: { // D5 placeholder
      rain?: { enabled: boolean; intensity: number; puddleAmount: number; rainStreaksOnGlass?: boolean };
      snow?: { enabled: boolean; accumulation: number; melting: number; snowflakes?: boolean };
      wind?: { enabled: boolean; speed: number; direction: number; affectFoliage?: boolean }; // WIP
  }
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
  worldBackgroundColor?: string; // Used as default for solid color background
  renderSettings?: RenderSettings;
  
  layers?: SceneLayer[]; 
  savedViews?: SavedSceneView[]; 
  activeLayerId?: string;
  
  environmentSettings?: EnvironmentSettings; // Consolidated environment settings
}

export const DEFAULT_MATERIAL_ID = 'default-material-archvision'; 
export const DEFAULT_MATERIAL_NAME = 'ArchiVision Default';

export const DEFAULT_LAYER_ID = 'default-layer-0';
export const DEFAULT_LAYER_NAME = 'Default Layer';
