import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import ToolCard from './ToolCard';
import { menuItems } from '../data/menuItems';

const Dashboard = ({ changeTool }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTools = menuItems.filter(item => {
        if (item.id === 'dashboard') return false;
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            item.label.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term) ||
            item.keywords.toLowerCase().includes(term)
        );
    });

    return (
        <div className="animate-fade-in p-6 md:p-10 max-w-7xl mx-auto">
            <div className="mb-10 relative">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                    Omni<span className="text-primary-500">Tools</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl">
                    A collection of powerful utilities for developers, designers, and everyone in between.
                    Fast, private, and always available.
                </p>

                {/* Search Bar */}
                <div className="mt-8 relative max-w-xl group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <Search className="text-slate-500 group-focus-within:text-primary-500 transition-colors" size={20} />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search tools (e.g., 'base64', 'bmi', 'tax')..."
                        className="w-full bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-slate-500 outline-none focus:border-primary-500/50 focus:bg-slate-900 transition-all shadow-lg"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {filteredTools.length === 0 ? (
                <div className="text-center py-20">
                    <div className="bg-slate-900/50 inline-flex p-6 rounded-full mb-4 text-slate-600">
                        <Search size={48} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No tools found</h3>
                    <p className="text-slate-500">Try searching for something else like "calc" or "color"</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
                    {filteredTools.map(tool => (
                        <ToolCard
                            key={tool.id}
                            title={tool.label}
                            desc={tool.description}
                            icon={tool.icon}
                            onClick={() => changeTool(tool.id)}
                            colorClass={tool.colorClass}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
