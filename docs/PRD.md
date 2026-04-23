# Product Requirements Document (PRD) - Idea Database

## 1. Product Vision
The **Idea Database** is a modern, high-performance web application designed to help users capture, organize, and track creative ideas. It provides a central, secure, and visually stunning workspace to ensure that no creative spark is lost.

## 2. Target Audience
- Developers and Makers
- Entrepreneurs
- Creative writers and designers
- Anyone needing a structured way to manage a growing list of projects

## 3. Core Features

### 3.1 Idea Management
- **Capture**: Quickly add new ideas with a title, description, and rich metadata.
- **Editing**: Full CRUD (Create, Read, Update, Delete) capabilities.
- **Version Tracking**: Automatic "Created At" and "Updated At" timestamps.

### 3.2 Categorization & Organization
- **Smart Labels**: Assign Category (AI, SaaS, Mobile, etc.), Priority, and Difficulty.
- **Status Lifecycle**: Track ideas through a workflow (Draft → Researching → In Progress → Implemented).
- **Tagging**: Support for custom tags to enable flexible grouping.

### 3.3 Dashboard & Analytics
- **At-a-Glance Stats**: Summary cards showing total counts and active projects.
- **Visual Insights**: Interactive donut charts representing the distribution of ideas by category, status, difficulty, and priority.

### 3.4 Search & Discovery
- **Live Search**: Instant keyword search through titles and descriptions.
- **Advanced Filtering**: Collapsible filter panels to drill down by status, category, or priority.
- **Sorting**: Multiple sort order options (Newest, Oldest, Priority, Difficulty).

### 3.5 Data & Security
- **Secure Auth**: Individual user accounts powered by Supabase.
- **Private Storage**: Row Level Security (RLS) ensures ideas are private to the creator.
- **Portability**: JSON export/import for backups and data migration.

## 4. User Experience (UX)
- **Glassmorphic UI**: High-end aesthetic with frosted glass effects, vibrant gradients, and smooth transitions.
- **Split-View Editor**: A desktop-style layout with a draggable splitter between the list and the editor.
- **Responsive Design**: Works seamlessly across desktop and touch-friendly devices.
- **Print Support**: Dedicated stylesheets for printing clean physical copies of ideas or lists.

## 5. Technical Requirements
- **Hosting**: Static deployment on GitHub Pages.
- **CI/CD**: Automatic builds via GitHub Actions.
- **Database**: PostgreSQL (Supabase) for real-time persistence.
