# Tech Stack - Idea Database

A modern, full-stack web application designed for capturing, organizing, and tracking ideas with a premium, glassmorphic UI.

## Frontend
- **React (TypeScript)**: The core UI library used for building a responsive and interactive single-page application (SPA).
- **Vite**: A high-performance build tool and development server that provides extremely fast hot-module replacement (HMR).
- **Vanilla CSS**: Used for all styling, implementing a "glassmorphism" aesthetic with vibrant gradients, blurs, and smooth micro-animations.
- **Lucide React**: A clean and consistent icon library used for metadata representation and UI controls.
- **Recharts**: An interactive charting library used for the dashboard's visual data representation (donut charts for category, difficulty, etc.).

## Backend & Database
- **Supabase**: A Backend-as-a-Service (BaaS) that provides:
    - **PostgreSQL**: The primary database for persistent idea storage.
    - **Supabase Auth**: Secure user authentication (Login/Sign-up) and session management.
    - **Row Level Security (RLS)**: Ensures that users can only access their own ideas.

## Infrastructure & DevOps
- **GitHub Pages**: Used for hosting the static frontend assets.
- **GitHub Actions**: Automated CI/CD pipeline that builds the project and deploys it to GitHub Pages on every push to the main branch.
- **TypeScript**: Used for full-stack type safety, sharing definitions between the frontend and any potentially shared logic.

## Project Structure
- `/client`: React source code, components, and styling.
- `/shared`: Common TypeScript interfaces and shared type definitions.
- `/docs`: Project documentation and architecture outlines.
