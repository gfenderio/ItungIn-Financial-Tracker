import React from 'react';
import { useApp } from '../contexts/AppContext';

const NotificationsPanel = ({ show, onClose }) => {
    const { notifications, markNotificationAsRead, markAllNotificationsAsRead, language } = useApp();
    const unreadCount = notifications.filter(n => !n.read).length;

    if (!show) return null;

    return (
        <>
            <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose}></div>
            <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">

                {/* Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-xl">notifications</span>
                        {language === 'id' ? 'Notifikasi' : 'Notifications'}
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ml-1">{unreadCount}</span>
                        )}
                    </h3>
                    {unreadCount > 0 && (
                        <button onClick={markAllNotificationsAsRead} className="text-xs text-primary font-bold hover:text-primary/70 transition-colors">
                            {language === 'id' ? 'Tandai Semua Dibaca' : 'Mark all read'}
                        </button>
                    )}
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto w-full bg-white dark:bg-slate-800 scrollbar-hide">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center">
                            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">notifications_paused</span>
                            <p className="text-slate-500 font-medium text-sm">
                                {language === 'id' ? 'Belum ada pemberitahuan.' : 'No notifications yet.'}
                            </p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => { if (!notif.read) markNotificationAsRead(notif.id); }}
                                className={`p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group ${!notif.read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                            >
                                <div className="flex gap-3">
                                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.read ? 'bg-slate-100 dark:bg-slate-700 text-slate-400' : 'bg-primary/20 text-primary'}`}>
                                        <span className="material-symbols-outlined text-sm">{notif.icon || 'notifications'}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start gap-2 mb-1">
                                            <p className={`text-sm leading-tight ${!notif.read ? 'font-bold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-600 dark:text-slate-400'}`}>
                                                {notif.text}
                                            </p>
                                            {!notif.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1 shadow-[0_0_8px_rgba(14,165,233,0.8)]"></div>}
                                        </div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider inline-flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[10px]">schedule</span>
                                            {notif.time || 'Just now'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationsPanel;
