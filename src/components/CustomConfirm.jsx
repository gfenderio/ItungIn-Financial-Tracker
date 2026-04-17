import React from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../contexts/AppContext';

const CustomConfirm = () => {
    const { confirmConfig, hideConfirm, language } = useApp();

    if (!confirmConfig.show) return null;

    const { title, message, type, onConfirm } = confirmConfig;

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        hideConfirm();
    };

    // Style configuration based on type (danger/red, info/indigo, warning/orange)
    let icon = 'info';
    let iconBgClass = 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500';
    let confirmBtnClass = 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30';

    if (type === 'danger') {
        icon = 'warning';
        iconBgClass = 'bg-red-100 dark:bg-red-900/30 text-red-500';
        confirmBtnClass = 'bg-red-500 hover:bg-red-600 shadow-red-500/30';
    } else if (type === 'warning') {
        icon = 'gpp_maybe';
        iconBgClass = 'bg-orange-100 dark:bg-orange-900/30 text-orange-500';
        confirmBtnClass = 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30';
    }

    return createPortal(
        <div style={{ zIndex: 2147483647 }} className="fixed inset-0 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 dark:bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={hideConfirm}
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">

                <div className={`w-16 h-16 rounded-3xl ${iconBgClass} flex items-center justify-center mb-4`}>
                    <span className="material-symbols-outlined text-4xl">{icon}</span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{message}</p>

                <div className="flex items-center gap-3 w-full">
                    <button
                        onClick={hideConfirm}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 h-12 rounded-full font-bold text-sm transition-colors"
                    >
                        {language === 'id' ? 'Batal' : 'Cancel'}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`flex-1 text-white h-12 rounded-full font-bold text-sm shadow-xl transition-all ${confirmBtnClass}`}
                    >
                        {language === 'id' ? 'Ya, Lanjutkan' : 'Yes, Confirm'}
                    </button>
                </div>

            </div>
        </div>, document.body
    );
};

export default CustomConfirm;
