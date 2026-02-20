import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

const CustomAlert = () => {
    const { alertConfig, hideAlert } = useApp();

    if (!alertConfig.show) return null;

    const baseStyles = "fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border animate-in slide-in-from-top-4 fade-in duration-300 w-[90%] max-w-sm";

    const typeStyles = {
        error: "bg-red-500/10 border-red-500/20 text-red-500 backdrop-blur-xl dark:bg-red-900/40 dark:border-red-500/30",
        success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 backdrop-blur-xl dark:bg-emerald-900/40 dark:border-emerald-500/30",
        info: "bg-indigo-500/10 border-indigo-500/20 text-indigo-500 backdrop-blur-xl dark:bg-indigo-900/40 dark:border-indigo-500/30",
    };

    const icons = {
        error: "error",
        success: "check_circle",
        info: "info"
    };

    return (
        <div className={`${baseStyles} ${typeStyles[alertConfig.type] || typeStyles.info}`}>
            <span className="material-symbols-outlined filled-icon">{icons[alertConfig.type] || icons.info}</span>
            <p className="font-bold text-sm tracking-tight flex-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                {alertConfig.message}
            </p>
            <button onClick={hideAlert} className="opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
        </div>
    );
};

export default CustomAlert;
