
"use client";

import type React from 'react';
import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { useScene } from '@/context/scene-context';
import { createPrimitive, updateMeshProperties, createOrUpdateMaterial } from '@/lib/three-utils';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import type { SceneObject } from '@/types';
import { DEFAULT_MATERIAL_ID } from '@/types';

const SceneViewer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const tempDrawingMeshRef = useRef<THREE.LineSegments | null>(null); // For visual feedback

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
    drawingState,
    setDrawingState,
    addObject, // Added addObject from context
  } = useScene();

  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const getMousePositionOnXYPlane = useCallback((event: PointerEvent): THREE.Vector3 | null => {
    if (!mountRef.current || !cameraRef.current) return null;
    const rect = mountRef.current.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.current.setFromCamera(mouse.current, cameraRef.current);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // XY plane at Z=0
    const intersectionPoint = new THREE.Vector3();
    if (raycaster.current.ray.intersectPlane(plane, intersectionPoint)) {
      return intersectionPoint;
    }
    return null;
  }, []);


  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1A1A1A); 
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.set(8, 8, 8); 
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    rendererRef.current = renderer;
    currentMount.appendChild(renderer.domElement);

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControlsRef.current = orbitControls;

    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.addEventListener('dragging-changed', (event) => {
      orbitControls.enabled = !event.value;
    });
    transformControls.addEventListener('mouseUp', () => {
      if (transformControls.object) {
        const obj = transformControls.object as THREE.Mesh;
        const sceneObj = objects.find(o => o.id === obj.name);
        if (sceneObj) {
          const newPosition = obj.position.toArray() as [number, number, number];
          const newRotation = [obj.rotation.x, obj.rotation.y, obj.rotation.z] as [number, number, number];
          const newScale = obj.scale.toArray() as [number, number, number];
          const validatedScale: [number, number, number] = [
            Math.max(0.001, newScale[0]),
            Math.max(0.001, newScale[1]),
            Math.max(0.001, newScale[2]),
          ];
          updateObject(obj.name, { position: newPosition, rotation: newRotation, scale: validatedScale });
        }
      }
    });
    transformControls.enabled = false;
    transformControls.visible = false;
    scene.add(transformControls);
    transformControlsRef.current = transformControls;
    
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
    
    // Cleanup previous click listener if any, then add new pointer listeners
    // currentMount.removeEventListener('click', oldOnMouseClick); // Assuming oldOnMouseClick was the previous one
    currentMount.addEventListener('pointerdown', onPointerDown);
    currentMount.addEventListener('pointermove', onPointerMove);
    currentMount.addEventListener('pointerup', onPointerUp);


    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeEventListener('pointerdown', onPointerDown);
      currentMount.removeEventListener('pointermove', onPointerMove);
      currentMount.removeEventListener('pointerup', onPointerUp);
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
      if (tempDrawingMeshRef.current) {
        scene.remove(tempDrawingMeshRef.current);
        tempDrawingMeshRef.current.geometry.dispose();
        (tempDrawingMeshRef.current.material as THREE.Material).dispose();
        tempDrawingMeshRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initial setup, other dependencies will be in their own effects or handlers


  const onPointerDown = useCallback((event: PointerEvent) => {
    if (transformControlsRef.current?.dragging) return;

    if (activeTool === 'rectangle') {
      const point = getMousePositionOnXYPlane(event);
      if (point && sceneRef.current) {
        setDrawingState({ isActive: true, startPoint: point.toArray() as [number,number,number], currentPoint: point.toArray() as [number,number,number] });
        if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;

        // Initialize temporary drawing mesh
        if (tempDrawingMeshRef.current) {
          sceneRef.current.remove(tempDrawingMeshRef.current);
          tempDrawingMeshRef.current.geometry.dispose();
          (tempDrawingMeshRef.current.material as THREE.Material).dispose();
        }
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial({ color: 0xff0000, depthTest: false }); // Red, no depth test to be always visible
        tempDrawingMeshRef.current = new THREE.LineSegments(geometry, material);
        tempDrawingMeshRef.current.renderOrder = 999; // Render on top
        sceneRef.current.add(tempDrawingMeshRef.current);
      }
    }
    // Other tool pointer down logic (if any) can go here
  }, [activeTool, getMousePositionOnXYPlane, setDrawingState]);

  const onPointerMove = useCallback((event: PointerEvent) => {
    if (activeTool === 'rectangle' && drawingState.isActive && drawingState.startPoint && sceneRef.current && tempDrawingMeshRef.current) {
      const currentMovePoint = getMousePositionOnXYPlane(event);
      if (currentMovePoint) {
        setDrawingState({ currentPoint: currentMovePoint.toArray() as [number,number,number] });
        
        const startVec = new THREE.Vector3().fromArray(drawingState.startPoint);
        const endVec = currentMovePoint;

        const points = [
            startVec.x, startVec.y, startVec.z,
            endVec.x, startVec.y, startVec.z,

            endVec.x, startVec.y, startVec.z,
            endVec.x, endVec.y, startVec.z,

            endVec.x, endVec.y, startVec.z,
            startVec.x, endVec.y, startVec.z,

            startVec.x, endVec.y, startVec.z,
            startVec.x, startVec.y, startVec.z,
        ];
        tempDrawingMeshRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
        tempDrawingMeshRef.current.geometry.computeBoundingSphere(); // Important for visibility
      }
    }
    // Other tool pointer move logic
  }, [activeTool, drawingState, getMousePositionOnXYPlane, setDrawingState]);

  const onPointerUp = useCallback((event: PointerEvent) => {
    if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;

    if (activeTool === 'rectangle' && drawingState.isActive && drawingState.startPoint && drawingState.currentPoint) {
      const startPointVec = new THREE.Vector3().fromArray(drawingState.startPoint);
      const endPointVec = new THREE.Vector3().fromArray(drawingState.currentPoint);

      const width = Math.abs(endPointVec.x - startPointVec.x);
      const depth = Math.abs(endPointVec.y - startPointVec.y); // On XY plane, this is the "depth" or "height" of the plane
      
      if (width > 0.01 && depth > 0.01) { // Ensure some minimal size
        const centerX = (startPointVec.x + endPointVec.x) / 2;
        const centerY = (startPointVec.y + endPointVec.y) / 2;
        
        const count = objects.filter(o => o.type === 'plane' && o.name.startsWith("Rectangle")).length + 1;
        addObject('plane', {
          name: `Rectangle ${count}`,
          position: [centerX, centerY, 0], // Position the center of the plane
          rotation: [0, 0, 0],         // No rotation for XY plane
          dimensions: { width, height: depth }, // PlaneGeometry uses width/height for its dimensions
          materialId: DEFAULT_MATERIAL_ID, 
        });
        toast({ title: "Rectangle Drawn", description: `Rectangle ${count} added to scene.` });
      }
      setDrawingState({ isActive: false, startPoint: null, currentPoint: null });
      if (sceneRef.current && tempDrawingMeshRef.current) {
        sceneRef.current.remove(tempDrawingMeshRef.current);
        tempDrawingMeshRef.current.geometry.dispose();
        (tempDrawingMeshRef.current.material as THREE.Material).dispose();
        tempDrawingMeshRef.current = null;
      }
      setActiveTool('select'); // Revert to select tool after drawing
      return; // Drawing action handled, exit
    }

    // Existing click logic for selection, paint, eraser (if not drawing)
    if (!drawingState.isActive && !transformControlsRef.current?.dragging) {
      if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
      
      const rect = mountRef.current.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, cameraRef.current);
      const intersects = raycaster.current.intersectObjects(sceneRef.current.children.filter(c => c.visible && c.name !== 'gridHelper' && !(c instanceof TransformControls)), true);

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
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool, drawingState, getMousePositionOnXYPlane, setDrawingState, addObject, objects, toast, selectObject, activePaintMaterialId, getMaterialById, updateObject, removeObject, setActiveTool]);


  // Update TransformControls based on activeTool and selectedObjectId
  useEffect(() => {
    const tc = transformControlsRef.current;
    if (!tc || !sceneRef.current) return;

    const isDrawingToolActive = activeTool === 'rectangle' || activeTool === 'line' || activeTool === 'arc';

    const selectedMesh = selectedObjectId ? sceneRef.current.getObjectByName(selectedObjectId) as THREE.Mesh : null;

    if (selectedMesh && !isDrawingToolActive && (activeTool === 'move' || activeTool === 'rotate' || activeTool === 'scale')) {
      tc.attach(selectedMesh);
      tc.enabled = true;
      tc.visible = true;
      switch (activeTool) {
        case 'move': tc.mode = 'translate'; break;
        case 'rotate': tc.mode = 'rotate'; break;
        case 'scale': tc.mode = 'scale'; break;
        default: break; 
      }
    } else {
      if(tc.object) tc.detach(); // Detach only if an object is attached
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
      .filter(child => child instanceof THREE.Mesh && child.name && child.name !== 'gridHelper' && child !== tempDrawingMeshRef.current)
      .map(child => child.name);
      
    const contextObjectIds = objects.map(obj => obj.id);

    objects.forEach(objData => {
      let mesh = scene.getObjectByName(objData.id) as THREE.Mesh;
      const materialProps = getMaterialById(objData.materialId);
      if (!materialProps) {
        console.warn(`Material ${objData.materialId} not found for object ${objData.id}, using default.`);
        return; 
      }

      if (mesh) { 
        if (transformControlsRef.current?.object === mesh && transformControlsRef.current?.dragging) {
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
      if (child instanceof THREE.Mesh && child.name && child.name !== 'gridHelper' && child !== tempDrawingMeshRef.current) { 
        const isSelected = child.name === selectedObjectId;
        const isTransforming = transformControlsRef.current?.object === child && transformControlsRef.current?.visible;

        if (Array.isArray(child.material)) {
            // Multi-material highlight needs more specific logic if desired
        } else if (child.material instanceof THREE.MeshStandardMaterial) {
            if (!child.userData.originalEmissive) {
                child.userData.originalEmissive = child.material.emissive.clone();
                child.userData.originalEmissiveIntensity = child.material.emissiveIntensity;
            }

            if (isSelected && !isTransforming) { 
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
  }, [selectedObjectId, objects, activeTool]);


  return <div ref={mountRef} className="w-full h-full outline-none bg-background" tabIndex={0} />;
};

export default SceneViewer;
