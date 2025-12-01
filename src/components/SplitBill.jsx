import React, { useState } from 'react';
import { Receipt } from 'lucide-react';
import { getCurrencySymbol } from '../utils/currency';

const SplitBill = () => {
    const [bill, setBill] = useState(1000);
    const [people, setPeople] = useState(4);
    const [tip, setTip] = useState(10);
    const currency = getCurrencySymbol(); // Dynamic currency

    const tipAmount = (bill * tip) / 100;
    const total = bill + tipAmount;
    const perPerson = total / people;

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">Quick Split</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bill Amount</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-3.5 text-slate-500 font-medium group-focus-within:text-primary-500 transition-colors">{currency}</span>
                            <input
                                type="number"
                                value={bill}
                                onChange={e => setBill(parseFloat(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2">
                            <span>Tip %</span>
                            <span className="text-white">{tip}%</span>
                        </div>
                        <input type="range" min="0" max="50" value={tip} onChange={e => setTip(parseInt(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                        <div className="flex justify-between mt-2">
                            {[0, 10, 15, 20].map(t => (
                                <button key={t} onClick={() => setTip(t)} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${tip === t ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>{t}%</button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2">
                            <span>People</span>
                            <span className="text-white">{people}</span>
                        </div>
                        <input type="range" min="1" max="20" value={people} onChange={e => setPeople(parseInt(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl flex flex-col justify-center">
                    <div className="text-center mb-8">
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total per Person</div>
                        <div className="text-5xl font-bold text-white tracking-tight">{currency}{perPerson.toFixed(2)}</div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                            <span className="text-sm text-slate-400">Bill</span>
                            <span className="text-white font-mono">{currency}{bill.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                            <span className="text-sm text-slate-400">Tip ({tip}%)</span>
                            <span className="text-emerald-400 font-mono">+{currency}{tipAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl border border-slate-700">
                            <span className="text-sm font-bold text-white">Total</span>
                            <span className="text-xl font-bold text-white font-mono">{currency}{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SplitBill;
