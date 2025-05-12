
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
        dimensions.heightSegments || 1
      );
      break;
    case 'plane':
      geometry = new THREE.PlaneGeometry(dimensions.width || 10, dimensions.height || 10);
      break;
    default:
      throw new Error(`Unsupported primitive type: ${type}`);
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = objectData.id; // Use SceneObject ID for Three.js object name for easy lookup
  mesh.position.set(...objectData.position);
  mesh.rotation.set(...objectData.rotation);
  mesh.scale.set(...objectData.scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  if (type === 'plane') { // Planes are often horizontal, rotate them
    mesh.rotation.x = -Math.PI / 2;
  }

  return mesh;
}

export function updateMeshProperties(mesh: THREE.Mesh, objectData: SceneObject) {
  mesh.position.set(...objectData.position);
  mesh.rotation.set(...objectData.rotation);
  mesh.scale.set(...objectData.scale);

  // Update geometry if dimensions change
  const { type, dimensions } = objectData;
  let newGeometry: THREE.BufferGeometry | undefined;

  // This is a simplified update. For production, you'd want to be more careful about performance.
  // Disposing old geometry is important.
  if (mesh.geometry) {
     const oldGeomParams = (mesh.geometry as any).parameters;
     let dimensionsChanged = false;
     switch (type) {
        case 'cube':
            if(oldGeomParams.width !== dimensions.width || oldGeomParams.height !== dimensions.height || oldGeomParams.depth !== dimensions.depth) dimensionsChanged = true;
            if(dimensionsChanged) newGeometry = new THREE.BoxGeometry(dimensions.width || 1, dimensions.height || 1, dimensions.depth || 1);
            break;
        case 'cylinder':
            if(oldGeomParams.radiusTop !== dimensions.radiusTop || oldGeomParams.radiusBottom !== dimensions.radiusBottom || oldGeomParams.height !== dimensions.height || oldGeomParams.radialSegments !== dimensions.radialSegments) dimensionsChanged = true;
            if(dimensionsChanged) newGeometry = new THREE.CylinderGeometry(dimensions.radiusTop || 0.5, dimensions.radiusBottom || 0.5, dimensions.height || 1, dimensions.radialSegments || 32);
            break;
        case 'plane':
            if(oldGeomParams.width !== dimensions.width || oldGeomParams.height !== dimensions.height) dimensionsChanged = true;
            if(dimensionsChanged) newGeometry = new THREE.PlaneGeometry(dimensions.width || 10, dimensions.height || 10);
            break;
     }
     if (newGeometry) {
        mesh.geometry.dispose();
        mesh.geometry = newGeometry;
     }
  }
}

const textureLoader = new THREE.TextureLoader();

function loadTexture(url: string | undefined): THREE.Texture | null {
  if (!url) return null;
  try {
    const texture = textureLoader.load(url);
    texture.colorSpace = THREE.SRGBColorSpace; // Ensure correct color space for sRGB textures
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  } catch (error) {
    console.error("Failed to load texture:", url, error);
    return null;
  }
}

export function createOrUpdateMaterial(
  materialData: MaterialProperties,
  existingMaterial?: THREE.MeshStandardMaterial
): THREE.MeshStandardMaterial {
  const material = existingMaterial || new THREE.MeshStandardMaterial();

  material.color = new THREE.Color(materialData.color);
  material.roughness = materialData.roughness;
  material.metalness = materialData.metalness;

  material.map = loadTexture(materialData.map) || material.map || null;
  material.normalMap = loadTexture(materialData.normalMap) || material.normalMap || null;
  material.roughnessMap = loadTexture(materialData.roughnessMap) || material.roughnessMap || null;
  material.metalnessMap = loadTexture(materialData.metalnessMap) || material.metalnessMap || null;
  material.aoMap = loadTexture(materialData.aoMap) || material.aoMap || null;
  
  // If aoMap is present, it typically requires a second set of UVs
  if (material.aoMap && material instanceof THREE.MeshStandardMaterial) {
    // This assumes the geometry has 'uv2' attribute.
    // You might need to add it to your geometries if not present by default.
    // e.g., geometry.attributes.uv2 = geometry.attributes.uv;
  }

  material.needsUpdate = true;
  return material;
}

// Helper to convert File to data URL for texture preview / loading
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}
