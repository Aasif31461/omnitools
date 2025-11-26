import React, { useState, useRef } from 'react';
import { Upload, Download, Trash2, Settings, Image as ImageIcon, CheckSquare } from 'lucide-react';

const ImageResizer = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [maintainRatio, setMaintainRatio] = useState(true);
    const [quality, setQuality] = useState(80);
    const [originalSize, setOriginalSize] = useState(0);
    const canvasRef = useRef(null);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setOriginalSize(file.size);
            const reader = new FileReader();
            reader.onload = (evt) => {
                const img = new Image();
                img.onload = () => {
                    setImage(img);
                    setWidth(img.width);
                    setHeight(img.height);
                    setPreview(img.src);
                };
                img.src = evt.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDimChange = (dim, val) => {
        const newVal = parseInt(val) || 0;
        if (dim === 'w') {
            setWidth(newVal);
            if (maintainRatio && image) setHeight(Math.round(newVal / (image.width / image.height)));
        } else {
            setHeight(newVal);
            if (maintainRatio && image) setWidth(Math.round(newVal * (image.width / image.height)));
        }
    };

    const download = () => {
        const canvas = canvasRef.current;
        if (!canvas || !image) return;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality / 100);
        const link = document.createElement('a');
        link.download = 'resized-image.jpg';
        link.href = dataUrl;
        link.click();
    };

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">Image Resizer</h2>

            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl">
                {!image ? (
                    <div className="border-3 border-dashed border-slate-700 rounded-3xl p-20 text-center hover:bg-slate-800/50 hover:border-primary-500/50 transition-all cursor-pointer relative group">
                        <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                            <Upload size={32} className="text-primary-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Upload an Image</h3>
                        <p className="text-slate-400">Drag & drop or click to browse</p>
                        <p className="text-xs text-slate-500 mt-4 bg-slate-900 inline-block px-3 py-1 rounded-full border border-slate-800">JPG, PNG, WEBP</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Preview */}
                        <div className="lg:col-span-2 bg-slate-950 p-8 rounded-2xl border border-slate-800 flex items-center justify-center min-h-[400px] relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                            <img src={preview} alt="Preview" className="max-w-full max-h-[500px] object-contain shadow-2xl rounded-lg relative z-10" />
                        </div>

                        {/* Controls */}
                        <div className="space-y-8">
                            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                                    <Settings size={18} className="text-primary-400" />
                                    Dimensions
                                </h3>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Width</label>
                                        <div className="relative">
                                            <input type="number" value={width} onChange={(e) => handleDimChange('w', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono focus:border-primary-500 outline-none transition-colors" />
                                            <span className="absolute right-3 top-3 text-xs text-slate-500">px</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Height</label>
                                        <div className="relative">
                                            <input type="number" value={height} onChange={(e) => handleDimChange('h', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono focus:border-primary-500 outline-none transition-colors" />
                                            <span className="absolute right-3 top-3 text-xs text-slate-500">px</span>
                                        </div>
                                    </div>
                                </div>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${maintainRatio ? 'bg-primary-500 border-primary-500' : 'bg-slate-950 border-slate-600'}`}>
                                        {maintainRatio && <CheckSquare size={12} className="text-white" />}
                                    </div>
                                    <input type="checkbox" checked={maintainRatio} onChange={(e) => setMaintainRatio(e.target.checked)} className="hidden" />
                                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Maintain Aspect Ratio</span>
                                </label>
                            </div>

                            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                                    <ImageIcon size={18} className="text-primary-400" />
                                    Quality
                                </h3>

                                <div className="mb-2 flex justify-between items-end">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Compression</span>
                                    <span className="text-primary-400 font-bold">{quality}%</span>
                                </div>
                                <input type="range" min="1" max="100" value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500 mb-6" />

                                <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                                    <span className="text-xs text-slate-500">Original Size</span>
                                    <span className="text-sm font-mono text-white">{(originalSize / 1024).toFixed(2)} KB</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={download} className="flex-1 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2 active:scale-95">
                                    <Download size={20} /> Download
                                </button>
                                <button onClick={() => setImage(null)} className="px-5 py-4 bg-slate-800 text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 border border-transparent rounded-xl font-bold transition-all active:scale-95">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
};

export default ImageResizer;
