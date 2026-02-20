import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import DebtDetailModal from '../components/DebtDetailModal';

const Debt = () => {
    const { debts, setDebts, addTransaction, calculateIncome, language } = useApp();
    const [filter, setFilter] = useState('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Form states
    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Bank Loans');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
    const [dueDay, setDueDay] = useState(1);
    const [monthsLeft, setMonthsLeft] = useState(12);

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
            alert("Please enter title and amount.");
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
            monthsLeft: monthsLeft
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
    };

    // Calculate next payment day just for UI flair
    const calculateNextPaymentString = (dueDay) => {
        const today = new Date();
        const currentDay = today.getDate();
        if (currentDay === dueDay) return "Today";
        if (currentDay + 1 === dueDay) return "Tomorrow";
        let daysLeft = dueDay - currentDay;
        if (daysLeft < 0) {
            const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            daysLeft = (nextMonth - currentDay) + dueDay;
        }
        return `In ${daysLeft} days`;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-display pb-24">
            {/* Header / Aggregate Card */}
            <div className="p-4 pt-6 bg-indigo-600 rounded-b-3xl text-white shadow-lg shadow-indigo-600/20 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex justify-between items-start mb-4">
                    <p className="indigo-100 text-sm font-medium">{language === 'id' ? 'Total Hutang Keseluruhan' : 'Total Aggregate Debt'}</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        {language === 'id' ? 'Tambah Hutang' : 'Add Debt'}
                    </button>
                </div>
                <div className="relative z-10">
                    <h2 className="text-4xl font-bold">{formatMoney(totalDebt)}</h2>
                    <div className="flex items-center gap-1 mt-2 text-xs font-medium bg-white/20 w-fit px-2 py-1 rounded-full text-white">
                        <span className="material-symbols-outlined text-[14px]">trending_down</span>
                        <span>{language === 'id' ? 'Tetap terkendali' : 'Keep it manageable'}</span>
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
                        <span className="text-sm text-indigo-600 font-medium">{language === 'id' ? 'Lihat Info' : 'See Insights'}</span>
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
                                        <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                            {calculateNextPaymentString(debt.dueDays).replace('In', language === 'id' ? 'Dalam' : 'In').replace('days', language === 'id' ? 'hari' : 'days').replace('Today', language === 'id' ? 'Hari ini' : 'Today').replace('Tomorrow', language === 'id' ? 'Besok' : 'Tomorrow')}
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

            {/* Add Debt Overlay Form */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col font-display max-h-[90vh]">
                        <div className="bg-indigo-600 p-4 text-center relative border-b border-indigo-700">
                            <h2 className="text-lg font-bold text-white">{language === 'id' ? 'Tambah Hutang' : 'Add Debt'}</h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-100 hover:text-white"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto space-y-4">
                            {/* Amount Input */}
                            <div className="flex flex-col items-center justify-center py-4 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">{language === 'id' ? 'Total Jumlah' : 'Total Amount'}</span>
                                <div className="flex items-center gap-2 justify-center w-full">
                                    <span className="text-indigo-600 font-bold text-3xl">Rp</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full max-w-[80%] text-center bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 font-bold tracking-tight p-0 placeholder:text-slate-300 text-3xl"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Title & Category form */}
                            <div className="space-y-3">
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{language === 'id' ? 'Judul' : 'Title'}</p>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder={language === 'id' ? 'cth. Cicilan Mobil' : 'e.g. Car Loan'}
                                        className="w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:font-normal"
                                    />
                                </div>

                                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{language === 'id' ? 'Kategori' : 'Category'}</p>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {['Bank Loans', 'Credit Card', 'Personal'].map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setCategory(cat)}
                                                className={`py-2 px-1 text-xs font-bold rounded-xl border transition-colors ${category === cat ? 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Dates and terms form */}
                            <div className="space-y-3">
                                <div className="relative flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600">
                                        <span className="material-symbols-outlined text-xl">calendar_today</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-400 font-medium">{language === 'id' ? 'Tanggal Mulai' : 'Start Date'}</p>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="bg-transparent border-none p-0 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-0 w-full"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                        <div className="flex-1">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 leading-tight">{language === 'id' ? 'Tgl Jatuh Tempo' : 'Due day'} <br />{language === 'id' ? 'tiap bulan' : 'every month'}</p>
                                            <select
                                                value={dueDay}
                                                onChange={(e) => setDueDay(parseInt(e.target.value))}
                                                className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0 w-full dark:text-slate-100"
                                            >
                                                {[...Array(31)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                        <div className="flex-1">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 leading-tight">{language === 'id' ? 'Durasi' : 'Duration'} <br />({language === 'id' ? 'Sisa Bulan' : 'Months Left'})</p>
                                            <input
                                                type="number"
                                                value={monthsLeft}
                                                onChange={(e) => setMonthsLeft(parseInt(e.target.value))}
                                                min="1"
                                                className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0 w-full dark:text-slate-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

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
