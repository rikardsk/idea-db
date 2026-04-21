import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define types locally
export type IdeaStatus = 'Draft' | 'Researching' | 'In Progress' | 'Implemented' | 'Archived';
export type IdeaPriority = 'Low' | 'Medium' | 'High';
export type IdeaCategory = 'Web' | 'Mobile' | 'Desktop' | 'Game' | 'Other';
export type IdeaDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Impossible';

export interface Idea {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: IdeaStatus;
  priority: IdeaPriority;
  category: IdeaCategory;
  difficulty: IdeaDifficulty;
  createdAt: string;
  updatedAt: string;
}

export interface IdeaStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_PATH = path.join(__dirname, '../data/ideas.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Helper to ensure data file exists
async function ensureDataFile() {
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, JSON.stringify([], null, 2));
  }
}

// Routes
app.get('/api/ideas', async (req, res) => {
  try {
    await ensureDataFile();
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read ideas' });
  }
});

app.post('/api/ideas', async (req, res) => {
  try {
    await ensureDataFile();
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    const ideas: Idea[] = JSON.parse(data);
    
    const newIdea: Idea = {
      ...req.body,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    ideas.push(newIdea);
    await fs.writeFile(DATA_PATH, JSON.stringify(ideas, null, 2));
    res.status(201).json(newIdea);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save idea' });
  }
});

app.post('/api/ideas/import', async (req, res) => {
  try {
    await ensureDataFile();
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    const existingIdeas: Idea[] = JSON.parse(data);
    const importedIdeas: Idea[] = req.body;
    
    if (!Array.isArray(importedIdeas)) {
      return res.status(400).json({ error: 'Invalid format, expected an array' });
    }

    const merged = [...existingIdeas];
    for (const incoming of importedIdeas) {
      if (!incoming.id) incoming.id = uuidv4();
      const existingIndex = merged.findIndex(i => i.id === incoming.id);
      if (existingIndex !== -1) {
        merged[existingIndex] = { ...merged[existingIndex], ...incoming, updatedAt: new Date().toISOString() };
      } else {
        merged.push({ ...incoming, createdAt: incoming.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
    }

    await fs.writeFile(DATA_PATH, JSON.stringify(merged, null, 2));
    res.json({ success: true, imported: importedIdeas.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to import ideas' });
  }
});

app.put('/api/ideas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    let ideas: Idea[] = JSON.parse(data);
    
    const index = ideas.findIndex(i => i.id === id);
    if (index === -1) return res.status(404).json({ error: 'Idea not found' });
    
    ideas[index] = {
      ...ideas[index],
      ...req.body,
      id, // ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };
    
    await fs.writeFile(DATA_PATH, JSON.stringify(ideas, null, 2));
    res.json(ideas[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update idea' });
  }
});

app.delete('/api/ideas', async (_req, res) => {
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify([], null, 2));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete all ideas' });
  }
});

app.delete('/api/ideas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    let ideas: Idea[] = JSON.parse(data);
    
    ideas = ideas.filter(i => i.id !== id);
    await fs.writeFile(DATA_PATH, JSON.stringify(ideas, null, 2));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete idea' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    await ensureDataFile();
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    const ideas: Idea[] = JSON.parse(data);
    
    const stats: IdeaStats = {
      total: ideas.length,
      byStatus: ideas.reduce((acc, idea) => {
        acc[idea.status] = (acc[idea.status] || 0) + 1;
        return acc;
      }, {} as any),
      byPriority: ideas.reduce((acc, idea) => {
        acc[idea.priority] = (acc[idea.priority] || 0) + 1;
        return acc;
      }, {} as any),
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
