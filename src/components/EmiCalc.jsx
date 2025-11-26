import React, { useState } from 'react';

const EmiCalc = () => {
    const [principal, setPrincipal] = useState(500000);
    const [rate, setRate] = useState(10);
    const [years, setYears] = useState(5);
    const currency = '$'; // Default currency

    const r = rate / 12 / 100;
    const n = years * 12;

    const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalAmount = emi * n;
    const totalInterest = totalAmount - principal;

    const principalPct = (principal / totalAmount) * 100;
    const interestPct = 100 - principalPct;

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">EMI Calculator</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl space-y-6">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Loan Amount: <span className="text-white font-mono">{currency}{principal.toLocaleString()}</span></label>
                        <input type="range" min="10000" max="10000000" step="10000" value={principal} onChange={(e) => setPrincipal(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Interest Rate (%): <span className="text-white font-mono">{rate}%</span></label>
                        <input type="range" min="1" max="30" step="0.1" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Tenure (Years): <span className="text-white font-mono">{years} Yr</span></label>
                        <input type="range" min="1" max="30" step="1" value={years} onChange={(e) => setYears(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                    </div>

                    <div className="mt-8">
                        <h4 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Breakdown</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-slate-800 p-4 rounded-xl">
                                <div className="text-xs text-slate-500 mb-1">Monthly EMI</div>
                                <div className="text-xl font-bold text-emerald-400">{currency}{Math.round(emi).toLocaleString()}</div>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-xl">
                                <div className="text-xs text-slate-500 mb-1">Total Interest</div>
                                <div className="text-xl font-bold text-pink-500">{currency}{Math.round(totalInterest).toLocaleString()}</div>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-xl">
                                <div className="text-xs text-slate-500 mb-1">Total Payable</div>
                                <div className="text-xl font-bold text-white">{currency}{Math.round(totalAmount).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center">
                    <div className="relative w-48 h-48 rounded-full mb-6" style={{ background: `conic-gradient(#6366f1 0% ${principalPct}%, #ec4899 ${principalPct}% 100%)` }}>
                        <div className="absolute inset-4 bg-slate-900 rounded-full flex items-center justify-center flex-col">
                            <span className="text-xs text-slate-500">Total</span>
                            <span className="text-sm font-bold text-white">{currency}{(totalAmount / 100000).toFixed(2)}L</span>
                        </div>
                    </div>
                    <div className="w-full space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-500"></span> Principal</span>
                            <span className="text-white">{Math.round(principalPct)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-pink-500"></span> Interest</span>
                            <span className="text-white">{Math.round(interestPct)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmiCalc;
