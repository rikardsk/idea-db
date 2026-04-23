# Database Schema - Idea Database

The Idea Database uses **Supabase (PostgreSQL)** for data persistence. The schema is designed for multi-user support with built-in security via Row Level Security (RLS).

## 1. Table: `ideas`
This is the primary storage table for all user-generated ideas.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, Default: `gen_random_uuid()` | Unique identifier for each idea. |
| `user_id` | `uuid` | Foreign Key (auth.users.id) | Links the idea to a specific authenticated user. |
| `title` | `text` | NOT NULL | The headline of the idea. |
| `description`| `text` | | Detailed breakdown of the concept. |
| `tags` | `text[]` | Default: `'{}'` | Array of keywords for grouping. |
| `status` | `text` | NOT NULL | 'Draft', 'Researching', 'In Progress', 'Implemented', 'Archived'. |
| `priority` | `text` | NOT NULL | 'Low', 'Medium', 'High'. |
| `category` | `text` | NOT NULL | 'AI', 'SaaS', 'Web', 'Mobile', etc. |
| `difficulty` | `text` | NOT NULL | 'Easy', 'Medium', 'Hard', 'Very Hard', 'Impossible'. |
| `created_at` | `timestamptz`| Default: `now()` | Record creation timestamp. |
| `updated_at` | `timestamptz`| Default: `now()` | Last modification timestamp. |

## 2. Row Level Security (RLS)
The database enforces strict privacy to ensure users cannot see or modify ideas belonging to others.

### Policies:
- **SELECT**: Users can only view records where `user_id == auth.uid()`.
- **INSERT**: Users can only insert records where `user_id == auth.uid()`.
- **UPDATE**: Users can only update records where `user_id == auth.uid()`.
- **DELETE**: Users can only delete records where `user_id == auth.uid()`.

## 3. Relationships
- **Users**: Each record has a direct relationship with the `auth.users` table managed by Supabase Authentication.

## 4. Performance Optimizations
- **Index**: An index is typically applied to `user_id` to ensure fast filtered queries as the database grows.
- **Automatic Timestamps**: The `updated_at` column is automatically handled via a PostgreSQL trigger on every modification.
