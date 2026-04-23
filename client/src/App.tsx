import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Plus, Search, Lightbulb, TrendingUp, Clock, Archive, Filter, 
  SortAsc, Globe, Smartphone, Monitor, Download, Upload, Printer,
  Gamepad2, Box, Gauge, Trash2, LayoutGrid, List, ChevronLeft, ChevronRight,
  BarChart2, PieChart as PieChartIcon, LogOut, Bot, Cpu, Wallet, Smile, Palette,
  ShoppingBag, Cloud, Briefcase, Zap, Heart
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Idea, IdeaStats, IdeaStatus, IdeaPriority, IdeaCategory, IdeaDifficulty } from '../../shared/types';
import { supabase } from './supabase';
import { Auth } from './Auth';
import { Session } from '@supabase/supabase-js';
import { Database } from './types/supabase'; // We'll generate this later or just use any for now

const CATEGORY_LIST: { value: IdeaCategory; icon: any; label: string }[] = [
  { value: 'AI', icon: Bot, label: 'AI' },
  { value: 'Desktop', icon: Monitor, label: 'Desktop' },
  { value: 'Digital Product', icon: Cpu, label: 'Digital Product' },
  { value: 'Economy', icon: Wallet, label: 'Economy' },
  { value: 'Fun', icon: Smile, label: 'Fun' },
  { value: 'Game', icon: Gamepad2, label: 'Game' },
  { value: 'Hobbies', icon: Palette, label: 'Hobbies' },
  { value: 'Mobile', icon: Smartphone, label: 'Mobile' },
  { value: 'Physical Product', icon: ShoppingBag, label: 'Physical Product' },
  { value: 'SaaS', icon: Cloud, label: 'SaaS' },
  { value: 'Services', icon: Briefcase, label: 'Services' },
  { value: 'Useful', icon: Zap, label: 'Useful' },
  { value: 'Web', icon: Globe, label: 'Web' },
  { value: 'Other', icon: Box, label: 'Other' }
];

const CATEGORIES = [...CATEGORY_LIST].sort((a, b) => a.label.localeCompare(b.label));

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
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  
  const [showStats, setShowStats] = useState(true);
  const [showCharts, setShowCharts] = useState(true);
  
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [printMode, setPrintMode] = useState<'idea' | 'list' | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getCategoryData = () => {
    const counts: Record<string, number> = {};
    ideas.forEach(i => { const cat = i.category || 'Other'; counts[cat] = (counts[cat] || 0) + 1; });
    return Object.keys(counts).map(k => ({ name: k, value: counts[k] }));
  };
  const getDifficultyData = () => {
    const counts: Record<string, number> = {};
    ideas.forEach(i => { const d = i.difficulty || 'Medium'; counts[d] = (counts[d] || 0) + 1; });
    return Object.keys(counts).map(k => ({ name: k, value: counts[k] }));
  };
  const getStatusData = () => {
    const counts: Record<string, number> = {};
    ideas.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1; });
    return Object.keys(counts).map(k => ({ name: k, value: counts[k] }));
  };
  const getPriorityData = () => {
    const counts: Record<string, number> = {};
    ideas.forEach(i => { counts[i.priority] = (counts[i.priority] || 0) + 1; });
    return Object.keys(counts).map(k => ({ name: k, value: counts[k] }));
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#3b82f6'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
        style={{ pointerEvents: 'none' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const renderDonut = (data: any[]) => (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
          labelLine={false}
          label={renderCustomizedLabel}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <RechartsTooltip 
          contentStyle={{ backgroundColor: 'var(--panel-bg)', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          itemStyle={{ color: 'var(--text-primary)' }}
        />
        <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
      </PieChart>
    </ResponsiveContainer>
  );

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(ideas, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ideas-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        const importedArray = Array.isArray(imported) ? imported : [imported];
        
        if (!session?.user) return;

        const ideasToInsert = importedArray.map((i: any) => {
          // Remove potential conflicting IDs and map timestamps
          const { id, createdAt, updatedAt, created_at, updated_at, ...rest } = i;
          return {
            ...rest,
            user_id: session.user.id,
            created_at: created_at || createdAt || new Date().toISOString(),
            updated_at: updated_at || updatedAt || new Date().toISOString()
          };
        });

        const { error } = await supabase
          .from('ideas')
          .insert(ideasToInsert);

        if (!error) {
          fetchIdeas();
          alert('Ideas imported successfully!');
        } else {
          console.error('Import error:', error);
          alert('Failed to import ideas.');
        }
      } catch (err) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePrintIdea = () => {
    setPrintMode('idea');
    setTimeout(() => { 
      window.print(); 
      setPrintMode(null); 
    }, 50);
  };

  const handlePrintList = () => {
    setPrintMode('list');
    setTimeout(() => { 
      window.print(); 
      setPrintMode(null); 
    }, 50);
  };

  const fetchIdeas = async () => {
    if (!session?.user) return;
    const { data, error } = await supabase
      .from('ideas')
      .select('*');
    
    if (error) {
      console.error('Error fetching ideas:', error);
      return;
    }

    const mapped = (data || []).map((i: any) => ({
      ...i,
      createdAt: i.created_at,
      updatedAt: i.updated_at
    }));

    setIdeas(mapped as any);
  };

  const fetchStats = useCallback(() => {
    if (!ideas.length) {
      setStats({
        total: 0,
        byStatus: { Draft: 0, Researching: 0, 'In Progress': 0, Implemented: 0, Archived: 0 },
        byPriority: { Low: 0, Medium: 0, High: 0 }
      });
      return;
    }
    
    const statusCounts: any = { Draft: 0, Researching: 0, 'In Progress': 0, Implemented: 0, Archived: 0 };
    const priorityCounts: any = { Low: 0, Medium: 0, High: 0 };
    
    ideas.forEach(idea => {
      statusCounts[idea.status] = (statusCounts[idea.status] || 0) + 1;
      priorityCounts[idea.priority] = (priorityCounts[idea.priority] || 0) + 1;
    });

    setStats({
      total: ideas.length,
      byStatus: statusCounts,
      byPriority: priorityCounts
    });
  }, [ideas]);

  useEffect(() => {
    if (session) {
      fetchIdeas();
    } else {
      setIdeas([]);
    }
  }, [session]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterCategory, filterDifficulty, filterPriority, sortBy]);

  const totalPages = Math.ceil(filteredIdeas.length / ITEMS_PER_PAGE) || 1;
  const paginatedIdeas = filteredIdeas.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
    if (!session?.user) return;

    const ideaData: any = {
      ...formData,
      user_id: session.user.id,
      updated_at: new Date().toISOString()
    };
    
    // Convert camelCase to snake_case for DB
    if (ideaData.createdAt) ideaData.created_at = ideaData.createdAt;
    if (ideaData.updatedAt) ideaData.updated_at = ideaData.updatedAt;
    
    delete ideaData.createdAt;
    delete ideaData.updatedAt;
    
    if (!selectedIdea) {
      delete ideaData.id;
    }

    const { error } = await supabase
      .from('ideas')
      .upsert(ideaData);

    if (!error) {
      fetchIdeas();
      setIsDirty(false);
      setIsEditing(false);
      setSelectedIdea(null);
    } else {
      console.error('Error saving idea:', error);
      alert('Failed to save idea');
    }
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Discard them?')) return;
    setIsDirty(false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!selectedIdea || !session?.user) return;
    if (!window.confirm(`Delete "${selectedIdea.title}"? This cannot be undone.`)) return;
    
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', selectedIdea.id)
      .eq('user_id', session.user.id);

    if (!error) {
      fetchIdeas();
      setIsDirty(false);
      setIsEditing(false);
      setSelectedIdea(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!session?.user || ideas.length === 0) return;
    if (!window.confirm(`Delete ALL ${ideas.length} ideas? This cannot be undone.`)) return;
    
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('user_id', session.user.id);
      
    if (!error) {
      fetchIdeas();
      setIsDirty(false);
      setIsEditing(false);
      setSelectedIdea(null);
    }
  };

  const handleLogOut = async () => {
    await supabase.auth.signOut();
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

  if (!session) {
    return <Auth />;
  }

  return (
    <div className={`app-container ${printMode ? `print-${printMode}` : ''}`}>
      <div className="dashboard-top-section fade-in">
        <div className="dashboard-rows-container">
          {showStats && (
            <div className="dashboard-header">
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
          )}

          {showCharts && (
            <div className="dashboard-charts">
              <div className="chart-card glass">
                <h4 className="chart-title">Category</h4>
                {renderDonut(getCategoryData())}
              </div>
              <div className="chart-card glass">
                <h4 className="chart-title">Difficulty</h4>
                {renderDonut(getDifficultyData())}
              </div>
              <div className="chart-card glass">
                <h4 className="chart-title">Status</h4>
                {renderDonut(getStatusData())}
              </div>
              <div className="chart-card glass">
                <h4 className="chart-title">Priority</h4>
                {renderDonut(getPriorityData())}
              </div>
            </div>
          )}
        </div>
      </div>

      <main
        className="main-content"
        ref={mainContentRef}
        style={{ gridTemplateColumns: `1fr 8px ${sidebarWidth}px` }}
      >
        {/* Left Panel: Editor */}
        <div className="editor-panel glass fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="editor-scroll-container">
            {isEditing ? (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1.5rem' }}>{selectedIdea ? 'Edit Idea' : 'New Idea'}</h2>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {selectedIdea && (
                      <>
                        <button type="button" className="btn" onClick={handlePrintIdea} title="Print Idea">
                          <Printer size={16} />
                        </button>
                        <button type="button" className="btn btn-danger" onClick={handleDelete} title="Delete Idea">
                          <Trash2 size={16} />
                        </button>
                      </>
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

          <div className={`fab-container glass ${isFabOpen ? 'open' : ''}`}>
            <button className="fab-trigger" onClick={() => setIsFabOpen(!isFabOpen)} title="Toggle Controls">
              <LayoutGrid size={24} className={isFabOpen ? 'rotated' : ''} />
            </button>
            <div className="fab-menu">
              <button className={`toggle-panel-btn ${showStats ? 'active' : ''}`} onClick={() => setShowStats(!showStats)} title="Toggle Stats">
                <BarChart2 size={24} />
                <span>Stats</span>
              </button>
              <button className={`toggle-panel-btn ${showCharts ? 'active' : ''}`} onClick={() => setShowCharts(!showCharts)} title="Toggle Charts">
                <PieChartIcon size={24} />
                <span>Charts</span>
              </button>
              <button className="toggle-panel-btn" onClick={handleLogOut} title="Sign Out">
                <LogOut size={24} />
                <span>Logout</span>
              </button>
            </div>
          </div>
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
          </div>

          <div className="action-row">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" style={{ display: 'none' }} />
            
            <div className="view-toggles">
              <button 
                className={`btn-icon ${viewMode === 'card' ? 'active' : ''}`}
                onClick={() => setViewMode('card')}
                title="Card View"
              >
                <LayoutGrid size={16} />
              </button>
              <button 
                className={`btn-icon ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <List size={16} />
              </button>
            </div>

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
            
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              <button className="btn-text" onClick={handleExport} title="Export Ideas">
                <Download size={16} />
              </button>
              <button className="btn-text" onClick={handleImportClick} title="Import Ideas">
                <Upload size={16} />
              </button>
              <button className="btn-text" onClick={handlePrintList} title="Print List">
                <Printer size={16} />
              </button>
              <button
                className="btn-text btn-text-danger"
                onClick={handleDeleteAll}
                title="Delete all ideas"
              >
                <Trash2 size={16} />
              </button>
            </div>
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
            {viewMode === 'table' && filteredIdeas.length > 0 && (
              <div className="idea-table-container">
                <table className="idea-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Difficulty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedIdeas.map(idea => {
                      const category = idea.category || 'Other';
                      const difficulty = idea.difficulty || 'Medium';
                      const categoryObj = CATEGORIES.find(c => c.value === category) || CATEGORIES[4];
                      const CategoryIcon = categoryObj.icon;
                      
                      return (
                        <tr 
                          key={idea.id}
                          className={selectedIdea?.id === idea.id ? 'active' : ''}
                          onClick={() => handleSelectIdea(idea)}
                        >
                          <td>
                            <div className="table-title">{idea.title}</div>
                            <div className="table-desc">{idea.description}</div>
                          </td>
                          <td>
                            <span className="category-badge" title="Category">
                              <CategoryIcon size={12} /> {categoryObj.label}
                            </span>
                          </td>
                          <td>
                            <div className="idea-item-meta" title="Status" style={{ justifyContent: 'flex-start' }}>
                              <CategoryIcon size={14} />
                              <span>{idea.status}</span>
                            </div>
                          </td>
                          <td><span className={`badge badge-${idea.priority.toLowerCase()}`} title="Priority">{idea.priority}</span></td>
                          <td>
                            <span className={`difficulty-indicator diff-${difficulty.toLowerCase().replace(' ', '-')}`} title="Difficulty">
                              <Gauge size={12} /> {difficulty}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {viewMode === 'card' && paginatedIdeas.map(idea => {
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
                    <span className={`badge badge-${idea.priority.toLowerCase()}`} title="Priority">{idea.priority}</span>
                    <div className="idea-item-meta" title="Status">
                      <CategoryIcon size={14} />
                      <span>{idea.status}</span>
                    </div>
                  </div>
                  <h3 className="idea-item-title">{idea.title}</h3>
                  <p className="idea-item-desc">
                    {idea.description}
                  </p>
                  <div className="idea-item-footer">
                    <span className={`difficulty-indicator diff-${difficulty.toLowerCase().replace(' ', '-')}`} title="Difficulty">
                      <Gauge size={12} /> {difficulty}
                    </span>
                    <span className="category-badge" title="Category">
                      <CategoryIcon size={12} /> {categoryObj.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pagination-wrapper" style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            {totalPages > 1 && (
              <div className="pagination-controls" style={{ marginTop: 0, borderTop: 'none', padding: 0 }}>
                <button 
                  className="btn-icon" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="page-indicator">Page {currentPage} of {totalPages}</span>
                <button 
                  className="btn-icon" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
            <div className="item-count" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {filteredIdeas.length === 0 
                ? 'No ideas found' 
                : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, filteredIdeas.length)} of ${filteredIdeas.length} ideas`}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
