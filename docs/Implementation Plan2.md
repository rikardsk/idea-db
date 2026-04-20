# Feature Enhancements Plan

Add filtering by priority, idea deletion, edit panel toggling, and a dark/light mode switcher.

## User Review Required

> [!NOTE]
> I will implement the **Dark/Light Mode** by toggling a CSS class on the root element and using CSS variables for high-fidelity theme switching.

## Proposed Changes

### Frontend (public/index.html)
#### [MODIFY] [index.html](file:///c:/Users/rikar/OneDrive/Skrivbord/Idea%20Database/server/public/index.html)
- **State Management**:
  - Add `filterPriority` state (options: All, Low, Medium, High).
  - Add `isPanelVisible` state for the editor sidebar.
  - Add `theme` state ('dark' or 'light').
- **Filtering Logic**:
  - Update `filteredIdeas` to account for `filterPriority`.
- **UI Components**:
  - **Header**: Add a "Theme Toggle" button and a "Toggle Editor" button.
  - **Sidebar**: Add a priority selector next to the status selector.
  - **Editor Panel**: Add a "Delete" button (only visible when an existing idea is selected).
- **Styling**:
  - Add a `.light-mode` class definition with overridden CSS variables.
  - Add transition effects for the editor panel sliding in/out.

---

## Verification Plan

### Automated Tests
- None planned for this UI-heavy update (manual verification preferred).

### Manual Verification
- **Priority Filter**: Verify that selecting a priority correctly filters the list.
- **Idea Deletion**: Create an idea, delete it, and verify it's removed from both the list and the backend (by refreshing).
- **Panel Toggle**: Verify that the editor panel can be hidden and shown, and that the main list expands/contracts properly.
- **Theme Switch**: Verify that clicking the theme button switches all colors correctly and maintains readability.

## Open Questions
- Where would you like the "Toggle Editor" and "Theme Switch" buttons to be placed? I was thinking of placing them in the top-right of the dashboard header.
