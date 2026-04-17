import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import TermsModal from './TermsModal';

const OnboardingModal = () => {
    const { hasCompletedOnboarding, completeOnboarding, language, setLanguage, toggleDarkMode, darkMode, showAlert } = useApp();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [optIn, setOptIn] = useState(true);
    const [agreeTnC, setAgreeTnC] = useState(false);
    const [showTnC, setShowTnC] = useState(false);

    if (hasCompletedOnboarding) return null;

    const handleSelectLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const handleNext = () => setStep(2);

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
                                    {language === 'id' ? 'Satu Langkah Lagi' : 'One More Step'}
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                    {language === 'id' 
                                        ? 'Pilih metode masuk Anda. Mode Guest tidak mendukung fitur pencadangan Awan.' 
                                        : 'Choose your sign-in method. Guest Mode does not support Cloud Sync.'}
                                </p>
                            </div>

                            <div className="flex flex-col space-y-4 mb-6">
                                <div className="flex items-start gap-3 bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/20 dark:border-primary/30">
                                    <label className="relative flex items-center justify-center mt-0.5 shrink-0 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={agreeTnC}
                                            onChange={(e) => setAgreeTnC(e.target.checked)}
                                            className="peer appearance-none w-5 h-5 border-2 border-primary/50 rounded-md checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                                        />
                                        <span className="material-symbols-outlined absolute text-white text-[16px] scale-0 peer-checked:scale-100 transition-transform pointer-events-none">check</span>
                                    </label>
                                    <span className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                        {language === 'id' ? 'Saya telah membaca dan menyetujui ' : 'I have read and agree to the '}
                                        <button 
                                            onClick={() => setShowTnC(true)}
                                            className="font-bold underline text-primary hover:text-primary-dark focus:outline-none"
                                        >
                                            {language === 'id' ? 'Syarat & Ketentuan' : 'Terms & Conditions'}
                                        </button>
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (!agreeTnC) {
                                        showAlert(language === 'id' ? 'Mohon centang persetujuan Syarat & Ketentuan.' : 'Please agree to the Terms & Conditions.', 'warning');
                                        return;
                                    }
                                    completeOnboarding({ name: 'Google User', email: 'user@gmail.com', isGuest: false });
                                    showAlert(language === 'id' ? 'Berhasil masuk dengan Google (Mock)' : 'Successfully signed in with Google (Mock)', 'success');
                                    navigate('/');
                                }}
                                className="w-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 h-14 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 active:scale-95 mb-4 shadow-sm"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.78 15.68 17.55V20.34H19.25C21.34 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                                    <path d="M12 23C14.97 23 17.46 22.02 19.25 20.34L15.68 17.55C14.71 18.2 13.45 18.59 12 18.59C9.18 18.59 6.8 16.69 5.96 14.12H2.3V16.96C4.08 20.5 7.74 23 12 23Z" fill="#34A853"/>
                                    <path d="M5.96 14.12C5.74 13.47 5.62 12.75 5.62 12C5.62 11.25 5.74 10.53 5.96 9.88V7.04H2.3C1.56 8.51 1.13 10.2 1.13 12C1.13 13.8 1.56 15.49 2.3 16.96L5.96 14.12Z" fill="#FBBC05"/>
                                    <path d="M12 5.41C13.62 5.41 15.06 5.95 16.2 7.01L19.33 3.88C17.45 2.13 14.97 1 12 1C7.74 1 4.08 3.5 2.3 7.04L5.96 9.88C6.8 7.31 9.18 5.41 12 5.41Z" fill="#EA4335"/>
                                </svg>
                                <span>{language === 'id' ? 'Masuk dengan Google' : 'Sign in with Google'}</span>
                            </button>

                            <button
                                onClick={() => {
                                    if (!agreeTnC) {
                                        showAlert(language === 'id' ? 'Mohon centang persetujuan Syarat & Ketentuan.' : 'Please agree to the Terms & Conditions.', 'warning');
                                        return;
                                    }
                                    completeOnboarding({ name: 'Guest', email: '', isGuest: true });
                                    navigate('/');
                                }}
                                className="w-full bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 h-12 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                <span className="material-symbols-outlined text-lg">no_accounts</span>
                                <span>{language === 'id' ? 'Teruskan sebagai Guest' : 'Continue as Guest'}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <TermsModal 
                isOpen={showTnC} 
                onClose={() => setShowTnC(false)} 
                onAgree={() => { setAgreeTnC(true); setShowTnC(false); }}
                showAgreeButton={true}
            />
        </div>
    );
};

export default OnboardingModal;
