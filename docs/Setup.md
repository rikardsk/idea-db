# Project Setup: Idea Database

This document provides a step-by-step description of how the Idea Database project was initialized and developed.

## 1. Initial Project Scaffolding

The project was structured as a monorepo containing both the frontend and backend.

### Frontend Setup
The frontend was created using Vite with the React-TypeScript template:
```bash
npx create-vite@latest client --template react-ts
cd client
npm install
npm install lucide-react recharts @supabase/supabase-js
```

### Backend Setup
The backend was initialized as a Node.js Express application with TypeScript:
```bash
mkdir server
cd server
npm init -y
npm install express cors uuid
npm install -D typescript tsx @types/express @types/cors @types/node @types/uuid
```

### Shared Logic
A `shared` folder was created at the root to store common TypeScript interfaces and types used by both the frontend and backend.

---

## 2. Development Phases

### Phase 1: Local Development (Express & JSON)
Initially, the application used a local Express server that stored ideas in a JSON file (`server/data/ideas.json`).
- **Scripts:** `npm run dev` in `server/package.json` used `tsx` to run the TypeScript source code directly.
- **UI:** Implemented a glassmorphic dark-mode design with vanilla CSS.

### Phase 2: Visualization & Refinement
- **Charts:** Integrated `recharts` to provide visual insights into idea categories and progress status.
- **Layout:** Implemented a draggable splitter and a responsive dashboard with a floating action button (FAB) for navigation.

### Phase 3: Supabase Migration
The project transitioned from local storage to **Supabase** for database persistence and authentication.
- **Database:** Created `ideas` and `profiles` tables with Row Level Security (RLS).
- **Auth:** Migrated to Supabase Auth for user management.
- **SDK:** The client was updated to interface directly with the Supabase client library.

### Phase 4: CI/CD & Deployment
GitHub Actions were configured to automate the deployment process.
- **Frontend Deployment:** Automated build and deploy to GitHub Pages.
- **CI:** Linting and type-checking on every push.

---

## 3. Folder Structure Overview

```text
idea-database/
├── .github/             # GitHub Actions workflows
├── client/              # Vite + React + TS Frontend
│   ├── src/
│   │   ├── components/  # React components (Glassmorphic)
│   │   ├── hooks/       # Supabase and state hooks
│   │   └── lib/         # Supabase client config
│   └── index.css        # Main design system
├── server/              # Express Backend (Legacy/Utility)
│   ├── src/
│   └── data/           # Local JSON storage (Phase 1)
├── shared/              # Shared TS Interfaces
├── docs/                # Project documentation
└── README.md            # Project overview
```

---

## 4. Key Scripts

### Client
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles TypeScript and builds the production bundle.
- `npm run preview`: Previews the production build locally.

### Server
- `npm run dev`: Starts the Express server with `tsx watch`.
- `npm run build`: Compiles TypeScript to JavaScript.

---

## 5. Technology Stack
- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Vanilla CSS (Glassmorphism)
- **Database/Auth:** Supabase
- **Icons:** Lucide-React
- **Visualization:** Recharts
- **Deployment:** GitHub Pages & Actions
