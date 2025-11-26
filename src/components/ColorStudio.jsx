import React, { useState } from 'react';
import { Palette, Copy } from 'lucide-react';

const ColorStudio = ({ showToast }) => {
    const [color, setColor] = useState('#6366f1');
    const [rgb, setRgb] = useState('rgb(99, 102, 241)');
    const [hsl, setHsl] = useState('hsl(239, 84%, 67%)');

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
    };

    const handleColorChange = (e) => {
        const hex = e.target.value;
        setColor(hex);
        const rgbVal = hexToRgb(hex);
        if (rgbVal) {
            setRgb(`rgb(${rgbVal.r}, ${rgbVal.g}, ${rgbVal.b})`);
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
            setHsl(`hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`);
        }
    };

    const copy = (text) => {
        navigator.clipboard.writeText(text);
        showToast('Copied!');
    };

    const PaletteBlock = ({ index, baseColor }) => {
        // Generate monochromatic palette
        const rgbVal = hexToRgb(baseColor);
        if (!rgbVal) return null;

        // Simple lightness variation
        const opacity = 0.2 + (index * 0.15);
        const rgba = `rgba(${rgbVal.r}, ${rgbVal.g}, ${rgbVal.b}, ${opacity.toFixed(2)})`;

        return (
            <div
                onClick={() => copy(rgba)}
                className="flex-1 h-full cursor-pointer hover:flex-[1.5] transition-all duration-300 flex items-end justify-center pb-4 group relative first:rounded-l-2xl last:rounded-r-2xl"
                style={{ backgroundColor: baseColor, opacity: opacity }}
            >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Copy size={20} className="text-white drop-shadow-md" />
                </div>
                <span className="text-xs font-mono bg-black/40 backdrop-blur text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity mb-8">
                    {Math.round(opacity * 100)}%
                </span>
            </div>
        );
    };

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">Color Studio</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Picker & Values */}
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl space-y-8">
                    <div>
                        <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Pick Color</label>
                        <div className="relative w-full h-32 rounded-2xl overflow-hidden cursor-pointer shadow-inner border border-slate-700 group">
                            <input
                                type="color"
                                value={color}
                                onChange={handleColorChange}
                                className="absolute -top-4 -left-4 w-[120%] h-[150%] cursor-pointer p-0 border-0"
                            />
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/10 group-hover:bg-transparent transition-colors">
                                <span className="bg-black/30 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Click to Change</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[{ label: 'HEX', val: color }, { label: 'RGB', val: rgb }, { label: 'HSL', val: hsl }].map((item) => (
                            <div
                                key={item.label}
                                onClick={() => copy(item.val)}
                                className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-primary-500 cursor-pointer group transition-all hover:shadow-lg hover:shadow-primary-500/10"
                            >
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider w-12">{item.label}</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-white font-mono text-lg">{item.val}</span>
                                    <button className="p-2 bg-slate-900 rounded-lg text-slate-500 group-hover:text-primary-400 transition-colors">
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Palette & Preview */}
                <div className="space-y-8">
                    <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl h-full flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Palette size={20} className="text-primary-400" />
                            Generated Palette
                        </h3>

                        <div className="flex-1 flex h-40 rounded-2xl overflow-hidden mb-6 shadow-lg">
                            {[1, 2, 3, 4, 5].map(i => <PaletteBlock key={i} index={i} baseColor={color} />)}
                        </div>

                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                            <p className="text-sm text-slate-400">
                                This palette is generated using opacity variations of your selected color.
                                Click any block to copy its <span className="text-white font-mono">rgba()</span> value.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColorStudio;
