import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

const RegexBuilder = () => {
    const [parts, setParts] = useState([]);
    const [testString, setTestString] = useState('');

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

    const regexString = constructRegex();
    let isMatch = false;
    try { if (regexString && testString) { isMatch = new RegExp(regexString).test(testString); } } catch (e) { }

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
        <div className="animate-fade-in p-4 md:p-10 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">Guided Regex Builder</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                                            className="bg-slate-900/50 border border-white/10 rounded px-2 py-0.5 text-xs text-white w-20 outline-none focus:border-primary-500 transition-colors"
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
                            /{regexString}/
                        </div>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Test String</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={testString}
                                onChange={e => setTestString(e.target.value)}
                                className={`w-full bg-slate-950 border-2 ${isMatch ? 'border-emerald-500/50 focus:border-emerald-500' : 'border-slate-800 focus:border-slate-600'} rounded-xl p-4 text-white outline-none pr-12 transition-all`}
                                placeholder="Type to test match..."
                            />
                            {testString && (
                                <div className={`absolute right-4 top-4 ${isMatch ? 'text-emerald-500' : 'text-red-500'} animate-fade-in`}>
                                    {isMatch ? <CheckCircle size={24} /> : <X size={24} />}
                                </div>
                            )}
                        </div>
                        {testString && (
                            <div className={`mt-4 text-center text-sm font-bold ${isMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isMatch ? 'Match Found!' : 'No Match'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegexBuilder;
