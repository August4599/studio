
import DxfParser, { type Vertex } from 'dxf-parser';
import type { SceneObject, PrimitiveType, SceneObjectDimensions } from '@/types';
import { DEFAULT_MATERIAL_ID } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import * as THREE from 'three';

interface DxfEntity {
  type: string;
  vertices?: Vertex[];
  layer?: string;
  colorNumber?: number;
  extrusionDirection?: Vertex;
  // Add other properties as needed by dxf-parser types
  [key: string]: any;
}

// Helper to get bounding box of vertices (assuming Y is up for 2D CAD, so we use X and Z)
function getBounds(vertices: Vertex[]): { min: THREE.Vector2; max: THREE.Vector2 } {
  const min = new THREE.Vector2(Infinity, Infinity);
  const max = new THREE.Vector2(-Infinity, -Infinity);
  vertices.forEach(v => {
    min.x = Math.min(min.x, v.x);
    min.y = Math.min(min.y, v.y); // DXF Y corresponds to scene Z
    max.x = Math.max(max.x, v.x);
    max.y = Math.max(max.y, v.y); // DXF Y corresponds to scene Z
  });
  return { min, max };
}

export function parseDxfToSceneObjects(dxfString: string): Partial<SceneObject>[] {
  const parser = new DxfParser();
  try {
    const dxf = parser.parseSync(dxfString);
    if (!dxf || !dxf.entities) {
      console.error('Failed to parse DXF or no entities found.');
      return [];
    }

    const sceneObjects: Partial<SceneObject>[] = [];
    let objectCount = 0;

    dxf.entities.forEach((entity: DxfEntity) => {
      objectCount++;
      const baseName = `${entity.type.charAt(0).toUpperCase() + entity.type.slice(1).toLowerCase()}_${objectCount}`;
      const defaultPosition: [number, number, number] = [0, 0, 0];
      const defaultRotation: [number, number, number] = [0, 0, 0];
      const defaultScale: [number, number, number] = [1, 1, 1];
      let defaultDimensions: SceneObjectDimensions = {};
      let primitiveType: PrimitiveType | null = null;

      if (entity.type === 'LINE' && entity.vertices && entity.vertices.length >= 2) {
        primitiveType = 'cube'; // Represent lines as thin cubes
        const start = entity.vertices[0];
        const end = entity.vertices[1];
        const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        
        defaultDimensions = { width: length, height: 0.05, depth: 0.05 }; // Length along X, thin Y and Z
        defaultPosition[0] = (start.x + end.x) / 2;
        defaultPosition[1] = 0.025; // Place it slightly above ground
        defaultPosition[2] = (start.y + end.y) / 2; // DXF Y to Scene Z

        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        defaultRotation[1] = -angle; // Rotate around scene Y axis

      } else if (entity.type === 'LWPOLYLINE' && entity.vertices && entity.vertices.length > 0) {
        const isClosed = entity.flags === 1 || (entity.vertices.length > 2 && entity.vertices[0].x === entity.vertices[entity.vertices.length - 1].x && entity.vertices[0].y === entity.vertices[entity.vertices.length - 1].y);
        if (isClosed) {
          primitiveType = 'plane';
          const bounds = getBounds(entity.vertices);
          const width = bounds.max.x - bounds.min.x;
          const depth = bounds.max.y - bounds.min.y; // DXF Y is scene Z
          
          defaultDimensions = { width: Math.max(0.01, width), height: Math.max(0.01, depth) }; // Plane's height is depth in XZ
          defaultPosition[0] = (bounds.min.x + bounds.max.x) / 2;
          defaultPosition[1] = 0; // On the ground
          defaultPosition[2] = (bounds.min.y + bounds.max.y) / 2;
          defaultRotation[0] = -Math.PI / 2; // Rotate to lie on XZ plane
        } else {
          // Treat open polylines as a series of lines
          for (let i = 0; i < entity.vertices.length - 1; i++) {
            const start = entity.vertices[i];
            const end = entity.vertices[i+1];
            const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
            if (length < 0.001) continue;

            sceneObjects.push({
              type: 'cube',
              name: `${baseName}_seg${i}`,
              position: [(start.x + end.x) / 2, 0.025, (start.y + end.y) / 2],
              rotation: [0, -Math.atan2(end.y - start.y, end.x - start.x), 0],
              scale: [1,1,1],
              dimensions: { width: length, height: 0.05, depth: 0.05 },
              materialId: DEFAULT_MATERIAL_ID,
            });
          }
          primitiveType = null; // Already handled
        }
      } else if (entity.type === 'CIRCLE' && entity.center && entity.radius) {
        primitiveType = 'plane'; // Represent circles as flat planes (using CircleGeometry in three-utils)
        defaultDimensions = { 
            width: entity.radius * 2, // Plane width = diameter
            height: entity.radius * 2, // Plane height = diameter
            radialSegments: 32 // Make it look like a circle
        };
        defaultPosition[0] = entity.center.x;
        defaultPosition[1] = 0; // On the ground
        defaultPosition[2] = entity.center.y; // DXF Y to Scene Z
        defaultRotation[0] = -Math.PI / 2; // Rotate to lie on XZ plane
      }
      // TODO: Add ARC, TEXT, etc. support with similar logic

      if (primitiveType) {
        sceneObjects.push({
          id: uuidv4(),
          type: primitiveType,
          name: baseName,
          position: defaultPosition,
          rotation: defaultRotation,
          scale: defaultScale,
          dimensions: defaultDimensions,
          materialId: DEFAULT_MATERIAL_ID,
        });
      }
    });

    return sceneObjects;
  } catch (err) {
    console.error('Error parsing DXF:', err);
    return [];
  }
}
