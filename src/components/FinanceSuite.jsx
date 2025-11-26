import React, { useState } from 'react';
import { Receipt, Tag, TrendingUp, Landmark } from 'lucide-react';

const FinanceSuite = () => {
    const [tab, setTab] = useState('gst');
    const currency = '$'; // Default currency

    // GST
    const [gstPrice, setGstPrice] = useState(1000);
    const [gstRate, setGstRate] = useState(18);
    const [gstType, setGstType] = useState('exclusive'); // exclusive or inclusive

    const calculateGst = () => {
        const price = parseFloat(gstPrice) || 0;
        const rate = parseFloat(gstRate) || 0;

        if (gstType === 'exclusive') {
            const tax = price * (rate / 100);
            return { net: price, tax: tax, total: price + tax };
        } else {
            const tax = price - (price * (100 / (100 + rate)));
            return { net: price - tax, tax: tax, total: price };
        }
    };

    const gstResult = calculateGst();

    // Discount
    const [discPrice, setDiscPrice] = useState(5000);
    const [discRate, setDiscRate] = useState(20);
    const discAmt = discPrice * (discRate / 100);
    const finalPrice = discPrice - discAmt;

    // SIP
    const [sipAmount, setSipAmount] = useState(5000);
    const [sipRate, setSipRate] = useState(12);
    const [sipYears, setSipYears] = useState(10);

    const calculateSip = () => {
        const monthlyRate = sipRate / 12 / 100;
        const months = sipYears * 12;
        const invested = sipAmount * months;

        if (sipRate === 0) return { invested, returns: 0, total: invested };

        const total = sipAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
        const returns = total - invested;

        return { invested, returns, total };
    };

    const sipResult = calculateSip();

    const setSipTemplate = (type) => {
        switch (type) {
            case 'fd': setSipRate(7); break;
            case 'gold': setSipRate(10); break;
            case 'nifty': setSipRate(12); break;
            case 'high': setSipRate(15); break;
            default: break;
        }
    };

    // Income Tax
    const [salary, setSalary] = useState(1200000);
    const [regime, setRegime] = useState('new'); // 'new' or 'old'
    const [deductions, setDeductions] = useState(0); // 80C etc for Old

    // Profit & Margin
    const [profitMode, setProfitMode] = useState('find_margin'); // find_margin, find_sp, find_cp
    const [cp, setCp] = useState(100);
    const [sp, setSp] = useState(125);
    const [margin, setMargin] = useState(20);

    const calculateProfit = () => {
        let resCp = parseFloat(cp) || 0;
        let resSp = parseFloat(sp) || 0;
        let resMargin = parseFloat(margin) || 0;
        let profit = 0;
        let markup = 0;

        if (profitMode === 'find_margin') {
            profit = resSp - resCp;
            resMargin = resSp !== 0 ? (profit / resSp) * 100 : 0;
            markup = resCp !== 0 ? (profit / resCp) * 100 : 0;
        } else if (profitMode === 'find_sp') {
            // SP = CP / (1 - Margin%)
            resSp = resCp / (1 - (resMargin / 100));
            profit = resSp - resCp;
            markup = resCp !== 0 ? (profit / resCp) * 100 : 0;
        } else if (profitMode === 'find_cp') {
            // CP = SP * (1 - Margin%)
            resCp = resSp * (1 - (resMargin / 100));
            profit = resSp - resCp;
            markup = resCp !== 0 ? (profit / resCp) * 100 : 0;
        }

        return { cp: resCp, sp: resSp, margin: resMargin, profit, markup };
    };

    const profitRes = calculateProfit();

    const calculateTax = () => {
        const stdDed = regime === 'new' ? 75000 : 50000;
        let taxable = Math.max(0, salary - stdDed - (regime === 'old' ? deductions : 0));

        let tax = 0;
        const breakdown = [];

        if (regime === 'new') {
            // New Regime FY 24-25
            if (taxable <= 300000) {
                breakdown.push({ range: '0 - 3L', rate: '0%', amt: 0 });
            } else {
                breakdown.push({ range: '0 - 3L', rate: '0%', amt: 0 });

                if (taxable > 300000) {
                    const slab = Math.min(taxable, 700000) - 300000;
                    const t = slab * 0.05;
                    tax += t;
                    breakdown.push({ range: '3L - 7L', rate: '5%', amt: t });
                }
                if (taxable > 700000) {
                    const slab = Math.min(taxable, 1000000) - 700000;
                    const t = slab * 0.10;
                    tax += t;
                    breakdown.push({ range: '7L - 10L', rate: '10%', amt: t });
                }
                if (taxable > 1000000) {
                    const slab = Math.min(taxable, 1200000) - 1000000;
                    const t = slab * 0.15;
                    tax += t;
                    breakdown.push({ range: '10L - 12L', rate: '15%', amt: t });
                }
                if (taxable > 1200000) {
                    const slab = Math.min(taxable, 1500000) - 1200000;
                    const t = slab * 0.20;
                    tax += t;
                    breakdown.push({ range: '12L - 15L', rate: '20%', amt: t });
                }
                if (taxable > 1500000) {
                    const slab = taxable - 1500000;
                    const t = slab * 0.30;
                    tax += t;
                    breakdown.push({ range: '15L+', rate: '30%', amt: t });
                }
            }
            // Rebate 87A for New Regime (Income up to 7L)
            if (taxable <= 700000) tax = 0;

        } else {
            // Old Regime (Approx)
            if (taxable <= 250000) {
                breakdown.push({ range: '0 - 2.5L', rate: '0%', amt: 0 });
            } else {
                breakdown.push({ range: '0 - 2.5L', rate: '0%', amt: 0 });

                if (taxable > 250000) {
                    const slab = Math.min(taxable, 500000) - 250000;
                    const t = slab * 0.05;
                    tax += t;
                    breakdown.push({ range: '2.5L - 5L', rate: '5%', amt: t });
                }
                if (taxable > 500000) {
                    const slab = Math.min(taxable, 1000000) - 500000;
                    const t = slab * 0.20;
                    tax += t;
                    breakdown.push({ range: '5L - 10L', rate: '20%', amt: t });
                }
                if (taxable > 1000000) {
                    const slab = taxable - 1000000;
                    const t = slab * 0.30;
                    tax += t;
                    breakdown.push({ range: '> 10L', rate: '30%', amt: t });
                }
            }
            // Rebate 87A for Old Regime (Income up to 5L)
            if (taxable <= 500000) tax = 0;
        }

        const cess = tax * 0.04;
        return { taxable, tax, cess, total: tax + cess, breakdown, stdDed };
    };

    const taxRes = calculateTax();

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">Finance Suite</h2>

            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
                {/* Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 gap-2 overflow-x-auto">
                    {[
                        { id: 'gst', label: 'GST Calculator', icon: Receipt },
                        { id: 'discount', label: 'Discount', icon: Tag },
                        { id: 'profit', label: 'Profit & Margin', icon: TrendingUp },
                        { id: 'sip', label: 'SIP Calculator', icon: TrendingUp },
                        { id: 'tax', label: 'Income Tax', icon: Landmark }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${tab === t.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        >
                            <t.icon size={18} /> {t.label}
                        </button>
                    ))}
                </div>

                <div className="p-8 bg-slate-900/30 min-h-[400px]">
                    {tab === 'gst' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full">
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-4 text-slate-500 font-bold">{currency}</span>
                                        <input
                                            type="number"
                                            value={gstPrice}
                                            onChange={e => setGstPrice(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-10 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">GST Rate ({gstRate}%)</label>
                                    <div className="flex gap-2 mb-4">
                                        {[5, 12, 18, 28].map(r => (
                                            <button
                                                key={r}
                                                onClick={() => setGstRate(r)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${gstRate === r ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                                            >
                                                {r}%
                                            </button>
                                        ))}
                                    </div>
                                    <input type="range" min="0" max="50" value={gstRate} onChange={e => setGstRate(e.target.value)} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                                </div>

                                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                                    <button onClick={() => setGstType('exclusive')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gstType === 'exclusive' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Exclusive (Add Tax)</button>
                                    <button onClick={() => setGstType('inclusive')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gstType === 'inclusive' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Inclusive (Remove Tax)</button>
                                </div>
                            </div>

                            <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                                <div className="space-y-6 relative z-10">
                                    <div className="flex justify-between items-center pb-6 border-b border-slate-800">
                                        <span className="text-slate-400 font-medium">Net Amount</span>
                                        <span className="text-xl text-white font-mono">{currency}{gstResult.net.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-6 border-b border-slate-800">
                                        <span className="text-slate-400 font-medium">GST ({gstRate}%)</span>
                                        <span className="text-xl text-red-400 font-mono">+{currency}{gstResult.tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-slate-300 font-bold text-lg">Total Amount</span>
                                        <span className="text-4xl text-emerald-400 font-bold font-mono">{currency}{gstResult.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'discount' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full">
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Original Price</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-4 text-slate-500 font-bold">{currency}</span>
                                        <input
                                            type="number"
                                            value={discPrice}
                                            onChange={e => setDiscPrice(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-10 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Discount ({discRate}%)</label>
                                    <div className="flex gap-2 mb-4">
                                        {[10, 20, 30, 50, 70].map(r => (
                                            <button
                                                key={r}
                                                onClick={() => setDiscRate(r)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${discRate === r ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                                            >
                                                {r}%
                                            </button>
                                        ))}
                                    </div>
                                    <input type="range" min="0" max="100" value={discRate} onChange={e => setDiscRate(e.target.value)} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-8 text-center shadow-lg relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                    <div className="relative z-10 text-white">
                                        <div className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">You Pay</div>
                                        <div className="text-5xl font-bold mb-2">{currency}{finalPrice.toFixed(2)}</div>
                                        <div className="text-sm opacity-90">After {discRate}% discount</div>
                                    </div>
                                </div>

                                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex justify-between items-center">
                                    <span className="text-slate-400 font-medium">You Save</span>
                                    <span className="text-2xl font-bold text-emerald-400">{currency}{discAmt.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'sip' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full">
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Monthly Investment</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-4 text-slate-500 font-bold">{currency}</span>
                                        <input
                                            type="number"
                                            value={sipAmount}
                                            onChange={e => setSipAmount(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-10 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Expected Return Rate (p.a)</label>
                                    <div className="flex gap-2 mb-4">
                                        {[
                                            { l: 'FD', v: 7, k: 'fd' },
                                            { l: 'Gold', v: 10, k: 'gold' },
                                            { l: 'Nifty', v: 12, k: 'nifty' },
                                            { l: 'High', v: 15, k: 'high' }
                                        ].map(t => (
                                            <button
                                                key={t.k}
                                                onClick={() => setSipTemplate(t.k)}
                                                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${sipRate === t.v ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                                            >
                                                {t.l} ({t.v}%)
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <input type="range" min="1" max="30" value={sipRate} onChange={e => setSipRate(e.target.value)} className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                                        <span className="text-white font-mono font-bold w-12 text-right">{sipRate}%</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Time Period</label>
                                    <div className="flex items-center gap-4">
                                        <input type="range" min="1" max="40" value={sipYears} onChange={e => setSipYears(e.target.value)} className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                                        <span className="text-white font-mono font-bold w-16 text-right">{sipYears} Yr</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8">
                                    <div className="text-center mb-6">
                                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">Total Value</div>
                                        <div className="text-4xl font-bold text-emerald-400 font-mono">{currency}{Math.round(sipResult.total).toLocaleString()}</div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl">
                                            <span className="text-sm text-slate-400">Invested Amount</span>
                                            <span className="text-white font-mono font-bold">{currency}{Math.round(sipResult.invested).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl">
                                            <span className="text-sm text-slate-400">Est. Returns</span>
                                            <span className="text-emerald-400 font-mono font-bold">+{currency}{Math.round(sipResult.returns).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'tax' && (
                        <div className="max-w-3xl mx-auto space-y-8">
                            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                                <button onClick={() => setRegime('new')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${regime === 'new' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>New Regime (FY 24-25)</button>
                                <button onClick={() => setRegime('old')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${regime === 'old' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Old Regime</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Annual Gross Salary</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-4 text-slate-500 font-bold">{currency}</span>
                                            <input type="number" value={salary} onChange={e => setSalary(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-10 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors" />
                                        </div>
                                    </div>

                                    {regime === 'old' && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Total Deductions (80C, etc.)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-4 text-slate-500 font-bold">{currency}</span>
                                                <input type="number" value={deductions} onChange={e => setDeductions(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-10 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-slate-400">Standard Deduction</span>
                                            <span className="text-white font-mono">{currency}{taxRes.stdDed.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                                            <span className="text-sm font-bold text-white">Taxable Income</span>
                                            <span className="text-white font-mono font-bold">{currency}{taxRes.taxable.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="text-xs font-bold text-slate-500 uppercase">Tax Breakdown</div>
                                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                            {taxRes.breakdown.map((b, i) => (
                                                <div key={i} className="flex justify-between text-xs">
                                                    <span className="text-slate-400">{b.range} <span className="text-slate-600">(@{b.rate})</span></span>
                                                    <span className="text-slate-300 font-mono">{currency}{Math.round(b.amt).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-800 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Income Tax</span>
                                            <span className="text-white font-mono">{currency}{Math.round(taxRes.tax).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Cess (4%)</span>
                                            <span className="text-white font-mono">{currency}{Math.round(taxRes.cess).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-end pt-2">
                                            <span className="font-bold text-white">Total Tax</span>
                                            <span className="font-bold text-red-400 text-2xl font-mono">{currency}{Math.round(taxRes.total).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'profit' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full">
                            <div className="space-y-8">
                                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
                                    <button onClick={() => setProfitMode('find_margin')} className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${profitMode === 'find_margin' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Find Margin</button>
                                    <button onClick={() => setProfitMode('find_sp')} className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${profitMode === 'find_sp' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Find Selling Price</button>
                                    <button onClick={() => setProfitMode('find_cp')} className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${profitMode === 'find_cp' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Find Cost Price</button>
                                </div>

                                <div className="space-y-4">
                                    {profitMode !== 'find_cp' && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cost Price (CP)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-4 text-slate-500 font-bold">{currency}</span>
                                                <input type="number" value={cp} onChange={e => setCp(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-10 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors" />
                                            </div>
                                        </div>
                                    )}

                                    {profitMode !== 'find_sp' && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Selling Price (SP)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-4 text-slate-500 font-bold">{currency}</span>
                                                <input type="number" value={sp} onChange={e => setSp(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-10 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors" />
                                            </div>
                                        </div>
                                    )}

                                    {profitMode !== 'find_margin' && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Desired Margin (%)</label>
                                            <input type="number" value={margin} onChange={e => setMargin(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className={`rounded-[2rem] p-8 text-center shadow-lg relative overflow-hidden ${profitRes.profit >= 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}`}>
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                    <div className="relative z-10 text-white">
                                        <div className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">{profitRes.profit >= 0 ? 'Net Profit' : 'Net Loss'}</div>
                                        <div className="text-5xl font-bold mb-2">{currency}{Math.abs(profitRes.profit).toFixed(2)}</div>
                                        <div className="text-sm opacity-90">{profitRes.margin.toFixed(2)}% Margin</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Markup</div>
                                        <div className="text-xl font-bold text-white font-mono">{profitRes.markup.toFixed(2)}%</div>
                                    </div>
                                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">{profitMode === 'find_sp' ? 'Selling Price' : (profitMode === 'find_cp' ? 'Cost Price' : 'Return')}</div>
                                        <div className="text-xl font-bold text-white font-mono">{currency}{profitMode === 'find_sp' ? profitRes.sp.toFixed(2) : (profitMode === 'find_cp' ? profitRes.cp.toFixed(2) : profitRes.sp.toFixed(2))}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinanceSuite;
