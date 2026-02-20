import React from 'react';
import { useApp } from '../contexts/AppContext';

const DebtDetailModal = ({ isOpen, onClose, debt }) => {
    const { addTransaction, setDebts, showAlert, language } = useApp();

    if (!isOpen || !debt) return null;

    const monthlyInstallmentStr = (debt.balance / debt.monthsLeft) || 0;
    const monthlyInstallment = Math.ceil(monthlyInstallmentStr);

    const handlePayInstallment = () => {
        // Record payment in transactions
        addTransaction({
            id: Date.now(),
            title: `Debt Payment: ${debt.title}`,
            amount: -Math.abs(monthlyInstallment),
            date: new Date().toISOString(),
            category: 'Debt',
            icon: debt.icon || 'account_balance',
            accountId: '1'
        });

        // Deduct from debt balance
        setDebts(prev => prev.map(d => {
            if (d.id === debt.id) {
                return {
                    ...d,
                    balance: Math.max(0, d.balance - monthlyInstallment),
                    monthsLeft: Math.max(0, d.monthsLeft - 1),
                    nextDueMonthOffset: (d.nextDueMonthOffset || 0) + 1
                };
            }
            return d;
        }));

        showAlert(language === 'id' ? 'Pembayaran berhasil dicatat!' : 'Payment recorded successfully!', 'success');
        onClose();
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full sm:w-[26rem] bg-slate-50 dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300 font-display">

                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex-1 pl-4 text-center">
                        {language === 'id' ? 'Detail Hutang' : 'Debt Details'}
                    </h3>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                        <span className="material-symbols-outlined border-slate-400">close</span>
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 flex flex-col items-center">
                    <div className={`p-4 rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 mb-4`}>
                        <span className="material-symbols-outlined text-4xl">{debt.icon || 'account_balance'}</span>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-1">{debt.title}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">{debt.category || 'Loan'}</p>

                    <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 pb-3">
                            <span className="text-xs font-bold text-slate-400 uppercase">{language === 'id' ? 'Sisa Hutang' : 'Remaining Balance'}</span>
                            <span className="text-lg font-bold text-red-500">{formatMoney(debt.balance)}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 pb-3">
                            <span className="text-xs font-bold text-slate-400 uppercase">{language === 'id' ? 'Total Hutang' : 'Total Debt'}</span>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatMoney(debt.total)}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 pb-3">
                            <span className="text-xs font-bold text-slate-400 uppercase">{language === 'id' ? 'Cicilan Per Bulan' : 'Monthly Installment'}</span>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatMoney(monthlyInstallment)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase">{language === 'id' ? 'Sisa Bulan' : 'Months Left'}</span>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{debt.monthsLeft} {language === 'id' ? 'Bulan' : 'Months'}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Submit */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={handlePayInstallment}
                        disabled={debt.balance <= 0}
                        className={`w-full ${debt.balance <= 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30 shadow-xl active:scale-[0.98]'} text-white h-12 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2`}
                    >
                        <span>{language === 'id' ? 'Bayar Cicilan Bulan Ini' : 'Pay This Month Installment'}</span>
                        <span className="material-symbols-outlined filled-icon">payments</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default DebtDetailModal;
