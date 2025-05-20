
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
import type { SceneObject, PushPullFaceInfo, PrimitiveType, SceneObjectDimensions, ToolType, PointLightSceneProps, SpotLightSceneProps, AreaLightSceneProps, SceneLight, DrawingState, ViewPreset, MaterialProperties } from '@/types';
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
  const [constrainedAxis, setConstrainedAxis] = useState<"X" | "Y" | "Z" | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false); // For rotation snap and uniform scale
  const initialScaleRef = useRef<THREE.Vector3 | null>(null); // For uniform scaling
  const transformModeRef = useRef<'translate' | 'rotate' | 'scale' | null>(null); // To track current transform mode for event handlers

  const modellingBasicMaterialRef = useRef(new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide })); // White for modelling
  const modellingEdgeMaterialRef = useRef(new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1.5 })); // Black edges

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    measurementUnit,
    addObject,
    requestedViewPreset,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        !c.userData.isEdgeHelper && 
        c !== tempDrawingMeshRef.current && 
        c !== tempMeasureLineRef.current &&
        c !== lastCompletedMeasureLineRef.current
    );

    const intersects = raycaster.current.intersectObjects(allIntersectables, true);
    if (intersects.length > 0) {
        let firstIntersectedObject = intersects[0].object;
        
        // Traverse up to find the named parent object if the intersection is with a child mesh of a group (e.g., CAD plan)
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
    scene.background = new THREE.Color(appMode === 'modelling' ? 0x000000 : worldBackgroundColor); 
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(cameraFov, currentMount.clientWidth / currentMount.clientHeight, 0.1, 100000); // Increased far plane
    camera.position.set(15, 15, 15); 
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = appMode === 'rendering'; 
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    rendererRef.current = renderer;
    currentMount.appendChild(renderer.domElement);

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControlsRef.current = orbitControls;

    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.addEventListener('dragging-changed', (event) => {
      orbitControls.enabled = !event.value;
      if (!event.value) { // Drag ended
        if (transformModeRef.current === 'translate') {
          setConstrainedAxis(null); 
          if (transformControlsRef.current) transformControlsRef.current.axis = null;
        } else if (transformModeRef.current === 'scale') {
          initialScaleRef.current = null; // Clear initial scale on drag end
          // isShiftPressed is handled by global keyup
        }
        // For rotate, isShiftPressed is handled by global keyup
      } else { // Drag started
        if (transformModeRef.current === 'scale' && transformControls.object) {
          initialScaleRef.current = transformControls.object.scale.clone();
        }
      }
    });

    transformControls.addEventListener('objectChange', () => {
        const tc = transformControlsRef.current;
        if (tc && tc.object && transformModeRef.current === 'scale' && isShiftPressed && initialScaleRef.current) {
            const object = tc.object;
            const currentScale = object.scale;
            const initialScale = initialScaleRef.current;
            const activeHandleAxis = tc.axis; // "X", "Y", "Z", "XY", "YZ", "XZ", "XYZ"

            // Only apply custom uniform scaling logic if a single axis handle is being dragged
            if (activeHandleAxis === 'X' || activeHandleAxis === 'Y' || activeHandleAxis === 'Z') {
                let scaleFactor = 1;
                let mainAxisInitialScale = 1;
                let mainAxisCurrentScale = 1;

                if (activeHandleAxis === 'X') {
                    mainAxisInitialScale = initialScale.x;
                    mainAxisCurrentScale = currentScale.x;
                } else if (activeHandleAxis === 'Y') {
                    mainAxisInitialScale = initialScale.y;
                    mainAxisCurrentScale = currentScale.y;
                } else { // activeHandleAxis === 'Z'
                    mainAxisInitialScale = initialScale.z;
                    mainAxisCurrentScale = currentScale.z;
                }

                if (mainAxisInitialScale !== 0 && mainAxisCurrentScale !== mainAxisInitialScale) {
                    scaleFactor = mainAxisCurrentScale / mainAxisInitialScale;
                } else if (mainAxisInitialScale === 0 && mainAxisCurrentScale !== 0){
                    // If initial scale on this axis was 0, any change is infinite factor.
                    // This scenario is tricky. A small initial epsilon could be used,
                    // or we could decide uniform scaling from a 0-scaled axis isn't well-defined.
                    // For now, let's try to infer a factor if other axes were not zero.
                    // This part remains complex if we truly want to support uniform scaling from a plane's edge.
                    // A simpler approach might be to disallow this specific override if initialScale on the active axis is 0.
                    // Or, if other axes had a common scale, use that.
                    // For now, let's assume the scale factor is based on the visual change from a near-zero point.
                    // This might be better handled by the user using the central "XYZ" handle for planes.
                    // Let's make the factor based on a small delta if initial was 0.
                     scaleFactor = mainAxisCurrentScale / (initialScaleRef.current?.x === 0 && activeHandleAxis === 'X' ? 0.001 : mainAxisInitialScale || 0.001);

                }


                if (scaleFactor !== 1) {
                    // Apply uniform scale based on the initial scale of other axes and the factor from the active axis
                    // This preserves the "shape" defined by initialScale
                    object.scale.set(
                        initialScale.x * scaleFactor,
                        initialScale.y * scaleFactor,
                        initialScale.z * scaleFactor
                    );
                }
            }
            // If activeHandleAxis is "XYZ", "XY", "YZ", "XZ", do nothing here.
            // "XYZ" should be uniform by default. Planar handles scale non-uniformly in their plane.
        }
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
      if (transformModeRef.current === 'translate') {
        setConstrainedAxis(null);
        if (transformControlsRef.current) transformControlsRef.current.axis = null;
      }
      // initialScaleRef is cleared by dragging-changed
    });
    transformControls.enabled = false;
    transformControls.visible = false;
    scene.add(transformControls);
    transformControlsRef.current = transformControls;
    
    const gridHelper = new THREE.GridHelper(500, 100, 0x555555, 0x333333); 
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
        .filter(obj => obj.name && (obj.name.endsWith('_helper') || obj.userData.isEdgeHelper )) 
        .forEach(helper => {
          scene.remove(helper);
          if (helper instanceof THREE.LineSegments) {
            helper.geometry.dispose();
            (helper.material as THREE.Material).dispose();
          } else if (typeof (helper as any).dispose === 'function') { 
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
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(appMode === 'modelling' ? 0x000000 : worldBackgroundColor);
    }
    if (rendererRef.current) {
      rendererRef.current.shadowMap.enabled = appMode === 'rendering';
    }
  }, [worldBackgroundColor, appMode]);


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
      } else if (activeTool === 'tape' && drawingState.startPoint === null) { // Clear on tool activation if no measurement started
        clearLastMeasurement();
      }
    }
  }, [activeTool, drawingState.startPoint, clearLastMeasurement]); 


  const onPointerDown = useCallback((event: PointerEvent) => {
    if (transformControlsRef.current?.dragging) return;

    const intersectionWithObject = getMouseIntersection(event);
    const pointOnXZPlane = getMousePositionOnXZPlane(event); // Guaranteed to be on XZ plane (y=0)
    let startPointForDrawingOrMeasure;

    if (activeTool === 'line' || activeTool === 'rectangle') { // For line and rectangle tools, always use XZ plane
        startPointForDrawingOrMeasure = pointOnXZPlane;
    } else { // For other drawing tools, prefer intersection, fallback to XZ plane
        startPointForDrawingOrMeasure = intersectionWithObject?.point || pointOnXZPlane;
    }


    if (activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'polygon' || activeTool === 'line' || activeTool === 'freehand' || activeTool === 'arc') {
      if (startPointForDrawingOrMeasure && sceneRef.current) {
         // Ensure Y is 0 for XZ plane tools if somehow not already
        const enforcedStartY = (activeTool === 'line' || activeTool === 'rectangle') ? 0 : startPointForDrawingOrMeasure.y;
        const startCoords = [startPointForDrawingOrMeasure.x, enforcedStartY, startPointForDrawingOrMeasure.z] as [number,number,number];

        if (!drawingState.isActive || drawingState.tool !== activeTool) { // Start new drawing
            setDrawingState({ isActive: true, startPoint: startCoords, currentPoint: startCoords, tool: activeTool as DrawingState['tool'] });
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
                clearLastMeasurement(); 
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
            } else { // Second click for measurement
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
                        lastCompletedMeasureLineRef.current = tempMeasureLineRef.current.clone(); // Clone before nulling out
                        sceneRef.current.add(lastCompletedMeasureLineRef.current);
                        
                        const midPointDisplay = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
                        const screenPos = midPointDisplay.clone().project(cameraRef.current);
                        const x = (screenPos.x * 0.5 + 0.5) * mountRef.current.clientWidth;
                        const y = (-screenPos.y * 0.5 + 0.5) * mountRef.current.clientHeight;
                        
                        const textDiv = document.createElement('div');
                        textDiv.style.position = 'absolute';
                        textDiv.style.left = `${x}px`;
                        textDiv.style.top = `${y}px`;
                        textDiv.style.color = 'hsl(var(--foreground))'; // Use theme colors
                        textDiv.style.backgroundColor = 'hsla(var(--background), 0.75)';
                        textDiv.style.padding = '3px 7px';
                        textDiv.style.borderRadius = '4px';
                        textDiv.style.fontSize = '12px';
                        textDiv.style.border = '1px solid hsl(var(--border))';
                        textDiv.style.pointerEvents = 'none';
                        textDiv.style.transform = 'translate(10px, -100%)'; // Offset for better visibility
                        textDiv.style.zIndex = "1001"; // Ensure it's on top
                        textDiv.innerText = `${distance.toFixed(2)} ${measurementUnit}`;
                        mountRef.current.appendChild(textDiv);
                        lastCompletedMeasureDisplayTextRef.current = textDiv;
                    }
                    setMeasureDisplay(null); // Clear dynamic display
                    // Reset for next measurement, keeping tool active
                    setDrawingState({ startPoint: null, currentPoint: null, tool: activeTool, measureDistance: distance, isActive: false }); 
                    if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;
                     // Null out temp line so a new one is created on next click
                    if (tempMeasureLineRef.current && sceneRef.current) {
                        sceneRef.current.remove(tempMeasureLineRef.current);
                        tempMeasureLineRef.current.geometry.dispose();
                        (tempMeasureLineRef.current.material as THREE.Material).dispose();
                        tempMeasureLineRef.current = null;
                    }
                } else { // Protractor (WIP)
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
    const intersectionWithObjectOnMove = getMouseIntersection(event);
    const pointOnXZPlaneOnMove = getMousePositionOnXZPlane(event);
    let currentMovePoint;

    if ((drawingState.tool === 'line' || drawingState.tool === 'rectangle') && drawingState.isActive) { // For line and rectangle tools, always use XZ plane during move
        currentMovePoint = pointOnXZPlaneOnMove;
    } else { // For other drawing tools, prefer intersection, fallback to XZ plane
        currentMovePoint = intersectionWithObjectOnMove?.point || pointOnXZPlaneOnMove;
    }


    if (drawingState.isActive && drawingState.startPoint && sceneRef.current && tempDrawingMeshRef.current && ['rectangle', 'circle', 'polygon', 'line', 'freehand', 'arc'].includes(drawingState.tool || '')) {
      if (currentMovePoint) {
        // Ensure Y is 0 for XZ plane tools if somehow not already
        const enforcedCurrentY = (drawingState.tool === 'line' || drawingState.tool === 'rectangle') ? 0 : currentMovePoint.y;
        const currentCoords = [currentMovePoint.x, enforcedCurrentY, currentMovePoint.z] as [number,number,number];
        
        setDrawingState({ currentPoint: currentCoords });
        const startVec = new THREE.Vector3().fromArray(drawingState.startPoint); // Will have y=0 if tool is line/rect
        const endVec = new THREE.Vector3().fromArray(currentCoords); // Use the y-enforced coords
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
            
            // Assuming drawing on XZ plane, so up is Y
            const up = new THREE.Vector3(0,1,0); 
            const forward = cameraRef.current ? cameraRef.current.getWorldDirection(new THREE.Vector3()) : new THREE.Vector3(0,0,-1);
            // Project forward onto XZ plane to get a consistent "right" vector for circle drawing on XZ
            const forwardOnXZ = new THREE.Vector3(forward.x, 0, forward.z).normalize();
            const right = new THREE.Vector3().crossVectors(up, forwardOnXZ).normalize(); 
            const planeNormal = up; // Circle is on XZ plane

            for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const p = new THREE.Vector3()
                    .copy(right)
                    .multiplyScalar(radius * Math.cos(angle))
                    // Use cross(planeNormal, right) to get the other axis on the XZ plane
                    .addScaledVector(new THREE.Vector3().crossVectors(planeNormal, right).normalize(), radius * Math.sin(angle))
                    .add(startVec); // Add to the startPoint which defines the center
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
        
        // Drag plane is perpendicular to camera view, passing through initial intersection point
        const viewDirection = cameraRef.current.getWorldDirection(new THREE.Vector3());
        const dragPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(viewDirection.negate(), initialWorldIntersectVec);
        const currentDragPointOnPlane = new THREE.Vector3();

        if (ray.intersectPlane(dragPlane, currentDragPointOnPlane)) {
            const dragVector = currentDragPointOnPlane.clone().sub(initialWorldIntersectVec);
            let pushPullAmount = dragVector.dot(worldFaceNormalVec);
            
            let newDimensions: SceneObjectDimensions = { ...originalDimensions };
            let newPositionArray: [number, number, number];
            let newRotationArray: [number, number, number] | undefined = [...originalRotation] as [number,number,number]; 
            let newType: PrimitiveType = originalType;

             if (originalType === 'cube' || originalType === 'cylinder' || originalType === 'polygon' || originalType === 'circle') {
                const localFaceNormalVec = new THREE.Vector3().fromArray(drawingState.pushPullFaceInfo.localFaceNormal);
                let dimensionToModify: 'width' | 'height' | 'depth' | 'radius' | undefined;
                let sign = 1; // To handle extrusion direction based on normal
                
                if (originalType === 'cube') {
                    const absX = Math.abs(localFaceNormalVec.x);
                    const absY = Math.abs(localFaceNormalVec.y);
                    const absZ = Math.abs(localFaceNormalVec.z);
                    if (absX > absY && absX > absZ) { dimensionToModify = 'width'; sign = Math.sign(localFaceNormalVec.x); }
                    else if (absY > absX && absY > absZ) { dimensionToModify = 'height'; sign = Math.sign(localFaceNormalVec.y); }
                    else if (absZ > absX && absZ > absY) { dimensionToModify = 'depth'; sign = Math.sign(localFaceNormalVec.z); }
                } else if (originalType === 'cylinder' || originalType === 'polygon' || originalType === 'circle') {
                    if (Math.abs(localFaceNormalVec.y) > 0.9) { dimensionToModify = 'height'; sign = Math.sign(localFaceNormalVec.y); }
                    else { dimensionToModify = 'radius'; sign = 1; } // Radius always positive, pushPullAmount handles direction
                }

                if (dimensionToModify) {
                    let currentDimValue: number;
                    if (dimensionToModify === 'radius') {
                        // For cylinders/circles, pushPullAmount directly modifies radius if side is selected
                        // or height if top/bottom is selected. Sign logic for radius might be different.
                        // This section is primarily for cube, let's keep it focused.
                        // TODO: Refine for cylinder/circle radius push/pull.
                        if (originalType === 'cylinder') currentDimValue = originalDimensions.radiusTop ?? originalDimensions.radiusBottom ?? 1;
                        else currentDimValue = originalDimensions.radius ?? 1; // For circle/polygon type
                        
                        // If local normal is mostly radial (not primarily Y), then it's a radius change.
                        if (Math.abs(localFaceNormalVec.y) < 0.7) { // Heuristic for side face of cylinder/edge of circle
                           const newRadius = Math.max(0.01, currentDimValue + pushPullAmount); // pushPullAmount is change in radius
                           if (originalType === 'cylinder') { newDimensions.radiusTop = newRadius; newDimensions.radiusBottom = newRadius; }
                           else { newDimensions.radius = newRadius; }
                        } else { // Else it's a height change for cylinder (top/bottom face)
                           currentDimValue = originalDimensions['height'] || 1;
                           newDimensions['height'] = Math.max(0.01, currentDimValue + pushPullAmount);
                        }
                    } else { // Cube width, height, depth
                        currentDimValue = originalDimensions[dimensionToModify as 'width'|'height'|'depth'] || 1;
                        // pushPullAmount is the change in dimension. Position offset handles the direction.
                        newDimensions[dimensionToModify as 'width'|'height'|'depth'] = Math.max(0.01, currentDimValue + pushPullAmount);
                    }
                }
                const positionOffset = worldFaceNormalVec.clone().multiplyScalar(pushPullAmount / 2);
                newPositionArray = new THREE.Vector3().fromArray(originalPosition).add(positionOffset).toArray() as [number,number,number];
            } else if (originalType === 'plane') {
                newType = 'cube';
                const planeWidth = originalDimensions.width || 1;
                const planeDepth = originalDimensions.height || 1; // Plane's "height" dimension is its depth on XZ
                const extrusionHeight = Math.max(0.01, Math.abs(pushPullAmount)); 
                
                newDimensions = { 
                    width: planeWidth, 
                    depth: planeDepth, 
                    height: extrusionHeight, 
                };
                const extrusionOffset = worldFaceNormalVec.clone().multiplyScalar(pushPullAmount / 2); 
                newPositionArray = new THREE.Vector3().fromArray(originalPosition).add(extrusionOffset).toArray() as [number,number,number];
                
                // Rotation logic for plane to cube
                if (Math.abs(originalRotation[0] - (-Math.PI/2)) < 0.01 && Math.abs(originalRotation[1]) < 0.01 && Math.abs(originalRotation[2]) < 0.01 && (Math.abs(worldFaceNormal[1]) > 0.99)) {
                    newRotationArray = [0,0,0]; 
                } else {
                    newRotationArray = [...originalRotation] as [number,number,number];
                }
            } else { // Default if not cube, cylinder, polygon, circle, plane
                newPositionArray = [...originalPosition] as [number,number,number];
            }
            
            const updates: Partial<SceneObject> = { dimensions: newDimensions, position: newPositionArray };
            if (newRotationArray !== undefined) updates.rotation = newRotationArray; // Only update rotation if it's determined
            if (newType !== originalType) updates.type = newType;
            updateObject(objectId, updates);
        }
    }
  }, [activeTool, drawingState, getMouseIntersection, getMousePositionOnXZPlane, updateObject, cameraRef, mountRef, setDrawingState, measurementUnit]);

  const onPointerUp = useCallback((event: PointerEvent) => {
    if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;
    
    const toolIsPersistent = ['rectangle', 'line', 'arc', 'tape', 'pushpull', 'circle', 'polygon', 'freehand', 'protractor', 'eraser', 'paint'].includes(activeTool || '');

    if (drawingState.isActive && drawingState.startPoint && drawingState.currentPoint && ['rectangle', 'circle', 'polygon', 'line', 'freehand', 'arc'].includes(drawingState.tool || '')) {
      const startPointVec = new THREE.Vector3().fromArray(drawingState.startPoint);
      const endPointVec = new THREE.Vector3().fromArray(drawingState.currentPoint); // currentPoint is already on XZ plane if tool is 'line'
      const tool = drawingState.tool;
      let newObjProps: Partial<Omit<SceneObject, 'id' | 'type' | 'planData'>> = {};
      let primitiveType: PrimitiveType | null = null;
      const lineRadius = 0.05; // Default radius for line cylinders

      if (tool === 'line') {
        const distance = startPointVec.distanceTo(endPointVec);
        if (distance > 0.01) {
            primitiveType = 'cylinder'; // Represent lines as cylinders
            const midpoint = new THREE.Vector3().addVectors(startPointVec, endPointVec).multiplyScalar(0.5);
            
            const direction = new THREE.Vector3().subVectors(endPointVec, startPointVec).normalize();
            const quaternion = new THREE.Quaternion();
            // Cylinder's default axis is Y. We want to align it with 'direction'.
            // THREE.CylinderGeometry is aligned along Y-axis.
            const defaultCylinderUp = new THREE.Vector3(0, 1, 0);
            quaternion.setFromUnitVectors(defaultCylinderUp, direction);
            const euler = new THREE.Euler().setFromQuaternion(quaternion);

            newObjProps = {
                // name: "Line", // addObject will append a number if name is generic like "Cylinder"
                position: [midpoint.x, lineRadius, midpoint.z], 
                rotation: [euler.x, euler.y, euler.z],
                dimensions: { 
                    height: distance, 
                    radiusTop: lineRadius, 
                    radiusBottom: lineRadius, 
                    radialSegments: 8 
                },
            };
        }
      } else if (tool === 'rectangle') {
        const rectWidth = Math.abs(endPointVec.x - startPointVec.x);
        const rectDepth = Math.abs(endPointVec.z - startPointVec.z); // endPointVec.y and startPointVec.y are 0
        if (rectWidth > 0.01 && rectDepth > 0.01) { 
            primitiveType = 'plane';
            newObjProps = {
                name: "Rectangle", // addObject will append a number
                position: [(startPointVec.x + endPointVec.x) / 2, 0, (startPointVec.z + endPointVec.z) / 2], // Y is 0
                rotation: [-Math.PI / 2, 0, 0], 
                dimensions: { width: rectWidth, height: rectDepth }, // Plane's height is depth in XZ
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
        const finalProps = { ...newObjProps, materialId: DEFAULT_MATERIAL_ID };
        // Let addObject handle name generation if newObjProps.name is set (e.g. "Rectangle", "Line")
        // It will append numbers for uniqueness.
        const newObj = addObject(primitiveType as Exclude<PrimitiveType, 'cadPlan'>, finalProps);
        
        let friendlyName = primitiveType.charAt(0).toUpperCase() + primitiveType.slice(1);
        if (tool === 'line') friendlyName = 'Line';
        else if (tool === 'rectangle') friendlyName = 'Rectangle';

        toast({ title: `${friendlyName} Drawn`, description: `${newObj.name} added.` });
      }
      
      if (toolIsPersistent && drawingState.tool) {
        setDrawingState({ isActive: false, startPoint: null, currentPoint: null, tool: drawingState.tool });
      } else {
        setDrawingState({ isActive: false, startPoint: null, currentPoint: null, tool: null });
        if (!toolIsPersistent && activeTool) setActiveTool(undefined); 
      }
      return; 
    } else if (activeTool === 'tape' && drawingState.isActive && drawingState.startPoint && !drawingState.measureDistance && drawingState.tool === activeTool) {
        // Measurement completed on pointerDown for 'tape'
        // If tool is persistent, reset parts of drawing state but keep tool active
        if (toolIsPersistent) {
             setDrawingState({ isActive: false, startPoint: null, currentPoint: null, tool: activeTool as DrawingState['tool'], measureDistance: drawingState.measureDistance });
        } else {
             setDrawingState({ isActive: false, startPoint: null, currentPoint: null, tool: null, measureDistance: drawingState.measureDistance });
             if (activeTool) setActiveTool(undefined);
        }
        return;
    } else if (activeTool === 'pushpull' && drawingState.isActive && drawingState.pushPullFaceInfo && drawingState.tool === 'pushpull') {
        const { objectId, originalType, worldFaceNormal } = drawingState.pushPullFaceInfo;
        const finalObject = sceneContextObjects.find(o => o.id === objectId);
        
        let description = `${finalObject?.name || 'Object'} modified.`;
        if (originalType === 'plane' && finalObject?.type === 'cube') {
            description = `Plane extruded to ${finalObject?.name || 'a cube'}.`;
        } else if (originalType === 'circle' && finalObject?.type === 'cylinder') {
            description = `Circle extruded to ${finalObject?.name || 'a cylinder'}.`;
        } else if (originalType === 'polygon' && finalObject?.type === 'cylinder') { // Assuming polygon also extrudes to cylinder
             description = `Polygon extruded to ${finalObject?.name || 'a cylinder'}.`;
        }

        toast({ 
            title: "Push/Pull Complete", 
            description: description
        });
        if (toolIsPersistent) {
            setDrawingState({ isActive: false, tool: activeTool as DrawingState['tool'], pushPullFaceInfo: null });
        } else {
            setDrawingState({ isActive: false, tool: null, pushPullFaceInfo: null });
            if (activeTool) setActiveTool(undefined);
        }
        return;
    }

    // Clear dynamic measure display if not using a measurement tool
    if (measureDisplay && activeTool !== 'tape' && activeTool !== 'protractor') {
         setMeasureDisplay(null);
    }


    // Object selection/deselection logic
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
        } else { // Clicked on something, but not a recognized scene object
          if (activeTool === 'select' || activeTool === 'move' || activeTool === 'rotate' || activeTool === 'scale') {
             selectObject(null); // Deselect if clicking on non-object area
          }
        }
      } else { // Clicked on empty space
         if (activeTool === 'select' || activeTool === 'move' || activeTool === 'rotate' || activeTool === 'scale') {
            selectObject(null);
         }
      }
    }
    
    // If the tool is not persistent and we weren't in an active drawing state, deselect the tool
    if (!toolIsPersistent && activeTool && !drawingState.isActive) {
      setActiveTool(undefined); 
    } else if (!drawingState.isActive && drawingState.tool !== null && !persistentTools.includes(drawingState.tool)) {
      // If drawing was not active, and current drawingState.tool is not persistent, clear drawing state
      setDrawingState({ isActive: false, startPoint: null, currentPoint: null, tool: null, pushPullFaceInfo: null, measureDistance: null });
    }

  }, [activeTool, drawingState, getMouseIntersection, setDrawingState, addObject, sceneContextObjects, toast, selectObject, activePaintMaterialId, getMaterialById, updateObject, removeObject, measureDisplay, setActiveTool]);

  const persistentTools: ToolType[] = ['rectangle', 'line', 'arc', 'tape', 'pushpull', 'circle', 'polygon', 'freehand', 'protractor', 'eraser', 'paint'];

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    currentMount.addEventListener('pointerdown', onPointerDown);
    currentMount.addEventListener('pointermove', onPointerMove);
    currentMount.addEventListener('pointerup', onPointerUp);
    
    // Keydown/keyup for axis constraints and rotation snap
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return; 
      }

      if (activeTool === 'move' && transformControlsRef.current?.dragging) {
        const key = event.key.toUpperCase();
        if (key === 'X' && constrainedAxis !== 'X') {
          setConstrainedAxis('X');
          if (transformControlsRef.current) transformControlsRef.current.axis = 'X';
          event.preventDefault();
        } else if (key === 'Y' && constrainedAxis !== 'Y') {
          setConstrainedAxis('Y');
          if (transformControlsRef.current) transformControlsRef.current.axis = 'Y';
          event.preventDefault();
        } else if (key === 'Z' && constrainedAxis !== 'Z') {
          setConstrainedAxis('Z');
          if (transformControlsRef.current) transformControlsRef.current.axis = 'Z';
          event.preventDefault();
        }
      } else if ((activeTool === 'rotate' || activeTool === 'scale') && event.key === 'Shift' && !isShiftPressed) {
        setIsShiftPressed(true);
        if (transformControlsRef.current) {
          if (activeTool === 'rotate') {
            transformControlsRef.current.rotationSnap = Math.PI / 12; // 15 degrees
          }
          // For scale, shift state is used by 'objectChange' listener
        }
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return; 
      }
      const currentActiveTool = transformModeRef.current; // Use the tool active at key down/drag start

      if (currentActiveTool === 'move' && constrainedAxis !== null) {
        const key = event.key.toUpperCase();
        if ((key === 'X' && constrainedAxis === 'X') || 
            (key === 'Y' && constrainedAxis === 'Y') || 
            (key === 'Z' && constrainedAxis === 'Z')) {
          setConstrainedAxis(null);
          if (transformControlsRef.current) transformControlsRef.current.axis = null; 
          event.preventDefault();
        }
      } else if ((currentActiveTool === 'rotate' || currentActiveTool === 'scale') && event.key === 'Shift' && isShiftPressed) {
        setIsShiftPressed(false);
        if (transformControlsRef.current) {
          if (currentActiveTool === 'rotate') {
            transformControlsRef.current.rotationSnap = null;
          }
          // For scale, objectChange listener will stop reacting to isShiftPressed
        }
        event.preventDefault();
      }
      
      // Fallbacks if keys are released when tool is no longer active or dragging
      if (constrainedAxis !== null && (!transformControlsRef.current || !transformControlsRef.current.dragging)) { 
        setConstrainedAxis(null);
        if (transformControlsRef.current && transformControlsRef.current.object) {
          transformControlsRef.current.axis = null;
        }
      }
      if (isShiftPressed && activeTool !== 'rotate' && activeTool !== 'scale') {
        setIsShiftPressed(false);
        if (transformControlsRef.current) {
            transformControlsRef.current.rotationSnap = null; // Reset just in case
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      currentMount.removeEventListener('pointerdown', onPointerDown);
      currentMount.removeEventListener('pointermove', onPointerMove);
      currentMount.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onPointerDown, onPointerMove, onPointerUp, activeTool, constrainedAxis, isShiftPressed]);


  useEffect(() => {
    const tc = transformControlsRef.current;
    if (!tc || !sceneRef.current) return;

    const isDrawingOrModToolActive = ['rectangle', 'line', 'arc', 'circle', 'polygon', 'freehand', 'tape', 'protractor', 'pushpull'].includes(activeTool || '');
    const selectedThreeObject = selectedObjectId ? sceneRef.current.getObjectByName(selectedObjectId) : null;

    if (selectedThreeObject && (selectedThreeObject instanceof THREE.Mesh || selectedThreeObject instanceof THREE.Group) && !isDrawingOrModToolActive && (activeTool === 'move' || activeTool === 'rotate' || activeTool === 'scale')) { 
      tc.attach(selectedThreeObject);
      tc.enabled = true;
      tc.visible = true;
      
      // Reset properties that might have been set by other tools or states
      tc.axis = null; 
      tc.rotationSnap = null;
      // tc.translationSnap = null; 

      transformModeRef.current = null; // Reset transform mode ref

      switch (activeTool) {
        case 'move': 
          tc.mode = 'translate';
          tc.axis = constrainedAxis; 
          transformModeRef.current = 'translate';
          break;
        case 'rotate': 
          tc.mode = 'rotate';
          tc.rotationSnap = isShiftPressed ? (Math.PI / 12) : null;
          transformModeRef.current = 'rotate';
          break; 
        case 'scale': 
          tc.mode = 'scale'; 
          transformModeRef.current = 'scale';
          // Uniform scaling with shift is handled by 'objectChange' + isShiftPressed state
          break;
        default: 
          tc.mode = 'translate'; // Default to translate if something is off
          break; 
      }
    } else {
      if(tc.object) tc.detach(); 
      tc.enabled = false;
      tc.visible = false;
      transformModeRef.current = null;
      // Clear states if controls are detached
      if (constrainedAxis) setConstrainedAxis(null); 
      if (isShiftPressed) setIsShiftPressed(false); 
      // Ensure TC properties are reset if it was active
      if (tc.axis) tc.axis = null;
      if (tc.rotationSnap) tc.rotationSnap = null;
      // if (tc.translationSnap) tc.translationSnap = null;
    }
  }, [activeTool, selectedObjectId, constrainedAxis, isShiftPressed]);

  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    let modellingDirLight: THREE.DirectionalLight | null = scene.getObjectByName('modellingDirLight') as THREE.DirectionalLight | null;

    if (appMode === 'modelling') {
        // Ambient Light for modelling
        let ambientLight = scene.getObjectByName('ambientLight') as THREE.AmbientLight;
        if (!ambientLight) {
          ambientLight = new THREE.AmbientLight(0xFFFFFF, 2.0); // Strong ambient for flat look
          ambientLight.name = 'ambientLight';
          scene.add(ambientLight);
        } else {
          ambientLight.color.set(0xFFFFFF);
          ambientLight.intensity = 2.0;
        }
        // Hide other lights
        const mainDirLight = scene.getObjectByName(directionalLightProps.id) as THREE.DirectionalLight;
        if(mainDirLight) mainDirLight.visible = false;
        const mainDirLightHelper = scene.getObjectByName(`${directionalLightProps.id}_helper`);
        if(mainDirLightHelper) mainDirLightHelper.visible = false;

        (otherLights || []).forEach(lightData => {
            const lightObject = scene.getObjectByName(lightData.id) as THREE.Light;
            if (lightObject) lightObject.visible = false;
            const helper = scene.getObjectByName(`${lightData.id}_helper`);
            if (helper) helper.visible = false;
        });
        if (modellingDirLight) modellingDirLight.visible = false; // Ensure it's also off as MeshBasicMaterial is used

    } else { // Rendering mode
        // Restore main ambient light
        let ambientLight = scene.getObjectByName('ambientLight') as THREE.AmbientLight;
        if (!ambientLight) {
          ambientLight = new THREE.AmbientLight(ambientLightProps.color, ambientLightProps.intensity);
          ambientLight.name = 'ambientLight';
          scene.add(ambientLight);
        }
        ambientLight.color.set(ambientLightProps.color);
        ambientLight.intensity = ambientLightProps.intensity;

        // Restore main directional light
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
        if (dirLight.target) dirLight.target.position.set(0,0,0); 
        
        if (dirLightHelper) {
          dirLightHelper.visible = directionalLightProps.visible ?? true; 
          dirLightHelper.update();
        }

        if (directionalLightProps.castShadow) {
          dirLight.shadow.mapSize.width = 2048; dirLight.shadow.mapSize.height = 2048;
          dirLight.shadow.camera.near = 0.5; dirLight.shadow.camera.far = 500; 
          const shadowCamSize = 150; 
          dirLight.shadow.camera.left = -shadowCamSize; dirLight.shadow.camera.right = shadowCamSize;
          dirLight.shadow.camera.top = shadowCamSize; dirLight.shadow.camera.bottom = -shadowCamSize;
          dirLight.shadow.camera.updateProjectionMatrix();
        }
        // Restore other lights
        (otherLights || []).forEach(lightData => {
          let lightObject = scene.getObjectByName(lightData.id) as THREE.Light;
          let helper = scene.getObjectByName(`${lightData.id}_helper`);
          const isVisibleInCurrentMode = lightData.visible ?? true;

          if (!lightObject) { /* ... (light creation logic as before) ... */ }
          
          if(lightObject) {
            lightObject.color.set(lightData.color);
            lightObject.intensity = lightData.intensity;
            lightObject.visible = isVisibleInCurrentMode;
            // ... (specific light type properties as before) ...
          }
          if(helper) helper.visible = isVisibleInCurrentMode;
          if (typeof (helper as any)?.update === 'function') (helper as any).update();
        });
        if(modellingDirLight) modellingDirLight.visible = false;
    }

  }, [ambientLightProps, directionalLightProps, otherLights, appMode]);


  useEffect(() => {
    if (!sceneRef.current || !getMaterialById) return;
    const scene = sceneRef.current;
  
    const existingObjectIdsInThree = scene.children
      .filter(child => child.name && child.name !== 'gridHelper' && !(child === tempDrawingMeshRef.current) && !(child === tempMeasureLineRef.current) && !(child === lastCompletedMeasureLineRef.current) && !child.userData.isEdgeHelper && child.name !== 'modellingDirLight')
      .map(child => child.name);
        
    const contextObjectIds = sceneContextObjects.map(obj => obj.id);
  
    sceneContextObjects.forEach(objData => {
      let meshOrGroup = scene.getObjectByName(objData.id) as THREE.Mesh | THREE.Group;
      let edgeHelper = scene.getObjectByName(`${objData.id}_edgeHelper`) as THREE.LineSegments;
      
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
            
            const cadLineMaterial = appMode === 'modelling' ? modellingEdgeMaterialRef.current : new THREE.LineBasicMaterial({ color: materialProps?.color || 0x888888 });
            meshOrGroup.children.forEach(child => {
                if (child instanceof THREE.LineSegments) {
                    child.material = cadLineMaterial;
                }
            });

        } else if (meshOrGroup instanceof THREE.Mesh) { 
            if (!isTransforming && !isPushPulling) { 
              updateMeshProperties(meshOrGroup, objData);
            }
            meshOrGroup.visible = objData.visible ?? true;
            
            if (appMode === 'modelling') {
              meshOrGroup.material = modellingBasicMaterialRef.current;
              if (!edgeHelper) {
                const edges = new THREE.EdgesGeometry(meshOrGroup.geometry);
                edgeHelper = new THREE.LineSegments(edges, modellingEdgeMaterialRef.current);
                edgeHelper.name = `${objData.id}_edgeHelper`;
                edgeHelper.userData.isEdgeHelper = true;
                // Add edge helper as a child of the mesh so it transforms with it
                meshOrGroup.add(edgeHelper);
              }
              edgeHelper.visible = true;
            } else { // Rendering mode
              if (materialProps) {
                if(Array.isArray(meshOrGroup.material)){
                    (meshOrGroup.material as THREE.Material[]).forEach(m => {
                        if (m instanceof THREE.MeshStandardMaterial) createOrUpdateMaterial(materialProps, m);
                    });
                } else {
                    createOrUpdateMaterial(materialProps, meshOrGroup.material as THREE.MeshStandardMaterial);
                }
              }
              if (edgeHelper) edgeHelper.visible = false;
            }
        }
      } else { 
        if (objData.type === 'cadPlan' && objData.planData) {
            const planGroup = new THREE.Group();
            planGroup.name = objData.id;
            planGroup.userData = { objectType: 'cadPlan' }; 

            const cadMaterial = appMode === 'modelling' ? modellingEdgeMaterialRef.current : new THREE.LineBasicMaterial({ color: materialProps?.color || 0x888888 });
            const points: THREE.Vector3[] = [];
            objData.planData.lines.forEach(line => {
                points.push(new THREE.Vector3(line.start[0], 0, line.start[1])); 
                points.push(new THREE.Vector3(line.end[0], 0, line.end[1]));
            });
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineSegments = new THREE.LineSegments(geometry, cadMaterial);
            planGroup.add(lineSegments);

            planGroup.position.set(...objData.position);
            planGroup.rotation.set(...objData.rotation);
            planGroup.scale.set(...objData.scale);
            planGroup.visible = objData.visible ?? true;
            scene.add(planGroup);
        } else if (objData.type !== 'cadPlan') { 
            const materialToUse = appMode === 'modelling' ? modellingBasicMaterialRef.current : (materialProps ? createOrUpdateMaterial(materialProps) : new THREE.MeshStandardMaterial({color: 0x888888}));
            const newMesh = createPrimitive(objData, materialToUse);
            scene.add(newMesh);
            if (appMode === 'modelling') {
              const edges = new THREE.EdgesGeometry(newMesh.geometry);
              edgeHelper = new THREE.LineSegments(edges, modellingEdgeMaterialRef.current);
              edgeHelper.name = `${objData.id}_edgeHelper`;
              edgeHelper.userData.isEdgeHelper = true;
              newMesh.add(edgeHelper); // Add as child
            }
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
          // Remove associated edge helper if it exists as a child
          const edgeHelperToRemove = objectToRemove.getObjectByName(`${id}_edgeHelper`) as THREE.LineSegments;
          if (edgeHelperToRemove) {
            objectToRemove.remove(edgeHelperToRemove); // Remove from parent (the mesh)
            edgeHelperToRemove.geometry.dispose();
            (edgeHelperToRemove.material as THREE.Material).dispose();
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
                    else (child.material as THREE.Material).dispose();
                }
            });
          }
          scene.remove(objectToRemove);
        }
      }
    });
  
  }, [sceneContextObjects, getMaterialById, drawingState.isActive, drawingState.tool, drawingState.pushPullFaceInfo?.objectId, appMode]);

  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.children.forEach(child => {
      if (child.name && child.name !== 'gridHelper' && !(child === tempDrawingMeshRef.current) && !(child === tempMeasureLineRef.current) && !(child === lastCompletedMeasureLineRef.current) && !child.userData.isEdgeHelper && child.name !== 'modellingDirLight') { 
          const isMesh = child instanceof THREE.Mesh;
          const isGroup = child instanceof THREE.Group; 

          if (isMesh || (isGroup && child.userData.objectType === 'cadPlan')) {
            const isSelected = child.name === selectedObjectId;
            const isTransforming = transformControlsRef.current?.object === child && transformControlsRef.current?.visible && transformControlsRef.current.dragging;
            const isPushPullTarget = drawingState.tool === 'pushpull' && drawingState.pushPullFaceInfo?.objectId === child.name && drawingState.isActive;

            // Highlighting logic for modelling mode (edges)
            if (appMode === 'modelling') {
                const edgeHelper = child.getObjectByName(`${child.name}_edgeHelper`) as THREE.LineSegments || (isGroup && child.userData.objectType === 'cadPlan' ? child.children[0] as THREE.LineSegments : null);
                if (edgeHelper && edgeHelper.material instanceof THREE.LineBasicMaterial) {
                    if (isSelected && !isTransforming && !isPushPullTarget) {
                        edgeHelper.material.color.setHex(0xFF0000); // Red selection highlight for edges in modelling
                    } else {
                        edgeHelper.material.color.setHex(0x000000); // Black for default edges
                    }
                    edgeHelper.material.needsUpdate = true;
                }
                 // Ensure main material is white basic material
                if (isMesh && meshOrGroup.material !== modellingBasicMaterialRef.current) {
                    meshOrGroup.material = modellingBasicMaterialRef.current;
                }

            } 
            // Highlighting logic for rendering mode (emissive - if applicable)
            else if (isMesh && child.material instanceof THREE.MeshStandardMaterial) {
                const sceneObject = sceneContextObjects.find(o => o.id === child.name);
                const originalMaterialProps = sceneObject ? getMaterialById(sceneObject.materialId) : undefined;

                if ((isSelected && !isTransforming && !isPushPullTarget) || (isPushPullTarget && drawingState.isActive)) { 
                    if (child.userData.originalEmissiveHex === undefined) {
                        child.userData.originalEmissiveHex = child.material.emissive.getHex();
                    }
                    if (child.userData.originalEmissiveIntensity === undefined) {
                        child.userData.originalEmissiveIntensity = child.material.emissiveIntensity;
                    }
                    child.material.emissive.setHex(0xFF6666); 
                    child.material.emissiveIntensity = isPushPullTarget ? 0.9 : 0.7;
                } else {
                    if (child.userData.originalEmissiveHex !== undefined) {
                        child.material.emissive.setHex(child.userData.originalEmissiveHex);
                    } else if (originalMaterialProps?.emissive) {
                        child.material.emissive.set(originalMaterialProps.emissive);
                    } else {
                        child.material.emissive.setHex(0x000000);
                    }

                    if (child.userData.originalEmissiveIntensity !== undefined) {
                        child.material.emissiveIntensity = child.userData.originalEmissiveIntensity;
                    } else if (originalMaterialProps?.emissiveIntensity !== undefined) {
                        child.material.emissiveIntensity = originalMaterialProps.emissiveIntensity;
                    } else {
                        child.material.emissiveIntensity = 0;
                    }
                    // Clear userData so it's re-cached on next selection, in case material changes
                    child.userData.originalEmissiveHex = undefined;
                    child.userData.originalEmissiveIntensity = undefined;
                }
                child.material.needsUpdate = true;
            } else if (isGroup && child.userData.objectType === 'cadPlan' && appMode === 'rendering') { 
                const sceneObject = sceneContextObjects.find(o => o.id === child.name);
                const originalMaterialProps = sceneObject ? getMaterialById(sceneObject.materialId) : undefined;
                const defaultCadColor = originalMaterialProps?.color ? new THREE.Color(originalMaterialProps.color).getHex() : 0x888888;

                child.children.forEach(lineSegment => {
                    if (lineSegment instanceof THREE.LineSegments && lineSegment.material instanceof THREE.LineBasicMaterial) {
                        if (isSelected && !isTransforming) {
                            if (lineSegment.userData.originalColorHex === undefined) {
                                lineSegment.userData.originalColorHex = lineSegment.material.color.getHex();
                            }
                            lineSegment.material.color.setHex(0xFF6666);
                        } else {
                            if (lineSegment.userData.originalColorHex !== undefined) {
                                lineSegment.material.color.setHex(lineSegment.userData.originalColorHex);
                            } else {
                                lineSegment.material.color.setHex(defaultCadColor);
                            }
                            // Clear userData so it's re-cached on next selection
                            lineSegment.userData.originalColorHex = undefined;
                        }
                        lineSegment.material.needsUpdate = true;
                    }
                });
            }
          }
      }
    });
  }, [selectedObjectId, activeTool, drawingState, sceneContextObjects, getMaterialById, appMode]); 

  useEffect(() => {
    if (!requestedViewPreset || !cameraRef.current || !orbitControlsRef.current) return;

    const cam = cameraRef.current;
    const controls = orbitControlsRef.current;
    const distance = cam.position.distanceTo(controls.target) || 20; // Default distance if current is 0
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
              !threeObject.userData.isEdgeHelper &&
              threeObject.name !== 'modellingDirLight'
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
