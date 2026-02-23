import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

const SubscriptionDetailModal = ({ isOpen, onClose, subscription }) => {
    const { addTransaction, setSubscriptions, updateSubscription, showAlert, language, showConfirm } = useApp();

    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [cycleMonths, setCycleMonths] = useState('');
    const [nextDueDate, setNextDueDate] = useState('');

    useEffect(() => {
        if (subscription) {
            setTitle(subscription.title);
            setAmount(Math.abs(subscription.amount).toString());
            setCycleMonths(subscription.cycleMonths?.toString() || '1');
            setNextDueDate(subscription.nextDueDate ? new Date(subscription.nextDueDate).toISOString().slice(0, 10) : '');
            setIsEditing(false); // Reset to view mode
        }
    }, [subscription, isOpen]);

    if (!isOpen || !subscription) return null;

    const handleDelete = async () => {
        const confirmMsg = language === 'id'
            ? 'Yakin ingin menghapus tagihan ini dari daftar langganan?'
            : 'Are you sure you want to remove this bill from your subscriptions?';

        const confirmed = await showConfirm(
            language === 'id' ? 'Hapus Langganan?' : 'Delete Subscription?',
            confirmMsg,
            'danger'
        );

        if (confirmed) {
            setSubscriptions(prev => prev.filter(s => s.id !== subscription.id));
            showAlert(language === 'id' ? 'Langganan berhasil dihapus.' : 'Subscription removed successfully.', 'success');
            onClose();
        }
    };

    const handleUpdate = () => {
        const valAmount = parseFloat(amount);
        const valCycle = parseInt(cycleMonths);

        if (!title || isNaN(valAmount) || valAmount <= 0 || isNaN(valCycle) || valCycle < 1 || !nextDueDate) {
            showAlert(language === 'id' ? 'Mohon lengkapi semua kolom dengan benar.' : 'Please fill all fields correctly.', 'error');
            return;
        }

        updateSubscription({
            ...subscription,
            title,
            amount: valAmount,
            cycleMonths: valCycle,
            nextDueDate: new Date(nextDueDate).toISOString()
        });

        setIsEditing(false);
        showAlert(language === 'id' ? 'Perubahan disimpan!' : 'Changes saved!', 'success');
    };

    const handlePayBill = async () => {
        const today = new Date();
        const due = new Date(subscription.nextDueDate);

        // Check if paying early / in advance (due date is far explicitly in the future, > 15 days for a safety margin)
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 15) {
            const confirmAdvance = language === 'id'
                ? `Tagihan periode ini rasa-rasanya sudah terbayar (jatuh tempo masih ${diffDays} hari lagi). Yakin ingin membayar untuk periode selanjutnya?`
                : `This bill seems already paid (due in ${diffDays} days). Are you sure you want to pay in advance for the next cycle?`;

            const confirmedAdvance = await showConfirm(
                language === 'id' ? 'Bayar Lebih Awal?' : 'Pay in Advance?',
                confirmAdvance,
                'warning'
            );

            if (!confirmedAdvance) {
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

        // 2. Roll the next due date forward by the cycle length
        const currentNextDue = new Date(subscription.nextDueDate);
        const futureDate = new Date(currentNextDue.setMonth(currentNextDue.getMonth() + (subscription.cycleMonths || 1)));

        updateSubscription({
            ...subscription,
            nextDueDate: futureDate.toISOString()
        });

        showAlert(language === 'id' ? `Pembayaran untuk ${subscription.title} dicatat.` : `Payment for ${subscription.title} recorded.`, 'success');
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
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex-1 pl-4">
                        {language === 'id' ? 'Detail Tagihan' : 'Bill Details'}
                    </h3>
                    <div className="flex items-center gap-2 pr-2">
                        {isEditing ? (
                            <>
                                <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">Batal</button>
                            </>
                        ) : (
                            <>
                                <button id="tour-edit-sub-btn" onClick={() => setIsEditing(true)} className="w-8 h-8 rounded-full flex items-center justify-center text-primary bg-primary/10 hover:bg-primary/20 transition-colors">
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                                <button onClick={handleDelete} className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors">
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </>
                        )}
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors ml-2">
                            <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 p-6 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-4xl">{subscription.icon || 'event_repeat'}</span>
                    </div>

                    {isEditing ? (
                        <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-4 mb-4 text-left">
                            <div>
                                <label className="text-xs font-bold text-slate-400 mb-1 block">Judul Profil</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold dark:text-white" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 mb-1 block">Nominal Biaya</label>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold dark:text-white text-indigo-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 mb-1 block">Jeda Siklus (Bulan)</label>
                                <input type="number" value={cycleMonths} onChange={e => setCycleMonths(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold dark:text-white" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 mb-1 block">Jatuh Tempo Berikutnya</label>
                                <input type="date" value={nextDueDate} onChange={e => setNextDueDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold dark:text-white" />
                            </div>
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                    {isEditing ? (
                        <button
                            id="tour-save-sub-edit-btn"
                            onClick={handleUpdate}
                            className="w-full bg-primary hover:bg-primary/90 shadow-primary/30 shadow-xl active:scale-[0.98] text-white h-12 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <span>{language === 'id' ? 'Simpan Perubahan' : 'Save Changes'}</span>
                            <span className="material-symbols-outlined filled-icon">save</span>
                        </button>
                    ) : (
                        <button
                            onClick={handlePayBill}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30 shadow-xl h-12 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <span>{language === 'id' ? 'Bayar Tanggungan' : 'Pay Pending Bill'}</span>
                            <span className="material-symbols-outlined filled-icon text-[18px]">payments</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionDetailModal;
