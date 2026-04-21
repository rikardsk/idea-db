# Implement Export, Import, and Print PDF

This plan addresses the two newly requested features: Export/Importing data to/from JSON, and Printing ideas to PDF.

## 1. Export and Import

### Backend (`server/src/index.ts`)
- [MODIFY] Add a `POST /api/ideas/import` endpoint.
  - It will accept an array of ideas in the request body.
  - It will merge imported ideas with existing ones (overwriting if the `id` already exists, or creating a new entry otherwise) or simply replace the list depending on preference. *Proposed approach: Merge by ID to prevent data loss.*

### Frontend (`client/src/App.tsx`)
- Add **Export** and **Import** buttons to the sidebar's `action-row` (next to Filters and Sort).
- **Export** button functionality:
  - Generates a JSON string from the `ideas` state.
  - Uses a dynamic `<a>` tag with a blob URL to trigger a file download (`ideas-export.json`).
- **Import** button functionality:
  - Uses an invisible `<input type="file" accept=".json">`.
  - When a file is selected, it will read the file via `FileReader`, parse the JSON, and send it to the new `POST /api/ideas/import` backend endpoint.
  - Automatically fetches the updated list of ideas.

## 2. Print PDF

The most robust way to support "Print to PDF" in web browsers is using the native `window.print()` dialog combined with specialized CSS `@media print` styling to hide unnecessary UI elements.

### Frontend UI (`client/src/App.tsx`)
- Add a **Print** button (using the `Printer` icon from lucide-react).
  - If an idea is selected, we place the Print button in the top right of the editor panel.
  - If no idea is selected, we place a Print button in the sidebar to print the whole list.

### Styling (`client/src/index.css`)
- [MODIFY] Add `@media print` rules.
  - Hide elements like `.dashboard-header`, `.splitter`, `.sidebar`, and all `.btn` elements.
  - Force `.main-content`, `.app-container`, and `.editor-panel` heights to `auto` and remove scrollbars so everything expands and pagination works cleanly.
  - Remove dark backgrounds/glass effects and make text black on a white background strictly for the printed PDF for clean styling and ink-saving.

## Open Questions
> [!IMPORTANT]
> **Import Behavior:** When importing ideas, should we **Merge** new ideas with existing ones (keeping what you have but adding the new file's content), or should we **Replace** the entire database with the imported file?

> [!IMPORTANT]
> **Print Scope:** By proposing `window.print()`, the browser handles PDF generation automatically. Is it acceptable to apply a print stylesheet and use the browser's native print-to-pdf dialog, or are you expecting a strictly silent PDF file download (which requires adding complex backend PDF libraries)?
