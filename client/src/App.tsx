import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Plus, Search, Lightbulb, TrendingUp, Clock, Archive, Filter, 
  SortAsc, Globe, Smartphone, Monitor, 
  Gamepad2, Box, Gauge, Trash2
} from 'lucide-react';
import { Idea, IdeaStats, IdeaStatus, IdeaPriority, IdeaCategory, IdeaDifficulty } from '../../shared/types';

const CATEGORIES: { value: IdeaCategory; icon: any; label: string }[] = [
  { value: 'Web', icon: Globe, label: 'Web' },
  { value: 'Mobile', icon: Smartphone, label: 'Mobile' },
  { value: 'Desktop', icon: Monitor, label: 'Desktop' },
  { value: 'Game', icon: Gamepad2, label: 'Game' },
  { value: 'Other', icon: Box, label: 'Other' }
];

const DIFFICULTIES: IdeaDifficulty[] = ['Easy', 'Medium', 'Hard', 'Very Hard', 'Impossible'];

const DIFFICULTY_ORDER: Record<IdeaDifficulty, number> = {
  'Easy': 0, 'Medium': 1, 'Hard': 2, 'Very Hard': 3, 'Impossible': 4
};

const PRIORITY_ORDER: Record<IdeaPriority, number> = {
  'Low': 0, 'Medium': 1, 'High': 2
};

const App = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [stats, setStats] = useState<IdeaStats | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<IdeaStatus | 'All'>('All');
  const [filterCategory, setFilterCategory] = useState<IdeaCategory | 'All'>('All');
  const [filterDifficulty, setFilterDifficulty] = useState<IdeaDifficulty | 'All'>('All');
  const [filterPriority, setFilterPriority] = useState<IdeaPriority | 'All'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority' | 'difficulty'>('newest');
  
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Idea>>({
    title: '',
    description: '',
    status: 'Draft',
    priority: 'Medium',
    category: 'Web',
    difficulty: 'Medium',
    tags: []
  });
  const [isDirty, setIsDirty] = useState(false);
  const savedFormRef = useRef<Partial<Idea>>({});

  // Splitter drag state
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  const onSplitterPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = sidebarWidth;
    e.currentTarget.setPointerCapture(e.pointerId);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sidebarWidth]);

  const onSplitterPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    // sidebar is on the right, so dragging left increases its width
    const delta = dragStartX.current - e.clientX;
    const newWidth = Math.max(240, Math.min(600, dragStartWidth.current + delta));
    setSidebarWidth(newWidth);
  }, []);

  const onSplitterPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  const fetchIdeas = async () => {
    const res = await fetch('/api/ideas');
    const data = await res.json();
    setIdeas(data);
  };

  const fetchStats = async () => {
    const res = await fetch('/api/stats');
    const data = await res.json();
    setStats(data);
  };

  useEffect(() => {
    fetchIdeas();
    fetchStats();
  }, []);

  const filteredIdeas = useMemo(() => {
    return ideas
      .filter(idea => {
        const matchesSearch = idea.title.toLowerCase().includes(search.toLowerCase()) || 
                               idea.description.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'All' || idea.status === filterStatus;
        const matchesCategory = filterCategory === 'All' || idea.category === filterCategory;
        const matchesDifficulty = filterDifficulty === 'All' || idea.difficulty === filterDifficulty;
        const matchesPriority = filterPriority === 'All' || idea.priority === filterPriority;
        return matchesSearch && matchesStatus && matchesCategory && matchesDifficulty && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === 'priority') return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
        if (sortBy === 'difficulty') return DIFFICULTY_ORDER[b.difficulty] - DIFFICULTY_ORDER[a.difficulty];
        return 0;
      });
  }, [ideas, search, filterStatus, filterCategory, filterDifficulty, filterPriority, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setFilterStatus('All');
    setFilterCategory('All');
    setFilterDifficulty('All');
    setFilterPriority('All');
  };

  const isFiltered = search !== '' || filterStatus !== 'All' || filterCategory !== 'All' || filterDifficulty !== 'All' || filterPriority !== 'All';

  const handleCreateNew = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Discard them?')) return;
    setSelectedIdea(null);
    const blank = { title: '', description: '', status: 'Draft' as const, priority: 'Medium' as const, category: 'Web' as const, difficulty: 'Medium' as const, tags: [] };
    setFormData(blank);
    savedFormRef.current = blank;
    setIsDirty(false);
    setIsEditing(true);
  };

  const handleSelectIdea = (idea: Idea) => {
    if (isDirty && !window.confirm('You have unsaved changes. Discard them?')) return;
    setSelectedIdea(idea);
    setFormData(idea);
    savedFormRef.current = idea;
    setIsDirty(false);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = selectedIdea ? 'PUT' : 'POST';
    const url = selectedIdea ? `/api/ideas/${selectedIdea.id}` : '/api/ideas';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      fetchIdeas();
      fetchStats();
      setIsDirty(false);
      setIsEditing(false);
      setSelectedIdea(null);
    }
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Discard them?')) return;
    setIsDirty(false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!selectedIdea) return;
    if (!window.confirm(`Delete "${selectedIdea.title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/ideas/${selectedIdea.id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchIdeas();
      fetchStats();
      setIsDirty(false);
      setIsEditing(false);
      setSelectedIdea(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(`Delete ALL ${ideas.length} ideas? This cannot be undone.`)) return;
    const res = await fetch('/api/ideas', { method: 'DELETE' });
    if (res.ok) {
      fetchIdeas();
      fetchStats();
      setIsDirty(false);
      setIsEditing(false);
      setSelectedIdea(null);
    }
  };

  // Track dirty state whenever formData changes
  useEffect(() => {
    if (!isEditing) return;
    const saved = savedFormRef.current;
    const dirty =
      formData.title !== saved.title ||
      formData.description !== saved.description ||
      formData.status !== saved.status ||
      formData.priority !== saved.priority ||
      formData.category !== saved.category ||
      formData.difficulty !== saved.difficulty ||
      (formData.tags ?? []).join(',') !== (saved.tags ?? []).join(',');
    setIsDirty(dirty);
  }, [formData, isEditing]);

  return (
    <div className="app-container">
      {/* Dashboard Stats */}
      <div className="dashboard-header fade-in">
        <div className="stat-card glass">
          <div className="stat-title"><Lightbulb size={16} /> Total Ideas</div>
          <div className="stat-value">{stats?.total || 0}</div>
        </div>
        <div className="stat-card glass">
          <div className="stat-title"><TrendingUp size={16} /> In Progress</div>
          <div className="stat-value">{stats?.byStatus['In Progress'] || 0}</div>
        </div>
        <div className="stat-card glass">
          <div className="stat-title"><Clock size={16} /> Researching</div>
          <div className="stat-value">{stats?.byStatus['Researching'] || 0}</div>
        </div>
        <div className="stat-card glass">
          <div className="stat-title"><Archive size={16} /> Archived</div>
          <div className="stat-value">{stats?.byStatus['Archived'] || 0}</div>
        </div>
      </div>

      <main
        className="main-content"
        ref={mainContentRef}
        style={{ gridTemplateColumns: `1fr 8px ${sidebarWidth}px` }}
      >
        {/* Left Panel: Editor */}
        <div className="editor-panel glass fade-in" style={{ animationDelay: '0.2s' }}>
          {isEditing ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem' }}>{selectedIdea ? 'Edit Idea' : 'New Idea'}</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {selectedIdea && (
                    <button type="button" className="btn btn-danger" onClick={handleDelete} title="Delete Idea">
                      <Trash2 size={16} />
                    </button>
                  )}
                  <button type="button" className="btn" onClick={handleCancel}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Idea</button>
                </div>
              </div>

              {isDirty && (
                <div className="unsaved-banner">
                  ⚠ Unsaved changes
                </div>
              )}

              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="What's the big idea?" 
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Difficulty</label>
                  <select 
                    value={formData.difficulty}
                    onChange={e => setFormData({ ...formData, difficulty: e.target.value as any })}
                  >
                    {DIFFICULTIES.map(diff => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Researching">Researching</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Implemented">Implemented</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  placeholder="Describe your idea in detail..." 
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="tech, health, ai" 
                  value={formData.tags?.join(', ')}
                  onChange={e => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })}
                />
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', gap: '16px' }}>
              <Lightbulb size={64} style={{ opacity: 0.1 }} />
              <p>Select an idea to view details or create a new one</p>
              <button className="btn btn-primary" onClick={handleCreateNew}>Create New Idea</button>
            </div>
          )}
        </div>

        {/* Draggable Splitter */}
        <div
          className="splitter"
          onPointerDown={onSplitterPointerDown}
          onPointerMove={onSplitterPointerMove}
          onPointerUp={onSplitterPointerUp}
        />

        {/* Right Panel: Search/Filter/List */}
        <div className="sidebar fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="search-row">
            <div className="search-container">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                className="search-box" 
                placeholder="Search ideas..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-primary btn-icon" onClick={handleCreateNew} title="Add New Idea">
              <Plus size={20} />
            </button>
          </div>

          <div className="action-row">
            <button 
              className={`btn-text ${isFiltersOpen ? 'active' : ''}`} 
              onClick={() => { setIsFiltersOpen(!isFiltersOpen); setIsSortOpen(false); }}
            >
              <Filter size={16} /> Filters{isFiltered ? ' •' : ''}
            </button>
            <button 
              className={`btn-text ${isSortOpen ? 'active' : ''}`} 
              onClick={() => { setIsSortOpen(!isSortOpen); setIsFiltersOpen(false); }}
            >
              <SortAsc size={16} /> Sort
            </button>
            <button
              className="btn-text btn-text-danger"
              onClick={handleDeleteAll}
              title="Delete all ideas"
              style={{ marginLeft: 'auto' }}
            >
              <Trash2 size={16} /> Delete All
            </button>
          </div>

          {isFiltersOpen && (
            <div className="collapsible-panel glass fade-in">
              <div className="filter-group">
                <label>Status</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
                  <option value="All">All statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Researching">Researching</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Implemented">Implemented</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Category</label>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as any)}>
                  <option value="All">All categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Priority</label>
                <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as any)}>
                  <option value="All">All priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Difficulty</label>
                <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value as any)}>
                  <option value="All">All difficulties</option>
                  {DIFFICULTIES.map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>
              {isFiltered && (
                <button className="btn-text reset-btn" onClick={resetFilters}>
                  ✕ Reset All Filters
                </button>
              )}
            </div>
          )}

          {isSortOpen && (
            <div className="collapsible-panel glass fade-in">
              <div className="sort-options">
                <button 
                  className={`sort-opt ${sortBy === 'newest' ? 'active' : ''}`} 
                  onClick={() => setSortBy('newest')}
                >
                  Newest
                </button>
                <button 
                  className={`sort-opt ${sortBy === 'oldest' ? 'active' : ''}`} 
                  onClick={() => setSortBy('oldest')}
                >
                  Oldest
                </button>
                <button 
                  className={`sort-opt ${sortBy === 'priority' ? 'active' : ''}`} 
                  onClick={() => setSortBy('priority')}
                >
                  Priority
                </button>
                <button 
                  className={`sort-opt ${sortBy === 'difficulty' ? 'active' : ''}`} 
                  onClick={() => setSortBy('difficulty')}
                >
                  Difficulty
                </button>
              </div>
            </div>
          )}

          <div className="idea-list">
            {filteredIdeas.map(idea => {
              const category = idea.category || 'Other';
              const difficulty = idea.difficulty || 'Medium';
              const categoryObj = CATEGORIES.find(c => c.value === category) || CATEGORIES[4];
              const CategoryIcon = categoryObj.icon;
              
              return (
                <div 
                  key={idea.id} 
                  className={`idea-item glass ${selectedIdea?.id === idea.id ? 'active' : ''}`}
                  onClick={() => handleSelectIdea(idea)}
                >
                  <div className="idea-item-header">
                    <span className={`badge badge-${idea.priority.toLowerCase()}`}>{idea.priority}</span>
                    <div className="idea-item-meta">
                      <CategoryIcon size={14} />
                      <span>{idea.status}</span>
                    </div>
                  </div>
                  <h3 className="idea-item-title">{idea.title}</h3>
                  <p className="idea-item-desc">
                    {idea.description}
                  </p>
                  <div className="idea-item-footer">
                    <span className={`difficulty-indicator diff-${difficulty.toLowerCase().replace(' ', '-')}`}>
                      <Gauge size={12} /> {difficulty}
                    </span>
                    <span className="category-badge">
                      <CategoryIcon size={12} /> {categoryObj.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
