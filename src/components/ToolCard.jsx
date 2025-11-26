import React from 'react';

const ToolCard = ({ title, desc, icon: Icon, onClick, colorClass }) => (
    <div onClick={onClick} className="relative overflow-hidden bg-slate-900 p-6 rounded-2xl border border-slate-800/60 cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/10 hover:border-primary-500/30 transition-all duration-300 group h-full">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass.replace('text-', 'from-').replace('500', '500/10')} to-transparent rounded-bl-full -mr-8 -mt-8 transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none`} />
        <div className={`w-12 h-12 rounded-xl ${colorClass} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner`}>
            <Icon size={24} strokeWidth={2} />
        </div>
        <h3 className="text-lg font-bold text-white mb-1 tracking-tight">{title}</h3>
        <p className="text-sm text-slate-400 font-medium">{desc}</p>
    </div>
);

export default ToolCard;
