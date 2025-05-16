
export type PrimitiveType = 'cube' | 'cylinder' | 'plane' | 'text' | 'sphere' | 'cone' | 'torus' | 'polygon' | 'cadPlan' | 'circle'; 

// Modifier Types - Conceptual Placeholders
export type ModifierType = 
  | 'bevel' | 'subdivision' | 'solidify' | 'array' | 'mirror' | 'lattice' | 'boolean' | 'displacement'
  | 'skin' | 'shell' | 'path_deform' | 'ffd' | 'cloth' | 'hair_fur' | 'scatter' | 'instance' | 'volume_to_mesh' | 'merge_by_distance'
  | 'noise_modifier' | 'smooth_modifier' | 'uvw_map_modifier' | 'edit_poly_modifier' | 'curve_modifier' | 'shrinkwrap_modifier';

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
  clearcoatIOR?: number; 
  
  // Advanced Surface - Sheen
  sheen?: number; 
  sheenColor?: string; 
  sheenColorMap?: string;
  sheenRoughness?: number; 
  sheenRoughnessMap?: string;
  sheenTint?: string; 

  // Subsurface Scattering (SSS)
  subsurfaceScattering?: number; 
  subsurfaceColor?: string; 
  subsurfaceColorMap?: string; 
  subsurfaceRadius?: [number, number, number]; 
  subsurfaceRadiusMap?: string; 
  subsurfaceScale?: number; 

  // Anisotropy
  anisotropy?: number; 
  anisotropyRotation?: number; 
  anisotropyMap?: string; 
  anisotropyRotationMap?: string; 

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
  translucency?: number; 
  translucencyColor?: string; 
  translucencyMap?: string; 
  
  textureBaking?: { 
    bakeType?: 'diffuse' | 'normal' | 'ao' | 'complete_concept';
    resolution?: number;
    padding?: number; 
    targetUvChannel?: number; 
  };
}

export interface CadPlanLine {
  start: [number, number]; 
  end: [number, number];   
}

export interface CadPlanData {
  lines: CadPlanLine[];
  // Future: layers, colors, blocks, text entities
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
  name: string; // User-given name for this instance of the modifier
  enabled: boolean;
  properties: Record<string, any>; 
  showInViewport?: boolean; 
  applyOnRender?: boolean; 
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
  shadowRadius?: number; 
  shadowMapSize?: number; 
  volumetricContribution?: number; 
  linkedObjects?: string[]; 
  excludedObjects?: string[]; 
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
  radius?: number; 
}

export interface SpotLightSceneProps extends BaseLightProps {
  type: 'spot';
  position: [number, number, number];
  targetPosition?: [number, number, number]; 
  angle?: number; 
  penumbra?: number; 
  distance?: number;
  decay?: number;
  radius?: number; 
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

export type PhysicalSkyModel = 'none' | 'hosek_wilkie' | 'preetham' | 'd5_procedural_concept' | 'cie_clear' | 'cie_overcast';

export interface SkyLightSceneProps extends BaseLightProps { 
    type: 'skylight'; 
    hdriPath?: string; 
    hdriRotation?: number; 
    useSun?: boolean; 
    skyModel?: PhysicalSkyModel; 
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
  meshObjectId?: string; 
  texture?: string; 
  multiplyByColor?: boolean; 
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
  | 'cycles' | 'eevee' 
  | 'path_traced_rt_concept' 
  | 'unreal_pathtracer_concept' 
  | 'vray_concept' 
  | 'corona_concept' 
  | 'arnold_concept'
  | 'd5_render_concept'; 

export type RenderOutputType = 
  | 'png' | 'jpeg' 
  | 'exr' | 'tiff' | 'tga' 
  | 'mp4' | 'mov' | 'avi'; 

export type RenderPassType = 
  | 'beauty' | 'z_depth' | 'normal' | 'ao' | 'object_id' | 'material_id' 
  | 'cryptomatte_object' | 'cryptomatte_material' | 'cryptomatte_asset'
  | 'reflection' | 'refraction' | 'diffuse_filter' | 'specular' | 'gi' | 'shadows' 
  | 'velocity' | 'world_position' | 'mist' | 'emission'
  | 'denoised_beauty' | 'lighting' | 'subsurface' | 'volume'; 

export interface RenderSettings {
  engine: RenderEngineType;
  resolutionPreset?: 'HD' | 'FullHD' | '2K_QHD' | '4K_UHD' | 'Custom'; 
  customWidth?: number; 
  customHeight?: number; 
  aspectRatioLock?: boolean;
  resolution: string; 
  outputFormat: RenderOutputType; 
  
  pngBitDepth?: 8 | 16; 
  jpegQuality?: number; 
  exrDataType?: 'half' | 'float'; 
  exrCompression?: 'none' | 'zip' | 'piz' | 'rle'; 
  
  samples?: number; 
  denoiser?: 'none' | 'optix' | 'oidn' | 'intel_openimage' | 'vray_default_concept' | 'corona_highquality_concept' | 'd5_default_concept'; 
  denoiserStrength?: number;
  timeLimit?: number; 
  noiseThreshold?: number; 
  adaptiveSampling?: boolean; 
  adaptiveMinSamples?: number; 
  adaptiveMaxSamples?: number; 
  
  giMode?: 'brute_force' | 'irradiance_cache' | 'light_cache' | 'path_tracing_gi'; 
  caustics?: boolean; 
  maxBounces?: { total: number, diffuse: number, glossy: number, transmission: number, volume: number }; 
  
  outputPath?: string; 
  fileName?: string; 
  overwriteExisting?: boolean; 
  
  renderElements?: RenderPassType[]; 
  
  colorManagement?: { 
    displayDevice: 'sRGB' | 'Rec.709' | 'ACEScg' | 'P3-DCI' | 'P3-Display'; 
    viewTransform: 'Standard' | 'Filmic' | 'Raw' | 'ACES' | 'Log'; 
    look?: 'None' | 'Medium Contrast' | 'High Contrast' | 'Custom LUT' | string; 
    exposure: number; 
    gamma: number; 
    lutFile?: string; 
  }; 
  
  animationSettings?: { 
    frameRange?: string; 
    frameStep?: number;
    fps?: number; 
    videoCodec?: 'h264' | 'prores' | 'h265_hevc' | 'vp9' | 'dnxhr_concept' | 'av1_concept';
    videoContainer?: 'mp4' | 'mov' | 'mkv' | 'webm_concept';
    videoBitrate?: number; 
    audioPath?: string;
    renderSequence?: boolean; 
    imageSequenceFormat?: 'png' | 'jpeg' | 'exr' | 'tiff' | 'tga';
  };
  
  distributedRendering?: { 
    enabled: boolean; 
    renderNodes: string[]; 
    mode?: 'auto_discover' | 'manual_list' | 'broker_service_concept'; 
  }; 
  performance?: { 
    threads?: number | 'auto'; 
    useGpu?: boolean; 
    gpuDevices?: string[]; 
    bucketSize?: number; 
    progressiveRefinement?: boolean; 
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
  activeStyleOverrides?: Partial<StyleSettings>; 
  environmentOverrides?: Partial<EnvironmentSettings>; 
  postProcessingOverrides?: Partial<PostProcessingSettings>;
}


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

export type CameraType = 'standard' | 'orthographic' | 'physical_concept' | 'panoramic_vr_concept';

export interface CameraSettings {
  type: CameraType;
  fov: number; 
  orthoScale?: number; 
  nearClip: number;
  farClip: number;
  sensorSize?: [number, number]; 
  focalLength?: number; 
  fStop?: number; 
  shutterSpeed?: number; 
  iso?: number; 
  whiteBalance?: number; 
  focusDistance?: number; 
  apertureBlades?: number; 
  apertureRotation?: number; 
  motionBlur?: { 
    enabled: boolean;
    shutterAngle?: number; 
    samples?: number;
  };
  renderRegion?: { 
    enabled: boolean;
    minX: number; minY: number; 
    maxX: number; maxY: number; 
  };
  lensDistortion?: { enabled: boolean; k1?: number; k2?: number; k3?: number; p1?: number; p2?: number; };
  clippingPlanes?: { near?: number; far?: number; }; 
}

export interface Keyframe {
  time: number; 
  value: any; 
  interpolation?: 'linear' | 'bezier' | 'step'; 
  handles?: { in: [number, number], out: [number, number] }; 
}
export interface AnimationTrack {
  id: string;
  targetId: string; 
  propertyName: string; 
  keyframes: Keyframe[];
  trackType: 'object_transform' | 'object_property' | 'material_property' | 'light_property' | 'camera_property';
}
export interface AnimationData {
  duration: number; 
  fps: number;
  tracks: AnimationTrack[];
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
  cameraSettings?: CameraSettings; 
  savedCameras?: Record<string, CameraSettings>; 
  animationData?: AnimationData;
  postProcessingSettings?: PostProcessingSettings; 
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
  showBackEdges: boolean; 
  backEdgeColor: string; 
  showExtensions: boolean; 
  extensionLength: number; 
  showEndpoints: boolean; 
  endpointStyle: 'dot' | 'slash'; 
  depthCue: boolean;
  depthCueStrength: number; 
  jitter: boolean;
  jitterStrength: number; 
}

export type FaceStyleType = 'shaded' | 'shaded_with_textures' | 'wireframe' | 'hidden_line' | 'monochrome' | 'xray' | 'color_by_layer';

export interface FaceStyleSettings {
  style: FaceStyleType;
  frontColor: string; 
  backColor: string; 
  monochromeColor: string; 
  xrayOpacity: number; 
  showTextures: boolean; 
}

export interface BackgroundStyleSettings {
  useSky: boolean;
  skyColor: string;
  useGround: boolean;
  groundColor: string;
  useHorizonGradient: boolean; 
  horizonColor: string; 
  useEnvironmentImage: boolean; 
  environmentImagePath?: string; 
  backgroundColor: string; 
}

export interface ModellingAidsSettings {
  displayGuidelines: boolean;
  guidelineColor: string; 
  displaySectionFill: boolean;
  sectionFillColor: string; 
  displaySectionLines: boolean;
  sectionLineColor: string; 
  sectionLineWidth: number; 
  displayModelAxes: boolean;
  axesOriginColor: string; 
}

export interface StyleSettings {
  edgeSettings: EdgeStyleSettings;
  faceSettings: FaceStyleSettings;
  backgroundSettings: BackgroundStyleSettings;
  modellingAidsSettings: ModellingAidsSettings;
}

// Placeholder Post Processing Effect Types
export interface BloomEffectSettings {
    enabled: boolean;
    intensity: number;
    threshold: number;
    radius: number;
    blendMode?: 'add' | 'screen'; 
}
export interface ColorGradingSettings {
    enabled: boolean;
    lutPath?: string;
    exposure: number;
    contrast: number;
    saturation: number;
    temperature: number; 
    tint: number; 
    colorWheels?: { // WIP
        shadows: { r: number, g: number, b: number, offset: number };
        midtones: { r: number, g: number, b: number, offset: number };
        highlights: { r: number, g: number, b: number, offset: number };
    };
}

export interface PostProcessingSettings {
    bloom?: BloomEffectSettings;
    vignette?: { enabled: boolean, offset: number, darkness: number, color?: string, roundness?: number, feather?: number };
    chromaticAberration?: { enabled: boolean, intensity: number, radialModulation?: boolean, startOffset?: number };
    colorGrading?: ColorGradingSettings;
    lensDirt?: { enabled: boolean, texturePath?: string, intensity: number, scale?: number };
    motionBlur?: { enabled: boolean, samples: number, intensity: number }; 
    sharpen?: { enabled: boolean, intensity: number, radius?: number, technique?: 'unsharp_mask' | 'simple_laplacian' };
    toneMapping?: { enabled: boolean, operator: 'none' | 'reinhard' | 'aces_film' | 'filmic_hejl' | 'uncharted2', exposureBias?: number };
    filmGrain?: { enabled: boolean, intensity: number, size?: number, animated?: boolean };
    lensFlares?: { enabled: boolean, type?: 'anamorphic' | 'ghosts', intensity?: number, threshold?: number, count?: number, scale?: number, color?: string, texturePath?: string };
    depthOfField_Post?: { enabled: boolean, focusDistance: number, aperture: number, focalLength: number, bokehShape?: 'circle' | 'hexagon' | 'custom_texture', bokehScale?: number };
}

    
