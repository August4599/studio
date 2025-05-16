

import type { Project, ProjectSummary, SceneData, MaterialProperties, DrawingState, DirectionalLightSceneProps, RenderSettings, MeasurementUnit, SceneLayer, CameraSettings, AnimationData, SavedSceneView, EnvironmentSettings, PostProcessingSettings } from '@/types'; 
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_MATERIAL_ID, DEFAULT_MATERIAL_NAME, DEFAULT_LAYER_ID, DEFAULT_LAYER_NAME } from '@/types'; 

const PROJECTS_STORAGE_KEY = 'archiVisionProjects';

const initialDefaultMaterial: MaterialProperties = {
  id: DEFAULT_MATERIAL_ID,
  name: DEFAULT_MATERIAL_NAME,
  color: '#D0D0D0', 
  roughness: 0.6,
  metalness: 0.3,
  opacity: 1.0,
  transparent: false,
  alphaMap: undefined,
  ior: 1.5,
  emissive: '#000000',
  emissiveIntensity: 0,
  normalScale: [1, 1],
  displacementScale: 1,
  displacementBias: 0,
  clearcoat: 0,
  clearcoatRoughness: 0,
  clearcoatNormalMap: undefined,
};

const initialDrawingState: DrawingState = {
  isActive: false,
  tool: null,
  startPoint: null,
  currentPoint: null,
  measureDistance: null,
  pushPullFaceInfo: null,
  polygonSides: 6,
};

const initialDirectionalLight: DirectionalLightSceneProps = {
  id: uuidv4(),
  type: 'directional',
  name: 'Default Directional Light',
  color: '#ffffff',
  intensity: 1.5,
  position: [5, 10, 7.5],
  castShadow: true,
  shadowBias: -0.0005,
  visible: true,
};

const initialRenderSettings: RenderSettings = {
  engine: 'cycles',
  resolutionPreset: 'FullHD',
  resolution: '1920x1080',
  outputFormat: 'png',
  samples: 128,
};

const initialCameraSettings: CameraSettings = {
  type: 'standard',
  fov: 60,
  nearClip: 0.1,
  farClip: 2000, // Increased far clip
};

const initialEnvironmentSettings: EnvironmentSettings = {
    backgroundMode: 'color', // or 'physical_sky'
    backgroundColor: '#333333', // A neutral dark gray for rendering mode by default
    usePhysicalSky: true,
    physicalSkySettings: {
        skyModel: 'hosek_wilkie',
        turbidity: 3,
        sunPositionMode: 'manual',
        azimuth: 180,
        altitude: 45,
        intensity: 1,
        sunDiskSize: 0.5,
        groundAlbedo: 0.3,
        ozone: 0.35,
    },
};

const initialPostProcessingSettings: PostProcessingSettings = {
    bloom: { enabled: true, intensity: 0.5, threshold: 0.8, radius: 0.5 },
    colorGrading: { enabled: true, exposure: 0, contrast: 1, saturation: 1, temperature: 6500, tint: 0 },
};


const initialDefaultLayer: SceneLayer = {
  id: DEFAULT_LAYER_ID,
  name: DEFAULT_LAYER_NAME,
  visible: true,
  locked: false,
  color: '#888888', 
  objectCount: 0,
};

const initialAnimationData: AnimationData = {
  duration: 10, // e.g. 10 seconds
  fps: 24,
  tracks: [],
};


export const getDefaultSceneData = (): SceneData => ({
  objects: [],
  materials: [initialDefaultMaterial],
  ambientLight: { 
    color: '#ffffff',
    intensity: 1.0, 
  },
  directionalLight: initialDirectionalLight,
  otherLights: [], 
  selectedObjectId: null,
  activeTool: 'select',
  activePaintMaterialId: null,
  appMode: 'modelling', 
  drawingState: initialDrawingState,
  measurementUnit: 'units', 
  requestedViewPreset: null,
  zoomExtentsTrigger: { timestamp: 0 },
  cameraFov: 60, 
  worldBackgroundColor: '#000000', 
  renderSettings: initialRenderSettings,
  cameraSettings: initialCameraSettings,
  environmentSettings: initialEnvironmentSettings,
  postProcessingSettings: initialPostProcessingSettings,
  layers: [initialDefaultLayer], 
  activeLayerId: DEFAULT_LAYER_ID, 
  savedViews: [],
  animationData: initialAnimationData,
  savedCameras: {},
});


export const getProjects = (): Project[] => {
  if (typeof window === 'undefined') return [];
  try {
    const projectsJson = localStorage.getItem(PROJECTS_STORAGE_KEY);
    return projectsJson ? JSON.parse(projectsJson) : [];
  } catch (error) {
    console.error("Error loading projects from localStorage:", error);
    return [];
  }
};

export const getProjectSummaries = (): ProjectSummary[] => {
  return getProjects().map(({ id, name, lastModified, thumbnail }) => ({
    id,
    name,
    lastModified,
    thumbnail,
  }));
};

export const getProjectById = (id: string): Project | null => {
  const projects = getProjects();
  return projects.find(p => p.id === id) || null;
};

export const saveProject = (project: Project): void => {
  if (typeof window === 'undefined') return;
  const projects = getProjects();
  const existingIndex = projects.findIndex(p => p.id === project.id);
  if (existingIndex > -1) {
    projects[existingIndex] = project;
  } else {
    projects.push(project);
  }
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error("Error saving project to localStorage:", error);
  }
};

export const createNewProject = (name: string): Project => {
  const newProject: Project = {
    id: uuidv4(),
    name,
    lastModified: Date.now(),
    sceneData: getDefaultSceneData(),
  };
  saveProject(newProject);
  return newProject;
};

export const updateProject = (id: string, updates: Partial<Omit<Project, 'id'>>): Project | null => {
  const project = getProjectById(id);
  if (project) {
    const updatedProject = { ...project, ...updates, lastModified: Date.now() };
    saveProject(updatedProject);
    return updatedProject;
  }
  return null;
};

export const deleteProject = (id: string): void => {
  if (typeof window === 'undefined') return;
  let projects = getProjects();
  projects = projects.filter(p => p.id !== id);
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error("Error deleting project from localStorage:", error);
  }
};
