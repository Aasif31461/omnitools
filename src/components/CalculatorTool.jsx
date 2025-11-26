import React, { useState } from 'react';
import { History, X } from 'lucide-react';

const CalculatorTool = () => {
    const [display, setDisplay] = useState('0');
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const handleInput = (val) => {
        setDisplay(prev => prev === '0' || prev === 'Error' ? val : prev + val);
    };

    const clear = () => setDisplay('0');

    const calculate = () => {
        try {
            if (/[^0-9+\-*/.()]/.test(display)) throw new Error('Invalid');
            // eslint-disable-next-line no-new-func
            let res = new Function('return ' + display)();
            if (!isFinite(res) || isNaN(res)) throw new Error('Error');
            res = parseFloat(res.toPrecision(12));
            let displayVal = res.toString();
            if (Math.abs(res) > 1e9 || (Math.abs(res) < 1e-6 && res !== 0)) {
                displayVal = res.toExponential(4);
            }
            setHistory(prev => [{ eq: display, res: displayVal }, ...prev].slice(0, 20));
            setDisplay(displayVal);
        } catch (e) {
            setDisplay('Error');
        }
    };

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-lg mx-auto relative">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">Calculator</h2>

            <div className="bg-slate-900 rounded-[2rem] p-6 shadow-2xl border border-slate-800 relative overflow-hidden">
                {/* History Toggle */}
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="absolute top-6 left-6 p-2 text-slate-500 hover:text-white transition-colors z-10"
                >
                    <History size={20} />
                </button>

                {/* Display */}
                <div className="mb-6 px-4 py-8 bg-slate-950 rounded-2xl text-right relative overflow-hidden mt-8">
                    <div className="text-slate-500 text-sm h-6 mb-1 font-mono overflow-hidden text-ellipsis whitespace-nowrap">{history.length > 0 ? `${history[0].eq} =` : ''}</div>
                    <input type="text" readOnly value={display} className="w-full bg-transparent text-5xl font-light text-white focus:outline-none overflow-x-auto text-right" />
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-4 gap-3">
                    <button onClick={clear} className="aspect-square rounded-full bg-slate-700 text-red-400 font-bold text-xl hover:bg-slate-600 active:scale-95 transition-all">AC</button>
                    <button onClick={() => handleInput('(')} className="aspect-square rounded-full bg-slate-800 text-primary-400 font-bold text-xl hover:bg-slate-700 active:scale-95 transition-all">(</button>
                    <button onClick={() => handleInput(')')} className="aspect-square rounded-full bg-slate-800 text-primary-400 font-bold text-xl hover:bg-slate-700 active:scale-95 transition-all">)</button>
                    <button onClick={() => handleInput('/')} className="aspect-square rounded-full bg-amber-500 text-white font-bold text-2xl hover:bg-amber-400 active:scale-95 transition-all">÷</button>

                    {['7', '8', '9'].map(n => <button key={n} onClick={() => handleInput(n)} className="aspect-square rounded-full bg-slate-800 text-white font-medium text-2xl hover:bg-slate-700 active:scale-95 transition-all">{n}</button>)}
                    <button onClick={() => handleInput('*')} className="aspect-square rounded-full bg-amber-500 text-white font-bold text-2xl hover:bg-amber-400 active:scale-95 transition-all">×</button>

                    {['4', '5', '6'].map(n => <button key={n} onClick={() => handleInput(n)} className="aspect-square rounded-full bg-slate-800 text-white font-medium text-2xl hover:bg-slate-700 active:scale-95 transition-all">{n}</button>)}
                    <button onClick={() => handleInput('-')} className="aspect-square rounded-full bg-amber-500 text-white font-bold text-2xl hover:bg-amber-400 active:scale-95 transition-all">−</button>

                    {['1', '2', '3'].map(n => <button key={n} onClick={() => handleInput(n)} className="aspect-square rounded-full bg-slate-800 text-white font-medium text-2xl hover:bg-slate-700 active:scale-95 transition-all">{n}</button>)}
                    <button onClick={() => handleInput('+')} className="aspect-square rounded-full bg-amber-500 text-white font-bold text-2xl hover:bg-amber-400 active:scale-95 transition-all">+</button>

                    <button onClick={() => handleInput('0')} className="col-span-2 aspect-[2/1] rounded-full bg-slate-800 text-white font-medium text-2xl hover:bg-slate-700 active:scale-95 transition-all flex items-center pl-8">0</button>
                    <button onClick={() => handleInput('.')} className="aspect-square rounded-full bg-slate-800 text-white font-medium text-2xl hover:bg-slate-700 active:scale-95 transition-all">.</button>
                    <button onClick={calculate} className="aspect-square rounded-full bg-primary-600 text-white font-bold text-2xl hover:bg-primary-500 active:scale-95 transition-all shadow-lg shadow-primary-600/30">=</button>
                </div>

                {/* History Overlay */}
                {showHistory && (
                    <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-20 flex flex-col p-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><History size={18} /> History</h3>
                            <button onClick={() => setShowHistory(false)} className="p-2 text-slate-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                            {history.length === 0 ? (
                                <div className="text-center text-slate-500 mt-10 italic">No calculations yet</div>
                            ) : (
                                history.map((item, idx) => (
                                    <div key={idx} className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                                        <div className="text-slate-400 text-sm text-right mb-1">{item.eq}</div>
                                        <div className="text-emerald-400 text-xl font-bold text-right">= {item.res}</div>
                                    </div>
                                ))
                            )}
                        </div>
                        <button onClick={() => setHistory([])} className="mt-4 w-full py-3 bg-slate-800 text-red-400 rounded-xl font-bold hover:bg-slate-700 transition-colors">Clear History</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalculatorTool;
