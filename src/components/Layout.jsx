import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import CustomAlert from './CustomAlert';
import CustomConfirm from './CustomConfirm';
import OnboardingModal from './OnboardingModal';
import NotificationsPanel from './NotificationsPanel';
import AppTourOverlay from './AppTourOverlay';

const Layout = () => {
    const { darkMode, toggleDarkMode, notifications, markAllNotificationsAsRead, markNotificationAsRead, language, hasCompletedOnboarding } = useApp();
    const location = useLocation();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);

    // Hide bottom nav on Add Transaction page and Detail pages
    const showBottomNav = location.pathname !== '/add' && !location.pathname.startsWith('/transaction/');

    // Count unread
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="bg-slate-50 dark:bg-slate-900 font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-300">
            <OnboardingModal />
            <CustomAlert />
            <CustomConfirm />
            {/* Top Header Navigation */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => navigate('/')}
                >
                    <div className="bg-primary rounded-xl p-2 shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform duration-300">
                        <span className="material-symbols-outlined text-white">account_balance_wallet</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white leading-none">
                            Itung<span className="text-primary">In</span>
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Personal Finance</p>
                    </div>
                </div>
                <div className="flex gap-2 relative">
                    <button onClick={toggleDarkMode} className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">
                            {darkMode ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors relative"
                    >
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    <NotificationsPanel
                        show={showNotifications}
                        onClose={() => setShowNotifications(false)}
                    />
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pb-24">
                <Outlet />
            </main>

            {/* Bottom Navigation Bar */}
            {showBottomNav && (
                <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 px-6 py-3 pb-6 flex items-center justify-between z-40">
                    <NavLink id="nav-dashboard" to="/" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-200 ${isActive ? 'text-primary scale-110' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                        <span className={`material-symbols-outlined ${location.pathname === '/' ? 'filled-icon' : ''}`}>grid_view</span>
                        <span className="text-[10px] font-medium">Dashboard</span>
                    </NavLink>
                    <NavLink id="nav-transactions" to="/transactions" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-200 ${isActive ? 'text-primary scale-110' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                        <span className="material-symbols-outlined">receipt_long</span>
                        <span className="text-[10px] font-medium">Transactions</span>
                    </NavLink>
                    <NavLink id="nav-debt" to="/debt" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-200 ${isActive ? 'text-primary scale-110' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                        <span className="material-symbols-outlined">account_balance</span>
                        <span className="text-[10px] font-medium">Debt</span>
                    </NavLink>
                    <NavLink id="nav-bills" to="/subscriptions" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-200 ${isActive ? 'text-primary scale-110' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                        <span className="material-symbols-outlined">event_repeat</span>
                        <span className="text-[10px] font-medium">Bills</span>
                    </NavLink>
                    <NavLink id="nav-profile" to="/profile" className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-200 ${isActive ? 'text-primary scale-110' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                        <span className="material-symbols-outlined">person</span>
                        <span className="text-[10px] font-medium">Profile</span>
                    </NavLink>
                </nav>
            )}
        </div>
    );
};

export default Layout;
