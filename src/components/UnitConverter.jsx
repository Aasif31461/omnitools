import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Calculator, Activity, Sparkles } from 'lucide-react';

const UNIT_DATA = {
    length: { m: 'Meter', km: 'Kilometer', cm: 'Centimeter', mm: 'Millimeter', ft: 'Foot', inch: 'Inch', mi: 'Mile', yd: 'Yard' },
    weight: { kg: 'Kilogram', g: 'Gram', mg: 'Milligram', lb: 'Pound', oz: 'Ounce', t: 'Metric Ton' },
    temp: { c: 'Celsius', f: 'Fahrenheit', k: 'Kelvin' },
    area: { m2: 'Square Meter', km2: 'Square Kilometer', ft2: 'Square Foot', ac: 'Acre', ha: 'Hectare', gaj: 'Gaj (Sq Yard)', bigha: 'Bigha (Standard)' },
    volume: { l: 'Liter', ml: 'Milliliter', m3: 'Cubic Meter', gal: 'Gallon (US)', fl_oz: 'Fluid Ounce (US)' },
    speed: { m_s: 'Meter/Second', km_h: 'Km/Hour', mph: 'Miles/Hour', kn: 'Knot' },
    time: { s: 'Second', min: 'Minute', h: 'Hour', d: 'Day', wk: 'Week', mo: 'Month', y: 'Year' },
    pressure: { pa: 'Pascal', bar: 'Bar', psi: 'PSI', atm: 'Atmosphere' },
    energy: { j: 'Joule', kj: 'Kilojoule', cal: 'Calorie', kcal: 'Kilocalorie', wh: 'Watt-hour', kwh: 'Kilowatt-hour' },
    power: { w: 'Watt', kw: 'Kilowatt', hp: 'Horsepower' },
    data: { b: 'Byte', kb: 'Kilobyte', mb: 'Megabyte', gb: 'Gigabyte', tb: 'Terabyte' }
};

const UNIT_FACTORS = {
    length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, inch: 0.0254, mi: 1609.34, yd: 0.9144 },
    weight: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495, t: 1000 },
    area: { m2: 1, km2: 1000000, ft2: 0.092903, ac: 4046.86, ha: 10000, gaj: 0.836127, bigha: 2529.29 },
    volume: { l: 1, ml: 0.001, m3: 1000, gal: 3.78541, fl_oz: 0.0295735 },
    speed: { m_s: 1, km_h: 0.277778, mph: 0.44704, kn: 0.514444 },
    time: { s: 1, min: 60, h: 3600, d: 86400, wk: 604800, mo: 2629800, y: 31557600 },
    pressure: { pa: 1, bar: 100000, psi: 6894.76, atm: 101325 },
    energy: { j: 1, kj: 1000, cal: 4.184, kcal: 4184, wh: 3600, kwh: 3600000 },
    power: { w: 1, kw: 1000, hp: 745.7 },
    data: { b: 1, kb: 1024, mb: 1048576, gb: 1073741824, tb: 1099511627776 }
};

const FORMULAS = {
    Math: [
        { name: 'Pi (π)', value: '3.14159...', desc: 'Ratio of a circle\'s circumference to its diameter.' },
        { name: 'Euler\'s Number (e)', value: '2.71828...', desc: 'Base of the natural logarithm.' },
        { name: 'Golden Ratio (φ)', value: '1.61803...', desc: 'Special number found in geometry and nature.' },
        { name: 'Pythagorean Theorem', value: 'a² + b² = c²', desc: 'Relation between sides of a right triangle.' },
        { name: 'Quadratic Formula', value: 'x = (-b ± √(b²-4ac)) / 2a', desc: 'Solution for ax² + bx + c = 0.' },
        { name: 'Logarithm Rules', value: 'log(ab) = log(a) + log(b)', desc: 'Basic rule for logarithms.' }
    ],
    Geometry: [
        { name: 'Area of Circle', value: 'A = πr²', desc: 'Area enclosed by a circle of radius r.' },
        { name: 'Circumference', value: 'C = 2πr', desc: 'Distance around a circle.' },
        { name: 'Area of Triangle', value: 'A = ½bh', desc: 'Area with base b and height h.' },
        { name: 'Volume of Sphere', value: 'V = ⁴⁄₃πr³', desc: 'Volume of a sphere with radius r.' },
        { name: 'Volume of Cylinder', value: 'V = πr²h', desc: 'Volume with radius r and height h.' },
        { name: 'Surface Area Cube', value: 'A = 6a²', desc: 'Total area of all 6 faces of a cube.' }
    ],
    Physics: [
        { name: 'Speed of Light (c)', value: '299,792,458 m/s', desc: 'Universal physical constant.' },
        { name: 'Gravity (g)', value: '9.80665 m/s²', desc: 'Standard acceleration due to gravity on Earth.' },
        { name: 'Newton\'s Second Law', value: 'F = ma', desc: 'Force equals mass times acceleration.' },
        { name: 'Ohm\'s Law', value: 'V = IR', desc: 'Voltage equals current times resistance.' },
        { name: 'Kinetic Energy', value: 'KE = ½mv²', desc: 'Energy of an object due to its motion.' },
        { name: 'Power', value: 'P = W/t', desc: 'Rate at which work is done.' }
    ],
    Chemistry: [
        { name: 'Avogadro Constant', value: '6.022 x 10²³ mol⁻¹', desc: 'Number of particles in one mole.' },
        { name: 'Ideal Gas Law', value: 'PV = nRT', desc: 'Equation of state for a hypothetical ideal gas.' },
        { name: 'STP Volume', value: '22.4 L/mol', desc: 'Molar volume of an ideal gas at STP.' },
        { name: 'pH Formula', value: 'pH = -log[H⁺]', desc: 'Measure of acidity or basicity.' },
        { name: 'Density', value: 'ρ = m/V', desc: 'Mass per unit volume.' }
    ],
    Finance: [
        { name: 'Simple Interest', value: 'SI = (P × R × T) / 100', desc: 'Interest on principal P at rate R for time T.' },
        { name: 'Compound Interest', value: 'A = P(1 + r/n)^(nt)', desc: 'Interest calculated on principal and accumulated interest.' },
        { name: 'Rule of 72', value: 'Years = 72 / Rate', desc: 'Estimate years to double investment.' },
        { name: 'ROI', value: '((Gain - Cost) / Cost) × 100', desc: 'Return on Investment percentage.' },
        { name: 'Profit Margin', value: '((Rev - Cost) / Rev) × 100', desc: 'Percentage of revenue that is profit.' }
    ],
    Trigonometry: [
        { name: 'Sine Rule', value: 'a/sinA = b/sinB = c/sinC', desc: 'Relates sides and angles of a triangle.' },
        { name: 'Cosine Rule', value: 'c² = a² + b² - 2ab cosC', desc: 'Generalization of Pythagorean theorem.' },
        { name: 'Pythagorean Identity', value: 'sin²θ + cos²θ = 1', desc: 'Fundamental trigonometric identity.' },
        { name: 'Tangent Identity', value: 'tanθ = sinθ / cosθ', desc: 'Ratio of sine to cosine.' },
        { name: 'Double Angle (Sin)', value: 'sin(2θ) = 2sinθcosθ', desc: 'Sine of double angle.' },
        { name: 'Double Angle (Cos)', value: 'cos(2θ) = cos²θ - sin²θ', desc: 'Cosine of double angle.' },
        { name: 'Area of Triangle', value: 'Area = ½ab sinC', desc: 'Area using two sides and included angle.' }
    ]
};

const UnitConverter = () => {
    const [activeTab, setActiveTab] = useState('converter'); // 'converter' or 'reference'
    const [category, setCategory] = useState('length');
    const [amount, setAmount] = useState('1');
    const [fromUnit, setFromUnit] = useState('m');
    const [toUnit, setToUnit] = useState('ft');
    const [result, setResult] = useState(0);

    useEffect(() => {
        const keys = Object.keys(UNIT_DATA[category] || {});
        if (keys.length > 0) {
            setFromUnit(keys[0]);
            setToUnit(keys[1] || keys[0]);
        }
    }, [category]);

    useEffect(() => {
        const val = parseFloat(amount);
        if (isNaN(val)) { setResult(0); return; }
        let res = 0;
        if (category === 'temp') {
            if (fromUnit === toUnit) res = val;
            else if (fromUnit === 'c' && toUnit === 'f') res = (val * 9 / 5) + 32;
            else if (fromUnit === 'c' && toUnit === 'k') res = val + 273.15;
            else if (fromUnit === 'f' && toUnit === 'c') res = (val - 32) * 5 / 9;
            else if (fromUnit === 'f' && toUnit === 'k') res = (val - 32) * 5 / 9 + 273.15;
            else if (fromUnit === 'k' && toUnit === 'c') res = val - 273.15;
            else if (fromUnit === 'k' && toUnit === 'f') res = (val - 273.15) * 9 / 5 + 32;
        } else {
            const factors = UNIT_FACTORS[category];
            if (factors && factors[fromUnit] !== undefined && factors[toUnit] !== undefined) {
                const factorFrom = factors[fromUnit];
                const factorTo = factors[toUnit];
                const inBase = val * factorFrom;
                res = inBase / factorTo;
            } else { res = 0; }
        }
        setResult((!isFinite(res) || isNaN(res)) ? 0 : (Number.isInteger(res) ? res : parseFloat(res.toFixed(6))));
    }, [amount, fromUnit, toUnit, category]);

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">Unit Converter & Formulas</h2>

            {/* Tabs */}
            <div className="flex justify-center mb-8">
                <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex gap-1">
                    <button
                        onClick={() => setActiveTab('converter')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'converter' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        Converter
                    </button>
                    <button
                        onClick={() => setActiveTab('reference')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'reference' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        Formulas & Constants
                    </button>
                </div>
            </div>

            {activeTab === 'converter' ? (
                <>
                    {/* Category Selector */}
                    <div className="mb-8 overflow-x-auto pb-4 custom-scrollbar">
                        <div className="flex gap-3 min-w-max px-2">
                            {Object.keys(UNIT_DATA).map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${category === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                                >
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                        <div className="flex flex-col md:flex-row items-center gap-8">
                            {/* From Section */}
                            <div className="flex-1 w-full space-y-4">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">From</label>
                                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 focus-within:border-indigo-500 transition-colors group">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-transparent text-4xl font-light text-white outline-none mb-2"
                                        placeholder="0"
                                    />
                                    <select
                                        value={fromUnit}
                                        onChange={(e) => setFromUnit(e.target.value)}
                                        className="w-full bg-slate-800 text-slate-400 text-sm font-medium outline-none cursor-pointer hover:text-white transition-colors p-2 rounded-lg"
                                    >
                                        {UNIT_DATA[category] && Object.entries(UNIT_DATA[category]).map(([key, label]) => (
                                            <option key={key} value={key} className="bg-slate-800 text-white">{key} - {label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Swap Button */}
                            <button
                                onClick={() => {
                                    setFromUnit(toUnit);
                                    setToUnit(fromUnit);
                                }}
                                className="p-4 rounded-full bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white transition-all shadow-lg hover:shadow-indigo-600/25 hover:scale-110 active:scale-95 z-10"
                            >
                                <ArrowRightLeft size={24} />
                            </button>

                            {/* To Section */}
                            <div className="flex-1 w-full space-y-4">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">To</label>
                                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 group">
                                    <div className="w-full bg-transparent text-4xl font-light text-indigo-400 mb-2 overflow-hidden text-ellipsis">
                                        {result}
                                    </div>
                                    <select
                                        value={toUnit}
                                        onChange={(e) => setToUnit(e.target.value)}
                                        className="w-full bg-slate-800 text-slate-400 text-sm font-medium outline-none cursor-pointer hover:text-white transition-colors p-2 rounded-lg"
                                    >
                                        {UNIT_DATA[category] && Object.entries(UNIT_DATA[category]).map(([key, label]) => (
                                            <option key={key} value={key} className="bg-slate-800 text-white">{key} - {label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                /* Reference Tab */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(FORMULAS).map(([subject, items]) => (
                        <div key={subject} className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                            <div className="bg-slate-900/80 p-4 border-b border-slate-800">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    {subject === 'Math' && <Calculator size={18} className="text-blue-500" />}
                                    {subject === 'Physics' && <Activity size={18} className="text-purple-500" />}
                                    {subject === 'Chemistry' && <Sparkles size={18} className="text-emerald-500" />}
                                    {subject}
                                </h3>
                            </div>
                            <div className="p-4 space-y-4 flex-1">
                                {items.map((item, idx) => (
                                    <div key={idx} className="group">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="text-sm font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">{item.name}</span>
                                            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{item.value}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UnitConverter;
