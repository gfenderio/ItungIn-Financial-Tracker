import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export default function Premium() {
    const { isPremium, unlockPremium, language, showAlert } = useApp();
    const navigate = useNavigate();

    const handleUnlock = () => {
        // Simulate ad watch or purchase
        showAlert(language === 'id' ? 'Memuat iklan...' : 'Loading ad...', 'info');
        setTimeout(() => {
            unlockPremium();
            showAlert(language === 'id' ? 'Berhasil! Fitur Premium Terbuka.' : 'Success! Premium Features Unlocked.', 'success');
            // Refresh tour state so unlocked tour can play
            localStorage.removeItem('tour_premium_completed');
        }, 1500);
    };

    if (!isPremium) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col pt-16">
                <header className="px-6 py-6 pb-2 text-center">
                    <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <span className="material-symbols-outlined text-4xl text-amber-500">workspace_premium</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                        {language === 'id' ? 'ItungIn Plus' : 'ItungIn Plus'}
                    </h2>
                    <p className="text-slate-500 max-w-[280px] mx-auto text-sm">
                        {language === 'id'
                            ? 'Buka potensi penuh keuangan Anda dengan fitur lanjutan.'
                            : 'Unlock your full financial potential with advanced features.'}
                    </p>
                </header>

                <main className="flex-1 px-4 py-8 max-w-md mx-auto w-full">
                    <div id="tour-premium-benefits" className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-amber-200 dark:border-amber-900/50 shadow-xl shadow-amber-500/5 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                        <h3 className="font-bold text-slate-800 dark:text-white mb-6 text-lg">
                            {language === 'id' ? 'Keuntungan Premium:' : 'Premium Benefits:'}
                        </h3>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[14px] text-blue-600 dark:text-blue-400">check</span>
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{language === 'id' ? 'Anggaran (Budgets)' : 'Budgets'}</p>
                                    <p className="text-xs text-slate-500">{language === 'id' ? 'Kawal pengeluaran agar tidak jebol.' : 'Guard your spending from breaking limits.'}</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-0.5 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[14px] text-purple-600 dark:text-purple-400">check</span>
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{language === 'id' ? 'Analitik Detail' : 'Deep Analytics'}</p>
                                    <p className="text-xs text-slate-500">{language === 'id' ? 'Wawasan grafis pemasukan & pengeluaran.' : 'Graphical insights of income & expenses.'}</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[14px] text-emerald-600 dark:text-emerald-400">check</span>
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{language === 'id' ? 'Tabungan & Impian' : 'Savings Goals'}</p>
                                    <p className="text-xs text-slate-500">{language === 'id' ? 'Pisahkan uang untuk beli barang impian.' : 'Separate money for your dream purchases.'}</p>
                                </div>
                            </li>
                        </ul>

                        <button
                            onClick={handleUnlock}
                            className="w-full relative overflow-hidden bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2 group"
                        >
                            <span className="material-symbols-outlined icon-filled group-hover:rotate-12 transition-transform">play_circle</span>
                            {language === 'id' ? 'Tonton Iklan untuk Buka' : 'Watch Ad to Unlock'}
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // Unlocked State
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col pt-16">
            <header className="px-6 py-6 pb-4">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-amber-500 text-lg">workspace_premium</span>
                            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                                {language === 'id' ? 'ItungIn Plus' : 'ItungIn Plus'}
                            </h2>
                        </div>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                            {language === 'id' ? 'Kelola fitur premium Anda' : 'Manage your premium features'}
                        </p>
                    </div>
                    {/* Tour Replay Placeholder hook */}
                    <button
                        id="tour-premium-replay"
                        onClick={() => {
                            localStorage.removeItem('tour_premium_completed');
                            window.dispatchEvent(new CustomEvent('start-premium-tour'));
                        }}
                        className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary transition-colors active:scale-95"
                        title={language === 'id' ? 'Ulangi Tur' : 'Replay Tours'}
                    >
                        <span className="material-symbols-outlined">help</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 px-4 space-y-4 pb-24">
                <div
                    id="tour-premium-budgets"
                    onClick={() => navigate('/budgets')}
                    className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer hover:border-primary/50 hover:shadow-md transition-all flex items-center gap-5 active:scale-[0.98]"
                >
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">track_changes</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                            {language === 'id' ? 'Anggaran (Budgets)' : 'Budgets'}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2">
                            {language === 'id' ? 'Tetapkan batas pengeluaran bulanan per kategori dan pantau progresnya.' : 'Set monthly spending limits per category and track your progress.'}
                        </p>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600">chevron_right</span>
                </div>

                <div
                    id="tour-premium-analytics"
                    onClick={() => navigate('/analytics')}
                    className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer hover:border-primary/50 hover:shadow-md transition-all flex items-center gap-5 active:scale-[0.98]"
                >
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl">insights</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                            {language === 'id' ? 'Analitik Detail' : 'Deep Analytics'}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2">
                            {language === 'id' ? 'Gali lebih dalam kebiasaan belanja Anda dengan grafik interaktif.' : 'Dig deeper into your spending habits with interactive charts.'}
                        </p>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600">chevron_right</span>
                </div>

                <div
                    id="tour-premium-savings"
                    onClick={() => navigate('/savings')}
                    className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer hover:border-primary/50 hover:shadow-md transition-all flex items-center gap-5 active:scale-[0.98]"
                >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-2xl">savings</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                            {language === 'id' ? 'Tabungan & Impian' : 'Savings Goals'}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2">
                            {language === 'id' ? 'Kunci sebagian uang Anda secara virtual untuk target masa depan.' : 'Virtually lock away some of your money for future targets.'}
                        </p>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600">chevron_right</span>
                </div>
            </main>
        </div>
    );
}
