import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

const AddTransactionModal = ({ isOpen, onClose }) => {
    const { addTransaction, accounts, showAlert, language, budgets, transactions, showConfirm } = useApp();
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
        { name: 'Housing', icon: 'home' },
        { name: 'Transport', icon: 'commute' },
        { name: 'Utilities', icon: 'bolt' },
        { name: 'Healthcare', icon: 'medical_services' },
        { name: 'Entertainment', icon: 'sports_esports' },
        { name: 'Education', icon: 'school' },
        { name: 'Travel', icon: 'flight' },
        { name: 'Others', icon: 'category' },
    ];

    const incomeCategories = [
        { name: 'Salary', icon: 'payments' },
        { name: 'Business', icon: 'storefront' },
        { name: 'Investment', icon: 'trending_up' },
        { name: 'Freelance', icon: 'laptop_mac' },
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

    const handleSubmit = async () => {
        const value = parseFloat(amount);
        if (!amount || isNaN(value) || value <= 0) {
            showAlert(language === 'id' ? 'Masukkan jumlah yang valid dan lebih dari 0' : 'Please enter a valid amount greater than 0', 'error');
            return;
        }

        if (type === 'Expense') {
            const budget = budgets?.find(b => b.category === category.name);
            if (budget && budget.limit > 0) {
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                const spent = transactions
                    .filter(t => t.amount < 0 && t.category === category.name)
                    .filter(t => {
                        const d = new Date(t.date);
                        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                    })
                    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

                const newTotal = spent + value;
                const ratio = newTotal / budget.limit;

                if (ratio >= 1.0) {
                    const confirmed = await showConfirm(
                        language === 'id' ? 'Batas Anggaran Terlewati' : 'Budget Limit Exceeded',
                        language === 'id'
                            ? `Pengeluaran ini akan melebihi anggaran bulanan untuk ${category.name}. Apakah Anda yakin ingin melanjutkan?`
                            : `This expense will exceed your monthly budget for ${category.name}. Are you sure you want to proceed?`,
                        'warning'
                    );
                    if (!confirmed) return;
                } else if (ratio >= 0.8) {
                    showAlert(
                        language === 'id'
                            ? `Pengeluaran ini membuat anggaran ${category.name} mendekati batas.`
                            : `This expense puts your ${category.name} budget near its limit.`,
                        'warning'
                    );
                }
            }
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
                    <button id="tour-close-modal-btn" onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                        <span className="material-symbols-outlined border-slate-400">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">{language === 'id' ? 'Nama Transaksi (Maks 15)' : 'Transaction Name (Max 15)'}</label>
                        <input
                            type="text"
                            maxLength={15}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 transition-all placeholder:text-slate-400"
                            placeholder={language === 'id' ? 'Cth: Makan Siang, Gaji...' : 'Ex: Lunch, Salary...'}
                        />
                    </div>

                    <div id="tour-amount-input" className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-3">
                        <div className={`font-black text-xl ${type === 'Expense' ? 'text-red-500' : 'text-emerald-500'}`}>Rp</div>
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
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 truncate">{language === 'id' ? 'Tipe' : 'Type'}</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="Expense">{language === 'id' ? 'Pengeluaran' : 'Expense'}</option>
                                <option value="Income">{language === 'id' ? 'Pemasukan' : 'Income'}</option>
                            </select>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 truncate">{language === 'id' ? 'Kategori' : 'Category'}</label>
                            <select
                                value={category.name}
                                onChange={(e) => {
                                    const selected = categories.find(c => c.name === e.target.value);
                                    if (selected) setCategory(selected);
                                }}
                                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                            >
                                {categories.map(c => (
                                    <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">{language === 'id' ? 'Tanggal' : 'Date'}</label>
                            <input
                                type="datetime-local"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Submit */}
                <div id="tour-save-btn" className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
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
