"use client";

import type React from 'react';
import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useScene } from '@/context/scene-context';
import { createPrimitive, updateMeshProperties, createOrUpdateMaterial } from '@/lib/three-utils';
import type { SceneObject } from '@/types';

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
    scene.background = new THREE.Color(0xf0f0f0); // Match primary color
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.set(5, 5, 5);
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
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI / 2;
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
      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

      if (intersects.length > 0) {
        const firstIntersectedObject = intersects[0].object;
        // Traverse up to find the named group (our SceneObject representation)
        let selectedMesh = firstIntersectedObject;
        while(selectedMesh.parent && selectedMesh.parent !== sceneRef.current && !selectedMesh.name){
          selectedMesh = selectedMesh.parent as THREE.Mesh;
        }
        
        if (selectedMesh.name) { // Our meshes have SceneObject ID as name
          selectObject(selectedMesh.name);
        } else {
          selectObject(null); // Clicked on something without a name (e.g. light helper) or empty space
        }
      } else {
        selectObject(null); // Clicked on empty space
      }
    };
    currentMount.addEventListener('click', onMouseClick);


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
      // Dispose geometries and materials if needed here, though managed by object updates below
    };
  }, [selectObject]);

  // Update lights
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Ambient Light
    let ambientLight = scene.getObjectByName('ambientLight') as THREE.AmbientLight;
    if (!ambientLight) {
      ambientLight = new THREE.AmbientLight(ambientLightProps.color, ambientLightProps.intensity);
      ambientLight.name = 'ambientLight';
      scene.add(ambientLight);
    } else {
      ambientLight.color.set(ambientLightProps.color);
      ambientLight.intensity = ambientLightProps.intensity;
    }

    // Directional Light
    let directionalLight = scene.getObjectByName('directionalLight') as THREE.DirectionalLight;
    let dLightHelper = scene.getObjectByName('dLightHelper') as THREE.DirectionalLightHelper;

    if (!directionalLight) {
      directionalLight = new THREE.DirectionalLight(directionalLightProps.color, directionalLightProps.intensity);
      directionalLight.name = 'directionalLight';
      scene.add(directionalLight);
      
      // Shadow properties for directional light
      directionalLight.castShadow = directionalLightProps.castShadow;
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 50;
      directionalLight.shadow.bias = directionalLightProps.shadowBias;

      // dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
      // dLightHelper.name = 'dLightHelper';
      // scene.add(dLightHelper);

    } else {
      directionalLight.color.set(directionalLightProps.color);
      directionalLight.intensity = directionalLightProps.intensity;
      directionalLight.castShadow = directionalLightProps.castShadow;
      directionalLight.shadow.bias = directionalLightProps.shadowBias;
    }
    directionalLight.position.set(...directionalLightProps.position);
    directionalLight.target.position.set(0, 0, 0); // Point towards origin
    scene.add(directionalLight.target); // Target needs to be added to scene
    
    // if (dLightHelper) {
    //   dLightHelper.update();
    // }

  }, [ambientLightProps, directionalLightProps]);

  // Manage scene objects based on context
  useEffect(() => {
    if (!sceneRef.current || !getMaterialById) return;
    const scene = sceneRef.current;

    // Sync objects: Add new, update existing, remove old
    const existingObjectIds = scene.children
      .filter(child => child instanceof THREE.Mesh && child.name) // Filter for our named meshes
      .map(child => child.name);
      
    const contextObjectIds = objects.map(obj => obj.id);

    // Add/Update objects
    objects.forEach(objData => {
      let mesh = scene.getObjectByName(objData.id) as THREE.Mesh;
      const materialProps = getMaterialById(objData.materialId);
      if (!materialProps) {
        console.warn(`Material ${objData.materialId} not found for object ${objData.id}`);
        return; // Skip if material doesn't exist
      }

      if (mesh) { // Update existing
        updateMeshProperties(mesh, objData);
        createOrUpdateMaterial(materialProps, mesh.material as THREE.MeshStandardMaterial);
      } else { // Add new
        const material = createOrUpdateMaterial(materialProps);
        mesh = createPrimitive(objData, material);
        scene.add(mesh);
      }
    });

    // Remove objects no longer in context
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

  // Highlight selected object (optional, simple outline or wireframe)
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.children.forEach(child => {
      if (child instanceof THREE.Mesh && child.name) { // Our named meshes
        const isSelected = child.name === selectedObjectId;
        // Basic "highlight": change emissive color slightly
        // More advanced highlighting would use an OutlinePass or similar
        if (Array.isArray(child.material)) {
            // This example doesn't handle multi-material objects well for highlighting.
        } else if (child.material instanceof THREE.MeshStandardMaterial) {
            if (isSelected) {
                (child.material as THREE.MeshStandardMaterial).emissive.setHex(0x008080); // Teal accent
                (child.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3;
            } else {
                (child.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
                (child.material as THREE.MeshStandardMaterial).emissiveIntensity = 1;
            }
            child.material.needsUpdate = true;
        }
      }
    });
  }, [selectedObjectId]);


  return <div ref={mountRef} className="w-full h-full outline-none" tabIndex={0} />;
};

export default SceneViewer;
