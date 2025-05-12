
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
    case 'text': 
      geometry = new THREE.BoxGeometry(dimensions.width || 2, dimensions.height || 0.5, dimensions.depth || 0.1);
      break;
    default:
      console.warn(`Unsupported primitive type: ${type}, creating a default cube.`);
      geometry = new THREE.BoxGeometry(1, 1, 1);
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = objectData.id; 
  mesh.position.set(...objectData.position);
  mesh.rotation.set(...objectData.rotation); // Rotation is set from objectData

  mesh.scale.set(
    Math.max(0.001, objectData.scale[0]),
    Math.max(0.001, objectData.scale[1]),
    Math.max(0.001, objectData.scale[2])
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  // If it's a default plane added from the panel (which implies it should be on XZ)
  // and no specific rotation was given in objectData (or it's the default [0,0,0] from initial creation)
  // then apply the rotation to make it flat. Drawn planes will have explicit [0,0,0] rotation.
  if (type === 'plane' && 
      objectData.rotation[0] === 0 && 
      objectData.rotation[1] === 0 && 
      objectData.rotation[2] === 0 &&
      (!objectData.name || !objectData.name.toLowerCase().includes("rectangle")) // Heuristic: don't auto-rotate drawn rectangles
     ) { 
    // This check might be too simple. A better way is if `addObject` from panel sets a specific rotation like [-Math.PI/2, 0, 0]
    // and drawn rectangles are added with [0,0,0].
    // For now, let's assume if rotation is [0,0,0] it's a drawn plane, otherwise it's a default one.
    // Or, if its name is "Plane X" (from panel add), rotate it.
    if (objectData.name && objectData.name.startsWith("Plane")) {
        mesh.rotation.x = -Math.PI / 2;
    }
  }


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
  // Rotation is now handled by objectData directly via mesh.rotation.set(...) above.
  // The conditional rotation for default planes should be set in `objectData.rotation`
  // when the object is initially created by `addObject` from the panel.
  // For drawn rectangles, their `objectData.rotation` will be `[0,0,0]`.
}

const textureLoader = new THREE.TextureLoader();
const loadedTexturesCache = new Map<string, THREE.Texture>();

function loadTexture(url: string | undefined): THREE.Texture | null {
  if (!url) return null;

  if (loadedTexturesCache.has(url)) {
    const cached = loadedTexturesCache.get(url);
    if (cached && cached.image && cached.image.width > 0) {
        return cached;
    }
    loadedTexturesCache.delete(url);
  }

  try {
    const texture = textureLoader.load(url, 
      (loadedTex) => { 
        loadedTex.colorSpace = THREE.SRGBColorSpace; 
        loadedTex.wrapS = THREE.RepeatWrapping;
        loadedTex.wrapT = THREE.RepeatWrapping;
        loadedTex.needsUpdate = true; 
        loadedTexturesCache.set(url, loadedTex);
      },
      undefined, 
      (err) => { 
        console.error("Failed to load texture:", url, err);
        if(loadedTexturesCache.has(url) && loadedTexturesCache.get(url)?.source.data === undefined){
           loadedTexturesCache.delete(url);
        }
      }
    );
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
    // material.aoMapIntensity = 1.0; 
  }
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
