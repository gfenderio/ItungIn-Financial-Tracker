import React from 'react';
import { useApp } from '../contexts/AppContext';

const SubscriptionDetailModal = ({ isOpen, onClose, subscription }) => {
    const { addTransaction, setSubscriptions, showAlert, language } = useApp();

    if (!isOpen || !subscription) return null;

    const handleDelete = () => {
        const confirmMsg = language === 'id'
            ? 'Yakin ingin menghapus tagihan ini dari daftar langganan?'
            : 'Are you sure you want to remove this bill from your subscriptions?';

        if (window.confirm(confirmMsg)) {
            setSubscriptions(prev => prev.filter(s => s.id !== subscription.id));
            showAlert(language === 'id' ? 'Langganan berhasil dihapus.' : 'Subscription removed successfully.', 'success');
            onClose();
        }
    };

    const handlePayBill = () => {
        const today = new Date();
        const due = new Date(subscription.nextDueDate);

        // Check if paying early / in advance (due date is far explicitly in the future, > 15 days for a safety margin)
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 15) {
            const confirmAdvance = language === 'id'
                ? `Tagihan periode ini rasa-rasanya sudah terbayar (jatuh tempo masih ${diffDays} hari lagi). Yakin ingin membayar untuk periode selanjutnya?`
                : `This bill seems already paid (due in ${diffDays} days). Are you sure you want to pay in advance for the next cycle?`;

            if (!window.confirm(confirmAdvance)) {
                return;
            }
        }

        // 1. Log the transaction ledger entry
        addTransaction({
            id: Date.now(),
            title: `Bill Payment: ${subscription.title}`,
            amount: -Math.abs(subscription.amount),
            date: new Date().toISOString(),
            category: subscription.category || 'Utilities',
            icon: subscription.icon || 'event_repeat',
            accountId: '1'
        });

        // 2. Advance the Next Due Date by X months
        const cycle = subscription.cycleMonths || 1;
        const newDueDate = new Date(due);
        newDueDate.setMonth(newDueDate.getMonth() + cycle);

        setSubscriptions(prev => prev.map(s => {
            if (s.id === subscription.id) {
                return {
                    ...s,
                    nextDueDate: newDueDate.toISOString()
                };
            }
            return s;
        }));

        showAlert(language === 'id' ? `Pembayaran ${subscription.title} berhasil!` : `Payment for ${subscription.title} successful!`, 'success');
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
            <div
                className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            <div className="relative w-full sm:w-[26rem] bg-slate-50 dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col font-display max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex-1 pl-4 text-center">
                        {language === 'id' ? 'Detail Tagihan' : 'Bill Details'}
                    </h3>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                        <span className="material-symbols-outlined border-slate-400">close</span>
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-4xl">{subscription.icon || 'event_repeat'}</span>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 text-center mb-1">{subscription.title}</h2>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 text-center mb-6 uppercase tracking-wider">{subscription.category}</p>

                    <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 pb-3">
                            <span className="text-xs font-bold text-slate-400 uppercase">{language === 'id' ? 'Biaya Siklus' : 'Cycle Cost'}</span>
                            <span className="text-lg font-black text-slate-700 dark:text-slate-300">{formatMoney(subscription.amount)}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 pb-3">
                            <span className="text-xs font-bold text-slate-400 uppercase">{language === 'id' ? 'Siklus Tagihan' : 'Billing Cycle'}</span>
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                {language === 'id' ? `Per ${subscription.cycleMonths || 1} Bulan` : `Every ${subscription.cycleMonths || 1} Months`}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase">{language === 'id' ? 'Jatuh Tempo Berikutnya' : 'Next Due Date'}</span>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                {new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(subscription.nextDueDate))}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-3">
                    <button
                        onClick={handleDelete}
                        className="col-span-1 border-2 border-red-500/20 hover:bg-red-50 text-red-600 dark:hover:bg-red-900/20 dark:text-red-400 h-12 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-1 active:scale-95"
                        title={language === 'id' ? 'Hapus' : 'Delete'}
                    >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        <span className="hidden sm:inline">{language === 'id' ? 'Hapus' : 'Delete'}</span>
                    </button>
                    <button
                        onClick={handlePayBill}
                        className="col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30 shadow-xl h-12 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <span>{language === 'id' ? 'Bayar Tanggungan' : 'Pay Pending Bill'}</span>
                        <span className="material-symbols-outlined filled-icon text-[18px]">payments</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionDetailModal;
