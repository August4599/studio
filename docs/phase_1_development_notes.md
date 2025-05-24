# Phase 1 Development Notes

## Phase 1 Overview

The primary goal of Phase 1 was to enhance the core modeling tools and UI foundation of the ArchiSketch 3D application. This involved activating and managing state for several tool properties, implementing UI for object modifiers and custom attributes, and enabling more advanced material properties. While UI and state management are now largely functional for these features, the underlying geometric logic and rendering effects for many of these new tools and modifiers are deferred to future implementation phases.

## Implemented Features

### ToolsPanel Enhancements (`src/components/sidebar/ToolsPanel.tsx`)

The `ToolsPanel` has been updated to activate several tools, with their respective properties managed in the `ToolPropertiesPanel`.

*   **Offset Tool:**
    *   UI and state management for Offset tool properties (Distance, Allow Overlap, Offset Both Sides) are now active in `ToolPropertiesPanel`.
    *   Users can input values for these properties, and the application state (`scene-context.tsx` via `DrawingState`) will reflect these changes.
    *   The actual geometric offsetting logic based on these properties is deferred.

*   **Rotated Rectangle Tool:**
    *   UI and state management for Rotated Rectangle tool properties (Edge 1 Length, Edge 2 Length, Angle) are now active in `ToolPropertiesPanel`.
    *   The application state correctly manages these values.
    *   The geometric logic for drawing rotated rectangles based on these inputs is deferred.

*   **Soften Edges Tool:**
    *   UI and state management for Soften Edges tool properties (Angle, Soften Coplanar) are now active in `ToolPropertiesPanel`.
    *   The application state correctly manages these values.
    *   The geometric logic for softening edges is deferred.

### ObjectPropertiesPanel Enhancements (`src/components/sidebar/ObjectPropertiesPanel.tsx`)

Significant enhancements were made to the `ObjectPropertiesPanel` to manage modifiers and custom attributes for selected objects.

*   **Modifier Stack:**
    *   A new UI section allows users to manage a stack of modifiers for the selected object.
    *   **Functionality:**
        *   **Add:** Modifiers can be added from a predefined list (`ALL_MODIFIER_TYPES` in `src/types/index.ts`).
        *   **Remove:** Modifiers can be removed from an object's stack.
        *   **Reorder:** Modifiers can be moved up or down in the stack.
        *   **Rename:** Each applied modifier instance can be renamed.
        *   **Enable/Disable:** The effect of a modifier can be toggled.
    *   **Type Definition:** The `AppliedModifier` interface (`src/types/index.ts`) defines the structure for applied modifiers: `{ id: string; type: ModifierType; name: string; enabled: boolean; properties: Record<string, any>; showInViewport?: boolean; }`.
    *   **Note:** While the UI for managing the stack is functional, the actual geometric effects of these modifiers on the scene objects are WIP and deferred for future implementation. Modifier-specific properties are also not yet editable.

*   **Custom Attributes:**
    *   The UI now allows for adding, viewing, editing values of, and removing custom attributes for selected objects.
    *   Attributes are stored as string key-value pairs (e.g., `customAttributes: { "Price": "100", "Category": "Furniture" }`).
    *   The UI provides input fields for new attribute keys and values, and lists existing attributes with options to edit values or delete the attribute.

### MaterialEditorDialog Enhancements (`src/components/sidebar/MaterialsPanelAccordion.tsx`)

The `MaterialEditorDialog` has been updated to enable more detailed material property adjustments.

*   **UVW Mapping Controls:**
    *   The following UVW mapping controls are now interactive and their state is managed:
        *   `uvwMappingType` (Select: UV Channel, Box, Planar, etc.)
        *   `uvRealWorldScale` (Checkbox)
        *   `uvChannel` (Number Input)
        *   `uvFlipU` (Checkbox for flipping U coordinate)
        *   `uvFlipV` (Checkbox for flipping V coordinate)
        *   `uvBoxProjectionBlend` (Slider, relevant for Box/Triplanar)
        *   `uvProjectionAxis` (Select, relevant for Planar)
*   **Texture Inputs & PBR Sliders:**
    *   State management for Emissive, Ambient Occlusion (AO), and Displacement texture inputs is functional. Users can upload textures, and the material state reflects these changes.
    *   Associated PBR sliders (Emissive Intensity, AO Intensity, Displacement Scale, Displacement Bias) are also interactive and update the material state.
    *   **Note:** The actual rendering effects of these advanced material properties and UVW mapping adjustments are dependent on the 3D renderer's capabilities and its integration, which is part of ongoing development.

### Type Definitions (`src/types/index.ts`)

*   **`DrawingState` Updates:** The `DrawingState` interface was augmented to include new optional properties required by the newly activated tools:
    *   For Offset: `offsetDistance?`, `offsetAllowOverlap?`, `offsetBothSides?`
    *   For Rotated Rectangle: `rectangleWidth?`, `rectangleHeight?`, `rectangleAngle?`
    *   For Soften Edges: `softenEdgesAngle?`, `softenCoplanar?`
*   **`AppliedModifier` Type:** As mentioned above, the `AppliedModifier` type and `ModifierType` union were defined to support the new modifier stack feature. The `ALL_MODIFIER_TYPES` constant array was also added.

## Architectural Decisions & Notes

### State Management (`src/context/scene-context.tsx`)

*   **React Context Usage:** For Phase 1, React Context (`scene-context.tsx`) continues to be the primary method for global state management. This was deemed sufficient for the current scale and complexity.
*   **Growth of `scene-context`:** The context has expanded to include:
    *   Tool-specific properties within the `drawingState` object (e.g., `offsetDistance`, `polygonSides`, `softenEdgesAngle`).
    *   Functions for managing the new modifier stack (`addModifierToObject`, `removeModifierFromObject`, etc.).
*   **State Update Pattern:**
    *   When a tool is activated via `setActiveTool`, it typically initializes or resets its relevant properties within the `drawingState`. For example, activating the 'offset' tool copies the global default offset parameters from `sceneData` into `drawingState`.
    *   Controls in `ToolPropertiesPanel` then directly update these `drawingState` properties (or global defaults which in turn update `drawingState` for some tools like Offset).
*   **Future Considerations:**
    *   As the application grows, if performance issues arise due to frequent context updates or if the `scene-context` becomes overly large and difficult to manage, alternatives will be explored. These could include:
        *   More granular, specialized contexts.
        *   Dedicated state management libraries like Zustand or Jotai, which can offer performance benefits and more flexible update patterns.

### Responsiveness

*   A responsiveness review was conducted.
*   **Good:** The `RightInspectorPanel` (with its tabbed interface) and modal dialogs (like `MaterialEditorDialog`) demonstrate good responsive behavior, using `ScrollArea` and responsive width/column adjustments.
*   **Areas for Improvement:**
    *   **`ToolsSidebar`**: Currently has a fixed width (`w-64`), which is not ideal for very small screens. Future work should consider making it collapsible or adaptively sized (e.g., icon-only rail).
    *   **`ToolsPanel`**: The grid layout for tool buttons (currently `grid-cols-3`) within the `ToolsSidebar` is also fixed. If the sidebar's width becomes responsive, this grid should adapt accordingly (e.g., to 1 or 2 columns).

### User Feedback (Toasts)

*   Efforts were made to provide more consistent user feedback through toast notifications.
*   Successfully added toasts for CRUD-like operations in `ObjectPropertiesPanel`, specifically for:
    *   **Modifiers:** Adding, removing, renaming, enabling/disabling, and reordering.
    *   **Custom Attributes:** Adding, removing, and updating values.
*   This improves user experience by confirming actions.

### Testing

*   **`fileToDataURL` Unit Test (`src/lib/three-utils.test.ts`):**
    *   Unit tests were created for the `fileToDataURL` utility function using Vitest and jsdom.
    *   The primary success path (converting a `File` object to a data URL) is tested and passes.
    *   Mocking the `FileReader` API for all error conditions and edge cases (e.g., `null` or `ArrayBuffer` results from `reader.result`) proved complex within the Vitest/jsdom environment, with some tests for these scenarios not passing as expected despite several mocking strategy refinements. This suggests potential difficulties or subtle interactions in accurately simulating `FileReader`'s exact behavior in this specific test setup.
*   **General Testing Approach:**
    *   A significant portion of the new logic implemented in Phase 1 resides within React components (UI interactions, local state) or context actions (`scene-context.tsx`).
    *   While unit tests for pure utility functions are valuable, comprehensive testing of these UI-bound features would typically involve integration tests or End-to-End (E2E) tests. These types of tests were out of scope for the unit testing focus of this phase.

## Deferred Geometric Logic

It is important to reiterate that Phase 1 focused on establishing the UI and state management for new features. The actual geometric calculations, manipulations, and visual application of effects for the following features have been **deferred** to future implementation subtasks:

*   **Offset Tool:** Applying the offset to selected geometry.
*   **Rotated Rectangle Tool:** Drawing the rectangle in the 3D scene based on defined points or properties.
*   **Soften Edges Tool:** Modifying geometry to soften edges based on the angle.
*   **Modifiers:** Implementing the geometric algorithms for each modifier type (e.g., Bevel, Solidify, Array) and their effects on `SceneObject` meshes.

These will require dedicated development efforts focusing on the 3D core logic.
