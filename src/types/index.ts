

export type PrimitiveType = 'cube' | 'cylinder' | 'plane' | 'text' | 'sphere' | 'cone' | 'torus' | 'polygon' | 'cadPlan' | 'circle'; 

export interface MaterialProperties {
  id: string;
  name?: string; 
  color: string;
  roughness: number;
  metalness: number;
  map?: string; 
  normalMap?: string;
  normalScale?: [number, number]; 
  roughnessMap?: string;
  metalnessMap?: string;
  aoMap?: string;
  emissive?: string; 
  emissiveIntensity?: number;
  opacity?: number; 
  transparent?: boolean; 
  alphaMap?: string; 
  ior?: number; 
  displacementMap?: string;
  displacementScale?: number;
  displacementBias?: number;
  clearcoat?: number; 
  clearcoatRoughness?: number; 
  clearcoatNormalMap?: string; 
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
  targetPosition?: [number, number, number]; 
  angle?: number; 
  penumbra?: number; 
  distance?: number;
  decay?: number;
  castShadow?: boolean;
  shadowBias?: number;
}

export interface AreaLightSceneProps extends BaseLightProps {
  type: 'area'; 
  position: [number, number, number];
  rotation?: [number, number, number]; 
  width?: number;
  height?: number;
}

export type SceneLight = DirectionalLightSceneProps | PointLightSceneProps | SpotLightSceneProps | AreaLightSceneProps;


export type ToolType = 
  | 'select' 
  | 'line' 
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
  | 'followme' 
  | 'tape' 
  | 'protractor'
  | 'axes' 
  | 'addText'
  | 'paint'
  | 'eraser'
  | 'orbit' 
  | 'pan'
  | 'zoom' 
  | 'zoomExtents'
  | 'addCube'
  | 'addCylinder'
  | 'addPlane'
  | 'addSphere'
  | 'addCone'
  | 'addTorus'
  | 'addPolygon'
  | 'addCircle'; 


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
  polygonSides?: number; 
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

export type AppMode = 'modelling' | 'rendering'; 

export type ViewPreset = 'top' | 'bottom' | 'front' | 'back' | 'left' | 'right' | 'perspective';

export interface RenderSettings {
  engine: 'cycles' | 'eevee';
  resolution: string; 
  outputFormat: 'png' | 'jpeg';
  samples: number;
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
  requestedViewPreset?: ViewPreset | null; 
  zoomExtentsTrigger?: { timestamp: number; targetObjectId?: string }; 
  cameraFov?: number; 
  worldBackgroundColor?: string;
  renderSettings?: RenderSettings;
}

export const DEFAULT_MATERIAL_ID = 'default-material';
export const DEFAULT_MATERIAL_NAME = 'ArchiVision Default';
