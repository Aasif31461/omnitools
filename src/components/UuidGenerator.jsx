import React, { useState, useEffect } from 'react';
import { RefreshCw, Copy } from 'lucide-react';

const UuidGenerator = ({ showToast }) => {
    const [uuids, setUuids] = useState([]);
    const [count, setCount] = useState(1);

    const generate = () => {
        const newUuids = Array.from({ length: count }, () => crypto.randomUUID());
        setUuids(newUuids);
    };

    const copyAll = () => {
        navigator.clipboard.writeText(uuids.join('\n'));
        showToast('Copied all!');
    };

    useEffect(() => { generate(); }, []);

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">UUID Generator</h2>

            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl">
                <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
                    <div className="flex-1 w-full">
                        <div className="flex justify-between text-sm text-slate-400 mb-3 font-bold uppercase tracking-wider">
                            <span>Quantity</span>
                            <span className="text-white">{count}</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={count}
                            onChange={e => setCount(parseInt(e.target.value))}
                            className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                        />
                    </div>
                    <button
                        onClick={generate}
                        className="w-full md:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-600/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={18} /> Generate
                    </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 max-h-[500px] overflow-y-auto custom-scrollbar space-y-3">
                    {uuids.map((uuid, i) => (
                        <div key={i} className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 group hover:border-primary-500/50 transition-colors">
                            <span className="font-mono text-slate-300 text-sm">{uuid}</span>
                            <button
                                onClick={() => { navigator.clipboard.writeText(uuid); showToast('Copied'); }}
                                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white p-2 bg-slate-800 rounded-lg transition-all"
                                title="Copy"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                {uuids.length > 0 && (
                    <button
                        onClick={copyAll}
                        className="mt-6 w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-slate-700"
                    >
                        <Copy size={18} /> Copy All UUIDs
                    </button>
                )}
            </div>
        </div>
    );
};

export default UuidGenerator;
