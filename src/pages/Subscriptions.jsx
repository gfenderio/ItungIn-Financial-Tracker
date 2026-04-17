import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import SubscriptionDetailModal from '../components/SubscriptionDetailModal';

const Subscriptions = () => {
    const { subscriptions, setSubscriptions, addTransaction, showAlert, language } = useApp();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedSub, setSelectedSub] = useState(null);

    // Form states
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [nextDueDate, setNextDueDate] = useState('');
    const [cycleMonths, setCycleMonths] = useState(1);
    const [category, setCategory] = useState('Utilities');
    const [icon, setIcon] = useState('event_repeat');
    const [color, setColor] = useState('cyan');

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const totalMonthlyCost = subscriptions.reduce((acc, curr) => acc + curr.amount, 0);

    const handleAddSubscription = () => {
        const val = parseFloat(amount);
        if (!title || isNaN(val) || !nextDueDate) {
            showAlert(language === 'id' ? 'Lengkapi form dengan benar.' : 'Please complete the form properly.', 'error');
            return;
        }

        if (val <= 0) {
            showAlert(language === 'id' ? 'Masukkan jumlah yang valid dan lebih dari 0' : 'Please enter a valid amount greater than 0', 'error');
            return;
        }

        if (val >= 1000000000000) {
            showAlert(language === 'id' ? 'Nominal maksimal tidak boleh menyentuh 1 Triliun' : 'Maximum value cannot reach 1 Trillion', 'error');
            return;
        }

        const newSub = {
            id: Date.now(),
            title,
            amount: val,
            nextDueDate: new Date(nextDueDate).toISOString(),
            cycleMonths: parseInt(cycleMonths),
            category,
            icon,
            color
        };

        setSubscriptions(prev => [...prev, newSub]);
        showAlert(language === 'id' ? 'Langganan berhasil ditambahkan!' : 'Subscription added securely!', 'success');

        setIsAddModalOpen(false);
        setTitle('');
        setAmount('');
        setNextDueDate('');
        setCycleMonths(1);
    };

    const handlePaySubscription = (sub) => {
        addTransaction({
            id: Date.now(),
            title: sub.title,
            amount: -Math.abs(sub.amount),
            date: new Date().toISOString(),
            category: sub.category,
            icon: sub.icon,
            accountId: '1'
        });
        showAlert(language === 'id' ? `Pembayaran untuk ${sub.title} dicatat.` : `Payment for ${sub.title} recorded.`, 'success');
    };

    const calculateDaysUntilDue = (dueDateStr) => {
        const today = new Date();
        const due = new Date(dueDateStr);

        // Only strip time if we just want strictly calendar days
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);

        const diffTime = due.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-display pb-28 transition-colors duration-300">
            {/* Header Hero - Matches Debt.jsx perfectly */}
            <div id="tour-bills-header" className="p-4 pt-6 bg-cyan-600 rounded-b-3xl text-white shadow-lg shadow-cyan-600/20 mb-6 relative overflow-hidden">
                {/* Abstract Pattern Decoration */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                <div className="relative z-10 flex justify-between items-start mb-4">
                    <p className="text-cyan-100 text-sm font-medium">{language === 'id' ? 'Estimasi Biaya Bulanan' : 'Estimated Monthly Cost'}</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        {language === 'id' ? 'Tambah baru' : 'Add New'}
                    </button>
                </div>
                <div className="relative z-10">
                    <h2 className="text-4xl font-bold mt-1">{formatMoney(totalMonthlyCost)}</h2>
                    <div className="mt-2 flex items-center gap-1 text-xs bg-white/20 w-fit px-2 py-1 rounded-full text-white">
                        <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                        <span>{language === 'id' ? 'Diperbarui setiap bulan' : 'Renews monthly'}</span>
                    </div>
                </div>
            </div>

            <main className="px-4 space-y-4">
                <div className="flex items-center justify-between mb-2 px-2">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{language === 'id' ? 'Tagihan Aktif' : 'Active Bills'}</h3>
                    <span className="text-sm font-bold text-cyan-500">{subscriptions.length} {language === 'id' ? 'Item' : 'Items'}</span>
                </div>

                {subscriptions.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-800/50 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-3xl"></div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-cyan-500/50">
                                <span className="material-symbols-outlined text-3xl">event_repeat</span>
                            </div>
                            <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">{language === 'id' ? 'Belum Ada Langganan' : 'No Subscriptions Yet'}</p>
                            <p className="text-sm px-8">{language === 'id' ? 'Tambahkan tagihan bulanan agar mudah dilacak.' : 'Add your monthly recurring bills to track them easily.'}</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {subscriptions.map((sub) => {
                            const daysDue = calculateDaysUntilDue(sub.nextDueDate);
                            // Adjust urgency colors
                            let urgencyColor = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
                            if (daysDue < 0) urgencyColor = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
                            else if (daysDue <= 3) urgencyColor = 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
                            else if (daysDue <= 7) urgencyColor = 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';

                            return (
                                <div
                                    key={sub.id}
                                    onClick={() => { setSelectedSub(sub); setIsDetailModalOpen(true); }}
                                    className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 group hover:border-cyan-500/30 dark:hover:border-cyan-500/50 transition-all flex flex-col gap-4 cursor-pointer relative overflow-hidden active:scale-[0.99]"
                                >
                                    {/* Active border accent */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${sub.color || 'cyan'}-500 opacity-50`}></div>

                                    <div className="flex items-center gap-4 pl-1">
                                        <div className={`w-12 h-12 rounded-2xl bg-${sub.color || 'cyan'}-50 dark:bg-${sub.color || 'cyan'}-900/30 text-${sub.color || 'cyan'}-500 flex items-center justify-center shrink-0`}>
                                            <span className="material-symbols-outlined filled-icon text-2xl">{sub.icon || 'event_repeat'}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-900 dark:text-white truncate text-base">{sub.title}</h4>
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">{sub.category}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-bold text-slate-900 dark:text-white">{formatMoney(sub.amount)}</p>
                                            <p className="text-[10px] text-slate-400">{language === 'id' ? `/ ${sub.cycleMonths || 1} Bln` : `/ ${sub.cycleMonths || 1} Mo`}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/50 pt-3 pl-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${urgencyColor}`}>
                                                {daysDue === 0 ? (language === 'id' ? 'Hari ini' : 'Today') :
                                                    daysDue === 1 ? (language === 'id' ? 'Besok' : 'Tomorrow') :
                                                        daysDue < 0 ? `${Math.abs(daysDue)} ${language === 'id' ? 'hari telat' : 'days overdue'}` :
                                                            `${daysDue} ${language === 'id' ? 'hari lagi' : 'days'}`}
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                            {language === 'id' ? 'Detail' : 'Manage'} <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Add Subscription Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
                    <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsAddModalOpen(false)}></div>
                    <div className="relative w-full sm:w-[28rem] bg-slate-50 dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col font-display animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300 max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex-1 pl-4 text-center">
                                {language === 'id' ? 'Tambah Langganan' : 'Add Subscription'}
                            </h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">{language === 'id' ? 'Nama Layanan (Maks 15)' : 'Service Name (Max 15)'}</label>
                                <input
                                    type="text"
                                    maxLength={15}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 transition-all placeholder:text-slate-400"
                                    placeholder={language === 'id' ? 'Cth: Netflix, Listrik...' : 'Ex: Netflix, Electricity...'}
                                />
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-3">
                                <div className="text-indigo-500 font-black text-xl">Rp</div>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="flex-1 bg-transparent border-none p-0 text-xl font-black text-slate-900 dark:text-slate-100 focus:ring-0 placeholder:text-slate-300"
                                    placeholder="0"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 truncate">{language === 'id' ? 'Jatuh Tempo' : 'Next Due'}</label>
                                    <input
                                        type="date"
                                        value={nextDueDate}
                                        onChange={(e) => setNextDueDate(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 truncate">{language === 'id' ? 'Siklus Tagihan' : 'Billing Cycle'}</label>
                                    <select
                                        value={cycleMonths}
                                        onChange={(e) => setCycleMonths(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <option value="1">{language === 'id' ? '1 Bulan (Bulanan)' : '1 Month (Monthly)'}</option>
                                        <option value="2">{language === 'id' ? '2 Bulan' : '2 Months'}</option>
                                        <option value="3">{language === 'id' ? '3 Bulan (Triwulan)' : '3 Months (Quarterly)'}</option>
                                        <option value="6">{language === 'id' ? '6 Bulan (Semester)' : '6 Months (Semi-Annual)'}</option>
                                        <option value="12">{language === 'id' ? '12 Bulan (Tahunan)' : '1 Year (Annually)'}</option>
                                    </select>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 truncate">{language === 'id' ? 'Ikon' : 'Icon'}</label>
                                    <select
                                        value={icon}
                                        onChange={(e) => setIcon(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 font-icon"
                                    >
                                        <option value="event_repeat">Repeat</option>
                                        <option value="movie">Movie</option>
                                        <option value="music_note">Music</option>
                                        <option value="bolt">Bolt/Electricity</option>
                                        <option value="water_drop">Water</option>
                                        <option value="wifi">Wifi/Internet</option>
                                        <option value="home">Rent</option>
                                        <option value="fitness_center">Gym</option>
                                        <option value="local_hospital">Health</option>
                                        <option value="school">Education</option>
                                        <option value="shield">Insurance</option>
                                    </select>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 truncate">{language === 'id' ? 'Warna Tema' : 'Color Theme'}</label>
                                    <select
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="indigo">Indigo</option>
                                        <option value="red">Red</option>
                                        <option value="emerald">Emerald</option>
                                        <option value="amber">Amber</option>
                                        <option value="purple">Purple</option>
                                        <option value="blue">Blue</option>
                                        <option value="pink">Pink</option>
                                        <option value="cyan">Cyan</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={handleAddSubscription}
                                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-12 rounded-full font-bold text-sm shadow-xl shadow-cyan-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <span>{language === 'id' ? 'Simpan Tagihan' : 'Save Bill'}</span>
                                <span className="material-symbols-outlined filled-icon">check_circle</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage/Detail Modal Overlay */}
            <SubscriptionDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                subscription={selectedSub}
            />
        </div>
    );
};

export default Subscriptions;
