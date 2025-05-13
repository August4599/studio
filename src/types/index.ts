
export type PrimitiveType = 'cube' | 'cylinder' | 'plane' | 'text' | 'sphere' | 'cone' | 'torus' | 'polygon';

export interface MaterialProperties {
  id: string;
  name?: string; 
  color: string;
  roughness: number;
  metalness: number;
  map?: string; 
  normalMap?: string;
  roughnessMap?: string;
  metalnessMap?: string;
  aoMap?: string;
  emissive?: string; // Emissive color
  emissiveIntensity?: number;
  opacity?: number; // 0.0 (transparent) to 1.0 (opaque)
  transparent?: boolean; // Needs to be true for opacity < 1.0 to work
  ior?: number; // Index of Refraction (for transparency)
  displacementMap?: string;
  displacementScale?: number;
  displacementBias?: number;
  // Future: SSS, Clearcoat, Sheen etc.
}

export interface SceneObjectDimensions {
  width?: number; 
  height?: number; 
  depth?: number; 
  radius?: number; // For sphere, polygon (outer radius)
  radiusTop?: number; 
  radiusBottom?: number; 
  radialSegments?: number; 
  heightSegments?: number; 
  tube?: number; // For torus
  tubularSegments?: number; // For torus
  arc?: number; // For torus
  sides?: number; // For polygon
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
  position: [number, number, number];
  castShadow: boolean;
  shadowBias: number;
}
export interface PointLightSceneProps extends BaseLightProps {
  type: 'point';
  position: [number, number, number];
  distance?: number;
  decay?: number;
  castShadow?: boolean;
  shadowBias?: number;
}

export interface SpotLightSceneProps extends BaseLightProps {
  type: 'spot';
  position: [number, number, number];
  targetPosition?: [number, number, number]; // Or link to an object
  angle?: number; // radians
  penumbra?: number; // 0-1
  distance?: number;
  decay?: number;
  castShadow?: boolean;
  shadowBias?: number;
}

export interface AreaLightSceneProps extends BaseLightProps {
  type: 'area'; // Typically a RectAreaLight in Three.js
  position: [number, number, number];
  rotation?: [number, number, number]; // For orientation
  width?: number;
  height?: number;
  // RectAreaLight doesn't cast shadows by default in Three.js
}

export type SceneLight = DirectionalLightSceneProps | PointLightSceneProps | SpotLightSceneProps | AreaLightSceneProps;


export type ToolType = 
  | 'select' 
  | 'line' // Freehand / Polyline
  | 'rectangle' 
  | 'circle'
  | 'arc' 
  | 'polygon'
  | 'freehand'
  | 'pushpull' 
  | 'move' 
  | 'rotate' 
  | 'scale' 
  | 'offset' 
  | 'followme' // WIP, complex
  | 'tape' // Measure tool
  | 'protractor'
  | 'axes' // Change drawing axes
  | 'addText'
  | 'paint'
  | 'eraser'
  | 'orbit' // Explicit orbit tool, though usually default
  | 'pan'
  | 'zoom' // Various zoom tools: Zoom Extents, Zoom Window
  | 'zoomExtents'
  | 'addCube'
  | 'addCylinder'
  | 'addPlane'
  | 'addSphere'
  | 'addCone'
  | 'addTorus'
  | 'addPolygon';


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

export interface DrawingState {
  isActive: boolean;
  tool: 'rectangle' | 'line' | 'arc' | 'tape' | 'pushpull' | 'circle' | 'polygon' | 'freehand' | 'protractor' | null;
  startPoint: [number, number, number] | null;
  currentPoint?: [number, number, number] | null;
  measureDistance?: number | null; 
  pushPullFaceInfo?: PushPullFaceInfo | null;
  polygonSides?: number; // For polygon tool
}


export const AVAILABLE_TOOLS: { id: ToolType; label: string; icon?: React.ElementType }[] = [
  { id: 'select', label: 'Select' },
  { id: 'line', label: 'Line' }, 
  { id: 'rectangle', label: 'Rectangle' }, 
  { id: 'circle', label: 'Circle' },
  { id: 'arc', label: 'Arc' }, 
  { id: 'polygon', label: 'Polygon' },
  { id: 'freehand', label: 'Freehand' },
  { id: 'pushpull', label: 'Push/Pull' },
  { id: 'move', label: 'Move' },
  { id: 'rotate', label: 'Rotate' },
  { id: 'scale', label: 'Scale' },
  { id: 'offset', label: 'Offset' },
  { id: 'tape', label: 'Measure' },
  { id: 'protractor', label: 'Protractor' },
  { id: 'addText', label: '3D Text' },
  { id: 'paint', label: 'Paint Bucket' },
  { id: 'eraser', label: 'Eraser' },
  { id: 'pan', label: 'Pan' },
  { id: 'zoomExtents', label: 'Zoom Extents' },
  { id: 'addCube', label: 'Add Cube'},
  { id: 'addCylinder', label: 'Add Cylinder'},
  { id: 'addPlane', label: 'Add Plane'},
  { id: 'addSphere', label: 'Add Sphere'},
  { id: 'addCone', label: 'Add Cone'},
  { id: 'addTorus', label: 'Add Torus'},
];

export type AppMode = 'modelling' | 'rendering'; // 'modelling' now includes texturing

export interface SceneData {
  objects: SceneObject[];
  materials: MaterialProperties[];
  ambientLight: AmbientLightProps; // This could be one of the lights in a `lights: SceneLight[]` array.
  directionalLight: DirectionalLightSceneProps; // For simplicity, keep one primary directional light easily accessible.
  otherLights?: SceneLight[]; // For point, spot, area lights.
  selectedObjectId?: string | null;
  activeTool?: ToolType;
  activePaintMaterialId?: string | null;
  appMode: AppMode; 
  drawingState: DrawingState; 
}

export const DEFAULT_MATERIAL_ID = 'default-material';
export const DEFAULT_MATERIAL_NAME = 'Default Material';


// Project Management Types
export interface Project {
  id: string;
  name: string;
  lastModified: number; // timestamp
  sceneData: SceneData;
  thumbnail?: string; 
}

export interface ProjectSummary {
  id: string;
  name: string;
  lastModified: number;
  thumbnail?: string;
}
