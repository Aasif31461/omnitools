import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const Toast = ({ message, show, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    return (
        <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-800 border border-primary-500/30 text-white px-6 py-3 rounded-xl shadow-2xl shadow-primary-500/20 flex items-center gap-3 transition-all duration-300 z-50 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <div className="bg-primary-500/20 p-1 rounded-full text-primary-400"><CheckCircle size={16} /></div>
            <span className="text-sm font-medium">{message}</span>
        </div>
    );
};

export default Toast;
