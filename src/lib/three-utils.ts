import * as THREE from 'three';
import type { SceneObject, MaterialProperties } from '@/types';

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
    case 'text': // Placeholder for 3D Text
      // For now, create a thin box as a placeholder.
      // Actual TextGeometry requires FontLoader and a font file.
      geometry = new THREE.BoxGeometry(dimensions.width || 2, dimensions.height || 0.5, dimensions.depth || 0.1);
      break;
    default:
      console.warn(`Unsupported primitive type: ${type}, creating a default cube.`);
      geometry = new THREE.BoxGeometry(1, 1, 1);
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = objectData.id; 
  mesh.position.set(...objectData.position);
  mesh.rotation.set(...objectData.rotation);
  mesh.scale.set(...objectData.scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  if (type === 'plane') { 
    mesh.rotation.x = -Math.PI / 2; 
  }

  return mesh;
}

export function updateMeshProperties(mesh: THREE.Mesh, objectData: SceneObject) {
  mesh.position.set(...objectData.position);
  mesh.rotation.set(...objectData.rotation); 
  mesh.scale.set(...objectData.scale);

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
            case 'text': // Placeholder update
                 if(oldGeomParams.width !== dimensions.width || oldGeomParams.height !== dimensions.height || oldGeomParams.depth !== dimensions.depth) dimensionsChanged = true;
                 if(dimensionsChanged) newGeometry = new THREE.BoxGeometry(dimensions.width || 2, dimensions.height || 0.5, dimensions.depth || 0.1);
                break;
        }
     } catch (e) {
        console.warn("Could not compare old geometry params, forcing update for:", type, e);
        switch (type) {
            case 'cube': newGeometry = new THREE.BoxGeometry(dimensions.width || 1, dimensions.height || 1, dimensions.depth || 1); break;
            case 'cylinder': newGeometry = new THREE.CylinderGeometry(dimensions.radiusTop || 0.5, dimensions.radiusBottom || 0.5, dimensions.height || 1, dimensions.radialSegments || 32, dimensions.heightSegments || 1); break;
            case 'plane': newGeometry = new THREE.PlaneGeometry(dimensions.width || 10, dimensions.height || 10); break;
            case 'text': newGeometry = new THREE.BoxGeometry(dimensions.width || 2, dimensions.height || 0.5, dimensions.depth || 0.1); break;
        }
     }

     if (newGeometry) {
        mesh.geometry.dispose();
        mesh.geometry = newGeometry;
     }
  }
   if (type === 'plane' && mesh.rotation.x !== -Math.PI / 2) {
    mesh.rotation.x = -Math.PI / 2;
  }
}

const textureLoader = new THREE.TextureLoader();
const loadedTexturesCache = new Map<string, THREE.Texture>();

function loadTexture(url: string | undefined): THREE.Texture | null {
  if (!url) return null;

  if (loadedTexturesCache.has(url)) {
    const cached = loadedTexturesCache.get(url);
    // If texture failed to load previously (e.g. placeholder error texture), try reloading
    if (cached && cached.image && cached.image.width > 0) { // Basic check if image data exists
        return cached;
    }
    // If not a valid texture, remove from cache to allow reload attempt
    loadedTexturesCache.delete(url);
  }

  try {
    const texture = textureLoader.load(url, 
      (loadedTex) => { 
        loadedTex.colorSpace = THREE.SRGBColorSpace; 
        loadedTex.wrapS = THREE.RepeatWrapping;
        loadedTex.wrapT = THREE.RepeatWrapping;
        loadedTex.needsUpdate = true; // Ensure material updates
        loadedTexturesCache.set(url, loadedTex);
      },
      undefined, 
      (err) => { 
        console.error("Failed to load texture:", url, err);
        // Optionally, set a placeholder error texture or remove from cache
        // For now, just remove so a re-attempt might happen if URL becomes valid
        if(loadedTexturesCache.has(url) && loadedTexturesCache.get(url)?.source.data === undefined){ // if it's the initial (empty) texture object
           loadedTexturesCache.delete(url);
        }
      }
    );
    // Store the initially returned (possibly empty) texture object to prevent multiple load calls for the same URL
    // before it's fully loaded or errored. The onLoad/onError will update/remove it.
    if (!loadedTexturesCache.has(url)) {
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
  
  const newMap = loadTexture(materialData.map);
  if (newMap !== material.map) {
    material.map = newMap;
    material.needsUpdate = true;
  }

  const newNormalMap = loadTexture(materialData.normalMap);
  if (newNormalMap !== material.normalMap) {
     material.normalMap = newNormalMap;
     material.needsUpdate = true;
  }

  const newRoughnessMap = loadTexture(materialData.roughnessMap);
  if (newRoughnessMap !== material.roughnessMap) {
    material.roughnessMap = newRoughnessMap;
    material.needsUpdate = true;
  }

  const newMetalnessMap = loadTexture(materialData.metalnessMap);
  if (newMetalnessMap !== material.metalnessMap) {
    material.metalnessMap = newMetalnessMap;
    material.needsUpdate = true;
  }
  
  const newAoMap = loadTexture(materialData.aoMap);
  if (newAoMap !== material.aoMap) {
    material.aoMap = newAoMap;
    material.needsUpdate = true;
  }
  
  if (material.aoMap && material instanceof THREE.MeshStandardMaterial) {
    // aoMapIntensity might be useful to control here
    // material.aoMapIntensity = 1.0; 
    // UV2 for aoMap is typically handled by Three.js if geometry has uv2 attribute
  }

  // No explicit material.needsUpdate = true here unless a texture changed, 
  // as color/roughness/metalness are direct property assignments.
  // However, if a texture pointer changes, needsUpdate IS required on the material.
  // Added needsUpdate in texture change blocks.

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
