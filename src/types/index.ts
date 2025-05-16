
export type PrimitiveType = 'cube' | 'cylinder' | 'plane' | 'text' | 'sphere' | 'cone' | 'torus' | 'polygon' | 'cadPlan' | 'circle'; 

// Modifier Types - Conceptual Placeholders
export type ModifierType = 
  | 'bevel' | 'subdivision' | 'solidify' | 'array' | 'mirror' | 'lattice' | 'boolean' | 'displacement'
  | 'skin' | 'shell' | 'path_deform' | 'ffd' | 'cloth' | 'hair_fur' | 'scatter' | 'instance' | 'volume_to_mesh' | 'merge_by_distance';

// Material Types (Conceptual, inspired by V-Ray/D5/etc.)
export type AdvancedMaterialType = 
  | 'generic_pbr' // Default
  | 'glass_refractive'
  | 'water_liquid'
  | 'foliage_two_sided'
  | 'car_paint_clearcoat'
  | 'cloth_sheen'
  | 'leather_detailed'
  | 'metal_anisotropic'
  | 'plastic_sss_translucent'
  | 'wood_textured'
  | 'concrete_rough'
  | 'emissive_light_source'
  | 'velvet_fabric'
  | 'skin_sss_detailed'
  | 'hair_bsdf' // Advanced concept
  | 'toon_stylized'; // Advanced concept

// BRDF Types
export type BRDFModelType = 'ggx' | 'phong' | 'blinn_phong' | 'ward' | 'cook_torrance' | 'beckmann';

// UVW Mapping Types
export type UVWMappingType = 'uv_channel' | 'box' | 'planar' | 'cylindrical' | 'spherical' | 'triplanar' | 'world_space_box';
export type UVWProjectionAxis = 'x' | 'y' | 'z';


export interface MaterialProperties {
  id: string;
  name?: string; 
  materialType?: AdvancedMaterialType; 

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
  transmission?: number; // For glass thickness effect
  transmissionMap?: string; // Texture for transmission amount

  // Displacement / Height
  displacementMap?: string;
  displacementScale?: number;
  displacementBias?: number;
  tessellationLevel?: number; 
  
  // Advanced Surface - Clearcoat
  clearcoat?: number; 
  clearcoatMap?: string;
  clearcoatRoughness?: number; 
  clearcoatRoughnessMap?: string;
  clearcoatNormalMap?: string; 
  clearcoatIOR?: number; // WIP
  
  // Advanced Surface - Sheen
  sheen?: number; 
  sheenColor?: string; 
  sheenColorMap?: string;
  sheenRoughness?: number; 
  sheenRoughnessMap?: string;
  sheenTint?: string; // WIP

  // Subsurface Scattering (SSS)
  subsurfaceScattering?: number; 
  subsurfaceColor?: string; 
  subsurfaceColorMap?: string; // Texture for SSS color
  subsurfaceRadius?: [number, number, number]; 
  subsurfaceRadiusMap?: string; // Texture for SSS radius
  subsurfaceScale?: number; // WIP

  // Anisotropy
  anisotropy?: number; 
  anisotropyRotation?: number; 
  anisotropyMap?: string; 
  anisotropyRotationMap?: string; // Texture for rotation direction

  // UVW Mapping 
  uvwMappingType?: UVWMappingType; 
  uvTiling?: [number, number];
  uvOffset?: [number, number];
  uvRotation?: number; 
  uvChannel?: number; 
  uvRealWorldScale?: boolean; 
  uvProjectionAxis?: UVWProjectionAxis; 
  uvBoxProjectionBlend?: number; 
  uvFlip?: { u: boolean, v: boolean }; 

  twoSided?: boolean; 
  brdfType?: BRDFModelType; 
  translucency?: number; // For thin materials like paper, leaves
  translucencyColor?: string; 
  translucencyMap?: string; // Texture for translucency amount
  
  textureBaking?: { // WIP Placeholder
    bakeType?: 'diffuse' | 'normal' | 'ao';
    resolution?: number;
  };
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

export interface AppliedModifier { 
  id: string;
  type: ModifierType;
  enabled: boolean;
  properties: Record<string, any>; 
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
  modifiers?: AppliedModifier[]; 
  parentId?: string; 
  isGroup?: boolean; 
  isComponentDefinition?: boolean; 
  componentInstanceId?: string; 
  customAttributes?: Record<string, any>; 
}

export interface AmbientLightProps {
  color: string;
  intensity: number;
}

export type LightType = 
  | 'ambient' | 'directional' | 'point' | 'spot' | 'area' 
  | 'skylight' | 'photometric' | 'sphere' | 'disk' | 'quad' | 'cylinder_light' | 'mesh_light';

export interface BaseLightProps {
  id: string;
  name: string;
  type: LightType;
  color: string;
  intensity: number;
  visible?: boolean;
  castShadow?: boolean; 
  shadowBias?: number; 
  shadowRadius?: number; // Softer shadows
  shadowMapSize?: number; // Shadow map resolution
  volumetricContribution?: number; // How much it affects volumetric fog
  linkedObjects?: string[]; // WIP: Only illuminate these objects
  excludedObjects?: string[]; // WIP: Don't illuminate these objects
}
export interface DirectionalLightSceneProps extends BaseLightProps {
  type: 'directional';
  position: [number, number, number]; 
  targetPosition?: [number,number,number]; 
  sunAngle?: number; // For soft shadows from sun
  sunSize?: number; // Angular diameter for soft shadows
  atmosphereThickness?: number; // For sky models
}
export interface PointLightSceneProps extends BaseLightProps {
  type: 'point';
  position: [number, number, number];
  distance?: number; 
  decay?: number; 
  radius?: number; // Physical light radius (for soft shadows)
}

export interface SpotLightSceneProps extends BaseLightProps {
  type: 'spot';
  position: [number, number, number];
  targetPosition?: [number, number, number]; 
  angle?: number; 
  penumbra?: number; 
  distance?: number;
  decay?: number;
  radius?: number; // Physical light radius
  iesProfile?: string; // Path to IES file
  barnDoors?: { top: number, bottom: number, left: number, right: number }; // WIP
  aspectRatio?: number; // For non-circular spots WIP
}

export interface AreaLightSceneProps extends BaseLightProps {
  type: 'area' | 'sphere' | 'disk' | 'quad' | 'cylinder_light'; 
  position: [number, number, number];
  rotation?: [number, number, number]; 
  width?: number;  // For rect/quad/cylinder
  height?: number; // For rect/quad/cylinder
  radius?: number; // For sphere/disk/cylinder
  shape?: 'rectangle' | 'disk' | 'sphere' | 'cylinder'; 
  isPortal?: boolean; // For skylight portals
  texture?: string; // Texture for the light emission
  twoSided?: boolean; // Emits light from both sides
  spread?: number; // For rect/disk, similar to spotlight cone angle (0-1 for 0-180 deg)
}

export interface SkyLightSceneProps extends BaseLightProps { // Conceptually a Dome light
    type: 'skylight'; 
    hdriPath?: string; 
    hdriRotation?: number; 
    useSun?: boolean; // If the HDRI includes a sun, should it cast directional shadows
    skyModel?: PhysicalSkyModel; // If not using HDRI, use a procedural sky
}
export interface PhotometricLightSceneProps extends BaseLightProps { // IES Light
    type: 'photometric';
    position: [number,number,number];
    targetPosition?: [number,number,number];
    iesFilePath?: string;
    filterColor?: string; // Color filter applied to IES light
}
export interface MeshLightSceneProps extends BaseLightProps {
  type: 'mesh_light';
  meshObjectId?: string; // ID of the scene object to use as the light emitter
  texture?: string; // WIP: Texture to apply to the mesh light surface
  multiplyByColor?: boolean; // WIP: Whether the texture color multiplies the light color
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
  | 'walk';


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

export type RenderEngineType = 
  | 'cycles' | 'eevee' // Existing
  | 'path_traced_rt_concept' // D5-like concept
  | 'unreal_pathtracer_concept' // UE style
  | 'vray_concept' // V-Ray style
  | 'corona_concept' // Corona style
  | 'arnold_concept'; // Arnold style

export type RenderOutputType = 
  | 'png' | 'jpeg' // Existing
  | 'exr' | 'tiff' | 'tga' // More image formats
  | 'mp4' | 'mov' | 'avi'; // Video formats

export type RenderPassType = 
  | 'beauty' | 'z_depth' | 'normal' | 'ao' | 'object_id' | 'material_id' 
  | 'cryptomatte_object' | 'cryptomatte_material' | 'cryptomatte_asset'
  | 'reflection' | 'refraction' | 'diffuse_filter' | 'specular' | 'gi' | 'shadows' 
  | 'velocity' | 'world_position' | 'mist' | 'emission';

export interface RenderSettings {
  engine: RenderEngineType;
  resolutionPreset?: 'HD' | 'FullHD' | '2K_QHD' | '4K_UHD' | 'Custom'; 
  customWidth?: number; 
  customHeight?: number; 
  aspectRatioLock?: boolean;
  resolution: string; // Kept for simplicity, can be derived from preset/custom
  outputFormat: RenderOutputType; 
  
  // Format Specific Options
  pngBitDepth?: 8 | 16; 
  jpegQuality?: number; // 0-100
  exrDataType?: 'half' | 'float'; 
  exrCompression?: 'none' | 'zip' | 'piz' | 'rle'; 
  
  // Quality & Sampling
  samples?: number; 
  denoiser?: 'none' | 'optix' | 'oidn' | 'intel_openimage' | 'vray_default_concept' | 'corona_highquality_concept' | 'd5_default_concept'; 
  denoiserStrength?: number;
  timeLimit?: number; // in minutes
  noiseThreshold?: number; 
  adaptiveSampling?: boolean; 
  adaptiveMinSamples?: number; 
  adaptiveMaxSamples?: number; 
  
  // Lighting & Bounces
  giMode?: 'brute_force' | 'irradiance_cache' | 'light_cache' | 'path_tracing_gi'; 
  caustics?: boolean; 
  maxBounces?: { total: number, diffuse: number, glossy: number, transmission: number, volume: number }; 
  
  // Output Path & Naming
  outputPath?: string; 
  fileName?: string; 
  overwriteExisting?: boolean; 
  
  renderElements?: RenderPassType[]; 
  
  // Color Management
  colorManagement?: { 
    displayDevice: 'sRGB' | 'Rec.709' | 'ACEScg' | 'P3-DCI' | 'P3-Display'; 
    viewTransform: 'Standard' | 'Filmic' | 'Raw' | 'ACES' | 'Log'; 
    look?: 'None' | 'Medium Contrast' | 'High Contrast' | 'Custom LUT' | string; 
    exposure: number; 
    gamma: number; 
    lutFile?: string; // Path to .cube or .3dl LUT file
  }; 
  
  // Animation Settings
  animationSettings?: { 
    frameRange?: string; // e.g., "1-100, 150, 200-210"
    frameStep?: number;
    fps?: number; 
    videoCodec?: 'h264' | 'prores' | 'h265_hevc' | 'vp9' | 'dnxhr_concept' | 'av1_concept';
    videoContainer?: 'mp4' | 'mov' | 'mkv' | 'webm_concept';
    videoBitrate?: number; // kbps
    audioPath?: string;
    renderSequence?: boolean; // Render individual frames instead of video
    imageSequenceFormat?: 'png' | 'jpeg' | 'exr' | 'tiff' | 'tga';
  };
  
  // Performance & Advanced
  distributedRendering?: { 
    enabled: boolean; 
    renderNodes: string[]; // IPs or hostnames
    mode?: 'auto_discover' | 'manual_list' | 'broker_service_concept'; 
  }; 
  performance?: { 
    threads?: number | 'auto'; 
    useGpu?: boolean; 
    gpuDevices?: string[]; // IDs or names of GPUs to use
    bucketSize?: number; // For tile-based renderers
    progressiveRefinement?: boolean; // For engines like Cycles
  };
}

export interface SceneLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color?: string; 
  objectCount?: number; 
}

export const DEFAULT_LAYER_ID = 'default-layer-0';
export const DEFAULT_LAYER_NAME = 'Default Layer';


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

export type PhysicalSkyModel = 'none' | 'hosek_wilkie' | 'preetham' | 'd5_procedural_concept' | 'cie_clear' | 'cie_overcast';

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
      ozone?: number; 
      skyTint?: string;
      horizonHeight?: number;
      horizonBlur?: number;
  };
  groundPlane?: { 
    enabled: boolean;
    height: number;
    materialId?: string; 
    receiveShadows?: boolean;
    size?: number; 
    color?: string; 
    reflectivity?: number; 
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
      attenuationColor?: string; 
      lightContributionScale?: number;
  };
  atmosphere?: { 
      haze?: number; 
      ozone?: number; 
      skyTint?: string; 
      horizonBlur?: number; 
      density?: number; 
      scaleHeight?: number; 
  };
  weatherEffects?: { 
      rain?: { enabled: boolean; intensity: number; puddleAmount: number; rainStreaksOnGlass?: boolean; splashEffect?: boolean; speed?: number; };
      snow?: { enabled: boolean; accumulation: number; melting: number; snowflakes?: boolean; windInfluence?: number; particleSize?: number; };
      wind?: { enabled: boolean; speed: number; direction: number; affectFoliage?: boolean; affectParticles?: boolean; turbulence?: number; }; 
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

// Style Settings (Conceptual for StylesPanel)
export interface EdgeStyleSettings {
  showEdges: boolean;
  edgeColor: string;
  edgeWidth: number;
  showProfiles: boolean;
  profileColor: string;
  profileWidth: number;
  showBackEdges: boolean; // WIP
  backEdgeColor: string; // WIP
  showExtensions: boolean; // WIP
  extensionLength: number; // WIP
  showEndpoints: boolean; // WIP
  endpointStyle: 'dot' | 'slash'; // WIP
  depthCue: boolean;
  depthCueStrength: number; // WIP
  jitter: boolean;
  jitterStrength: number; // WIP
}

export type FaceStyleType = 'shaded' | 'shaded_with_textures' | 'wireframe' | 'hidden_line' | 'monochrome' | 'xray' | 'color_by_layer';

export interface FaceStyleSettings {
  style: FaceStyleType;
  frontColor: string; // For shaded/monochrome
  backColor: string; // For shaded/monochrome
  monochromeColor: string; // For monochrome style
  xrayOpacity: number; // For X-Ray style
  showTextures: boolean; // For 'shaded_with_textures'
}

export interface BackgroundStyleSettings {
  useSky: boolean;
  skyColor: string;
  useGround: boolean;
  groundColor: string;
  useHorizonGradient: boolean; // WIP
  horizonColor: string; // Top color for gradient or flat horizon
  useEnvironmentImage: boolean; // WIP - for modelling backdrop
  environmentImagePath?: string; // WIP
  backgroundColor: string; // If not sky/ground/image
}

export interface ModellingAidsSettings {
  displayGuidelines: boolean;
  guidelineColor: string; // WIP
  displaySectionFill: boolean;
  sectionFillColor: string; // WIP
  displaySectionLines: boolean;
  sectionLineColor: string; // WIP
  sectionLineWidth: number; // WIP
  displayModelAxes: boolean;
  axesOriginColor: string; // WIP
}

export interface StyleSettings {
  edgeSettings: EdgeStyleSettings;
  faceSettings: FaceStyleSettings;
  backgroundSettings: BackgroundStyleSettings;
  modellingAidsSettings: ModellingAidsSettings;
}

// Camera Specific Types
export type CameraType = 'standard' | 'orthographic' | 'physical_concept' | 'panoramic_vr_concept';
export interface CameraSettings {
  type: CameraType;
  fov: number; // For perspective/standard
  orthoScale?: number; // For orthographic
  nearClip: number;
  farClip: number;
  sensorSize?: [number, number]; // width, height in mm (for Physical Camera)
  focalLength?: number; // mm (for Physical Camera, or derived from FOV)
  fStop?: number; // (for Physical Camera - DoF)
  shutterSpeed?: number; // 1/seconds (for Physical Camera - Motion Blur)
  iso?: number; // (for Physical Camera - Sensitivity)
  whiteBalance?: number; // Kelvin (for Physical Camera)
  focusDistance?: number; // For DoF
  apertureBlades?: number; // For bokeh shape (Physical Cam WIP)
  apertureRotation?: number; // For bokeh shape (Physical Cam WIP)
  motionBlur?: { // WIP
    enabled: boolean;
    shutterAngle?: number; // Degrees, alternative to shutter speed
    samples?: number;
  };
  renderRegion?: { // WIP
    enabled: boolean;
    minX: number; minY: number; // 0-1 range
    maxX: number; maxY: number; // 0-1 range
  };
}

// Animation Types
export interface Keyframe {
  time: number; // Frame number or seconds
  value: any; // Can be number, vector, color, boolean etc.
  interpolation?: 'linear' | 'bezier' | 'step'; // WIP
  handles?: { in: [number, number], out: [number, number] }; // Bezier handles WIP
}
export interface AnimationTrack {
  id: string;
  targetId: string; // e.g., objectId, lightId, materialId, cameraProperty
  propertyName: string; // e.g., 'position.x', 'material.roughness', 'camera.fov'
  keyframes: Keyframe[];
  trackType: 'object_transform' | 'object_property' | 'material_property' | 'light_property' | 'camera_property';
}
export interface AnimationData {
  duration: number; // Total frames or seconds
  fps: number;
  tracks: AnimationTrack[];
}

// Scene Data Update
export interface SceneData {
  // ... (keep existing properties)
  cameraSettings?: CameraSettings; // Store current main camera settings
  savedCameras?: Record<string, CameraSettings>; // For multiple cameras
  animationData?: AnimationData; // Scene level animation
}
