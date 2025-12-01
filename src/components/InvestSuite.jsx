import React, { useState, useEffect } from 'react';
import { Calculator, Target, TrendingUp, PieChart, ArrowRight, CheckCircle, AlertCircle, Plus, Trash2, Wallet, Shield, Coins, Banknote, Landmark, X, Sparkles, Zap, Flame, BarChart3, ArrowUpRight, Home, Car, GraduationCap, Plane, Briefcase, Heart, Percent, Scale } from 'lucide-react';
import { getCurrencySymbol } from '../utils/currency';

const TEMPLATES = [
    { id: 'nifty', name: 'Nifty 50 Index', category: 'Equity', type: 'equity', rate: 12, mode: 'sip', freq: 'monthly', desc: 'Large Cap, Stable Growth' },
    { id: 'midcap', name: 'Mid Cap Fund', category: 'Equity', type: 'equity', rate: 15, mode: 'sip', freq: 'monthly', desc: 'High Growth, Moderate Risk' },
    { id: 'smallcap', name: 'Small Cap Fund', category: 'Equity', type: 'equity', rate: 18, mode: 'sip', freq: 'monthly', desc: 'Aggressive Growth, High Risk' },
    { id: 'elss', name: 'ELSS (Tax Saver)', category: 'Equity', type: 'equity', rate: 12, mode: 'sip', freq: 'monthly', desc: 'Tax Saving Mutual Fund' },
    { id: 'ppf', name: 'PPF', category: 'Govt', type: 'taxfree', rate: 7.1, mode: 'sip', freq: 'yearly', desc: 'Public Provident Fund (15y)' },
    { id: 'epf', name: 'EPF', category: 'Govt', type: 'taxfree', rate: 8.15, mode: 'sip', freq: 'monthly', desc: 'Employee Provident Fund' },
    { id: 'ssy', name: 'Sukanya Samriddhi', category: 'Govt', type: 'taxfree', rate: 8.2, mode: 'sip', freq: 'yearly', desc: 'Girl Child Scheme' },
    { id: 'fd', name: 'Fixed Deposit', category: 'Debt', type: 'debt', rate: 7.0, mode: 'lumpsum', freq: 'lumpsum', desc: 'Guaranteed Returns' },
    { id: 'rd', name: 'Recurring Deposit', category: 'Debt', type: 'debt', rate: 7.0, mode: 'sip', freq: 'monthly', desc: 'Monthly Savings' },
    { id: 'sgb', name: 'Sovereign Gold Bond', category: 'Gold', type: 'sgb', rate: 12.5, mode: 'lumpsum', freq: 'lumpsum', desc: '2.5% Int + Gold Appreciation' },
    { id: 'gold', name: 'Physical/Digital Gold', category: 'Gold', type: 'gold', rate: 10, mode: 'lumpsum', freq: 'lumpsum', desc: 'Standard Gold Investment' },
    { id: 'us', name: 'US Stocks (S&P 500)', category: 'Equity', type: 'debt', rate: 13, mode: 'sip', freq: 'monthly', desc: 'International Exposure (Taxed as Debt)' },
];

const GOAL_TEMPLATES = [
    { id: 'house', label: 'Dream Home', icon: Home, years: 10, amount: 10000000, rate: 12 },
    { id: 'car', label: 'Dream Car', icon: Car, years: 5, amount: 1500000, rate: 10 },
    { id: 'education', label: 'Education', icon: GraduationCap, years: 15, amount: 5000000, rate: 12 },
    { id: 'vacation', label: 'Vacation', icon: Plane, years: 2, amount: 300000, rate: 8 },
    { id: 'wedding', label: 'Wedding', icon: Heart, years: 7, amount: 2500000, rate: 10 },
    { id: 'wealth', label: 'Wealth', icon: Briefcase, years: 20, amount: 100000000, rate: 15 },
];

const InvestSuite = () => {
    const [tab, setTab] = useState('my-portfolio');
    const currency = getCurrencySymbol();

    // --- Global Settings ---
    const [taxSlab, setTaxSlab] = useState(30); // For Debt/Gold

    // --- Interest Calculator ---
    const [intPrincipal, setIntPrincipal] = useState(10000);
    const [intRate, setIntRate] = useState(10);
    const [intTime, setIntTime] = useState(5);
    const [intTimeUnit, setIntTimeUnit] = useState('years'); // years, months, days
    const [intType, setIntType] = useState('compound'); // simple, compound
    const [intFreq, setIntFreq] = useState('yearly'); // yearly, half, quarterly, monthly

    const calculateInterest = () => {
        const p = parseFloat(intPrincipal) || 0;
        const r = parseFloat(intRate) || 0;
        let t = parseFloat(intTime) || 0;

        // Convert to years
        if (intTimeUnit === 'months') t = t / 12;
        if (intTimeUnit === 'days') t = t / 365;
        let interest = 0;
        let total = 0;

        if (intType === 'simple') {
            interest = (p * r * t) / 100;
            total = p + interest;
        } else {
            // Compound Interest: A = P(1 + r/n)^(nt)
            let n = 1;
            if (intFreq === 'half') n = 2;
            if (intFreq === 'quarterly') n = 4;
            if (intFreq === 'monthly') n = 12;

            total = p * Math.pow((1 + (r / 100) / n), n * t);
            interest = total - p;
        }
        return { interest, total };
    };
    const intResult = calculateInterest();

    // --- Goal Planner (Reverse SIP) ---
    const [goalTarget, setGoalTarget] = useState(50000000); // 5 Cr
    const [goalYears, setGoalYears] = useState(15);
    const [goalReturn, setGoalReturn] = useState(12);
    const [goalInflation, setGoalInflation] = useState(6);
    const [goalInfEnabled, setGoalInfEnabled] = useState(true);
    const [goalCurrentSavings, setGoalCurrentSavings] = useState(0);
    const [goalStepUpEnabled, setGoalStepUpEnabled] = useState(false);
    const [goalStepUpRate, setGoalStepUpRate] = useState(10);
    const [goalType, setGoalType] = useState('wealth');

    const applyGoalTemplate = (t) => {
        setGoalType(t.id);
        setGoalTarget(t.amount);
        setGoalYears(t.years);
        setGoalReturn(t.rate);
    };

    const calculateGoal = () => {
        const target = parseFloat(goalTarget) || 0;
        const years = parseFloat(goalYears) || 0;
        const rate = parseFloat(goalReturn) || 0;
        const inf = parseFloat(goalInflation) || 0;
        const current = parseFloat(goalCurrentSavings) || 0;
        const stepRate = parseFloat(goalStepUpRate) || 0;

        // 1. Adjust target for inflation
        const adjustedTarget = goalInfEnabled ? target * Math.pow((1 + inf / 100), years) : target;

        // 2. Calculate Future Value of Current Savings
        const currentSavingsFV = current * Math.pow((1 + rate / 100), years);

        // 3. Required Corpus from New Investments
        const requiredCorpus = Math.max(0, adjustedTarget - currentSavingsFV);

        // 4. SIP Calculation
        // Monthly rate
        const r = rate / 12 / 100;
        const n = years * 12;

        let sip = 0;

        if (requiredCorpus > 0) {
            if (goalStepUpEnabled) {
                // Iterative approach for Step-Up SIP to find initial PMT
                // This is complex algebraically, so we can approximate or use a formula if available.
                // Formula for FV of Step-Up SIP:
                // FV = P * [ ( (1+r)^n - (1+s)^n ) / (r-s) ] * (1+r) ... roughly (where r=monthly rate, s=monthly step)
                // Actually, Step-Up is usually annual.
                // Let's use a simplified annual compounding loop to find the multiplier, then divide RequiredCorpus by it.

                let totalFactor = 0;
                let currentFactor = 1; // Represents 1 unit of SIP
                const monthlyR = rate / 12 / 100;

                for (let y = 1; y <= years; y++) {
                    // FV of this year's SIPs at end of term
                    // FV of 12 payments of size `currentFactor`
                    // FV_year = currentFactor * ((1+mr)^12 - 1)/mr * (1+mr)
                    // This FV_year is at end of year `y`. It needs to grow for remaining `years - y` years.

                    const fvOneYear = ((Math.pow(1 + monthlyR, 12) - 1) / monthlyR) * (1 + monthlyR);
                    const growthRemaining = Math.pow(1 + rate / 100, years - y);

                    totalFactor += currentFactor * fvOneYear * growthRemaining;

                    // Step up for next year
                    currentFactor = currentFactor * (1 + stepRate / 100);
                }

                sip = requiredCorpus / totalFactor;

            } else {
                // Standard SIP
                if (rate > 0) {
                    sip = (requiredCorpus * r) / ((Math.pow(1 + r, n) - 1) * (1 + r));
                } else {
                    sip = requiredCorpus / n;
                }
            }
        }

        // Lumpsum: PV = FV / (1+r)^n
        const lumpsum = requiredCorpus / Math.pow((1 + rate / 100), years);

        return { adjustedTarget, sip, lumpsum, currentSavingsFV, requiredCorpus };
    };
    const goalResult = calculateGoal();

    // --- SIP Calculator (Merged FV & Step-Up) ---
    const [fvAmount, setFvAmount] = useState(10000);
    const [fvType, setFvType] = useState('sip'); // sip, lumpsum
    const [fvYears, setFvYears] = useState(10);
    const [fvReturn, setFvReturn] = useState(12);
    const [fvInf, setFvInf] = useState(6);
    const [fvAsset, setFvAsset] = useState('nifty');

    // Step-Up State
    const [stepUpEnabled, setStepUpEnabled] = useState(false);
    const [stepUpRate, setStepUpRate] = useState(10);

    const setAssetClass = (type) => {
        setFvAsset(type);
        switch (type) {
            case 'fd': setFvReturn(7); break;
            case 'debt': setFvReturn(8); break;
            case 'gold': setFvReturn(10); break;
            case 'large': setFvReturn(12); break; // Nifty 50
            case 'mid': setFvReturn(15); break;
            case 'small': setFvReturn(18); break;
            case 'us': setFvReturn(13); break; // S&P 500
            default: break;
        }
    };

    const calculateSIP = () => {
        const amt = parseFloat(fvAmount) || 0;
        const years = parseFloat(fvYears) || 0;
        const rate = parseFloat(fvReturn) || 0;
        const inf = parseFloat(fvInf) || 0;
        const stepRate = parseFloat(stepUpRate) || 0;

        let total = 0;
        let invested = 0;

        if (fvType === 'lumpsum') {
            invested = amt;
            total = amt * Math.pow((1 + rate / 100), years);
        } else {
            // SIP Calculation
            if (stepUpEnabled) {
                // Step-Up Logic
                let currentSip = amt;
                const monthlyRate = rate / 12 / 100;

                for (let y = 1; y <= years; y++) {
                    for (let m = 1; m <= 12; m++) {
                        invested += currentSip;
                        total = (total + currentSip) * (1 + monthlyRate);
                    }
                    currentSip = currentSip * (1 + stepRate / 100);
                }
            } else {
                // Standard SIP
                const r = rate / 12 / 100;
                const n = years * 12;
                invested = amt * n;
                if (rate > 0) {
                    total = amt * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
                } else {
                    total = invested;
                }
            }
        }

        // Real Value (Inflation adjusted)
        const realValue = total / Math.pow((1 + inf / 100), years);

        // Tax Calculation (Simplified)
        let tax = 0;
        const gains = total - invested;

        if (['large', 'mid', 'small', 'nifty'].includes(fvAsset)) {
            // Equity LTCG
            const taxableGains = Math.max(0, gains - 125000);
            tax = taxableGains * 0.125;
        } else {
            // Debt/Gold/FD/US Stocks
            tax = gains * (taxSlab / 100);
        }

        const postTax = total - tax;

        return { invested, total, realValue, gain: total - invested, tax, postTax };
    };
    const fvResult = calculateSIP();



    // --- SWP Calculator ---
    const [swpCorpus, setSwpCorpus] = useState(5000000);
    const [swpWithdrawal, setSwpWithdrawal] = useState(30000);
    const [swpRate, setSwpRate] = useState(8);
    const [swpYears, setSwpYears] = useState(20);

    const calculateSWP = () => {
        let balance = parseFloat(swpCorpus) || 0;
        const withdrawal = parseFloat(swpWithdrawal) || 0;
        const monthlyRate = swpRate / 12 / 100;
        const months = swpYears * 12;
        let totalWithdrawn = 0;

        for (let m = 1; m <= months; m++) {
            if (balance <= 0) break;
            balance = balance - withdrawal; // Withdraw at start or end? Let's say start for safety
            if (balance > 0) {
                balance = balance * (1 + monthlyRate); // Grow remaining
            }
            totalWithdrawn += withdrawal;
        }

        return { finalBalance: Math.max(0, balance), totalWithdrawn };
    };
    const swpResult = calculateSWP();

    // --- FIRE Calculator ---
    const [fireExpense, setFireExpense] = useState(50000);
    const [fireInflation, setFireInflation] = useState(6);
    const [fireSwr, setFireSwr] = useState(4); // Safe Withdrawal Rate
    const [fireCorpus, setFireCorpus] = useState(2000000); // Current savings
    const [fireSip, setFireSip] = useState(50000); // Monthly investment
    const [fireReturn, setFireReturn] = useState(12); // Expected return on investment

    const calculateFIRE = () => {
        const annualExpense = fireExpense * 12;
        // FIRE Number = Annual Expense / SWR%
        // But we usually project expense to future.
        // Let's find "Years to FIRE"

        // Target Corpus (Today's value) = Annual Expense / (SWR/100)
        const targetToday = annualExpense / (fireSwr / 100);

        let currentCorpus = parseFloat(fireCorpus) || 0;
        let years = 0;
        let projectedTarget = targetToday;

        // Simulate year by year until corpus >= target
        // Limit to 50 years to avoid infinite loop
        while (years < 50) {
            if (currentCorpus >= projectedTarget) break;

            // Grow corpus
            currentCorpus = (currentCorpus + (fireSip * 12)) * (1 + fireReturn / 100);

            // Inflate expenses for next year check
            projectedTarget = projectedTarget * (1 + fireInflation / 100);
            years++;
        }

        // Remaining corpus needed
        const remaining = Math.max(0, projectedTarget - currentCorpus);

        return { years: years + (remaining / projectedTarget), currentCorpus, projectedTarget, targetToday };
    };
    const fireResult = calculateFIRE();

    // --- CAGR Calculator ---
    const [cagrInitial, setCagrInitial] = useState(100000);
    const [cagrFinal, setCagrFinal] = useState(200000);
    const [cagrYears, setCagrYears] = useState(5);

    const calculateCAGR = () => {
        const initial = parseFloat(cagrInitial) || 0;
        const final = parseFloat(cagrFinal) || 0;
        const years = parseFloat(cagrYears) || 0;

        if (initial > 0 && final > 0 && years > 0) {
            const cagr = (Math.pow(final / initial, 1 / years) - 1) * 100;
            const absReturn = ((final - initial) / initial) * 100;
            return { cagr, absReturn };
        }
        return { cagr: 0, absReturn: 0 };
    };
    const cagrResult = calculateCAGR();

    // --- Stock Average Calculator ---
    const [avgBuy1Price, setAvgBuy1Price] = useState(100);
    const [avgBuy1Units, setAvgBuy1Units] = useState(50);
    const [avgBuy2Price, setAvgBuy2Price] = useState(80);
    const [avgBuy2Units, setAvgBuy2Units] = useState(50);

    const calculateAverage = () => {
        const p1 = parseFloat(avgBuy1Price) || 0;
        const u1 = parseFloat(avgBuy1Units) || 0;
        const p2 = parseFloat(avgBuy2Price) || 0;
        const u2 = parseFloat(avgBuy2Units) || 0;

        const totalUnits = u1 + u2;
        const totalCost = (p1 * u1) + (p2 * u2);
        const newAvg = totalUnits > 0 ? totalCost / totalUnits : 0;

        return { totalUnits, totalCost, newAvg };
    };
    const avgResult = calculateAverage();



    // --- Portfolio Tracker ---
    const [myInvestments, setMyInvestments] = useState(() => {
        const saved = localStorage.getItem('myInvestments');
        return saved ? JSON.parse(saved) : [
            { id: 1, name: 'Nifty 50 Index', type: 'equity', mode: 'sip', freq: 'monthly', amount: 10000, rate: 12 },
            { id: 2, name: 'PPF', type: 'taxfree', mode: 'sip', freq: 'yearly', amount: 150000, rate: 7.1 },
            { id: 3, name: 'SGB', type: 'sgb', mode: 'lumpsum', freq: 'lumpsum', amount: 50000, rate: 12.5 }
        ];
    });

    useEffect(() => {
        localStorage.setItem('myInvestments', JSON.stringify(myInvestments));
    }, [myInvestments]);
    const [newInv, setNewInv] = useState({ name: '', type: 'equity', mode: 'sip', freq: 'monthly', amount: '', rate: 12 });
    const [portYears, setPortYears] = useState(15);
    const [showAddForm, setShowAddForm] = useState(false);

    const applyTemplate = (t) => {
        setNewInv({
            name: t.name,
            type: t.type,
            mode: t.mode,
            freq: t.freq,
            amount: newInv.amount, // Keep existing amount if typed
            rate: t.rate
        });
        setShowAddForm(true);
    };

    const addInvestment = () => {
        if (newInv.name && newInv.amount) {
            setMyInvestments([...myInvestments, { ...newInv, id: Date.now(), amount: parseFloat(newInv.amount), rate: parseFloat(newInv.rate) }]);
            setNewInv({ name: '', type: 'equity', mode: 'sip', freq: 'monthly', amount: '', rate: 12 });
            setShowAddForm(false);
        }
    };

    const removeInvestment = (id) => {
        setMyInvestments(myInvestments.filter(i => i.id !== id));
    };

    const calculatePortfolio = () => {
        let totalInvested = 0; // Total principal over the period
        let projectedCorpus = 0;
        let postTaxCorpus = 0;
        let totalGains = 0;

        let typeAllocation = { equity: 0, debt: 0, gold: 0, taxfree: 0 };

        myInvestments.forEach(inv => {
            let fv = 0;
            let invested = 0;
            const r = inv.rate / 100;

            if (inv.mode === 'sip') {
                // Determine frequency multiplier
                let freqMult = 12; // Monthly
                if (inv.freq === 'quarterly') freqMult = 4;
                if (inv.freq === 'yearly') freqMult = 1;

                const periods = portYears * freqMult;
                const periodicRate = r / freqMult;

                invested = inv.amount * periods;
                fv = inv.amount * ((Math.pow(1 + periodicRate, periods) - 1) / periodicRate) * (1 + periodicRate);
            } else {
                // Lumpsum
                invested = inv.amount;
                fv = inv.amount * Math.pow(1 + r, portYears);
            }

            const gains = fv - invested;
            let tax = 0;

            if (inv.type === 'equity') {
                tax = Math.max(0, gains - 125000) * 0.125;
            } else if (inv.type === 'debt' || inv.type === 'gold') {
                tax = gains * (taxSlab / 100);
            } else if (inv.type === 'sgb' || inv.type === 'taxfree') {
                tax = 0; // SGB capital gains tax free on maturity, PPF tax free
            }

            totalInvested += invested;
            projectedCorpus += fv;
            postTaxCorpus += (fv - tax);
            totalGains += gains;

            // Allocation mapping
            let allocType = 'equity';
            if (inv.type === 'debt') allocType = 'debt';
            if (inv.type === 'gold' || inv.type === 'sgb') allocType = 'gold';
            if (inv.type === 'taxfree') allocType = 'taxfree';

            typeAllocation[allocType] += fv;
        });

        return { totalInvested, projectedCorpus, postTaxCorpus, totalGains, typeAllocation };
    };
    const portResult = calculatePortfolio();

    // --- Render Helpers ---
    const formatMoney = (amount) => {
        return amount.toLocaleString('en-IN', { maximumFractionDigits: 0, style: 'currency', currency: 'INR' }).replace('₹', currency);
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'equity': return <TrendingUp size={18} />;
            case 'debt': return <Landmark size={18} />;
            case 'gold': case 'sgb': return <Coins size={18} />;
            case 'taxfree': return <Shield size={18} />;
            default: return <Wallet size={18} />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'equity': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'debt': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'gold': case 'sgb': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'taxfree': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    // Donut Chart Logic
    const getDonutGradient = () => {
        const total = portResult.projectedCorpus || 1;
        const eq = (portResult.typeAllocation.equity / total) * 100;
        const db = (portResult.typeAllocation.debt / total) * 100;
        const gd = (portResult.typeAllocation.gold / total) * 100;
        const tf = (portResult.typeAllocation.taxfree / total) * 100;

        let current = 0;
        const p1 = eq;
        const p2 = p1 + db;
        const p3 = p2 + gd;
        const p4 = p3 + tf;

        return `conic-gradient(
            #3b82f6 0% ${p1}%, 
            #10b981 ${p1}% ${p2}%, 
            #eab308 ${p2}% ${p3}%, 
            #a855f7 ${p3}% 100%
        )`;
    };

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">Investment Suite</h2>

            {/* Tabs */}
            <div className="flex justify-center mb-8">
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-1.5 rounded-2xl flex gap-2 overflow-x-auto max-w-full">
                    {[
                        { id: 'my-portfolio', label: 'My Portfolio', icon: Wallet },
                        { id: 'interest', label: 'Interest', icon: Calculator },
                        { id: 'cagr', label: 'CAGR', icon: Percent },
                        { id: 'average', label: 'Stock Avg', icon: Scale },
                        { id: 'goal', label: 'Goal Planner', icon: Target },
                        { id: 'sip', label: 'SIP Calculator', icon: TrendingUp },
                        { id: 'swp', label: 'SWP', icon: Banknote },
                        { id: 'fire', label: 'FIRE', icon: Flame },
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${tab === t.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        >
                            <t.icon size={18} /> {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-slate-900/30 rounded-[2rem] border border-slate-800/50 p-6 md:p-10">

                {/* INTEREST CALCULATOR */}
                {tab === 'interest' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Principal Amount</label>
                                <input type="number" value={intPrincipal} onChange={e => setIntPrincipal(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Rate (%)</label>
                                    <input type="number" value={intRate} onChange={e => setIntRate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Time Period</label>
                                    <div className="flex gap-2">
                                        <input type="number" value={intTime} onChange={e => setIntTime(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" />
                                        <select value={intTimeUnit} onChange={e => setIntTimeUnit(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 text-white font-bold text-sm focus:border-primary-500 outline-none">
                                            <option value="years">Years</option>
                                            <option value="months">Months</option>
                                            <option value="days">Days</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                                <button onClick={() => setIntType('simple')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${intType === 'simple' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Simple Interest</button>
                                <button onClick={() => setIntType('compound')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${intType === 'compound' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Compound Interest</button>
                            </div>

                            {intType === 'compound' && (
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Compounding Frequency</label>
                                    <select value={intFreq} onChange={e => setIntFreq(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none">
                                        <option value="yearly">Yearly (Once a year)</option>
                                        <option value="half">Half-Yearly (Twice a year)</option>
                                        <option value="quarterly">Quarterly (4 times a year)</option>
                                        <option value="monthly">Monthly (12 times a year)</option>
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8 flex flex-col justify-center items-center text-center">
                            <div className="text-sm font-bold text-slate-500 uppercase mb-2">Total Amount</div>
                            <div className="text-5xl font-bold text-emerald-400 font-mono mb-6">{formatMoney(intResult.total)}</div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <span>Interest Earned:</span>
                                <span className="text-white font-bold font-mono">{formatMoney(intResult.interest)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* GOAL PLANNER */}
                {tab === 'goal' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                        <div className="space-y-6">

                            {/* Templates */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">I want to plan for...</label>
                                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                    {GOAL_TEMPLATES.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => applyGoalTemplate(t)}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border min-w-[80px] transition-all ${goalType === t.id ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-600/20' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'}`}
                                        >
                                            <t.icon size={20} />
                                            <span className="text-xs font-bold whitespace-nowrap">{t.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Target Amount (Today's Value)</label>
                                <input type="number" value={goalTarget} onChange={e => setGoalTarget(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" />
                                <div className="text-xs text-slate-500 mt-2">e.g., 5,00,00,000 for 5 Cr</div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Years to Goal</label>
                                    <input type="number" value={goalYears} onChange={e => setGoalYears(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Exp. Return (%)</label>
                                    <input type="number" value={goalReturn} onChange={e => setGoalReturn(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Current Savings (Optional)</label>
                                <input type="number" value={goalCurrentSavings} onChange={e => setGoalCurrentSavings(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" placeholder="0" />
                                <div className="text-xs text-slate-500 mt-2">Existing investments for this goal. We'll assume they grow at {goalReturn}%.</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={goalInfEnabled} onChange={e => setGoalInfEnabled(e.target.checked)} className="rounded border-slate-700 bg-slate-900 text-primary-500 focus:ring-primary-500" />
                                            <span className="text-sm font-bold text-white">Inflation Adj.</span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input type="number" value={goalInflation} onChange={e => setGoalInflation(e.target.value)} disabled={!goalInfEnabled} className="w-12 bg-slate-900 border border-slate-700 rounded-lg p-1 text-center text-white font-mono text-sm" />
                                            <span className="text-xs text-slate-500">%</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500">Increases target to match future purchasing power.</p>
                                </div>

                                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={goalStepUpEnabled} onChange={e => setGoalStepUpEnabled(e.target.checked)} className="rounded border-slate-700 bg-slate-900 text-primary-500 focus:ring-primary-500" />
                                            <span className="text-sm font-bold text-white">Step-Up SIP</span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input type="number" value={goalStepUpRate} onChange={e => setGoalStepUpRate(e.target.value)} disabled={!goalStepUpEnabled} className="w-12 bg-slate-900 border border-slate-700 rounded-lg p-1 text-center text-white font-mono text-sm" />
                                            <span className="text-xs text-slate-500">%</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500">Increase SIP annually to reach goal faster.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="text-sm font-bold uppercase opacity-80 mb-1">Required Monthly SIP</div>
                                    <div className="text-4xl font-bold font-mono mb-4">{formatMoney(goalResult.sip)}</div>
                                    {goalStepUpEnabled && <div className="text-xs font-bold bg-white/20 inline-block px-2 py-1 rounded mb-3">Starting Amount (Increases by {goalStepUpRate}%/yr)</div>}

                                    <div className="text-xs opacity-70 border-t border-white/20 pt-3 mt-3 flex justify-between">
                                        <span>OR One-time Lumpsum:</span>
                                        <span className="font-bold font-mono">{formatMoney(goalResult.lumpsum)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                                <h4 className="text-sm font-bold text-slate-500 uppercase">Goal Breakdown</h4>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Target (Today's Value)</span>
                                    <span className="text-white font-mono font-bold">{formatMoney(parseFloat(goalTarget))}</span>
                                </div>

                                {goalInfEnabled && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400 flex items-center gap-1"><TrendingUp size={12} /> Inflation Impact</span>
                                        <span className="text-red-400 font-mono font-bold">+{formatMoney(goalResult.adjustedTarget - parseFloat(goalTarget))}</span>
                                    </div>
                                )}

                                <div className="border-t border-slate-800 my-2"></div>

                                <div className="flex justify-between items-center text-lg">
                                    <span className="text-white font-bold">Future Target Amount</span>
                                    <span className="text-emerald-400 font-mono font-bold">{formatMoney(goalResult.adjustedTarget)}</span>
                                </div>

                                <div className="bg-slate-900 rounded-xl p-3 space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Covered by Current Savings</span>
                                        <span className="text-blue-400 font-mono font-bold">{formatMoney(goalResult.currentSavingsFV)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">To be covered by SIP</span>
                                        <span className="text-purple-400 font-mono font-bold">{formatMoney(goalResult.requiredCorpus)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SIP CALCULATOR (Merged) */}
                {tab === 'sip' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                        <div className="space-y-6">
                            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                                <button onClick={() => setFvType('sip')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${fvType === 'sip' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Monthly SIP</button>
                                <button onClick={() => setFvType('lumpsum')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${fvType === 'lumpsum' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>One-time Investment</button>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Investment Amount</label>
                                <input type="number" value={fvAmount} onChange={e => setFvAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" />
                            </div>

                            {fvType === 'sip' && (
                                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={stepUpEnabled} onChange={e => setStepUpEnabled(e.target.checked)} className="rounded border-slate-700 bg-slate-900 text-primary-500 focus:ring-primary-500" />
                                            <span className="text-sm font-bold text-white">Step-Up SIP (Annual Increase)</span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input type="number" value={stepUpRate} onChange={e => setStepUpRate(e.target.value)} disabled={!stepUpEnabled} className="w-16 bg-slate-900 border border-slate-700 rounded-lg p-1 text-center text-white font-mono text-sm" />
                                            <span className="text-xs text-slate-500">%</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500">Automatically increase your SIP amount every year to match your income growth.</p>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Asset Class (Preset Returns)</label>
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    {[
                                        { id: 'fd', l: 'FD (7%)' }, { id: 'gold', l: 'Gold (10%)' }, { id: 'large', l: 'Nifty 50 (12%)' },
                                        { id: 'mid', l: 'Mid Cap (15%)' }, { id: 'small', l: 'Small Cap (18%)' }, { id: 'us', l: 'US Stocks (13%)' }
                                    ].map(a => (
                                        <button key={a.id} onClick={() => setAssetClass(a.id)} className={`py-2 rounded-lg text-xs font-bold border transition-all ${fvAsset === a.id ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
                                            {a.l}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-4">
                                    <input type="range" min="1" max="30" value={fvReturn} onChange={e => setFvReturn(e.target.value)} className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                                    <span className="text-white font-mono font-bold w-12 text-right">{fvReturn}%</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Duration (Years)</label>
                                    <input type="number" value={fvYears} onChange={e => setFvYears(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Inflation (%)</label>
                                    <input type="number" value={fvInf} onChange={e => setFvInf(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" />
                                </div>
                            </div>
                            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-white">Tax Slab (for Debt/Gold)</span>
                                    <input type="number" value={taxSlab} onChange={e => setTaxSlab(e.target.value)} className="w-20 bg-slate-900 border border-slate-700 rounded-lg p-1 text-center text-white font-mono text-sm" />
                                </div>
                                <p className="text-xs text-slate-500">Used to calculate post-tax returns for non-equity assets.</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8">
                                <div className="text-center mb-6">
                                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Projected Value</div>
                                    <div className="text-4xl font-bold text-emerald-400 font-mono">{formatMoney(fvResult.total)}</div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl">
                                        <span className="text-sm text-slate-400">Invested Amount</span>
                                        <span className="text-white font-mono font-bold">{formatMoney(fvResult.invested)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl">
                                        <span className="text-sm text-slate-400">Wealth Gained</span>
                                        <span className="text-emerald-400 font-mono font-bold">+{formatMoney(fvResult.gain)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-slate-900/50 border border-slate-800 rounded-xl mt-4">
                                        <span className="text-sm text-slate-400">Real Value (Inflation Adj.)</span>
                                        <span className="text-blue-400 font-mono font-bold">{formatMoney(fvResult.realValue)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                                        <span className="text-sm text-slate-400">Post-Tax Value</span>
                                        <span className="text-purple-400 font-mono font-bold">{formatMoney(fvResult.postTax)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}



                {/* SWP CALCULATOR */}
                {tab === 'swp' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Total Corpus</label>
                                <input type="number" value={swpCorpus} onChange={e => setSwpCorpus(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Monthly Withdrawal</label>
                                    <input type="number" value={swpWithdrawal} onChange={e => setSwpWithdrawal(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Exp. Return (%)</label>
                                    <input type="number" value={swpRate} onChange={e => setSwpRate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Duration (Years)</label>
                                <input type="number" value={swpYears} onChange={e => setSwpYears(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8">
                                <div className="text-center mb-6">
                                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Final Balance</div>
                                    <div className={`text-4xl font-bold font-mono ${swpResult.finalBalance > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatMoney(swpResult.finalBalance)}</div>
                                    {swpResult.finalBalance === 0 && <div className="text-xs text-red-400 mt-2">Corpus depleted before {swpYears} years!</div>}
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl">
                                        <span className="text-sm text-slate-400">Total Withdrawn</span>
                                        <span className="text-white font-mono font-bold">{formatMoney(swpResult.totalWithdrawn)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* FIRE CALCULATOR */}
                {tab === 'fire' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Monthly Expense</label>
                                    <input type="number" value={fireExpense} onChange={e => setFireExpense(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Inflation (%)</label>
                                    <input type="number" value={fireInflation} onChange={e => setFireInflation(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Current Corpus</label>
                                    <input type="number" value={fireCorpus} onChange={e => setFireCorpus(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Monthly SIP</label>
                                    <input type="number" value={fireSip} onChange={e => setFireSip(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Exp. Return (%)</label>
                                    <input type="number" value={fireReturn} onChange={e => setFireReturn(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Safe Withdrawal Rate</label>
                                    <input type="number" value={fireSwr} onChange={e => setFireSwr(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-orange-600 to-red-700 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="text-sm font-bold uppercase opacity-80 mb-1">You can retire in</div>
                                    <div className="text-5xl font-bold font-mono mb-4">{fireResult.years} Years</div>
                                    <div className="text-xs opacity-70 border-t border-white/20 pt-3 mt-3">
                                        Target Corpus: <span className="font-bold font-mono">{formatMoney(fireResult.projectedTarget)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-slate-400">Target (Today's Value)</span>
                                    <span className="text-white font-mono font-bold">{formatMoney(fireResult.targetToday)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-400">Projected Corpus</span>
                                    <span className="text-emerald-400 font-mono font-bold">{formatMoney(fireResult.currentCorpus)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MY PORTFOLIO (REVAMPED) */}
                {tab === 'my-portfolio' && (
                    <div className="space-y-8">
                        {/* Summary Card */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                                <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Projected Net Worth</div>
                                    <div className="text-4xl md:text-5xl font-bold text-white font-mono tracking-tight">{formatMoney(portResult.projectedCorpus)}</div>
                                    <div className="text-sm text-slate-400 mt-2">after {portYears} years</div>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Post-Tax Value</div>
                                    <div className="text-2xl font-bold text-purple-400 font-mono">{formatMoney(portResult.postTaxCorpus)}</div>
                                    <div className="text-xs text-slate-500 mt-1">Realizable Amount</div>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Total Gains</div>
                                    <div className="text-2xl font-bold text-emerald-400 font-mono">+{formatMoney(portResult.totalGains)}</div>
                                    <div className="text-xs text-slate-500 mt-1">Wealth Created</div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <label className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Projection Period</label>
                                    <input type="range" min="1" max="40" value={portYears} onChange={e => setPortYears(e.target.value)} className="w-full md:w-48 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                                    <span className="text-white font-mono font-bold text-sm min-w-[3ch]">{portYears}y</span>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
                                    <span className="text-xs text-slate-400">Tax Slab:</span>
                                    <input type="number" value={taxSlab} onChange={e => setTaxSlab(e.target.value)} className="w-12 bg-transparent text-white font-mono font-bold text-sm outline-none text-center" />
                                    <span className="text-xs text-slate-500">%</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left: Investment List */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-white">Your Investments</h3>
                                    <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 text-sm font-bold text-primary-400 hover:text-primary-300 transition-colors">
                                        {showAddForm ? <X size={16} /> : <Plus size={16} />}
                                        {showAddForm ? 'Cancel' : 'Add New'}
                                    </button>
                                </div>

                                {showAddForm && (
                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 animate-fade-in">

                                        {/* Templates */}
                                        <div className="mb-6">
                                            <div className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2"><Sparkles size={12} className="text-yellow-400" /> Quick Add Templates</div>
                                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                                {TEMPLATES.map(t => (
                                                    <button key={t.id} onClick={() => applyTemplate(t)} className="flex-shrink-0 px-3 py-2 bg-slate-950 border border-slate-800 hover:border-primary-500 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-all whitespace-nowrap">
                                                        + {t.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Name</label>
                                                <input type="text" placeholder="e.g. HDFC Fund" value={newInv.name} onChange={e => setNewInv({ ...newInv, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:border-primary-500 outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Type (Tax Rule)</label>
                                                <select value={newInv.type} onChange={e => setNewInv({ ...newInv, type: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:border-primary-500 outline-none">
                                                    <option value="equity">Equity (12.5% Tax)</option>
                                                    <option value="debt">Debt (Slab Tax)</option>
                                                    <option value="gold">Gold (Slab Tax)</option>
                                                    <option value="sgb">SGB (Tax Free)</option>
                                                    <option value="taxfree">Tax Free (PPF/EPF)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Amount</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-3 text-slate-500">{currency}</span>
                                                    <input type="number" placeholder="0" value={newInv.amount} onChange={e => setNewInv({ ...newInv, amount: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pl-8 text-white text-sm focus:border-primary-500 outline-none" />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Mode</label>
                                                    <select value={newInv.mode} onChange={e => setNewInv({ ...newInv, mode: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:border-primary-500 outline-none">
                                                        <option value="sip">SIP</option>
                                                        <option value="lumpsum">One-time</option>
                                                    </select>
                                                </div>
                                                {newInv.mode === 'sip' && (
                                                    <div className="flex-1">
                                                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Freq</label>
                                                        <select value={newInv.freq} onChange={e => setNewInv({ ...newInv, freq: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:border-primary-500 outline-none">
                                                            <option value="monthly">Monthly</option>
                                                            <option value="quarterly">Quarterly</option>
                                                            <option value="yearly">Yearly</option>
                                                        </select>
                                                    </div>
                                                )}
                                                <div className="w-20">
                                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Rate %</label>
                                                    <input type="number" placeholder="12" value={newInv.rate} onChange={e => setNewInv({ ...newInv, rate: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:border-primary-500 outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={addInvestment} className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-primary-600/20">Add Investment</button>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {myInvestments.map(inv => (
                                        <div key={inv.id} className={`bg-slate-950 border border-slate-800 rounded-2xl p-5 flex items-center justify-between group hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getTypeColor(inv.type)}`}>
                                                    {getTypeIcon(inv.type)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-lg">{inv.name}</div>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 uppercase font-bold tracking-wide">
                                                        <span className={inv.mode === 'sip' ? 'text-emerald-500' : 'text-blue-500'}>{inv.mode === 'sip' ? `${inv.freq} SIP` : 'Lumpsum'}</span>
                                                        <span>•</span>
                                                        <span>{inv.rate}% Return</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <div className="font-mono font-bold text-white text-lg">{formatMoney(inv.amount)}</div>
                                                    <div className="text-xs text-slate-500 uppercase">{inv.mode === 'sip' ? 'per period' : 'invested'}</div>
                                                </div>
                                                <button onClick={() => removeInvestment(inv.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    ))}
                                    {myInvestments.length === 0 && (
                                        <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-3xl text-slate-500">
                                            <Wallet size={48} className="mx-auto mb-4 opacity-20" />
                                            <p>No investments added yet.</p>
                                            <button onClick={() => setShowAddForm(true)} className="mt-4 text-primary-400 font-bold hover:underline">Add your first investment</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Charts & Stats */}
                            <div className="space-y-6">
                                <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8 flex flex-col items-center justify-center relative">
                                    <h4 className="text-sm font-bold text-slate-500 uppercase mb-6 w-full text-center">Asset Allocation</h4>

                                    {/* CSS Donut Chart */}
                                    <div className="relative w-48 h-48 rounded-full flex items-center justify-center mb-6" style={{ background: getDonutGradient() }}>
                                        <div className="w-36 h-36 bg-slate-950 rounded-full flex flex-col items-center justify-center z-10">
                                            <div className="text-xs text-slate-500 uppercase">Total</div>
                                            <div className="text-xl font-bold text-white font-mono">100%</div>
                                        </div>
                                    </div>

                                    <div className="w-full space-y-3">
                                        {[
                                            { l: 'Equity', v: portResult.typeAllocation.equity, c: 'bg-blue-500' },
                                            { l: 'Debt', v: portResult.typeAllocation.debt, c: 'bg-emerald-500' },
                                            { l: 'Gold', v: portResult.typeAllocation.gold, c: 'bg-yellow-500' },
                                            { l: 'Tax Free', v: portResult.typeAllocation.taxfree, c: 'bg-purple-500' }
                                        ].map(i => {
                                            const total = portResult.projectedCorpus || 1;
                                            const pct = Math.round((i.v / total) * 100);
                                            if (pct === 0) return null;
                                            return (
                                                <div key={i.l} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${i.c}`}></div>
                                                        <span className="text-slate-300">{i.l}</span>
                                                    </div>
                                                    <div className="font-mono font-bold text-white">{pct}%</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
                                    <div className="flex items-center gap-2 mb-2 text-slate-300 font-bold">
                                        <Shield size={14} className="text-emerald-400" /> Tax Efficiency
                                    </div>
                                    <p>Your portfolio's tax efficiency depends on the asset mix. Equity is taxed at 12.5% (LTCG), while Debt/Gold are taxed at your slab rate. Tax-free assets like PPF help reduce overall tax liability.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CAGR CALCULATOR */}
                {tab === 'cagr' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Initial Investment</label>
                                <input type="number" value={cagrInitial} onChange={e => setCagrInitial(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Final Value</label>
                                <input type="number" value={cagrFinal} onChange={e => setCagrFinal(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Duration (Years)</label>
                                <input type="number" value={cagrYears} onChange={e => setCagrYears(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none" />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-blue-600 to-cyan-700 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="text-sm font-bold uppercase opacity-80 mb-1">CAGR (Annual Growth)</div>
                                    <div className="text-5xl font-bold font-mono mb-4">{cagrResult.cagr.toFixed(2)}%</div>
                                    <div className="text-xs opacity-70 border-t border-white/20 pt-3 mt-3">
                                        Absolute Return: <span className="font-bold font-mono">{cagrResult.absReturn.toFixed(2)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STOCK AVERAGE CALCULATOR */}
                {tab === 'average' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                        <div className="space-y-6">
                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                                <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">First Purchase</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Price</label>
                                        <input type="number" value={avgBuy1Price} onChange={e => setAvgBuy1Price(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-primary-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Units</label>
                                        <input type="number" value={avgBuy1Units} onChange={e => setAvgBuy1Units(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-primary-500 outline-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                                <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">New Purchase</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Price</label>
                                        <input type="number" value={avgBuy2Price} onChange={e => setAvgBuy2Price(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-primary-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Units</label>
                                        <input type="number" value={avgBuy2Units} onChange={e => setAvgBuy2Units(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-primary-500 outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="text-sm font-bold uppercase opacity-80 mb-1">New Average Price</div>
                                    <div className="text-5xl font-bold font-mono mb-4">{formatMoney(avgResult.newAvg)}</div>
                                    <div className="text-xs opacity-70 border-t border-white/20 pt-3 mt-3 flex justify-between">
                                        <span>Total Units: <span className="font-bold font-mono">{avgResult.totalUnits}</span></span>
                                        <span>Total Cost: <span className="font-bold font-mono">{formatMoney(avgResult.totalCost)}</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvestSuite;
