import React from 'react';
import { useApp } from '../contexts/AppContext';

const Debt = () => {
    const { debts } = useApp();

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const totalDebt = debts.reduce((acc, curr) => acc + curr.total, 0);

    return (
        <>
            {/* Header Section (in main content area for Debt page specific header if needed, but we use shared layout) */}
            {/* Aggregate Card */}
            <div className="p-4 pt-2">
                <div className="bg-primary dark:bg-primary/90 rounded-xl p-6 text-white shadow-lg shadow-primary/20">
                    <p className="text-primary-100/80 text-sm font-medium mb-1">Total Aggregate Debt</p>
                    <div className="flex items-end justify-between">
                        <div>
                            <h2 className="text-3xl font-bold">{formatMoney(totalDebt)}</h2>
                            <div className="flex items-center gap-1 mt-2 text-xs font-medium bg-white/20 w-fit px-2 py-1 rounded-full">
                                <span className="material-symbols-outlined text-[14px]">trending_down</span>
                                <span>5% less than last month</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-white/70">Next payment</p>
                            <p className="font-semibold text-sm">Tomorrow</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="px-4 space-y-6">
                {/* Filter/Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <button className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">All Debts</button>
                    <button className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border border-slate-100 dark:border-slate-700">Bank Loans</button>
                    <button className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border border-slate-100 dark:border-slate-700">Personal</button>
                    <button className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border border-slate-100 dark:border-slate-700">Credit Cards</button>
                </div>

                {/* Debt List Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">Active Debts</h3>
                        <span className="text-sm text-primary font-medium">See Insights</span>
                    </div>

                    {debts.map(debt => {
                        const paidPercentage = Math.round(((debt.total - debt.balance) / debt.total) * 100);
                        const colorClass = {
                            blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                            orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
                            purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                        }[debt.color] || 'bg-slate-100 dark:bg-slate-700 text-slate-600';

                        return (
                            <div key={debt.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
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
                                    <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Due in {debt.dueDays} days</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold mb-1">Remaining Balance</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{formatMoney(debt.balance)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold mb-1">Total Debt</p>
                                        <p className="text-lg font-bold text-slate-400 dark:text-slate-500">{formatMoney(debt.total)}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-medium text-primary">{paidPercentage}% Paid</span>
                                        <span className="text-slate-400">{formatMoney(debt.balance)} left</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${paidPercentage}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </section>
            </main>
        </>
    );
};

export default Debt;
