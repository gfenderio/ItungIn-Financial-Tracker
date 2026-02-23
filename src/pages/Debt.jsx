import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import DebtDetailModal from '../components/DebtDetailModal';

const Debt = () => {
    const { debts, setDebts, transactions, language, calculateIncome, showAlert } = useApp();
    const [filter, setFilter] = useState('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    // Form states
    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Bank Loans');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
    const [dueDay, setDueDay] = useState(1);
    const [monthsLeft, setMonthsLeft] = useState(12);
    const [lateFeeType, setLateFeeType] = useState('percentage'); // 'percentage' or 'fixed'
    const [lateFeeValue, setLateFeeValue] = useState('');

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const totalDebt = debts.reduce((acc, curr) => acc + curr.total, 0);

    const filterDebts = (debts, filterStr) => {
        if (filterStr === 'All') return debts;
        if (filterStr === 'Bank Loans') return debts.filter(d => d.subtitle.toLowerCase().includes('loan') || d.category === 'Bank Loans');
        if (filterStr === 'Personal') return debts.filter(d => d.subtitle.toLowerCase().includes('personal') || d.category === 'Personal');
        if (filterStr === 'Credit Card') return debts.filter(d => d.subtitle.toLowerCase().includes('credit') || d.category === 'Credit Card');
        return debts;
    };

    const filteredDebts = filterDebts(debts, filter);

    const handleAddDebt = () => {
        if (!amount || !title) {
            showAlert(language === 'id' ? 'Silakan masukkan judul dan jumlah.' : 'Please enter title and amount.', 'error');
            return;
        }
        const newDebt = {
            id: Date.now(),
            title: title,
            subtitle: category,
            balance: parseFloat(amount),
            total: parseFloat(amount),
            color: category === 'Bank Loans' ? 'blue' : category === 'Credit Card' ? 'purple' : 'orange',
            icon: category === 'Bank Loans' ? 'account_balance' : category === 'Credit Card' ? 'credit_card' : 'person',
            dueDays: dueDay,
            category: category,
            monthsLeft: monthsLeft,
            lateFeeType: lateFeeType,
            lateFeeValue: parseFloat(lateFeeValue) || 0
        };

        if (setDebts) {
            setDebts(prev => [newDebt, ...prev]);
        }

        setIsAddModalOpen(false);
        // Reset form
        setTitle('');
        setAmount('');
        setCategory('Bank Loans');
        setDate(new Date().toISOString().slice(0, 10));
        setDueDay(1);
        setMonthsLeft(12);
        setLateFeeType('percentage');
        setLateFeeValue('');
    };

    // Calculate next payment day checking the offset for future months
    const calculateNextPaymentString = (debt) => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const offset = debt.nextDueMonthOffset || 0;
        let targetMonth = currentMonth + offset;
        let targetYear = currentYear;

        while (targetMonth > 11) {
            targetMonth -= 12;
            targetYear++;
        }

        let nextDueDate = new Date(targetYear, targetMonth, debt.dueDays);

        // Handle end-of-month clamping (e.g. Feb 31st becomes Feb 28th)
        const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        if (debt.dueDays > daysInTargetMonth) {
            nextDueDate = new Date(targetYear, targetMonth, daysInTargetMonth);
        }

        // If offset is 0 but the day has already passed this month, technically it's due next month
        // but we want the UI to still show it's overdue or push to next. We handle logic based on unpaid status.
        // For simple UI, we just check diff against today
        if (offset === 0 && today > nextDueDate && today.getDate() > nextDueDate.getDate()) {
            // Already passed this month and un-offset (likely unpaid and overdue, but for UI sake we show next cycle if they just want to see when it's due)
            let lateTargetMonth = currentMonth + 1;
            let lateTargetYear = currentYear;
            if (lateTargetMonth > 11) { lateTargetMonth = 0; lateTargetYear++; }
            const lateDaysInMonth = new Date(lateTargetYear, lateTargetMonth + 1, 0).getDate();
            nextDueDate = new Date(lateTargetYear, lateTargetMonth, Math.min(debt.dueDays, lateDaysInMonth));
        }

        const diffTime = nextDueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Tomorrow";

        if (diffDays < 0) {
            return `${Math.abs(diffDays)} days overdue`;
        }

        if (diffDays > 30) {
            // If it's more than a month out, format nicely
            return new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' }).format(nextDueDate);
        }

        return `In ${diffDays} days`;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-display pb-24">
            {/* Header / Aggregate Card */}
            <div id="tour-debt-header" className="p-4 pt-6 bg-indigo-600 rounded-b-3xl text-white shadow-lg shadow-indigo-600/20 mb-6 relative overflow-hidden">
                {/* Abstract Pattern Decoration */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>

                <div className="relative z-10 flex justify-between items-start mb-4">
                    <p className="text-indigo-100 text-sm font-medium">{language === 'id' ? 'Total Htg Keseluruhan' : 'Total Aggregate Debt'}</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        {language === 'id' ? 'Tambah Hutang' : 'Add Debt'}
                    </button>
                </div>

                <div className="relative z-10">
                    <h2 className="text-4xl font-bold mt-1">{formatMoney(totalDebt)}</h2>
                    <div className="mt-2 flex items-center gap-1 text-xs bg-white/20 w-fit px-2 py-1 rounded-full text-white">
                        <span className="material-symbols-outlined text-[14px]">account_balance_wallet</span>
                        <span>{language === 'id' ? 'Total hutang aktif' : 'Active debt totals'}</span>
                    </div>
                </div>
            </div>

            {/* Debt-to-Income (DTI) Tracker */}
            <div className="px-4 mb-6">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">{language === 'id' ? 'Rasio Hutang Terhadap Pendapatan (DTI)' : 'Debt-to-Income Ratio (DTI)'}</h3>
                    {(() => {
                        const monthlyIncome = calculateIncome();
                        let totalMonthlyDebtInstallment = 0;
                        debts.forEach(d => {
                            if (d.balance > 0 && d.monthsLeft > 0) {
                                totalMonthlyDebtInstallment += (d.balance / d.monthsLeft);
                            }
                        });
                        const dtiRatio = monthlyIncome > 0 ? (totalMonthlyDebtInstallment / monthlyIncome) * 100 : 0;

                        let healthText = language === 'id' ? 'Bagus' : 'Good';
                        let healthColor = 'text-emerald-500';
                        let barColor = 'bg-emerald-500';
                        let icon = 'sentiment_very_satisfied';

                        if (dtiRatio > 35 && dtiRatio <= 42) {
                            healthText = language === 'id' ? 'Peringatan' : 'Warning';
                            healthColor = 'text-orange-500';
                            barColor = 'bg-orange-500';
                            icon = 'sentiment_satisfied';
                        } else if (dtiRatio > 42) {
                            healthText = language === 'id' ? 'Bahaya' : 'Danger';
                            healthColor = 'text-red-500';
                            barColor = 'bg-red-500';
                            icon = 'sentiment_very_dissatisfied';
                        }

                        if (monthlyIncome === 0) {
                            return <p className="text-xs text-slate-400 italic">{language === 'id' ? 'Tambahkan pemasukan bulan ini untuk melihat DTI' : 'Add income this month to see DTI'}</p>;
                        }

                        return (
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`material-symbols-outlined text-3xl ${healthColor}`}>{icon}</span>
                                        <div>
                                            <p className={`text-xl font-black ${healthColor}`}>{dtiRatio.toFixed(1)}%</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{healthText}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{language === 'id' ? 'Beban Bulan Ini' : 'Obligation This Month'}</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatMoney(Math.ceil(totalMonthlyDebtInstallment))}</p>
                                    </div>
                                </div>
                                {/* Progress Bar */}
                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden mt-4 shadow-inner">
                                    <div
                                        className={`h-full ${barColor} transition-all duration-1000 ease-out`}
                                        style={{ width: `${Math.min(dtiRatio, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-3 text-center">
                                    {language === 'id' ? 'DTI yang sehat berada di bawah 36%.' : 'A healthy DTI is under 36%.'}
                                </p>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Main Content */}
            <main className="px-4 space-y-6">
                {/* Filter/Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                    {['All', 'Bank Loans', 'Personal', 'Credit Card'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${filter === f ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                            {f === 'All' ? (language === 'id' ? 'Semua Hutang' : 'All Debts') :
                                f === 'Bank Loans' ? (language === 'id' ? 'Pinjaman Bank' : 'Bank Loans') :
                                    f === 'Personal' ? (language === 'id' ? 'Pribadi' : 'Personal') :
                                        (language === 'id' ? 'Kartu Kredit' : 'Credit Card')}
                        </button>
                    ))}
                </div>

                {/* Debt List Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{language === 'id' ? 'Hutang Aktif' : 'Active Debts'}</h3>
                        <button
                            onClick={() => setIsHistoryModalOpen(true)}
                            className="text-sm text-indigo-600 font-bold flex items-center gap-1 hover:text-indigo-700 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px]">history</span>
                            {language === 'id' ? 'Riwayat' : 'History'}
                        </button>
                    </div>

                    {filteredDebts.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="material-symbols-outlined text-3xl">task_alt</span>
                            </div>
                            <p>{language === 'id' ? 'Hore! Tidak ada hutang di kategori ini.' : 'Hooray! No debts in this category.'}</p>
                        </div>
                    ) : filteredDebts.map(debt => {
                        const paidPercentage = debt.total > 0 ? Math.round(((debt.total - debt.balance) / debt.total) * 100) : 0;
                        const colorClass = {
                            blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                            orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
                            purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                        }[debt.color] || 'bg-slate-100 dark:bg-slate-700 text-slate-600';

                        return (
                            <div
                                key={debt.id}
                                onClick={() => {
                                    setSelectedDebt(debt);
                                    setIsDetailModalOpen(true);
                                }}
                                className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:border-indigo-500/50 cursor-pointer active:scale-[0.99] transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
                                            <span className="material-symbols-outlined">{debt.icon}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">{debt.title}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{debt.subtitle}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${calculateNextPaymentString(debt).includes('overdue')
                                            ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                                            : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                                            }`}>
                                            {calculateNextPaymentString(debt).replace('In', language === 'id' ? 'Dalam' : 'In').replace('days overdue', language === 'id' ? 'hr terlambat' : 'days overdue').replace('days', language === 'id' ? 'hari' : 'days').replace('Today', language === 'id' ? 'Hari ini' : 'Today').replace('Tomorrow', language === 'id' ? 'Besok' : 'Tomorrow')}
                                        </span>
                                        {debt.monthsLeft && <span className="text-[10px] text-slate-400">{debt.monthsLeft} {language === 'id' ? 'bln tersisa' : 'mo left'}</span>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold mb-1">{language === 'id' ? 'Sisa Saldo' : 'Remaining Balance'}</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{formatMoney(debt.balance)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold mb-1">{language === 'id' ? 'Total Hutang' : 'Total Debt'}</p>
                                        <p className="text-lg font-bold text-slate-400 dark:text-slate-500">{formatMoney(debt.total)}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-medium text-indigo-600">{paidPercentage}% {language === 'id' ? 'Dibayar' : 'Paid'}</span>
                                        <span className="text-slate-400">{formatMoney(debt.balance)} {language === 'id' ? 'tersisa' : 'left'}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                                        <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${paidPercentage}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </section>
            </main>

            {/* Forms and Modals */}
            <DebtDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                debt={selectedDebt}
            />

            {/* Debt History Modal */}
            {isHistoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsHistoryModalOpen(false)}></div>
                    <div className="relative w-full sm:w-[28rem] bg-slate-50 dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col font-display max-h-[85vh] animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex-1 pl-4 text-center">
                                {language === 'id' ? 'Riwayat Pembayaran' : 'Payment History'}
                            </h3>
                            <button onClick={() => setIsHistoryModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                                <span className="material-symbols-outlined border-slate-400">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-8">
                            {transactions.filter(t => t.category === 'Debt').length === 0 ? (
                                <div className="text-center py-10 text-slate-400">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">receipt_long</span>
                                    <p>{language === 'id' ? 'Belum ada riwayat pembayaran hutang.' : 'No debt payment history yet.'}</p>
                                </div>
                            ) : (
                                transactions.filter(t => t.category === 'Debt').map(t => (
                                    <div key={t.id} className="bg-white dark:bg-slate-800 p-3 rounded-2xl flex items-center justify-between shadow-sm border border-slate-100 dark:border-slate-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center">
                                                <span className="material-symbols-outlined">{t.icon || 'payments'}</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{t.title}</p>
                                                <p className="text-xs text-slate-500">{new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(t.date))}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-emerald-500 text-sm">{formatMoney(Math.abs(t.amount))}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Debt Overlay Form */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col font-display max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex-1 pl-4 text-center">
                                {language === 'id' ? 'Tambah Hutang' : 'Add Debt'}
                            </h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">{language === 'id' ? 'Judul Hutang (Maks 15)' : 'Debt Title (Max 15)'}</label>
                                <input
                                    type="text"
                                    maxLength={15}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                    placeholder={language === 'id' ? 'Cth: Cicilan Mobil' : 'Ex: Car Loan'}
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
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 truncate">{language === 'id' ? 'Kategori' : 'Category'}</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Bank Loans">Bank Loans</option>
                                        <option value="Credit Card">Credit Card</option>
                                        <option value="Personal">Personal</option>
                                    </select>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 truncate">{language === 'id' ? 'Tanggal Mulai' : 'Start Date'}</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 truncate">{language === 'id' ? 'Tgl Jatuh Tempo' : 'Due Day'}</label>
                                    <select
                                        value={dueDay}
                                        onChange={(e) => setDueDay(parseInt(e.target.value))}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {[...Array(31)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 truncate">{language === 'id' ? 'Sisa Bulan' : 'Months Left'}</label>
                                    <input
                                        type="number"
                                        value={monthsLeft}
                                        onChange={(e) => setMonthsLeft(parseInt(e.target.value))}
                                        min="1"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                                    />
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 truncate">{language === 'id' ? 'Tipe Denda' : 'Late Fee'}</label>
                                    <select
                                        value={lateFeeType}
                                        onChange={(e) => setLateFeeType(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="percentage">{language === 'id' ? 'Persen (%)' : 'Percent (%)'}</option>
                                        <option value="fixed">{language === 'id' ? 'Nominal' : 'Fixed'}</option>
                                    </select>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 truncate">{language === 'id' ? 'Nilai Denda' : 'Fee Value'}</label>
                                    <input
                                        type="number"
                                        value={lateFeeValue}
                                        onChange={(e) => setLateFeeValue(e.target.value)}
                                        min="0"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Submit */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={handleAddDebt}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-full font-bold text-sm shadow-xl shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <span>{language === 'id' ? 'Simpan Hutang' : 'Save Debt'}</span>
                                <span className="material-symbols-outlined filled-icon">check_circle</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Debt;
