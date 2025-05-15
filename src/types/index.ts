
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
  // Future V-Ray/D5 like specific props (as placeholders)
  materialType?: 'generic' | 'glass' | 'foliage' | 'car_paint' | 'water'; // Conceptual
  twoSided?: boolean; // For foliage, thin geometry
}

export interface CadPlanLine {
  start: [number, number]; // [x, y] in 2D CAD space (becomes [x, z] in 3D scene)
  end: [number, number];   // [x, y] in 2D CAD space
  // layer?: string; // Optional: CAD layer name
  // color?: string; // Optional: Original CAD color
}

export interface CadPlanData {
  lines: CadPlanLine[];
  // entities?: DxfEntity[]; // Store raw entities for potential future advanced editing
  // layers?: string[]; // List of layers found in the CAD file
}

export interface SceneObjectDimensions {
  width?: number; // X-axis for cube, plane
  height?: number; // Y-axis for cube, cylinder, cone; Z-axis for plane (when flat on XZ)
  depth?: number; // Z-axis for cube
  radius?: number; // Sphere, cone (base), torus (major), polygon, circle
  radiusTop?: number; // Cylinder
  radiusBottom?: number; // Cylinder
  radialSegments?: number; // Cylinder, sphere, cone, torus, polygon, circle
  heightSegments?: number; // Cylinder (body), sphere
  tube?: number; // Torus (minor radius)
  tubularSegments?: number; // Torus
  arc?: number; // Torus (angle, for partial torus)
  sides?: number; // Polygon, Circle (for CircleGeometry segments)
  text?: string; // For 3D text
  fontSize?: number; // For 3D text
}

export interface SceneObject {
  id:string;
  type: PrimitiveType;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number]; // Euler angles in radians
  scale: [number, number, number];
  dimensions: SceneObjectDimensions; 
  materialId: string; // ID of a MaterialProperties object
  visible?: boolean; 
  planData?: CadPlanData; // For 'cadPlan' type
  locked?: boolean; // WIP placeholder
  layerId?: string; // WIP placeholder for layer/tag assignment
  modifiers?: any[]; // WIP placeholder for modifier stack
}

export interface AmbientLightProps {
  color: string;
  intensity: number;
}

export type LightType = 'ambient' | 'directional' | 'point' | 'spot' | 'area';

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
  position: [number, number, number]; // Typically direction, but often set as position for helpers
  castShadow: boolean;
  shadowBias: number;
  // WIP: Sun specific (angle, size for soft shadows)
  sunAngle?: number; 
  sunSize?: number;
}
export interface PointLightSceneProps extends BaseLightProps {
  type: 'point';
  position: [number, number, number];
  distance?: number;
  decay?: number;
  castShadow?: boolean;
  shadowBias?: number;
  // WIP: Radius for area-like point light / soft shadows
  radius?: number; 
}

export interface SpotLightSceneProps extends BaseLightProps {
  type: 'spot';
  position: [number, number, number];
  targetPosition?: [number, number, number]; // Or target object ID
  angle?: number; // Cone angle in radians
  penumbra?: number; // Softness of cone edge (0-1)
  distance?: number;
  decay?: number;
  castShadow?: boolean;
  shadowBias?: number;
  // WIP: IES Profile path
  iesProfile?: string; 
}

export interface AreaLightSceneProps extends BaseLightProps {
  type: 'area'; // Rectangle area light
  position: [number, number, number];
  rotation?: [number, number, number]; // To orient the rectangle
  width?: number;
  height?: number;
  // WIP: Shape (Rectangle, Disk, Sphere, Cylinder), Visible in render, two-sided
  shape?: 'rectangle' | 'disk';
  isPortal?: boolean; // For portals in interior rendering
}

export type SceneLight = DirectionalLightSceneProps | PointLightSceneProps | SpotLightSceneProps | AreaLightSceneProps;


export type ToolType = 
  | 'select' 
  | 'line' 
  | 'rectangle' 
  | 'rotatedRectangle' // WIP
  | 'circle'
  | 'arc' // Could be a parent for 2-Point, 3-Point, Pie
  | 'arc2Point' // WIP
  | 'arc3Point' // WIP
  | 'pie' // WIP
  | 'polygon'
  | 'freehand'
  | 'pushpull' 
  | 'move' 
  | 'rotate' 
  | 'scale' 
  | 'offset' 
  | 'followme' // WIP
  | 'intersectFaces' // WIP
  | 'outerShell' // WIP
  | 'tape' 
  | 'protractor' // WIP
  | 'dimension' // WIP
  | 'axes' // WIP
  | 'sectionPlane' // WIP
  | 'addText' // 3D Text Tool
  | 'paint'
  | 'eraser'
  | 'orbit' // Typically handled by OrbitControls, but can be a tool state
  | 'pan'
  | 'zoom' 
  | 'zoomExtents'
  // Primitive adding tools (might be deprecated if using a "Create" menu/panel)
  | 'addCube'
  | 'addCylinder'
  | 'addPlane'
  | 'addSphere'
  | 'addCone'
  | 'addTorus'
  | 'addPolygonShape' // Differentiates from polygon drawing tool
  | 'addCircleShape';


export interface PushPullFaceInfo {
  objectId: string;
  initialMeshWorldPosition: [number, number, number];
  initialLocalIntersectPoint: [number,number,number];
  initialWorldIntersectionPoint: [number, number, number]; 
  localFaceNormal: [number,number,number]; // Normal of the face in object's local space
  worldFaceNormal: [number,number,number]; // Normal of the face in world space
  originalDimensions: SceneObjectDimensions;
  originalPosition: [number, number, number];
  originalRotation: [number, number, number]; // Euler angles in radians
  originalType: PrimitiveType;
}

export type MeasurementUnit = 'units' | 'm' | 'cm' | 'mm' | 'ft' | 'in';

export interface DrawingState {
  isActive: boolean;
  tool: ToolType | null; // Updated to use ToolType
  startPoint: [number, number, number] | null;
  currentPoint?: [number, number, number] | null;
  measureDistance?: number | null; // For tape measure tool
  pushPullFaceInfo?: PushPullFaceInfo | null;
  polygonSides?: number; 
  // Other tool-specific states can be added here
  // e.g., for arc tool: centerPoint, secondPoint, etc.
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

export type ViewPreset = 'top' | 'bottom' | 'front' | 'back' | 'left' | 'right' | 'perspective';

export type RenderEngineType = 'cycles' | 'eevee' | 'path_traced_rt'; // Added path_traced_rt for D5-like placeholder

export interface RenderSettings {
  engine: RenderEngineType;
  resolution: string; // e.g., "1920x1080"
  outputFormat: 'png' | 'jpeg' | 'exr'; // Added EXR
  samples: number; // For ray/path tracing engines
  denoiser?: 'none' | 'optix' | 'oidn' | 'intel_gauss'; // WIP
  timeLimit?: number; // In minutes, WIP
  // WIP Placeholders
  giMode?: 'brute_force' | 'irradiance_cache' | 'light_cache'; // V-Ray like
  caustics?: boolean;
  renderElements?: string[]; // e.g., ['ZDepth', 'Normals', 'AO']
  outputPath?: string;
  colorManagement?: { displayDevice: string, viewTransform: string, look: string, exposure: number, gamma: number };
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
  cameraFov?: number; // For perspective camera
  worldBackgroundColor?: string; // For rendering mode background
  renderSettings?: RenderSettings;
  // WIP Placeholders for scene-level settings
  layers?: { id: string, name: string, visible: boolean, locked: boolean }[]; // Tags
  savedViews?: { id: string, name: string, cameraState: any }[]; // Scenes
  activeLayerId?: string;
  // Environment settings (for rendering)
  environment?: {
    hdriPath?: string;
    hdriIntensity?: number;
    hdriRotation?: number;
    usePhysicalSky?: boolean;
    physicalSkySettings?: { turbidity: number, sunPositionMode: 'manual' | 'datetime', azimuth: number, altitude: number, intensity: number };
    fog?: { enabled: boolean, color: string, density: number, near: number, far: number };
  };
}

export const DEFAULT_MATERIAL_ID = 'default-material';
export const DEFAULT_MATERIAL_NAME = 'ArchiVision Default';
