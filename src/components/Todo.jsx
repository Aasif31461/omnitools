import React, { useState, useEffect } from 'react';
import { Plus, CheckSquare, Trash2 } from 'lucide-react';

const Todo = () => {
    const [todos, setTodos] = useState(() => {
        const saved = localStorage.getItem('omni-todos-react');
        return saved ? JSON.parse(saved) : [];
    });
    const [input, setInput] = useState('');
    const [priority, setPriority] = useState('medium');

    useEffect(() => { localStorage.setItem('omni-todos-react', JSON.stringify(todos)); }, [todos]);

    const add = () => {
        if (!input.trim()) return;
        setTodos([...todos, { text: input, done: false, priority, id: Date.now() }]);
        setInput('');
    };

    const toggle = (id) => {
        setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const remove = (id) => {
        setTodos(todos.filter(t => t.id !== id));
    };

    const clearCompleted = () => {
        setTodos(todos.filter(t => !t.done));
    };

    const getPriorityColor = (p) => {
        switch (p) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-blue-500';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">To-Do List</h2>

            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl">
                {/* Input Area */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && add()}
                            placeholder="What needs to be done?"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-5 text-white outline-none focus:border-primary-500 transition-colors shadow-inner"
                        />
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 text-sm font-bold text-slate-400 outline-none focus:border-primary-500 cursor-pointer"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>

                        <button
                            onClick={add}
                            className="bg-primary-600 hover:bg-primary-500 text-white px-6 rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20 active:scale-95"
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                </div>

                {/* List */}
                <ul className="space-y-3 mb-6">
                    {todos.map((t) => (
                        <li
                            key={t.id}
                            className={`flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-800/50 group transition-all hover:bg-slate-800 hover:border-slate-700 ${t.done ? 'opacity-50' : ''}`}
                        >
                            <button
                                onClick={() => toggle(t.id)}
                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${t.done ? 'bg-primary-500 border-primary-500' : 'border-slate-600 hover:border-primary-500'}`}
                            >
                                {t.done && <CheckSquare size={14} className="text-white" />}
                            </button>

                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(t.priority)}`}></div>

                            <span className={`flex-1 text-base ${t.done ? 'line-through text-slate-500' : 'text-white'}`}>
                                {t.text}
                            </span>

                            <button
                                onClick={() => remove(t.id)}
                                className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-red-500/10 rounded-lg"
                            >
                                <Trash2 size={18} />
                            </button>
                        </li>
                    ))}

                    {todos.length === 0 && (
                        <li className="text-center py-12 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl">
                            <CheckSquare size={48} className="mb-4 opacity-20" />
                            <p className="text-lg font-medium text-slate-400">All caught up!</p>
                            <p className="text-sm">Add a task to get started.</p>
                        </li>
                    )}
                </ul>

                {/* Footer */}
                {todos.length > 0 && (
                    <div className="pt-6 border-t border-slate-800 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500">
                        <span>{todos.filter(t => !t.done).length} active tasks</span>
                        <button
                            onClick={clearCompleted}
                            className="text-red-400 hover:text-red-300 transition-colors hover:underline"
                        >
                            Clear Completed
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Todo;
