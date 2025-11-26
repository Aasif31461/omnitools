import React, { useState, useEffect } from 'react';
import { Coins, RefreshCw } from 'lucide-react';

const CURRENCIES = {
    USD: { name: 'United States Dollar', symbol: '$' },
    EUR: { name: 'Euro', symbol: '€' },
    GBP: { name: 'British Pound Sterling', symbol: '£' },
    JPY: { name: 'Japanese Yen', symbol: '¥' },
    INR: { name: 'Indian Rupee', symbol: '₹' },
    AUD: { name: 'Australian Dollar', symbol: 'A$' },
    CAD: { name: 'Canadian Dollar', symbol: 'C$' },
    CHF: { name: 'Swiss Franc', symbol: 'CHF' },
    CNY: { name: 'Chinese Yuan', symbol: '¥' },
    NZD: { name: 'New Zealand Dollar', symbol: 'NZ$' },
    SGD: { name: 'Singapore Dollar', symbol: 'S$' },
    HKD: { name: 'Hong Kong Dollar', symbol: 'HK$' },
    SEK: { name: 'Swedish Krona', symbol: 'kr' },
    KRW: { name: 'South Korean Won', symbol: '₩' },
    BRL: { name: 'Brazilian Real', symbol: 'R$' },
    RUB: { name: 'Russian Ruble', symbol: '₽' },
    ZAR: { name: 'South African Rand', symbol: 'R' },
    MXN: { name: 'Mexican Peso', symbol: 'Mex$' },
    AED: { name: 'United Arab Emirates Dirham', symbol: 'د.إ' },
    THB: { name: 'Thai Baht', symbol: '฿' }
};

const CurrencyConverter = () => {
    const [amount, setAmount] = useState('1');
    const [from, setFrom] = useState('USD');
    const [to, setTo] = useState('INR');
    const [rate, setRate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchRate = async () => {
        setLoading(true);
        try {
            const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
            const data = await res.json();
            const newRate = data.rates[to];
            setRate(newRate);
            setLastUpdated(new Date().toLocaleTimeString());
        } catch (err) {
            console.error("Failed to fetch rates", err);
            // Fallback hardcoded rates if API fails
            const fallbackRates = { USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.5, JPY: 150.2 };
            const fromRate = fallbackRates[from] || 1;
            const toRate = fallbackRates[to] || 1;
            setRate(toRate / fromRate);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRate();
    }, [from, to]);

    const converted = amount && rate ? (parseFloat(amount) * rate).toFixed(2) : '...';

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">Currency Converter</h2>
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                    {/* From */}
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">From</label>
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 focus-within:border-yellow-500 transition-colors">
                            <select
                                value={from}
                                onChange={e => setFrom(e.target.value)}
                                className="bg-transparent text-slate-400 text-sm font-bold outline-none cursor-pointer hover:text-white"
                            >
                                {Object.keys(CURRENCIES).map(c => <option key={c} value={c} className="bg-slate-900">{c} - {CURRENCIES[c].name}</option>)}
                            </select>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl text-slate-500 font-light">{CURRENCIES[from]?.symbol}</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full bg-transparent text-4xl font-light text-white outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Exchange Icon */}
                    <div className="bg-slate-800 p-4 rounded-full text-yellow-500 shadow-lg shadow-yellow-500/20">
                        {loading ? <RefreshCw size={24} className="animate-spin" /> : <Coins size={24} />}
                    </div>

                    {/* To */}
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">To</label>
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
                            <select
                                value={to}
                                onChange={e => setTo(e.target.value)}
                                className="bg-transparent text-slate-400 text-sm font-bold outline-none cursor-pointer hover:text-white"
                            >
                                {Object.keys(CURRENCIES).map(c => <option key={c} value={c} className="bg-slate-900">{c} - {CURRENCIES[c].name}</option>)}
                            </select>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl text-slate-500 font-light">{CURRENCIES[to]?.symbol}</span>
                                <div className="text-4xl font-light text-yellow-400 overflow-hidden text-ellipsis">{converted}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rate Info */}
                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-sm font-medium">
                        1 {from} = <span className="text-white font-bold">{rate ? rate.toFixed(4) : '...'}</span> {to}
                    </p>
                    <p className="text-slate-600 text-xs mt-1">
                        {loading ? "Fetching live rates..." : `Live rates from open API (Updated: ${lastUpdated || 'Just now'})`}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CurrencyConverter;
