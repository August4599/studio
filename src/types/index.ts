
export type PrimitiveType = 'cube' | 'cylinder' | 'plane';

export interface MaterialProperties {
  id: string;
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
  id: string;
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

export interface SceneData {
  objects: SceneObject[];
  materials: MaterialProperties[];
  ambientLight: AmbientLightProps;
  directionalLight: DirectionalLightProps;
  selectedObjectId?: string | null;
}

export const DEFAULT_MATERIAL_ID = 'default-material';
