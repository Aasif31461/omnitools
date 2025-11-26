import React, { useState, useEffect } from 'react';
import { Clock, AlarmClock, Hourglass, Database, Calendar, RotateCcw, Play, Pause, Flag, ArrowRightLeft, Copy } from 'lucide-react';

const TimeSuite = () => {
    const [tab, setTab] = useState('stopwatch');

    // Stopwatch State
    const [swTime, setSwTime] = useState(0);
    const [swRunning, setSwRunning] = useState(false);
    const [laps, setLaps] = useState([]);

    useEffect(() => {
        let interval;
        if (swRunning) {
            const startTime = Date.now() - swTime;
            interval = setInterval(() => {
                setSwTime(Date.now() - startTime);
            }, 10);
        }
        return () => clearInterval(interval);
    }, [swRunning]);

    const toggleSw = () => setSwRunning(!swRunning);
    const resetSw = () => { setSwRunning(false); setSwTime(0); setLaps([]); };
    const addLap = () => {
        setLaps(prev => [{ time: swTime, split: swTime - (prev[0]?.time || 0) }, ...prev]);
    };

    // Timer State
    const [cdRunning, setCdRunning] = useState(false);
    const [cdTotal, setCdTotal] = useState(300000); // 5 min default
    const [cdLeft, setCdLeft] = useState(300000);

    useEffect(() => {
        let interval;
        if (cdRunning && cdLeft > 0) {
            const endTime = Date.now() + cdLeft;
            interval = setInterval(() => {
                const left = endTime - Date.now();
                if (left <= 0) {
                    setCdLeft(0);
                    setCdRunning(false);
                    // Optional: Play sound or show notification
                } else {
                    setCdLeft(left);
                }
            }, 50);
        }
        return () => clearInterval(interval);
    }, [cdRunning]);

    const startTimer = (ms) => {
        setCdTotal(ms);
        setCdLeft(ms);
        setCdRunning(true);
    };

    const toggleCd = () => {
        if (cdLeft <= 0) {
            startTimer(cdTotal); // Restart
        } else {
            setCdRunning(!cdRunning);
        }
    };

    // Unix State
    const [unixTs, setUnixTs] = useState(Math.floor(Date.now() / 1000));
    const [liveUnix, setLiveUnix] = useState(Math.floor(Date.now() / 1000));

    useEffect(() => {
        const interval = setInterval(() => setLiveUnix(Math.floor(Date.now() / 1000)), 1000);
        return () => clearInterval(interval);
    }, []);

    // Date Calc State
    const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
    const [addDays, setAddDays] = useState(0);

    // Pomodoro State
    const [pomoMode, setPomoMode] = useState('focus'); // focus, break
    const [pomoTime, setPomoTime] = useState(25 * 60 * 1000);
    const [pomoRunning, setPomoRunning] = useState(false);
    const [pomoTotal, setPomoTotal] = useState(25 * 60 * 1000);

    useEffect(() => {
        let interval;
        if (pomoRunning && pomoTime > 0) {
            interval = setInterval(() => {
                setPomoTime(prev => {
                    if (prev <= 1000) {
                        setPomoRunning(false);
                        // Auto switch mode logic could go here
                        return 0;
                    }
                    return prev - 1000;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [pomoRunning, pomoTime]);

    const startPomo = (mode) => {
        const time = mode === 'focus' ? 25 * 60 * 1000 : 5 * 60 * 1000;
        setPomoMode(mode);
        setPomoTotal(time);
        setPomoTime(time);
        setPomoRunning(true);
    };

    const togglePomo = () => {
        if (pomoTime === 0) {
            startPomo(pomoMode);
        } else {
            setPomoRunning(!pomoRunning);
        }
    };

    const formatMs = (ms) => {
        const m = Math.floor(ms / 60000).toString().padStart(2, '0');
        const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
        const cs = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
        return `${m}:${s}.${cs}`;
    };

    const formatTime = (ms) => {
        const totalSec = Math.ceil(ms / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getRelativeTime = (dateStr) => {
        if (!dateStr) return '';
        const diff = new Date(dateStr) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        if (days === -1) return 'Yesterday';
        return days > 0 ? `In ${days} days` : `${Math.abs(days)} days ago`;
    };

    const getFutureDate = () => {
        const d = new Date();
        d.setDate(d.getDate() + parseInt(addDays || 0));
        return d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    };

    // Circular Progress Component
    const CircleProgress = ({ progress, colorClass, children }) => {
        const radius = 120;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (progress / 100) * circumference;

        return (
            <div className="relative flex items-center justify-center">
                <svg className="transform -rotate-90 w-64 h-64 md:w-72 md:h-72" viewBox="0 0 288 288">
                    <circle cx="144" cy="144" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                    <circle cx="144" cy="144" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={`${colorClass} transition-all duration-300 ease-linear`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    {children}
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">Time & Date Suite</h2>

            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                {/* Sidebar Navigation */}
                <div className="md:w-64 bg-slate-900 border-r border-slate-800 flex flex-row md:flex-col overflow-x-auto md:overflow-visible">
                    {[
                        { id: 'stopwatch', icon: Clock, label: 'Stopwatch' },
                        { id: 'timer', icon: AlarmClock, label: 'Timer' },
                        { id: 'pomodoro', icon: Hourglass, label: 'Pomodoro' },
                        { id: 'unix', icon: Database, label: 'Unix Time' },
                        { id: 'date', icon: Calendar, label: 'Date Calc' }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setTab(item.id)}
                            className={`flex-1 md:flex-none flex items-center gap-3 p-4 text-sm font-medium transition-all border-b-2 md:border-b-0 md:border-l-2 whitespace-nowrap ${tab === item.id ? 'bg-slate-800 border-primary-500 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                        >
                            <item.icon size={18} className={tab === item.id ? 'text-primary-400' : ''} />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 md:p-10 flex flex-col">

                    {/* STOPWATCH */}
                    {tab === 'stopwatch' && (
                        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
                            <CircleProgress progress={(swTime % 60000) / 600} colorClass="text-emerald-500">
                                <div className="text-5xl font-mono font-bold text-white tabular-nums tracking-tighter">
                                    {formatMs(swTime)}
                                </div>
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Stopwatch</div>
                            </CircleProgress>

                            <div className="flex gap-4 mt-8">
                                <button onClick={resetSw} className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-all" title="Reset"><RotateCcw size={18} /></button>
                                <button onClick={toggleSw} className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all shadow-lg active:scale-95 ${swRunning ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 shadow-red-500/10' : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20'}`}>
                                    {swRunning ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                                </button>
                                <button onClick={addLap} disabled={!swRunning && swTime === 0} className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed" title="Lap"><Flag size={18} /></button>
                            </div>

                            {laps.length > 0 && (
                                <div className="w-full max-w-md mt-8 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex-1 max-h-48 flex flex-col">
                                    <div className="flex justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-bold text-slate-500 uppercase">
                                        <span>Lap</span>
                                        <span>Split</span>
                                        <span>Total</span>
                                    </div>
                                    <div className="overflow-y-auto custom-scrollbar p-2 space-y-1">
                                        {laps.map((lap, i) => (
                                            <div key={i} className="flex justify-between px-3 py-2 rounded hover:bg-slate-900 text-sm font-mono text-slate-300">
                                                <span className="text-slate-500 w-8">#{laps.length - i}</span>
                                                <span className="text-emerald-400">+{formatMs(lap.split)}</span>
                                                <span>{formatMs(lap.time)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TIMER */}
                    {tab === 'timer' && (
                        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
                            <CircleProgress progress={cdTotal > 0 ? (cdLeft / cdTotal) * 100 : 0} colorClass={cdLeft === 0 ? 'text-red-500' : 'text-blue-500'}>
                                <div className={`text-6xl font-mono font-bold tabular-nums tracking-tighter ${cdLeft === 0 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                    {formatTime(cdLeft)}
                                </div>
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">{cdRunning ? 'Running' : (cdLeft === 0 ? "Time's Up" : 'Timer')}</div>
                            </CircleProgress>

                            <div className="flex gap-4 mt-8 mb-8">
                                <button onClick={() => { setCdRunning(false); setCdLeft(cdTotal); }} className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-all" title="Reset"><RotateCcw size={18} /></button>
                                <button onClick={toggleCd} className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all shadow-lg active:scale-95 ${cdRunning ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 shadow-amber-500/10' : 'bg-blue-500 text-white hover:bg-blue-400 shadow-blue-500/20'}`}>
                                    {cdRunning ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                                </button>
                            </div>

                            <div className="grid grid-cols-4 gap-3 w-full max-w-md">
                                {[1, 5, 10, 30].map(m => (
                                    <button key={m} onClick={() => startTimer(m * 60 * 1000)} className="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-colors border border-slate-700 hover:border-slate-600">
                                        {m}m
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4 flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
                                <input type="number" placeholder="Custom min" className="bg-transparent text-white text-sm px-3 py-1 outline-none w-24 text-center" onKeyDown={(e) => { if (e.key === 'Enter') startTimer(parseInt(e.target.value) * 60 * 1000) }} />
                                <button className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-xs font-bold uppercase" onClick={(e) => startTimer(parseInt(e.target.previousSibling.value) * 60 * 1000)}>Set</button>
                            </div>
                        </div>
                    )}

                    {/* POMODORO */}
                    {tab === 'pomodoro' && (
                        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
                            <CircleProgress progress={(pomoTime / pomoTotal) * 100} colorClass={pomoMode === 'focus' ? 'text-rose-500' : 'text-emerald-500'}>
                                <div className="text-6xl font-mono font-bold text-white tabular-nums tracking-tighter">
                                    {formatTime(pomoTime)}
                                </div>
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">{pomoMode}</div>
                            </CircleProgress>

                            <div className="flex gap-4 mt-8 mb-8">
                                <button onClick={() => { setPomoRunning(false); setPomoTime(pomoTotal); }} className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-all" title="Reset"><RotateCcw size={18} /></button>
                                <button onClick={togglePomo} className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all shadow-lg active:scale-95 ${pomoRunning ? (pomoMode === 'focus' ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500') : (pomoMode === 'focus' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white')}`}>
                                    {pomoRunning ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                                </button>
                            </div>

                            <div className="flex gap-4 w-full max-w-xs">
                                <button onClick={() => startPomo('focus')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${pomoMode === 'focus' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                                    Focus (25m)
                                </button>
                                <button onClick={() => startPomo('break')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${pomoMode === 'break' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                                    Break (5m)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* UNIX */}
                    {tab === 'unix' && (
                        <div className="flex-1 space-y-8 animate-fade-in max-w-2xl mx-auto w-full">
                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center relative group">
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Current Unix Timestamp</div>
                                <div className="text-4xl md:text-6xl font-mono font-bold text-emerald-400 tracking-tight">{liveUnix}</div>
                                <button onClick={() => { navigator.clipboard.writeText(liveUnix); }} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Copy size={16} /></button>
                            </div>

                            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
                                <h3 className="font-bold text-white flex items-center gap-2"><ArrowRightLeft size={18} className="text-blue-400" /> Converter</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Unix Timestamp</label>
                                        <input type="number" value={unixTs} onChange={e => setUnixTs(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white font-mono outline-none focus:border-blue-500 transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Human Date</label>
                                        <div className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-300 font-medium min-h-[58px] flex items-center">
                                            {unixTs ? new Date(unixTs * 1000).toLocaleString() : 'Invalid Date'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DATE CALC */}
                    {tab === 'date' && (
                        <div className="flex-1 space-y-8 animate-fade-in max-w-2xl mx-auto w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                                    <label className="block text-xs text-slate-400 uppercase font-bold mb-4">Select Date</label>
                                    <input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white scheme-dark mb-6 focus:border-primary-500 outline-none" />

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                            <span className="text-slate-500 text-sm">Day of Week</span>
                                            <span className="text-white font-bold">{dateInput ? new Date(dateInput).toLocaleDateString('en-US', { weekday: 'long' }) : '--'}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                            <span className="text-slate-500 text-sm">Relative</span>
                                            <span className="text-primary-400 font-bold">{getRelativeTime(dateInput)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col">
                                    <label className="block text-xs text-slate-400 uppercase font-bold mb-4">Add/Subtract Days</label>
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-slate-300 text-sm">Today +</span>
                                        <input type="number" value={addDays} onChange={e => setAddDays(e.target.value)} className="w-20 bg-slate-950 border border-slate-700 rounded-lg p-2 text-center text-white outline-none focus:border-primary-500" />
                                        <span className="text-slate-300 text-sm">days</span>
                                    </div>
                                    <div className="mt-auto bg-slate-950 p-4 rounded-xl text-center border border-slate-800">
                                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Result Date</div>
                                        <div className="text-xl font-bold text-white">{getFutureDate()}</div>
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

export default TimeSuite;
