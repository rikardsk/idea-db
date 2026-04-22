# Migration Plan: Express to Supabase

Migrate the Idea Database from a local Express/JSON backend to Supabase for cloud persistence and built-in authentication.

## Proposed Changes

### Database Setup (Completed)
- [x] Create `ideas` table with Row Level Security (RLS).
- [x] Configure policies so users only access their own data.

### Frontend Integration

#### [NEW] [Auth.tsx](file:///c:/Users/rikar/OneDrive/Skrivbord/Idea%20Database/client/src/Auth.tsx)
- Create a reusable authentication component using Supabase's `signUp` and `signInWithPassword`.
- Include a toggle between Login and Sign-up modes.

#### [MODIFY] [App.tsx](file:///c:/Users/rikar/OneDrive/Skrivbord/Idea%20Database/client/src/App.tsx)
- **Session Management**: Add `useState<Session | null>(null)` and an `onAuthStateChange` listener in `useEffect`.
- **Conditional Rendering**: Show the `Auth` component if no user is signed in.
- **Data Hook Refactor**: 
    - Replace `fetch('/api/ideas')` with `supabase.from('ideas').select('*')`.
    - Update `handleSave` to use `supabase.from('ideas').upsert()`.
    - Update `handleDelete` to use `supabase.from('ideas').delete()`.
- **User Scoping**: Ensure every new idea includes the `user_id` from the current session.

## Verification Plan

### Manual Verification
- Sign up with a new email and password.
- Verify that a confirmation email is sent (if enabled in Supabase) or just log in directly if provider settings allow.
- Create an idea and check the Supabase Dashboard to confirm it was saved with the correct `user_id`.
- Log out and log back in to ensure data persistence.
- (Optional) Try to access ideas from a different account to verify RLS privacy.
