import React, { useState } from 'react';
import { Tag, Calculator } from 'lucide-react';
import { getCurrencySymbol } from '../utils/currency';

const RateCalc = () => {
    const [basePrice, setBasePrice] = useState(100);
    const [baseQty, setBaseQty] = useState(1);
    const [baseUnit, setBaseUnit] = useState('kg');
    const [mode, setMode] = useState('price'); // price or qty
    const [targetQty, setTargetQty] = useState(800);
    const [targetUnit, setTargetUnit] = useState('g');
    const [budget, setBudget] = useState(50);
    const currency = getCurrencySymbol(); // Dynamic currency

    const getMultiplier = (unit) => (unit === 'kg' || unit === 'l') ? 1000 : 1;

    const calculate = () => {
        const baseGrams = parseFloat(baseQty) * getMultiplier(baseUnit);
        const pricePerGram = parseFloat(basePrice) / baseGrams;
        if (!pricePerGram || !isFinite(pricePerGram)) return { price: 0, qty: 0 };
        if (mode === 'price') {
            const targetGrams = parseFloat(targetQty) * getMultiplier(targetUnit);
            return { price: (pricePerGram * targetGrams).toFixed(2) };
        } else {
            const grams = parseFloat(budget) / pricePerGram;
            return { qty: grams >= 1000 ? `${(grams / 1000).toFixed(3)} kg` : `${grams.toFixed(0)} g` };
        }
    };
    const result = calculate();

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">Rate Calculator</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Step 1: Define Base Rate */}
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500"><Tag size={20} /></div>
                        <h3 className="text-lg font-bold text-white">Base Rate</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">If Price is</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-3.5 text-slate-500 font-medium group-focus-within:text-pink-500 transition-colors">{currency}</span>
                                <input
                                    type="number"
                                    value={basePrice}
                                    onChange={e => setBasePrice(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-pink-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">For Quantity</label>
                            <div className="flex gap-3">
                                <input
                                    type="number"
                                    value={baseQty}
                                    onChange={e => setBaseQty(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-pink-500 outline-none transition-all"
                                />
                                <select
                                    value={baseUnit}
                                    onChange={e => setBaseUnit(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 text-white outline-none focus:border-pink-500 cursor-pointer"
                                >
                                    <option value="kg" className="bg-slate-800 text-white">kg</option>
                                    <option value="g" className="bg-slate-800 text-white">g</option>
                                    <option value="l" className="bg-slate-800 text-white">L</option>
                                    <option value="ml" className="bg-slate-800 text-white">ml</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step 2: Calculate Target */}
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400"><Calculator size={20} /></div>
                        <h3 className="text-lg font-bold text-white">Calculate</h3>
                    </div>

                    <div className="bg-slate-950 p-1.5 rounded-xl flex mb-8 border border-slate-800">
                        <button
                            onClick={() => setMode('price')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'price' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Find Price
                        </button>
                        <button
                            onClick={() => setMode('qty')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'qty' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Find Quantity
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                        {mode === 'price' ? (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Cost for Quantity</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="number"
                                            value={targetQty}
                                            onChange={e => setTargetQty(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-primary-500 outline-none transition-all"
                                        />
                                        <select
                                            value={targetUnit}
                                            onChange={e => setTargetUnit(e.target.value)}
                                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 text-white outline-none focus:border-primary-500 cursor-pointer"
                                        >
                                            <option value="kg" className="bg-slate-800 text-white">kg</option>
                                            <option value="g" className="bg-slate-800 text-white">g</option>
                                            <option value="l" className="bg-slate-800 text-white">L</option>
                                            <option value="ml" className="bg-slate-800 text-white">ml</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 flex justify-between items-center">
                                    <span className="text-slate-400 font-medium">You Pay</span>
                                    <span className="text-3xl font-bold text-emerald-400">{currency}{result.price}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Quantity for Budget</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-3.5 text-slate-500 font-medium group-focus-within:text-primary-500 transition-colors">{currency}</span>
                                        <input
                                            type="number"
                                            value={budget}
                                            onChange={e => setBudget(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 flex justify-between items-center">
                                    <span className="text-slate-400 font-medium">You Get</span>
                                    <span className="text-3xl font-bold text-primary-400">{result.qty}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RateCalc;
