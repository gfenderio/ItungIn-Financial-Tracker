import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

const AddTransactionModal = ({ isOpen, onClose }) => {
    const { addTransaction, accounts, showAlert, language } = useApp();
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('Expense');
    const [note, setNote] = useState('');
    const [category, setCategory] = useState({ name: 'Food', icon: 'restaurant' });
    const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
    const [receipt, setReceipt] = useState(null);
    const fileInputRef = useRef(null);

    const expenseCategories = [
        { name: 'Food', icon: 'restaurant' },
        { name: 'Shopping', icon: 'shopping_bag' },
        { name: 'Travel', icon: 'flight' },
        { name: 'Others', icon: 'category' },
    ];

    const incomeCategories = [
        { name: 'Salary', icon: 'payments' },
        { name: 'Investment', icon: 'trending_up' },
        { name: 'Gift', icon: 'card_giftcard' },
        { name: 'Others', icon: 'category' },
    ];

    const categories = type === 'Expense' ? expenseCategories : incomeCategories;

    useEffect(() => {
        if (!categories.find(c => c.name === category.name)) {
            setCategory(categories[0]);
        }
    }, [type]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        const value = parseFloat(amount);
        if (!amount || isNaN(value) || value <= 0) {
            showAlert(language === 'id' ? 'Masukkan jumlah yang valid dan lebih dari 0' : 'Please enter a valid amount greater than 0', 'error');
            return;
        }

        const finalAmount = type === 'Expense' ? -Math.abs(value) : Math.abs(value);

        addTransaction({
            id: Date.now(),
            title: note || category.name,
            amount: finalAmount,
            date: date,
            category: category.name,
            icon: category.icon,
            accountId: accounts[0]?.id || '1',
            receipt: receipt
        });

        showAlert(language === 'id' ? 'Transaksi ditambahkan!' : 'Transaction saved successfully!', 'success');

        // Reset and close
        setAmount('');
        setNote('');
        setReceipt(null);
        setType('Expense');
        setDate(new Date().toISOString().slice(0, 16));
        onClose();
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                showAlert('File size too large. Under 2MB allowed.', 'error');
                return;
            }
            if (!file.type.startsWith('image/')) {
                showAlert('Only image files allowed.', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => setReceipt(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const getFontSize = () => {
        if (amount.length > 12) return 'text-2xl';
        if (amount.length > 9) return 'text-3xl';
        if (amount.length > 6) return 'text-4xl';
        return 'text-5xl';
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full sm:w-[28rem] bg-slate-50 dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300 font-display">

                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex-1 pl-4 text-center">
                        {language === 'id' ? 'Tambah Transaksi' : 'Add Transaction'}
                    </h3>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                        <span className="material-symbols-outlined border-slate-400">close</span>
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 pb-4 flex flex-col">
                    {/* Amount Block */}
                    <div className="bg-white dark:bg-slate-800 rounded-b-3xl pb-6 shadow-sm mb-4">
                        <div className="px-4 py-2 mt-2">
                            <div className="flex h-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 p-1">
                                <button
                                    onClick={() => setType('Expense')}
                                    className={`flex-1 h-full rounded-full text-sm font-bold transition-all ${type === 'Expense' ? 'bg-white dark:bg-slate-600 text-red-500 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    {language === 'id' ? 'Pengeluaran' : 'Expense'}
                                </button>
                                <button
                                    onClick={() => setType('Income')}
                                    className={`flex-1 h-full rounded-full text-sm font-bold transition-all ${type === 'Income' ? 'bg-white dark:bg-slate-600 text-emerald-500 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    {language === 'id' ? 'Pemasukan' : 'Income'}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center py-6 px-4">
                            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
                                {language === 'id' ? 'Masukkan Jumlah' : 'Enter Amount'}
                            </span>
                            <div className="flex items-center gap-2 justify-center w-full">
                                <span className={`${type === 'Expense' ? 'text-red-500' : 'text-emerald-500'} font-bold ${getFontSize()}`}>Rp</span>
                                <input
                                    autoFocus
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className={`w-full max-w-[80%] text-center bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 font-bold tracking-tight p-0 placeholder:text-slate-300 ${getFontSize()}`}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="px-4 space-y-5 flex-1 max-h-full">
                        {/* Category */}
                        <div>
                            <h3 className="text-slate-900 dark:text-slate-100 text-sm font-bold mb-3">{language === 'id' ? 'Kategori' : 'Category'}</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {categories.map((cat) => (
                                    <div
                                        key={cat.name}
                                        onClick={() => setCategory(cat)}
                                        className="flex flex-col items-center gap-2 cursor-pointer group"
                                    >
                                        <div className={`w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-200 border border-slate-100 dark:border-slate-800 text-2xl ${category.name === cat.name ? (type === 'Expense' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 font-bold border-red-500/0 scale-105' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 font-bold border-emerald-500/0 scale-105') : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                                            <span className={`material-symbols-outlined text-3xl ${category.name === cat.name ? 'filled-icon' : ''}`}>{cat.icon}</span>
                                        </div>
                                        <span className={`text-[10px] sm:text-xs font-bold ${category.name === cat.name ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>{cat.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-3">
                            <div className="relative flex items-center gap-4 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-xl">calendar_month</span>
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{language === 'id' ? 'Tanggal & Waktu' : 'Date & Time'}</p>
                                    <input
                                        type="datetime-local"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="bg-transparent border-none p-0 text-sm font-bold text-slate-800 dark:text-slate-200 focus:ring-0 w-full"
                                    />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-start gap-4">
                                <span className="material-symbols-outlined text-slate-400 mt-1">notes</span>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none min-h-[40px]"
                                    placeholder={language === 'id' ? 'Tambahkan catatan...' : 'Add a note...'}
                                    rows="2"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Submit */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={handleSubmit}
                        className={`w-full ${type === 'Expense' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'} text-white h-12 rounded-full font-bold text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2`}
                    >
                        <span>{language === 'id' ? 'Simpan Transaksi' : 'Save Transaction'}</span>
                        <span className="material-symbols-outlined filled-icon">check_circle</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddTransactionModal;
