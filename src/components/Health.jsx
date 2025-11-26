import React, { useState } from 'react';

const Health = () => {
    const [mode, setMode] = useState('bmi');
    const [height, setHeight] = useState(170);
    const [weight, setWeight] = useState(70);
    const [age, setAge] = useState(25);
    const [gender, setGender] = useState('male');
    const [activity, setActivity] = useState(1.2);

    const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1);
    let bmiStatus = 'Normal';
    let bmiColor = 'text-emerald-400';
    let bmiPercent = 50; // For gauge

    if (bmi < 18.5) { bmiStatus = 'Underweight'; bmiColor = 'text-blue-400'; bmiPercent = 20; }
    else if (bmi >= 25 && bmi < 30) { bmiStatus = 'Overweight'; bmiColor = 'text-yellow-400'; bmiPercent = 80; }
    else if (bmi >= 30) { bmiStatus = 'Obese'; bmiColor = 'text-red-400'; bmiPercent = 95; }

    const bmr = gender === 'male'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    const tdee = Math.round(bmr * activity);

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">Health Station</h2>

            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-[2rem] shadow-xl">
                {/* Tabs */}
                <div className="flex justify-center mb-10">
                    <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 shadow-lg">
                        <button onClick={() => setMode('bmi')} className={`px-8 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'bmi' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>BMI Calculator</button>
                        <button onClick={() => setMode('bmr')} className={`px-8 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'bmr' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Calories (BMR)</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Inputs */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
                                <span>Height</span>
                                <span className="text-white">{height} cm</span>
                            </div>
                            <input
                                type="range"
                                min="100"
                                max="250"
                                value={height}
                                onChange={e => setHeight(parseInt(e.target.value))}
                                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
                                <span>Weight</span>
                                <span className="text-white">{weight} kg</span>
                            </div>
                            <input
                                type="range"
                                min="30"
                                max="200"
                                value={weight}
                                onChange={e => setWeight(parseInt(e.target.value))}
                                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                            />
                        </div>

                        {mode === 'bmr' && (
                            <>
                                <div>
                                    <div className="flex justify-between text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
                                        <span>Age</span>
                                        <span className="text-white">{age} years</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        value={age}
                                        onChange={e => setAge(parseInt(e.target.value))}
                                        className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setGender('male')}
                                        className={`p-4 rounded-xl border transition-all font-bold text-sm flex items-center justify-center gap-2 ${gender === 'male' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                                    >
                                        Male
                                    </button>
                                    <button
                                        onClick={() => setGender('female')}
                                        className={`p-4 rounded-xl border transition-all font-bold text-sm flex items-center justify-center gap-2 ${gender === 'female' ? 'bg-pink-500/20 border-pink-500 text-pink-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                                    >
                                        Female
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Activity Level</label>
                                    <select
                                        value={activity}
                                        onChange={e => setActivity(parseFloat(e.target.value))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:border-primary-500 transition-colors cursor-pointer appearance-none"
                                    >
                                        <option value="1.2">Sedentary (Office job)</option>
                                        <option value="1.375">Light Exercise (1-2 days)</option>
                                        <option value="1.55">Moderate Exercise (3-5 days)</option>
                                        <option value="1.725">Heavy Exercise (6-7 days)</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Results */}
                    <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8 flex flex-col items-center justify-center relative overflow-hidden">
                        {mode === 'bmi' ? (
                            <div className="text-center w-full relative z-10">
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Your BMI Score</div>

                                <div className="relative w-48 h-48 mx-auto mb-6 flex items-center justify-center">
                                    {/* Gauge Background */}
                                    <div className="absolute inset-0 rounded-full border-[12px] border-slate-800"></div>
                                    {/* Gauge Value (Simplified visual) */}
                                    <div
                                        className={`absolute inset-0 rounded-full border-[12px] border-transparent border-t-${bmiColor.split('-')[1]} border-r-${bmiColor.split('-')[1]} transition-all duration-1000`}
                                        style={{ transform: `rotate(${bmiPercent * 1.8}deg)` }}
                                    ></div>

                                    <div className="text-6xl font-bold text-white">{bmi}</div>
                                </div>

                                <div className={`text-2xl font-bold ${bmiColor} mb-2`}>{bmiStatus}</div>
                                <div className="text-xs text-slate-500">Healthy range: 18.5 - 25.0</div>
                            </div>
                        ) : (
                            <div className="w-full relative z-10">
                                <div className="text-center mb-8">
                                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Daily Calorie Needs</div>
                                    <div className="text-5xl font-bold text-white mb-1">{tdee}</div>
                                    <div className="text-sm text-slate-400">kcal / day</div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                                        <span className="text-sm font-bold text-red-400">Lose Weight</span>
                                        <span className="text-lg font-bold text-white">{tdee - 500} <span className="text-xs font-normal text-slate-500">kcal</span></span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                                        <span className="text-sm font-bold text-emerald-400">Maintain</span>
                                        <span className="text-lg font-bold text-white">{tdee} <span className="text-xs font-normal text-slate-500">kcal</span></span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                                        <span className="text-sm font-bold text-blue-400">Gain Weight</span>
                                        <span className="text-lg font-bold text-white">{tdee + 500} <span className="text-xs font-normal text-slate-500">kcal</span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Health;
