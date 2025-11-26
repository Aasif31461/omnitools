import React, { useState, useEffect } from 'react';
import { FileJson, AlignLeft, Database, AlertCircle, Copy, ChevronDown, ChevronRight } from 'lucide-react';

const JsonNode = ({ name, value, depth = 0, isLast }) => {
    const [expanded, setExpanded] = useState(true);
    const bracketColors = ['text-yellow-400', 'text-purple-400', 'text-blue-400'];
    const bracketClass = bracketColors[depth % bracketColors.length];

    if (value === null) return <div className="pl-4"><span className="text-blue-300">{name && `"${name}": `}</span><span className="text-slate-500">null</span>{!isLast && ','}</div>;

    if (typeof value === 'object') {
        const isArray = Array.isArray(value);
        const isEmpty = Object.keys(value).length === 0;
        const open = isArray ? '[' : '{';
        const close = isArray ? ']' : '}';

        if (isEmpty) return <div className="pl-4"><span className="text-blue-300">{name && `"${name}": `}</span><span className={bracketClass}>{open}{close}</span>{!isLast && ','}</div>;

        return (
            <div className="pl-4">
                <div className="flex items-start">
                    <button onClick={() => setExpanded(!expanded)} className="mr-1 mt-1 text-slate-500 hover:text-white">
                        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                    <div>
                        <span className="text-blue-300">{name && `"${name}": `}</span>
                        <span className={bracketClass}>{open}</span>
                        {!expanded && <span className="text-slate-600 text-xs mx-1 select-none">...</span>}
                    </div>
                </div>
                {expanded && (
                    <div className="border-l border-slate-800 ml-2.5">
                        {Object.entries(value).map(([key, val], idx, arr) => (
                            <JsonNode key={key} name={isArray ? null : key} value={val} depth={depth + 1} isLast={idx === arr.length - 1} />
                        ))}
                    </div>
                )}
                <div className="pl-6"><span className={bracketClass}>{close}</span>{!isLast && ','}</div>
            </div>
        );
    }

    let valColor = 'text-emerald-400';
    if (typeof value === 'number') valColor = 'text-orange-400';
    if (typeof value === 'boolean') valColor = 'text-red-400';
    const displayValue = typeof value === 'string' ? `"${value}"` : String(value);

    return (
        <div className="pl-4 flex"><span className="text-blue-300 mr-1">{name && `"${name}":`}</span><span className={`${valColor}`}>{displayValue}</span><span>{!isLast && ','}</span></div>
    );
};

const JsonFormatter = ({ showToast }) => {
    const [input, setInput] = useState('{"name":"OmniTools","version":3,"features":["Tools","Colors"],"active":true,"nested":{"a":1,"b":null}}');
    const [error, setError] = useState(null);
    const [view, setView] = useState('tree');
    const [parsedData, setParsedData] = useState(null);

    useEffect(() => {
        try {
            if (!input) { setParsedData(null); return; }
            const parsed = JSON.parse(input);
            setParsedData(parsed);
            setError(null);
        } catch (e) {
            setError(e.message);
            setParsedData(null);
        }
    }, [input]);

    const format = (minify = false) => {
        try {
            const parsed = JSON.parse(input);
            setInput(JSON.stringify(parsed, null, minify ? 0 : 2));
            setError(null);
        } catch (e) {
            setError(e.message);
        }
    };

    const copy = (text) => {
        navigator.clipboard.writeText(text);
        showToast('Copied!');
    };

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">JSON Formatter</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[750px]">
                {/* Input Section */}
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-[2rem] flex flex-col shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400"><FileJson size={20} /></div>
                            <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Input JSON</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => format(false)} className="px-4 py-2 bg-slate-800 hover:bg-primary-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2"><AlignLeft size={14} /> PRETTIFY</button>
                            <button onClick={() => format(true)} className="px-4 py-2 bg-slate-800 hover:bg-primary-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2"><Database size={14} /> MINIFY</button>
                        </div>
                    </div>

                    <div className="relative flex-1">
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            className={`w-full h-full bg-slate-950 border ${error ? 'border-red-500/50' : 'border-slate-800'} rounded-2xl p-5 text-slate-300 font-mono text-xs focus:outline-none resize-none custom-scrollbar leading-relaxed`}
                            placeholder="Paste JSON here..."
                            spellCheck="false"
                        ></textarea>
                        {error && (
                            <div className="absolute bottom-4 left-4 right-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-mono flex items-center gap-3 backdrop-blur-md animate-fade-in">
                                <AlertCircle size={16} className="shrink-0" />
                                <span className="truncate">{error}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Output Section */}
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-[2rem] flex flex-col shadow-xl overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                            <button onClick={() => setView('tree')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'tree' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>TREE VIEW</button>
                            <button onClick={() => setView('raw')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'raw' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>RAW DATA</button>
                        </div>
                        <button onClick={() => copy(input)} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-all"><Copy size={20} /></button>
                    </div>

                    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-5 overflow-auto custom-scrollbar">
                        {parsedData ? (
                            view === 'tree' ? (
                                <div className="font-mono text-sm leading-relaxed">
                                    <JsonNode value={parsedData} isLast={true} />
                                </div>
                            ) : (
                                <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{JSON.stringify(parsedData, null, 2)}</pre>
                            )
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
                                <FileJson size={48} className="opacity-20" />
                                <span className="text-sm italic">{error ? 'Fix errors to view tree' : 'Waiting for valid JSON...'}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JsonFormatter;
