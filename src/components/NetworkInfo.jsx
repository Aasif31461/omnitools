import React, { useState, useEffect } from 'react';
import { Globe, Monitor, Smartphone } from 'lucide-react';

const NetworkInfo = () => {
    const [ipData, setIpData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIp = async () => {
            try {
                const res = await fetch('https://api.ipify.org?format=json');
                const data = await res.json();
                setIpData(data);
            } catch (e) {
                setIpData({ ip: 'Unavailable' });
            } finally {
                setLoading(false);
            }
        };
        fetchIp();
    }, []);

    const sysInfo = [
        { label: 'Screen Resolution', value: `${window.screen.width} x ${window.screen.height}` },
        { label: 'Window Size', value: `${window.innerWidth} x ${window.innerHeight}` },
        { label: 'Color Depth', value: `${window.screen.colorDepth}-bit` },
        { label: 'Language', value: navigator.language },
        { label: 'Platform', value: navigator.platform },
        { label: 'Cores', value: navigator.hardwareConcurrency || 'Unknown' },
    ];

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white text-center">Network & System Info</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 text-blue-500">
                        <Globe size={32} />
                    </div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Public IP Address</div>
                    {loading ? (
                        <div className="h-8 w-32 bg-slate-800 rounded animate-pulse"></div>
                    ) : (
                        <div className="text-3xl font-mono font-bold text-white">{ipData?.ip}</div>
                    )}
                </div>

                <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 text-purple-500">
                        <Monitor size={32} />
                    </div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">User Agent</div>
                    <div className="text-xs text-slate-400 font-mono break-all">{navigator.userAgent}</div>
                </div>
            </div>

            <div className="mt-6 bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Smartphone size={20} className="text-emerald-500" /> System Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {sysInfo.map((info, i) => (
                        <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">{info.label}</div>
                            <div className="text-white font-mono font-medium">{info.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NetworkInfo;
