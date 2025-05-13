
import * as THREE from 'three';
import type { SceneObject, MaterialProperties, PrimitiveType } from '@/types';

export function createPrimitive(objectData: SceneObject, material: THREE.Material): THREE.Mesh {
  let geometry: THREE.BufferGeometry;
  const { type, dimensions } = objectData;

  switch (type) {
    case 'cube':
      geometry = new THREE.BoxGeometry(dimensions.width || 1, dimensions.height || 1, dimensions.depth || 1);
      break;
    case 'cylinder':
      geometry = new THREE.CylinderGeometry(
        dimensions.radiusTop || 0.5,
        dimensions.radiusBottom || 0.5,
        dimensions.height || 1,
        dimensions.radialSegments || 32,
        dimensions.heightSegments || 1,
      );
      break;
    case 'plane':
      geometry = new THREE.PlaneGeometry(dimensions.width || 10, dimensions.height || 10);
      break;
    case 'text': 
      geometry = new THREE.BoxGeometry(dimensions.width || 2, dimensions.height || 0.5, dimensions.depth || 0.1);
      break;
    case 'sphere':
      geometry = new THREE.SphereGeometry(
        dimensions.radius || 0.5,
        dimensions.radialSegments || 32, // widthSegments in Three.js
        dimensions.heightSegments || 16 // heightSegments in Three.js
      );
      break;
    case 'cone':
      geometry = new THREE.ConeGeometry(
        dimensions.radius || 0.5,
        dimensions.height || 1,
        dimensions.radialSegments || 32
      );
      break;
    case 'torus':
      geometry = new THREE.TorusGeometry(
        dimensions.radius || 0.5, // Major radius
        dimensions.tube || 0.2,   // Minor radius (tube thickness)
        dimensions.radialSegments || 16, // Radial segments for the tube
        dimensions.tubularSegments || 32 // Tubular segments around the torus
      );
      break;
    case 'polygon': // Create a flat N-sided polygon (CircleGeometry can do this)
      geometry = new THREE.CircleGeometry(
        dimensions.radius || 0.5,
        dimensions.sides || 6
      );
      // Note: If extrusion is desired for polygon, it requires different geometry (e.g. ShapeGeometry + ExtrudeGeometry)
      // or handling it as a 'cylinder' with different top/bottom radii and few segments if that's the intent.
      // For now, it's a flat 2D shape on its local XY plane. Rotation will put it on XZ if needed.
      break;
    default:
      console.warn(`Unsupported primitive type: ${type}, creating a default cube.`);
      geometry = new THREE.BoxGeometry(1, 1, 1);
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = objectData.id; 
  mesh.position.set(...objectData.position);
  mesh.rotation.set(...objectData.rotation);

  mesh.scale.set(
    Math.max(0.001, objectData.scale[0]),
    Math.max(0.001, objectData.scale[1]),
    Math.max(0.001, objectData.scale[2])
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  return mesh;
}

export function updateMeshProperties(mesh: THREE.Mesh, objectData: SceneObject) {
  mesh.position.set(...objectData.position);
  mesh.rotation.set(...objectData.rotation); 
  mesh.scale.set(
    Math.max(0.001, objectData.scale[0]),
    Math.max(0.001, objectData.scale[1]),
    Math.max(0.001, objectData.scale[2])
  );

  const { type, dimensions } = objectData;
  let newGeometry: THREE.BufferGeometry | undefined;

  if (mesh.geometry) {
     const oldGeomParams = (mesh.geometry as any).parameters; 
     let dimensionsChanged = false;
     
     try { 
        switch (type) {
            case 'cube':
                if(oldGeomParams.width !== dimensions.width || oldGeomParams.height !== dimensions.height || oldGeomParams.depth !== dimensions.depth) dimensionsChanged = true;
                if(dimensionsChanged) newGeometry = new THREE.BoxGeometry(dimensions.width || 1, dimensions.height || 1, dimensions.depth || 1);
                break;
            case 'cylinder':
                if(oldGeomParams.radiusTop !== dimensions.radiusTop || oldGeomParams.radiusBottom !== dimensions.radiusBottom || oldGeomParams.height !== dimensions.height || oldGeomParams.radialSegments !== dimensions.radialSegments) dimensionsChanged = true;
                if(dimensionsChanged) newGeometry = new THREE.CylinderGeometry(dimensions.radiusTop || 0.5, dimensions.radiusBottom || 0.5, dimensions.height || 1, dimensions.radialSegments || 32, dimensions.heightSegments || 1);
                break;
            case 'plane':
                if(oldGeomParams.width !== dimensions.width || oldGeomParams.height !== dimensions.height) dimensionsChanged = true;
                if(dimensionsChanged) newGeometry = new THREE.PlaneGeometry(dimensions.width || 10, dimensions.height || 10);
                break;
            case 'text': 
                 if(oldGeomParams.width !== dimensions.width || oldGeomParams.height !== dimensions.height || oldGeomParams.depth !== dimensions.depth) dimensionsChanged = true;
                 if(dimensionsChanged) newGeometry = new THREE.BoxGeometry(dimensions.width || 2, dimensions.height || 0.5, dimensions.depth || 0.1);
                break;
            case 'sphere':
                if(oldGeomParams.radius !== dimensions.radius || oldGeomParams.widthSegments !== dimensions.radialSegments || oldGeomParams.heightSegments !== dimensions.heightSegments) dimensionsChanged = true;
                if(dimensionsChanged) newGeometry = new THREE.SphereGeometry(dimensions.radius || 0.5, dimensions.radialSegments || 32, dimensions.heightSegments || 16);
                break;
            case 'cone':
                if(oldGeomParams.radius !== dimensions.radius || oldGeomParams.height !== dimensions.height || oldGeomParams.radialSegments !== dimensions.radialSegments) dimensionsChanged = true;
                if(dimensionsChanged) newGeometry = new THREE.ConeGeometry(dimensions.radius || 0.5, dimensions.height || 1, dimensions.radialSegments || 32);
                break;
            case 'torus':
                if(oldGeomParams.radius !== dimensions.radius || oldGeomParams.tube !== dimensions.tube || oldGeomParams.radialSegments !== dimensions.radialSegments || oldGeomParams.tubularSegments !== dimensions.tubularSegments) dimensionsChanged = true;
                if(dimensionsChanged) newGeometry = new THREE.TorusGeometry(dimensions.radius || 0.5, dimensions.tube || 0.2, dimensions.radialSegments || 16, dimensions.tubularSegments || 32);
                break;
            case 'polygon':
                if(oldGeomParams.radius !== dimensions.radius || oldGeomParams.segments !== dimensions.sides) dimensionsChanged = true;
                if(dimensionsChanged) newGeometry = new THREE.CircleGeometry(dimensions.radius || 0.5, dimensions.sides || 6);
                break;
        }
     } catch (e) {
        console.warn("Could not compare old geometry params, forcing update for:", type, e);
        // Fallback to creating new geometry if parameters are missing or comparison fails
        switch (type) {
            case 'cube': newGeometry = new THREE.BoxGeometry(dimensions.width || 1, dimensions.height || 1, dimensions.depth || 1); break;
            case 'cylinder': newGeometry = new THREE.CylinderGeometry(dimensions.radiusTop || 0.5, dimensions.radiusBottom || 0.5, dimensions.height || 1, dimensions.radialSegments || 32, dimensions.heightSegments || 1); break;
            case 'plane': newGeometry = new THREE.PlaneGeometry(dimensions.width || 10, dimensions.height || 10); break;
            case 'text': newGeometry = new THREE.BoxGeometry(dimensions.width || 2, dimensions.height || 0.5, dimensions.depth || 0.1); break;
            case 'sphere': newGeometry = new THREE.SphereGeometry(dimensions.radius || 0.5, dimensions.radialSegments || 32, dimensions.heightSegments || 16); break;
            case 'cone': newGeometry = new THREE.ConeGeometry(dimensions.radius || 0.5, dimensions.height || 1, dimensions.radialSegments || 32); break;
            case 'torus': newGeometry = new THREE.TorusGeometry(dimensions.radius || 0.5, dimensions.tube || 0.2, dimensions.radialSegments || 16, dimensions.tubularSegments || 32); break;
            case 'polygon': newGeometry = new THREE.CircleGeometry(dimensions.radius || 0.5, dimensions.sides || 6); break;
        }
     }

     if (newGeometry) {
        mesh.geometry.dispose();
        mesh.geometry = newGeometry;
     }
  }
}

const textureLoader = new THREE.TextureLoader();
const loadedTexturesCache = new Map<string, THREE.Texture>();

function loadTexture(url: string | undefined): THREE.Texture | null {
  if (!url) return null;

  if (loadedTexturesCache.has(url)) {
    const cached = loadedTexturesCache.get(url);
    if (cached && cached.image && cached.image.width > 0) { // Check if image actually loaded
        return cached;
    }
    // If cached texture is invalid (e.g., image failed to load previously), remove it to try again
    loadedTexturesCache.delete(url);
  }

  try {
    const texture = textureLoader.load(url, 
      (loadedTex) => { 
        loadedTex.colorSpace = THREE.SRGBColorSpace; 
        loadedTex.wrapS = THREE.RepeatWrapping;
        loadedTex.wrapT = THREE.RepeatWrapping;
        loadedTex.needsUpdate = true; 
        loadedTexturesCache.set(url, loadedTex); // Cache on successful load
      },
      undefined, 
      (err) => { 
        console.error("Failed to load texture:", url, err);
        // Ensure if a placeholder texture was added to cache due to async nature, it's removed on error
        if(loadedTexturesCache.has(url) && loadedTexturesCache.get(url)?.source.data === undefined){ // Check if it's a dummy
           loadedTexturesCache.delete(url);
        }
      }
    );
    // Cache immediately with the promise of loading, but be mindful of the error callback above
    if (!loadedTexturesCache.has(url)) { // Avoid overwriting a successfully loaded texture from callback
        loadedTexturesCache.set(url, texture);
    }
    return texture; 
  } catch (error) {
    console.error("Error initiating texture load:", url, error);
    return null;
  }
}

export function createOrUpdateMaterial(
  materialData: MaterialProperties,
  existingMaterial?: THREE.MeshStandardMaterial
): THREE.MeshStandardMaterial {
  const material = existingMaterial || new THREE.MeshStandardMaterial();

  material.color.set(materialData.color);
  material.roughness = materialData.roughness;
  material.metalness = materialData.metalness;
  
  material.transparent = materialData.transparent ?? materialData.opacity !== undefined && materialData.opacity < 1;
  material.opacity = materialData.opacity ?? 1.0;
  material.ior = materialData.ior ?? 1.5; // Common default for glass/plastic

  if (materialData.emissive && materialData.emissive !== '#000000') {
    material.emissive.set(materialData.emissive);
    material.emissiveIntensity = materialData.emissiveIntensity ?? 1.0;
  } else {
    material.emissive.set('#000000');
    material.emissiveIntensity = 0;
  }
  
  const newMap = loadTexture(materialData.map);
  if (newMap !== material.map) {
    material.map = newMap;
  }

  const newNormalMap = loadTexture(materialData.normalMap);
  if (newNormalMap !== material.normalMap) {
     material.normalMap = newNormalMap;
  }

  const newRoughnessMap = loadTexture(materialData.roughnessMap);
  if (newRoughnessMap !== material.roughnessMap) {
    material.roughnessMap = newRoughnessMap;
  }

  const newMetalnessMap = loadTexture(materialData.metalnessMap);
  if (newMetalnessMap !== material.metalnessMap) {
    material.metalnessMap = newMetalnessMap;
  }
  
  const newAoMap = loadTexture(materialData.aoMap);
  if (newAoMap !== material.aoMap) {
    material.aoMap = newAoMap;
    // material.aoMapIntensity typically defaults to 1, can be made configurable
  }

  const newDisplacementMap = loadTexture(materialData.displacementMap);
  if (newDisplacementMap !== material.displacementMap) {
    material.displacementMap = newDisplacementMap;
  }
  material.displacementScale = materialData.displacementScale ?? 1.0;
  material.displacementBias = materialData.displacementBias ?? 0.0;
  
  material.needsUpdate = true; // Flag material for update after changing properties
  return material;
}

export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}
