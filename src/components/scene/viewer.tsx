
"use client";

import type React from 'react';
import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import { useScene } from '@/context/scene-context';
import { createPrimitive, updateMeshProperties, createOrUpdateMaterial } from '@/lib/three-utils';
import { useToast } from '@/hooks/use-toast';
import type { SceneObject, PushPullFaceInfo, PrimitiveType, SceneObjectDimensions, ToolType, PointLightSceneProps, SpotLightSceneProps, AreaLightSceneProps, SceneLight, DrawingState, ViewPreset } from '@/types';
import { DEFAULT_MATERIAL_ID } from '@/types';

const SceneViewer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  
  const tempDrawingMeshRef = useRef<THREE.LineSegments | null>(null);
  const tempMeasureLineRef = useRef<THREE.Line | null>(null); 

  const { toast } = useToast();
  
  const { 
    objects, 
    ambientLight: ambientLightProps, 
    directionalLight: directionalLightProps,
    otherLights,
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
    requestedViewPreset,
    setCameraViewPreset,
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

    const intersects = raycaster.current.intersectObjects(sceneRef.current.children.filter(c => c.visible && c.name !== 'gridHelper' && !(c instanceof TransformControls) && !(c.type === 'PointLightHelper' || c.type === 'SpotLightHelper' || c.type === 'RectAreaLightHelper') && !(c === tempDrawingMeshRef.current) && !(c === tempMeasureLineRef.current) && c.userData.objectType !== 'cadPlan'), true); // Exclude cadPlan from general intersection
    if (intersects.length > 0) {
        let firstIntersectedObject = intersects[0].object;
        // Traverse up to find the named SceneObject parent if part of a complex mesh
        while(firstIntersectedObject.parent && firstIntersectedObject.parent !== sceneRef.current && !firstIntersectedObject.name){
            firstIntersectedObject = firstIntersectedObject.parent as THREE.Mesh; // Assuming meshes for now
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
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // XZ plane at Y=0
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
      if (transformControls.object && transformControls.object instanceof THREE.Mesh) { // Ensure it's a mesh
        const obj = transformControls.object as THREE.Mesh; 
        const sceneObj = objects.find(o => o.id === obj.name); 
        if (sceneObj) {
          const newPosition = obj.position.toArray() as [number, number, number];
          const newRotation = [obj.rotation.x, obj.rotation.y, obj.rotation.z] as [number, number, number];
          const newScale = obj.scale.toArray() as [number, number, number];
          // Validate scale to prevent zero or negative values that can cause issues
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
      
      // Cleanup temporary drawing/measuring lines
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
      // Cleanup light helpers
      scene.children
        .filter(obj => obj.name && obj.name.endsWith('_helper')) 
        .forEach(helper => {
          scene.remove(helper);
          if (typeof (helper as any).dispose === 'function') { 
            (helper as any).dispose();
          }
        });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if (sceneRef.current) {
      const drawingToolActive = ['rectangle', 'line', 'arc', 'circle', 'polygon', 'freehand'].includes(activeTool || '');
      const measureToolActive = ['tape', 'protractor'].includes(activeTool || '');

      // Cleanup temp drawing mesh if tool is no longer active
      if (!drawingToolActive && tempDrawingMeshRef.current) {
        sceneRef.current.remove(tempDrawingMeshRef.current);
        tempDrawingMeshRef.current.geometry.dispose();
        (tempDrawingMeshRef.current.material as THREE.Material).dispose();
        tempDrawingMeshRef.current = null;
        // Reset drawing state if it was active for a drawing tool
        if (drawingState.isActive && ['rectangle', 'line', 'arc', 'circle', 'polygon', 'freehand'].includes(drawingState.tool || '')) {
          setDrawingState({ isActive: false, startPoint: null, currentPoint: null, tool: null });
        }
      }
      // Cleanup temp measure line if tool is no longer active
      if (!measureToolActive && tempMeasureLineRef.current) {
        sceneRef.current.remove(tempMeasureLineRef.current);
        tempMeasureLineRef.current.geometry.dispose();
        (tempMeasureLineRef.current.material as THREE.Material).dispose();
        tempMeasureLineRef.current = null;
        if (drawingState.isActive && ['tape', 'protractor'].includes(drawingState.tool || '')) {
           setDrawingState({ isActive: false, startPoint: null, currentPoint: null, tool: null, measureDistance: null });
        }
      }
    }
  }, [activeTool, drawingState.isActive, drawingState.tool, setDrawingState]);


  const onPointerDown = useCallback((event: PointerEvent) => {
    if (transformControlsRef.current?.dragging) return;

    const intersection = getMouseIntersection(event);
    const pointOnXZ = getMousePositionOnXZPlane(event);

    if (activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'polygon' || activeTool === 'line' || activeTool === 'freehand' || activeTool === 'arc') {
      if (pointOnXZ && sceneRef.current) {
        setDrawingState({ isActive: true, startPoint: pointOnXZ.toArray() as [number,number,number], currentPoint: pointOnXZ.toArray() as [number,number,number], tool: activeTool as DrawingState['tool'] });
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
    } else if (activeTool === 'tape' || activeTool === 'protractor') { 
        if (pointOnXZ && sceneRef.current) { 
            if (!drawingState.startPoint || drawingState.tool !== activeTool) { 
                setDrawingState({ 
                    isActive: true, 
                    startPoint: pointOnXZ.toArray() as [number,number,number], 
                    currentPoint: pointOnXZ.toArray() as [number,number,number],
                    tool: activeTool as 'tape' | 'protractor',
                    measureDistance: null,
                });
                if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;

                if (tempMeasureLineRef.current) { 
                    sceneRef.current.remove(tempMeasureLineRef.current);
                    tempMeasureLineRef.current.geometry.dispose();
                    (tempMeasureLineRef.current.material as THREE.Material).dispose();
                }
                const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, depthTest: false, transparent: true, opacity: 0.9 });
                const lineGeometry = new THREE.BufferGeometry().setFromPoints([pointOnXZ, pointOnXZ.clone()]);
                tempMeasureLineRef.current = new THREE.Line(lineGeometry, lineMaterial);
                tempMeasureLineRef.current.renderOrder = 1000;
                sceneRef.current.add(tempMeasureLineRef.current);
            } else { 
                const startVec = new THREE.Vector3().fromArray(drawingState.startPoint);
                const distance = startVec.distanceTo(pointOnXZ);
                
                toast({
                    title: activeTool === 'tape' ? "Measurement Complete" : "Protractor (First Leg)",
                    description: activeTool === 'tape' ? `Distance: ${distance.toFixed(3)} units` : `Length: ${distance.toFixed(3)}. Click for angle.`,
                });
                
                if (activeTool === 'tape') {
                    if (tempMeasureLineRef.current && sceneRef.current) {
                        sceneRef.current.remove(tempMeasureLineRef.current);
                        tempMeasureLineRef.current.geometry.dispose();
                        (tempMeasureLineRef.current.material as THREE.Material).dispose();
                        tempMeasureLineRef.current = null;
                    }
                    setDrawingState({ isActive: false, startPoint: null, currentPoint: null, tool: null, measureDistance: distance }); 
                    if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;
                    setActiveTool('select');
                } else { 
                    // For protractor, this click sets the first leg.
                    setDrawingState({ 
                      currentPoint: pointOnXZ.toArray() as [number, number, number],
                      measureDistance: distance 
                    });
                    // Protractor logic for second leg/angle would continue in pointerMove/Up based on this state
                }
            }
        }
    } else if (activeTool === 'pushpull') {
        if (intersection && intersection.object && intersection.face && intersection.normal && sceneRef.current) {
            const clickedMesh = intersection.object as THREE.Mesh;
            const clickedObjectId = clickedMesh.name;
            const clickedSceneObject = objects.find(o => o.id === clickedObjectId);

            if (clickedSceneObject && (clickedSceneObject.type === 'cube' || clickedSceneObject.type === 'plane' || clickedSceneObject.type === 'cylinder' || clickedSceneObject.type === 'polygon')) { 
                const localFaceNormal = intersection.face.normal.clone(); 
                const worldFaceNormal = localFaceNormal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(clickedMesh.matrixWorld)).normalize();
                const initialLocalIntersectPoint = clickedMesh.worldToLocal(intersection.point.clone());

                const pushPullInfo: PushPullFaceInfo = {
                    objectId: clickedObjectId,
                    initialMeshWorldPosition: clickedMesh.position.toArray() as [number, number, number],
                    initialLocalIntersectPoint: initialLocalIntersectPoint.toArray() as [number,number,number],
                    initialWorldIntersectionPoint: intersection.point.toArray() as [number, number, number], 
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
                toast({ title: "Push/Pull Tool", description: "Select a face of a Cube, Plane, Cylinder, or Polygon to push/pull.", variant: "default" });
            }
        } else {
             toast({ title: "Push/Pull Tool", description: "Click on a face of a compatible object.", variant: "default" });
        }
    }
  }, [activeTool, getMouseIntersection, getMousePositionOnXZPlane, setDrawingState, drawingState, toast, setActiveTool, objects, selectObject]);

  const onPointerMove = useCallback((event: PointerEvent) => {
    if (drawingState.isActive && drawingState.startPoint && sceneRef.current && tempDrawingMeshRef.current && ['rectangle', 'circle', 'polygon', 'line', 'freehand', 'arc'].includes(activeTool || '')) {
      const currentMovePoint = getMousePositionOnXZPlane(event);
      if (currentMovePoint) {
        setDrawingState({ currentPoint: currentMovePoint.toArray() as [number,number,number] });
        const startVec = new THREE.Vector3().fromArray(drawingState.startPoint);
        const endVec = currentMovePoint;
        let points: number[] = [];

        if (activeTool === 'rectangle') {
          points = [
              startVec.x, startVec.y, startVec.z,   endVec.x, startVec.y, startVec.z,
              endVec.x, startVec.y, startVec.z,     endVec.x, startVec.y, endVec.z, 
              endVec.x, startVec.y, endVec.z,       startVec.x, startVec.y, endVec.z,
              startVec.x, startVec.y, endVec.z,     startVec.x, startVec.y, startVec.z,
          ];
        } else if (activeTool === 'line' || activeTool === 'freehand') { 
            points = [startVec.x, startVec.y, startVec.z, endVec.x, endVec.y, endVec.z];
        } else if (activeTool === 'circle' || activeTool === 'polygon') {
            const radius = startVec.distanceTo(endVec);
            const segments = activeTool === 'circle' ? 32 : (drawingState.polygonSides || 6);
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                points.push(startVec.x + radius * Math.cos(angle), startVec.y, startVec.z + radius * Math.sin(angle));
                if (i > 0) { 
                     // Connect to previous point to form segments
                     const prevAngle = ((i - 1) / segments) * Math.PI * 2;
                     points.push(startVec.x + radius * Math.cos(prevAngle), startVec.y, startVec.z + radius * Math.sin(prevAngle));
                }
            }
            // Ensure the polygon/circle closes properly by connecting last to first segment point for LineSegments
            if (points.length > 3 && activeTool === 'polygon') { // For polygon, explicitly connect last point to first
                points.push(points[points.length-3], points[points.length-2], points[points.length-1]); // Last point
                points.push(points[0], points[1], points[2]); // First point
            } else if (points.length > 3 && activeTool === 'circle') { // For circle, last segment point already pushed, needs connection to first.
                 points.push(points[points.length-3], points[points.length-2], points[points.length-1]);
                 points.push(points[0], points[1], points[2]);
            }
        }
        
        if (points.length > 0) {
            tempDrawingMeshRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
            tempDrawingMeshRef.current.geometry.computeBoundingSphere(); // Important for visibility
        }
      }
    } else if (activeTool && ['tape','protractor'].includes(activeTool) && drawingState.isActive && drawingState.startPoint && !drawingState.measureDistance && sceneRef.current && tempMeasureLineRef.current && drawingState.tool === activeTool) {
        const currentMovePoint = getMousePositionOnXZPlane(event);
        if (currentMovePoint) {
            setDrawingState({ currentPoint: currentMovePoint.toArray() as [number,number,number] });
            const startVec = new THREE.Vector3().fromArray(drawingState.startPoint);
            tempMeasureLineRef.current.geometry.setFromPoints([startVec, currentMovePoint]);
            tempMeasureLineRef.current.geometry.computeBoundingSphere();
        }
    } else if (activeTool === 'pushpull' && drawingState.isActive && drawingState.pushPullFaceInfo && cameraRef.current && sceneRef.current) {
        const { objectId, initialWorldIntersectionPoint, worldFaceNormal, originalDimensions, originalPosition, originalRotation, originalType, localFaceNormal } = drawingState.pushPullFaceInfo;
        const initialWorldIntersectVec = new THREE.Vector3().fromArray(initialWorldIntersectionPoint);
        const worldFaceNormalVec = new THREE.Vector3().fromArray(worldFaceNormal);
        const localFaceNormalVec = new THREE.Vector3().fromArray(localFaceNormal);

        const targetPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(worldFaceNormalVec, initialWorldIntersectVec);
        const currentIntersection = getMouseIntersection(event, targetPlane);

        if (currentIntersection) {
            const dragVector = currentIntersection.point.clone().sub(initialWorldIntersectVec);
            let pushPullAmount = dragVector.dot(worldFaceNormalVec); 
            
            // Correct direction if local normal opposes world normal (e.g., inside face)
            if (worldFaceNormalVec.dot(localFaceNormalVec) < 0) {
                 pushPullAmount = -pushPullAmount;
            }

            // Increase sensitivity for more noticeable changes
            const sensitivityFactor = 1.0; // Adjusted for potentially better user experience
            pushPullAmount *= sensitivityFactor;

            let newDimensions: SceneObjectDimensions = { ...originalDimensions };
            let newPositionArray = [...originalPosition] as [number, number, number];
            let newRotationArray: [number, number, number] | undefined = [...originalRotation] as [number,number,number]; 
            let newType: PrimitiveType = originalType;

            if (originalType === 'cube' || originalType === 'cylinder' || originalType === 'polygon') {
                let dimensionToModify: 'width' | 'height' | 'depth' | 'radius' | undefined;
                let isAxialPush = false; // True if pushing along the main axis (e.g., height of cylinder)

                // Determine which dimension to modify based on face normal
                if (originalType === 'cube' || ( (originalType === 'cylinder' || originalType === 'polygon') && (Math.abs(localFaceNormalVec.x) > 0.9 || Math.abs(localFaceNormalVec.z) > 0.9) ) ) { 
                    // For cube, or radial faces of cylinder/polygon
                    const absX = Math.abs(localFaceNormalVec.x);
                    const absY = Math.abs(localFaceNormalVec.y); // Should be near 0 for side faces
                    const absZ = Math.abs(localFaceNormalVec.z);
                    if (originalType === 'cube') {
                      if (absX > absY && absX > absZ) dimensionToModify = 'width'; // X-face
                      else if (absY > absX && absY > absZ) dimensionToModify = 'height'; // Y-face
                      else if (absZ > absX && absZ > absY) dimensionToModify = 'depth'; // Z-face
                    } else { // Radial face of cylinder/polygon
                        dimensionToModify = 'radius'; 
                    }
                } else if ((originalType === 'cylinder' || originalType === 'cone' || originalType === 'polygon') && Math.abs(localFaceNormalVec.y) > 0.9) { 
                    // Top/bottom face of cylinder/cone/polygon
                    dimensionToModify = 'height';
                    isAxialPush = true;
                }
                
                if (dimensionToModify) {
                  let currentDim: number;
                  if (dimensionToModify === 'radius') { 
                      // For cylinder/polygon, radius affects both top/bottom or general radius
                      currentDim = (originalType === 'cylinder' ? (originalDimensions.radiusTop ?? originalDimensions.radiusBottom ?? 1) : (originalDimensions.radius ?? 1));
                      const newRadius = Math.max(0.01, currentDim + pushPullAmount); 
                      if (originalType === 'cylinder') {
                          newDimensions.radiusTop = newRadius;
                          newDimensions.radiusBottom = newRadius;
                      } else { // Polygon
                          newDimensions.radius = newRadius;
                      }
                  } else { // width, height, depth
                    currentDim = originalDimensions[dimensionToModify as 'width'|'height'|'depth'] || 1;
                    newDimensions[dimensionToModify as 'width'|'height'|'depth'] = Math.max(0.01, currentDim + pushPullAmount);
                  }
                }
                
                // Adjust position if pushing along an axis (center of object moves)
                if (isAxialPush || originalType === 'cube') { // Cubes always adjust position
                    const positionOffset = localFaceNormalVec.clone().multiplyScalar(pushPullAmount / 2);
                    newPositionArray = [
                        originalPosition[0] + positionOffset.x,
                        originalPosition[1] + positionOffset.y,
                        originalPosition[2] + positionOffset.z,
                    ];
                }


            } else if (originalType === 'plane') {
                // Extrude plane into a cube
                newType = 'cube'; // Convert plane to cube
                const extrusionHeight = Math.max(0.01, Math.abs(pushPullAmount)); 
                newDimensions = { 
                    width: originalDimensions.width || 1, 
                    depth: originalDimensions.height || 1, // Plane's 'height' becomes cube's 'depth'
                    height: extrusionHeight, // Cube's 'height' is the extrusion amount
                };
                // Offset position by half the extrusion amount along the normal
                const extrusionOffset = localFaceNormalVec.clone().multiplyScalar(pushPullAmount / 2);
                newPositionArray = [
                    originalPosition[0] + extrusionOffset.x,
                    originalPosition[1] + extrusionOffset.y,
                    originalPosition[2] + extrusionOffset.z,
                ];
                // If plane was flat on XZ (rotated -PI/2 on X), reset rotation for cube
                if(originalRotation[0] === -Math.PI / 2 && Math.abs(originalRotation[1]) < 0.01 && Math.abs(originalRotation[2]) < 0.01){
                    newRotationArray = [0,0,0];
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

    if (drawingState.isActive && drawingState.startPoint && drawingState.currentPoint && ['rectangle', 'circle', 'polygon', 'line', 'freehand', 'arc'].includes(drawingState.tool || '')) {
      const startPointVec = new THREE.Vector3().fromArray(drawingState.startPoint);
      const endPointVec = new THREE.Vector3().fromArray(drawingState.currentPoint);
      const tool = drawingState.tool;
      let newObjProps: Partial<Omit<SceneObject, 'id' | 'type'>> = {};
      let primitiveType: PrimitiveType | null = null;

      if (tool === 'rectangle') {
        const rectWidth = Math.abs(endPointVec.x - startPointVec.x);
        const rectDepth = Math.abs(endPointVec.z - startPointVec.z);
        if (rectWidth > 0.01 && rectDepth > 0.01) { 
            primitiveType = 'plane';
            newObjProps = {
                position: [(startPointVec.x + endPointVec.x) / 2, 0, (startPointVec.z + endPointVec.z) / 2], // Center of the plane
                rotation: [-Math.PI / 2, 0, 0], // Rotate to be flat on XZ plane
                dimensions: { width: rectWidth, height: rectDepth }, // Plane's height is depth in 3D
            };
        }
      } else if (tool === 'circle' || tool === 'polygon') {
          const radius = startPointVec.distanceTo(endPointVec);
          if (radius > 0.01) {
              primitiveType = tool === 'circle' ? 'plane' : 'polygon'; // Use plane for circle, polygon for N-sided
              newObjProps = {
                  position: [startPointVec.x, 0, startPointVec.z], // Center of the shape
                  rotation: [-Math.PI / 2, 0, 0], // Rotate to be flat on XZ plane
                  dimensions: tool === 'circle' ? { width: radius * 2, height: radius * 2, radialSegments: 32 } : { radius: radius, sides: drawingState.polygonSides || 6 }
                  // For 'plane' (used for circle), width/height are diameter. For 'polygon', it's radius and sides.
              };
              if (tool === 'circle') { // Ensure 'plane' used for circle has consistent width/height for its diameter
                newObjProps.dimensions = { width: radius * 2, height: radius * 2 };
              }
          }
      }
      
      if (primitiveType && newObjProps.dimensions) {
        const newObj = addObject(primitiveType as Exclude<PrimitiveType, 'cadPlan'>, { ...newObjProps, materialId: DEFAULT_MATERIAL_ID });
        toast({ title: `${primitiveType.charAt(0).toUpperCase() + primitiveType.slice(1)} Drawn`, description: `${newObj.name} added.` });
      }
      
      setDrawingState({ isActive: false, startPoint: null, currentPoint: null, tool: null });
      setActiveTool('select'); 
      return; 
    } else if (activeTool && ['tape','protractor'].includes(activeTool) && drawingState.isActive && drawingState.startPoint && !drawingState.measureDistance && drawingState.tool === activeTool) {
        // For tape/protractor, if this is the first click (measureDistance is null), it sets the start.
        // The second click (handled in onPointerDown) completes it.
        // So, pointerUp here for the first point might not need to do much beyond what onPointerDown did.
        return; 
    } else if (activeTool === 'pushpull' && drawingState.isActive && drawingState.pushPullFaceInfo && drawingState.tool === 'pushpull') {
        const { objectId, originalType } = drawingState.pushPullFaceInfo;
        const finalObject = objects.find(o => o.id === objectId);
        toast({ 
            title: "Push/Pull Complete", 
            description: `${finalObject?.name || 'Object'} modified. ${originalType === 'plane' && finalObject?.type === 'cube' ? 'Plane extruded to a cube.' : ''}` 
        });
        setDrawingState({ isActive: false, tool: null, pushPullFaceInfo: null });
        setActiveTool('select'); 
        return;
    }


    // General object selection/interaction if not in an active drawing/modification state
    if (!drawingState.isActive && !transformControlsRef.current?.dragging) {
      const intersection = getMouseIntersection(event);
      if (intersection && intersection.object && !(intersection.object instanceof THREE.GridHelper) && intersection.object.userData.objectType !== 'cadPlan') { // Ensure not grid or CAD plan
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
          } else if (activeTool !== 'pushpull' && !['tape', 'protractor', 'rectangle', 'circle', 'polygon', 'line', 'freehand', 'arc'].includes(activeTool || '')) { 
            // Select object if not using a tool that requires specific interaction (like pushpull start)
            // or a drawing tool.
            selectObject(clickedObjectId);
          }
        } else { 
          // Clicked on something in scene not in our 'objects' list or it's a CAD plan
          if (activeTool === 'select' || activeTool === 'move' || activeTool === 'rotate' || activeTool === 'scale') {
             selectObject(null); // Deselect if clicked on empty space or non-selectable
          }
        }
      } else { 
         // Clicked on empty space
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


  // Manage Transform Controls
  useEffect(() => {
    const tc = transformControlsRef.current;
    if (!tc || !sceneRef.current) return;

    const isDrawingOrModToolActive = ['rectangle', 'line', 'arc', 'circle', 'polygon', 'freehand', 'tape', 'protractor', 'pushpull'].includes(activeTool || '');
    const selectedThreeObject = selectedObjectId ? sceneRef.current.getObjectByName(selectedObjectId) : null;

    if (selectedThreeObject && selectedThreeObject instanceof THREE.Mesh && !isDrawingOrModToolActive && (activeTool === 'move' || activeTool === 'rotate' || activeTool === 'scale')) {
      tc.attach(selectedThreeObject);
      tc.enabled = true;
      tc.visible = true;
      switch (activeTool) {
        case 'move': tc.mode = 'translate'; break;
        case 'rotate': tc.mode = 'rotate'; break;
        case 'scale': tc.mode = 'scale'; break;
        default: break; // Should not happen if conditions met
      }
    } else {
      if(tc.object) tc.detach(); 
      tc.enabled = false;
      tc.visible = false;
    }
  }, [activeTool, selectedObjectId]);

  // Manage Lights
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
    let dirLight = scene.getObjectByName(directionalLightProps.id) as THREE.DirectionalLight;
    let dirLightHelper = scene.getObjectByName(`${directionalLightProps.id}_helper`) as THREE.DirectionalLightHelper;

    if (!dirLight) {
      dirLight = new THREE.DirectionalLight(directionalLightProps.color, directionalLightProps.intensity);
      dirLight.name = directionalLightProps.id; 
      scene.add(dirLight);
      if (dirLight.target && !dirLight.target.parent) scene.add(dirLight.target); 
      dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 1);
      dirLightHelper.name = `${directionalLightProps.id}_helper`;
      scene.add(dirLightHelper);
    }
    dirLight.color.set(directionalLightProps.color);
    dirLight.intensity = directionalLightProps.intensity;
    dirLight.position.set(...directionalLightProps.position);
    dirLight.castShadow = directionalLightProps.castShadow;
    dirLight.shadow.bias = directionalLightProps.shadowBias;
    dirLight.visible = directionalLightProps.visible ?? true;
    if (dirLight.target) dirLight.target.position.set(0,0,0); // Ensure target is at origin or configurable
    
    if (dirLightHelper) {
      dirLightHelper.visible = directionalLightProps.visible ?? true; 
      dirLightHelper.update();
    }

    // Shadow properties for directional light
    if (directionalLightProps.castShadow) {
      dirLight.shadow.mapSize.width = 2048; 
      dirLight.shadow.mapSize.height = 2048;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 50; 
      const shadowCamSize = 25;
      dirLight.shadow.camera.left = -shadowCamSize;
      dirLight.shadow.camera.right = shadowCamSize;
      dirLight.shadow.camera.top = shadowCamSize;
      dirLight.shadow.camera.bottom = -shadowCamSize;
    }


    // Other Lights (Point, Spot, Area)
    const existingLightIdsInThree = scene.children
      .filter(child => child instanceof THREE.Light && child.name !== 'ambientLight' && child.name !== directionalLightProps.id && !(child instanceof THREE.HemisphereLight) ) // Exclude HemisphereLight if not managed
      .map(child => child.name);
    const contextLightIds = (otherLights || []).map(l => l.id);

    (otherLights || []).forEach(lightData => {
      let lightObject = scene.getObjectByName(lightData.id) as THREE.Light;
      let helper = scene.getObjectByName(`${lightData.id}_helper`);

      if (!lightObject) {
        switch (lightData.type) {
          case 'point':
            lightObject = new THREE.PointLight();
            helper = new THREE.PointLightHelper(lightObject as THREE.PointLight, 0.5); 
            break;
          case 'spot':
            lightObject = new THREE.SpotLight();
             if ((lightObject as THREE.SpotLight).target && !(lightObject as THREE.SpotLight).target.parent) scene.add((lightObject as THREE.SpotLight).target);
            helper = new THREE.SpotLightHelper(lightObject as THREE.SpotLight);
            break;
          case 'area': // RectAreaLight
            lightObject = new THREE.RectAreaLight();
            // RectAreaLights need a helper from 'three/examples/jsm/helpers/RectAreaLightHelper.js'
            helper = new RectAreaLightHelper(lightObject as THREE.RectAreaLight);
            break;
          default: return; // Should not happen with typed SceneLight
        }
        lightObject.name = lightData.id;
        scene.add(lightObject);
        if (helper) { helper.name = `${lightData.id}_helper`; scene.add(helper); }
      }

      // Common properties
      lightObject.color.set(lightData.color);
      lightObject.intensity = lightData.intensity;
      lightObject.visible = lightData.visible ?? true;
      if(helper) helper.visible = lightData.visible ?? true;


      // Type-specific properties
      if (lightObject instanceof THREE.PointLight && lightData.type === 'point') {
        lightObject.position.set(...(lightData as PointLightSceneProps).position);
        lightObject.distance = (lightData as PointLightSceneProps).distance || 0;
        lightObject.decay = (lightData as PointLightSceneProps).decay || 2; // Physical decay for point/spot
        lightObject.castShadow = (lightData as PointLightSceneProps).castShadow || false;
        if (lightObject.castShadow) lightObject.shadow.bias = (lightData as PointLightSceneProps).shadowBias || 0;
      } else if (lightObject instanceof THREE.SpotLight && lightData.type === 'spot') {
        lightObject.position.set(...(lightData as SpotLightSceneProps).position);
        if((lightData as SpotLightSceneProps).targetPosition) lightObject.target.position.set(...((lightData as SpotLightSceneProps).targetPosition!));
        lightObject.angle = (lightData as SpotLightSceneProps).angle || Math.PI / 3;
        lightObject.penumbra = (lightData as SpotLightSceneProps).penumbra || 0;
        lightObject.distance = (lightData as SpotLightSceneProps).distance || 0;
        lightObject.decay = (lightData as SpotLightSceneProps).decay || 2;
        lightObject.castShadow = (lightData as SpotLightSceneProps).castShadow || false;
        if (lightObject.castShadow) lightObject.shadow.bias = (lightData as SpotLightSceneProps).shadowBias || 0;
      } else if (lightObject instanceof THREE.RectAreaLight && lightData.type === 'area') {
        lightObject.position.set(...(lightData as AreaLightSceneProps).position);
        if ((lightData as AreaLightSceneProps).rotation) lightObject.rotation.set(...((lightData as AreaLightSceneProps).rotation!));
        lightObject.width = (lightData as AreaLightSceneProps).width || 1;
        lightObject.height = (lightData as AreaLightSceneProps).height || 1;
        // RectAreaLights do not cast shadows in standard Three.js
      }
      if (typeof (helper as any)?.update === 'function') (helper as any).update();
    });

    // Remove lights from Three.js scene that are no longer in context
    existingLightIdsInThree.forEach(id => {
      if (!contextLightIds.includes(id)) {
        const lightToRemove = scene.getObjectByName(id);
        if (lightToRemove) scene.remove(lightToRemove);
        const helperToRemove = scene.getObjectByName(`${id}_helper`);
        if (helperToRemove) {
          scene.remove(helperToRemove);
          if (typeof (helperToRemove as any).dispose === 'function') (helperToRemove as any).dispose();
        }
      }
    });

  }, [ambientLightProps, directionalLightProps, otherLights]);


  // Manage Scene Objects (Meshes and CAD Plans)
  useEffect(() => {
    if (!sceneRef.current || !getMaterialById) return;
    const scene = sceneRef.current;

    const existingObjectIdsInThree = scene.children
      .filter(child => child.name && child.name !== 'gridHelper' && !(child === tempDrawingMeshRef.current) && !(child === tempMeasureLineRef.current) )
      .map(child => child.name);
      
    const contextObjectIds = objects.map(obj => obj.id);

    objects.forEach(objData => {
      let meshOrGroup = scene.getObjectByName(objData.id) as THREE.Mesh | THREE.Group;
      const materialProps = getMaterialById(objData.materialId);
      
      if (!materialProps && objData.type !== 'cadPlan') { // CAD plan might use default line color logic
        console.warn(`Material ${objData.materialId} not found for object ${objData.id}, using default or skipping.`);
        // return; // Or apply a fallback if critical
      }

      if (meshOrGroup) { // Object exists in Three.js scene
        if (objData.type === 'cadPlan') {
            meshOrGroup.visible = objData.visible ?? true;
            meshOrGroup.position.set(...objData.position);
            meshOrGroup.rotation.set(...objData.rotation);
            meshOrGroup.scale.set(...objData.scale);
            // Update line color if material changes
            if (materialProps && meshOrGroup instanceof THREE.Group) {
                meshOrGroup.children.forEach(child => {
                    if (child instanceof THREE.LineSegments && child.material instanceof THREE.LineBasicMaterial) {
                        child.material.color.set(materialProps.color);
                        child.material.needsUpdate = true;
                    }
                });
            }
            // Note: If objData.planData changes, the geometry needs to be rebuilt. 
            // This is complex for an update; typically CAD plans are static once imported.
        } else if (meshOrGroup instanceof THREE.Mesh) { // Standard 3D primitive
            const isTransforming = transformControlsRef.current?.object === meshOrGroup && transformControlsRef.current?.dragging;
            const isPushPulling = drawingState.isActive && drawingState.tool === 'pushpull' && drawingState.pushPullFaceInfo?.objectId === objData.id;
            
            if (!isTransforming && !isPushPulling) { 
              updateMeshProperties(meshOrGroup, objData);
            }
            meshOrGroup.visible = objData.visible ?? true;
            
            if (materialProps) {
              if(Array.isArray(meshOrGroup.material)){
                  (meshOrGroup.material as THREE.Material[]).forEach(m => {
                      if (m instanceof THREE.MeshStandardMaterial) createOrUpdateMaterial(materialProps, m);
                  });
              } else {
                  createOrUpdateMaterial(materialProps, meshOrGroup.material as THREE.MeshStandardMaterial);
              }
            }
        }
      } else { // Object needs to be created
        if (objData.type === 'cadPlan' && objData.planData) {
            const planGroup = new THREE.Group();
            planGroup.name = objData.id;
            planGroup.userData = { objectType: 'cadPlan' }; // Mark for easy identification

            const cadMaterial = new THREE.LineBasicMaterial({
                color: materialProps?.color || 0x888888, // Default to gray if material not found
                linewidth: 1, // Note: linewidth > 1 might not be supported on all systems/drivers
                depthTest: true, // Render with depth considerations
            });

            const points: THREE.Vector3[] = [];
            objData.planData.lines.forEach(line => {
                // Lines are already normalized to plan's local origin, Y is 0
                points.push(new THREE.Vector3(line.start[0], 0, line.start[1]));
                points.push(new THREE.Vector3(line.end[0], 0, line.end[1]));
            });
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineSegments = new THREE.LineSegments(geometry, cadMaterial);
            lineSegments.renderOrder = 0; // Render with other opaque objects
            
            planGroup.add(lineSegments);
            planGroup.position.set(...objData.position);
            planGroup.rotation.set(...objData.rotation);
            planGroup.scale.set(...objData.scale);
            planGroup.visible = objData.visible ?? true;
            scene.add(planGroup);
        } else if (objData.type !== 'cadPlan' && materialProps) { // Standard 3D primitive
            const material = createOrUpdateMaterial(materialProps);
            const newMesh = createPrimitive(objData, material);
            scene.add(newMesh);
        }
      }
    });

    // Remove objects from Three.js scene that are no longer in context
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
          } else if (objectToRemove instanceof THREE.Group && objectToRemove.userData.objectType === 'cadPlan') {
            // Cleanup CAD Plan group
            objectToRemove.children.forEach(child => {
                if (child instanceof THREE.LineSegments) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                    else child.material.dispose();
                }
            });
          }
          scene.remove(objectToRemove);
        }
      }
    });

  }, [objects, getMaterialById, drawingState.isActive, drawingState.tool, drawingState.pushPullFaceInfo?.objectId]);

  // Selection Highlighting Effect
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.children.forEach(child => {
      if (child instanceof THREE.Mesh && child.name && child.name !== 'gridHelper' && !(child === tempDrawingMeshRef.current) && !(child === tempMeasureLineRef.current) && child.userData.objectType !== 'cadPlan') { 
        const isSelected = child.name === selectedObjectId;
        const isTransforming = transformControlsRef.current?.object === child && transformControlsRef.current?.visible && transformControlsRef.current.dragging;
        const isPushPullTarget = drawingState.tool === 'pushpull' && drawingState.pushPullFaceInfo?.objectId === child.name && drawingState.isActive;


        if (Array.isArray(child.material)) {
          // Handle array materials if necessary (e.g., MultiMaterialObject)
        } else if (child.material instanceof THREE.MeshStandardMaterial) {
            // Store original emissive if not already stored
            if (child.userData.originalEmissive === undefined) { 
                child.userData.originalEmissive = child.material.emissive.getHex(); 
            }
             if (child.userData.originalEmissiveIntensity === undefined) {
                child.userData.originalEmissiveIntensity = child.material.emissiveIntensity;
            }

            if ((isSelected && !isTransforming && !isPushPullTarget) || (isPushPullTarget && drawingState.isActive)) { // Highlight conditions
                child.material.emissive.setHex(0x00B8D9); // Example highlight color
                child.material.emissiveIntensity = isPushPullTarget ? 0.9 : 0.7;
            } else {
                // Restore original emissive properties
                const originalMaterial = getMaterialById(objects.find(o => o.id === child.name)?.materialId || DEFAULT_MATERIAL_ID);
                if (originalMaterial?.emissive && originalMaterial.emissive !== '#000000') {
                    child.material.emissive.set(originalMaterial.emissive);
                    child.material.emissiveIntensity = originalMaterial.emissiveIntensity ?? 0;
                } else {
                    child.material.emissive.setHex(child.userData.originalEmissive ?? 0x000000);
                    child.material.emissiveIntensity = child.userData.originalEmissiveIntensity ?? 0;
                }
            }
            child.material.needsUpdate = true;
        }
      }
    });
  }, [selectedObjectId, activeTool, drawingState, objects, getMaterialById]); 

  // Camera View Preset Handler
  useEffect(() => {
    if (!requestedViewPreset || !cameraRef.current || !orbitControlsRef.current) return;

    const cam = cameraRef.current;
    const controls = orbitControlsRef.current;
    const distance = 15; 
    const currentTarget = controls.target.clone();
    let yOffset = currentTarget.y > 0.01 ? currentTarget.y : 1.5; 

    switch (requestedViewPreset) {
      case 'top':
        cam.position.set(currentTarget.x, currentTarget.y + distance, currentTarget.z + 0.001); 
        cam.up.set(0, 0, -1); 
        controls.target.set(currentTarget.x, currentTarget.y, currentTarget.z);
        break;
      case 'bottom':
        cam.position.set(currentTarget.x, currentTarget.y - distance, currentTarget.z + 0.001);
        cam.up.set(0, 0, 1);
        controls.target.set(currentTarget.x, currentTarget.y, currentTarget.z);
        break;
      case 'front':
        cam.position.set(currentTarget.x, yOffset, currentTarget.z + distance);
        cam.up.set(0, 1, 0);
        controls.target.set(currentTarget.x, yOffset, currentTarget.z);
        break;
      case 'back':
        cam.position.set(currentTarget.x, yOffset, currentTarget.z - distance);
        cam.up.set(0, 1, 0);
        controls.target.set(currentTarget.x, yOffset, currentTarget.z);
        break;
      case 'right':
        cam.position.set(currentTarget.x + distance, yOffset, currentTarget.z);
        cam.up.set(0, 1, 0);
        controls.target.set(currentTarget.x, yOffset, currentTarget.z);
        break;
      case 'left':
        cam.position.set(currentTarget.x - distance, yOffset, currentTarget.z);
        cam.up.set(0, 1, 0);
        controls.target.set(currentTarget.x, yOffset, currentTarget.z);
        break;
      case 'perspective':
      default:
        cam.position.set(distance * 0.7, distance * 0.7, distance * 0.7);
        cam.up.set(0, 1, 0);
        controls.target.set(0, 0, 0); 
        break;
    }
    controls.update();
    setCameraViewPreset(null); 
  }, [requestedViewPreset, setCameraViewPreset, cameraRef, orbitControlsRef]);


  return <div ref={mountRef} className="w-full h-full outline-none bg-background" tabIndex={0} />;
};

export default SceneViewer;
