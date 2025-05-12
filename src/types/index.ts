
export type PrimitiveType = 'cube' | 'cylinder' | 'plane' | 'text';

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
    depth?: number; // For cube, text (extrusion)
    radiusTop?: number; // For cylinder
    radiusBottom?: number; // For cylinder
    radialSegments?: number; // For cylinder
    heightSegments?: number; // For cylinder
    text?: string; // For text
    fontSize?: number; // For text
    // font?: string; // For text (path to font file or name) - Future
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
  | 'line' // Placeholder, will activate tool
  | 'rectangle' // Will be made functional for drawing
  | 'arc' // Placeholder, will activate tool
  | 'pushpull' // Placeholder
  | 'move' 
  | 'rotate' 
  | 'scale' 
  | 'offset' // Placeholder
  | 'tape' // Placeholder
  | 'addText'
  | 'paint'
  | 'eraser'
  | 'addCube'
  | 'addCylinder'
  | 'addPlane';

// Specific tool types for drawing actions if needed for state differentiation
// For now, 'rectangle' tool itself will manage its drawing state internally or via context.

export interface DrawingState {
  isActive: boolean;
  tool: 'rectangle' | 'line' | 'arc' | null;
  startPoint: [number, number, number] | null; // Using array for consistency with SceneObject
  currentPoint?: [number, number, number] | null; // For live preview
  // Add other tool-specific drawing properties here
}


export const AVAILABLE_TOOLS: { id: ToolType; label: string; icon?: React.ElementType }[] = [
  { id: 'select', label: 'Select' },
  { id: 'line', label: 'Line' }, // WIP removed
  { id: 'rectangle', label: 'Rectangle' }, // WIP removed
  { id: 'arc', label: 'Arc' }, // WIP removed
  { id: 'pushpull', label: 'Push/Pull' },
  { id: 'move', label: 'Move' },
  { id: 'rotate', label: 'Rotate' },
  { id: 'scale', label: 'Scale' },
  { id: 'offset', label: 'Offset' },
  { id: 'tape', label: 'Tape Measure' },
  { id: 'addText', label: '3D Text' },
  { id: 'paint', label: 'Paint Bucket' },
  { id: 'eraser', label: 'Eraser' },
  { id: 'addCube', label: 'Add Cube'},
  { id: 'addCylinder', label: 'Add Cylinder'},
  { id: 'addPlane', label: 'Add Plane'},
];

export type AppMode = 'modelling' | 'rendering';

export interface SceneData {
  objects: SceneObject[];
  materials: MaterialProperties[];
  ambientLight: AmbientLightProps;
  directionalLight: DirectionalLightProps;
  selectedObjectId?: string | null;
  activeTool?: ToolType;
  activePaintMaterialId?: string | null;
  appMode: AppMode;
  drawingState: DrawingState; // Added for managing drawing operations
}

export const DEFAULT_MATERIAL_ID = 'default-material';
export const DEFAULT_MATERIAL_NAME = 'Default Material';
