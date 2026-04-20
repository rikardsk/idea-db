# Resizable Layout & Colored Light Mode Plan

Modernize the layout with a draggable splitter and move away from pure white in Light Mode.

## User Review Required

> [!IMPORTANT]
> The **Resizable Layout** will use a custom React interaction. I will implement a vertical bar between the columns that you can drag to resize.

## Proposed Changes

### Frontend (public/index.html)
#### [MODIFY] [index.html](file:///c:/Users/rikar/OneDrive/Skrivbord/Idea%20Database/server/public/index.html)
- **Theming**:
  - Update `light-mode` CSS variables to use a **Soft Powder Blue** palette instead of white-on-white.
    - `--bg-color`: `#f0f7ff` (Lighter blue-gray).
    - `--card-bg`: `#e0eefd` (Soft blue tinted cards).
    - `--panel-bg`: `rgba(224, 238, 253, 0.8)`.
- **Resizable Splitter**:
  - **State**: Add `sidebarWidth` (default 350px).
  - **Interaction**:
    - Add a `Divider` element between the Editor and the List.
    - Implement `onMouseDown` on the divider to start tracking mouse movement.
    - Update `sidebarWidth` based on mouse position during drag.
  - **Layout**: Change `main-content` to use a dynamic `grid-template-columns: 1fr 4px ${sidebarWidth}px`.
- **UI Tweaks**:
  - Add a subtle shadow to the divider when hovered.
  - Ensure the "Centered List" mode (from previous request) still works or is replaced by this more flexible layout. 
    > [!TIP]
    > I'll keep the toggle button, but it will now "Reset" to a wide view if needed.

---

## Verification Plan

### Automated Tests
- None (UI interaction manual test).

### Manual Verification
- **Splitter**: Click and drag the vertical bar between the editor and list. Verify it resizes smoothly.
- **Theme Switch**: Toggle to Light Mode and verify the new "Soft Blue" colors are distinct and easy on the eyes.
- **Persistence**: Check if the layout remains stable after saving an idea.

## Open Questions
- What is the minimum/maximum width you'd like for the list side? (Thinking 300px min, 800px max).
- Is a "Soft Blue" palette okay, or would you prefer something else like "Warm Sand" or "Light Mint"?
