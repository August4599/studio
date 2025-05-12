
"use client";

import type React from 'react';
import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { useScene } from '@/context/scene-context';
import { createPrimitive, updateMeshProperties, createOrUpdateMaterial } from '@/lib/three-utils';
import { useToast } from '@/hooks/use-toast';

const SceneViewer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const { toast } = useToast();
  
  const { 
    objects, 
    ambientLight: ambientLightProps, 
    directionalLight: directionalLightProps,
    selectedObjectId,
    selectObject,
    getMaterialById,
    activeTool,
    activePaintMaterialId,
    updateObject,
    removeObject,
    setActiveTool,
  } = useScene();

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1A1A1A); 
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.set(8, 8, 8); 
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    rendererRef.current = renderer;
    currentMount.appendChild(renderer.domElement);

    // OrbitControls
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.screenSpacePanning = false;
    orbitControls.minDistance = 1;
    orbitControls.maxDistance = 200;
    orbitControlsRef.current = orbitControls;

    // TransformControls
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.addEventListener('dragging-changed', (event) => {
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = !event.value;
      }
    });
    transformControls.addEventListener('mouseUp', () => {
      if (transformControls.object) {
        const obj = transformControls.object as THREE.Mesh;
        const sceneObj = objects.find(o => o.id === obj.name);
        if (sceneObj) {
          const newPosition = obj.position.toArray() as [number, number, number];
          // Ensure rotation values are within -PI to PI if necessary, or handle full 360 turns.
          // THREE.Euler stores rotation in radians.
          const newRotation = [obj.rotation.x, obj.rotation.y, obj.rotation.z] as [number, number, number];
          const newScale = obj.scale.toArray() as [number, number, number];
          
          // Prevent scale from being zero or negative, which can cause issues.
          const validatedScale: [number, number, number] = [
            Math.max(0.001, newScale[0]),
            Math.max(0.001, newScale[1]),
            Math.max(0.001, newScale[2]),
          ];

          updateObject(obj.name, {
            position: newPosition,
            rotation: newRotation,
            scale: validatedScale,
          });
        }
      }
    });
    transformControls.enabled = false;
    transformControls.visible = false;
    scene.add(transformControls);
    transformControlsRef.current = transformControls;
    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      if (!mountRef.current || !cameraRef.current || !sceneRef.current || transformControlsRef.current?.dragging) return;
      
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(sceneRef.current.children.filter(c => c.visible && c.name !== 'gridHelper' && !(c instanceof TransformControls)), true);

      if (intersects.length > 0) {
        let firstIntersectedObject = intersects[0].object;
        while(firstIntersectedObject.parent && firstIntersectedObject.parent !== sceneRef.current && !firstIntersectedObject.name){
            firstIntersectedObject = firstIntersectedObject.parent as THREE.Mesh;
        }
        const clickedObjectId = firstIntersectedObject.name;
        const clickedSceneObject = objects.find(o => o.id === clickedObjectId);

        if (clickedSceneObject) {
          if (activeTool === 'paint' && activePaintMaterialId) {
            const materialToApply = getMaterialById(activePaintMaterialId);
            if (materialToApply) {
              updateObject(clickedObjectId, { materialId: activePaintMaterialId });
              toast({ title: "Material Applied", description: `${materialToApply.name || 'Material'} applied to ${clickedSceneObject.name}.` });
            } else {
              toast({ title: "Paint Error", description: "Selected paint material not found.", variant: "destructive" });
            }
          } else if (activeTool === 'eraser') {
            removeObject(clickedObjectId);
            toast({ title: "Object Deleted", description: `${clickedSceneObject.name} removed from scene.` });
            setActiveTool('select'); 
          } else {
            selectObject(clickedObjectId);
          }
        } else {
          if (activeTool !== 'paint' && activeTool !== 'eraser' && activeTool !== 'move' && activeTool !== 'rotate' && activeTool !== 'scale') {
            selectObject(null); 
          }
        }
      } else {
        if (activeTool !== 'paint' && activeTool !== 'eraser' && activeTool !== 'move' && activeTool !== 'rotate' && activeTool !== 'scale') {
            selectObject(null); 
        }
      }
    };
    currentMount.addEventListener('click', onMouseClick);

    const gridHelper = new THREE.GridHelper(50, 50, 0x555555, 0x444444);
    gridHelper.name = 'gridHelper';
    scene.add(gridHelper);

    const animate = () => {
      requestAnimationFrame(animate);
      orbitControls.update();
      renderer.render(scene, camera);
    };
    animate();

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
      orbitControls.dispose();
      transformControls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      scene.remove(gridHelper);
      gridHelper.geometry.dispose();
      (gridHelper.material as THREE.Material).dispose();
      scene.remove(transformControls);
    };
  }, [selectObject, objects, activeTool, activePaintMaterialId, getMaterialById, updateObject, removeObject, setActiveTool, toast]);

  // Update TransformControls based on activeTool and selectedObjectId
  useEffect(() => {
    const tc = transformControlsRef.current;
    if (!tc || !sceneRef.current) return;

    const selectedMesh = selectedObjectId ? sceneRef.current.getObjectByName(selectedObjectId) as THREE.Mesh : null;

    if (selectedMesh && (activeTool === 'move' || activeTool === 'rotate' || activeTool === 'scale')) {
      tc.attach(selectedMesh);
      tc.enabled = true;
      tc.visible = true;
      switch (activeTool) {
        case 'move':
          tc.mode = 'translate';
          break;
        case 'rotate':
          tc.mode = 'rotate';
          break;
        case 'scale':
          tc.mode = 'scale';
          break;
        default:
          break; 
      }
    } else {
      tc.detach();
      tc.enabled = false;
      tc.visible = false;
    }
  }, [activeTool, selectedObjectId]);

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
    if (!directionalLight) {
      directionalLight = new THREE.DirectionalLight(directionalLightProps.color, directionalLightProps.intensity);
      directionalLight.name = 'directionalLight';
      scene.add(directionalLight);
      
      directionalLight.castShadow = directionalLightProps.castShadow;
      directionalLight.shadow.mapSize.width = 2048; 
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 50; 
      directionalLight.shadow.camera.left = -25;
      directionalLight.shadow.camera.right = 25;
      directionalLight.shadow.camera.top = 25;
      directionalLight.shadow.camera.bottom = -25;
      directionalLight.shadow.bias = directionalLightProps.shadowBias;
    } else {
      directionalLight.color.set(directionalLightProps.color);
      directionalLight.intensity = directionalLightProps.intensity;
      directionalLight.castShadow = directionalLightProps.castShadow;
      directionalLight.shadow.bias = directionalLightProps.shadowBias; 
    }
    directionalLight.position.set(...directionalLightProps.position);
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
        // Potentially use a fallback/error material or skip rendering this object
        return; 
      }

      if (mesh) { 
        // If TransformControls are attached to this mesh, don't update its transform from context
        // as TransformControls is now the source of truth until mouseUp.
        if (transformControlsRef.current?.object === mesh && transformControlsRef.current?.dragging) {
            // Skip transform update, only update material
             if(Array.isArray(mesh.material)){
                 createOrUpdateMaterial(materialProps, mesh.material[0] as THREE.MeshStandardMaterial);
             } else {
                 createOrUpdateMaterial(materialProps, mesh.material as THREE.MeshStandardMaterial);
             }
        } else {
            updateMeshProperties(mesh, objData);
            if(Array.isArray(mesh.material)){
                createOrUpdateMaterial(materialProps, mesh.material[0] as THREE.MeshStandardMaterial);
            } else {
                createOrUpdateMaterial(materialProps, mesh.material as THREE.MeshStandardMaterial);
            }
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
          if (transformControlsRef.current?.object === objectToRemove) {
            transformControlsRef.current.detach();
          }
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
        const isTransforming = transformControlsRef.current?.object === child && transformControlsRef.current?.visible;

        if (Array.isArray(child.material)) {
            // Multi-material highlight needs more specific logic if desired
        } else if (child.material instanceof THREE.MeshStandardMaterial) {
            if (!child.userData.originalEmissive) {
                child.userData.originalEmissive = child.material.emissive.clone();
                child.userData.originalEmissiveIntensity = child.material.emissiveIntensity;
            }

            if (isSelected && !isTransforming) { // Highlight only if selected AND not being transformed by gizmo
                child.material.emissive.setHex(0x00B8D9); 
                child.material.emissiveIntensity = 0.7; 
            } else {
                child.material.emissive.copy(child.userData.originalEmissive);
                child.material.emissiveIntensity = child.userData.originalEmissiveIntensity;
            }
            child.material.needsUpdate = true;
        }
      }
    });
  }, [selectedObjectId, objects, activeTool]); // activeTool dependency to re-evaluate highlight when gizmo appears/disappears


  return <div ref={mountRef} className="w-full h-full outline-none bg-background" tabIndex={0} />;
};

export default SceneViewer;

