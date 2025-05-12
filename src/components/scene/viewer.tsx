"use client";

import type React from 'react';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useScene } from '@/context/scene-context';
import { createPrimitive, updateMeshProperties, createOrUpdateMaterial } from '@/lib/three-utils';
// import type { SceneObject } from '@/types'; // Not directly used here, but through useScene

const SceneViewer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  
  const { 
    objects, 
    ambientLight: ambientLightProps, 
    directionalLight: directionalLightProps,
    selectedObjectId,
    selectObject,
    getMaterialById
  } = useScene();

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0); 
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000); // FOV to 60
    camera.position.set(8, 8, 8); // Slightly further camera
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    rendererRef.current = renderer;
    currentMount.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false; // true can be more intuitive for some
    controls.minDistance = 1;
    controls.maxDistance = 200; // Reduced max distance
    // controls.maxPolarAngle = Math.PI / 2; // Allow looking from slightly below
    controlsRef.current = controls;
    
    // Raycaster for object selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
      
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(sceneRef.current.children.filter(c => c.visible && c.name !== 'gridHelper'), true);


      if (intersects.length > 0) {
        const firstIntersectedObject = intersects[0].object;
        let selectedMesh = firstIntersectedObject;
        while(selectedMesh.parent && selectedMesh.parent !== sceneRef.current && !selectedMesh.name){
          selectedMesh = selectedMesh.parent as THREE.Mesh;
        }
        
        if (selectedMesh.name && objects.find(o => o.id === selectedMesh.name)) { // Check if it's one of our SceneObjects
          selectObject(selectedMesh.name);
        } else {
          selectObject(null); 
        }
      } else {
        selectObject(null); 
      }
    };
    currentMount.addEventListener('click', onMouseClick);

    // Grid Helper
    const gridHelper = new THREE.GridHelper(50, 50, 0xcccccc, 0xdddddd); // Larger grid
    gridHelper.name = 'gridHelper';
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (currentMount && cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = currentMount.clientWidth / currentMount.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeEventListener('click', onMouseClick);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      scene.remove(gridHelper);
      gridHelper.geometry.dispose();
      (gridHelper.material as THREE.Material).dispose();
    };
  }, [selectObject, objects]); // Added objects to dependency array for raycaster scope

  // Update lights
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    let ambientLight = scene.getObjectByName('ambientLight') as THREE.AmbientLight;
    if (!ambientLight) {
      ambientLight = new THREE.AmbientLight(ambientLightProps.color, ambientLightProps.intensity);
      ambientLight.name = 'ambientLight';
      scene.add(ambientLight);
    } else {
      ambientLight.color.set(ambientLightProps.color);
      ambientLight.intensity = ambientLightProps.intensity;
    }

    let directionalLight = scene.getObjectByName('directionalLight') as THREE.DirectionalLight;
    // let dLightHelper = scene.getObjectByName('dLightHelper') as THREE.DirectionalLightHelper; // Helper removed for cleaner look

    if (!directionalLight) {
      directionalLight = new THREE.DirectionalLight(directionalLightProps.color, directionalLightProps.intensity);
      directionalLight.name = 'directionalLight';
      scene.add(directionalLight);
      
      directionalLight.castShadow = directionalLightProps.castShadow;
      directionalLight.shadow.mapSize.width = 2048; // Increased shadow map size
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 50; // Adjust far plane for shadows
      directionalLight.shadow.camera.left = -25;
      directionalLight.shadow.camera.right = 25;
      directionalLight.shadow.camera.top = 25;
      directionalLight.shadow.camera.bottom = -25;
      directionalLight.shadow.bias = directionalLightProps.shadowBias;
    } else {
      directionalLight.color.set(directionalLightProps.color);
      directionalLight.intensity = directionalLightProps.intensity;
      directionalLight.castShadow = directionalLightProps.castShadow;
      directionalLight.shadow.bias = directionalLightProps.shadowBias; // Ensure bias updates
    }
    directionalLight.position.set(...directionalLightProps.position);
    // Ensure target is part of the scene if not already
    if (!directionalLight.target.parent) {
        scene.add(directionalLight.target);
    }
    directionalLight.target.position.set(0, 0, 0); 
    directionalLight.shadow.camera.updateProjectionMatrix();


  }, [ambientLightProps, directionalLightProps]);

  // Manage scene objects based on context
  useEffect(() => {
    if (!sceneRef.current || !getMaterialById) return;
    const scene = sceneRef.current;

    const existingObjectIds = scene.children
      .filter(child => child instanceof THREE.Mesh && child.name && child.name !== 'gridHelper')
      .map(child => child.name);
      
    const contextObjectIds = objects.map(obj => obj.id);

    objects.forEach(objData => {
      let mesh = scene.getObjectByName(objData.id) as THREE.Mesh;
      const materialProps = getMaterialById(objData.materialId);
      if (!materialProps) {
        console.warn(`Material ${objData.materialId} not found for object ${objData.id}, using default.`);
        // Potentially assign a fallback material if desired, or skip render/update.
        // For now, let's assume getMaterialById(DEFAULT_MATERIAL_ID) would work.
        return; 
      }

      if (mesh) { 
        updateMeshProperties(mesh, objData);
        // Ensure material is an array or single, then update
        if(Array.isArray(mesh.material)){
             // Basic: update first material, complex objects might need more logic
            createOrUpdateMaterial(materialProps, mesh.material[0] as THREE.MeshStandardMaterial);
        } else {
            createOrUpdateMaterial(materialProps, mesh.material as THREE.MeshStandardMaterial);
        }
      } else { 
        const material = createOrUpdateMaterial(materialProps);
        mesh = createPrimitive(objData, material);
        scene.add(mesh);
      }
    });

    existingObjectIds.forEach(id => {
      if (!contextObjectIds.includes(id)) {
        const objectToRemove = scene.getObjectByName(id);
        if (objectToRemove) {
          if (objectToRemove instanceof THREE.Mesh) {
            objectToRemove.geometry.dispose();
            if (Array.isArray(objectToRemove.material)) {
              objectToRemove.material.forEach(m => m.dispose());
            } else {
              objectToRemove.material.dispose();
            }
          }
          scene.remove(objectToRemove);
        }
      }
    });

  }, [objects, getMaterialById]);

  // Highlight selected object
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.children.forEach(child => {
      if (child instanceof THREE.Mesh && child.name && child.name !== 'gridHelper') { 
        const isSelected = child.name === selectedObjectId;
        if (Array.isArray(child.material)) {
            // For multi-material objects, this highlight might need to apply to all or be more specific
        } else if (child.material instanceof THREE.MeshStandardMaterial) {
            // Store original emissive if not already stored
            if (!child.userData.originalEmissive) {
                child.userData.originalEmissive = child.material.emissive.clone();
                child.userData.originalEmissiveIntensity = child.material.emissiveIntensity;
            }

            if (isSelected) {
                child.material.emissive.setHex(0x008080); // Teal accent (same as theme)
                child.material.emissiveIntensity = 0.5; // Make highlight noticeable
            } else {
                child.material.emissive.copy(child.userData.originalEmissive);
                child.material.emissiveIntensity = child.userData.originalEmissiveIntensity;
            }
            child.material.needsUpdate = true;
        }
      }
    });
  }, [selectedObjectId, objects]); // Added objects to re-apply highlight if objects change (e.g. material swap)


  return <div ref={mountRef} className="w-full h-full outline-none bg-background" tabIndex={0} />;
};

export default SceneViewer;
