# Idea Database Implementation Plan

Create a modern, browser-first Idea Database app to capture, organize, and track ideas.

## User Review Required

> [!IMPORTANT]
> The app will be split into a `client` (React) and a `server` (Express) directory.
> I will use TypeScript for both as per the rules in `GEMINI.md`.

## Proposed Changes

### Project Foundation
- Initialize a monorepo-like structure:
  - `client/`: Vite + React + TypeScript + Vanilla CSS.
  - `server/`: Node + Express + TypeScript.
  - `shared/`: Shared TypeScript interfaces.

---

### Backend (Lightweight Server)
#### [NEW] [server/src/index.ts]
- Set up Express with JSON body parser.
- CRUD endpoints:
  - `GET /api/ideas`: List ideas (supports basic filtering).
  - `POST /api/ideas`: Create a new idea.
  - `PUT /api/ideas/:id`: Update an existing idea.
  - `DELETE /api/ideas/:id`: Delete an idea.
- Persistence: JSON file storage (`data/ideas.json`) for simplicity and portability.

---

### Frontend (React UI)
#### [NEW] [client/src/App.tsx]
- Main layout implementation.
- Stat infographic dashboard at the top (Total, Active, archived counts).
- Split view:
  - **Left**: Search bar, filter toggles, scrollable idea list.
  - **Right**: Action Panel (Form for New/Edit).

#### [NEW] [client/src/index.css]
- Custom CSS utility variables (Colors, Shadow, Spacing).
- Premium design: Dark mode with translucent panels (Glassmorphism), gradients, and smooth hover scales.

#### [NEW] [client/src/components/infographics/StatsOverview.tsx]
- Component for the top dashboard cards.

#### [NEW] [client/src/components/ideas/IdeaList.tsx]
- Renders the list of ideas with status badges.

#### [NEW] [client/src/components/ideas/IdeaForm.tsx]
- Form for capturing and updating ideas.

---

## Open Questions

1. **Theme Preference**: Should I start with a default **Dark Mode** (more modern/premium) or **Light Mode**?
2. **Infographics**: Are simple stat cards enough for now, or would you like a chart (e.g., status distribution pie chart)?
3. **Data Storage**: Is a local JSON file sufficient for "lightweight" storage, or would you prefer a local SQLite database file?

## Verification Plan

### Automated Tests
- `npm test` in server for CRUD validation.
- Unit tests for idea filtering logic.

### Manual Verification
- Create an idea and verify it appears in the list.
- Search for an idea.
- Update an idea and check if the dashboard stats update.
- Verify UI responsiveness.
