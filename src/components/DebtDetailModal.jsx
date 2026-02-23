import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

const DebtDetailModal = ({ isOpen, onClose, debt }) => {
    const { addTransaction, setDebts, updateDebt, deleteDebt, showAlert, language, showConfirm } = useApp();

    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [balance, setBalance] = useState('');
    const [total, setTotal] = useState('');
    const [monthsLeft, setMonthsLeft] = useState('');

    useEffect(() => {
        if (debt) {
            setTitle(debt.title);
            setBalance(debt.balance.toString());
            setTotal(debt.total.toString());
            setMonthsLeft(debt.monthsLeft?.toString() || '0');
            setIsEditing(false); // Reset to view mode when modal opens
        }
    }, [debt, isOpen]);

    if (!isOpen || !debt) return null;

    const monthlyInstallmentStr = (debt.balance / debt.monthsLeft) || 0;
    const baseInstallment = Math.ceil(monthlyInstallmentStr);

    // Calculate if overdue
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

    let nextDueDate = new Date(targetYear, targetMonth, debt.dueDays || 1);
    const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    if ((debt.dueDays || 1) > daysInTargetMonth) {
        nextDueDate = new Date(targetYear, targetMonth, daysInTargetMonth);
    }

    let isOverdue = false;
    if (offset === 0 && today.getDate() > (debt.dueDays || 1)) {
        isOverdue = true;
    } else if (today.getTime() > nextDueDate.getTime() && today.getDate() > nextDueDate.getDate()) {
        isOverdue = true;
    }

    // Calculate Late Fee
    let lateFeeAmount = 0;
    if (isOverdue && debt.lateFeeValue > 0) {
        if (debt.lateFeeType === 'percentage') {
            lateFeeAmount = Math.ceil(baseInstallment * (debt.lateFeeValue / 100));
        } else {
            lateFeeAmount = debt.lateFeeValue;
        }
    }

    const finalInstallment = baseInstallment + lateFeeAmount;

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handlePayInstallment = async () => {
        let confirmMsg = language === 'id'
            ? `Konfirmasi pembayaran cicilan sebesar ${formatMoney(finalInstallment)} untuk ${debt.title}?`
            : `Confirm payment of ${formatMoney(finalInstallment)} for ${debt.title}?`;

        if (lateFeeAmount > 0) {
            confirmMsg += language === 'id'
                ? `\n\n(Termasuk denda keterlambatan: ${formatMoney(lateFeeAmount)})`
                : `\n\n(Includes late fee: ${formatMoney(lateFeeAmount)})`;
        }

        const confirmed = await showConfirm(
            language === 'id' ? 'Bayar Cicilan?' : 'Pay Installment?',
            confirmMsg,
            'info'
        );

        if (confirmed) {
            // Record payment in transactions including late fee
            addTransaction({
                id: Date.now(),
                title: `Debt Payment: ${debt.title}${lateFeeAmount > 0 ? ' (Includes Late Fee)' : ''}`,
                amount: -Math.abs(finalInstallment),
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
                        balance: Math.max(0, d.balance - baseInstallment), // Only base installment deducts balance
                        monthsLeft: Math.max(0, d.monthsLeft - 1),
                        nextDueMonthOffset: (d.nextDueMonthOffset || 0) + 1
                    };
                }
                return d;
            }));

            showAlert(language === 'id' ? 'Pembayaran berhasil dicatat!' : 'Payment recorded successfully!', 'success');
            onClose();
        }
    };

    const handleDelete = async () => {
        const confirmed = await showConfirm(
            language === 'id' ? 'Hapus Hutang?' : 'Delete Debt?',
            language === 'id' ? 'Apakah Anda yakin ingin menghapus catatan hutang ini?' : 'Are you sure you want to delete this debt record?',
            'danger'
        );

        if (confirmed) {
            deleteDebt(debt.id);
            showAlert(language === 'id' ? 'Catatan hutang dihapus.' : 'Debt record deleted.', 'success');
            onClose();
        }
    };

    const handleUpdate = () => {
        const valBalance = parseFloat(balance);
        const valTotal = parseFloat(total);
        const valMonths = parseInt(monthsLeft);

        if (!title || isNaN(valBalance) || isNaN(valTotal) || isNaN(valMonths)) {
            showAlert(language === 'id' ? 'Lengkapi form dengan benar.' : 'Please complete the form properly.', 'error');
            return;
        }

        updateDebt({
            ...debt,
            title,
            balance: valBalance,
            total: valTotal,
            monthsLeft: valMonths
        });

        setIsEditing(false);
        showAlert(language === 'id' ? 'Perubahan disimpan!' : 'Changes saved!', 'success');
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
                        {language === 'id' ? 'Detail Hutang' : 'Debt Details'}
                    </h3>
                    <div className="flex items-center gap-2 pr-2">
                        {isEditing ? (
                            <>
                                <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">Batal</button>
                            </>
                        ) : (
                            <>
                                <button id="tour-edit-debt-btn" onClick={() => setIsEditing(true)} className="w-8 h-8 rounded-full flex items-center justify-center text-primary bg-primary/10 hover:bg-primary/20 transition-colors">
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
                    <div className={`p-4 rounded-2xl bg-${debt.color || 'blue'}-100 text-${debt.color || 'blue'}-600 dark:bg-${debt.color || 'blue'}-900/30 dark:text-${debt.color || 'blue'}-400 mb-4`}>
                        <span className="material-symbols-outlined text-4xl">{debt.icon || 'account_balance'}</span>
                    </div>

                    {isEditing ? (
                        <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-4 mb-4 text-left">
                            <div>
                                <label className="text-xs font-bold text-slate-400 mb-1 block">Judul Profil</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold dark:text-white" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 mb-1 block">Sisa Hutang</label>
                                <input type="number" value={balance} onChange={e => setBalance(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold dark:text-white text-red-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 mb-1 block">Total Hutang (Riwayat Sebenarnya)</label>
                                <input type="number" value={total} onChange={e => setTotal(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold dark:text-white text-slate-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 mb-1 block">Sisa Periode Bulan</label>
                                <input type="number" value={monthsLeft} onChange={e => setMonthsLeft(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold dark:text-white" />
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-1">{debt.title}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">{debt.category || 'Loan'}</p>

                            <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-4">
                                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 pb-3">
                                    <span className="text-xs font-bold text-slate-400 uppercase">{language === 'id' ? 'Sisa Hutang' : 'Remaining Balance'}</span>
                                    <span className="text-lg font-bold text-red-500">{formatMoney(debt.balance)}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 pb-3">
                                    <span className="text-xs font-bold text-slate-400 uppercase">{language === 'id' ? 'Total Hutang Awal' : 'Total Original Debt'}</span>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatMoney(debt.total)}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 pb-3">
                                    <span className="text-xs font-bold text-slate-400 uppercase">{language === 'id' ? 'Kewajiban Cicilan Bulan Ini' : 'Monthly Base Installment'}</span>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatMoney(baseInstallment)}</span>
                                </div>
                                {isOverdue && lateFeeAmount > 0 && (
                                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 pb-3">
                                        <span className="text-[10px] font-bold text-red-400 uppercase bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md">
                                            {language === 'id' ? 'Denda Keterlambatan' : 'Late Fee'}
                                        </span>
                                        <span className="text-sm font-bold text-red-500">+{formatMoney(lateFeeAmount)}</span>
                                    </div>
                                )}
                                {isOverdue && lateFeeAmount > 0 && (
                                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 pb-3 bg-red-50/50 dark:bg-red-900/10 -mx-4 px-4 py-2">
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">{language === 'id' ? 'Total Bayar Bulan Ini' : 'Total Due This Month'}</span>
                                        <span className="text-base font-black text-red-600 dark:text-red-400">{formatMoney(finalInstallment)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">{language === 'id' ? 'Sisa Bulan' : 'Months Left'}</span>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{debt.monthsLeft} {language === 'id' ? 'Bulan' : 'Months'}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Submit */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                    {isEditing ? (
                        <button
                            id="tour-save-debt-edit-btn"
                            onClick={handleUpdate}
                            className="w-full bg-primary hover:bg-primary/90 shadow-primary/30 shadow-xl active:scale-[0.98] text-white h-12 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <span>{language === 'id' ? 'Simpan Perubahan' : 'Save Changes'}</span>
                            <span className="material-symbols-outlined filled-icon">save</span>
                        </button>
                    ) : (
                        <button
                            onClick={handlePayInstallment}
                            disabled={debt.balance <= 0}
                            className={`w-full ${debt.balance <= 0 ? 'bg-slate-300 cursor-not-allowed text-slate-500' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30 shadow-xl active:scale-[0.98] text-white'} h-12 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2`}
                        >
                            <span>{language === 'id' ? 'Bayar Cicilan' : 'Pay Installment'}</span>
                            <span className="material-symbols-outlined filled-icon">payments</span>
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default DebtDetailModal;
