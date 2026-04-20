# Idea Database Walkthrough

The Idea Database is a modern, dark-themed web application designed to capture and manage your ideas with a premium feel.

## Key Features
- **Stat Dashboard**: Top panel showing total ideas and status breakdown.
- **Dynamic List**: Search and filter through your ideas efficiently.
- **Action Panel**: Seamlessly create or update ideas in a glassmorphic sidebar.
- **Persistence**: Data is saved to a local `ideas.json` file for portability.

## Project Structure
- `server/`: Express backend (Node 14 compatible).
- `server/data/ideas.json`: Local storage file.
- `server/public/index.html`: High-fidelity React frontend.

## How to Run
1. Open a terminal in the `server` directory.
2. Run `npm run dev`.
3. Open `http://localhost:3001` in your browser.

## Tech Stack
- **Frontend**: React, Lucide Icons, Vanilla CSS (Glassmorphism).
- **Backend**: Node.js, Express, File-based JSON storage.

---

### UI Preview
- **Theme**: Premium Dark Mode.
- **Layout**: Dashboard Header + 2-Column Main View.
- **Animations**: Subtle fade-ins and hover scales.
