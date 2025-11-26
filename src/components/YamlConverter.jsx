import React, { useState, useEffect } from 'react';
import { FileJson, ArrowRight, Database, Copy, AlertCircle } from 'lucide-react';
import { loadScript } from '../utils/helpers';

const YamlConverter = ({ showToast }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState('json2yaml');
    const [error, setError] = useState('');

    useEffect(() => {
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js')
            .catch(() => setError('Failed to load YAML library'));
    }, []);

    const convert = () => {
        setError('');
        try {
            if (!window.jsyaml) throw new Error('Library loading...');
            if (mode === 'json2yaml') {
                const obj = JSON.parse(input);
                setOutput(window.jsyaml.dump(obj));
            } else {
                const obj = window.jsyaml.load(input);
                setOutput(JSON.stringify(obj, null, 2));
            }
        } catch (e) {
            setError(e.message);
            setOutput('');
        }
    };

    const copy = () => {
        navigator.clipboard.writeText(output);
        showToast('Copied!');
    };

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">YAML ↔ JSON</h2>

            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-[2rem] shadow-xl h-[750px] flex flex-col">
                <div className="flex justify-center mb-8">
                    <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 shadow-lg">
                        <button onClick={() => setMode('json2yaml')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${mode === 'json2yaml' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>
                            <FileJson size={16} /> JSON <ArrowRight size={14} /> <Database size={16} /> YAML
                        </button>
                        <button onClick={() => setMode('yaml2json')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${mode === 'yaml2json' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>
                            <Database size={16} /> YAML <ArrowRight size={14} /> <FileJson size={16} /> JSON
                        </button>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
                    <div className="flex flex-col h-full">
                        <label className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                            {mode === 'json2yaml' ? <FileJson size={14} /> : <Database size={14} />}
                            {mode === 'json2yaml' ? 'JSON Input' : 'YAML Input'}
                        </label>
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-slate-300 font-mono text-xs resize-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none custom-scrollbar leading-relaxed transition-all placeholder:text-slate-700"
                            placeholder="Paste content here..."
                            spellCheck="false"
                        ></textarea>
                    </div>

                    <div className="flex flex-col h-full relative">
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                                {mode === 'json2yaml' ? <Database size={14} /> : <FileJson size={14} />}
                                {mode === 'json2yaml' ? 'YAML Output' : 'JSON Output'}
                            </label>
                            <button onClick={copy} className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"><Copy size={12} /> COPY</button>
                        </div>
                        <textarea
                            readOnly
                            value={output}
                            className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-emerald-400 font-mono text-xs resize-none focus:outline-none custom-scrollbar leading-relaxed"
                            placeholder="Result..."
                        ></textarea>
                    </div>
                </div>

                <div className="mt-6 flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="text-red-400 text-xs font-mono flex items-center gap-2">
                        {error && <><AlertCircle size={14} /> {error}</>}
                    </div>
                    <button onClick={convert} className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-600/20 active:scale-95">
                        Convert
                    </button>
                </div>
            </div>
        </div>
    );
};

export default YamlConverter;
