import React from 'react';

const BalanceChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    const maxVal = Math.max(...data.map(d => Math.abs(d.amount)), 10);

    return (
        <div className="space-y-4 py-2">
            {data.map(d => {
                const isPositive = d.amount >= 0;
                const widthPct = (Math.abs(d.amount) / maxVal) * 100;
                return (
                    <div key={d.name} className="flex items-center text-xs">
                        <div className="w-20 text-right pr-3 text-slate-400 font-medium truncate">{d.name}</div>
                        <div className="flex-1 h-8 bg-slate-950/50 rounded-lg relative flex items-center overflow-hidden border border-slate-800/50">
                            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800"></div>
                            <div
                                className={`h-full transition-all duration-700 ease-out ${isPositive ? 'bg-emerald-500/20 border-r-2 border-emerald-500' : 'bg-rose-500/20 border-l-2 border-rose-500'}`}
                                style={{
                                    width: `${widthPct / 2}%`,
                                    left: isPositive ? '50%' : `calc(50% - ${widthPct / 2}%)`
                                }}
                            ></div>
                            <span className={`absolute ${isPositive ? 'left-[calc(50%+8px)]' : 'right-[calc(50%+8px)]'} ${isPositive ? 'text-emerald-400' : 'text-rose-400'} font-mono font-bold`}>
                                {d.amount > 0 ? '+' : ''}{Math.round(d.amount)}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
};

export default BalanceChart;
