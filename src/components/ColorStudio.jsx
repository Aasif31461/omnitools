import React, { useState, useEffect } from 'react';
import { Palette, Copy, Blend, Layers, Contrast, Check, X, Plus, Trash2 } from 'lucide-react';

const ColorStudio = ({ showToast }) => {
    const [activeTab, setActiveTab] = useState('picker');

    // --- Shared Utils ---
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
    };

    const rgbToHex = (r, g, b) => {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    const copy = (text) => {
        navigator.clipboard.writeText(text);
        showToast('Copied!');
    };

    // --- Picker State & Logic ---
    const [pickerColor, setPickerColor] = useState('#6366f1');
    const [pickerRgb, setPickerRgb] = useState('rgb(99, 102, 241)');
    const [pickerHsl, setPickerHsl] = useState('hsl(239, 84%, 67%)');

    const handlePickerChange = (e) => {
        const hex = e.target.value;
        setPickerColor(hex);
        const rgbVal = hexToRgb(hex);
        if (rgbVal) {
            setPickerRgb(`rgb(${rgbVal.r}, ${rgbVal.g}, ${rgbVal.b})`);
            // HSL Calc
            let r = rgbVal.r / 255, g = rgbVal.g / 255, b = rgbVal.b / 255;
            let max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            if (max === min) { h = s = 0; } else {
                let d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                    default: break;
                }
                h /= 6;
            }
            setPickerHsl(`hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`);
        }
    };

    // --- Mixer State & Logic ---
    const [mixColor1, setMixColor1] = useState('#3b82f6');
    const [mixColor2, setMixColor2] = useState('#ef4444');
    const [mixRatio, setMixRatio] = useState(50);
    const [mixedColor, setMixedColor] = useState('#9ca3af');

    useEffect(() => {
        const c1 = hexToRgb(mixColor1);
        const c2 = hexToRgb(mixColor2);
        if (c1 && c2) {
            const r = Math.round(c1.r * (1 - mixRatio / 100) + c2.r * (mixRatio / 100));
            const g = Math.round(c1.g * (1 - mixRatio / 100) + c2.g * (mixRatio / 100));
            const b = Math.round(c1.b * (1 - mixRatio / 100) + c2.b * (mixRatio / 100));
            setMixedColor(rgbToHex(r, g, b));
        }
    }, [mixColor1, mixColor2, mixRatio]);

    // --- Gradient State & Logic ---
    const [gradColors, setGradColors] = useState(['#8b5cf6', '#ec4899']);
    const [gradDir, setGradDir] = useState('to right');
    const gradientCss = `background: linear-gradient(${gradDir}, ${gradColors.join(', ')});`;

    const addGradColor = () => {
        setGradColors([...gradColors, '#ffffff']);
    };

    const removeGradColor = (index) => {
        if (gradColors.length > 2) {
            const newColors = gradColors.filter((_, i) => i !== index);
            setGradColors(newColors);
        }
    };

    const updateGradColor = (index, val) => {
        const newColors = [...gradColors];
        newColors[index] = val;
        setGradColors(newColors);
    };

    // --- Contrast State & Logic ---
    const [fgColor, setFgColor] = useState('#ffffff');
    const [bgColor, setBgColor] = useState('#0f172a');
    const [contrastRatio, setContrastRatio] = useState(0);

    const getLuminance = (r, g, b) => {
        const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    useEffect(() => {
        const fg = hexToRgb(fgColor);
        const bg = hexToRgb(bgColor);
        if (fg && bg) {
            const l1 = getLuminance(fg.r, fg.g, fg.b);
            const l2 = getLuminance(bg.r, bg.g, bg.b);
            const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
            setContrastRatio(ratio.toFixed(2));
        }
    }, [fgColor, bgColor]);

    const getScore = (ratio) => {
        if (ratio >= 7) return { label: 'AAA', color: 'text-emerald-400', icon: Check };
        if (ratio >= 4.5) return { label: 'AA', color: 'text-emerald-400', icon: Check };
        if (ratio >= 3) return { label: 'AA Large', color: 'text-yellow-400', icon: Check };
        return { label: 'Fail', color: 'text-red-400', icon: X };
    };

    const score = getScore(parseFloat(contrastRatio));


    // --- Render Components ---

    const PaletteBlock = ({ index, baseColor }) => {
        const rgbVal = hexToRgb(baseColor);
        if (!rgbVal) return null;
        const opacity = 0.2 + (index * 0.15);
        const rgba = `rgba(${rgbVal.r}, ${rgbVal.g}, ${rgbVal.b}, ${opacity.toFixed(2)})`;
        return (
            <div onClick={() => copy(rgba)} className="flex-1 h-full cursor-pointer hover:flex-[1.5] transition-all duration-300 flex items-end justify-center pb-4 group relative first:rounded-l-2xl last:rounded-r-2xl" style={{ backgroundColor: baseColor, opacity: opacity }}>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Copy size={20} className="text-white drop-shadow-md" /></div>
                <span className="text-xs font-mono bg-black/40 backdrop-blur text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity mb-8">{Math.round(opacity * 100)}%</span>
            </div>
        );
    };

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">Color Studio</h2>

            {/* Tabs */}
            <div className="flex justify-center mb-8">
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-1.5 rounded-2xl flex gap-2 overflow-x-auto max-w-full">
                    {[
                        { id: 'picker', label: 'Picker', icon: Palette },
                        { id: 'mixer', label: 'Mixer', icon: Blend },
                        { id: 'gradient', label: 'Gradient', icon: Layers },
                        { id: 'contrast', label: 'Contrast', icon: Contrast },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        >
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="min-h-[500px]">
                {activeTab === 'picker' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl space-y-8">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Pick Color</label>
                                <div className="relative w-full h-32 rounded-2xl overflow-hidden cursor-pointer shadow-inner border border-slate-700 group">
                                    <input type="color" value={pickerColor} onChange={handlePickerChange} className="absolute -top-4 -left-4 w-[120%] h-[150%] cursor-pointer p-0 border-0" />
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/10 group-hover:bg-transparent transition-colors">
                                        <span className="bg-black/30 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Click to Change</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {[{ label: 'HEX', val: pickerColor }, { label: 'RGB', val: pickerRgb }, { label: 'HSL', val: pickerHsl }].map((item) => (
                                    <div key={item.label} onClick={() => copy(item.val)} className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-primary-500 cursor-pointer group transition-all hover:shadow-lg hover:shadow-primary-500/10">
                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider w-12">{item.label}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-white font-mono text-lg">{item.val}</span>
                                            <button className="p-2 bg-slate-900 rounded-lg text-slate-500 group-hover:text-primary-400 transition-colors"><Copy size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl h-full flex flex-col">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Palette size={20} className="text-primary-400" /> Generated Palette</h3>
                            <div className="flex-1 flex h-40 rounded-2xl overflow-hidden mb-6 shadow-lg">
                                {[1, 2, 3, 4, 5].map(i => <PaletteBlock key={i} index={i} baseColor={pickerColor} />)}
                            </div>
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                                <p className="text-sm text-slate-400">This palette is generated using opacity variations of your selected color. Click any block to copy its <span className="text-white font-mono">rgba()</span> value.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'mixer' && (
                    <div className="max-w-3xl mx-auto bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl animate-fade-in">
                        <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                            <div className="flex-1 w-full space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Color 1</label>
                                <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                                    <input type="color" value={mixColor1} onChange={e => setMixColor1(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                                    <span className="font-mono text-white">{mixColor1}</span>
                                </div>
                            </div>
                            <div className="flex-1 w-full space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Color 2</label>
                                <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                                    <input type="color" value={mixColor2} onChange={e => setMixColor2(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                                    <span className="font-mono text-white">{mixColor2}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-10">
                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-4">
                                <span>Mix Ratio</span>
                                <span>{mixRatio}%</span>
                            </div>
                            <input type="range" min="0" max="100" value={mixRatio} onChange={e => setMixRatio(e.target.value)} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                        </div>

                        <div className="text-center">
                            <div className="w-full h-32 rounded-2xl shadow-lg mb-6 transition-colors duration-200 flex items-center justify-center" style={{ backgroundColor: mixedColor }}>
                                <span className="bg-black/20 backdrop-blur text-white px-4 py-2 rounded-xl font-mono text-xl font-bold shadow-sm">{mixedColor}</span>
                            </div>
                            <button onClick={() => copy(mixedColor)} className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-colors">
                                <Copy size={18} /> Copy Result
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'gradient' && (
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl space-y-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-4">Colors</label>
                                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                    {gradColors.map((color, index) => (
                                        <div key={index} className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800 animate-fade-in">
                                            <input type="color" value={color} onChange={e => updateGradColor(index, e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                                            <input type="text" value={color} onChange={e => updateGradColor(index, e.target.value)} className="bg-transparent text-white font-mono outline-none w-full" />
                                            <button
                                                onClick={() => removeGradColor(index)}
                                                disabled={gradColors.length <= 2}
                                                className={`p-2 rounded-lg transition-colors ${gradColors.length <= 2 ? 'text-slate-700 cursor-not-allowed' : 'text-slate-500 hover:text-red-400 hover:bg-slate-900'}`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={addGradColor} className="mt-4 w-full py-3 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-primary-500 hover:bg-primary-500/10 transition-all flex items-center justify-center gap-2 font-bold text-sm">
                                    <Plus size={16} /> Add Color
                                </button>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Direction</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['to right', 'to left', 'to bottom', 'to top', 'to bottom right', 'to top left'].map(d => (
                                        <button key={d} onClick={() => setGradDir(d)} className={`py-2 rounded-lg text-xs font-bold border transition-all ${gradDir === d ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}>{d}</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="w-full h-64 rounded-[2rem] shadow-xl transition-all duration-300" style={{ background: `linear-gradient(${gradDir}, ${gradColors.join(', ')})` }}></div>
                            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl relative group">
                                <code className="text-sm text-slate-300 font-mono break-all">{gradientCss}</code>
                                <button onClick={() => copy(gradientCss)} className="absolute top-2 right-2 p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"><Copy size={16} /></button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'contrast' && (
                    <div className="max-w-3xl mx-auto bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Text Color</label>
                                <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                                    <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                                    <input type="text" value={fgColor} onChange={e => setFgColor(e.target.value)} className="bg-transparent text-white font-mono outline-none w-full" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Background Color</label>
                                <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                                    <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                                    <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} className="bg-transparent text-white font-mono outline-none w-full" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center mb-8">
                            <div className="text-xs font-bold text-slate-500 uppercase mb-2">Contrast Ratio</div>
                            <div className="text-5xl font-black text-white mb-4">{contrastRatio} : 1</div>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 ${score.color}`}>
                                <score.icon size={18} />
                                <span className="font-bold">{score.label}</span>
                            </div>
                        </div>

                        <div className="rounded-2xl p-8 text-center transition-colors duration-300" style={{ backgroundColor: bgColor }}>
                            <h3 className="text-2xl font-bold mb-2" style={{ color: fgColor }}>Preview Text</h3>
                            <p style={{ color: fgColor }}>The quick brown fox jumps over the lazy dog.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ColorStudio;
