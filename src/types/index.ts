
export type PrimitiveType = 'cube' | 'cylinder' | 'plane';

export interface MaterialProperties {
  id: string;
  name?: string; // Optional name for material
  color: string;
  roughness: number;
  metalness: number;
  map?: string; // URL or path to texture
  normalMap?: string;
  roughnessMap?: string;
  metalnessMap?: string;
  aoMap?: string;
  // Add other PBR properties as needed
}

export interface SceneObject {
  id:string;
  type: PrimitiveType;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  dimensions: {
    width?: number; // For cube, plane
    height?: number; // For cube, cylinder
    depth?: number; // For cube
    radiusTop?: number; // For cylinder
    radiusBottom?: number; // For cylinder
    radialSegments?: number; // For cylinder
    heightSegments?: number; // For cylinder
  };
  materialId: string;
}

export interface AmbientLightProps {
  color: string;
  intensity: number;
}

export interface DirectionalLightProps {
  color: string;
  intensity: number;
  position: [number, number, number];
  castShadow: boolean;
  shadowBias: number;
}

export type ToolType = 
  | 'select' 
  | 'line' 
  | 'rectangle' 
  | 'circle' 
  | 'pushpull' 
  | 'move' 
  | 'rotate' 
  | 'scale' 
  | 'eraser'
  | 'addCube' // Added for a simple add primitive tool
  | 'arc'
  | 'polygon'
  | 'offset'
  | 'tape'
  | 'text'
  | 'paint'
  | 'orbit'
  | 'pan'
  | 'zoom'; 

export const AVAILABLE_TOOLS: { id: ToolType; label: string; icon?: React.ElementType }[] = [
  { id: 'select', label: 'Select' },
  // { id: 'line', label: 'Line' }, // Placeholder tools, will be re-added with actual functionality
  // { id: 'rectangle', label: 'Rectangle' },
  // { id: 'circle', label: 'Circle' },
  // { id: 'pushpull', label: 'Push/Pull' },
  { id: 'move', label: 'Move' },
  { id: 'rotate', label: 'Rotate' },
  { id: 'scale', label: 'Scale' },
  // { id: 'eraser', label: 'Eraser' },
  { id: 'addCube', label: 'Add Cube'},
];

export type AppMode = 'modelling' | 'texturing' | 'rendering';

export interface SceneData {
  objects: SceneObject[];
  materials: MaterialProperties[];
  ambientLight: AmbientLightProps;
  directionalLight: DirectionalLightProps;
  selectedObjectId?: string | null;
  activeTool?: ToolType;
  appMode?: AppMode; // Added appMode
}

export const DEFAULT_MATERIAL_ID = 'default-material';
export const DEFAULT_MATERIAL_NAME = 'Default Material';
