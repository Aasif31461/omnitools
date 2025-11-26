import React, { useState, useEffect } from 'react';

const AspectRatio = () => {
    const [width, setWidth] = useState(1920);
    const [height, setHeight] = useState(1080);
    const [ratio, setRatio] = useState('16:9');

    const calculateRatio = (w, h) => {
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(w, h);
        return `${w / divisor}:${h / divisor}`;
    };

    useEffect(() => {
        if (width && height) {
            setRatio(calculateRatio(width, height));
        }
    }, [width, height]);

    const setPreset = (w, h) => {
        setWidth(w);
        setHeight(h);
    };

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">Aspect Ratio Calculator</h2>
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-[2rem] p-8 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Dimensions (px)</label>
                            <div className="flex gap-4 items-center">
                                <input type="number" value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors" placeholder="Width" />
                                <span className="text-slate-500 font-bold">x</span>
                                <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors" placeholder="Height" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Common Presets</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => setPreset(1920, 1080)} className="py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors">HD (16:9)</button>
                                <button onClick={() => setPreset(1080, 1080)} className="py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors">Square (1:1)</button>
                                <button onClick={() => setPreset(1080, 1350)} className="py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors">Instagram (4:5)</button>
                                <button onClick={() => setPreset(1080, 1920)} className="py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors">Story (9:16)</button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-8 bg-slate-950 border border-slate-800 rounded-2xl aspect-square relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                            <div style={{ aspectRatio: `${width}/${height}`, width: '80%', maxHeight: '80%' }} className="border-4 border-primary-500 rounded-lg"></div>
                        </div>
                        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 mb-2">{ratio}</div>
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Aspect Ratio</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AspectRatio;
