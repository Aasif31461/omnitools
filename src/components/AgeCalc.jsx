import React, { useState } from 'react';
import { Cake } from 'lucide-react';

const AgeCalc = () => {
    const [dob, setDob] = useState('');
    const [result, setResult] = useState(null);

    const calculate = () => {
        if (!dob) return;
        const birthDate = new Date(dob);
        const today = new Date();

        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();

        if (days < 0) {
            months--;
            days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        const nextBday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (today > nextBday) nextBday.setFullYear(today.getFullYear() + 1);
        const diffTime = Math.abs(nextBday - today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Calculate total days/weeks/hours for fun stats
        const totalDiff = Math.abs(today - birthDate);
        const totalDays = Math.floor(totalDiff / (1000 * 60 * 60 * 24));
        const totalWeeks = Math.floor(totalDays / 7);
        const totalHours = Math.floor(totalDiff / (1000 * 60 * 60));

        setResult({
            age: { years, months, days },
            next: diffDays,
            stats: { totalDays, totalWeeks, totalHours }
        });
    };

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">Age Calculator</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl flex flex-col justify-center">
                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Date of Birth</label>
                    <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white text-lg outline-none focus:border-primary-500 transition-colors scheme-dark mb-6"
                    />
                    <button
                        onClick={calculate}
                        className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-600/20 active:scale-95 text-lg"
                    >
                        Calculate Age
                    </button>
                </div>

                {/* Result Section */}
                <div className="space-y-6">
                    {result ? (
                        <>
                            {/* Main Age Card */}
                            <div className="bg-gradient-to-br from-primary-600 to-purple-600 p-8 rounded-[2rem] shadow-2xl text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl"></div>

                                <div className="relative z-10">
                                    <div className="text-white/80 text-sm font-bold uppercase tracking-wider mb-2">You are currently</div>
                                    <div className="flex justify-center items-baseline gap-2 mb-2">
                                        <span className="text-6xl font-bold text-white">{result.age.years}</span>
                                        <span className="text-xl text-white/80">years</span>
                                    </div>
                                    <div className="flex justify-center gap-4 text-white/90 font-medium">
                                        <span>{result.age.months} months</span>
                                        <span>•</span>
                                        <span>{result.age.days} days</span>
                                    </div>
                                </div>
                            </div>

                            {/* Next Birthday & Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-5 rounded-2xl text-center">
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Next Birthday</div>
                                    <div className="text-2xl font-bold text-emerald-400">{result.next}</div>
                                    <div className="text-xs text-slate-400">days to go</div>
                                </div>
                                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-5 rounded-2xl text-center">
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Total Weeks</div>
                                    <div className="text-2xl font-bold text-blue-400">{result.stats.totalWeeks.toLocaleString()}</div>
                                    <div className="text-xs text-slate-400">weeks lived</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full bg-slate-900/50 backdrop-blur border border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                            <Cake size={48} className="mb-4 opacity-20" />
                            <p className="text-sm">Enter your birth date to see detailed age stats and countdowns.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgeCalc;
