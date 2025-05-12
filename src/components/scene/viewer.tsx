"use client";

import type React from 'react';
import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { useScene } from '@/context/scene-context';
import { createPrimitive, updateMeshProperties, createOrUpdateMaterial } from '@/lib/three-utils';
import { useToast } from '@/hooks/use-toast';
// import { v4 as uuidv4 } from 'uuid'; // No longer directly used here
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
    addObject,
  } = useScene();

  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const getMousePositionOnXZPlane = useCallback((event: PointerEvent): THREE.Vector3 | null => {
    if (!mountRef.current || !cameraRef.current) return null;
    const rect = mountRef.current.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.current.setFromCamera(mouse.current, cameraRef.current);
    // Plane is XZ at Y=0, normal pointing up along +Y
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); 
    const intersectionPoint = new THREE.Vector3();
    if (raycaster.current.ray.intersectPlane(plane, intersectionPoint)) {
      return intersectionPoint;
    }
    return null;
  }, []);


  // Initialize Three.js scene, camera, renderer, controls (runs once)
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
        const sceneObj = objects.find(o => o.id === obj.name); // `objects` in closure
        if (sceneObj) {
          const newPosition = obj.position.toArray() as [number, number, number];
          const newRotation = [obj.rotation.x, obj.rotation.y, obj.rotation.z] as [number, number, number];
          const newScale = obj.scale.toArray() as [number, number, number];
          const validatedScale: [number, number, number] = [
            Math.max(0.001, newScale[0]),
            Math.max(0.001, newScale[1]),
            Math.max(0.001, newScale[2]),
          ];
          // `updateObject` in closure, uses setSceneData(prev => ...) so it's safe
          updateObject(obj.name, { position: newPosition, rotation: newRotation, scale: validatedScale });
        }
      }
    });
    transformControls.enabled = false;
    transformControls.visible = false;
    scene.add(transformControls);
    transformControlsRef.current = transformControls;
    
    const gridHelper = new THREE.GridHelper(50, 50, 0x555555, 0x444444); // Grid is on XZ plane
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
      orbitControls.dispose();
      transformControls.dispose(); // Listeners on it are also implicitly removed
      renderer.dispose();
      if (renderer.domElement.parentNode === currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      scene.remove(gridHelper);
      gridHelper.geometry.dispose();
      (gridHelper.material as THREE.Material).dispose();
      scene.remove(transformControls);
      
      if (tempDrawingMeshRef.current && sceneRef.current) {
        sceneRef.current.remove(tempDrawingMeshRef.current);
        tempDrawingMeshRef.current.geometry.dispose();
        (tempDrawingMeshRef.current.material as THREE.Material).dispose();
        tempDrawingMeshRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // `objects` and `updateObject` are used in TC listener, but updateObject uses functional update.


  const onPointerDown = useCallback((event: PointerEvent) => {
    if (transformControlsRef.current?.dragging) return;

    if (activeTool === 'rectangle') {
      const point = getMousePositionOnXZPlane(event); // Use XZ plane
      if (point && sceneRef.current) {
        setDrawingState({ isActive: true, startPoint: point.toArray() as [number,number,number], currentPoint: point.toArray() as [number,number,number], tool: 'rectangle' });
        if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;

        if (tempDrawingMeshRef.current) {
          sceneRef.current.remove(tempDrawingMeshRef.current);
          tempDrawingMeshRef.current.geometry.dispose();
          (tempDrawingMeshRef.current.material as THREE.Material).dispose();
        }
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial({ color: 0xff0000, depthTest: false, transparent: true, opacity: 0.7 });
        tempDrawingMeshRef.current = new THREE.LineSegments(geometry, material);
        tempDrawingMeshRef.current.renderOrder = 999; 
        sceneRef.current.add(tempDrawingMeshRef.current);
      }
    }
  }, [activeTool, getMousePositionOnXZPlane, setDrawingState]);

  const onPointerMove = useCallback((event: PointerEvent) => {
    if (activeTool === 'rectangle' && drawingState.isActive && drawingState.startPoint && sceneRef.current && tempDrawingMeshRef.current) {
      const currentMovePoint = getMousePositionOnXZPlane(event); // Use XZ plane
      if (currentMovePoint) {
        setDrawingState({ currentPoint: currentMovePoint.toArray() as [number,number,number] });
        
        const startVec = new THREE.Vector3().fromArray(drawingState.startPoint); // e.g. [sx, 0, sz]
        const endVec = currentMovePoint; // e.g. [ex, 0, ez]

        // Points are on the XZ plane (Y is constant, usually 0)
        const points = [
            startVec.x, startVec.y, startVec.z,   endVec.x, startVec.y, startVec.z,
            endVec.x, startVec.y, startVec.z,     endVec.x, endVec.y, endVec.z, // endVec.y is same as startVec.y
            endVec.x, endVec.y, endVec.z,         startVec.x, endVec.y, endVec.z,
            startVec.x, endVec.y, endVec.z,       startVec.x, startVec.y, startVec.z,
        ];
        tempDrawingMeshRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
        tempDrawingMeshRef.current.geometry.computeBoundingSphere(); 
      }
    }
  }, [activeTool, drawingState, getMousePositionOnXZPlane, setDrawingState]);

  const onPointerUp = useCallback((event: PointerEvent) => {
    if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;

    if (activeTool === 'rectangle' && drawingState.isActive && drawingState.startPoint && drawingState.currentPoint) {
      const startPointVec = new THREE.Vector3().fromArray(drawingState.startPoint); // [x1, yPlane, z1]
      const endPointVec = new THREE.Vector3().fromArray(drawingState.currentPoint);   // [x2, yPlane, z2]

      const rectWidth = Math.abs(endPointVec.x - startPointVec.x); // Extent along world X
      const rectDepth = Math.abs(endPointVec.z - startPointVec.z); // Extent along world Z
      
      if (rectWidth > 0.01 && rectDepth > 0.01) { 
        const centerX = (startPointVec.x + endPointVec.x) / 2;
        const centerZ = (startPointVec.z + endPointVec.z) / 2;
        const planeYPosition = startPointVec.y; // Y position of the XZ plane, typically 0
        
        const count = objects.filter(o => o.type === 'plane' && o.name.startsWith("Rectangle")).length + 1;
        addObject('plane', {
          name: `Rectangle ${count}`,
          position: [centerX, planeYPosition, centerZ], 
          rotation: [-Math.PI / 2, 0, 0],      // Rotate default XY plane to lie on XZ
          dimensions: { width: rectWidth, height: rectDepth }, // PlaneGeometry's width -> world X, height -> world Z
          materialId: DEFAULT_MATERIAL_ID, 
        });
        toast({ title: "Rectangle Drawn", description: `Rectangle ${count} added to scene.` });
      }
      setDrawingState({ isActive: false, startPoint: null, currentPoint: null, tool: null });
      if (sceneRef.current && tempDrawingMeshRef.current) {
        sceneRef.current.remove(tempDrawingMeshRef.current);
        tempDrawingMeshRef.current.geometry.dispose();
        (tempDrawingMeshRef.current.material as THREE.Material).dispose();
        tempDrawingMeshRef.current = null;
      }
      setActiveTool('select'); 
      return; 
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
          } else { // Includes 'select', 'move', 'rotate', 'scale'
            selectObject(clickedObjectId);
            // Transform controls attachment is handled by a separate useEffect
          }
        } else { // Clicked on empty space
          if (activeTool === 'select' || activeTool === 'move' || activeTool === 'rotate' || activeTool === 'scale') {
             selectObject(null);
          }
        }
      } else { // Clicked on empty space
         if (activeTool === 'select' || activeTool === 'move' || activeTool === 'rotate' || activeTool === 'scale') {
            selectObject(null);
         }
      }
    }
  }, [activeTool, drawingState, getMousePositionOnXZPlane, setDrawingState, addObject, objects, toast, selectObject, activePaintMaterialId, getMaterialById, updateObject, removeObject, setActiveTool]);


  // Effect for attaching and managing pointer event listeners
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    currentMount.addEventListener('pointerdown', onPointerDown);
    currentMount.addEventListener('pointermove', onPointerMove);
    currentMount.addEventListener('pointerup', onPointerUp);

    return () => {
      currentMount.removeEventListener('pointerdown', onPointerDown);
      currentMount.removeEventListener('pointermove', onPointerMove);
      currentMount.removeEventListener('pointerup', onPointerUp);
    };
  }, [onPointerDown, onPointerMove, onPointerUp]);


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
      if(tc.object) tc.detach(); 
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

    const existingObjectIdsInThree = scene.children
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
        // Check if this mesh is being transformed
        const isTransforming = transformControlsRef.current?.object === mesh && transformControlsRef.current?.dragging;
        
        if (!isTransforming) { // Only update if not actively being transformed by TransformControls
          updateMeshProperties(mesh, objData);
        }
        // Always update material, even if transforming, in case material itself changed
        if(Array.isArray(mesh.material)){
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

    existingObjectIdsInThree.forEach(id => {
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

  }, [objects, getMaterialById]); // Removed transformControlsRef.current from deps to avoid loop, transformation updates are handled by TC mouseUp

  // Highlight selected object
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.children.forEach(child => {
      if (child instanceof THREE.Mesh && child.name && child.name !== 'gridHelper' && child !== tempDrawingMeshRef.current) { 
        const isSelected = child.name === selectedObjectId;
        const isTransforming = transformControlsRef.current?.object === child && transformControlsRef.current?.visible && transformControlsRef.current.dragging;

        if (Array.isArray(child.material)) {
            // Multi-material highlight needs more specific logic if desired
        } else if (child.material instanceof THREE.MeshStandardMaterial) {
            if (child.userData.originalEmissive === undefined) { // Check if undefined, not just falsy
                child.userData.originalEmissive = child.material.emissive.clone();
            }
             if (child.userData.originalEmissiveIntensity === undefined) {
                child.userData.originalEmissiveIntensity = child.material.emissiveIntensity;
            }


            if (isSelected && !isTransforming) { 
                child.material.emissive.setHex(0x00B8D9); 
                child.material.emissiveIntensity = 0.7; 
            } else {
                if (child.userData.originalEmissive) child.material.emissive.copy(child.userData.originalEmissive);
                child.material.emissiveIntensity = child.userData.originalEmissiveIntensity ?? 0;
            }
            child.material.needsUpdate = true;
        }
      }
    });
  }, [selectedObjectId, activeTool]); // Re-evaluate selection highlight when selectedObjectId or activeTool changes


  return <div ref={mountRef} className="w-full h-full outline-none bg-background" tabIndex={0} />;
};

export default SceneViewer;
