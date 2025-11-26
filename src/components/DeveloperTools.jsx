import React, { useState, useEffect } from 'react';
import { ChevronRight, Copy } from 'lucide-react';

const DeveloperTools = ({ showToast }) => {
    const [mode, setMode] = useState('base64');
    const [base64Mode, setBase64Mode] = useState('encode');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');

    useEffect(() => {
        const process = async () => {
            if (!input) { setOutput(''); return; }
            try {
                if (mode === 'base64') {
                    if (base64Mode === 'encode') {
                        setOutput(btoa(input));
                    } else {
                        try {
                            setOutput(atob(input));
                        } catch (e) {
                            setOutput('Invalid Base64 string');
                        }
                    }
                } else if (mode === 'url') {
                    setOutput(encodeURIComponent(input));
                } else if (mode === 'hash') {
                    const msgBuffer = new TextEncoder().encode(input);
                    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                    setOutput(hashHex);
                }
            } catch (e) {
                setOutput('Error processing input');
            }
        };
        process();
    }, [input, mode, base64Mode]);

    const copy = (text) => {
        navigator.clipboard.writeText(text);
        showToast('Copied!');
    };

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">Developer Tools</h2>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-2">
                    {['base64', 'url', 'hash'].map(m => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`w-full text-left px-6 py-4 rounded-2xl font-bold transition-all flex items-center justify-between group ${mode === m ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <span className="uppercase tracking-wider text-sm">
                                {m === 'hash' ? 'SHA-256' : m}
                            </span>
                            <ChevronRight size={16} className={`transition-transform ${mode === m ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 min-h-[400px] flex flex-col">
                        <div className="flex-1 flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Input</label>
                                <textarea
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-sm focus:border-primary-500 outline-none transition-colors resize-none"
                                    placeholder="Type or paste content here..."
                                ></textarea>
                            </div>

                            {mode === 'base64' && (
                                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start">
                                    <button onClick={() => setBase64Mode('encode')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${base64Mode === 'encode' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-500 hover:text-slate-300'}`}>Encode</button>
                                    <button onClick={() => setBase64Mode('decode')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${base64Mode === 'decode' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-500 hover:text-slate-300'}`}>Decode</button>
                                </div>
                            )}

                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Output</label>
                                <div className="relative h-full min-h-[120px]">
                                    <textarea
                                        readOnly
                                        value={output}
                                        className="w-full h-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-emerald-400 font-mono text-sm outline-none resize-none"
                                        placeholder="Result will appear here..."
                                    ></textarea>
                                    {output && (
                                        <button onClick={() => copy(output)} className="absolute top-2 right-2 p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-800">
                                            <Copy size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeveloperTools;
