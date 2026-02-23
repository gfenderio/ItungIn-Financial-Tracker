import React from 'react';
import { useApp } from '../contexts/AppContext';

const LanguageSelectionModal = ({ onSelect }) => {
    const { setLanguage } = useApp();

    const handleSelect = (lang) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
        onSelect();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300"></div>

            {/* Modal */}
            <div className="relative w-full sm:w-[28rem] bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-[2rem] p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300 font-display text-center border-t sm:border border-white/20 dark:border-slate-700">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                        <span className="material-symbols-outlined text-3xl">language</span>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Welcome to ItungIn</h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8">
                        Please select your preferred language to continue. <br /> Silakan pilih bahasa Anda.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => handleSelect('id')}
                            className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🇮🇩</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary">Bahasa Indonesia</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-300 group-hover:text-primary">arrow_forward</span>
                        </button>

                        <button
                            onClick={() => handleSelect('en')}
                            className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🇬🇧</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary">English</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-300 group-hover:text-primary">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LanguageSelectionModal;
