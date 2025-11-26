import React, { useState, useEffect } from 'react';
import { RefreshCw, Copy, CheckSquare } from 'lucide-react';

const PasswordGenerator = ({ showToast }) => {
    const [length, setLength] = useState(12);
    const [includeUpper, setIncludeUpper] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [password, setPassword] = useState('');
    const [strength, setStrength] = useState(0);

    const generate = () => {
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nums = '0123456789';
        const syms = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let chars = lower;
        if (includeUpper) chars += upper;
        if (includeNumbers) chars += nums;
        if (includeSymbols) chars += syms;

        let pass = '';
        for (let i = 0; i < length; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(pass);
        calcStrength(pass);
    };

    const calcStrength = (pass) => {
        let score = 0;
        if (pass.length > 8) score++;
        if (pass.length > 12) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        setStrength(score); // Max 5
    };

    useEffect(() => { generate(); }, []);

    const copy = (text) => {
        navigator.clipboard.writeText(text);
        showToast('Copied!');
    };

    const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-emerald-500'];

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">Password Vault</h2>

            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl space-y-8">
                {/* Display Section */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-purple-500"></div>
                    <span className="font-mono text-2xl md:text-3xl text-white break-all tracking-wider mr-4">{password}</span>
                    <div className="flex gap-2 shrink-0">
                        <button onClick={generate} className="p-3 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all" title="Regenerate"><RefreshCw size={20} /></button>
                        <button onClick={() => copy(password)} className="p-3 text-primary-400 hover:text-white bg-primary-500/10 hover:bg-primary-500 rounded-xl transition-all" title="Copy"><Copy size={20} /></button>
                    </div>
                </div>

                {/* Strength Meter */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <span>Strength</span>
                        <span className={`${strength > 0 ? strengthColors[strength - 1].replace('bg-', 'text-') : 'text-slate-500'}`}>{strengthLabels[Math.min(strength, 4)]}</span>
                    </div>
                    <div className="flex gap-1.5 h-2">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className={`flex-1 rounded-full transition-all duration-500 ${i < strength ? strengthColors[Math.min(strength - 1, 4)] : 'bg-slate-800'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Controls */}
                <div className="space-y-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50">
                    <div>
                        <div className="flex justify-between text-sm text-slate-400 mb-3 font-bold uppercase tracking-wider">
                            <span>Length</span>
                            <span className="text-white">{length}</span>
                        </div>
                        <input
                            type="range"
                            min="6"
                            max="32"
                            value={length}
                            onChange={(e) => setLength(parseInt(e.target.value))}
                            className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <label className="flex items-center gap-3 p-4 bg-slate-950 rounded-xl cursor-pointer border border-slate-800 hover:border-primary-500/50 transition-all group">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${includeUpper ? 'bg-primary-500 border-primary-500' : 'bg-slate-900 border-slate-700'}`}>
                                {includeUpper && <CheckSquare size={14} className="text-white" />}
                            </div>
                            <input type="checkbox" checked={includeUpper} onChange={e => setIncludeUpper(e.target.checked)} className="hidden" />
                            <span className="text-sm font-bold text-slate-300 group-hover:text-white">Uppercase</span>
                        </label>

                        <label className="flex items-center gap-3 p-4 bg-slate-950 rounded-xl cursor-pointer border border-slate-800 hover:border-primary-500/50 transition-all group">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${includeNumbers ? 'bg-primary-500 border-primary-500' : 'bg-slate-900 border-slate-700'}`}>
                                {includeNumbers && <CheckSquare size={14} className="text-white" />}
                            </div>
                            <input type="checkbox" checked={includeNumbers} onChange={e => setIncludeNumbers(e.target.checked)} className="hidden" />
                            <span className="text-sm font-bold text-slate-300 group-hover:text-white">Numbers</span>
                        </label>

                        <label className="flex items-center gap-3 p-4 bg-slate-950 rounded-xl cursor-pointer border border-slate-800 hover:border-primary-500/50 transition-all group">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${includeSymbols ? 'bg-primary-500 border-primary-500' : 'bg-slate-900 border-slate-700'}`}>
                                {includeSymbols && <CheckSquare size={14} className="text-white" />}
                            </div>
                            <input type="checkbox" checked={includeSymbols} onChange={e => setIncludeSymbols(e.target.checked)} className="hidden" />
                            <span className="text-sm font-bold text-slate-300 group-hover:text-white">Symbols</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasswordGenerator;
