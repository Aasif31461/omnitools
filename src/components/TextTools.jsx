import React, { useState, useMemo } from 'react';
import { Type, GitCompare, Sparkles, Trash2, Copy, AlignLeft, Binary, CheckCircle } from 'lucide-react';

const TextTools = ({ showToast }) => {
    const [activeTab, setActiveTab] = useState('editor');
    const [text, setText] = useState('');
    const [text2, setText2] = useState('');

    const stats = useMemo(() => {
        const trimmed = text.trim();
        const words = trimmed ? trimmed.split(/\s+/).length : 0;
        const chars = text.length;
        const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
        const noSpace = text.replace(/\s/g, '').length;
        const sentences = text.split(/[.!?]+/).filter(Boolean).length;
        const readTime = Math.ceil(words / 200); // ~200 wpm

        return { words, chars, lines, noSpace, sentences, readTime };
    }, [text]);

    const handleTransform = (type) => {
        let newText = text;
        switch (type) {
            case 'upper': newText = text.toUpperCase(); break;
            case 'lower': newText = text.toLowerCase(); break;
            case 'title': newText = text.toLowerCase().replace(/(?:^|\s)\w/g, match => match.toUpperCase()); break;
            case 'sentence': newText = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()); break;
            case 'dedup': newText = [...new Set(text.split('\n'))].join('\n'); break;
            case 'trim': newText = text.replace(/\s+/g, ' ').trim(); break;
            case 'unique-words': newText = [...new Set(text.trim().split(/\s+/))].join(' '); break;
            default: break;
        }
        setText(newText);
    };

    const generateText = (type, count = 1, unit = 'paragraphs') => {
        if (type === 'lorem') {
            const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

            if (unit === 'paragraphs') {
                setText(Array(count).fill(lorem).join('\n\n'));
            } else if (unit === 'sentences') {
                const sentences = lorem.split('. ');
                let res = [];
                for (let i = 0; i < count; i++) res.push(sentences[i % sentences.length]);
                setText(res.join('. ') + '.');
            } else if (unit === 'words') {
                const words = lorem.split(' ');
                let res = [];
                for (let i = 0; i < count; i++) res.push(words[i % words.length]);
                setText(res.join(' '));
            }
        } else if (type === 'random') {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let res = '';
            for (let i = 0; i < count * 100; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
            setText(res);
        }
    };

    const copy = (txt) => {
        navigator.clipboard.writeText(txt);
        showToast('Copied!');
    };

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">Text Studio</h2>

            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-[2rem] overflow-hidden flex flex-col h-[700px] shadow-2xl">
                {/* Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 gap-2">
                    {[
                        { id: 'editor', label: 'Editor & Stats', icon: Type },
                        { id: 'diff', label: 'Diff Checker', icon: GitCompare },
                        { id: 'generate', label: 'Generators', icon: Sparkles }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        >
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 p-6 overflow-hidden flex flex-col bg-slate-900/30">
                    {activeTab === 'editor' && (
                        <div className="flex-1 flex flex-col gap-6 h-full">
                            {/* Toolbar */}
                            <div className="flex flex-wrap gap-3 p-2 bg-slate-950 rounded-2xl border border-slate-800">
                                <div className="flex gap-1 bg-slate-900 rounded-xl p-1">
                                    <button onClick={() => handleTransform('upper')} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">UPPER</button>
                                    <button onClick={() => handleTransform('lower')} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">lower</button>
                                    <button onClick={() => handleTransform('title')} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Title Case</button>
                                    <button onClick={() => handleTransform('sentence')} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Sentence case</button>
                                </div>

                                <div className="w-px bg-slate-800 my-1"></div>

                                <div className="flex gap-1 bg-slate-900 rounded-xl p-1">
                                    <button onClick={() => handleTransform('trim')} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Trim</button>
                                    <button onClick={() => handleTransform('dedup')} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Unique Lines</button>
                                    <button onClick={() => handleTransform('unique-words')} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Unique Words</button>
                                </div>

                                <div className="ml-auto flex gap-2">
                                    <button onClick={() => setText('')} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Clear"><Trash2 size={18} /></button>
                                    <button onClick={() => copy(text)} className="p-2 text-primary-400 hover:text-white hover:bg-primary-500 rounded-lg transition-colors" title="Copy"><Copy size={18} /></button>
                                </div>
                            </div>

                            {/* Editor */}
                            <textarea
                                value={text}
                                onChange={e => setText(e.target.value)}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-slate-300 font-mono text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none leading-relaxed custom-scrollbar"
                                placeholder="Type or paste content here..."
                            ></textarea>

                            {/* Stats Bar */}
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                {[
                                    { label: 'Words', val: stats.words },
                                    { label: 'Characters', val: stats.chars },
                                    { label: 'Sentences', val: stats.sentences },
                                    { label: 'Lines', val: stats.lines },
                                    { label: 'No Spaces', val: stats.noSpace },
                                    { label: 'Read Time', val: `~${stats.readTime} min` }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                                        <div className="text-lg font-bold text-white">{stat.val}</div>
                                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'diff' && (
                        <div className="flex-1 flex flex-col gap-6 h-full">
                            <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
                                <div className="flex flex-col gap-3">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Original Text</span>
                                    <textarea value={text} onChange={e => setText(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-300 font-mono text-xs resize-none focus:border-primary-500 outline-none custom-scrollbar" placeholder="Paste original text..."></textarea>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Modified Text</span>
                                    <textarea value={text2} onChange={e => setText2(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-300 font-mono text-xs resize-none focus:border-primary-500 outline-none custom-scrollbar" placeholder="Paste modified text..."></textarea>
                                </div>
                            </div>

                            <div className="h-48 bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-y-auto custom-scrollbar font-mono text-xs">
                                {(() => {
                                    const lines1 = text.split('\n');
                                    const lines2 = text2.split('\n');
                                    const max = Math.max(lines1.length, lines2.length);
                                    const output = [];
                                    let hasDiff = false;

                                    for (let i = 0; i < max; i++) {
                                        const l1 = lines1[i] || '';
                                        const l2 = lines2[i] || '';
                                        if (l1 !== l2) {
                                            hasDiff = true;
                                            output.push(
                                                <div key={i} className="grid grid-cols-2 gap-6 border-b border-slate-800/50 py-2 hover:bg-slate-900/50 transition-colors">
                                                    <div className="text-red-400 bg-red-500/10 px-2 py-1 rounded break-all border-l-2 border-red-500">- {l1 || <span className="italic opacity-30">empty</span>}</div>
                                                    <div className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded break-all border-l-2 border-emerald-500">+ {l2 || <span className="italic opacity-30">empty</span>}</div>
                                                </div>
                                            );
                                        }
                                    }
                                    return hasDiff ? output : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                            <CheckCircle size={32} className="mb-2 text-emerald-500" />
                                            <p className="font-medium">Texts are identical</p>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}

                    {activeTab === 'generate' && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-8">
                            <div className="text-center space-y-3">
                                <div className="p-5 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl inline-block shadow-lg shadow-primary-500/20">
                                    <Sparkles size={40} className="text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Content Generators</h3>
                                <p className="text-slate-400 max-w-md mx-auto">Generate placeholder text for your designs and layouts instantly.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                                <button
                                    onClick={() => { generateText('lorem', 3); setActiveTab('editor'); }}
                                    className="p-8 bg-slate-950 hover:bg-slate-900 rounded-[2rem] border border-slate-800 hover:border-primary-500/50 transition-all group text-left relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <AlignLeft size={64} />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
                                            <AlignLeft size={24} className="text-primary-400" /> Lorem Ipsum
                                        </div>
                                        <p className="text-sm text-slate-400 leading-relaxed">Generate 3 paragraphs of standard Latin placeholder text.</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => { generateText('random', 5); setActiveTab('editor'); }}
                                    className="p-8 bg-slate-950 hover:bg-slate-900 rounded-[2rem] border border-slate-800 hover:border-primary-500/50 transition-all group text-left relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Binary size={64} />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
                                            <Binary size={24} className="text-purple-400" /> Random String
                                        </div>
                                        <p className="text-sm text-slate-400 leading-relaxed">Generate 500 characters of alphanumeric chaos for testing.</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TextTools;
