import React, { useState, useEffect } from 'react';
import {
    Plus,
    CheckSquare,
    Trash2,
    Calendar,
    Tag,
    MoreVertical,
    Clock,
    Layout,
    List,
    X,
    ChevronDown,
    ChevronRight,
    AlertCircle
} from 'lucide-react';

const Todo = () => {
    // State
    const [todos, setTodos] = useState(() => {
        const saved = localStorage.getItem('omni-todos-react');
        if (!saved) return [];
        try {
            const parsed = JSON.parse(saved);
            // Migration check: if old format (no status field), convert
            if (parsed.length > 0 && !parsed[0].status) {
                return parsed.map(t => ({
                    id: t.id,
                    title: t.text,
                    description: '',
                    status: t.done ? 'done' : 'todo',
                    priority: t.priority || 'medium',
                    dueDate: null,
                    tags: [],
                    subtasks: [],
                    createdAt: t.id // simplistic assumption
                }));
            }
            return parsed;
        } catch (e) {
            console.error("Failed to parse todos", e);
            return [];
        }
    });

    const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filter, setFilter] = useState({ priority: 'all', search: '' });

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        tags: '',
        status: 'todo'
    });

    useEffect(() => {
        localStorage.setItem('omni-todos-react', JSON.stringify(todos));
    }, [todos]);

    // CRUD Operations
    const saveTask = () => {
        if (!formData.title.trim()) return;

        const newTask = {
            id: editingTask ? editingTask.id : Date.now(),
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            dueDate: formData.dueDate,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            status: formData.status,
            subtasks: editingTask ? editingTask.subtasks : [],
            createdAt: editingTask ? editingTask.createdAt : Date.now()
        };

        if (editingTask) {
            setTodos(todos.map(t => t.id === editingTask.id ? newTask : t));
        } else {
            setTodos([...todos, newTask]);
        }
        closeModal();
    };

    const deleteTask = (id) => {
        setTodos(todos.filter(t => t.id !== id));
    };

    const moveTask = (id, newStatus) => {
        setTodos(todos.map(t => t.id === id ? { ...t, status: newStatus } : t));
    };

    const toggleSubtask = (taskId, subtaskId) => {
        setTodos(todos.map(t => {
            if (t.id !== taskId) return t;
            return {
                ...t,
                subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, done: !st.done } : st)
            };
        }));
    };

    const addSubtask = (taskId, text) => {
        if (!text.trim()) return;
        setTodos(todos.map(t => {
            if (t.id !== taskId) return t;
            return {
                ...t,
                subtasks: [...(t.subtasks || []), { id: Date.now(), text, done: false }]
            };
        }));
    };

    const deleteSubtask = (taskId, subtaskId) => {
        setTodos(todos.map(t => {
            if (t.id !== taskId) return t;
            return {
                ...t,
                subtasks: t.subtasks.filter(st => st.id !== subtaskId)
            };
        }));
    };

    // UI Helpers
    const openModal = (task = null) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                title: task.title,
                description: task.description || '',
                priority: task.priority,
                dueDate: task.dueDate || '',
                tags: task.tags ? task.tags.join(', ') : '',
                status: task.status
            });
        } else {
            setEditingTask(null);
            setFormData({
                title: '',
                description: '',
                priority: 'medium',
                dueDate: '',
                tags: '',
                status: 'todo'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const getPriorityColor = (p) => {
        switch (p) {
            case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'low': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    const filteredTodos = todos.filter(t => {
        const matchesPriority = filter.priority === 'all' || t.priority === filter.priority;
        const matchesSearch = t.title.toLowerCase().includes(filter.search.toLowerCase()) ||
            t.tags.some(tag => tag.toLowerCase().includes(filter.search.toLowerCase()));
        return matchesPriority && matchesSearch;
    });

    // Components
    const TaskCard = ({ task }) => {
        const [newSubtask, setNewSubtask] = useState('');
        const [showSubtasks, setShowSubtasks] = useState(false);

        const completedSubtasks = task.subtasks?.filter(st => st.done).length || 0;
        const totalSubtasks = task.subtasks?.length || 0;
        const progress = totalSubtasks === 0 ? 0 : (completedSubtasks / totalSubtasks) * 100;

        const handleCardClick = (e) => {
            if (e.target.closest('button') || e.target.closest('input')) return;
            openModal(task);
        };

        const priorityColors = {
            high: 'from-red-500 to-pink-600',
            medium: 'from-yellow-400 to-orange-500',
            low: 'from-blue-400 to-cyan-500'
        };

        const priorityBg = {
            high: 'bg-red-500/10 text-red-400 border-red-500/20',
            medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            low: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        };

        return (
            <div
                onClick={handleCardClick}
                className="group relative bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 hover:border-primary-500/30 rounded-2xl p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10 cursor-pointer flex flex-col gap-4 animate-fade-in overflow-hidden hover:-translate-y-1"
            >
                {/* Gradient Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Priority Strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${priorityColors[task.priority] || 'from-slate-500 to-slate-600'}`} />

                <div className="flex justify-between items-start gap-3 pl-2 relative z-10">
                    <div className="flex-1">
                        <h4 className={`text-lg font-semibold text-slate-100 leading-snug tracking-tight ${task.status === 'done' ? 'line-through text-slate-500' : ''}`}>
                            {task.title}
                        </h4>
                        {task.description && (
                            <p className="text-sm text-slate-400 mt-1.5 line-clamp-2 font-medium leading-relaxed">
                                {task.description}
                            </p>
                        )}
                    </div>

                    {/* Status/Priority Badge */}
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${priorityBg[task.priority]}`}>
                        {task.priority}
                    </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-2 items-center pl-2 relative z-10">
                    {task.dueDate && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-lg border border-slate-700/50">
                            <Calendar size={12} className="text-primary-400" />
                            <span>{task.dueDate}</span>
                        </div>
                    )}
                    {task.tags?.map(tag => (
                        <div key={tag} className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-lg border border-slate-700/50">
                            <Tag size={10} className="text-slate-500" />
                            <span>{tag}</span>
                        </div>
                    ))}
                </div>

                {/* Subtasks Progress */}
                {totalSubtasks > 0 && (
                    <div className="pl-2 relative z-10">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                                className={`h-full rounded-full bg-gradient-to-r ${priorityColors[task.priority]} transition-all duration-500`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Subtasks Toggle */}
                <div className="pt-3 border-t border-slate-800/50 pl-2 relative z-10">
                    <button
                        onClick={() => setShowSubtasks(!showSubtasks)}
                        className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-primary-400 transition-colors w-full group/btn"
                    >
                        <div className="bg-slate-800 p-1 rounded-md group-hover/btn:bg-primary-500/10 transition-colors">
                            {showSubtasks ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </div>
                        <span>{completedSubtasks}/{totalSubtasks} Subtasks</span>
                    </button>

                    {showSubtasks && (
                        <div className="mt-3 space-y-2">
                            {task.subtasks?.map(st => (
                                <div key={st.id} className="flex items-center gap-3 group/st bg-slate-800/30 p-2 rounded-lg border border-transparent hover:border-slate-700/50 transition-all">
                                    <button
                                        onClick={() => toggleSubtask(task.id, st.id)}
                                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${st.done ? 'bg-primary-500 border-primary-500 scale-110' : 'border-slate-600 hover:border-primary-500'}`}
                                    >
                                        {st.done && <CheckSquare size={10} className="text-white" />}
                                    </button>
                                    <span className={`text-sm flex-1 font-medium ${st.done ? 'text-slate-600 line-through' : 'text-slate-300'}`}>{st.text}</span>
                                    <button onClick={() => deleteSubtask(task.id, st.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover/st:opacity-100 transition-opacity">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            <div className="flex gap-2 mt-2">
                                <input
                                    type="text"
                                    value={newSubtask}
                                    onChange={(e) => setNewSubtask(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            addSubtask(task.id, newSubtask);
                                            setNewSubtask('');
                                        }
                                    }}
                                    placeholder="Add subtask..."
                                    className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-primary-500 focus:bg-slate-900 transition-all placeholder:text-slate-600"
                                />
                                <button
                                    onClick={() => {
                                        addSubtask(task.id, newSubtask);
                                        setNewSubtask('');
                                    }}
                                    className="bg-slate-800 hover:bg-primary-600 text-white p-2 rounded-lg border border-slate-700/50 hover:border-primary-500 transition-all"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions - Only show on hover */}
                <div className="flex justify-between items-center mt-1 pt-3 border-t border-slate-800/50 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pl-2 relative z-10">
                    <div className="flex gap-1.5">
                        {task.status !== 'todo' && (
                            <button onClick={(e) => { e.stopPropagation(); moveTask(task.id, 'todo'); }} className="text-[10px] font-bold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">TO DO</button>
                        )}
                        {task.status !== 'in-progress' && (
                            <button onClick={(e) => { e.stopPropagation(); moveTask(task.id, 'in-progress'); }} className="text-[10px] font-bold px-2.5 py-1 bg-slate-800 hover:bg-blue-500/20 rounded-lg text-slate-400 hover:text-blue-400 transition-colors">IN PROG</button>
                        )}
                        {task.status !== 'done' && (
                            <button onClick={(e) => { e.stopPropagation(); moveTask(task.id, 'done'); }} className="text-[10px] font-bold px-2.5 py-1 bg-slate-800 hover:bg-green-500/20 rounded-lg text-slate-400 hover:text-green-400 transition-colors">DONE</button>
                        )}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="text-slate-500 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        );
    };
    const Column = ({ title, status, tasks, color }) => (
        <div className="flex-1 min-w-[300px] bg-slate-900/50 backdrop-blur rounded-2xl border border-slate-800 p-4 flex flex-col h-full">
            <div className={`flex items-center justify-between mb-4 pb-3 border-b border-slate-800 ${color}`}>
                <h3 className="font-bold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                    {title}
                </h3>
                <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-full font-mono">{tasks.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                {tasks.map(task => <TaskCard key={task.id} task={task} />)}
                {tasks.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-600 text-sm">
                        No tasks
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col p-4 md:p-8 max-w-[1600px] mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-1">Task Board</h2>
                    <p className="text-slate-400 text-sm">Manage your projects and tasks efficiently</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={filter.search}
                            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                            className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-primary-500 w-64"
                        />
                        <List size={16} className="absolute left-3.5 top-3 text-slate-500" />
                    </div>

                    <select
                        value={filter.priority}
                        onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-primary-500 cursor-pointer"
                    >
                        <option value="all">All Priorities</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                    </select>

                    <button
                        onClick={() => openModal()}
                        className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary-600/20 active:scale-95 transition-all"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">New Task</span>
                    </button>
                </div>
            </div>

            {/* Board */}
            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-6 h-full min-h-[500px]">
                    <Column
                        title="To Do"
                        status="todo"
                        tasks={filteredTodos.filter(t => t.status === 'todo')}
                        color="text-slate-400"
                    />
                    <Column
                        title="In Progress"
                        status="in-progress"
                        tasks={filteredTodos.filter(t => t.status === 'in-progress')}
                        color="text-blue-400"
                    />
                    <Column
                        title="Done"
                        status="done"
                        tasks={filteredTodos.filter(t => t.status === 'done')}
                        color="text-green-400"
                    />
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
                        <button onClick={closeModal} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold text-white mb-6">{editingTask ? 'Edit Task' : 'New Task'}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-primary-500"
                                    placeholder="Task title"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-primary-500 h-24 resize-none"
                                    placeholder="Add details..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 outline-none focus:border-primary-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Due Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 outline-none focus:border-primary-500 [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-primary-500"
                                    placeholder="Design, Dev, Urgent"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={closeModal} className="px-4 py-2 text-slate-400 hover:text-white font-medium">Cancel</button>
                            <button
                                onClick={saveTask}
                                className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-primary-600/20 active:scale-95 transition-all"
                            >
                                {editingTask ? 'Save Changes' : 'Create Task'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Todo;
