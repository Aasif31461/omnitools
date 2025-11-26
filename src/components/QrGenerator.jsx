import React, { useState } from 'react';
import { Download } from 'lucide-react';

const QrGenerator = () => {
    const [text, setText] = useState('https://example.com');
    const [size, setSize] = useState(200);

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=ffffff&color=000000&margin=10`;

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">QR Generator</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl flex flex-col h-full">
                    <div className="flex-1 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Content (URL or Text)</label>
                            <textarea
                                value={text}
                                onChange={e => setText(e.target.value)}
                                className="w-full h-40 bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white focus:border-primary-500 outline-none resize-none transition-all placeholder:text-slate-700"
                                placeholder="Enter text to encode..."
                            ></textarea>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">
                                <span>Size</span>
                                <span className="text-white">{size}px</span>
                            </div>
                            <input
                                type="range"
                                min="100"
                                max="500"
                                step="10"
                                value={size}
                                onChange={e => setSize(e.target.value)}
                                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl flex flex-col items-center justify-center h-full">
                    <div className="bg-white p-4 rounded-2xl shadow-2xl mb-8">
                        {text ? (
                            <img
                                src={qrUrl}
                                alt="QR Code"
                                className="object-contain"
                                style={{ width: size, height: size, maxWidth: '100%' }}
                            />
                        ) : (
                            <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-sm font-medium italic bg-slate-50 rounded-xl">
                                Enter text to generate
                            </div>
                        )}
                    </div>
                    <a
                        href={qrUrl}
                        download="qrcode.png"
                        target="_blank"
                        rel="noreferrer"
                        className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-all shadow-lg flex items-center gap-2"
                    >
                        <Download size={20} /> Download PNG
                    </a>
                </div>
            </div>
        </div>
    );
};

export default QrGenerator;
