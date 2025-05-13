

import * as THREE from 'three';
import type { SceneObject, MaterialProperties, PrimitiveType } from '@/types';

export function createPrimitive(objectData: SceneObject, material: THREE.Material): THREE.Mesh {
  let geometry: THREE.BufferGeometry;
  const { type, dimensions } = objectData;

  if (type === 'cadPlan') {
    console.error("createPrimitive should not be called for 'cadPlan' type. CAD plans are handled directly in SceneViewer.");
    // Return a minimal placeholder or throw an error to indicate incorrect usage
    const dummyGeometry = new THREE.BoxGeometry(0.01, 0.01, 0.01); // Very small, non-intrusive placeholder
    const dummyMesh = new THREE.Mesh(dummyGeometry, material);
    dummyMesh.name = objectData.id + "_error_placeholder";
    dummyMesh.visible = false; // Make it invisible
    return dummyMesh;
  }

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
      // Placeholder geometry for 3D text; actual text rendering requires TextGeometry
      geometry = new THREE.BoxGeometry(dimensions.width || 2, dimensions.height || 0.5, dimensions.depth || 0.1);
      break;
    case 'sphere':
      geometry = new THREE.SphereGeometry(
        dimensions.radius || 0.5,
        dimensions.radialSegments || 32, 
        dimensions.heightSegments || 16 
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
        dimensions.radius || 0.5, 
        dimensions.tube || 0.2,   
        dimensions.radialSegments || 16, 
        dimensions.tubularSegments || 32 
      );
      break;
    case 'polygon': 
      geometry = new THREE.CircleGeometry(
        dimensions.radius || 0.5,
        dimensions.sides || 6
      );
      break;
    default:
      console.warn(`Unsupported primitive type: ${type}, creating a default cube.`);
      geometry = new THREE.BoxGeometry(1, 1, 1);
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = objectData.id; 
  mesh.position.set(...objectData.position);
  mesh.rotation.set(...objectData.rotation);
  mesh.visible = objectData.visible ?? true;
  mesh.userData = { objectType: type }; // Store original type for potential future use

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
  // This function should only be called for THREE.Mesh objects, not Groups (like cadPlan)
  if (objectData.type === 'cadPlan') {
    console.error("updateMeshProperties should not be called for 'cadPlan' type.");
    return;
  }

  mesh.position.set(...objectData.position);
  mesh.rotation.set(...objectData.rotation); 
  mesh.visible = objectData.visible ?? true;
  mesh.scale.set(
    Math.max(0.001, objectData.scale[0]),
    Math.max(0.001, objectData.scale[1]),
    Math.max(0.001, objectData.scale[2])
  );

  const { type, dimensions } = objectData;
  let newGeometry: THREE.BufferGeometry | undefined;

  // Only update geometry if dimensions have changed and it's a known primitive type
  if (mesh.geometry) {
     const oldGeomParams = (mesh.geometry as any).parameters; 
     let dimensionsChanged = false;
     
     // Check if geometry parameters are available and if dimensions have changed
     // This try-catch is a safeguard if oldGeomParams is not what's expected
     try { 
        switch (type) {
            case 'cube':
                if(oldGeomParams?.width !== dimensions.width || oldGeomParams?.height !== dimensions.height || oldGeomParams?.depth !== dimensions.depth) dimensionsChanged = true;
                if(dimensionsChanged) newGeometry = new THREE.BoxGeometry(dimensions.width || 1, dimensions.height || 1, dimensions.depth || 1);
                break;
            case 'cylinder':
                if(oldGeomParams?.radiusTop !== dimensions.radiusTop || oldGeomParams?.radiusBottom !== dimensions.radiusBottom || oldGeomParams?.height !== dimensions.height || oldGeomParams?.radialSegments !== dimensions.radialSegments) dimensionsChanged = true;
                if(dimensionsChanged) newGeometry = new THREE.CylinderGeometry(dimensions.radiusTop || 0.5, dimensions.radiusBottom || 0.5, dimensions.height || 1, dimensions.radialSegments || 32, dimensions.heightSegments || 1);
                break;
            case 'plane':
                if(oldGeomParams?.width !== dimensions.width || oldGeomParams?.height !== dimensions.height) dimensionsChanged = true;
                if(dimensionsChanged) newGeometry = new THREE.PlaneGeometry(dimensions.width || 10, dimensions.height || 10);
                break;
            case 'text': // Placeholder for text
                 if(oldGeomParams?.width !== dimensions.width || oldGeomParams?.height !== dimensions.height || oldGeomParams?.depth !== dimensions.depth) dimensionsChanged = true;
                 if(dimensionsChanged) newGeometry = new THREE.BoxGeometry(dimensions.width || 2, dimensions.height || 0.5, dimensions.depth || 0.1);
                break;
            case 'sphere':
                if(oldGeomParams?.radius !== dimensions.radius || oldGeomParams?.widthSegments !== dimensions.radialSegments || oldGeomParams?.heightSegments !== dimensions.heightSegments) dimensionsChanged = true;
                if(dimensionsChanged) newGeometry = new THREE.SphereGeometry(dimensions.radius || 0.5, dimensions.radialSegments || 32, dimensions.heightSegments || 16);
                break;
            case 'cone':
                if(oldGeomParams?.radius !== dimensions.radius || oldGeomParams?.height !== dimensions.height || oldGeomParams?.radialSegments !== dimensions.radialSegments) dimensionsChanged = true;
                if(dimensionsChanged) newGeometry = new THREE.ConeGeometry(dimensions.radius || 0.5, dimensions.height || 1, dimensions.radialSegments || 32);
                break;
            case 'torus':
                if(oldGeomParams?.radius !== dimensions.radius || oldGeomParams?.tube !== dimensions.tube || oldGeomParams?.radialSegments !== dimensions.radialSegments || oldGeomParams?.tubularSegments !== dimensions.tubularSegments) dimensionsChanged = true;
                if(dimensionsChanged) newGeometry = new THREE.TorusGeometry(dimensions.radius || 0.5, dimensions.tube || 0.2, dimensions.radialSegments || 16, dimensions.tubularSegments || 32);
                break;
            case 'polygon':
                if(oldGeomParams?.radius !== dimensions.radius || oldGeomParams?.segments !== dimensions.sides) dimensionsChanged = true; // CircleGeometry uses 'segments' for sides
                if(dimensionsChanged) newGeometry = new THREE.CircleGeometry(dimensions.radius || 0.5, dimensions.sides || 6);
                break;
        }
     } catch (e) {
        console.warn("Could not compare old geometry params, forcing geometry update for:", type, e);
        // Fallback to creating new geometry if parameters are missing or comparison fails
        switch (type) { // This switch ensures newGeometry is assigned
            case 'cube': newGeometry = new THREE.BoxGeometry(dimensions.width || 1, dimensions.height || 1, dimensions.depth || 1); break;
            case 'cylinder': newGeometry = new THREE.CylinderGeometry(dimensions.radiusTop || 0.5, dimensions.radiusBottom || 0.5, dimensions.height || 1, dimensions.radialSegments || 32, dimensions.heightSegments || 1); break;
            case 'plane': newGeometry = new THREE.PlaneGeometry(dimensions.width || 10, dimensions.height || 10); break;
            case 'text': newGeometry = new THREE.BoxGeometry(dimensions.width || 2, dimensions.height || 0.5, dimensions.depth || 0.1); break;
            case 'sphere': newGeometry = new THREE.SphereGeometry(dimensions.radius || 0.5, dimensions.radialSegments || 32, dimensions.heightSegments || 16); break;
            case 'cone': newGeometry = new THREE.ConeGeometry(dimensions.radius || 0.5, dimensions.height || 1, dimensions.radialSegments || 32); break;
            case 'torus': newGeometry = new THREE.TorusGeometry(dimensions.radius || 0.5, dimensions.tube || 0.2, dimensions.radialSegments || 16, dimensions.tubularSegments || 32); break;
            case 'polygon': newGeometry = new THREE.CircleGeometry(dimensions.radius || 0.5, dimensions.sides || 6); break;
            default: newGeometry = undefined; // Ensure newGeometry is explicitly undefined if type not handled
        }
     }

     if (newGeometry) {
        mesh.geometry.dispose(); // Dispose old geometry
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
    // Ensure the cached texture's image is actually loaded, otherwise, it might be a placeholder from a failed load
    if (cached && cached.image && cached.image.width > 0) { 
        return cached;
    }
    // If cached texture is invalid (e.g., image failed to load previously), remove it to allow a retry
    loadedTexturesCache.delete(url);
  }

  try {
    const texture = textureLoader.load(url, 
      (loadedTex) => { // onLoad callback
        loadedTex.colorSpace = THREE.SRGBColorSpace; 
        loadedTex.wrapS = THREE.RepeatWrapping;
        loadedTex.wrapT = THREE.RepeatWrapping;
        loadedTex.needsUpdate = true; 
        loadedTexturesCache.set(url, loadedTex); // Cache on successful load
      },
      undefined, // onProgress callback (optional)
      (err) => { // onError callback
        console.error("Failed to load texture:", url, err);
        // Ensure if a placeholder texture was added to cache due to async nature, it's removed on error
        if(loadedTexturesCache.has(url) && loadedTexturesCache.get(url)?.source.data === undefined){ // Check if it's a dummy/placeholder
           loadedTexturesCache.delete(url);
        }
      }
    );
    // Tentatively cache the texture object. The callbacks above will update/remove it if necessary.
    if (!loadedTexturesCache.has(url)) { 
        loadedTexturesCache.set(url, texture);
    }
    return texture; 
  } catch (error) {
    console.error("Error initiating texture load (e.g., invalid URL format):", url, error);
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
  
  material.transparent = materialData.transparent ?? (materialData.opacity !== undefined && materialData.opacity < 1);
  material.opacity = materialData.opacity ?? 1.0;
  material.ior = materialData.ior ?? 1.5; 

  if (materialData.emissive && materialData.emissive !== '#000000') {
    material.emissive.set(materialData.emissive);
    material.emissiveIntensity = materialData.emissiveIntensity ?? 1.0;
  } else {
    material.emissive.set('#000000');
    material.emissiveIntensity = 0;
  }

  // Clearcoat properties
  material.clearcoat = materialData.clearcoat ?? 0;
  material.clearcoatRoughness = materialData.clearcoatRoughness ?? 0;
  
  // Texture loading
  const newMap = loadTexture(materialData.map);
  if (newMap !== material.map) material.map = newMap;

  const newNormalMap = loadTexture(materialData.normalMap);
  if (newNormalMap !== material.normalMap) {
    material.normalMap = newNormalMap;
  }
  if (material.normalMap && materialData.normalScale) {
    material.normalScale.set(materialData.normalScale[0], materialData.normalScale[1]);
  } else if (material.normalMap) {
    material.normalScale.set(1,1); // Default if scale not provided but map exists
  }


  const newRoughnessMap = loadTexture(materialData.roughnessMap);
  if (newRoughnessMap !== material.roughnessMap) material.roughnessMap = newRoughnessMap;

  const newMetalnessMap = loadTexture(materialData.metalnessMap);
  if (newMetalnessMap !== material.metalnessMap) material.metalnessMap = newMetalnessMap;
  
  const newAoMap = loadTexture(materialData.aoMap);
  if (newAoMap !== material.aoMap) material.aoMap = newAoMap;
  
  const newAlphaMap = loadTexture(materialData.alphaMap);
  if (newAlphaMap !== material.alphaMap) material.alphaMap = newAlphaMap;

  const newDisplacementMap = loadTexture(materialData.displacementMap);
  if (newDisplacementMap !== material.displacementMap) material.displacementMap = newDisplacementMap;
  
  const newClearcoatNormalMap = loadTexture(materialData.clearcoatNormalMap);
  if (newClearcoatNormalMap !== material.clearcoatNormalMap) material.clearcoatNormalMap = newClearcoatNormalMap;

  material.displacementScale = materialData.displacementScale ?? 1.0;
  material.displacementBias = materialData.displacementBias ?? 0.0;
  
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

