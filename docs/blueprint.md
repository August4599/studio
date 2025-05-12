# **App Name**: ArchiVision

## Core Features:

- 3D Scene Viewer: Interactive 3D scene display using Three.js, allowing users to view architectural models from different angles and perspectives.
- Primitive Object Creation: Basic object creation (cubes, cylinders, planes) with customizable dimensions and placement within the 3D scene.
- Material & Texture Application: Material application and texture mapping functionality, enabling users to apply different materials and textures to objects in the scene. Use of uploaded texture maps for a PBR workflow.
- Lighting Control: Control light source settings with real-time updates. Uses an AI tool to guide selection of key values based on descriptive requirements from the user (for example, it will use an AI "tool" to try to meet the descriptive goal when a user requests soft, diffuse light).
- Scene Persistence: Saving and loading of project scenes in JSON format, enabling users to store their work and resume editing later.

## Style Guidelines:

- Primary color: Light gray (#F0F0F0) for a clean, neutral background.
- Secondary color: Dark gray (#333) for UI elements and text, providing good contrast.
- Accent: Teal (#008080) for interactive elements, highlights, and calls to action.
- Clean, sans-serif fonts for all UI elements to ensure readability and a modern look.
- Use simple, outline-style icons for tools and functions, providing a minimalistic and intuitive interface.
- A split-screen layout with a sidebar for tools and settings, and a large viewport for the 3D scene.
- Subtle transitions and animations for UI interactions (e.g., tool selections, property panel updates) to enhance the user experience.