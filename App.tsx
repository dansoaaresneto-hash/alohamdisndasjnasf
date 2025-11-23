import React, { useState, useMemo, useEffect } from 'react';
import { Task, TaskStatus, Category, AITaskSuggestion, Project } from './types';
import TimelineItem from './components/TimelineItem';
import SmartAddModal from './components/SmartAddModal';
import TaskDetailModal from './components/TaskDetailModal';
import FocusModal from './components/FocusModal';
import ProjectEditor from './components/ProjectEditor';
import { 
  Plus, 
  Calendar, 
  Settings, 
  Sparkles, 
  Search, 
  Menu, 
  LayoutDashboard, 
  CheckSquare, 
  Clock,
  Bell,
  FileText,
  Moon,
  Sun
} from 'lucide-react';
import { format, isToday, isYesterday, isTomorrow } from 'date-fns';

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    readableId: 1,
    title: 'Morning 5K Run',
    time: '8:00 am',
    category: Category.Health,
    status: TaskStatus.Completed,
    description: 'Went for a quick 5K in the park.',
    date: new Date()
  },
  {
    id: '2',
    readableId: 2,
    title: 'Review market research',
    time: '10:00 am',
    category: Category.Work,
    status: TaskStatus.Completed,
    description: 'Go through the report and suggest changes.',
    subtasks: [
      { id: 'st1', title: 'Read executive summary', isCompleted: true },
      { id: 'st2', title: 'Check competitor analysis', isCompleted: true },
      { id: 'st3', title: 'Draft email to team', isCompleted: true }
    ],
    date: new Date()
  },
  {
    id: '3',
    readableId: 3,
    title: 'Meeting with Alexa',
    time: '1:00 pm',
    category: Category.Work,
    status: TaskStatus.Completed,
    date: new Date()
  },
  {
    id: '4',
    readableId: 4,
    title: 'Create weekly stats report',
    time: '3:00 pm',
    category: Category.Work,
    status: TaskStatus.Pending,
    subtasks: [
        { id: 'st4', title: 'Collect data from Analytics', isCompleted: true },
        { id: 'st5', title: 'Create charts', isCompleted: false },
        { id: 'st6', title: 'Write summary', isCompleted: false }
    ],
    date: new Date()
  },
  {
    id: '5',
    readableId: 5,
    title: 'Yoga classes at 6:00 pm',
    time: '6:00 pm',
    category: Category.Health,
    status: TaskStatus.Pending,
    description: 'Weekly reminder for yoga classes every Wednesday.',
    date: new Date()
  },
  {
    id: '6',
    readableId: 6,
    title: 'Get groceries',
    time: '10:00 am',
    category: Category.Shopping,
    status: TaskStatus.Pending,
    subtasks: [
        { id: 'st7', title: 'Buy milk', isCompleted: false },
        { id: 'st8', title: 'Buy eggs', isCompleted: false }
    ],
    date: new Date(new Date().setDate(new Date().getDate() - 1)) // Yesterday
  }
];

const INITIAL_PROJECTS: Project[] = [
    {
        id: 'p1',
        title: 'Q4 Marketing Campaign',
        icon: '🚀',
        updatedAt: new Date(),
        blocks: [
            { id: 'b1', type: 'h1', content: 'Campaign Strategy' },
            { id: 'b2', type: 'text', content: 'We need to focus on social media engagement this quarter. Use /newtask to add action items.' },
            { id: 'b3', type: 'task', content: '', taskId: '2' },
            { id: 'b4', type: 'h2', content: 'Ideas' },
            { id: 'b5', type: 'text', content: '- Influencer partnerships\n- Paid ads on LinkedIn' },
        ]
    }
];

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  
  const [isSmartAddOpen, setIsSmartAddOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Tabs: 'dashboard', 'today', 'calendar', or 'project-{id}'
  const [activeTab, setActiveTab] = useState('today');
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [focusedTask, setFocusedTask] = useState<Task | null>(null);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Add tasks from AI
  const handleAIAddTasks = (suggestions: AITaskSuggestion[]) => {
    const nextId = Math.max(...tasks.map(t => t.readableId), 0) + 1;
    const newTasks: Task[] = suggestions.map((s, idx) => ({
      id: Date.now().toString() + idx,
      readableId: nextId + idx,
      title: s.title,
      description: s.description,
      time: s.time,
      category: s.category as Category || Category.Other,
      status: TaskStatus.Pending,
      date: new Date() // Add to today
    }));
    setTasks(prev => [...prev, ...newTasks]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id 
        ? { ...t, status: t.status === TaskStatus.Completed ? TaskStatus.Pending : TaskStatus.Completed }
        : t
    ));
  };

  const handleStatusChange = (id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status } : t
    ));
  };

  const handleSubtaskToggle = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      if (!t.subtasks) return t;
      
      const newSubtasks = t.subtasks.map(st => 
        st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
      );
      
      return { ...t, subtasks: newSubtasks };
    }));
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleFocusTask = (task: Task) => {
    setFocusedTask(task);
  };

  const handleCompleteFocus = (taskId: string, status: TaskStatus) => {
    handleStatusChange(taskId, status);
    setFocusedTask(null);
  };

  const handleSaveTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setEditingTask(null);
  };

  const handleManualAdd = () => {
    const nextId = Math.max(...tasks.map(t => t.readableId), 0) + 1;
    const newTask: Task = {
        id: Date.now().toString(),
        readableId: nextId,
        title: "New Task",
        time: format(new Date(), 'h:mm a'),
        category: Category.Personal,
        status: TaskStatus.Pending,
        date: new Date()
    };
    // Automatically open edit modal for new task
    setTasks(prev => [...prev, newTask]);
    setEditingTask(newTask);
    return newTask;
  }

  const handleCreateProject = () => {
      const newProject: Project = {
          id: Date.now().toString(),
          title: 'New Project',
          icon: '📝',
          blocks: [{ id: Date.now().toString(), type: 'text', content: '' }],
          updatedAt: new Date()
      };
      setProjects([...projects, newProject]);
      setActiveTab(`project-${newProject.id}`);
  };

  const handleUpdateProject = (updatedProject: Project) => {
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  // Group tasks by date string
  const groupedTasks = useMemo<{ [key: string]: Task[] }>(() => {
    const groups: { [key: string]: Task[] } = {};
    
    const sortedTasks = [...tasks].sort((a, b) => {
        const dateComp = b.date.getTime() - a.date.getTime(); 
        if (dateComp !== 0) return dateComp;
        return a.time.localeCompare(b.time); 
    });

    sortedTasks.forEach(task => {
      let dateKey = format(task.date, 'yyyy-MM-dd');
      if (isToday(task.date)) dateKey = 'Today';
      else if (isYesterday(task.date)) dateKey = 'Yesterday';
      else if (isTomorrow(task.date)) dateKey = 'Tomorrow';
      else dateKey = format(task.date, 'MMMM d');

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(task);
    });

    return groups;
  }, [tasks]);

  const todayTasksCount = tasks.filter(t => isToday(t.date) && t.status === TaskStatus.Pending).length;

  const renderSidebarContent = () => (
    <>
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
          <CheckSquare className="text-white" size={20} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">TaskFlow</h1>
      </div>

      <nav className="flex-1 px-6 space-y-1 overflow-y-auto">
        <div className="mb-6">
            <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'dashboard' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
            <LayoutDashboard size={20} />
            Dashboard
            </button>
            <button 
            onClick={() => setActiveTab('today')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'today' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
            <Clock size={20} />
            My Day
            </button>
            <button 
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'calendar' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
            <Calendar size={20} />
            Calendar
            </button>
        </div>

        <div className="mb-6">
            <div className="flex items-center justify-between px-4 mb-2">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Projects</h3>
                <button onClick={handleCreateProject} className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 p-1 rounded transition-colors">
                    <Plus size={16} />
                </button>
            </div>
            {projects.map(project => (
                <button
                    key={project.id}
                    onClick={() => setActiveTab(`project-${project.id}`)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all text-sm ${activeTab === `project-${project.id}` ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                    <span className="text-lg">{project.icon}</span>
                    {project.title}
                </button>
            ))}
        </div>

        <div>
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 px-4">Categories</h3>
            <div className="space-y-1">
            {Object.values(Category).map(cat => (
                <div key={cat} className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                <span className={`w-2.5 h-2.5 rounded-full ${
                    cat === Category.Work ? 'bg-indigo-400' :
                    cat === Category.Health ? 'bg-emerald-400' :
                    cat === Category.Shopping ? 'bg-orange-400' :
                    cat === Category.Personal ? 'bg-pink-400' : 'bg-gray-400'
                }`} />
                {cat}
                </div>
            ))}
            </div>
        </div>
      </nav>

      <div className="p-6 border-t border-gray-100 dark:border-gray-800 mt-auto">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
            JD
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">John Doe</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Free Plan</p>
          </div>
          <Settings size={18} className="ml-auto text-gray-400 dark:text-gray-500" />
        </div>
      </div>
    </>
  );

  const activeProject = activeTab.startsWith('project-') 
    ? projects.find(p => p.id === activeTab.replace('project-', '')) 
    : null;

  return (
    <div className="flex h-screen w-full bg-[#F0F4F8] dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans overflow-hidden transition-colors duration-300">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-72 flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 shadow-sm z-20 h-full transition-colors duration-300">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-3/4 bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-slide-in h-full">
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative w-full">
        
        {/* Header */}
        <header className="h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between px-6 md:px-10 z-10 sticky top-0 shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="md:hidden flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl">
               <CheckSquare size={24} /> TaskFlow
            </div>
            <div className="hidden md:block">
               <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                 {activeProject ? (
                    <>
                        <span className="text-2xl">{activeProject.icon}</span>
                        {activeProject.title}
                    </>
                 ) : (
                    activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'calendar' ? 'Calendar' : 'My Day'
                 )}
               </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-64 transition-all dark:text-gray-200"
              />
            </div>
            
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full h-full">
            
            {activeProject ? (
                <ProjectEditor 
                    project={activeProject} 
                    onUpdate={handleUpdateProject}
                    tasks={tasks}
                    onTaskCreate={handleManualAdd}
                    onTaskUpdate={handleStatusChange}
                    onTaskEdit={handleEditTask}
                    onSubtaskToggle={handleSubtaskToggle}
                    onFocus={handleFocusTask}
                />
            ) : (
                <>
                    {/* Header Info for Timeline */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">
                        {format(new Date(), 'MMMM d')}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg flex items-center gap-2">
                        {format(new Date(), 'EEEE')}
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span className="text-blue-600 dark:text-blue-400">{todayTasksCount} tasks pending</span>
                        </p>
                    </div>
                    
                    {/* Quick Date Nav (Visual only for demo) */}
                    <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-700">
                        {['-2', '-1', 'Today', '+1', '+2'].map((d, i) => (
                        <div key={i} className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${d === 'Today' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                            {d === 'Today' ? format(new Date(), 'd') : parseInt(format(new Date(), 'd')) + (i-2)}
                        </div>
                        ))}
                    </div>
                    </div>

                    {/* Tasks Timeline */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-10 transition-colors duration-300">
                    {/* Today Section */}
                        <div className="mb-8">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                            Today
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {(groupedTasks['Today'] as Task[])?.length || 0}
                            </span>
                        </h2>

                        <div className="relative">
                            {(groupedTasks['Today'] || []).map((task, idx, arr) => (
                            <TimelineItem 
                                key={task.id} 
                                task={task} 
                                isLast={idx === arr.length - 1} 
                                onToggle={handleToggleTask}
                                onEdit={handleEditTask}
                                onSubtaskToggle={handleSubtaskToggle}
                                onStatusChange={handleStatusChange}
                                onFocus={handleFocusTask}
                            />
                            ))}

                            {/* Add Task Inline */}
                            <div 
                            onClick={() => handleManualAdd()}
                            className="relative flex gap-4 mt-2 group cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                            >
                            <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-800 group-hover:border-blue-500 transition-colors">
                                <Plus size={14} className="text-gray-400 group-hover:text-blue-500" />
                            </div>
                            <div className="pt-0.5 text-gray-400 dark:text-gray-500 font-medium group-hover:text-blue-500 transition-colors">
                                Add task for today
                            </div>
                            </div>
                        </div>
                        </div>

                        {/* Previous/Future Days */}
                        {(Object.entries(groupedTasks) as [string, Task[]][]).map(([key, groupTasks]) => {
                        if (key === 'Today') return null;
                        return (
                            <div key={key} className="mb-8 pt-8 border-t border-gray-50 dark:border-gray-800">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6">{key}</h2>
                            <div>
                                {groupTasks.map((task, idx, arr) => (
                                <TimelineItem 
                                    key={task.id} 
                                    task={task} 
                                    isLast={idx === arr.length - 1} 
                                    onToggle={handleToggleTask}
                                    onEdit={handleEditTask}
                                    onSubtaskToggle={handleSubtaskToggle}
                                    onStatusChange={handleStatusChange}
                                    onFocus={handleFocusTask}
                                />
                                ))}
                            </div>
                            </div>
                        );
                        })}
                        
                        {Object.keys(groupedTasks).length === 0 && (
                        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                            <p>No tasks found. Start by adding one!</p>
                        </div>
                        )}
                    </div>
                </>
            )}
          </div>
        </div>

        {/* Floating Action Buttons (Only show when not in Project mode or allow global add) */}
        {!activeProject && (
            <div className="absolute bottom-8 right-8 flex flex-col gap-4 items-end z-30 pointer-events-none">
            {/* Magic AI Button */}
            <button 
                onClick={() => setIsSmartAddOpen(true)}
                className="pointer-events-auto w-14 h-14 bg-white dark:bg-gray-800 rounded-full shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:scale-110 transition-transform border border-indigo-50 dark:border-indigo-900 group relative"
            >
                <Sparkles size={24} />
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Smart Plan
                </span>
            </button>

            {/* Main Add Button */}
            <button 
                onClick={() => handleManualAdd()}
                className="pointer-events-auto w-16 h-16 bg-blue-600 rounded-full shadow-xl shadow-blue-300 dark:shadow-blue-900/40 flex items-center justify-center text-white hover:bg-blue-700 active:scale-95 transition-all group relative"
            >
                <Plus size={32} />
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                New Task
                </span>
            </button>
            </div>
        )}

        <SmartAddModal 
          isOpen={isSmartAddOpen} 
          onClose={() => setIsSmartAddOpen(false)} 
          onAddTasks={handleAIAddTasks}
        />

        <TaskDetailModal
          isOpen={!!editingTask}
          task={editingTask}
          onClose={() => {
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />

        <FocusModal 
          isOpen={!!focusedTask}
          task={focusedTask}
          onClose={() => setFocusedTask(null)}
          onCompleteSession={handleCompleteFocus}
        />

      </main>
    </div>
  );
};

export default App;