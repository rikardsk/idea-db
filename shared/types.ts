export type IdeaStatus = 'Draft' | 'Researching' | 'In Progress' | 'Implemented' | 'Archived';
export type IdeaPriority = 'Low' | 'Medium' | 'High';
export type IdeaCategory = 
  | 'AI' 
  | 'Desktop' 
  | 'Digital Product' 
  | 'Economy' 
  | 'Education'
  | 'Fun' 
  | 'Game' 
  | 'Hobbies' 
  | 'Mobile' 
  | 'Other' 
  | 'Physical Product' 
  | 'SaaS' 
  | 'Services' 
  | 'Training'
  | 'Useful' 
  | 'Web';
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
  byStatus: Record<IdeaStatus, number>;
  byPriority: Record<IdeaPriority, number>;
}
