import DxfParser, { type Vertex, type Polyline } from 'dxf-parser';
import type { SceneObject, PrimitiveType, SceneObjectDimensions, CadPlanLine, CadPlanData } from '@/types';
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
  closed?: boolean; 
  flags?: number; 
}
interface DxfPolylineEntity extends DxfEntityBase, Polyline { 
  type: 'POLYLINE';
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

const MIN_LENGTH_THRESHOLD = 0.01; 


function getBounds2D(vertices: {x:number, y:number}[], existingMin?: {x:number, z:number}, existingMax?: {x:number, z:number}): { min: { x: number; z: number }; max: { x: number; z: number } } {
  const minPt = existingMin ? { ...existingMin } : { x: Infinity, z: Infinity };
  const maxPt = existingMax ? { ...existingMax } : { x: -Infinity, z: -Infinity };

  vertices.forEach(v => {
    if (v && typeof v.x === 'number' && typeof v.y === 'number') { 
      minPt.x = Math.min(minPt.x, v.x);
      minPt.z = Math.min(minPt.z, v.y); 
      maxPt.x = Math.max(maxPt.x, v.x);
      maxPt.z = Math.max(maxPt.z, v.y); 
    }
  });
  return { min: minPt, max: maxPt };
}


export function parseDxfToCadPlan(dxfString: string): Partial<SceneObject> | null {
  const parser = new DxfParser();
  try {
    const dxf = parser.parseSync(dxfString);
    if (!dxf || !dxf.entities || !Array.isArray(dxf.entities)) {
      console.error('Failed to parse DXF or no entities array found.');
      return null;
    }

    const planLines: CadPlanLine[] = [];
    let overallMin = { x: Infinity, z: Infinity };
    let overallMax = { x: -Infinity, z: -Infinity };

    dxf.entities.forEach((entity: DxfEntity) => {
      try {
        switch (entity.type) {
          case 'LINE':
            if (entity.vertices && entity.vertices.length >= 2) {
              const start = entity.vertices[0];
              const end = entity.vertices[1];
              if (!start || !end || typeof start.x !== 'number' || typeof start.y !== 'number' || typeof end.x !== 'number' || typeof end.y !== 'number') break;
              const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
              if (length < MIN_LENGTH_THRESHOLD) break;
              
              // Store original coordinates for now, will normalize later
              planLines.push({ start: [start.x, start.y], end: [end.x, end.y] });
              const { min, max } = getBounds2D([start, end], overallMin, overallMax);
              overallMin = min;
              overallMax = max;
            }
            break;
          
          case 'LWPOLYLINE':
          case 'POLYLINE': 
            if (entity.vertices && entity.vertices.length > 1) {
              const currentPolyVertices: Vertex[] = [];
              for (let i = 0; i < entity.vertices.length - 1; i++) {
                const start = entity.vertices[i];
                const end = entity.vertices[i+1];
                if (!start || !end || typeof start.x !== 'number' || typeof start.y !== 'number' || typeof end.x !== 'number' || typeof end.y !== 'number') continue;
                const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
                if (length < MIN_LENGTH_THRESHOLD) continue;
                planLines.push({ start: [start.x, start.y], end: [end.x, end.y] });
                if(i === 0) currentPolyVertices.push(start);
                currentPolyVertices.push(end);
              }
              
              const isClosed = entity.closed || (entity.type === 'LWPOLYLINE' && (entity.flags & 1)) || (entity.vertices.length > 2 && entity.vertices[0].x === entity.vertices[entity.vertices.length - 1].x && entity.vertices[0].y === entity.vertices[entity.vertices.length - 1].y);
              if (isClosed && entity.vertices.length > 1) {
                const start = entity.vertices[entity.vertices.length - 1];
                const end = entity.vertices[0];
                 if (start && end && typeof start.x === 'number' && typeof start.y === 'number' && typeof end.x === 'number' && typeof end.y === 'number') {
                    const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
                    if (length >= MIN_LENGTH_THRESHOLD) {
                        planLines.push({ start: [start.x, start.y], end: [end.x, end.y] });
                    }
                 }
              }
              if (currentPolyVertices.length > 0) {
                const { min, max } = getBounds2D(currentPolyVertices, overallMin, overallMax);
                overallMin = min;
                overallMax = max;
              }
            }
            break;

          case 'CIRCLE':
            if (entity.center && typeof entity.radius === 'number' && entity.radius >= MIN_LENGTH_THRESHOLD / 2) {
              const segments = 32; // Number of segments to approximate the circle
              const circleVerticesForBounds: Vertex[] = [];
              for (let i = 0; i < segments; i++) {
                const angle1 = (i / segments) * Math.PI * 2;
                const angle2 = ((i + 1) / segments) * Math.PI * 2;
                const x1 = entity.center.x + entity.radius * Math.cos(angle1);
                const y1 = entity.center.y + entity.radius * Math.sin(angle1); // DXF Y
                const x2 = entity.center.x + entity.radius * Math.cos(angle2);
                const y2 = entity.center.y + entity.radius * Math.sin(angle2); // DXF Y
                planLines.push({ start: [x1, y1], end: [x2, y2] });
                if (i === 0) circleVerticesForBounds.push({x:x1, y:y1} as Vertex);
                 circleVerticesForBounds.push({x:x2, y:y2} as Vertex);
              }
              if(circleVerticesForBounds.length > 0){
                 const { min, max } = getBounds2D(circleVerticesForBounds, overallMin, overallMax);
                 overallMin = min;
                 overallMax = max;
              } else { // Fallback for bounds if no segments (e.g. radius too small)
                 const { min, max } = getBounds2D([
                    { x: entity.center.x - entity.radius, y: entity.center.y - entity.radius },
                    { x: entity.center.x + entity.radius, y: entity.center.y + entity.radius }
                  ], overallMin, overallMax);
                  overallMin = min;
                  overallMax = max;
              }
            }
            break;
          
          case 'ARC':
            if (entity.center && typeof entity.radius === 'number' && entity.radius > 0 && typeof entity.startAngle === 'number' && typeof entity.endAngle === 'number') {
              const segments = 16; 
              const totalArcLength = entity.radius * Math.abs(entity.endAngle - entity.startAngle) * Math.PI / 180;
              if (totalArcLength < MIN_LENGTH_THRESHOLD) break;

              // Normalize angles (DXF angles are in degrees, counter-clockwise)
              let startAngRad = entity.startAngle * Math.PI / 180;
              let endAngRad = entity.endAngle * Math.PI / 180;
              if (endAngRad < startAngRad) endAngRad += 2 * Math.PI; // Ensure end angle is greater for CW loop

              const angleStep = (endAngRad - startAngRad) / segments;
              let arcVerticesForBounds: Vertex[] = [];

              for (let i = 0; i < segments; i++) {
                const angle1 = startAngRad + i * angleStep;
                const angle2 = startAngRad + (i + 1) * angleStep;
                const x1 = entity.center.x + entity.radius * Math.cos(angle1);
                const y1 = entity.center.y + entity.radius * Math.sin(angle1);
                const x2 = entity.center.x + entity.radius * Math.cos(angle2);
                const y2 = entity.center.y + entity.radius * Math.sin(angle2);
                planLines.push({ start: [x1, y1], end: [x2, y2] });
                if (i === 0) arcVerticesForBounds.push({x: x1, y: y1} as Vertex);
                arcVerticesForBounds.push({x: x2, y: y2} as Vertex);
              }
              if(arcVerticesForBounds.length > 0) {
                const { min, max } = getBounds2D(arcVerticesForBounds, overallMin, overallMax);
                overallMin = min;
                overallMax = max;
              }
            }
            break;
          default:
            break;
        }
      } catch (entityError) {
        console.warn(`Skipping entity (type: ${entity.type}) during CAD plan conversion due to error:`, entityError);
      }
    });

    if (planLines.length === 0 || overallMin.x === Infinity || overallMax.x === -Infinity) {
      console.warn("No processable entities found in DXF for CAD Plan or bounds are invalid.");
      return null;
    }

    const width = overallMax.x - overallMin.x;
    const depth = overallMax.z - overallMin.z; // DXF Y is our Z
    const centerX = overallMin.x + width / 2;
    const centerZ = overallMin.z + depth / 2; // DXF Y is our Z

    const normalizedPlanLines = planLines.map(line => ({
      start: [line.start[0] - centerX, line.start[1] - centerZ] as [number, number],
      end: [line.end[0] - centerX, line.end[1] - centerZ] as [number, number],
    }));

    const cadPlanData: CadPlanData = { lines: normalizedPlanLines };

    return {
      id: uuidv4(),
      type: 'cadPlan',
      name: 'Imported CAD Plan',
      position: [centerX, 0.01, centerZ], // Position the plan's geometric center in the world
      rotation: [0, 0, 0], // CAD plan is on XZ plane by default
      scale: [1, 1, 1],
      dimensions: { width, depth }, // Overall bounding box dimensions
      materialId: DEFAULT_MATERIAL_ID, // This material's color will style the lines
      visible: true,
      planData: cadPlanData,
    };

  } catch (err) {
    console.error('Major error during DXF parsing for CAD Plan:', err);
    return null; 
  }
}
