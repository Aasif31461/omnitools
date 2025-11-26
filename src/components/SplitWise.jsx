import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Users, X, Plus, Download, Receipt, ChevronDown, Trash2, BarChart, CheckCircle, ArrowRight } from 'lucide-react';
import BalanceChart from './BalanceChart';

const SplitWise = () => {
    const currency = '$'; // Default currency if not passed or global

    // Persistent State Initialization
    const [data, setData] = useState(() => {
        try {
            const saved = localStorage.getItem('omni-splitwise');
            return saved ? JSON.parse(saved) : { members: ['Alice', 'Bob'], expenses: [] };
        } catch (e) {
            return { members: ['Alice', 'Bob'], expenses: [] };
        }
    });

    const { members, expenses } = data;
    const [newMember, setNewMember] = useState('');
    const [newExp, setNewExp] = useState({ payer: members[0] || '', amount: '', desc: '' });

    useEffect(() => {
        localStorage.setItem('omni-splitwise', JSON.stringify(data));
    }, [data]);

    useEffect(() => {
        if (members.length > 0 && !members.includes(newExp.payer)) {
            setNewExp(prev => ({ ...prev, payer: members[0] }));
        }
    }, [members, newExp.payer]);

    const addMember = () => {
        if (newMember.trim() && !members.includes(newMember.trim())) {
            setData(prev => ({ ...prev, members: [...prev.members, newMember.trim()] }));
            setNewMember('');
        }
    };

    const removeMember = (member) => {
        const isPayer = expenses.some(e => e.payer === member);
        if (isPayer) {
            alert(`Cannot remove ${member} because they have paid for expenses. Delete those expenses first.`);
            return;
        }
        setData(prev => ({ ...prev, members: prev.members.filter(m => m !== member) }));
    };

    const addExpense = () => {
        if (newExp.amount && newExp.desc && newExp.payer) {
            const expense = {
                ...newExp,
                id: Date.now(),
                amount: parseFloat(newExp.amount),
                date: new Date().toISOString()
            };
            setData(prev => ({ ...prev, expenses: [...prev.expenses, expense] }));
            setNewExp({ ...newExp, amount: '', desc: '' });
        }
    };

    const removeExpense = (id) => {
        setData(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
    };

    const clearAll = () => {
        if (window.confirm("Are you sure you want to clear all data?")) {
            setData({ members: ['Alice', 'Bob'], expenses: [] });
        }
    };

    const stats = useMemo(() => {
        const balances = {};
        members.forEach(m => balances[m] = 0);
        let totalSpent = 0;

        expenses.forEach(e => {
            totalSpent += e.amount;
            const splitAmount = e.amount / members.length;
            if (balances[e.payer] !== undefined) balances[e.payer] += e.amount;
            members.forEach(m => {
                if (balances[m] !== undefined) balances[m] -= splitAmount;
            });
        });

        const memberBalances = Object.entries(balances).map(([name, amount]) => ({ name, amount }));

        const debtors = memberBalances.filter(m => m.amount < -0.01).sort((a, b) => a.amount - b.amount);
        const creditors = memberBalances.filter(m => m.amount > 0.01).sort((a, b) => b.amount - a.amount);

        const transactions = [];
        let i = 0; let j = 0;

        const dCalc = debtors.map(d => ({ ...d }));
        const cCalc = creditors.map(c => ({ ...c }));

        while (i < dCalc.length && j < cCalc.length) {
            const debtor = dCalc[i];
            const creditor = cCalc[j];
            const amount = Math.min(Math.abs(debtor.amount), creditor.amount);
            transactions.push({ from: debtor.name, to: creditor.name, amount });
            debtor.amount += amount;
            creditor.amount -= amount;
            if (Math.abs(debtor.amount) < 0.01) i++;
            if (creditor.amount < 0.01) j++;
        }

        return { totalSpent, balances: memberBalances, transactions };
    }, [expenses, members]);

    const exportData = () => {
        const header = ["Date", "Description", "Payer", "Amount", "Currency"];
        const rows = expenses.map(e => [
            new Date(e.date).toLocaleDateString(),
            `"${e.desc}"`,
            e.payer,
            e.amount,
            currency
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [header.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `splitwise_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white">SplitWise <span className="text-emerald-500">Pro</span></h2>
                <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 border border-red-900/50 hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition">Reset All Data</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-900 border border-slate-800/60 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-20 h-20 bg-emerald-500/5 rounded-bl-full"></div>
                    <div className="flex items-center gap-2 text-emerald-400 text-xs uppercase font-bold tracking-wider mb-2"><Activity size={14} /> Total Group Spend</div>
                    <div className="text-3xl font-black text-white tracking-tight mb-3">{currency}{stats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-800/50">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Per Person</span>
                            <span className="text-sm font-bold text-slate-300">{currency}{(members.length > 0 ? stats.totalSpent / members.length : 0).toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Share</span>
                            <span className="text-sm font-bold text-slate-300">{(members.length > 0 ? 100 / members.length : 0).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800/60 p-5 rounded-2xl flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-blue-400 text-xs uppercase font-bold tracking-wider"><Users size={14} /> Members ({members.length})</div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3 max-h-20 overflow-y-auto custom-scrollbar">
                        {members.map(m => (
                            <span key={m} className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 group relative pr-6 transition-colors hover:border-slate-600">
                                {m}
                                <button onClick={() => removeMember(m)} className="absolute right-1 text-slate-500 hover:text-red-400 transition-colors"><X size={12} /></button>
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="text" value={newMember} onChange={e => setNewMember(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMember()} className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 transition-colors" placeholder="New member name..." />
                        <button onClick={addMember} className="bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-500 transition-transform active:scale-95"><Plus size={14} /></button>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800/60 p-5 rounded-2xl flex items-center justify-center shadow-lg">
                    <button onClick={exportData} className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-white transition-colors group">
                        <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-slate-700 group-hover:scale-110 transition-all"><Download size={24} className="text-emerald-500" /></div>
                        <span className="text-xs font-bold uppercase tracking-wider">Export to CSV</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800/60 shadow-xl">
                        <h3 className="text-sm font-bold text-slate-300 mb-5 flex items-center gap-2 uppercase tracking-wider"><Receipt size={16} className="text-emerald-400" /> Add New Expense</h3>
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative group">
                                    <span className="absolute left-3 top-2.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-emerald-500 transition-colors">Description</span>
                                    <input type="text" value={newExp.desc} onChange={e => setNewExp({ ...newExp, desc: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-3 pr-3 pt-7 text-sm text-white outline-none focus:border-emerald-500 transition-all" placeholder="Dinner, Uber, etc." />
                                </div>
                                <div className="relative group">
                                    <span className="absolute left-3 top-2.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider group-focus-within:text-emerald-500 transition-colors">Amount</span>
                                    <span className="absolute left-3 top-7 text-slate-400 text-sm">{currency}</span>
                                    <input type="number" value={newExp.amount} onChange={e => setNewExp({ ...newExp, amount: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-7 pr-3 pt-7 text-sm text-white outline-none focus:border-emerald-500 transition-all" placeholder="0.00" />
                                </div>
                            </div>
                            <div className="flex gap-3 items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                                <span className="text-xs font-bold text-slate-500 uppercase pl-1">Paid by</span>
                                <div className="flex-1 relative">
                                    <select value={newExp.payer} onChange={e => setNewExp({ ...newExp, payer: e.target.value })} className="w-full appearance-none bg-transparent text-sm text-white outline-none cursor-pointer font-medium pl-2 py-1">
                                        {members.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-0 top-1.5 text-slate-500 pointer-events-none" />
                                </div>
                                <button onClick={addExpense} className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95">Add Expense</button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Activity</h3>
                            <span className="text-[10px] font-medium bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{expenses.length} records</span>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
                            {expenses.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/50">
                                    <Receipt className="mx-auto text-slate-700 mb-3" size={32} />
                                    <p className="text-slate-500 text-sm font-medium">No expenses recorded yet.</p>
                                    <p className="text-slate-600 text-xs mt-1">Add your first expense above to get started.</p>
                                </div>
                            )}
                            {[...expenses].reverse().map(e => (
                                <div key={e.id} className="group flex justify-between items-center bg-slate-900 hover:bg-slate-800 p-4 rounded-xl border border-slate-800 transition-all hover:shadow-lg hover:border-slate-700">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-slate-300 font-bold text-sm border border-slate-700 shadow-inner">{e.payer.charAt(0)}</div>
                                        <div>
                                            <div className="text-sm text-white font-bold">{e.desc}</div>
                                            <div className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                                                <span>{new Date(e.date).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                                <span className="text-emerald-400">{e.payer} paid {currency}{e.amount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => removeExpense(e.id)} className="text-slate-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-all bg-slate-800/50 rounded-lg"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800/60 shadow-xl">
                        <h3 className="text-sm font-bold text-slate-300 mb-6 flex items-center gap-2 uppercase tracking-wider"><BarChart size={16} className="text-blue-400" /> Net Balances</h3>
                        <BalanceChart data={stats.balances} />
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-4 px-2 uppercase tracking-wider border-t border-slate-800 pt-3">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-rose-500 rounded-full"></div> Owes</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Gets Back</span>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800/60 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
                        <h3 className="text-sm font-bold text-slate-300 mb-5 flex items-center gap-2 uppercase tracking-wider"><CheckCircle size={16} className="text-emerald-400" /> Settlement Plan</h3>
                        {stats.transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-2">
                                <CheckCircle size={32} className="text-slate-700" />
                                <p className="text-xs font-medium">All settled up!</p>
                            </div>
                        ) : (
                            <div className="space-y-3 relative z-10">
                                {stats.transactions.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800/80 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-white font-bold bg-slate-800 px-2 py-1 rounded-md">{d.from}</span>
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] text-slate-500 font-bold uppercase">Pays</span>
                                                <ArrowRight size={12} className="text-slate-600" />
                                            </div>
                                            <span className="text-xs text-white font-bold bg-slate-800 px-2 py-1 rounded-md">{d.to}</span>
                                        </div>
                                        <div className="text-sm font-bold text-emerald-400">{currency}{d.amount.toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SplitWise;
