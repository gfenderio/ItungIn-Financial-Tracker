import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

const Profile = () => {
    const { darkMode, toggleDarkMode, language, toggleLanguage, transactions, resetData, resetDemoDataForTour, userProfile, updateUserProfile, showConfirm, debts, accounts, subscriptions } = useApp();

    const [isEditingProfile, setIsEditingProfile] = useState(false);

    const userName = userProfile?.name || (language === 'id' ? 'Pengguna' : 'User');
    const userEmail = userProfile?.email || 'user@example.com';

    const [tempName, setTempName] = useState(userName);
    const [tempEmail, setTempEmail] = useState(userEmail);

    const handleSaveProfile = () => {
        updateUserProfile({ name: tempName, email: tempEmail });
        setIsEditingProfile(false);
    };
    const handleExportJSON = () => {
        const fullBackup = {
            transactions,
            debts,
            accounts,
            subscriptions,
            userProfile,
            version: '1.0.0',
            exportedAt: new Date().toISOString()
        };

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(fullBackup, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `itungin_backup_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();

        // Update last backup date to silence the notification reminder
        localStorage.setItem('lastBackupDate', new Date().toISOString());
        alert(language === 'id' ? "Backup data berhasil diunduh!" : "Data backup downloaded successfully!");
    };

    const handleImportJSON = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // Extremely basic schema validation
                if (data.transactions && data.debts && data.accounts) {
                    resetData(); // Clear first to avoid weird merges if desired, or manually set them

                    // Note: In a real app we would use Context functions to set these directly to force re-renders properly
                    localStorage.setItem('transactions', JSON.stringify(data.transactions));
                    localStorage.setItem('debts', JSON.stringify(data.debts));
                    localStorage.setItem('accounts', JSON.stringify(data.accounts));
                    if (data.subscriptions) localStorage.setItem('subscriptions', JSON.stringify(data.subscriptions));
                    if (data.userProfile) localStorage.setItem('userProfile', JSON.stringify(data.userProfile));

                    alert(language === 'id' ? "Data berhasil dipulihkan! Memuat ulang..." : "Data restored successfully! Reloading...");
                    window.location.reload(); // Hard reload to force context re-initialization from new LocalStorage
                } else {
                    alert(language === 'id' ? "File backup tidak valid." : "Invalid backup file structure.");
                }
            } catch (error) {
                console.error("Import error:", error);
                alert(language === 'id' ? "Gagal membaca file backup." : "Failed to parse backup file.");
            }
        };
        reader.readAsText(file);
    };

    const handleConfirmReset = async () => {
        const isConfirmed = await showConfirm(
            language === 'id' ? 'Hapus Semua Data?' : 'Reset All Data?',
            language === 'id'
                ? 'Tindakan ini tidak dapat dibatalkan. Segala riwayat transaksi, hutang, dan pengaturan profil akan terhapus.'
                : 'This action cannot be undone. All transaction history, debts, and profile settings will be wiped.',
            'error'
        );
        if (isConfirmed) {
            resetData();
            // Optional tiny delay to ensure localStorage catches up
            setTimeout(() => window.location.reload(), 100);
        }
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

                    <div onClick={toggleLanguage} className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-50 dark:border-slate-700">
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

                    <div onClick={() => {
                        resetDemoDataForTour();
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 100);
                    }} className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-purple-500">route</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">
                                {language === 'id' ? 'Ulangi Tur Aplikasi' : 'Replay App Tour'}
                            </span>
                        </div>
                        <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
                    </div>
                </div>
            </section>

            {/* Data & Backup */}
            <section className="mb-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Data</h3>
                <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
                    <div onClick={handleExportJSON} className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-emerald-500">cloud_download</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">
                                {language === 'id' ? 'Ekspor Backup (JSON)' : 'Export Backup (JSON)'}
                            </span>
                        </div>
                        <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
                    </div>

                    <label className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-blue-500">cloud_upload</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">
                                {language === 'id' ? 'Pulihkan Data (JSON)' : 'Restore Data (JSON)'}
                            </span>
                        </div>
                        <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
                        <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                    </label>

                    <div onClick={handleConfirmReset} className="flex items-center justify-between p-4 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group">
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

            <p className="text-center text-xs text-slate-400 mt-8">ItungIn Version 1.0.0</p>
        </div>
    );
};

export default Profile;
