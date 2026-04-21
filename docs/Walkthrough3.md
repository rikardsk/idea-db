# Export, Import, and Print Implementations

All requested features have been implemented successfully according to the approved plan.

## Backend Implementation

Added a robust endpoint `POST /api/ideas/import` for handling data synchronization.
- **Auto-merging functionality:** Rather than destructively wiping out your database on import, the backend scans incoming JSON. It overwrites conflicting IDs (updating `updatedAt` timestamps) and newly appends unique ideas, guaranteeing no accidental data loss while synchronizing across devices.

## Frontend UI Improvements

The sidebar's action row now cleanly hosts three new utilities `Export`, `Import`, and `Print List`.

1. **Export Ideas** (`Download` icon): Instantly triggers a local download of your entire database encoded safely as `ideas-backup.json`.
2. **Import Ideas** (`Upload` icon): Opens a standard file picker that reads an `.json` file and safely pushes it to the backend. It alerts you upon merging success and immediately refreshes the UI!
3. **Print** (`Printer` icon): There are now TWO printing contexts:
   - In the sidebar action row, printing generates a clean vertical list of every idea in the database.
   - When actively editing an idea, an extra printer icon appears in the editor header. Triggering it cleanly prints that specific form out.

## Print to PDF Styling

Using native `@media print` CSS controls, I have restructured how the browser renders the page onto physical paper / PDF files.
- **Ink-Saving:** Removed all dark backgrounds, heavy glassmorphism filters, and box-shadows. The printed page strictly uses high-contrast black text on a white canvas.
- **Clutter-Free:** Automatically hides all navigation components (dashboard header, splitters, sidebars) and interactive UI like buttons, leaving only the data you need. 

> [!TIP]
> You can save any printview as a PDF! Simply click a `Print` button, and in your browser's Print Dialog, change the `<Destination>` option from your physical printer to **"Save as PDF"**.
