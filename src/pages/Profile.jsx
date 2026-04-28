import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import TermsModal from '../components/TermsModal';

const Profile = () => {
    const { darkMode, toggleDarkMode, language, toggleLanguage, transactions, resetData, resetDemoDataForTour, userProfile, updateUserProfile, showConfirm, debts, accounts, subscriptions, currentUser, googleSignIn, signOut, showAlert } = useApp();

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    const isGuest = userProfile?.isGuest || !currentUser;
    const userName = isGuest ? 'Guest' : (userProfile?.name || currentUser?.displayName || (language === 'id' ? 'Pengguna' : 'User'));
    const userEmail = isGuest ? '' : (userProfile?.email || currentUser?.email || 'user@example.com');
    const userPhoto = userProfile?.photoURL || currentUser?.photoURL || null;

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
                {isGuest ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 text-3xl">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Guest</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {language === 'id' ? 'Akun Lokal' : 'Local Account'}
                                </p>
                            </div>
                        </div>
                        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-xl p-4 mt-2">
                            <div className="flex items-start gap-3 mb-3">
                                <span className="material-symbols-outlined text-primary text-xl">cloud_sync</span>
                                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {language === 'id' ? 'Hubungkan akun Google Anda untuk mengaktifkan sinkronisasi awan, fitur Ekspor/Impor, dan melindungi data Anda.' : 'Connect your Google account to enable cloud sync, Export/Import features, and protect your data.'}
                                </p>
                            </div>
                            <button
                                onClick={async () => {
                                    setIsSigningIn(true);
                                    try {
                                        await googleSignIn();
                                        showAlert(language === 'id' ? 'Berhasil terhubung dengan Google!' : 'Successfully connected to Google!', 'success');
                                    } catch (e) {
                                        showAlert(language === 'id' ? 'Gagal menghubungkan akun Google.' : 'Failed to connect Google account.', 'error');
                                    } finally {
                                        setIsSigningIn(false);
                                    }
                                }}
                                disabled={isSigningIn}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm text-sm disabled:opacity-60"
                            >
                                {isSigningIn ? (
                                    <svg className="animate-spin h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                ) : (
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                )}
                                {isSigningIn ? (language === 'id' ? 'Menghubungkan...' : 'Connecting...') : (language === 'id' ? 'Hubungkan Akun Google' : 'Connect Google Account')}
                            </button>
                        </div>
                    </div>
                ) : !isEditingProfile ? (
                    <div>
                        <div className="flex items-center gap-4 cursor-pointer group mb-3" onClick={() => { setIsEditingProfile(true); setTempName(userName); setTempEmail(userEmail); }}>
                            {userPhoto ? (
                                <img src={userPhoto} alt={userName} className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/60 transition-all shrink-0" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold group-hover:scale-105 transition-transform shrink-0">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors truncate">{userName}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                                    <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                    <span className="truncate">{userEmail}</span>
                                </p>
                            </div>
                            <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors shrink-0">edit</span>
                        </div>
                        {/* Sign Out Button */}
                        <button
                            onClick={async () => {
                                setIsSigningOut(true);
                                try {
                                    const confirmed = await showConfirm(
                                        language === 'id' ? 'Keluar dari Akun?' : 'Sign Out?',
                                        language === 'id' ? 'Anda akan keluar. Data Anda aman tersimpan di cloud.' : 'You will be signed out. Your data is safely stored in the cloud.',
                                        'info'
                                    );
                                    if (confirmed) await signOut();
                                } catch (e) {
                                    showAlert(language === 'id' ? 'Gagal keluar.' : 'Sign out failed.', 'error');
                                } finally {
                                    setIsSigningOut(false);
                                }
                            }}
                            disabled={isSigningOut}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold text-sm transition-colors disabled:opacity-60"
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            {isSigningOut ? (language === 'id' ? 'Keluar...' : 'Signing out...') : (language === 'id' ? 'Keluar dari Akun Google' : 'Sign Out from Google')}
                        </button>
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
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</p>
                                <span className="text-[10px] text-primary font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[10px]">verified</span>
                                    Verified
                                </span>
                            </div>
                            <input
                                type="email"
                                readOnly
                                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm text-slate-400 outline-none cursor-not-allowed"
                                value={tempEmail}
                            />
                        </div>
                        <button
                            onClick={handleSaveProfile}
                            className="w-full bg-primary text-white font-bold py-2 rounded-xl mt-2 hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
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

                    <div onClick={() => setShowTerms(true)} className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-50 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-amber-500">menu_book</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">
                                {language === 'id' ? 'Syarat & Ketentuan' : 'Terms & Conditions'}
                            </span>
                        </div>
                        <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
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

                    <div onClick={async () => {
                        const confirmed = await showConfirm(
                            language === 'id' ? 'Reset ItungIn Plus?' : 'Reset ItungIn Plus?',
                            language === 'id'
                                ? 'Seluruh data pembelian simulasi akan dihapus. Lanjutkan?'
                                : 'All simulated purchase data will be wiped. Proceed?',
                            'danger'
                        );
                        if(confirmed) {
                            localStorage.removeItem('hasLifetimePremium');
                            localStorage.removeItem('premiumUnlockTime');
                            window.location.reload();
                        }
                    }} className="flex items-center justify-between p-4 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors border-t border-slate-50 dark:border-slate-700">
                        <div className="flex items-center gap-3 text-orange-500">
                            <span className="material-symbols-outlined">money_off</span>
                            <span className="font-medium">Reset Premium (Debug)</span>
                        </div>
                        <span className="material-symbols-outlined text-sm text-orange-500">chevron_right</span>
                    </div>
                </div>
            </section>

            {/* Data & Backup */}
            <section className="mb-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Data</h3>
                <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
                    {isGuest ? (
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-50 dark:border-slate-700">
                            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 text-center py-2">
                                <span className="material-symbols-outlined text-[16px] text-amber-500">lock</span>
                                {language === 'id' 
                                    ? 'Fitur Backup Data terkunci di Mode Guest.' 
                                    : 'Backup features are locked in Guest Mode.'}
                            </p>
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}

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
            
            <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
        </div>
    );
};

export default Profile;
