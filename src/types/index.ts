

export type PrimitiveType = 'cube' | 'cylinder' | 'plane' | 'text' | 'sphere' | 'cone' | 'torus' | 'polygon' | 'cadPlan' | 'circle'; 

export type ModifierType = 
  | 'bevel' | 'subdivision' | 'solidify' | 'array' | 'mirror' | 'lattice' | 'boolean' | 'displacement'
  | 'skin' | 'shell' | 'path_deform' | 'ffd' | 'cloth' | 'hair_fur'; // More conceptual modifiers

// Inspired by PBR properties and V-Ray/D5 material systems
export interface MaterialProperties {
  id: string;
  name?: string; 
  materialType?: 'generic' | 'glass' | 'water' | 'foliage' | 'car_paint' | 'cloth' | 'leather' | 'metal' | 'plastic' | 'wood' | 'concrete' | 'emissive_light' | 'velvet' | 'sss' | 'vray_standard' | 'd5_standard'; // Conceptual SOTA types

  // Core PBR
  color: string; 
  map?: string; 
  roughness: number;
  roughnessMap?: string;
  metalness: number;
  metalnessMap?: string;
  normalMap?: string;
  normalScale?: [number, number]; 
  aoMap?: string; 
  aoIntensity?: number;
  
  // Emission
  emissive?: string; 
  emissiveIntensity?: number;
  emissiveMap?: string; 

  // Transparency & Refraction
  opacity?: number; 
  transparent?: boolean; 
  alphaMap?: string; 
  alphaMode?: 'opaque' | 'blend' | 'mask'; 
  alphaCutoff?: number; 
  ior?: number; 
  refractionColor?: string; 
  refractionGlossiness?: number; 
  thinWalled?: boolean; 

  // Displacement / Height
  displacementMap?: string;
  displacementScale?: number;
  displacementBias?: number;
  tessellationLevel?: number; // WIP for displacement quality
  
  // Advanced Surface
  clearcoat?: number; 
  clearcoatMap?: string;
  clearcoatRoughness?: number; 
  clearcoatRoughnessMap?: string;
  clearcoatNormalMap?: string; 
  
  sheen?: number; 
  sheenColor?: string; 
  sheenColorMap?: string;
  sheenRoughness?: number; 
  sheenRoughnessMap?: string;

  // Subsurface Scattering
  subsurfaceScattering?: number; 
  subsurfaceColor?: string; 
  subsurfaceRadius?: [number, number, number]; // More detailed SSS

  // Anisotropy
  anisotropy?: number; 
  anisotropyRotation?: number; 
  anisotropyMap?: string; 

  // UVW Mapping 
  uvwMappingType?: 'uv_channel' | 'box' | 'planar' | 'cylindrical' | 'spherical' | 'triplanar' | 'world_space_box'; 
  uvTiling?: [number, number];
  uvOffset?: [number, number];
  uvRotation?: number; 
  uvChannel?: number; 
  uvRealWorldScale?: boolean; 
  uvProjectionAxis?: 'x' | 'y' | 'z'; 
  uvBoxProjectionBlend?: number; 
  uvFlip?: { u: boolean, v: boolean }; // WIP

  twoSided?: boolean; 
  brdfType?: 'ggx' | 'phong' | 'blinnphong' | 'ward' | 'microfacet_ggx' | 'cook_torrance'; // More BRDFs
  translucency?: number; // WIP for thin materials like paper, leaves
  translucencyColor?: string; // WIP
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
  parentId?: string; 
  isGroup?: boolean; 
  isComponentDefinition?: boolean; 
  componentInstanceId?: string; 
  customAttributes?: Record<string, any>; // WIP for user properties
}

export interface AmbientLightProps {
  color: string;
  intensity: number;
}

export type LightType = 'ambient' | 'directional' | 'point' | 'spot' | 'area' | 'skylight' | 'photometric' | 'sphere' | 'disk' | 'quad' | 'cylinder_light' | 'mesh_light'; // More types

export interface BaseLightProps {
  id: string;
  name: string;
  type: LightType;
  color: string;
  intensity: number;
  visible?: boolean;
  castShadow?: boolean; 
  shadowBias?: number; 
  shadowRadius?: number; 
  shadowMapSize?: number; 
  volumetricContribution?: number; // WIP for per-light volumetrics
  linkedObjects?: string[]; // WIP for light linking
  excludedObjects?: string[]; // WIP for light exclusion
}
export interface DirectionalLightSceneProps extends BaseLightProps {
  type: 'directional';
  position: [number, number, number]; 
  targetPosition?: [number,number,number]; 
  sunAngle?: number; 
  sunSize?: number; 
  atmosphereThickness?: number; 
}
export interface PointLightSceneProps extends BaseLightProps {
  type: 'point';
  position: [number, number, number];
  distance?: number; 
  decay?: number; 
}

export interface SpotLightSceneProps extends BaseLightProps {
  type: 'spot';
  position: [number, number, number];
  targetPosition?: [number, number, number]; 
  angle?: number; 
  penumbra?: number; 
  distance?: number;
  decay?: number;
  iesProfile?: string; 
  barnDoors?: { top: number, bottom: number, left: number, right: number }; 
  aspectRatio?: number; 
}

export interface AreaLightSceneProps extends BaseLightProps {
  type: 'area' | 'sphere' | 'disk' | 'quad' | 'cylinder_light'; 
  position: [number, number, number];
  rotation?: [number, number, number]; 
  width?: number;  
  height?: number; 
  radius?: number; 
  shape?: 'rectangle' | 'disk' | 'sphere' | 'cylinder'; 
  isPortal?: boolean; 
  texture?: string; 
  twoSided?: boolean; 
  spread?: number; 
}

export interface SkyLightSceneProps extends BaseLightProps { 
    type: 'skylight'; 
    hdriPath?: string; 
    hdriRotation?: number; 
    useSun?: boolean; 
    skyModel?: 'none' | 'hosek_wilkie' | 'preetham' | 'd5_procedural'; 
}
export interface PhotometricLightSceneProps extends BaseLightProps { 
    type: 'photometric';
    position: [number,number,number];
    targetPosition?: [number,number,number];
    iesFilePath?: string;
    filterColor?: string; 
}
export interface MeshLightSceneProps extends BaseLightProps {
  type: 'mesh_light';
  meshObjectId?: string; // ID of the scene object to use as a light emitter
  // Mesh light specific properties...
}


export type SceneLight = DirectionalLightSceneProps | PointLightSceneProps | SpotLightSceneProps | AreaLightSceneProps | SkyLightSceneProps | PhotometricLightSceneProps | MeshLightSceneProps;


export type ToolType = 
  | 'select' 
  | 'line' 
  | 'rectangle' 
  | 'rotatedRectangle' 
  | 'circle'
  | 'arc' 
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
  | 'outerShell' 
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

export type RenderEngineType = 'cycles' | 'eevee' | 'path_traced_rt' | 'vray_mock' | 'corona_mock' | 'unreal_pathtracer_mock' | 'd5_render_mock'; 

export type RenderOutputType = 'png' | 'jpeg' | 'exr' | 'tiff' | 'mp4' | 'mov' | 'avi';

export type RenderPassType = 
  | 'beauty' | 'z_depth' | 'normal' | 'ao' | 'object_id' | 'material_id' 
  | 'cryptomatte_object' | 'cryptomatte_material' | 'cryptomatte_asset'
  | 'reflection' | 'refraction' | 'diffuse_filter' | 'specular' | 'gi' | 'shadows' | 'velocity' | 'world_position';

export interface RenderSettings {
  engine: RenderEngineType;
  resolution: string; 
  resolutionPreset?: 'HD' | 'FullHD' | '2K_QHD' | '4K_UHD' | 'Custom'; 
  customWidth?: number; 
  customHeight?: number; 
  aspectRatioLock?: boolean;
  outputFormat: RenderOutputType; 
  pngBitDepth?: 8 | 16; 
  jpegQuality?: number; 
  exrDataType?: 'half' | 'float'; 
  exrCompression?: 'none' | 'zip' | 'piz'; 
  
  samples?: number; 
  denoiser?: 'none' | 'optix' | 'oidn' | 'intel_openimage' | 'vray_default' | 'corona_highquality' | 'd5_default'; 
  timeLimit?: number; 
  noiseThreshold?: number; 
  adaptiveMinSamples?: number; // WIP
  adaptiveMaxSamples?: number; // WIP
  
  giMode?: 'brute_force' | 'irradiance_cache' | 'light_cache' | 'path_tracing_gi'; 
  caustics?: boolean; 
  maxBounces?: { total: number, diffuse: number, glossy: number, transmission: number, volume: number }; 
  
  outputPath?: string; 
  fileName?: string; 
  overwriteExisting?: boolean; 
  
  renderElements?: RenderPassType[]; 
  
  colorManagement?: { 
    displayDevice: 'sRGB' | 'Rec.709' | 'ACEScg'; 
    viewTransform: 'Standard' | 'Filmic' | 'Raw' | 'ACES'; 
    look?: 'None' | 'Medium Contrast' | 'High Contrast' | string; // string for custom LUT name
    exposure: number; 
    gamma: number; 
    lutFile?: string; 
  }; 
  
  animationSettings?: { // WIP
    frameRange?: string; 
    frameStep?: number;
    fps?: number; 
    videoCodec?: string; 
    videoBitrate?: number; 
    audioPath?: string;
  };
  
  distributedRendering?: { enabled: boolean; renderNodes: string[]; mode?: 'auto' | 'manual_select' }; // WIP
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
  activeLayerVisibility?: Record<string, boolean>; 
  activeStyleOverrides?: any; 
  environmentOverrides?: Partial<EnvironmentSettings>; 
}

export type PhysicalSkyModel = 'none' | 'hosek_wilkie' | 'preetham' | 'd5_procedural';

export interface EnvironmentSettings {
  backgroundMode: 'color' | 'gradient' | 'hdri' | 'physical_sky';
  backgroundColor?: string;
  gradientTopColor?: string; 
  gradientBottomColor?: string; 
  
  hdriPath?: string; 
  hdriIntensity?: number; 
  hdriRotation?: number; 
  hdriVisibleBackground?: boolean; 
  hdriAffectsLighting?: boolean; 
  hdriAffectsReflections?: boolean; 

  usePhysicalSky?: boolean; 
  physicalSkySettings?: { 
      skyModel: PhysicalSkyModel;
      turbidity: number, 
      sunPositionMode: 'manual' | 'datetime_location', 
      azimuth: number, 
      altitude: number, 
      intensity: number,
      sunDiskSize: number, 
      sunDiskIntensity?: number; 
      groundAlbedo: number, 
      date?: string, 
      time?: string, 
      latitude?: number,
      longitude?: number,
      timezone?: string; 
      ozone?: number; // For atmospheric tint
  };
  groundPlane?: { 
    enabled: boolean;
    height: number;
    materialId?: string; 
    receiveShadows?: boolean;
    size?: number; // WIP
  };
  fog?: { 
      enabled: boolean, 
      color: string, 
      density: number, 
      heightFog?: boolean, 
      heightFalloff?: number, 
      startDistance?: number, 
      endDistance?: number, 
      affectSky?: boolean; 
  };
  volumetricLighting?: { 
      enabled: boolean;
      samples?: number; 
      scattering?: number; 
      anisotropy?: number; 
      maxDistance?: number; 
      attenuationColor?: string; // WIP
  };
  atmosphere?: { 
      haze?: number; 
      ozone?: number; 
      skyTint?: string; 
      horizonBlur?: number; 
  };
  weatherEffects?: { 
      rain?: { enabled: boolean; intensity: number; puddleAmount: number; rainStreaksOnGlass?: boolean; splashEffect?: boolean };
      snow?: { enabled: boolean; accumulation: number; melting: number; snowflakes?: boolean; windInfluence?: number };
      wind?: { enabled: boolean; speed: number; direction: number; affectFoliage?: boolean; affectParticles?: boolean }; 
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
  worldBackgroundColor?: string; 
  renderSettings?: RenderSettings;
  
  layers?: SceneLayer[]; 
  savedViews?: SavedSceneView[]; 
  activeLayerId?: string;
  
  environmentSettings?: EnvironmentSettings; 
}

export const DEFAULT_MATERIAL_ID = 'default-material-archvision'; 
export const DEFAULT_MATERIAL_NAME = 'ArchiVision Default';

export const DEFAULT_LAYER_ID = 'default-layer-0';
export const DEFAULT_LAYER_NAME = 'Default Layer';
