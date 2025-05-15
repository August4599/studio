
"use client";

import type React from 'react';
import { useRef, useEffect, useCallback, useState }from 'react';
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
  const [measureDisplay, setMeasureDisplay] = useState<{ x: number; y: number; text: string } | null>(null);
  const lastCompletedMeasureLineRef = useRef<THREE.Line | null>(null);
  const lastCompletedMeasureDisplayTextRef = useRef<HTMLDivElement | null>(null);


  const { toast } = useToast();
  
  const { 
    objects: sceneContextObjects, 
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
    measurementUnit,
    addObject,
    requestedViewPreset,
    setCameraViewPreset,
    zoomExtentsTrigger,
    setZoomExtentsTriggered,
    cameraFov, 
    worldBackgroundColor,
    appMode, 
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
    
    const allIntersectables = sceneRef.current.children.filter(c => 
        c.visible && 
        c.name !== 'gridHelper' && 
        !(c instanceof TransformControls) && 
        !(c.type === 'PointLightHelper' || c.type === 'SpotLightHelper' || c.type === 'RectAreaLightHelper') && 
        c !== tempDrawingMeshRef.current && 
        c !== tempMeasureLineRef.current &&
        c !== lastCompletedMeasureLineRef.current &&
        !c.name.endsWith('_modelling_dir_light_helper') 
    );

    const intersects = raycaster.current.intersectObjects(allIntersectables, true);
    if (intersects.length > 0) {
        let firstIntersectedObject = intersects[0].object;
        
        while(firstIntersectedObject.parent && firstIntersectedObject.parent !== sceneRef.current && !firstIntersectedObject.name){
            firstIntersectedObject = firstIntersectedObject.parent; 
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
    if (!mountRef.current || !cameraRef.current) return null;
    const rect = mountRef.current.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.current.setFromCamera(mouse.current, cameraRef.current);

    const intersectionPoint = new THREE.Vector3();
    if (raycaster.current.ray.intersectPlane(plane, intersectionPoint)) {
        return intersectionPoint;
    }
    return null;
  }, [cameraRef, mountRef]);


  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(worldBackgroundColor); 
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(cameraFov, currentMount.clientWidth / currentMount.clientHeight, 0.1, 50000);
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
        const obj = transformControls.object; 
        const sceneObj = sceneContextObjects.find(o => o.id === obj.name); 
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
    
    const gridHelper = new THREE.GridHelper(500, 100, 0x555555, 0x444444); 
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
      clearLastMeasurement(); 
      scene.children
        .filter(obj => obj.name && (obj.name.endsWith('_helper') || obj.name.endsWith('_modelling_dir_light_helper'))) 
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
    if (cameraRef.current && cameraRef.current.fov !== cameraFov) {
      cameraRef.current.fov = cameraFov;
      cameraRef.current.updateProjectionMatrix();
    }
  }, [cameraFov]);

  useEffect(() => {
    if (sceneRef.current && worldBackgroundColor) {
      sceneRef.current.background = new THREE.Color(worldBackgroundColor);
    }
  }, [worldBackgroundColor]);


  const clearLastMeasurement = useCallback(() => {
    if (lastCompletedMeasureLineRef.current && sceneRef.current) {
      sceneRef.current.remove(lastCompletedMeasureLineRef.current);
      lastCompletedMeasureLineRef.current.geometry.dispose();
      (lastCompletedMeasureLineRef.current.material as THREE.Material).dispose();
      lastCompletedMeasureLineRef.current = null;
    }
    if (lastCompletedMeasureDisplayTextRef.current && lastCompletedMeasureDisplayTextRef.current.parentElement) {
      lastCompletedMeasureDisplayTextRef.current.parentElement.removeChild(lastCompletedMeasureDisplayTextRef.current);
      lastCompletedMeasureDisplayTextRef.current = null;
    }
    setMeasureDisplay(null); 
  }, []);
  

  useEffect(() => {
    if (sceneRef.current) {
      const drawingToolActive = ['rectangle', 'line', 'arc', 'circle', 'polygon', 'freehand'].includes(activeTool || '');
      const measureToolActive = activeTool === 'tape' || activeTool === 'protractor';

      if (!drawingToolActive && tempDrawingMeshRef.current) {
        sceneRef.current.remove(tempDrawingMeshRef.current);
        tempDrawingMeshRef.current.geometry.dispose();
        (tempDrawingMeshRef.current.material as THREE.Material).dispose();
        tempDrawingMeshRef.current = null;
      }
      if (!measureToolActive) {
        if (tempMeasureLineRef.current) {
          sceneRef.current.remove(tempMeasureLineRef.current);
          tempMeasureLineRef.current.geometry.dispose();
          (tempMeasureLineRef.current.material as THREE.Material).dispose();
          tempMeasureLineRef.current = null;
        }
        clearLastMeasurement(); 
      } else if (activeTool === 'tape') {
        // When tape tool becomes active, clear any previous persistent measurement
        // to ensure a clean state for a new measurement.
        clearLastMeasurement();
      }
    }
  }, [activeTool, clearLastMeasurement]); 


  const onPointerDown = useCallback((event: PointerEvent) => {
    if (transformControlsRef.current?.dragging) return;

    const intersectionWithObject = getMouseIntersection(event);
    const pointOnXZPlane = getMousePositionOnXZPlane(event);

    let startPointForDrawingOrMeasure = intersectionWithObject?.point || pointOnXZPlane;


    if (activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'polygon' || activeTool === 'line' || activeTool === 'freehand' || activeTool === 'arc') {
      if (startPointForDrawingOrMeasure && sceneRef.current) {
        if (!drawingState.isActive || drawingState.tool !== activeTool) {
            setDrawingState({ isActive: true, startPoint: startPointForDrawingOrMeasure.toArray() as [number,number,number], currentPoint: startPointForDrawingOrMeasure.toArray() as [number,number,number], tool: activeTool as DrawingState['tool'] });
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
    } else if (activeTool === 'tape' || activeTool === 'protractor') { 
        startPointForDrawingOrMeasure = intersectionWithObject?.point || pointOnXZPlane;

        if (startPointForDrawingOrMeasure && sceneRef.current) { 
            if (!drawingState.startPoint || drawingState.tool !== activeTool || drawingState.measureDistance !== null) { 
                clearLastMeasurement(); // Clear previous persistent measurement before starting a new one
                setDrawingState({ 
                    isActive: true, 
                    startPoint: startPointForDrawingOrMeasure.toArray() as [number,number,number], 
                    currentPoint: startPointForDrawingOrMeasure.toArray() as [number,number,number],
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
                const lineGeometry = new THREE.BufferGeometry().setFromPoints([startPointForDrawingOrMeasure, startPointForDrawingOrMeasure.clone()]);
                tempMeasureLineRef.current = new THREE.Line(lineGeometry, lineMaterial);
                tempMeasureLineRef.current.renderOrder = 1000;
                sceneRef.current.add(tempMeasureLineRef.current);
            } else { 
                const startVec = new THREE.Vector3().fromArray(drawingState.startPoint);
                const currentEndPoint = (intersectionWithObject?.point || pointOnXZPlane)?.toArray() as [number, number, number] | undefined;
                if (!currentEndPoint) return;

                const endVec = new THREE.Vector3().fromArray(currentEndPoint);
                const distance = startVec.distanceTo(endVec);
                
                toast({
                    title: activeTool === 'tape' ? "Measurement Complete" : "Protractor (First Leg)",
                    description: activeTool === 'tape' ? `Distance: ${distance.toFixed(3)} ${measurementUnit}` : `Length: ${distance.toFixed(3)}. Click for angle.`,
                });
                
                if (activeTool === 'tape') {
                    if (tempMeasureLineRef.current && mountRef.current && cameraRef.current) {
                        lastCompletedMeasureLineRef.current = tempMeasureLineRef.current.clone();
                        sceneRef.current.add(lastCompletedMeasureLineRef.current);
                        tempMeasureLineRef.current = null; 

                        const midPointDisplay = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
                        const screenPos = midPointDisplay.clone().project(cameraRef.current);
                        const x = (screenPos.x * 0.5 + 0.5) * mountRef.current.clientWidth;
                        const y = (-screenPos.y * 0.5 + 0.5) * mountRef.current.clientHeight;
                        
                        const textDiv = document.createElement('div');
                        textDiv.style.position = 'absolute';
                        textDiv.style.left = `${x}px`;
                        textDiv.style.top = `${y}px`;
                        textDiv.style.color = 'hsl(var(--foreground))';
                        textDiv.style.backgroundColor = 'hsla(var(--background), 0.75)';
                        textDiv.style.padding = '3px 7px';
                        textDiv.style.borderRadius = '4px';
                        textDiv.style.fontSize = '12px';
                        textDiv.style.border = '1px solid hsl(var(--border))';
                        textDiv.style.pointerEvents = 'none';
                        textDiv.style.transform = 'translate(10px, -100%)';
                        textDiv.style.zIndex = "1001";
                        textDiv.innerText = `${distance.toFixed(2)} ${measurementUnit}`;
                        mountRef.current.appendChild(textDiv);
                        lastCompletedMeasureDisplayTextRef.current = textDiv;
                    }
                    setMeasureDisplay(null); 
                    setDrawingState({ startPoint: null, currentPoint: null, tool: activeTool, measureDistance: distance, isActive: false }); 
                    if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;
                } else { 
                    setDrawingState({ 
                      currentPoint: endVec.toArray() as [number, number, number], 
                      measureDistance: distance, 
                    });
                }
            }
        }
    } else if (activeTool === 'pushpull') {
        if (intersectionWithObject && intersectionWithObject.object && intersectionWithObject.face && intersectionWithObject.normal && sceneRef.current) {
            const clickedMesh = intersectionWithObject.object as THREE.Mesh;
            const clickedObjectId = clickedMesh.name;
            const clickedSceneObject = sceneContextObjects.find(o => o.id === clickedObjectId);

            if (clickedSceneObject && (clickedSceneObject.type === 'cube' || clickedSceneObject.type === 'plane' || clickedSceneObject.type === 'cylinder' || clickedSceneObject.type === 'polygon' || clickedSceneObject.type === 'circle')) { 
                const localFaceNormal = intersectionWithObject.face.normal.clone(); 
                const worldFaceNormal = localFaceNormal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(clickedMesh.matrixWorld)).normalize();
                const initialLocalIntersectPoint = clickedMesh.worldToLocal(intersectionWithObject.point.clone());

                const pushPullInfo: PushPullFaceInfo = {
                    objectId: clickedObjectId,
                    initialMeshWorldPosition: clickedMesh.position.toArray() as [number, number, number],
                    initialLocalIntersectPoint: initialLocalIntersectPoint.toArray() as [number,number,number],
                    initialWorldIntersectionPoint: intersectionWithObject.point.toArray() as [number, number, number], 
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
                toast({ title: "Push/Pull Tool", description: "Select a face of a Cube, Plane, Cylinder, Polygon, or Circle to push/pull.", variant: "default" });
            }
        } else {
             toast({ title: "Push/Pull Tool", description: "Click on a face of a compatible object.", variant: "default" });
        }
    }
  }, [activeTool, getMouseIntersection, getMousePositionOnXZPlane, setDrawingState, drawingState, toast, sceneContextObjects, selectObject, measurementUnit, clearLastMeasurement]);

  const onPointerMove = useCallback((event: PointerEvent) => {
    const intersectionWithObject = getMouseIntersection(event);
    const pointOnXZPlane = getMousePositionOnXZPlane(event);
    let currentMovePoint = intersectionWithObject?.point || pointOnXZPlane;


    if (drawingState.isActive && drawingState.startPoint && sceneRef.current && tempDrawingMeshRef.current && ['rectangle', 'circle', 'polygon', 'line', 'freehand', 'arc'].includes(activeTool || '')) {
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
            const tempPointsVec: THREE.Vector3[] = [];
            
            const up = new THREE.Vector3(0,1,0); 
            const forward = cameraRef.current ? cameraRef.current.getWorldDirection(new THREE.Vector3()) : new THREE.Vector3(0,0,-1);
            const right = new THREE.Vector3().crossVectors(up, forward).normalize(); 
            const planeNormal = up; 

            for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const p = new THREE.Vector3()
                    .copy(right)
                    .multiplyScalar(radius * Math.cos(angle))
                    .addScaledVector(new THREE.Vector3().crossVectors(planeNormal, right).normalize(), radius * Math.sin(angle))
                    .add(startVec);
                tempPointsVec.push(p);
            }
             for (let i = 0; i < segments; i++) {
                points.push(tempPointsVec[i].x, tempPointsVec[i].y, tempPointsVec[i].z);
                points.push(tempPointsVec[(i + 1) % segments].x, tempPointsVec[(i + 1) % segments].y, tempPointsVec[(i + 1) % segments].z);
            }
        }
        
        if (points.length > 0) {
            tempDrawingMeshRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
            tempDrawingMeshRef.current.geometry.computeBoundingSphere(); 
        }
      }
    } else if (activeTool && ['tape','protractor'].includes(activeTool) && drawingState.isActive && drawingState.startPoint && !drawingState.measureDistance && sceneRef.current && tempMeasureLineRef.current && drawingState.tool === activeTool && cameraRef.current && mountRef.current) {
        currentMovePoint = intersectionWithObject?.point || pointOnXZPlane;
        
        if (currentMovePoint) {
            setDrawingState({ currentPoint: currentMovePoint.toArray() as [number,number,number] });
            const startVec = new THREE.Vector3().fromArray(drawingState.startPoint);
            tempMeasureLineRef.current.geometry.setFromPoints([startVec, currentMovePoint]);
            tempMeasureLineRef.current.geometry.computeBoundingSphere();

            const dist = startVec.distanceTo(currentMovePoint);
            const midPointDisplay = new THREE.Vector3().addVectors(startVec, currentMovePoint).multiplyScalar(0.5);
            const screenPos = midPointDisplay.clone().project(cameraRef.current);
            const x = (screenPos.x * 0.5 + 0.5) * mountRef.current.clientWidth;
            const y = (-screenPos.y * 0.5 + 0.5) * mountRef.current.clientHeight;
            setMeasureDisplay({ x, y, text: `${dist.toFixed(2)} ${measurementUnit}` });
        }
    } else if (activeTool === 'pushpull' && drawingState.isActive && drawingState.pushPullFaceInfo && cameraRef.current && sceneRef.current && mountRef.current) {
        const { objectId, initialWorldIntersectionPoint, worldFaceNormal, originalDimensions, originalPosition, originalRotation, originalType } = drawingState.pushPullFaceInfo;
        const initialWorldIntersectVec = new THREE.Vector3().fromArray(initialWorldIntersectionPoint);
        const worldFaceNormalVec = new THREE.Vector3().fromArray(worldFaceNormal);
        
        const rect = mountRef.current.getBoundingClientRect();
        mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.current.setFromCamera(mouse.current, cameraRef.current);
        const ray = raycaster.current.ray;
        
        const dragPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(ray.direction.clone().negate(), initialWorldIntersectVec);
        const currentDragPlaneIntersectionPoint = new THREE.Vector3();

        if (ray.intersectPlane(dragPlane, currentDragPlaneIntersectionPoint)) {
            const dragVector = currentDragPlaneIntersectionPoint.clone().sub(initialWorldIntersectVec);
            let pushPullAmount = dragVector.dot(worldFaceNormalVec);
            
            let newDimensions: SceneObjectDimensions = { ...originalDimensions };
            let newPositionArray: [number, number, number];
            let newRotationArray: [number, number, number] | undefined = [...originalRotation] as [number,number,number]; 
            let newType: PrimitiveType = originalType;

             if (originalType === 'cube' || originalType === 'cylinder' || originalType === 'polygon' || originalType === 'circle') {
                const localFaceNormalVec = new THREE.Vector3().fromArray(drawingState.pushPullFaceInfo.localFaceNormal);
                let dimensionToModify: 'width' | 'height' | 'depth' | 'radius' | undefined;
                
                if (originalType === 'cube') {
                    const absX = Math.abs(localFaceNormalVec.x);
                    const absY = Math.abs(localFaceNormalVec.y);
                    const absZ = Math.abs(localFaceNormalVec.z);
                    if (absX > absY && absX > absZ) dimensionToModify = 'width';
                    else if (absY > absX && absY > absZ) dimensionToModify = 'height';
                    else if (absZ > absX && absZ > absY) dimensionToModify = 'depth';
                } else if (originalType === 'cylinder' || originalType === 'polygon' || originalType === 'circle') {
                    if (Math.abs(localFaceNormalVec.y) > 0.9) dimensionToModify = 'height'; 
                    else dimensionToModify = 'radius'; 
                }

                if (dimensionToModify) {
                    let currentDimValue: number;
                    if (dimensionToModify === 'radius') {
                        if (originalType === 'cylinder') currentDimValue = originalDimensions.radiusTop ?? originalDimensions.radiusBottom ?? 1;
                        else currentDimValue = originalDimensions.radius ?? 1;
                        const newRadius = Math.max(0.01, currentDimValue + pushPullAmount);
                        if (originalType === 'cylinder') { newDimensions.radiusTop = newRadius; newDimensions.radiusBottom = newRadius; }
                        else { newDimensions.radius = newRadius; }
                    } else {
                        currentDimValue = originalDimensions[dimensionToModify as 'width'|'height'|'depth'] || 1;
                        newDimensions[dimensionToModify as 'width'|'height'|'depth'] = Math.max(0.01, currentDimValue + pushPullAmount);
                    }
                }
                const positionOffset = worldFaceNormalVec.clone().multiplyScalar(pushPullAmount / 2);
                newPositionArray = new THREE.Vector3().fromArray(originalPosition).add(positionOffset).toArray() as [number,number,number];
            } else if (originalType === 'plane') {
                newType = 'cube'; 
                const extrusionHeight = Math.max(0.01, Math.abs(pushPullAmount)); 
                newDimensions = { 
                    width: originalDimensions.width || 1, 
                    depth: originalDimensions.height || 1, 
                    height: extrusionHeight, 
                };
                const extrusionOffset = worldFaceNormalVec.clone().multiplyScalar(pushPullAmount / 2); 
                newPositionArray = new THREE.Vector3().fromArray(originalPosition).add(extrusionOffset).toArray() as [number,number,number];
                if (Math.abs(worldFaceNormalVec.y) < 0.9) { 
                  // No special rotation change if extruding from a side-facing plane
                } else { 
                     newRotationArray = [0,0,0]; 
                }
            } else {
                newPositionArray = [...originalPosition] as [number,number,number];
            }
            
            const updates: Partial<SceneObject> = { dimensions: newDimensions, position: newPositionArray, rotation: newRotationArray };
            if (newType !== originalType) updates.type = newType;
            updateObject(objectId, updates);
        }
    }
  }, [activeTool, drawingState, getMouseIntersection, getMousePositionOnXZPlane, updateObject, cameraRef, mountRef, setDrawingState, measurementUnit]);

  const onPointerUp = useCallback((event: PointerEvent) => {
    if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;
    
    const toolIsPersistent = ['rectangle', 'circle', 'polygon', 'line', 'freehand', 'arc', 'pushpull', 'tape', 'eraser', 'paint'].includes(activeTool || '');

    if (drawingState.isActive && drawingState.startPoint && drawingState.currentPoint && ['rectangle', 'circle', 'polygon', 'line', 'freehand', 'arc'].includes(drawingState.tool || '')) {
      const startPointVec = new THREE.Vector3().fromArray(drawingState.startPoint);
      const endPointVec = new THREE.Vector3().fromArray(drawingState.currentPoint);
      const tool = drawingState.tool;
      let newObjProps: Partial<Omit<SceneObject, 'id' | 'type' | 'planData'>> = {};
      let primitiveType: PrimitiveType | null = null;

      if (tool === 'rectangle') {
        const rectWidth = Math.abs(endPointVec.x - startPointVec.x);
        const rectDepth = Math.abs(endPointVec.z - startPointVec.z);
        if (rectWidth > 0.01 && rectDepth > 0.01) { 
            primitiveType = 'plane';
            newObjProps = {
                position: [(startPointVec.x + endPointVec.x) / 2, startPointVec.y, (startPointVec.z + endPointVec.z) / 2], 
                rotation: [-Math.PI / 2, 0, 0], 
                dimensions: { width: rectWidth, height: rectDepth }, 
            };
        }
      } else if (tool === 'circle') {
          const radius = startPointVec.distanceTo(endPointVec);
          if (radius > 0.01) {
              primitiveType = 'circle'; 
              newObjProps = {
                  position: [startPointVec.x, startPointVec.y, startPointVec.z], 
                  rotation: [-Math.PI / 2, 0, 0], 
                  dimensions: { radius: radius, sides: 32 } 
              };
          }
      } else if (tool === 'polygon') {
          const radius = startPointVec.distanceTo(endPointVec);
          if (radius > 0.01) {
              primitiveType = 'polygon';
              newObjProps = {
                  position: [startPointVec.x, startPointVec.y, startPointVec.z],
                  rotation: [-Math.PI/2, 0, 0], 
                  dimensions: { radius: radius, sides: drawingState.polygonSides || 6 }
              };
          }
      }
      
      if (primitiveType && newObjProps.dimensions) {
        const newObj = addObject(primitiveType as Exclude<PrimitiveType, 'cadPlan'>, { ...newObjProps, materialId: DEFAULT_MATERIAL_ID });
        toast({ title: `${primitiveType.charAt(0).toUpperCase() + primitiveType.slice(1)} Drawn`, description: `${newObj.name} added.` });
      }
      // For drawing tools, reset drawing state but keep tool active if persistent
      if (toolIsPersistent && drawingState.tool && drawingTools.includes(drawingState.tool)) {
        setDrawingState({ isActive: false, startPoint: null, currentPoint: null, tool: drawingState.tool });
      } else {
        setDrawingState({ isActive: false, startPoint: null, currentPoint: null, tool: null });
        if (!toolIsPersistent && activeTool) setActiveTool(undefined); // Deactivate non-persistent tools
      }
      return; 
    } else if (activeTool === 'tape' && drawingState.isActive && drawingState.startPoint && !drawingState.measureDistance && drawingState.tool === activeTool) {
        // Logic for completing tape measure is in onPointerDown's second click.
        // Here, just ensure the tool remains active for another measurement.
        if (toolIsPersistent) {
             setDrawingState({ isActive: false, startPoint: null, currentPoint: null, tool: activeTool as DrawingState['tool'], measureDistance: drawingState.measureDistance });
        } else {
             setDrawingState({ isActive: false, startPoint: null, currentPoint: null, tool: null, measureDistance: drawingState.measureDistance });
             if (activeTool) setActiveTool(undefined);
        }
        return;
    } else if (activeTool === 'pushpull' && drawingState.isActive && drawingState.pushPullFaceInfo && drawingState.tool === 'pushpull') {
        const { objectId, originalType } = drawingState.pushPullFaceInfo;
        const finalObject = sceneContextObjects.find(o => o.id === objectId);
        toast({ 
            title: "Push/Pull Complete", 
            description: `${finalObject?.name || 'Object'} modified. ${originalType === 'plane' && finalObject?.type === 'cube' ? 'Plane extruded to a cube.' : (originalType === 'circle' && finalObject?.type === 'cylinder' ? 'Circle extruded to a cylinder.' : '')}` 
        });
        if (toolIsPersistent) {
            setDrawingState({ isActive: false, tool: activeTool as DrawingState['tool'], pushPullFaceInfo: null }); 
        } else {
            setDrawingState({ isActive: false, tool: null, pushPullFaceInfo: null });
            if (activeTool) setActiveTool(undefined);
        }
        return;
    }

    if (measureDisplay && activeTool !== 'tape' && activeTool !== 'protractor') {
         setMeasureDisplay(null);
    }


    if (!drawingState.isActive && !transformControlsRef.current?.dragging) {
      const intersection = getMouseIntersection(event);
      if (intersection && intersection.object && !(intersection.object instanceof THREE.GridHelper)) { 
        const clickedObjectId = intersection.object.name;
        const clickedSceneObject = sceneContextObjects.find(o => o.id === clickedObjectId);

        if (clickedSceneObject) {
          if (activeTool === 'paint' && activePaintMaterialId) {
            const materialToApply = getMaterialById(activePaintMaterialId);
            if (materialToApply) {
              updateObject(clickedObjectId, { materialId: activePaintMaterialId });
              toast({ title: "Material Applied", description: `${materialToApply.name || 'Material'} applied to ${clickedSceneObject.name}.` });
            } else {
              toast({ title: "Paint Error", description: "Selected paint material not found.", variant: "destructive" });
            }
             if (!toolIsPersistent) setActiveTool(undefined);
          } else if (activeTool === 'eraser') {
            removeObject(clickedObjectId);
            toast({ title: "Object Deleted", description: `${clickedSceneObject.name} removed from scene.` });
            if (!toolIsPersistent) setActiveTool(undefined);
          } else if (activeTool !== 'pushpull' && !['tape', 'protractor', 'rectangle', 'circle', 'polygon', 'line', 'freehand', 'arc'].includes(activeTool || '')) { 
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
    
    // General cleanup for non-persistent tools or when drawing state is not active
    if (!toolIsPersistent && activeTool) {
      setActiveTool(undefined); // This will also clear drawingState via setActiveTool's logic
    } else if (!drawingState.isActive && drawingState.tool !== null && !persistentTools.includes(drawingState.tool)) {
      // If drawing state somehow became inactive for a non-persistent tool, clear it
      setDrawingState({ isActive: false, startPoint: null, currentPoint: null, tool: null, pushPullFaceInfo: null, measureDistance: null });
    }

  }, [activeTool, drawingState, getMouseIntersection, setDrawingState, addObject, sceneContextObjects, toast, selectObject, activePaintMaterialId, getMaterialById, updateObject, removeObject, measureDisplay, measurementUnit, setActiveTool]);

  const persistentTools: ToolType[] = ['rectangle', 'line', 'arc', 'tape', 'pushpull', 'circle', 'polygon', 'freehand', 'protractor', 'eraser', 'paint'];
  const drawingTools: ToolType[] = ['rectangle', 'line', 'arc', 'circle', 'polygon', 'freehand'];

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

    const isDrawingOrModToolActive = ['rectangle', 'line', 'arc', 'circle', 'polygon', 'freehand', 'tape', 'protractor', 'pushpull'].includes(activeTool || '');
    const selectedThreeObject = selectedObjectId ? sceneRef.current.getObjectByName(selectedObjectId) : null;

    if (selectedThreeObject && (selectedThreeObject instanceof THREE.Mesh || selectedThreeObject instanceof THREE.Group) && !isDrawingOrModToolActive && (activeTool === 'move' || activeTool === 'rotate' || activeTool === 'scale')) { 
      tc.attach(selectedThreeObject);
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

    // Ambient Light
    let ambientLight = scene.getObjectByName('ambientLight') as THREE.AmbientLight;
    if (!ambientLight) {
      ambientLight = new THREE.AmbientLight(ambientLightProps.color, ambientLightProps.intensity);
      ambientLight.name = 'ambientLight';
      scene.add(ambientLight);
    }
    ambientLight.color.set(ambientLightProps.color);
    ambientLight.intensity = appMode === 'modelling' ? 1.0 : ambientLightProps.intensity; 

    // Context Directional Light (Main scene light, potentially with shadows)
    let dirLight = scene.getObjectByName(directionalLightProps.id) as THREE.DirectionalLight;
    let dirLightHelper = scene.getObjectByName(`${directionalLightProps.id}_helper`) as THREE.DirectionalLightHelper;

    // Simplified Directional Light for Modelling Mode
    const modellingDirLightName = 'modelling_dir_light';
    let modellingDirLight = scene.getObjectByName(modellingDirLightName) as THREE.DirectionalLight;
    let modellingDirLightHelper = scene.getObjectByName(`${modellingDirLightName}_helper`) as THREE.DirectionalLightHelper;


    if (appMode === 'rendering') {
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
        if (dirLight.target) dirLight.target.position.set(0,0,0); 
        
        if (dirLightHelper) {
          dirLightHelper.visible = directionalLightProps.visible ?? true; 
          dirLightHelper.update();
        } else {
            dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 1);
            dirLightHelper.name = `${directionalLightProps.id}_helper`;
            scene.add(dirLightHelper);
            dirLightHelper.visible = directionalLightProps.visible ?? true;
        }

        if (directionalLightProps.castShadow) {
          dirLight.shadow.mapSize.width = 2048; dirLight.shadow.mapSize.height = 2048;
          dirLight.shadow.camera.near = 0.5; dirLight.shadow.camera.far = 500; 
          const shadowCamSize = 150; 
          dirLight.shadow.camera.left = -shadowCamSize; dirLight.shadow.camera.right = shadowCamSize;
          dirLight.shadow.camera.top = shadowCamSize; dirLight.shadow.camera.bottom = -shadowCamSize;
          dirLight.shadow.camera.updateProjectionMatrix();
        }
        // Hide modelling light in rendering mode
        if (modellingDirLight) modellingDirLight.visible = false;
        if (modellingDirLightHelper) modellingDirLightHelper.visible = false;

    } else { // Modelling mode for main directional light
        if (dirLight) dirLight.visible = false;
        if (dirLightHelper) dirLightHelper.visible = false;

        // Setup modelling light
        if (!modellingDirLight) {
            modellingDirLight = new THREE.DirectionalLight(0xffffff, 0.3); // Reduced intensity
            modellingDirLight.name = modellingDirLightName;
            modellingDirLight.position.set(1, 1.5, 1).normalize();
            modellingDirLight.castShadow = false; // No shadows in modelling mode
            scene.add(modellingDirLight);
            if (modellingDirLight.target && !modellingDirLight.target.parent) scene.add(modellingDirLight.target);
            // Modelling light helper is not typically shown
        }
        modellingDirLight.visible = true;
        modellingDirLight.intensity = 0.3; // Ensure intensity is set
        if (modellingDirLight.target) modellingDirLight.target.position.set(0,0,0);
    }


    // Other Lights (Point, Spot, Area) - only visible in rendering mode
    const existingLightIdsInThree = scene.children
      .filter(child => child instanceof THREE.Light && child.name !== 'ambientLight' && child.name !== directionalLightProps.id && child.name !== modellingDirLightName && !(child instanceof THREE.HemisphereLight) ) 
      .map(child => child.name);
    const contextLightIds = (otherLights || []).map(l => l.id);

    (otherLights || []).forEach(lightData => {
      let lightObject = scene.getObjectByName(lightData.id) as THREE.Light;
      let helper = scene.getObjectByName(`${lightData.id}_helper`);

      const isVisibleInCurrentMode = appMode === 'rendering' && (lightData.visible ?? true);

      if (!lightObject) {
        switch (lightData.type) {
          case 'point': lightObject = new THREE.PointLight(); helper = new THREE.PointLightHelper(lightObject as THREE.PointLight, 0.5); break;
          case 'spot': lightObject = new THREE.SpotLight(); if ((lightObject as THREE.SpotLight).target && !(lightObject as THREE.SpotLight).target.parent) scene.add((lightObject as THREE.SpotLight).target); helper = new THREE.SpotLightHelper(lightObject as THREE.SpotLight); break;
          case 'area': lightObject = new THREE.RectAreaLight(); helper = new RectAreaLightHelper(lightObject as THREE.RectAreaLight); break;
          default: return; 
        }
        lightObject.name = lightData.id;
        scene.add(lightObject);
        if (helper) { helper.name = `${lightData.id}_helper`; scene.add(helper); }
      }

      lightObject.color.set(lightData.color);
      lightObject.intensity = lightData.intensity;
      lightObject.visible = isVisibleInCurrentMode;
      if(helper) helper.visible = isVisibleInCurrentMode;

      if (lightObject instanceof THREE.PointLight && lightData.type === 'point') {
        lightObject.position.set(...(lightData as PointLightSceneProps).position);
        lightObject.distance = (lightData as PointLightSceneProps).distance || 0;
        lightObject.decay = (lightData as PointLightSceneProps).decay || 2; 
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
      }
      if (typeof (helper as any)?.update === 'function') (helper as any).update();
    });

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

  }, [ambientLightProps, directionalLightProps, otherLights, appMode]);


  useEffect(() => {
    if (!sceneRef.current || !getMaterialById) return;
    const scene = sceneRef.current;

    const existingObjectIdsInThree = scene.children
      .filter(child => child.name && child.name !== 'gridHelper' && !(child === tempDrawingMeshRef.current) && !(child === tempMeasureLineRef.current) && !(child === lastCompletedMeasureLineRef.current) && !child.name.startsWith('modelling_dir_light') )
      .map(child => child.name);
      
    const contextObjectIds = sceneContextObjects.map(obj => obj.id);

    sceneContextObjects.forEach(objData => {
      let meshOrGroup = scene.getObjectByName(objData.id) as THREE.Mesh | THREE.Group;
      const materialProps = getMaterialById(objData.materialId);
      
      if (!materialProps && objData.type !== 'cadPlan') { 
        console.warn(`Material ${objData.materialId} not found for object ${objData.id}, using default or skipping.`);
      }

      if (meshOrGroup) { 
        const isTransforming = transformControlsRef.current?.object === meshOrGroup && transformControlsRef.current?.dragging;
        const isPushPulling = drawingState.isActive && drawingState.tool === 'pushpull' && drawingState.pushPullFaceInfo?.objectId === objData.id;

        if (objData.type === 'cadPlan' && meshOrGroup instanceof THREE.Group) {
            if (!isTransforming) { 
                meshOrGroup.position.set(...objData.position);
                meshOrGroup.rotation.set(...objData.rotation);
                meshOrGroup.scale.set(...objData.scale);
            }
            meshOrGroup.visible = objData.visible ?? true;
            if (materialProps) {
                meshOrGroup.children.forEach(child => {
                    if (child instanceof THREE.LineSegments && child.material instanceof THREE.LineBasicMaterial) {
                        child.material.color.set(materialProps.color);
                        child.material.needsUpdate = true;
                    }
                });
            }
        } else if (meshOrGroup instanceof THREE.Mesh) { 
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
      } else { 
        if (objData.type === 'cadPlan' && objData.planData) {
            const planGroup = new THREE.Group();
            planGroup.name = objData.id;
            planGroup.userData = { objectType: 'cadPlan' }; 

            const cadMaterial = new THREE.LineBasicMaterial({
                color: materialProps?.color || 0x888888, 
                linewidth: 1, 
                depthTest: true, 
            });

            const points: THREE.Vector3[] = [];
            objData.planData.lines.forEach(line => {
                points.push(new THREE.Vector3(line.start[0], 0, line.start[1])); 
                points.push(new THREE.Vector3(line.end[0], 0, line.end[1]));
            });
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineSegments = new THREE.LineSegments(geometry, cadMaterial);
            lineSegments.renderOrder = 0; 
            
            planGroup.add(lineSegments);
            planGroup.position.set(...objData.position);
            planGroup.rotation.set(...objData.rotation);
            planGroup.scale.set(...objData.scale);
            planGroup.visible = objData.visible ?? true;
            scene.add(planGroup);
        } else if (objData.type !== 'cadPlan' && materialProps) { 
            const material = createOrUpdateMaterial(materialProps);
            const newMesh = createPrimitive(objData, material);
            scene.add(newMesh);
        }
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
          } else if (objectToRemove instanceof THREE.Group && objectToRemove.userData.objectType === 'cadPlan') {
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

  }, [sceneContextObjects, getMaterialById, drawingState.isActive, drawingState.tool, drawingState.pushPullFaceInfo?.objectId]);

  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.children.forEach(child => {
      if (child.name && child.name !== 'gridHelper' && !(child === tempDrawingMeshRef.current) && !(child === tempMeasureLineRef.current) && !(child === lastCompletedMeasureLineRef.current) && !child.name.startsWith('modelling_dir_light')) { 
          const isMesh = child instanceof THREE.Mesh;
          const isGroup = child instanceof THREE.Group; 

          if (isMesh || (isGroup && child.userData.objectType === 'cadPlan')) {
            const isSelected = child.name === selectedObjectId;
            const isTransforming = transformControlsRef.current?.object === child && transformControlsRef.current?.visible && transformControlsRef.current.dragging;
            const isPushPullTarget = drawingState.tool === 'pushpull' && drawingState.pushPullFaceInfo?.objectId === child.name && drawingState.isActive;

            if (isMesh && Array.isArray(child.material)) {
              // Handle array of materials if necessary (e.g. multi-material objects)
            } else if (isMesh && child.material instanceof THREE.MeshStandardMaterial) {
                if (child.userData.originalEmissive === undefined) { 
                    child.userData.originalEmissive = child.material.emissive.getHex(); 
                }
                if (child.userData.originalEmissiveIntensity === undefined) {
                    child.userData.originalEmissiveIntensity = child.material.emissiveIntensity;
                }

                if ((isSelected && !isTransforming && !isPushPullTarget) || (isPushPullTarget && drawingState.isActive)) { 
                    child.material.emissive.setHex(0x00B8D9); 
                    child.material.emissiveIntensity = isPushPullTarget ? 0.9 : 0.7;
                } else {
                    const originalMaterial = getMaterialById(sceneContextObjects.find(o => o.id === child.name)?.materialId || DEFAULT_MATERIAL_ID);
                    if (originalMaterial?.emissive && originalMaterial.emissive !== '#000000') {
                        child.material.emissive.set(originalMaterial.emissive);
                        child.material.emissiveIntensity = originalMaterial.emissiveIntensity ?? 0;
                    } else {
                        child.material.emissive.setHex(child.userData.originalEmissive ?? 0x000000);
                        child.material.emissiveIntensity = child.userData.originalEmissiveIntensity ?? 0;
                    }
                }
                child.material.needsUpdate = true;
            } else if (isGroup && child.userData.objectType === 'cadPlan' && isSelected && !isTransforming) {
                child.children.forEach(lineSegment => {
                    if (lineSegment instanceof THREE.LineSegments && lineSegment.material instanceof THREE.LineBasicMaterial) {
                        if (lineSegment.userData.originalColor === undefined) {
                             lineSegment.userData.originalColor = lineSegment.material.color.getHex();
                        }
                        lineSegment.material.color.setHex(0x00B8D9); 
                        lineSegment.material.needsUpdate = true;
                    }
                });
            } else if (isGroup && child.userData.objectType === 'cadPlan' && !isSelected) {
                child.children.forEach(lineSegment => {
                    if (lineSegment instanceof THREE.LineSegments && lineSegment.material instanceof THREE.LineBasicMaterial && lineSegment.userData.originalColor !== undefined) {
                        lineSegment.material.color.setHex(lineSegment.userData.originalColor);
                        lineSegment.material.needsUpdate = true;
                    }
                });
            }
          }
      }
    });
  }, [selectedObjectId, activeTool, drawingState, sceneContextObjects, getMaterialById]); 

  useEffect(() => {
    if (!requestedViewPreset || !cameraRef.current || !orbitControlsRef.current) return;

    const cam = cameraRef.current;
    const controls = orbitControlsRef.current;
    const distance = cam.position.distanceTo(controls.target); 
    const target = controls.target.clone();
    let yOffset = target.y > 0.01 ? target.y : 1.5; 

    switch (requestedViewPreset) {
      case 'top':
        cam.position.set(target.x, target.y + distance, target.z + 0.001); 
        cam.up.set(0, 0, -1); 
        controls.target.set(target.x, target.y, target.z);
        break;
      case 'bottom':
        cam.position.set(target.x, target.y - distance, target.z + 0.001);
        cam.up.set(0, 0, 1);
        controls.target.set(target.x, target.y, target.z);
        break;
      case 'front':
        cam.position.set(target.x, yOffset, target.z + distance);
        cam.up.set(0, 1, 0);
        controls.target.set(target.x, yOffset, target.z);
        break;
      case 'back':
        cam.position.set(target.x, yOffset, target.z - distance);
        cam.up.set(0, 1, 0);
        controls.target.set(target.x, yOffset, target.z);
        break;
      case 'right':
        cam.position.set(target.x + distance, yOffset, target.z);
        cam.up.set(0, 1, 0);
        controls.target.set(target.x, yOffset, target.z);
        break;
      case 'left':
        cam.position.set(target.x - distance, yOffset, target.z);
        cam.up.set(0, 1, 0);
        controls.target.set(target.x, yOffset, target.z);
        break;
      case 'perspective':
      default:
        cam.position.set(distance * 0.7 || 15, distance * 0.7 || 15, distance * 0.7 || 15);
        cam.up.set(0, 1, 0);
        controls.target.set(0, 0, 0); 
        break;
    }
    controls.update();
    setCameraViewPreset(null); 
  }, [requestedViewPreset, setCameraViewPreset, cameraRef, orbitControlsRef]);

  useEffect(() => {
    if (zoomExtentsTrigger.timestamp > 0 && cameraRef.current && orbitControlsRef.current && sceneRef.current) {
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const controls = orbitControlsRef.current;
      
      const targetBox = new THREE.Box3();
      let objectsToConsider: THREE.Object3D[] = [];

      if (zoomExtentsTrigger.targetObjectId) {
        const targetObject = scene.getObjectByName(zoomExtentsTrigger.targetObjectId);
        if (targetObject) {
          objectsToConsider.push(targetObject);
        }
      }
      
      if (objectsToConsider.length === 0) { 
        sceneContextObjects.forEach(objData => {
          const threeObject = scene.getObjectByName(objData.id);
          if (threeObject && threeObject.visible && 
              threeObject !== tempDrawingMeshRef.current && 
              threeObject !== tempMeasureLineRef.current && 
              threeObject !== lastCompletedMeasureLineRef.current &&
              threeObject.name !== 'gridHelper' &&
              !threeObject.name.startsWith('modelling_dir_light')
            ) {
            objectsToConsider.push(threeObject);
          }
        });
      }

      let objectsFoundForBoundingBox = false;
      objectsToConsider.forEach(threeObject => {
        const objectBox = new THREE.Box3();
        if (threeObject instanceof THREE.Group && threeObject.userData.objectType === 'cadPlan') {
            threeObject.children.forEach(child => {
                const childBox = new THREE.Box3().setFromObject(child);
                if (!childBox.isEmpty()) objectBox.expandByObject(child);
            });
            if (objectBox.isEmpty() && threeObject.children.length > 0) objectBox.setFromObject(threeObject); 
        } else {
           objectBox.setFromObject(threeObject);
        }

        if (!objectBox.isEmpty()) { 
          targetBox.union(objectBox); 
          objectsFoundForBoundingBox = true;
        }
      });


      if (!objectsFoundForBoundingBox || targetBox.isEmpty()) {
        camera.position.set(10, 10, 10);
        controls.target.set(0, 0, 0);
      } else {
        const center = new THREE.Vector3();
        targetBox.getCenter(center);

        const sphere = new THREE.Sphere();
        targetBox.getBoundingSphere(sphere);
        const radius = sphere.radius;

        const fov = camera.fov * (Math.PI / 180);
        let distance = radius / Math.sin(fov / 2);
        
        distance = Math.max(distance * 1.5, Math.max(5, radius * 1.1)); 

        const direction = camera.position.clone().sub(controls.target).normalize();
        if (direction.lengthSq() === 0 || (Math.abs(direction.x) < 0.01 && Math.abs(direction.y) < 0.01 && Math.abs(direction.z) < 0.01)) {
            direction.set(0.577, 0.577, 0.577); 
        }
        
        camera.position.copy(center).addScaledVector(direction, distance);
        controls.target.copy(center);
      }

      controls.update();
      setZoomExtentsTriggered(); 
    }
  }, [zoomExtentsTrigger, sceneContextObjects, setZoomExtentsTriggered]);


  return (
    <div ref={mountRef} className="w-full h-full outline-none bg-background relative" tabIndex={0}>
      {measureDisplay && (
        <div
          style={{
            position: 'absolute',
            left: `${measureDisplay.x}px`,
            top: `${measureDisplay.y}px`,
            color: 'hsl(var(--foreground))', 
            backgroundColor: 'hsla(var(--background), 0.75)',
            padding: '3px 7px',
            borderRadius: '4px',
            fontSize: '12px',
            border: '1px solid hsl(var(--border))',
            pointerEvents: 'none',
            transform: 'translate(10px, -100%)', 
            zIndex: 1001, 
          }}
        >
          {measureDisplay.text}
        </div>
      )}
    </div>
  );
};

export default SceneViewer;
