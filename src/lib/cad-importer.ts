import DxfParser, { type Vertex, type Polyline } from 'dxf-parser';
import type { SceneObject, PrimitiveType, SceneObjectDimensions } from '@/types';
import { DEFAULT_MATERIAL_ID } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import * as THREE from 'three';

interface DxfEntityBase {
  type: string;
  layer?: string;
  colorNumber?: number;
  extrusionDirection?: Vertex;
  [key: string]: any; 
}

interface DxfLineEntity extends DxfEntityBase {
  type: 'LINE';
  vertices: Vertex[];
}

interface DxfLwPolylineEntity extends DxfEntityBase {
  type: 'LWPOLYLINE';
  vertices: Vertex[];
  closed?: boolean; // DxfParser might add this
  flags?: number; // Standard DXF flag for LWPOLYLINE
}
interface DxfPolylineEntity extends DxfEntityBase, Polyline { // Extends DxfParser's Polyline
  type: 'POLYLINE';
  // vertices are part of Polyline type
}


interface DxfCircleEntity extends DxfEntityBase {
  type: 'CIRCLE';
  center: Vertex;
  radius: number;
}

interface DxfArcEntity extends DxfEntityBase {
  type: 'ARC';
  center: Vertex;
  radius: number;
  startAngle: number;
  endAngle: number;
}


type DxfEntity = DxfLineEntity | DxfLwPolylineEntity | DxfPolylineEntity | DxfCircleEntity | DxfArcEntity | DxfEntityBase;

const MIN_LENGTH_THRESHOLD = 0.01; // Minimum length for a line/segment to be imported


function getBounds(vertices: Vertex[]): { min: THREE.Vector2; max: THREE.Vector2 } | null {
  if (!vertices || vertices.length === 0) return null;
  const min = new THREE.Vector2(Infinity, Infinity);
  const max = new THREE.Vector2(-Infinity, -Infinity);
  vertices.forEach(v => {
    if (v && typeof v.x === 'number' && typeof v.y === 'number') {
      min.x = Math.min(min.x, v.x);
      min.y = Math.min(min.y, v.y); 
      max.x = Math.max(max.x, v.x);
      max.y = Math.max(max.y, v.y); 
    }
  });
  if (min.x === Infinity) return null; // No valid vertices found
  return { min, max };
}

export function parseDxfToSceneObjects(dxfString: string): Partial<SceneObject>[] {
  const parser = new DxfParser();
  try {
    const dxf = parser.parseSync(dxfString);
    if (!dxf || !dxf.entities || !Array.isArray(dxf.entities)) {
      console.error('Failed to parse DXF or no entities array found.');
      return [];
    }

    const sceneObjects: Partial<SceneObject>[] = [];
    let objectCount = 0;

    dxf.entities.forEach((entity: DxfEntity) => {
      objectCount++;
      const baseName = `${entity.type ? entity.type.charAt(0).toUpperCase() + entity.type.slice(1).toLowerCase() : 'CadObject'}_${objectCount}`;
      let defaultPosition: [number, number, number] = [0, 0.01, 0]; // Default Y slightly above ground
      let defaultRotation: [number, number, number] = [0, 0, 0];
      let defaultScale: [number, number, number] = [1, 1, 1];
      let defaultDimensions: SceneObjectDimensions = {};
      let primitiveType: PrimitiveType | null = null;

      try { 
        switch (entity.type) {
          case 'LINE':
            if (entity.vertices && entity.vertices.length >= 2) {
              const start = entity.vertices[0];
              const end = entity.vertices[1];
              if (!start || !end || typeof start.x !== 'number' || typeof start.y !== 'number' || typeof end.x !== 'number' || typeof end.y !== 'number') break;

              const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
              if (length < MIN_LENGTH_THRESHOLD) break; 
              
              primitiveType = 'cube'; 
              defaultDimensions = { width: length, height: 0.02, depth: 0.02 }; 
              defaultPosition[0] = (start.x + end.x) / 2;
              defaultPosition[2] = (start.y + end.y) / 2; 

              const angle = Math.atan2(end.y - start.y, end.x - start.x);
              defaultRotation[1] = -angle; 
            }
            break;
          
          case 'LWPOLYLINE':
          case 'POLYLINE': 
            if (entity.vertices && entity.vertices.length > 0) {
              const isClosed = entity.closed || entity.flags === 1 || (entity.vertices.length > 2 && entity.vertices[0].x === entity.vertices[entity.vertices.length - 1].x && entity.vertices[0].y === entity.vertices[entity.vertices.length - 1].y);
              
              if (isClosed && entity.vertices.length >=3) {
                primitiveType = 'plane';
                const bounds = getBounds(entity.vertices);
                if (!bounds) break;
                const width = bounds.max.x - bounds.min.x;
                const depth = bounds.max.y - bounds.min.y; 
                
                if (width < MIN_LENGTH_THRESHOLD || depth < MIN_LENGTH_THRESHOLD) break;

                defaultDimensions = { width: width, height: depth }; 
                defaultPosition[0] = (bounds.min.x + bounds.max.x) / 2;
                defaultPosition[1] = 0; 
                defaultPosition[2] = (bounds.min.y + bounds.max.y) / 2;
                defaultRotation[0] = -Math.PI / 2; 
              } else { 
                for (let i = 0; i < entity.vertices.length - 1; i++) {
                  const start = entity.vertices[i];
                  const end = entity.vertices[i+1];
                  if (!start || !end || typeof start.x !== 'number' || typeof start.y !== 'number' || typeof end.x !== 'number' || typeof end.y !== 'number') continue;

                  const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
                  if (length < MIN_LENGTH_THRESHOLD) continue;

                  sceneObjects.push({
                    type: 'cube',
                    name: `${baseName}_seg${i}`,
                    position: [(start.x + end.x) / 2, 0.01, (start.y + end.y) / 2],
                    rotation: [0, -Math.atan2(end.y - start.y, end.x - start.x), 0],
                    scale: [1,1,1],
                    dimensions: { width: length, height: 0.02, depth: 0.02 },
                    materialId: DEFAULT_MATERIAL_ID,
                  });
                }
                primitiveType = null; 
              }
            }
            break;

          case 'CIRCLE':
            if (entity.center && typeof entity.radius === 'number' && entity.radius >= MIN_LENGTH_THRESHOLD / 2) {
              primitiveType = 'plane'; 
              defaultDimensions = { 
                  width: entity.radius * 2, 
                  height: entity.radius * 2,
                  radialSegments: 32 
              };
              defaultPosition[0] = entity.center.x;
              defaultPosition[1] = 0; 
              defaultPosition[2] = entity.center.y; 
              defaultRotation[0] = -Math.PI / 2; 
            }
            break;
          
          case 'ARC':
            if (entity.center && typeof entity.radius === 'number' && entity.radius > 0 && typeof entity.startAngle === 'number' && typeof entity.endAngle === 'number') {
              const segments = 16; 
              const totalArcLength = entity.radius * Math.abs(entity.endAngle - entity.startAngle) * Math.PI / 180;
              if (totalArcLength < MIN_LENGTH_THRESHOLD) break;

              const angleStep = (entity.endAngle - entity.startAngle) / segments;
              for (let i = 0; i < segments; i++) {
                const angle1 = entity.startAngle + i * angleStep;
                const angle2 = entity.startAngle + (i + 1) * angleStep;
                const x1 = entity.center.x + entity.radius * Math.cos(angle1 * Math.PI / 180);
                const y1 = entity.center.y + entity.radius * Math.sin(angle1 * Math.PI / 180);
                const x2 = entity.center.x + entity.radius * Math.cos(angle2 * Math.PI / 180);
                const y2 = entity.center.y + entity.radius * Math.sin(angle2 * Math.PI / 180);
                
                const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                if (length < MIN_LENGTH_THRESHOLD / segments) continue; // Adjusted threshold for segments

                sceneObjects.push({
                    type: 'cube',
                    name: `${baseName}_arcSeg${i}`,
                    position: [(x1 + x2) / 2, 0.01, (y1 + y2) / 2],
                    rotation: [0, -Math.atan2(y2 - y1, x2 - x1), 0],
                    scale: [1,1,1],
                    dimensions: { width: length, height: 0.02, depth: 0.02 },
                    materialId: DEFAULT_MATERIAL_ID,
                  });
              }
              primitiveType = null; 
            }
            break;
          default:
            break;
        }
      } catch (entityError) {
        console.warn(`Skipping entity due to error: ${baseName} (Type: ${entity.type})`, entityError);
        primitiveType = null; 
      }


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
    console.error('Major error during DXF parsing:', err);
    return []; 
  }
}