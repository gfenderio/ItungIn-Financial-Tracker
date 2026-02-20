import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

const Profile = () => {
    const { darkMode, toggleDarkMode, language, toggleLanguage, transactions, resetData } = useApp();

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [userName, setUserName] = useState(() => localStorage.getItem('userName') || 'User Name');
    const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || 'user@example.com');
    const [tempName, setTempName] = useState(userName);
    const [tempEmail, setTempEmail] = useState(userEmail);

    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const handleSaveProfile = () => {
        setUserName(tempName);
        setUserEmail(tempEmail);
        localStorage.setItem('userName', tempName);
        localStorage.setItem('userEmail', tempEmail);
        setIsEditingProfile(false);
    };

    const handleExportCSV = () => {
        if (!transactions || transactions.length === 0) {
            alert(language === 'id' ? "Tidak ada data transaksi untuk diekspor." : "No transaction data to export.");
            return;
        }

        const headers = ["ID", "Title", "Amount", "Category", "Date", "Account ID"];
        const rows = transactions.map(t => [
            t.id,
            `"${t.title.replace(/"/g, '""')}"`, // escape quotes
            t.amount,
            `"${t.category}"`,
            t.date,
            t.accountId || ''
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `itungin_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleConfirmReset = () => {
        resetData();
        setShowResetConfirm(false);
        alert(language === 'id' ? "Semua data berhasil direset." : "All data has been reset.");
    };

    return (
        <div className="p-4 max-w-lg mx-auto pb-24 font-display">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">
                {language === 'id' ? 'Profil & Pengaturan' : 'Profile & Settings'}
            </h2>

            {/* User Info Section */}
            <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
                {!isEditingProfile ? (
                    <div className="flex items-center gap-4 cursor-pointer group" onClick={() => { setIsEditingProfile(true); setTempName(userName); setTempEmail(userEmail); }}>
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold group-hover:scale-105 transition-transform">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{userName}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{userEmail}</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">edit</span>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-slate-900 dark:text-slate-100">
                                {language === 'id' ? 'Edit Profil' : 'Edit Profile'}
                            </h3>
                            <button onClick={() => setIsEditingProfile(false)} className="text-slate-400 hover:text-red-500">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Name</p>
                            <input
                                type="text"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                            />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                            <input
                                type="email"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white"
                                value={tempEmail}
                                onChange={(e) => setTempEmail(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleSaveProfile}
                            className="w-full bg-primary text-white font-bold py-2 rounded-xl mt-2 hover:bg-green-600 transition-colors shadow-lg shadow-primary/20"
                        >
                            {language === 'id' ? 'Simpan Perubahan' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </section>

            {/* General Settings */}
            <section className="mb-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                    {language === 'id' ? 'Umum' : 'General'}
                </h3>
                <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400">dark_mode</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">Dark Mode</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={darkMode}
                                onChange={toggleDarkMode}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    <div onClick={toggleLanguage} className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400">language</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">Language</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-lg">
                                {language === 'id' ? 'Indonesian' : 'English'}
                            </span>
                            <span className="material-symbols-outlined text-sm text-slate-400">sync_alt</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Data & Backup */}
            <section className="mb-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Data</h3>
                <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
                    <div onClick={handleExportCSV} className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-emerald-500">download</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">
                                {language === 'id' ? 'Ekspor Data (CSV)' : 'Export Data (CSV)'}
                            </span>
                        </div>
                        <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
                    </div>
                    <div onClick={() => setShowResetConfirm(true)} className="flex items-center justify-between p-4 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-red-400 group-hover:text-red-500">delete_forever</span>
                            <span className="font-medium text-red-500">
                                {language === 'id' ? 'Hapus Semua Data' : 'Reset All Data'}
                            </span>
                        </div>
                        <span className="material-symbols-outlined text-sm text-red-300 group-hover:text-red-500">chevron_right</span>
                    </div>
                </div>
            </section>

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-3xl p-6 shadow-2xl text-center border border-red-500/20">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                            <span className="material-symbols-outlined text-3xl">warning</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                            {language === 'id' ? 'Apakah Anda yakin?' : 'Are you sure?'}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            {language === 'id' ? 'Tindakan ini tidak dapat dibatalkan. Semua transaksi, hutang, dan pengaturan akan dihapus secara permanen.' : 'This action cannot be undone. All transactions, debts, and settings will be permanently deleted.'}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                {language === 'id' ? 'Batal' : 'Cancel'}
                            </button>
                            <button
                                onClick={handleConfirmReset}
                                className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                            >
                                {language === 'id' ? 'Ya, Hapus' : 'Yes, Reset'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <p className="text-center text-xs text-slate-400 mt-8">ItungIn Version 2.0.0</p>
        </div>
    );
};

export default Profile;
