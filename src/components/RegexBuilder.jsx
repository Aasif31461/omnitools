import React, { useState, useMemo } from 'react';
import { X, CheckCircle, Copy, RefreshCw, ChevronDown, AlertTriangle } from 'lucide-react';

const RegexBuilder = () => {
    const [activeTab, setActiveTab] = useState('builder'); // 'builder' | 'tester'

    // Builder State
    const [parts, setParts] = useState([]);
    const [builderTestString, setBuilderTestString] = useState('');

    // Tester State
    const [regexInput, setRegexInput] = useState('\\w+');
    const [flags, setFlags] = useState('g');
    const [testerText, setTesterText] = useState('Hello world! This is a test string. 123-456-7890');

    // Refs for scroll sync
    const backdropRef = React.useRef(null);
    const textareaRef = React.useRef(null);

    const handleScroll = () => {
        if (backdropRef.current && textareaRef.current) {
            backdropRef.current.scrollTop = textareaRef.current.scrollTop;
            backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    // Builder Logic
    const addPart = (type) => setParts([...parts, { type, value: '' }]);
    const removePart = (index) => { const newParts = [...parts]; newParts.splice(index, 1); setParts(newParts); };
    const updatePart = (index, val) => { const newParts = [...parts]; newParts[index].value = val; setParts(newParts); };

    const constructRegex = () => {
        let pattern = '';
        parts.forEach(p => {
            if (p.type === 'start') pattern += '^';
            if (p.type === 'end') pattern += '$';
            if (p.type === 'word') pattern += '\\w+';
            if (p.type === 'digit') pattern += '\\d+';
            if (p.type === 'text') pattern += p.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (p.type === 'any') pattern += '.';
            if (p.type === 'whitespace') pattern += '\\s';
        });
        return pattern;
    };

    const builderRegexString = constructRegex();
    let isBuilderMatch = false;
    try { if (builderRegexString && builderTestString) { isBuilderMatch = new RegExp(builderRegexString).test(builderTestString); } } catch (e) { }

    // Tester Logic
    const templates = [
        { label: 'Email Address', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g' },
        { label: 'Phone Number (US)', pattern: '\\(?\\d{3}\\)?[-\\s.]?\\d{3}[-\\s.]?\\d{4}', flags: 'g' },
        { label: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}', flags: 'g' },
        { label: 'URL / Website', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)', flags: 'gi' },
        { label: 'Hex Color', pattern: '#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})', flags: 'g' },
        { label: 'Password (Strong)', pattern: '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}', flags: 'g' },
        { label: 'IPv4 Address', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' }
    ];

    const applyTemplate = (template) => {
        setRegexInput(template.pattern);
        setFlags(template.flags);
    };

    const testerResult = useMemo(() => {
        if (!regexInput) return { matches: [], error: null };
        try {
            const re = new RegExp(regexInput, flags);
            const matches = [];
            let match;

            // Prevent infinite loops with empty matches
            if (regexInput === '') return { matches: [], error: null };

            // For global flag, we need to loop
            if (flags.includes('g')) {
                let lastIndex = 0;
                while ((match = re.exec(testerText)) !== null) {
                    matches.push({
                        index: match.index,
                        length: match[0].length,
                        content: match[0],
                        groups: match.slice(1)
                    });
                    if (match.index === re.lastIndex) {
                        re.lastIndex++; // Avoid infinite loop for zero-width matches
                    }
                    if (re.lastIndex > testerText.length) break; // Safety break
                }
            } else {
                match = re.exec(testerText);
                if (match) {
                    matches.push({
                        index: match.index,
                        length: match[0].length,
                        content: match[0],
                        groups: match.slice(1)
                    });
                }
            }
            return { matches, error: null };
        } catch (e) {
            return { matches: [], error: e.message };
        }
    }, [regexInput, flags, testerText]);

    // Highlight Rendering
    const renderHighlightedText = () => {
        if (testerResult.error || !regexInput || testerResult.matches.length === 0) {
            return <div className="text-slate-300 whitespace-pre-wrap font-mono text-sm">{testerText}</div>;
        }

        let lastIndex = 0;
        const elements = [];

        testerResult.matches.forEach((match, i) => {
            // Text before match
            if (match.index > lastIndex) {
                elements.push(
                    <span key={`text-${i}`} className="text-slate-300">
                        {testerText.slice(lastIndex, match.index)}
                    </span>
                );
            }
            // Match
            elements.push(
                <span key={`match-${i}`} className="bg-emerald-500/30 text-emerald-200 border-b-2 border-emerald-500 rounded-sm" title={`Match ${i + 1}`}>
                    {match.content}
                </span>
            );
            lastIndex = match.index + match.length;
        });

        // Remaining text
        if (lastIndex < testerText.length) {
            elements.push(
                <span key="text-end" className="text-slate-300">
                    {testerText.slice(lastIndex)}
                </span>
            );
        }

        return <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{elements}</div>;
    };

    const blockColors = {
        start: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        end: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        text: 'bg-slate-700 text-white border-slate-600',
        word: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        digit: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        whitespace: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        any: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
    };

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">Regex Studio</h2>

            {/* Tabs */}
            <div className="flex justify-center mb-8">
                <div className="bg-slate-900/50 p-1 rounded-xl border border-slate-800 flex gap-1">
                    <button
                        onClick={() => setActiveTab('builder')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'builder' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        Visual Builder
                    </button>
                    <button
                        onClick={() => setActiveTab('tester')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'tester' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        Regex Tester
                    </button>
                </div>
            </div>

            {activeTab === 'builder' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                    {/* Builder Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Construction Blocks</label>
                            <div className="flex flex-wrap gap-3">
                                {['start', 'text', 'word', 'digit', 'whitespace', 'any', 'end'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => addPart(t)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all hover:scale-105 active:scale-95 ${blockColors[t] || 'bg-slate-800 text-white border-slate-700'}`}
                                    >
                                        + {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-[2rem] shadow-xl min-h-[200px]">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Your Pattern</label>
                            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-wrap gap-3 items-center min-h-[120px]">
                                {parts.length === 0 && (
                                    <div className="w-full text-center text-slate-600 italic text-sm py-8">
                                        Click blocks above to start building your regex...
                                    </div>
                                )}
                                {parts.map((p, i) => (
                                    <div key={i} className={`flex items-center rounded-xl px-3 py-2 border ${blockColors[p.type]} animate-fade-in`}>
                                        <span className="text-xs font-bold uppercase mr-2">{p.type}</span>
                                        {p.type === 'text' && (
                                            <input
                                                type="text"
                                                value={p.value}
                                                onChange={e => updatePart(i, e.target.value)}
                                                className="bg-slate-900/50 border border-white/10 rounded px-2 py-0.5 text-xs text-white w-20 outline-none focus:border-emerald-500 transition-colors"
                                                placeholder="value..."
                                                autoFocus
                                            />
                                        )}
                                        <button onClick={() => removePart(i)} className="ml-2 text-white/50 hover:text-white transition-colors"><X size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Test Section */}
                    <div className="space-y-8">
                        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Generated Regex</label>
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-emerald-400 font-mono text-sm break-all shadow-inner">
                                /{builderRegexString}/
                            </div>
                        </div>

                        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Test String</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={builderTestString}
                                    onChange={e => setBuilderTestString(e.target.value)}
                                    className={`w-full bg-slate-950 border-2 ${isBuilderMatch ? 'border-emerald-500/50 focus:border-emerald-500' : 'border-slate-800 focus:border-slate-600'} rounded-xl p-4 text-white outline-none pr-12 transition-all`}
                                    placeholder="Type to test match..."
                                />
                                {builderTestString && (
                                    <div className={`absolute right-4 top-4 ${isBuilderMatch ? 'text-emerald-500' : 'text-red-500'} animate-fade-in`}>
                                        {isBuilderMatch ? <CheckCircle size={24} /> : <X size={24} />}
                                    </div>
                                )}
                            </div>
                            {builderTestString && (
                                <div className={`mt-4 text-center text-sm font-bold ${isBuilderMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {isBuilderMatch ? 'Match Found!' : 'No Match'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                    {/* Left Column: Controls */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Templates */}
                        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Quick Templates</label>
                            <div className="grid grid-cols-1 gap-2">
                                {templates.map((t, i) => (
                                    <button
                                        key={i}
                                        onClick={() => applyTemplate(t)}
                                        className="text-left px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-emerald-500/50 transition-all flex justify-between items-center group"
                                    >
                                        <span className="text-sm font-medium text-slate-300 group-hover:text-white">{t.label}</span>
                                        <Copy size={14} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Match Info */}
                        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Match Info</label>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                                    <span className="text-slate-400 text-sm">Status</span>
                                    {testerResult.error ? (
                                        <span className="text-red-400 text-sm font-bold flex items-center gap-1"><AlertTriangle size={14} /> Error</span>
                                    ) : (
                                        <span className={`text-sm font-bold ${testerResult.matches.length > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {testerResult.matches.length > 0 ? 'Valid' : 'No Match'}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                                    <span className="text-slate-400 text-sm">Matches Found</span>
                                    <span className="text-white font-mono font-bold">{testerResult.matches.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Editor */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Regex Input */}
                        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Regular Expression</label>
                                <div className="flex gap-2">
                                    {['g', 'i', 'm', 's'].map(flag => (
                                        <button
                                            key={flag}
                                            onClick={() => setFlags(prev => prev.includes(flag) ? prev.replace(flag, '') : prev + flag)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold uppercase transition-all border ${flags.includes(flag) ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                                        >
                                            {flag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-lg">/</div>
                                <input
                                    type="text"
                                    value={regexInput}
                                    onChange={(e) => setRegexInput(e.target.value)}
                                    className={`w-full bg-slate-950 border-2 ${testerResult.error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'} rounded-xl py-4 px-8 text-white font-mono text-lg outline-none transition-all shadow-inner`}
                                    placeholder="Enter regex pattern..."
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-lg">/{flags}</div>
                            </div>
                            {testerResult.error && (
                                <div className="mt-2 text-red-400 text-xs font-medium flex items-center gap-1">
                                    <AlertTriangle size={12} />
                                    {testerResult.error}
                                </div>
                            )}
                        </div>

                        {/* Test String & Highlight */}
                        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-[2rem] shadow-xl flex-1 flex flex-col min-h-[400px]">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Test String</label>
                                <button onClick={() => setTesterText('')} className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1">
                                    <RefreshCw size={12} /> Clear
                                </button>
                            </div>

                            <div className="relative flex-1 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                                {/* Backdrop for highlighting */}
                                <div
                                    ref={backdropRef}
                                    className="absolute inset-0 p-6 pointer-events-none overflow-auto custom-scrollbar z-10"
                                >
                                    {renderHighlightedText()}
                                </div>

                                {/* Actual Textarea */}
                                <textarea
                                    ref={textareaRef}
                                    value={testerText}
                                    onChange={(e) => setTesterText(e.target.value)}
                                    onScroll={handleScroll}
                                    className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-white p-6 font-mono text-sm leading-relaxed outline-none resize-none z-20 selection:bg-emerald-500/30"
                                    spellCheck="false"
                                    placeholder="Paste your text here to test..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegexBuilder;
