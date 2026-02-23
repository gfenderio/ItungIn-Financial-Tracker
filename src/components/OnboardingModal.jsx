import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const OnboardingModal = () => {
    const { hasCompletedOnboarding, completeOnboarding, language, setLanguage, toggleDarkMode, darkMode, showAlert } = useApp();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [optIn, setOptIn] = useState(true);

    if (hasCompletedOnboarding) return null;

    const handleSelectLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const handleNext = () => setStep(2);

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleFinish = () => {
        if (!name.trim()) {
            showAlert(language === 'id' ? 'Nama Panggilan tidak boleh kosong.' : 'Preferred Name cannot be empty.', 'error');
            return;
        }

        if (!email || !validateEmail(email)) {
            showAlert(language === 'id' ? 'Format email tidak valid atau kosong.' : 'Email is empty or invalid.', 'error');
            return;
        }

        completeOnboarding({
            name: name.trim(),
            email: email.trim(),
            marketingOptIn: optIn
        });

        // Force routing back to the main dashboard so the tour starts exactly where it should
        navigate('/');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            {/* Solid Backdrop to block everything else out completely */}
            <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900 animate-in fade-in duration-300"></div>

            {/* Modal */}
            <div className="relative w-full sm:w-[28rem] bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 font-display sm:border border-slate-200 dark:border-slate-700">
                {/* Progress Bar (Only visible after Language is chosen) */}
                {step > 0 && (
                    <div className="flex h-1.5 w-full bg-slate-100 dark:bg-slate-700 shrink-0">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: step === 1 ? '50%' : '100%' }}
                        ></div>
                    </div>
                )}

                <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
                    {step === 1 && (
                        <div className="flex flex-col text-center animate-in slide-in-from-right-4 duration-500 relative z-10 w-full max-w-sm mx-auto">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 dark:bg-primary/20 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner rotate-3">
                                <span className="material-symbols-outlined text-3xl sm:text-4xl">waving_hand</span>
                            </div>

                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                                {language === 'id' ? 'Selamat Datang di ItungIn!' : 'Welcome to ItungIn!'}
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                                {language === 'id'
                                    ? 'Aplikasi pelacak keuangan tingkat lanjut. Pantau pengeluaran, kelola hutang, dan lacak tagihan Anda dengan efisien.'
                                    : 'Advanced personal finance tracker. Monitor spending, manage debts, and track your recurring bills efficiently.'}
                            </p>

                            {/* Language Selection Box */}
                            <div className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 mb-4">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
                                    {language === 'id' ? '1. Pilih Bahasa' : '1. Choose Language'}
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleSelectLanguage('id')}
                                        className={`flex flex-col items-center justify-center p-3 sm:py-4 rounded-xl border-2 transition-all ${language === 'id' ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-transparent hover:border-primary/50'}`}
                                    >
                                        <span className="text-2xl sm:text-3xl mb-1">🇮🇩</span>
                                        <span className={`text-xs font-bold ${language === 'id' ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>Indonesia</span>
                                    </button>
                                    <button
                                        onClick={() => handleSelectLanguage('en')}
                                        className={`flex flex-col items-center justify-center p-3 sm:py-4 rounded-xl border-2 transition-all ${language === 'en' ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-transparent hover:border-primary/50'}`}
                                    >
                                        <span className="text-2xl sm:text-3xl mb-1">🇬🇧</span>
                                        <span className={`text-xs font-bold ${language === 'en' ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>English</span>
                                    </button>
                                </div>
                            </div>



                            {/* Theme Selection Box */}
                            <div className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 mb-6">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
                                    {language === 'id' ? '2. Pilih Tema' : '2. Choose Theme'}
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => { if (darkMode) toggleDarkMode(); }}
                                        className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all ${!darkMode ? 'border-primary bg-white shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-transparent hover:border-primary/50 text-slate-400'}`}
                                    >
                                        <span className={`material-symbols-outlined mb-1 ${!darkMode ? 'text-primary' : 'text-slate-400'}`}>light_mode</span>
                                        <span className={`text-xs font-bold ${!darkMode ? 'text-slate-800' : 'text-slate-400'}`}>Light</span>
                                    </button>
                                    <button
                                        onClick={() => { if (!darkMode) toggleDarkMode(); }}
                                        className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all ${darkMode ? 'border-primary bg-slate-800 shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-transparent hover:border-primary/50 text-slate-400'}`}
                                    >
                                        <span className={`material-symbols-outlined mb-1 ${darkMode ? 'text-primary' : 'text-slate-400'}`}>dark_mode</span>
                                        <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-400'}`}>Dark</span>
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleNext}
                                className="w-full bg-primary hover:bg-primary/90 text-white h-12 sm:h-14 rounded-2xl font-bold font-display shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                <span>{language === 'id' ? 'Lanjut Setup Profil' : 'Proceed to Profile Setup'}</span>
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col animate-in slide-in-from-right-4 duration-500">
                            <div className="mb-6">
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                                    {language === 'id' ? 'Profil Anda' : 'Your Profile'}
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                    {language === 'id' ? 'Mari personalisasi pengalaman ItungIn Anda.' : 'Let\'s personalize your ItungIn experience.'}
                                </p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        {language === 'id' ? 'Nama Panggilan' : 'Preferred Name'}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px] sm:text-[20px]">person</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 sm:py-4 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:font-normal placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        {language === 'id' ? 'Alamat Email' : 'Email Address'}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px] sm:text-[20px]">mail</span>
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="john@example.com"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 sm:py-4 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:font-normal placeholder:text-slate-400"
                                        />
                                    </div>
                                    <label className="flex items-start gap-3 mt-4 cursor-pointer group">
                                        <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={optIn}
                                                onChange={(e) => setOptIn(e.target.checked)}
                                                className="peer appearance-none w-4 h-4 sm:w-5 sm:h-5 border-2 border-slate-300 dark:border-slate-600 rounded-md checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                                            />
                                            <span className="material-symbols-outlined absolute text-white text-[14px] sm:text-[16px] scale-0 peer-checked:scale-100 transition-transform pointer-events-none">check</span>
                                        </div>
                                        <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors leading-snug">
                                            {language === 'id'
                                                ? 'Saya setuju menerima email tips keuangan dan pembaruan sistem.'
                                                : 'I agree to receive financial tips and system updates.'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <button
                                onClick={handleFinish}
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 h-12 sm:h-14 rounded-2xl font-black font-display shadow-lg shadow-slate-900/10 dark:shadow-white/10 transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                <span>{language === 'id' ? 'Masuk ke Dashboard' : 'Enter Dashboard'}</span>
                                <span className="material-symbols-outlined text-[18px]">verified</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;
