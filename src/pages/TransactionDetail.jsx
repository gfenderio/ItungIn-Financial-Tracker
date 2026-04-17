import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const TransactionDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { transactions, accounts, updateTransaction, deleteTransaction, language, showConfirm, showAlert } = useApp();

    // Find transaction
    const transaction = transactions.find(t => t.id.toString() === id);
    const account = accounts.find(a => a.id === transaction?.accountId);

    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(transaction?.title || '');
    const [amount, setAmount] = useState(transaction ? Math.abs(transaction.amount).toString() : '');
    const [date, setDate] = useState(transaction ? new Date(transaction.date).toISOString().slice(0, 16) : '');
    const [category, setCategory] = useState(transaction?.category || '');
    const [type, setType] = useState(transaction && transaction.amount > 0 ? 'income' : 'expense');

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (!transaction) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500">
                <p>{language === 'id' ? 'Transaksi tidak ditemukan.' : 'Transaction not found.'}</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-primary font-bold">Go Back</button>
            </div>
        );
    }

    const handleDelete = async () => {
        const confirmed = await showConfirm(
            language === 'id' ? 'Hapus Transaksi?' : 'Delete Transaction?',
            language === 'id' ? 'Tindakan ini tidak bisa dibatalkan.' : 'This action cannot be undone.',
            'danger'
        );

        if (confirmed) {
            deleteTransaction(transaction.id);
            showAlert(language === 'id' ? 'Transaksi dihapus.' : 'Transaction deleted.', 'success');
            navigate('/transactions');
        }
    };

    const handleUpdate = () => {
        const val = parseFloat(amount);
        if (!title || isNaN(val) || val <= 0 || !date || !category) {
            showAlert(language === 'id' ? 'Mohon lengkapi semua kolom.' : 'Please fill all fields.', 'error');
            return;
        }

        if (val >= 1000000000000) {
            showAlert(language === 'id' ? 'Nominal maksimal tidak boleh menyentuh 1 Triliun' : 'Maximum value cannot reach 1 Trillion', 'error');
            return;
        }

        const finalAmount = type === 'expense' ? -Math.abs(val) : Math.abs(val);

        updateTransaction({
            ...transaction,
            title,
            amount: finalAmount,
            date: new Date(date).toISOString(),
            category
        });

        setIsEditing(false);
        showAlert(language === 'id' ? 'Perubahan disimpan!' : 'Changes saved!', 'success');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-display pb-20">
            {/* Header */}
            <div className="flex items-center justify-between bg-transparent p-4 sticky top-0 z-10 text-slate-900 dark:text-slate-100 mb-4">
                <div className="flex size-12 shrink-0 items-center cursor-pointer bg-white/50 dark:bg-black/20 rounded-full justify-center backdrop-blur-md" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl text-slate-500 font-bold bg-white/50 dark:bg-black/20 backdrop-blur-md">Batal</button>
                            <button id="tour-save-edit-btn" onClick={handleUpdate} className="px-4 py-2 rounded-xl text-white font-bold bg-primary shadow-sm shadow-primary/30">Simpan</button>
                        </>
                    ) : (
                        <>
                            <button onClick={handleDelete} className="flex size-12 shrink-0 items-center cursor-pointer text-red-500 bg-white/50 dark:bg-black/20 rounded-full justify-center backdrop-blur-md">
                                <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                            <button id="tour-edit-btn" onClick={() => setIsEditing(true)} className="flex size-12 shrink-0 items-center cursor-pointer text-primary bg-white/50 dark:bg-black/20 rounded-full justify-center backdrop-blur-md">
                                <span className="material-symbols-outlined text-xl">edit</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="px-6 flex flex-col items-center">
                <div className={`p-6 rounded-3xl mb-4 ${transaction.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} transition-colors duration-300`}>
                    <span className="material-symbols-outlined text-5xl">
                        {transaction.icon || (transaction.amount > 0 ? 'payments' : 'shopping_bag')}
                    </span>
                </div>

                {isEditing ? (
                    <div className="w-full bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm space-y-4 mb-8">
                        <div>
                            <label className="text-xs font-bold text-slate-400 mb-1 block">Tipe</label>
                            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                                <button onClick={() => setType('expense')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'expense' ? 'bg-white dark:bg-slate-800 text-red-500 shadow-sm' : 'text-slate-500'}`}>Pengeluaran</button>
                                <button onClick={() => setType('income')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'income' ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm' : 'text-slate-500'}`}>Pemasukan</button>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 mb-1 block">Nominal</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-bold text-lg dark:text-white" placeholder="0" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 mb-1 block">Judul</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-bold dark:text-white" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 mb-1 block">Tanggal & Waktu</label>
                            <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-bold dark:text-white" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 mb-1 block">Kategori</label>
                            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-bold dark:text-white" />
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">{transaction.amount > 0 ? 'Income' : 'Expense'}</p>
                        <h1 className={`text-3xl font-bold mb-8 ${transaction.amount > 0 ? 'text-green-600' : 'text-slate-900 dark:text-slate-100'}`}>
                            {transaction.amount > 0 ? '+' : ''}{formatMoney(transaction.amount)}
                        </h1>

                        {/* Details Card */}
                        <div className="w-full bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-sm font-medium">Title</span>
                                <span className="text-slate-900 dark:text-slate-100 font-bold">{transaction.title}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-sm font-medium">Category</span>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-sm">{transaction.icon}</span>
                                    <span className="text-slate-900 dark:text-slate-100 font-bold">{transaction.category}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-sm font-medium">Date</span>
                                <span className="text-slate-900 dark:text-slate-100 font-bold text-sm">
                                    {new Date(transaction.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-sm font-medium">Account</span>
                                <span className="text-slate-900 dark:text-slate-100 font-bold">{account?.name || 'Main Bank Account'}</span>
                            </div>
                        </div>
                    </>
                )}

                {/* Receipt Card */}
                {!isEditing && transaction.receipt && (
                    <div className="w-full mt-4 bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm">
                        <p className="text-slate-400 text-sm font-medium mb-3">Receipt</p>
                        <img src={transaction.receipt} alt="Receipt" className="w-full rounded-2xl border border-slate-100 dark:border-slate-700" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionDetail;
