
"use client";

import type React from 'react';
import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { useScene } from '@/context/scene-context';
import { createPrimitive, updateMeshProperties, createOrUpdateMaterial } from '@/lib/three-utils';
import { useToast } from '@/hooks/use-toast';
import type { SceneObject, PushPullFaceInfo, PrimitiveType, SceneObjectDimensions } from '@/types';
import { DEFAULT_MATERIAL_ID } from '@/types';

const SceneViewer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  
  const tempDrawingMeshRef = useRef<THREE.LineSegments | null>(null);
  const tempMeasureLineRef = useRef<THREE.Line | null>(null); // For tape measure tool

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

  const getMouseIntersection = useCallback((event: PointerEvent, targetPlane?: THREE.Plane): { point: THREE.Vector3, object?: THREE.Object3D, face?: THREE.Face, normal?: THREE.Vector3 } | null => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return null;
    const rect = mountRef.current.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.current.setFromCamera(mouse.current, cameraRef.current);

    if (targetPlane) {
        const intersectionPoint = new THREE.Vector3();
        if (raycaster.current.ray.intersectPlane(targetPlane, intersectionPoint)) {
            return { point: intersectionPoint };
        }
        return null;
    }

    const intersects = raycaster.current.intersectObjects(sceneRef.current.children.filter(c => c.visible && c.name !== 'gridHelper' && !(c instanceof TransformControls) && !(c === tempDrawingMeshRef.current) && !(c === tempMeasureLineRef.current) ), true);
    if (intersects.length > 0) {
        let firstIntersectedObject = intersects[0].object;
        // Traverse up to find the named scene object (the direct child of the scene)
        while(firstIntersectedObject.parent && firstIntersectedObject.parent !== sceneRef.current && !firstIntersectedObject.name){
            firstIntersectedObject = firstIntersectedObject.parent as THREE.Mesh;
        }
        return { 
            point: intersects[0].point, 
            object: firstIntersectedObject, 
            face: intersects[0].face || undefined, 
            normal: intersects[0].face?.normal || undefined
        };
    }
    return null;
  }, []);


  const getMousePositionOnXZPlane = useCallback((event: PointerEvent): THREE.Vector3 | null => {
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); 
    const intersection = getMouseIntersection(event, plane);
    return intersection ? intersection.point : null;
  }, [getMouseIntersection]);


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
    
    return () => {
      window.removeEventListener('resize', handleResize);
      orbitControls.dispose();
      transformControls.dispose();
      renderer.dispose();
      if (currentMount && renderer.domElement.parentNode === currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      if (gridHelper) {
        scene.remove(gridHelper);
        gridHelper.geometry.dispose();
        (gridHelper.material as THREE.Material).dispose();
      }
      scene.remove(transformControls);
      
      if (tempDrawingMeshRef.current && sceneRef.current) {
        sceneRef.current.remove(tempDrawingMeshRef.current);
        tempDrawingMeshRef.current.geometry.dispose();
        (tempDrawingMeshRef.current.material as THREE.Material).dispose();
        tempDrawingMeshRef.current = null;
      }
      if (tempMeasureLineRef.current && sceneRef.current) {
        sceneRef.current.remove(tempMeasureLineRef.current);
        tempMeasureLineRef.current.geometry.dispose();
        (tempMeasureLineRef.current.material as THREE.Material).dispose();
        tempMeasureLineRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 


  const onPointerDown = useCallback((event: PointerEvent) => {
    if (transformControlsRef.current?.dragging) return;

    const intersection = getMouseIntersection(event);

    if (activeTool === 'rectangle') {
      const point = getMousePositionOnXZPlane(event);
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
    } else if (activeTool === 'tape') {
        const point = getMousePositionOnXZPlane(event); // For simplicity, tape measure on XZ plane. Can be extended.
        if (point && sceneRef.current) {
            if (!drawingState.startPoint) { 
                setDrawingState({ 
                    isActive: true, 
                    startPoint: point.toArray() as [number,number,number], 
                    currentPoint: point.toArray() as [number,number,number],
                    tool: 'tape' 
                });
                if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;

                if (tempMeasureLineRef.current) { 
                    sceneRef.current.remove(tempMeasureLineRef.current);
                    tempMeasureLineRef.current.geometry.dispose();
                    (tempMeasureLineRef.current.material as THREE.Material).dispose();
                }
                const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, depthTest: false, transparent: true, opacity: 0.9 });
                lineMaterial.renderOrder = 1000; 
                const lineGeometry = new THREE.BufferGeometry().setFromPoints([point, point.clone()]);
                tempMeasureLineRef.current = new THREE.Line(lineGeometry, lineMaterial);
                sceneRef.current.add(tempMeasureLineRef.current);

            } else { 
                const startVec = new THREE.Vector3().fromArray(drawingState.startPoint);
                const distance = startVec.distanceTo(point);
                setDrawingState({ 
                    isActive: false, 
                    currentPoint: point.toArray() as [number,number,number], 
                    measureDistance: distance 
                });
                
                toast({
                    title: "Measurement Complete",
                    description: `Distance: ${distance.toFixed(3)} units`,
                });
                
                 if (tempMeasureLineRef.current && sceneRef.current) {
                     sceneRef.current.remove(tempMeasureLineRef.current);
                     tempMeasureLineRef.current.geometry.dispose();
                     (tempMeasureLineRef.current.material as THREE.Material).dispose();
                     tempMeasureLineRef.current = null;
                 }
                setDrawingState({ isActive: false, startPoint: null, currentPoint: null, tool: null, measureDistance: null }); 
                if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;
                setActiveTool('select');
            }
        }
    } else if (activeTool === 'pushpull') {
        if (intersection && intersection.object && intersection.face && intersection.normal && sceneRef.current) {
            const clickedMesh = intersection.object as THREE.Mesh;
            const clickedObjectId = clickedMesh.name;
            const clickedSceneObject = objects.find(o => o.id === clickedObjectId);

            if (clickedSceneObject && (clickedSceneObject.type === 'cube' || clickedSceneObject.type === 'plane')) {
                const localFaceNormal = intersection.face.normal.clone(); // Normal is in geometry's local space
                // Transform localFaceNormal to object's local space if geometry is offset/rotated within object
                // For simple BoxGeometry/PlaneGeometry, this is often identity if not transformed.
                // Then transform to world space:
                const worldFaceNormal = localFaceNormal.clone().applyMatrix3(clickedMesh.normalMatrix).normalize();
                
                // Initial intersection point in object's local space
                const initialLocalIntersectPoint = clickedMesh.worldToLocal(intersection.point.clone());

                const pushPullInfo: PushPullFaceInfo = {
                    objectId: clickedObjectId,
                    initialMeshWorldPosition: clickedMesh.position.toArray() as [number, number, number],
                    initialLocalIntersectPoint: initialLocalIntersectPoint.toArray() as [number,number,number],
                    initialWorldIntersectionPoint: intersection.point.toArray() as [number, number, number], // Store this
                    localFaceNormal: localFaceNormal.toArray() as [number,number,number],
                    worldFaceNormal: worldFaceNormal.toArray() as [number,number,number],
                    originalDimensions: { ...clickedSceneObject.dimensions },
                    originalPosition: [...clickedSceneObject.position] as [number, number, number],
                    originalRotation: [...clickedSceneObject.rotation] as [number, number, number],
                    originalType: clickedSceneObject.type,
                };
                setDrawingState({ 
                    isActive: true, 
                    tool: 'pushpull', 
                    pushPullFaceInfo: pushPullInfo 
                });
                if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;
                selectObject(clickedObjectId); 
                toast({ title: "Push/Pull Started", description: `Interacting with ${clickedSceneObject.name}. Drag to modify.` });
            } else {
                toast({ title: "Push/Pull Tool", description: "Select a face of a Cube or Rectangle (Plane) to push/pull.", variant: "default" });
            }
        } else {
             toast({ title: "Push/Pull Tool", description: "Click on a face of a Cube or Rectangle.", variant: "default" });
        }
    }


  }, [activeTool, getMouseIntersection, getMousePositionOnXZPlane, setDrawingState, drawingState, toast, setActiveTool, objects, selectObject]);

  const onPointerMove = useCallback((event: PointerEvent) => {
    if (activeTool === 'rectangle' && drawingState.isActive && drawingState.startPoint && sceneRef.current && tempDrawingMeshRef.current) {
      const currentMovePoint = getMousePositionOnXZPlane(event);
      if (currentMovePoint) {
        setDrawingState({ currentPoint: currentMovePoint.toArray() as [number,number,number] });
        
        const startVec = new THREE.Vector3().fromArray(drawingState.startPoint);
        const endVec = currentMovePoint;

        const points = [
            startVec.x, startVec.y, startVec.z,   endVec.x, startVec.y, startVec.z,
            endVec.x, startVec.y, startVec.z,     endVec.x, startVec.y, endVec.z, 
            endVec.x, startVec.y, endVec.z,         startVec.x, startVec.y, endVec.z,
            startVec.x, startVec.y, endVec.z,       startVec.x, startVec.y, startVec.z,
        ];
        tempDrawingMeshRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
        tempDrawingMeshRef.current.geometry.computeBoundingSphere(); 
      }
    } else if (activeTool === 'tape' && drawingState.isActive && drawingState.startPoint && !drawingState.measureDistance && sceneRef.current && tempMeasureLineRef.current) {
        const currentMovePoint = getMousePositionOnXZPlane(event);
        if (currentMovePoint) {
            setDrawingState({ currentPoint: currentMovePoint.toArray() as [number,number,number] });
            const startVec = new THREE.Vector3().fromArray(drawingState.startPoint);
            tempMeasureLineRef.current.geometry.setFromPoints([startVec, currentMovePoint]);
            tempMeasureLineRef.current.geometry.computeBoundingSphere();
        }
    } else if (activeTool === 'pushpull' && drawingState.isActive && drawingState.pushPullFaceInfo && cameraRef.current && sceneRef.current) {
        const { objectId, initialWorldIntersectionPoint, worldFaceNormal, originalDimensions, originalPosition, originalRotation, originalType } = drawingState.pushPullFaceInfo;
        
        const initialWorldIntersectVec = new THREE.Vector3().fromArray(initialWorldIntersectionPoint);
        const worldFaceNormalVec = new THREE.Vector3().fromArray(worldFaceNormal);

        const targetPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(
            worldFaceNormalVec,
            initialWorldIntersectVec
        );
        
        const currentIntersection = getMouseIntersection(event, targetPlane);

        if (currentIntersection) {
            const dragVector = currentIntersection.point.clone().sub(initialWorldIntersectVec);
            let pushPullAmount = dragVector.dot(worldFaceNormalVec); // Signed displacement

            const sensitivityFactor = 15; // Increased sensitivity
            pushPullAmount *= sensitivityFactor;


            let newDimensions: SceneObjectDimensions = { ...originalDimensions };
            let newPositionArray = [...originalPosition] as [number, number, number];
            let newRotationArray: [number, number, number] | undefined = [...originalRotation] as [number,number,number]; // Keep original rotation by default
            let newType: PrimitiveType = originalType;

            if (originalType === 'cube') {
                const localNormalVec = new THREE.Vector3().fromArray(drawingState.pushPullFaceInfo.localFaceNormal);
                
                const absX = Math.abs(localNormalVec.x);
                const absY = Math.abs(localNormalVec.y);
                const absZ = Math.abs(localNormalVec.z);

                if (absX > absY && absX > absZ) { // X-face
                    newDimensions.width = Math.max(0.01, (originalDimensions.width || 1) + pushPullAmount * Math.sign(localNormalVec.x) );
                } else if (absY > absX && absY > absZ) { // Y-face
                    newDimensions.height = Math.max(0.01, (originalDimensions.height || 1) + pushPullAmount * Math.sign(localNormalVec.y));
                } else { // Z-face
                    newDimensions.depth = Math.max(0.01, (originalDimensions.depth || 1) + pushPullAmount * Math.sign(localNormalVec.z));
                }
                
                // Adjust position so the opposite face stays anchored
                const offsetDir = localNormalVec.clone().applyQuaternion(new THREE.Quaternion().setFromEuler(new THREE.Euler(...originalRotation))).normalize();
                const positionOffset = offsetDir.multiplyScalar(pushPullAmount / 2);
                
                newPositionArray = [
                    originalPosition[0] + positionOffset.x,
                    originalPosition[1] + positionOffset.y,
                    originalPosition[2] + positionOffset.z,
                ];

            } else if (originalType === 'plane') {
                newType = 'cube';
                const extrusionHeight = Math.max(0.01, Math.abs(pushPullAmount));
                
                // Assuming plane created by rectangle tool is XZ, so its 'height' dimension is along Z
                newDimensions = {
                    width: originalDimensions.width || 1, 
                    depth: originalDimensions.height || 1, // Using plane's "height" as depth for the new cube
                    height: extrusionHeight, 
                };
                
                // Adjust position based on extrusion direction (worldFaceNormal)
                // The offset is half the signed pushPullAmount along the world normal
                const extrusionOffset = worldFaceNormalVec.clone().multiplyScalar(pushPullAmount / 2);
                newPositionArray = [
                    originalPosition[0] + extrusionOffset.x,
                    originalPosition[1] + extrusionOffset.y,
                    originalPosition[2] + extrusionOffset.z,
                ];
                // When a plane is extruded, its original rotation (likely to make it XZ) is no longer needed for the cube.
                // The cube should be aligned with world axes.
                // However, if the plane itself was rotated (other than for XZ alignment), we might want to preserve that.
                // For now, resetting to [0,0,0] for simplicity when extruding from a rectangle tool plane.
                // If the original plane was XZ (rotation [-PI/2, 0, 0]), the new cube will be axis aligned.
                // If the original plane had arbitrary rotation, this might need more complex handling.
                if(originalRotation[0] === -Math.PI / 2 && originalRotation[1] === 0 && originalRotation[2] === 0){
                    newRotationArray = [0,0,0];
                } else {
                    // Try to maintain original orientation for the new cube's base
                    // This can be tricky. For now, if it wasn't a simple XZ plane, keep its rotation.
                    // This means the extrusion happens along the plane's original local Y, but transformed to world.
                    // This part could be refined. For simplicity, if it's a rect-tool plane, assume it becomes an axis-aligned cube.
                    // If it was an arbitrarily rotated plane to start, the concept of push/pull on it is more complex.
                }
            }
            
            const updates: Partial<SceneObject> = { dimensions: newDimensions, position: newPositionArray, rotation: newRotationArray };
            if (newType !== originalType) updates.type = newType;
            
            updateObject(objectId, updates);
        }
    }

  }, [activeTool, drawingState, getMousePositionOnXZPlane, getMouseIntersection, setDrawingState, updateObject, cameraRef]);

  const onPointerUp = useCallback((event: PointerEvent) => {
    if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;

    if (activeTool === 'rectangle' && drawingState.isActive && drawingState.startPoint && drawingState.currentPoint) {
      const startPointVec = new THREE.Vector3().fromArray(drawingState.startPoint);
      const endPointVec = new THREE.Vector3().fromArray(drawingState.currentPoint);

      const rectWidth = Math.abs(endPointVec.x - startPointVec.x);
      const rectDepth = Math.abs(endPointVec.z - startPointVec.z);
      
      if (rectWidth > 0.01 && rectDepth > 0.01) { 
        const centerX = (startPointVec.x + endPointVec.x) / 2;
        const centerZ = (startPointVec.z + endPointVec.z) / 2;
        const planeYPosition = startPointVec.y; 
        
        const count = objects.filter(o => o.type === 'plane' && o.name.startsWith("Rectangle")).length + 1;
        addObject('plane', {
          name: `Rectangle ${count}`,
          position: [centerX, planeYPosition, centerZ], 
          rotation: [-Math.PI / 2, 0, 0], 
          dimensions: { width: rectWidth, height: rectDepth }, // For plane, height maps to one dimension on the plane.
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
    } else if (activeTool === 'tape' && drawingState.isActive && drawingState.startPoint && !drawingState.measureDistance) {
        // This case is mostly handled by onPointerDown for the second click if a point was already set.
        // If user releases mouse after first click (without second click), reset.
        if (tempMeasureLineRef.current && sceneRef.current) {
             sceneRef.current.remove(tempMeasureLineRef.current);
             tempMeasureLineRef.current.geometry.dispose();
            (tempMeasureLineRef.current.material as THREE.Material).dispose();
             tempMeasureLineRef.current = null;
        }
        setDrawingState({ isActive: false, startPoint: null, currentPoint: null, tool: null, measureDistance: null }); 
        setActiveTool('select');
        return;
    } else if (activeTool === 'pushpull' && drawingState.isActive && drawingState.pushPullFaceInfo) {
        const { objectId, originalType } = drawingState.pushPullFaceInfo;
        const finalObject = objects.find(o => o.id === objectId);
        toast({ 
            title: "Push/Pull Complete", 
            description: `${finalObject?.name || 'Object'} modified. ${originalType === 'plane' && finalObject?.type === 'cube' ? 'Rectangle extruded to a cube.' : ''}` 
        });
        setDrawingState({ isActive: false, tool: null, pushPullFaceInfo: null });
        if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;
        setActiveTool('select'); 
        return;
    }


    if (!drawingState.isActive && !transformControlsRef.current?.dragging) {
      const intersection = getMouseIntersection(event);
      if (intersection && intersection.object ) {
        const clickedObjectId = intersection.object.name;
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
          } else if (activeTool !== 'pushpull' && activeTool !== 'tape' && activeTool !== 'rectangle') { 
            selectObject(clickedObjectId);
          }
        } else { 
          if (activeTool === 'select' || activeTool === 'move' || activeTool === 'rotate' || activeTool === 'scale') {
             selectObject(null);
          }
        }
      } else { 
         if (activeTool === 'select' || activeTool === 'move' || activeTool === 'rotate' || activeTool === 'scale') {
            selectObject(null);
         }
      }
    }
  }, [activeTool, drawingState, getMouseIntersection, setDrawingState, addObject, objects, toast, selectObject, activePaintMaterialId, getMaterialById, updateObject, removeObject, setActiveTool]);


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


  useEffect(() => {
    const tc = transformControlsRef.current;
    if (!tc || !sceneRef.current) return;

    const isDrawingOrModToolActive = activeTool === 'rectangle' || activeTool === 'line' || activeTool === 'arc' || activeTool === 'tape' || activeTool === 'pushpull';

    const selectedMesh = selectedObjectId ? sceneRef.current.getObjectByName(selectedObjectId) as THREE.Mesh : null;

    if (selectedMesh && !isDrawingOrModToolActive && (activeTool === 'move' || activeTool === 'rotate' || activeTool === 'scale')) {
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

  useEffect(() => {
    if (!sceneRef.current || !getMaterialById) return;
    const scene = sceneRef.current;

    const existingObjectIdsInThree = scene.children
      .filter(child => child instanceof THREE.Mesh && child.name && child.name !== 'gridHelper' && !(child === tempDrawingMeshRef.current) && !(child === tempMeasureLineRef.current) )
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
        const isTransforming = transformControlsRef.current?.object === mesh && transformControlsRef.current?.dragging;
        const isPushPulling = drawingState.isActive && drawingState.tool === 'pushpull' && drawingState.pushPullFaceInfo?.objectId === objData.id;
        
        if (!isTransforming && !isPushPulling) { 
          updateMeshProperties(mesh, objData);
        }
        
        if(Array.isArray(mesh.material)){
            // This case should ideally not happen with current setup, but to be safe:
            (mesh.material as THREE.Material[]).forEach(m => {
                if (m instanceof THREE.MeshStandardMaterial) createOrUpdateMaterial(materialProps, m);
            });
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

  }, [objects, getMaterialById, drawingState.isActive, drawingState.tool, drawingState.pushPullFaceInfo?.objectId]);

  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.children.forEach(child => {
      if (child instanceof THREE.Mesh && child.name && child.name !== 'gridHelper' && !(child === tempDrawingMeshRef.current) && !(child === tempMeasureLineRef.current)) { 
        const isSelected = child.name === selectedObjectId;
        const isTransforming = transformControlsRef.current?.object === child && transformControlsRef.current?.visible && transformControlsRef.current.dragging;
        const isPushPullTarget = drawingState.tool === 'pushpull' && drawingState.pushPullFaceInfo?.objectId === child.name && drawingState.isActive;


        if (Array.isArray(child.material)) {
          // Handle array materials if necessary
        } else if (child.material instanceof THREE.MeshStandardMaterial) {
            if (child.userData.originalEmissive === undefined) { 
                child.userData.originalEmissive = child.material.emissive.getHex(); // Store as hex
            }
             if (child.userData.originalEmissiveIntensity === undefined) {
                child.userData.originalEmissiveIntensity = child.material.emissiveIntensity;
            }

            if ((isSelected && !isTransforming && !isPushPullTarget) || (isPushPullTarget && drawingState.isActive)) { 
                child.material.emissive.setHex(0x00B8D9); 
                child.material.emissiveIntensity = isPushPullTarget ? 0.9 : 0.7;
            } else {
                child.material.emissive.setHex(child.userData.originalEmissive ?? 0x000000);
                child.material.emissiveIntensity = child.userData.originalEmissiveIntensity ?? 0;
            }
            child.material.needsUpdate = true;
        }
      }
    });
  }, [selectedObjectId, activeTool, drawingState]); 


  return <div ref={mountRef} className="w-full h-full outline-none bg-background" tabIndex={0} />;
};

export default SceneViewer;


