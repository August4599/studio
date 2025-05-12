import * as THREE from 'three';
import type { SceneObject, MaterialProperties } from '@/types'; // Removed PrimitiveType as not directly used

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
        dimensions.heightSegments || 1, // Default to 1 height segment
      );
      break;
    case 'plane':
      geometry = new THREE.PlaneGeometry(dimensions.width || 10, dimensions.height || 10);
      break;
    default:
      // It's better to throw an error or return a default placeholder for unhandled types
      console.warn(`Unsupported primitive type: ${type}, creating a default cube.`);
      geometry = new THREE.BoxGeometry(1, 1, 1);
      // throw new Error(`Unsupported primitive type: ${type}`);
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = objectData.id; 
  mesh.position.set(...objectData.position);
  mesh.rotation.set(...objectData.rotation);
  mesh.scale.set(...objectData.scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  if (type === 'plane') { 
    // Planes are created in XY by default, rotate to be XZ (horizontal ground)
    mesh.rotation.x = -Math.PI / 2; 
  }

  return mesh;
}

export function updateMeshProperties(mesh: THREE.Mesh, objectData: SceneObject) {
  mesh.position.set(...objectData.position);
  mesh.rotation.set(...objectData.rotation); // Rotation applied directly
  mesh.scale.set(...objectData.scale);

  const { type, dimensions } = objectData;
  let newGeometry: THREE.BufferGeometry | undefined;

  if (mesh.geometry) {
     const oldGeomParams = (mesh.geometry as any).parameters; // Access existing params
     let dimensionsChanged = false;
     
     try { // Wrap in try-catch in case parameters are not as expected
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
        }
     } catch (e) {
        console.warn("Could not compare old geometry params, forcing update for:", type, e);
        // Fallback to creating new geometry if params are not found/compatible
        switch (type) {
            case 'cube': newGeometry = new THREE.BoxGeometry(dimensions.width || 1, dimensions.height || 1, dimensions.depth || 1); break;
            case 'cylinder': newGeometry = new THREE.CylinderGeometry(dimensions.radiusTop || 0.5, dimensions.radiusBottom || 0.5, dimensions.height || 1, dimensions.radialSegments || 32, dimensions.heightSegments || 1); break;
            case 'plane': newGeometry = new THREE.PlaneGeometry(dimensions.width || 10, dimensions.height || 10); break;
        }
     }

     if (newGeometry) {
        mesh.geometry.dispose();
        mesh.geometry = newGeometry;
     }
  }
   // If it's a plane and not already rotated, ensure it's horizontal.
   // This check is primarily for initial creation if rotation wasn't set there or if type changes.
   if (type === 'plane' && mesh.rotation.x !== -Math.PI / 2) {
    mesh.rotation.x = -Math.PI / 2;
  }
}

const textureLoader = new THREE.TextureLoader();
const loadedTexturesCache = new Map<string, THREE.Texture>();

function loadTexture(url: string | undefined): THREE.Texture | null {
  if (!url) return null;

  if (loadedTexturesCache.has(url)) {
    return loadedTexturesCache.get(url)!;
  }

  try {
    const texture = textureLoader.load(url, 
      (loadedTex) => { // On load
        loadedTex.colorSpace = THREE.SRGBColorSpace; // Correct color space for most image textures
        loadedTex.wrapS = THREE.RepeatWrapping;
        loadedTex.wrapT = THREE.RepeatWrapping;
        loadedTex.needsUpdate = true;
        loadedTexturesCache.set(url, loadedTex);
      },
      undefined, // onProgress (optional)
      (err) => { // onError
        console.error("Failed to load texture:", url, err);
        loadedTexturesCache.delete(url); // Remove from cache on error
      }
    );
    // Return immediately, texture will update async. Store placeholder in cache?
    // For simplicity, we assume sync loading or that Three.js handles the async update correctly.
    // To handle fully async, material update would need to be triggered in loader's onLoad.
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
  
  const newMap = loadTexture(materialData.map);
  if (newMap !== material.map) material.map = newMap;

  const newNormalMap = loadTexture(materialData.normalMap);
  if (newNormalMap !== material.normalMap) material.normalMap = newNormalMap;

  const newRoughnessMap = loadTexture(materialData.roughnessMap);
  if (newRoughnessMap !== material.roughnessMap) material.roughnessMap = newRoughnessMap;

  const newMetalnessMap = loadTexture(materialData.metalnessMap);
  if (newMetalnessMap !== material.metalnessMap) material.metalnessMap = newMetalnessMap;
  
  const newAoMap = loadTexture(materialData.aoMap);
  if (newAoMap !== material.aoMap) material.aoMap = newAoMap;
  
  if (material.aoMap && material instanceof THREE.MeshStandardMaterial) {
    // aoMap requires a second UV set (uv2).
    // This assumes geometries being used have uv2 attribute.
    // If not, you might need to add: geometry.setAttribute('uv2', new THREE.BufferAttribute(geometry.attributes.uv.array, 2));
    // This should be done when geometry is created or updated.
  }

  material.needsUpdate = true;
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
