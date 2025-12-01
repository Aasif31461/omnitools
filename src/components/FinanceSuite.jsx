import React, { useState, useEffect } from 'react';
import { Receipt, Tag, TrendingUp, Landmark, Calculator, Home, Car, GraduationCap, User, PieChart, Wallet, Plus, Trash2, ShoppingBag, Coffee, Zap, Smartphone, ShoppingCart, Plane, HeartPulse, MoreHorizontal, AlertTriangle, CheckCircle2, Coins, ArrowRightLeft } from 'lucide-react';
import { getCurrencySymbol } from '../utils/currency';

const FinanceSuite = () => {
    const [tab, setTab] = useState('gst');
    const currency = getCurrencySymbol(); // Dynamic currency

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

    // Smart Loan Planner
    const [emiPrincipal, setEmiPrincipal] = useState(500000);
    const [emiRate, setEmiRate] = useState(9.5);
    const [emiTenure, setEmiTenure] = useState(5); // Years
    const [prepayment, setPrepayment] = useState(0);
    const [loanType, setLoanType] = useState('custom');

    const loanTemplates = [
        { id: 'home', label: 'Home', icon: Home, rate: 8.5, tenure: 20 },
        { id: 'car', label: 'Car', icon: Car, rate: 9.5, tenure: 5 },
        { id: 'edu', label: 'Education', icon: GraduationCap, rate: 10.5, tenure: 10 },
        { id: 'personal', label: 'Personal', icon: User, rate: 12, tenure: 3 },
    ];

    const applyTemplate = (t) => {
        setLoanType(t.id);
        setEmiRate(t.rate);
        setEmiTenure(t.tenure);
    };

    const calculateEMI = () => {
        const p = parseFloat(emiPrincipal) || 0;
        const r = parseFloat(emiRate) || 0;
        const n = parseFloat(emiTenure) * 12 || 0;
        const prepay = parseFloat(prepayment) || 0;

        if (p === 0 || r === 0 || n === 0) return { emi: 0, totalInterest: 0, totalPayment: 0, savedInterest: 0, timeSaved: 0 };

        const monthlyRate = r / 12 / 100;
        const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);

        const totalPayment = emi * n;
        const totalInterest = totalPayment - p;

        // Prepayment Analysis
        let balance = p;
        let totalInterestNew = 0;
        let months = 0;

        if (prepay > 0) {
            while (balance > 10 && months < n * 2) { // Safety break
                let interest = balance * monthlyRate;
                let principalComponent = (emi + prepay) - interest;

                if (balance < (emi + prepay)) {
                    // Last payment
                    interest = balance * monthlyRate;
                    totalInterestNew += interest;
                    balance = 0;
                    months++;
                    break;
                }

                totalInterestNew += interest;
                balance -= principalComponent;
                months++;
            }
        } else {
            totalInterestNew = totalInterest;
            months = n;
        }

        return {
            emi,
            totalInterest,
            totalPayment,
            savedInterest: prepay > 0 ? Math.max(0, totalInterest - totalInterestNew) : 0,
            timeSaved: prepay > 0 ? Math.max(0, n - months) : 0,
            newTenure: months
        };
    };

    const emiResult = calculateEMI();



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

    // Budget Tracker
    const [budget, setBudget] = useState(() => {
        const saved = localStorage.getItem('finance_budget');
        return saved ? JSON.parse(saved) : {
            income: 50000,
            expenses: [
                { id: 1, label: 'Rent', amount: 15000, category: 'housing' },
                { id: 2, label: 'Food', amount: 8000, category: 'food' },
                { id: 3, label: 'Transport', amount: 3000, category: 'transport' },
            ]
        };
    });

    useEffect(() => {
        localStorage.setItem('finance_budget', JSON.stringify(budget));
    }, [budget]);

    const [newExpense, setNewExpense] = useState({ label: '', amount: '', category: 'misc' });

    const EXPENSE_CATEGORIES = [
        { id: 'housing', label: 'Housing', icon: Home, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { id: 'food', label: 'Food', icon: Coffee, color: 'text-orange-400', bg: 'bg-orange-500/10' },
        { id: 'transport', label: 'Transport', icon: Car, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { id: 'utilities', label: 'Utilities', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        { id: 'shopping', label: 'Shopping', icon: ShoppingCart, color: 'text-pink-400', bg: 'bg-pink-500/10' },
        { id: 'health', label: 'Health', icon: HeartPulse, color: 'text-red-400', bg: 'bg-red-500/10' },
        { id: 'entertainment', label: 'Fun', icon: Plane, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { id: 'education', label: 'Education', icon: GraduationCap, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        { id: 'misc', label: 'Misc', icon: MoreHorizontal, color: 'text-slate-400', bg: 'bg-slate-500/10' },
    ];

    const getCategory = (id) => EXPENSE_CATEGORIES.find(c => c.id === id) || EXPENSE_CATEGORIES[8];

    const addExpense = () => {
        if (newExpense.label && newExpense.amount) {
            setBudget(prev => ({
                ...prev,
                expenses: [...prev.expenses, {
                    id: Date.now(),
                    label: newExpense.label,
                    amount: parseFloat(newExpense.amount),
                    category: newExpense.category
                }]
            }));
            setNewExpense({ label: '', amount: '', category: 'misc' });
        }
    };

    const removeExpense = (id) => {
        setBudget(prev => ({
            ...prev,
            expenses: prev.expenses.filter(e => e.id !== id)
        }));
    };

    const applyBudgetTemplate = (type) => {
        let newExpenses = [];
        let income = 0;
        if (type === 'student') {
            income = 15000;
            newExpenses = [
                { id: 1, label: 'Hostel/Rent', amount: 5000, category: 'housing' },
                { id: 2, label: 'Food', amount: 4000, category: 'food' },
                { id: 3, label: 'Books', amount: 1000, category: 'education' },
                { id: 4, label: 'Mobile', amount: 500, category: 'utilities' },
            ];
        } else if (type === 'family') {
            income = 80000;
            newExpenses = [
                { id: 1, label: 'Home Loan/Rent', amount: 25000, category: 'housing' },
                { id: 2, label: 'Groceries', amount: 15000, category: 'food' },
                { id: 3, label: 'School Fees', amount: 10000, category: 'education' },
                { id: 4, label: 'Utilities', amount: 5000, category: 'utilities' },
                { id: 5, label: 'Fuel/Transport', amount: 5000, category: 'transport' },
            ];
        } else if (type === 'freelancer') {
            income = 60000;
            newExpenses = [
                { id: 1, label: 'Co-working', amount: 8000, category: 'housing' },
                { id: 2, label: 'Software Subs', amount: 3000, category: 'shopping' },
                { id: 3, label: 'Internet', amount: 1500, category: 'utilities' },
                { id: 4, label: 'Coffee/Food', amount: 6000, category: 'food' },
            ];
        }
        setBudget({ income, expenses: newExpenses });
    };

    const totalExpenses = budget.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const savings = budget.income - totalExpenses;
    const savingsRate = budget.income > 0 ? (savings / budget.income) * 100 : 0;
    const expenseRate = budget.income > 0 ? (totalExpenses / budget.income) * 100 : 0;

    // Group expenses by category
    const categoryTotals = budget.expenses.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
    }, {});

    const sortedCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .map(([cat, amount]) => ({ ...getCategory(cat), amount }));

    // Donut Chart Gradient
    const getBudgetGradient = () => {
        if (totalExpenses === 0) return 'conic-gradient(#334155 0% 100%)';

        let gradient = 'conic-gradient(';
        let currentDeg = 0;

        sortedCategories.forEach((cat, index) => {
            const percent = (cat.amount / totalExpenses) * 100;
            const deg = (percent / 100) * 360;

            // Map tailwind colors to hex (approx)
            let color = '#94a3b8'; // slate
            if (cat.id === 'housing') color = '#60a5fa'; // blue
            if (cat.id === 'food') color = '#fb923c'; // orange
            if (cat.id === 'transport') color = '#34d399'; // emerald
            if (cat.id === 'utilities') color = '#facc15'; // yellow
            if (cat.id === 'shopping') color = '#f472b6'; // pink
            if (cat.id === 'health') color = '#f87171'; // red
            if (cat.id === 'entertainment') color = '#c084fc'; // purple
            if (cat.id === 'education') color = '#22d3ee'; // cyan

            gradient += `${color} ${currentDeg}deg ${currentDeg + deg}deg${index === sortedCategories.length - 1 ? '' : ', '}`;
            currentDeg += deg;
        });

        gradient += ')';
        return gradient;
    };

    // FD/RD Calculator
    const [depositType, setDepositType] = useState('fd'); // fd, rd
    const [depositAmount, setDepositAmount] = useState(100000);
    const [depositRate, setDepositRate] = useState(6.5);
    const [depositTenure, setDepositTenure] = useState(5); // years

    const calculateDeposit = () => {
        const P = parseFloat(depositAmount) || 0;
        const r = parseFloat(depositRate) || 0;
        const t = parseFloat(depositTenure) || 0;

        let maturityAmount = 0;
        let totalInvestment = 0;

        if (depositType === 'fd') {
            // FD: Quarterly compounding standard
            // A = P * (1 + r/400)^(4*t)
            maturityAmount = P * Math.pow((1 + r / 400), 4 * t);
            totalInvestment = P;
        } else {
            // RD: Monthly compounding
            // A = P * ((1+i)^n - 1) / i * (1+i)  where i = r/1200, n = t*12
            const i = r / 1200;
            const n = t * 12;
            maturityAmount = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
            totalInvestment = P * n;
        }

        return {
            maturity: Math.round(maturityAmount),
            investment: Math.round(totalInvestment),
            interest: Math.round(maturityAmount - totalInvestment)
        };
    };

    const depositRes = calculateDeposit();

    // Inflation Calculator
    const [inflationCurrent, setInflationCurrent] = useState(100000);
    const [inflationRate, setInflationRate] = useState(6);
    const [inflationYears, setInflationYears] = useState(10);

    const calculateInflation = () => {
        const P = parseFloat(inflationCurrent) || 0;
        const r = parseFloat(inflationRate) || 0;
        const t = parseFloat(inflationYears) || 0;

        // Future Cost = P * (1 + r/100)^t
        const futureCost = P * Math.pow((1 + r / 100), t);

        // Purchasing Power: Value of today's P in future terms (reverse)
        // Or simply, how much P is worth in future: P / (1+r/100)^t
        const purchasingPower = P / Math.pow((1 + r / 100), t);

        return {
            futureCost: Math.round(futureCost),
            purchasingPower: Math.round(purchasingPower)
        };
    };

    const inflationRes = calculateInflation();

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">Finance Suite</h2>

            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
                {/* Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 gap-2 overflow-x-auto">
                    {[
                        { id: 'budget', label: 'Budget Tracker', icon: Wallet },
                        { id: 'deposit', label: 'FD / RD', icon: Landmark },
                        { id: 'inflation', label: 'Inflation', icon: TrendingUp },
                        { id: 'gst', label: 'GST Calculator', icon: Receipt },
                        { id: 'discount', label: 'Discount', icon: Tag },
                        { id: 'emi', label: 'Smart Loan', icon: Calculator },
                        { id: 'tax', label: 'Tax', icon: Coins },
                        { id: 'profit', label: 'Profit', icon: ArrowRightLeft },
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
                    {tab === 'budget' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Quick Templates</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => applyBudgetTemplate('student')} className="flex-1 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:border-slate-600 transition-all">Student</button>
                                        <button onClick={() => applyBudgetTemplate('family')} className="flex-1 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:border-slate-600 transition-all">Family</button>
                                        <button onClick={() => applyBudgetTemplate('freelancer')} className="flex-1 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:border-slate-600 transition-all">Freelancer</button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Monthly Income</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-4 text-slate-500 font-bold">{currency}</span>
                                        <input
                                            type="number"
                                            value={budget.income}
                                            onChange={e => setBudget({ ...budget, income: parseFloat(e.target.value) || 0 })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-10 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-bold text-slate-300">Add Expense</span>
                                    </div>

                                    <div className="flex flex-col gap-3 mb-4">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Label (e.g. Wifi)"
                                                value={newExpense.label}
                                                onChange={e => setNewExpense({ ...newExpense, label: e.target.value })}
                                                className="flex-[2] bg-slate-900 border border-slate-700 rounded-lg px-3 py-3 text-sm text-white outline-none focus:border-primary-500"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Amount"
                                                value={newExpense.amount}
                                                onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-3 text-sm text-white outline-none focus:border-primary-500"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1 grid grid-cols-4 gap-2">
                                                {EXPENSE_CATEGORIES.slice(0, 8).map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => setNewExpense({ ...newExpense, category: cat.id })}
                                                        className={`p-2 rounded-lg flex justify-center items-center transition-all ${newExpense.category === cat.id ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}
                                                        title={cat.label}
                                                    >
                                                        <cat.icon size={16} />
                                                    </button>
                                                ))}
                                            </div>
                                            <button onClick={addExpense} className="w-12 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors flex items-center justify-center shadow-lg shadow-primary-600/20">
                                                <Plus size={24} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                        {budget.expenses.length > 0 ? (
                                            budget.expenses.slice().reverse().map(exp => {
                                                const cat = getCategory(exp.category);
                                                return (
                                                    <div key={exp.id} className="flex justify-between items-center p-3 bg-slate-900 rounded-lg group hover:bg-slate-800 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-full ${cat.bg} ${cat.color}`}>
                                                                <cat.icon size={14} />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm text-slate-300 font-medium">{exp.label}</div>
                                                                <div className="text-[10px] text-slate-500 uppercase font-bold">{cat.label}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-white font-mono font-bold">{currency}{exp.amount.toLocaleString()}</span>
                                                            <button onClick={() => removeExpense(exp.id)} className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-8 text-slate-600 text-sm italic">No expenses added yet.</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Budget Health Card */}
                                <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-6 relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-4 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 rounded-full ${expenseRate > 80 ? 'bg-red-500/20 text-red-500' : (expenseRate > 50 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-emerald-500/20 text-emerald-500')}`}>
                                                {expenseRate > 80 ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                                            </div>
                                            <span className="text-sm font-bold text-slate-300">Budget Health</span>
                                        </div>
                                        <span className={`text-xl font-bold font-mono ${expenseRate > 80 ? 'text-red-400' : (expenseRate > 50 ? 'text-yellow-400' : 'text-emerald-400')}`}>
                                            {expenseRate > 100 ? 'Over Budget' : (expenseRate > 80 ? 'Critical' : 'Healthy')}
                                        </span>
                                    </div>

                                    <div className="relative h-4 bg-slate-900 rounded-full overflow-hidden mb-2">
                                        <div
                                            className={`absolute top-0 left-0 h-full transition-all duration-1000 ${expenseRate > 80 ? 'bg-red-500' : (expenseRate > 50 ? 'bg-yellow-500' : 'bg-emerald-500')}`}
                                            style={{ width: `${Math.min(100, expenseRate)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500 font-mono">
                                        <span>0%</span>
                                        <span>50%</span>
                                        <span>100%</span>
                                    </div>
                                </div>

                                <div className={`rounded-[2rem] p-8 text-center shadow-lg relative overflow-hidden ${savings >= 0 ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : 'bg-gradient-to-br from-red-600 to-rose-700'}`}>
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                    <div className="relative z-10 text-white">
                                        <div className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">Net Savings</div>
                                        <div className="text-5xl font-bold mb-2">{currency}{Math.abs(savings).toLocaleString()}</div>
                                        <div className="text-sm opacity-90">{savingsRate.toFixed(1)}% Savings Rate</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                                            <Wallet size={16} />
                                            <span className="text-xs font-bold uppercase">Income</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white font-mono">{currency}{budget.income.toLocaleString()}</div>
                                    </div>
                                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                                            <ShoppingBag size={16} />
                                            <span className="text-xs font-bold uppercase">Expenses</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white font-mono">{currency}{totalExpenses.toLocaleString()}</div>
                                    </div>
                                </div>

                                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <PieChart size={16} className="text-primary-400" />
                                        <span className="text-sm font-bold text-slate-300">Spending Breakdown</span>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        {/* Donut Chart */}
                                        <div className="relative w-32 h-32 flex-shrink-0">
                                            <div
                                                className="w-full h-full rounded-full"
                                                style={{ background: getBudgetGradient() }}
                                            ></div>
                                            <div className="absolute inset-4 bg-slate-950 rounded-full flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="text-[10px] text-slate-500 uppercase font-bold">Total</div>
                                                    <div className="text-xs font-bold text-white">{currency}{totalExpenses > 1000 ? (totalExpenses / 1000).toFixed(1) + 'k' : totalExpenses}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Legend */}
                                        <div className="flex-1 space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                            {sortedCategories.map(cat => (
                                                <div key={cat.id} className="flex justify-between items-center text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${cat.bg.replace('/10', '')}`}></div>
                                                        <span className="text-slate-400">{cat.label}</span>
                                                    </div>
                                                    <span className="text-white font-mono">{Math.round((cat.amount / totalExpenses) * 100)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'deposit' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full">
                            <div className="space-y-8">
                                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                                    <button
                                        onClick={() => setDepositType('fd')}
                                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${depositType === 'fd' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Fixed Deposit (FD)
                                    </button>
                                    <button
                                        onClick={() => setDepositType('rd')}
                                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${depositType === 'rd' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Recurring Deposit (RD)
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                        {depositType === 'fd' ? 'Total Investment' : 'Monthly Investment'}
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-4 text-slate-500 font-bold">{currency}</span>
                                        <input
                                            type="number"
                                            value={depositAmount}
                                            onChange={e => setDepositAmount(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-10 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Interest Rate (%)</label>
                                        <input
                                            type="number"
                                            value={depositRate}
                                            onChange={e => setDepositRate(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Time Period (Years)</label>
                                        <input
                                            type="number"
                                            value={depositTenure}
                                            onChange={e => setDepositTenure(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-8 text-center shadow-lg relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                    <div className="relative z-10 text-white">
                                        <div className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">Maturity Amount</div>
                                        <div className="text-5xl font-bold mb-2">{currency}{depositRes.maturity.toLocaleString()}</div>
                                        <div className="text-sm opacity-90">Total Interest: {currency}{depositRes.interest.toLocaleString()}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                                            <Wallet size={16} />
                                            <span className="text-xs font-bold uppercase">Invested</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white font-mono">{currency}{depositRes.investment.toLocaleString()}</div>
                                    </div>
                                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                                            <TrendingUp size={16} />
                                            <span className="text-xs font-bold uppercase">Returns</span>
                                        </div>
                                        <div className="text-2xl font-bold text-emerald-400 font-mono">+{Math.round((depositRes.interest / depositRes.investment) * 100)}%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'inflation' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full">
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Current Cost</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-4 text-slate-500 font-bold">{currency}</span>
                                        <input
                                            type="number"
                                            value={inflationCurrent}
                                            onChange={e => setInflationCurrent(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-10 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Inflation Rate (%)</label>
                                        <input
                                            type="number"
                                            value={inflationRate}
                                            onChange={e => setInflationRate(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Time Period (Years)</label>
                                        <input
                                            type="number"
                                            value={inflationYears}
                                            onChange={e => setInflationYears(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-6">
                                    <h4 className="text-sm font-bold text-slate-300 mb-4">What does this mean?</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        To buy the same things that cost <span className="text-white font-bold">{currency}{parseInt(inflationCurrent).toLocaleString()}</span> today,
                                        you will need <span className="text-white font-bold">{currency}{inflationRes.futureCost.toLocaleString()}</span> in {inflationYears} years.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-rose-600 to-pink-700 rounded-[2rem] p-8 text-center shadow-lg relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                    <div className="relative z-10 text-white">
                                        <div className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">Future Cost</div>
                                        <div className="text-5xl font-bold mb-2">{currency}{inflationRes.futureCost.toLocaleString()}</div>
                                        <div className="text-sm opacity-90">Increase: {currency}{(inflationRes.futureCost - inflationCurrent).toLocaleString()}</div>
                                    </div>
                                </div>

                                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                                    <div className="flex items-center gap-2 mb-4 text-slate-400">
                                        <Coins size={16} />
                                        <span className="text-xs font-bold uppercase">Purchasing Power Erosion</span>
                                    </div>
                                    <div className="relative h-4 bg-slate-900 rounded-full overflow-hidden mb-2">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-emerald-500"
                                            style={{ width: `${(inflationRes.purchasingPower / inflationCurrent) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs font-mono">
                                        <span className="text-emerald-400">Value: {Math.round((inflationRes.purchasingPower / inflationCurrent) * 100)}%</span>
                                        <span className="text-slate-500">Lost: {100 - Math.round((inflationRes.purchasingPower / inflationCurrent) * 100)}%</span>
                                    </div>
                                    <p className="mt-4 text-xs text-slate-500">
                                        Your <span className="text-slate-300 font-bold">{currency}{parseInt(inflationCurrent).toLocaleString()}</span> today will only be worth <span className="text-emerald-400 font-bold">{currency}{inflationRes.purchasingPower.toLocaleString()}</span> in {inflationYears} years.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

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

                    {tab === 'emi' && (
                        <div className="space-y-8">
                            {/* Templates */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {loanTemplates.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => applyTemplate(t)}
                                        className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${loanType === t.id ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                                    >
                                        <t.icon size={24} />
                                        <span className="font-bold text-sm">{t.label}</span>
                                        <span className="text-xs opacity-60">{t.rate}% / {t.tenure}y</span>
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Loan Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-4 text-slate-500 font-bold">{currency}</span>
                                            <input
                                                type="number"
                                                value={emiPrincipal}
                                                onChange={e => setEmiPrincipal(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pl-10 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors"
                                            />
                                        </div>
                                        <input type="range" min="10000" max="10000000" step="10000" value={emiPrincipal} onChange={e => setEmiPrincipal(e.target.value)} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500 mt-4" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Interest (%)</label>
                                            <input type="number" value={emiRate} onChange={e => { setEmiRate(e.target.value); setLoanType('custom'); }} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tenure (Yrs)</label>
                                            <input type="number" value={emiTenure} onChange={e => { setEmiTenure(e.target.value); setLoanType('custom'); }} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors" />
                                        </div>
                                    </div>

                                    <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <PieChart size={16} className="text-primary-400" />
                                            <span className="text-sm font-bold text-slate-300">Prepayment Strategy</span>
                                        </div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Extra Monthly Payment</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-4 text-slate-500 font-bold">{currency}</span>
                                            <input
                                                type="number"
                                                value={prepayment}
                                                onChange={e => setPrepayment(e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 pl-10 text-white font-mono text-lg focus:border-primary-500 outline-none transition-colors"
                                                placeholder="0"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">Add an extra amount to your monthly EMI to save interest.</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-center shadow-lg relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                        <div className="relative z-10 text-white">
                                            <div className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">Monthly EMI</div>
                                            <div className="text-5xl font-bold mb-2">{currency}{Math.round(emiResult.emi).toLocaleString()}</div>
                                            <div className="text-sm opacity-90">for {emiTenure} years</div>
                                        </div>
                                    </div>

                                    {emiResult.savedInterest > 0 ? (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 space-y-4 animate-fade-in">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-400">
                                                    <TrendingUp size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-emerald-400">Smart Savings Active</div>
                                                    <div className="text-xs text-emerald-500/60">By paying {currency}{prepayment} extra/month</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-950/50 rounded-xl p-3">
                                                    <div className="text-xs text-slate-500 uppercase mb-1">Interest Saved</div>
                                                    <div className="text-lg font-bold text-emerald-400 font-mono">{currency}{Math.round(emiResult.savedInterest).toLocaleString()}</div>
                                                </div>
                                                <div className="bg-slate-950/50 rounded-xl p-3">
                                                    <div className="text-xs text-slate-500 uppercase mb-1">Time Saved</div>
                                                    <div className="text-lg font-bold text-emerald-400 font-mono">{(emiResult.timeSaved / 12).toFixed(1)} Yrs</div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-400">Principal Amount</span>
                                                <span className="text-white font-mono font-bold">{currency}{parseFloat(emiPrincipal).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-400">Total Interest</span>
                                                <span className="text-red-400 font-mono font-bold">+{currency}{Math.round(emiResult.totalInterest).toLocaleString()}</span>
                                            </div>
                                            <div className="border-t border-slate-800 my-2"></div>
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-white font-bold">Total Payment</span>
                                                <span className="text-emerald-400 font-mono font-bold text-xl">{currency}{Math.round(emiResult.totalPayment).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )}

                                    {emiResult.savedInterest > 0 && (
                                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-sm font-bold text-slate-400">Original vs New</span>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                                        <span>Original Interest</span>
                                                        <span>{currency}{Math.round(emiResult.totalInterest).toLocaleString()}</span>
                                                    </div>
                                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-red-500/50 w-full"></div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                                        <span>New Interest</span>
                                                        <span>{currency}{Math.round(emiResult.totalInterest - emiResult.savedInterest).toLocaleString()}</span>
                                                    </div>
                                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-500 w-full transition-all duration-500"
                                                            style={{ width: `${((emiResult.totalInterest - emiResult.savedInterest) / emiResult.totalInterest) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
