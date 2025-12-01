import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Upload, Download, Trash2, Settings, Image as ImageIcon, CheckSquare, Scissors, Layers, Wand2, FileType, Minimize2, Crop, LayoutTemplate, AlertCircle, Play, RefreshCw, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { imagePresets } from '../data/imagePresets';

const ImageStudio = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [activeTab, setActiveTab] = useState('resize');
    const [originalSize, setOriginalSize] = useState(0);
    const canvasRef = useRef(null);
    const cropperRef = useRef(null);

    // Resize State
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
    const [maintainRatio, setMaintainRatio] = useState(true);
    const [unit, setUnit] = useState('px'); // px, cm, mm, inch

    // Compress State
    const [quality, setQuality] = useState(80);
    const [compressedSize, setCompressedSize] = useState(0);
    const [targetSize, setTargetSize] = useState(null); // Max size in KB

    // Convert State
    const [format, setFormat] = useState('image/jpeg');

    // Filter State
    const [filter, setFilter] = useState('none');
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [blur, setBlur] = useState(0);

    // Crop State
    const [aspect, setAspect] = useState(NaN); // NaN = free
    const [croppedData, setCroppedData] = useState(null); // Store cropped image data URL

    // Preset & Automation State
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [finalResult, setFinalResult] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setOriginalSize(file.size);
            const reader = new FileReader();
            reader.onload = (evt) => {
                const img = new Image();
                img.onload = () => {
                    setImage(img.src); // Cropper takes src string
                    setWidth(img.width);
                    setHeight(img.height);
                    setOriginalDimensions({ width: img.width, height: img.height });
                    setPreview(img.src);
                    resetFilters();
                    setCroppedData(null);
                    setTargetSize(null);
                    setSelectedPreset(null);
                    setFinalResult(null);
                };
                img.src = evt.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const resetFilters = () => {
        setFilter('none');
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setBlur(0);
        setAspect(NaN);
        setUnit('px');
    };

    // Unit Conversion Helpers
    const DPI = 300; // Standard print DPI
    const toPx = (val, u) => {
        if (u === 'px') return val;
        if (u === 'cm') return Math.round(val * DPI / 2.54);
        if (u === 'mm') return Math.round(val * DPI / 25.4);
        if (u === 'inch') return Math.round(val * DPI);
        return val;
    };
    const fromPx = (val, u) => {
        if (u === 'px') return val;
        if (u === 'cm') return (val * 2.54 / DPI).toFixed(2);
        if (u === 'mm') return (val * 25.4 / DPI).toFixed(2);
        if (u === 'inch') return (val / DPI).toFixed(2);
        return val;
    };

    const handleDimChange = (dim, val) => {
        // Input val is in current 'unit'
        // We need to update width/height in pixels
        const pxVal = toPx(parseFloat(val) || 0, unit);

        if (dim === 'w') {
            setWidth(pxVal);
            if (maintainRatio) {
                const ratio = height > 0 ? width / height : 1;
                setHeight(Math.round(pxVal / ratio));
            }
        } else {
            setHeight(pxVal);
            if (maintainRatio) {
                const ratio = height > 0 ? width / height : 1;
                setWidth(Math.round(pxVal * ratio));
            }
        }
    };

    const applyFilter = (ctx, w, h) => {
        let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
        if (filter === 'grayscale') filterString += ' grayscale(100%)';
        if (filter === 'sepia') filterString += ' sepia(100%)';
        if (filter === 'invert') filterString += ' invert(100%)';
        ctx.filter = filterString;
    };

    // Effect to update preview when dependencies change
    useEffect(() => {
        if (image && activeTab !== 'crop' && !finalResult) {
            const img = new Image();
            img.src = croppedData || image;
            img.onload = () => {
                const canvas = canvasRef.current;
                const targetWidth = width;
                const targetHeight = height;
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');

                if (format === 'image/jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, targetWidth, targetHeight);
                }

                applyFilter(ctx, targetWidth, targetHeight);
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                const dataUrl = canvas.toDataURL(format, quality / 100);
                setPreview(dataUrl);

                const head = 'data:' + format + ';base64,';
                const size = Math.round((dataUrl.length - head.length) * 3 / 4);
                setCompressedSize(size);
            };
        }
    }, [image, croppedData, width, height, quality, format, filter, brightness, contrast, saturation, blur, activeTab, finalResult]);

    // Effect to update cropper aspect ratio when state changes
    useEffect(() => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            cropper.setAspectRatio(aspect);
        }
    }, [aspect]);

    const handleCrop = () => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            const canvas = cropper.getCroppedCanvas();
            const dataUrl = canvas.toDataURL();
            setCroppedData(dataUrl);
            setWidth(canvas.width);
            setHeight(canvas.height);
            setActiveTab('resize');
        }
    };

    const handleResetCrop = () => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            cropper.clear();
            cropper.reset();
        }
        setCroppedData(null);
        setAspect(NaN);
        setSelectedPreset(null);

        const img = new Image();
        img.src = image;
        img.onload = () => {
            setWidth(img.width);
            setHeight(img.height);
            setActiveTab('resize');
        };
    };

    const handleResetResize = () => {
        setWidth(originalDimensions.width);
        setHeight(originalDimensions.height);
        setMaintainRatio(true);
        setUnit('px');
    };

    const handleResetCompress = () => {
        setQuality(90);
    };

    const handleResetConvert = () => {
        setFormat('image/jpeg');
    };

    const handleResetFilter = () => {
        setFilter('none');
    };

    const applyPreset = (preset) => {
        setAspect(preset.aspect);
        setSelectedPreset(preset);
        setWidth(preset.width);
        setHeight(preset.height);
        setTargetSize(preset.maxSize);
        if (preset.format) setFormat(preset.format);
        if (preset.filter) setFilter(preset.filter);
        if (preset.unit) setUnit(preset.unit);
        setActiveTab('crop');
    };

    const handleCancelPreset = () => {
        setSelectedPreset(null);
        setTargetSize(null);
        setAspect(NaN);
        // Reset to original dimensions if available, or keep current
        if (image) {
            const img = new Image();
            img.src = image;
            img.onload = () => {
                setWidth(img.width);
                setHeight(img.height);
            };
        }
    };

    const handleNextStep = () => {
        const steps = ['crop', 'resize', 'compress', 'convert', 'filter'];
        const currentIndex = steps.indexOf(activeTab);
        if (currentIndex < steps.length - 1) {
            setActiveTab(steps[currentIndex + 1]);
        } else {
            // If last step, process
            handleProcessPreset();
        }
    };

    const handleProcessPreset = async () => {
        if (!selectedPreset || !cropperRef.current?.cropper) return;

        setIsProcessing(true);
        const cropper = cropperRef.current.cropper;

        // 1. Get Cropped Canvas
        const croppedCanvas = cropper.getCroppedCanvas();

        // 2. Resize to Preset Dimensions
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = selectedPreset.width;
        finalCanvas.height = selectedPreset.height;
        const ctx = finalCanvas.getContext('2d');

        // Fill white background for JPEGs (common requirement)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

        // Apply Filter if needed
        if (filter && filter !== 'none') {
            let filterString = '';
            if (filter === 'grayscale') filterString = 'grayscale(100%)';
            if (filter === 'sepia') filterString = 'sepia(100%)';
            if (filter === 'invert') filterString = 'invert(100%)';
            ctx.filter = filterString;
        }

        // Draw resized image
        ctx.drawImage(croppedCanvas, 0, 0, finalCanvas.width, finalCanvas.height);

        // 3. Compress Loop
        let q = 0.9;
        let dataUrl = '';
        let size = 0;
        const maxSize = selectedPreset.maxSize * 1024; // KB to Bytes
        const minSize = selectedPreset.minSize * 1024;

        // Simple compression loop
        while (q > 0.1) {
            dataUrl = finalCanvas.toDataURL(format || 'image/jpeg', q);
            const head = 'data:' + (format || 'image/jpeg') + ';base64,';
            size = Math.round((dataUrl.length - head.length) * 3 / 4);

            if (size <= maxSize) {
                break; // Fits!
            }
            q -= 0.1;
        }

        // Set Result
        setFinalResult({
            dataUrl,
            width: finalCanvas.width,
            height: finalCanvas.height,
            size,
            quality: Math.round(q * 100),
            preset: selectedPreset
        });
        setIsProcessing(false);
    };

    const download = (url = preview, name = 'edited-image') => {
        if (url) {
            const link = document.createElement('a');
            const ext = format.split('/')[1];
            link.download = `${name}.${ext}`;
            link.href = url;
            link.click();
        }
    };

    const tabs = [
        { id: 'presets', label: 'Presets', icon: LayoutTemplate },
        { id: 'resize', label: 'Resize', icon: Minimize2 },
        { id: 'crop', label: 'Crop', icon: Crop },
        { id: 'compress', label: 'Compress', icon: Layers },
        { id: 'convert', label: 'Convert', icon: FileType },
        { id: 'filter', label: 'Filters', icon: Wand2 },
    ];

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">Image Studio</h2>

            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl relative">

                {/* Final Result Overlay */}
                {finalResult && (
                    <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-sm rounded-[2rem] flex items-center justify-center p-8 animate-fade-in">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl">
                            <div className="flex items-center justify-center bg-slate-950 rounded-xl border border-slate-800 p-4">
                                <img src={finalResult.dataUrl} alt="Final Result" className="max-w-full max-h-[400px] object-contain shadow-lg" />
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Optimization Complete!</h3>
                                    <p className="text-slate-400">Your image has been processed for <span className="text-primary-400 font-bold">{finalResult.preset.label}</span>.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                                        <span className="text-slate-500 text-sm">Dimensions</span>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                <div className="text-white font-mono font-bold">
                                                    {finalResult.preset.displayDims ? `${finalResult.preset.displayDims} ${finalResult.preset.displayUnit}` : `${finalResult.width} x ${finalResult.height} px`}
                                                </div>
                                                {finalResult.preset.displayDims && (
                                                    <div className="text-xs text-slate-500 font-mono">
                                                        ({finalResult.width} x {finalResult.height} px)
                                                    </div>
                                                )}
                                            </div>
                                            <CheckCircle size={16} className="text-emerald-500" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                                        <span className="text-slate-500 text-sm">File Size</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-mono font-bold">{(finalResult.size / 1024).toFixed(2)} KB</span>
                                            <CheckCircle size={16} className="text-emerald-500" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                                        <span className="text-slate-500 text-sm">Format</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-mono font-bold">{finalResult.preset.format === 'image/jpeg' ? 'JPG' : finalResult.preset.format === 'image/png' ? 'PNG' : finalResult.preset.format === 'image/webp' ? 'WEBP' : 'Unknown'}</span>
                                            <CheckCircle size={16} className="text-emerald-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => download(finalResult.dataUrl, `${finalResult.preset.id}-optimized`)}
                                        className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Download size={18} /> Download
                                    </button>
                                    <button
                                        onClick={() => setFinalResult(null)}
                                        className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all"
                                    >
                                        Edit Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 flex items-center justify-center min-h-[400px] relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>

                                {activeTab === 'crop' ? (
                                    <Cropper
                                        src={image}
                                        style={{ height: 400, width: '100%' }}
                                        aspectRatio={aspect}
                                        guides={true}
                                        ref={cropperRef}
                                        viewMode={1}
                                        dragMode="move"
                                        cropBoxMovable={true}
                                        cropBoxResizable={true}
                                        background={false}
                                        responsive={true}
                                        autoCropArea={0.8}
                                        checkOrientation={false}
                                    />
                                ) : (
                                    <img src={preview} alt="Preview" className="max-w-full max-h-[500px] object-contain shadow-2xl rounded-lg relative z-10" />
                                )}

                                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    {(compressedSize / 1024).toFixed(2)} KB
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {tabs.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => {
                                            if (activeTab === 'crop' && t.id !== 'crop') {
                                                handleCrop();
                                            }
                                            setActiveTab(t.id);
                                        }}
                                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                    >
                                        <t.icon size={16} /> {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="space-y-6">
                            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 h-full flex flex-col">
                                <h3 className="font-bold text-white mb-6 flex items-center gap-2 uppercase text-sm tracking-wider">
                                    {tabs.find(t => t.id === activeTab)?.icon && React.createElement(tabs.find(t => t.id === activeTab).icon, { size: 18, className: "text-primary-400" })}
                                    {tabs.find(t => t.id === activeTab)?.label} Settings
                                </h3>

                                <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar max-h-[400px] pr-2">
                                    {/* PRESETS CONTROLS */}
                                    {activeTab === 'presets' && (
                                        <div className="space-y-3">
                                            {selectedPreset && (
                                                <div className="mb-4 p-4 bg-primary-900/20 border border-primary-500/30 rounded-xl">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-primary-400 font-bold">{selectedPreset.label} Selected</span>
                                                        <button onClick={() => setSelectedPreset(null)} className="text-slate-400 hover:text-white"><Minimize2 size={14} /></button>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mb-3">Adjust the crop box on the left, then click Process to auto-optimize.</p>
                                                    <button
                                                        onClick={handleProcessPreset}
                                                        disabled={isProcessing}
                                                        className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                                                    >
                                                        {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                                                        {isProcessing ? 'Processing...' : 'Auto-Optimize Now'}
                                                    </button>
                                                </div>
                                            )}

                                            {imagePresets.map(preset => (
                                                <button
                                                    key={preset.id}
                                                    onClick={() => applyPreset(preset)}
                                                    className={`w-full p-4 border rounded-xl transition-all text-left group ${selectedPreset?.id === preset.id ? 'bg-primary-600/10 border-primary-500' : 'bg-slate-950 border-slate-800 hover:border-primary-500 hover:bg-slate-900'}`}
                                                >
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className={`font-bold transition-colors ${selectedPreset?.id === preset.id ? 'text-primary-400' : 'text-white group-hover:text-primary-400'}`}>{preset.label}</span>
                                                        <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">{preset.category}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-500">{preset.description}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* RESIZE CONTROLS */}
                                    {activeTab === 'resize' && (
                                        <>
                                            {selectedPreset && (
                                                <div className="mb-4 p-4 bg-primary-900/20 border border-primary-500/30 rounded-xl">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-primary-400 font-bold">{selectedPreset.label} Active</span>
                                                        <button onClick={handleCancelPreset} className="text-slate-500 hover:text-red-400 transition-colors" title="Cancel Preset">
                                                            <XCircle size={18} />
                                                        </button>
                                                    </div>
                                                    <div className="text-xs text-slate-400 mb-3 font-mono bg-slate-950/50 p-2 rounded border border-slate-800">
                                                        <div>Width: <span className="text-white">{selectedPreset.displayDims ? selectedPreset.displayDims.split('x')[0].trim() : selectedPreset.width} {selectedPreset.displayUnit || selectedPreset.unit || 'px'}</span></div>
                                                        <div>Height: <span className="text-white">{selectedPreset.displayDims ? selectedPreset.displayDims.split('x')[1].trim() : selectedPreset.height} {selectedPreset.displayUnit || selectedPreset.unit || 'px'}</span></div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            onClick={handleNextStep}
                                                            className="py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                                                        >
                                                            Next Step <ArrowRight size={14} />
                                                        </button>
                                                        <button
                                                            onClick={handleProcessPreset}
                                                            disabled={isProcessing}
                                                            className="py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                                                        >
                                                            {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                            {isProcessing ? 'Processing...' : 'Proceed to Final'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center mb-4">
                                                <button onClick={handleResetResize} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                                                    <RefreshCw size={12} /> Reset
                                                </button>
                                                <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex">
                                                    {['px', 'cm', 'mm', 'inch'].map(u => (
                                                        <button
                                                            key={u}
                                                            onClick={() => setUnit(u)}
                                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${unit === u ? 'bg-primary-600 text-white' : 'text-slate-500 hover:text-white'}`}
                                                        >
                                                            {u}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Width</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={fromPx(width, unit)}
                                                            onChange={(e) => handleDimChange('w', e.target.value)}
                                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono focus:border-primary-500 outline-none"
                                                        />
                                                        <span className="absolute right-3 top-3 text-xs text-slate-500">{unit}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Height</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={fromPx(height, unit)}
                                                            onChange={(e) => handleDimChange('h', e.target.value)}
                                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono focus:border-primary-500 outline-none"
                                                        />
                                                        <span className="absolute right-3 top-3 text-xs text-slate-500">{unit}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <label className="flex items-center gap-3 cursor-pointer group mt-4">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${maintainRatio ? 'bg-primary-500 border-primary-500' : 'bg-slate-950 border-slate-600'}`}>
                                                    {maintainRatio && <CheckSquare size={12} className="text-white" />}
                                                </div>
                                                <input type="checkbox" checked={maintainRatio} onChange={(e) => setMaintainRatio(e.target.checked)} className="hidden" />
                                                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Maintain Aspect Ratio</span>
                                            </label>
                                        </>
                                    )}

                                    {/* CROP CONTROLS */}
                                    {activeTab === 'crop' && (
                                        <div className="space-y-4">
                                            {selectedPreset && (
                                                <div className="mb-4 p-4 bg-primary-900/20 border border-primary-500/30 rounded-xl">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-primary-400 font-bold">{selectedPreset.label} Active</span>
                                                        <button onClick={handleCancelPreset} className="text-slate-500 hover:text-red-400 transition-colors" title="Cancel Preset">
                                                            <XCircle size={18} />
                                                        </button>
                                                    </div>
                                                    <div className="text-xs text-slate-400 mb-3 font-mono bg-slate-950/50 p-2 rounded border border-slate-800">
                                                        <div>Aspect Ratio: <span className="text-white">Locked</span></div>
                                                        <div>Crop: <span className="text-white">Manual Adjustment</span></div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            onClick={handleNextStep}
                                                            className="py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                                                        >
                                                            Next Step <ArrowRight size={14} />
                                                        </button>
                                                        <button
                                                            onClick={handleProcessPreset}
                                                            disabled={isProcessing}
                                                            className="py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                                                        >
                                                            {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                            {isProcessing ? 'Processing...' : 'Proceed to Final'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { label: 'Free', val: NaN },
                                                    { label: 'Square', val: 1 },
                                                    { label: '16:9', val: 16 / 9 },
                                                    { label: '4:3', val: 4 / 3 },
                                                    { label: '3:2', val: 3 / 2 }
                                                ].map(c => (
                                                    <button
                                                        key={c.label}
                                                        onClick={() => setAspect(c.val)}
                                                        className={`p-3 rounded-xl border text-sm font-bold transition-all ${isNaN(aspect) && isNaN(c.val) ? 'bg-primary-600 border-primary-500 text-white' : aspect === c.val ? 'bg-primary-600 border-primary-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                                                    >
                                                        {c.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-xs text-slate-500">Drag on the image to crop. Select a preset to lock aspect ratio.</p>
                                            <button
                                                onClick={handleResetCrop}
                                                className="w-full py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <RefreshCw size={14} /> Reset Crop
                                            </button>
                                            <button
                                                onClick={handleCrop}
                                                className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-500 transition-all"
                                            >
                                                Apply Crop
                                            </button>
                                        </div>
                                    )}

                                    {/* COMPRESS CONTROLS */}
                                    {activeTab === 'compress' && (
                                        <>
                                            {selectedPreset && (
                                                <div className="mb-4 p-4 bg-primary-900/20 border border-primary-500/30 rounded-xl">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-primary-400 font-bold">{selectedPreset.label} Active</span>
                                                        <button onClick={handleCancelPreset} className="text-slate-500 hover:text-red-400 transition-colors" title="Cancel Preset">
                                                            <XCircle size={18} />
                                                        </button>
                                                    </div>
                                                    <div className="text-xs text-slate-400 mb-3 font-mono bg-slate-950/50 p-2 rounded border border-slate-800">
                                                        <div>Max Size: <span className="text-white">{selectedPreset.maxSize} KB</span></div>
                                                        <div>Min Size: <span className="text-white">{selectedPreset.minSize} KB</span></div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            onClick={handleNextStep}
                                                            className="py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                                                        >
                                                            Next Step <ArrowRight size={14} />
                                                        </button>
                                                        <button
                                                            onClick={handleProcessPreset}
                                                            disabled={isProcessing}
                                                            className="py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                                                        >
                                                            {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                            {isProcessing ? 'Processing...' : 'Proceed to Final'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="mb-2 flex justify-between items-end">
                                                <span className="text-xs font-bold text-slate-500 uppercase">Quality</span>
                                                <div className="flex items-center gap-4">
                                                    <button onClick={handleResetCompress} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                                                        <RefreshCw size={12} /> Reset
                                                    </button>
                                                    <span className="text-primary-400 font-bold">{quality}%</span>
                                                </div>
                                            </div>
                                            <input type="range" min="1" max="100" value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500 mb-6" />

                                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Original</span>
                                                    <span className="text-white font-mono">{(originalSize / 1024).toFixed(2)} KB</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">New (Est.)</span>
                                                    <span className={`font-mono ${targetSize && (compressedSize / 1024) > targetSize ? 'text-red-400' : 'text-emerald-400'}`}>
                                                        {(compressedSize / 1024).toFixed(2)} KB
                                                    </span>
                                                </div>
                                                {targetSize && (
                                                    <div className="flex items-center gap-2 text-xs pt-2 border-t border-slate-800 mt-2">
                                                        {(compressedSize / 1024) > targetSize ? (
                                                            <>
                                                                <AlertCircle size={14} className="text-red-400" />
                                                                <span className="text-red-400">Exceeds limit ({targetSize} KB)</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckSquare size={14} className="text-emerald-400" />
                                                                <span className="text-emerald-400">Within limit ({targetSize} KB)</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-sm pt-2 border-t border-slate-800">
                                                    <span className="text-slate-500">Saved</span>
                                                    <span className="text-primary-400 font-mono">{Math.max(0, ((originalSize - compressedSize) / originalSize * 100)).toFixed(0)}%</span>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* CONVERT CONTROLS */}
                                    {activeTab === 'convert' && (
                                        <div className="space-y-3">
                                            {selectedPreset && (
                                                <div className="mb-4 p-4 bg-primary-900/20 border border-primary-500/30 rounded-xl">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-primary-400 font-bold">{selectedPreset.label} Active</span>
                                                        <button onClick={handleCancelPreset} className="text-slate-500 hover:text-red-400 transition-colors" title="Cancel Preset">
                                                            <XCircle size={18} />
                                                        </button>
                                                    </div>
                                                    <div className="text-xs text-slate-400 mb-3 font-mono bg-slate-950/50 p-2 rounded border border-slate-800">
                                                        <div>Format: <span className="text-white">{selectedPreset.format?.split('/')[1]?.toUpperCase()}</span></div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            onClick={handleNextStep}
                                                            className="py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                                                        >
                                                            Next Step <ArrowRight size={14} />
                                                        </button>
                                                        <button
                                                            onClick={handleProcessPreset}
                                                            disabled={isProcessing}
                                                            className="py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                                                        >
                                                            {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                            {isProcessing ? 'Processing...' : 'Proceed to Final'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex justify-end mb-2">
                                                <button onClick={handleResetConvert} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                                                    <RefreshCw size={12} /> Reset Format
                                                </button>
                                            </div>
                                            {['image/jpeg', 'image/png', 'image/webp'].map(f => (
                                                <button
                                                    key={f}
                                                    onClick={() => setFormat(f)}
                                                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${format === f ? 'bg-primary-600/20 border-primary-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                                                >
                                                    <span className="font-bold uppercase">{f.split('/')[1]}</span>
                                                    {format === f && <CheckSquare size={16} className="text-primary-400" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* FILTER CONTROLS */}
                                    {activeTab === 'filter' && (
                                        <div className="space-y-4">
                                            {selectedPreset && (
                                                <div className="mb-4 p-4 bg-primary-900/20 border border-primary-500/30 rounded-xl">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-primary-400 font-bold">{selectedPreset.label} Active</span>
                                                        <button onClick={handleCancelPreset} className="text-slate-500 hover:text-red-400 transition-colors" title="Cancel Preset">
                                                            <XCircle size={18} />
                                                        </button>
                                                    </div>
                                                    <div className="text-xs text-slate-400 mb-3 font-mono bg-slate-950/50 p-2 rounded border border-slate-800">
                                                        <div>Filter: <span className="text-white capitalize">{selectedPreset.filter}</span></div>
                                                    </div>
                                                    <button
                                                        onClick={handleProcessPreset}
                                                        disabled={isProcessing}
                                                        className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                                                    >
                                                        {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                        {isProcessing ? 'Processing...' : 'Finish & Process'}
                                                    </button>
                                                </div>
                                            )}
                                            <div className="flex justify-end mb-2">
                                                <button onClick={handleResetFilter} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                                                    <RefreshCw size={12} /> Reset Filter
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['none', 'grayscale', 'sepia', 'invert'].map(f => (
                                                    <button
                                                        key={f}
                                                        onClick={() => setFilter(f)}
                                                        className={`p-2 rounded-lg border text-xs font-bold capitalize transition-all ${filter === f ? 'bg-primary-600 border-primary-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                                                    >
                                                        {f}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1 text-slate-500"><span>Brightness</span><span>{brightness}%</span></div>
                                                    <input type="range" min="0" max="200" value={brightness} onChange={(e) => setBrightness(e.target.value)} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1 text-slate-500"><span>Contrast</span><span>{contrast}%</span></div>
                                                    <input type="range" min="0" max="200" value={contrast} onChange={(e) => setContrast(e.target.value)} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1 text-slate-500"><span>Saturation</span><span>{saturation}%</span></div>
                                                    <input type="range" min="0" max="200" value={saturation} onChange={(e) => setSaturation(e.target.value)} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1 text-slate-500"><span>Blur</span><span>{blur}px</span></div>
                                                    <input type="range" min="0" max="10" value={blur} onChange={(e) => setBlur(e.target.value)} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 mt-6 border-t border-slate-800 flex gap-3">
                                    <button onClick={() => download()} className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2 active:scale-95">
                                        <Download size={18} /> Download
                                    </button>
                                    <button onClick={() => setImage(null)} className="px-4 py-3 bg-slate-800 text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 border border-transparent rounded-xl font-bold transition-all active:scale-95">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
};

export default ImageStudio;
