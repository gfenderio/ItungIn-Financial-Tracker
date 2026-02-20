import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const AddTransaction = () => {
    const navigate = useNavigate();
    const { addTransaction, accounts, addAccount } = useApp();
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('Expense');
    const [note, setNote] = useState('');
    const [category, setCategory] = useState({ name: 'Food', icon: 'restaurant' });
    const [date, setDate] = useState(new Date().toISOString().slice(0, 16)); // Format: YYYY-MM-DDTHH:mm
    const [selectedAccount, setSelectedAccount] = useState(accounts[0] || { id: '1', name: 'Main Bank Account' });
    const [receipt, setReceipt] = useState(null);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [newAccountName, setNewAccountName] = useState('');
    const fileInputRef = useRef(null);

    const [error, setError] = useState('');

    const expenseCategories = [
        { name: 'Food', icon: 'restaurant' },
        { name: 'Debt Payment', icon: 'credit_score' },
        { name: 'Shopping', icon: 'shopping_bag' },
        { name: 'Others', icon: 'more_horiz' },
    ];

    const incomeCategories = [
        { name: 'Salary', icon: 'payments' },
        { name: 'Investment', icon: 'trending_up' },
        { name: 'Gift', icon: 'card_giftcard' },
        { name: 'Others', icon: 'more_horiz' },
    ];

    const categories = type === 'Expense' ? expenseCategories : incomeCategories;

    // Ensure category is reset or valid when switching types
    useEffect(() => {
        if (!categories.find(c => c.name === category.name)) {
            setCategory(categories[0]);
        }
    }, [type]);

    const handleSubmit = () => {
        if (!amount || parseFloat(amount) === 0) {
            setError('Please enter an amount');
            alert('Please enter an amount'); // Simple feedback for now
            return;
        }

        const value = parseFloat(amount);
        const finalAmount = type === 'Expense' ? -Math.abs(value) : Math.abs(value);

        const newTransaction = {
            id: Date.now(),
            title: note || category.name,
            amount: finalAmount,
            date: date,
            category: category.name,
            icon: category.icon,
            accountId: selectedAccount.id,
            receipt: receipt
        };

        addTransaction(newTransaction);
        navigate('/');
    };

    const handleReset = () => {
        setAmount('');
        setNote('');
        setReceipt(null);
        setType('Expense');
        setDate(new Date().toISOString().slice(0, 16));
        setIsMenuOpen(false);
        setError('');
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validation: Max size 2MB
            if (file.size > 2 * 1024 * 1024) {
                alert("File size too large. Please select an image under 2MB.");
                return;
            }

            // Validation: Image type
            if (!file.type.startsWith('image/')) {
                alert("Only image files are allowed.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setReceipt(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateAccount = () => {
        if (newAccountName.trim()) {
            addAccount(newAccountName);
            setNewAccountName('');
            // Logic to select the newly created account would go here, 
            // but for simplicity we just rely on the user seeing it in the list next time or we could optimistically update.
            // For now, let's close modal.
            setIsAccountModalOpen(false);
        }
    };

    // Dynamic Font Size for IDR
    const getFontSize = () => {
        if (amount.length > 12) return 'text-2xl';
        if (amount.length > 9) return 'text-3xl';
        if (amount.length > 6) return 'text-4xl';
        return 'text-5xl';
    };

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col bg-slate-50 dark:bg-slate-900 overflow-x-hidden font-display">
            {/* Top App Bar */}
            <div className="flex items-center bg-white dark:bg-slate-800 p-4 pb-2 justify-between sticky top-0 z-10 text-slate-900 dark:text-slate-100 shadow-sm mb-2">
                <div className="flex size-12 shrink-0 items-center cursor-pointer" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined text-2xl">close</span>
                </div>
                <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Add Transaction</h2>
                <div className="flex w-12 items-center justify-end relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center justify-center rounded-xl h-12 w-12 bg-transparent text-primary hover:bg-primary/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-2xl">more_horiz</span>
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
                            <button
                                onClick={handleReset}
                                className="w-full text-left px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">restart_alt</span>
                                Reset Form
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Menu Overlay to close */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-0 bg-transparent" onClick={() => setIsMenuOpen(false)}></div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-b-3xl pb-6 shadow-sm mb-4">
                {/* Expense/Income Toggle */}
                <div className="px-4 py-2">
                    <div className="flex h-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 p-1">
                        <button
                            onClick={() => setType('Expense')}
                            className={`flex-1 h-full rounded-full text-sm font-semibold transition-all ${type === 'Expense' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            Expense
                        </button>
                        <button
                            onClick={() => setType('Income')}
                            className={`flex-1 h-full rounded-full text-sm font-semibold transition-all ${type === 'Income' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            Income
                        </button>
                    </div>
                </div>

                {/* Main Amount Input */}
                <div className="flex flex-col items-center justify-center py-6 px-4">
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Enter Amount</span>
                    <div className="flex items-center gap-2 justify-center w-full">
                        <span className={`text-primary font-bold ${getFontSize()}`}>Rp</span>
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

            <div className="flex-1 px-4 space-y-6 pb-24">
                {/* Category Grid */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-slate-900 dark:text-slate-100 text-base font-bold">Category</h3>
                        <button className="text-primary text-sm font-semibold">See all</button>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        {categories.map((cat) => (
                            <div
                                key={cat.name}
                                onClick={() => setCategory(cat)}
                                className="flex flex-col items-center gap-2 cursor-pointer group"
                            >
                                <div className={`w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-200 ${category.name === cat.name ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 shadow-sm'}`}>
                                    <span className={`material-symbols-outlined text-3xl ${category.name === cat.name ? 'filled-icon' : ''}`}>{cat.icon}</span>
                                </div>
                                <span className={`text-xs font-semibold ${category.name === cat.name ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Transaction Details */}
                <div>
                    <h3 className="text-slate-900 dark:text-slate-100 text-base font-bold mb-3">Transaction Details</h3>
                    <div className="space-y-3">
                        {/* Date & Time */}
                        <div className="relative flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                                <span className="material-symbols-outlined text-xl">calendar_month</span>
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <p className="text-xs text-slate-400 font-medium">Date & Time</p>
                                <input
                                    type="datetime-local"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="bg-transparent border-none p-0 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:ring-0 w-full"
                                />
                            </div>
                            <span className="material-symbols-outlined text-slate-300 pointer-events-none">edit_calendar</span>
                        </div>

                        {/* Account */}
                        <div
                            onClick={() => setIsAccountModalOpen(true)}
                            className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 cursor-pointer"
                        >
                            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                                <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-400 font-medium">Account</p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedAccount.name}</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-300">expand_more</span>
                        </div>

                        {/* Note */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-slate-400 text-lg">notes</span>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Note</span>
                            </div>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none"
                                placeholder="Add a note..."
                                rows="2"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Attach Receipt */}
                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center justify-center w-full gap-2 border-2 border-dashed ${receipt ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700'} p-4 rounded-2xl text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-colors`}
                >
                    <span className={`material-symbols-outlined ${receipt ? 'text-primary' : ''}`}>{receipt ? 'image' : 'add_a_photo'}</span>
                    <span className={`text-sm font-semibold ${receipt ? 'text-primary' : ''}`}>{receipt ? 'Receipt Attached' : 'Attach Receipt'}</span>
                </button>
            </div>

            {/* Floating Bottom Action Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 z-20">
                <button
                    onClick={handleSubmit}
                    className="w-full bg-primary hover:bg-green-700 text-white h-14 rounded-full font-bold text-lg shadow-xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <span>Save Transaction</span>
                    <span className="material-symbols-outlined filled-icon">check_circle</span>
                </button>
            </div>

            {/* Account Selection Modal */}
            {isAccountModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsAccountModalOpen(false)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Select Account</h3>
                            <button onClick={() => setIsAccountModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                            {accounts.map(acc => (
                                <button
                                    key={acc.id}
                                    onClick={() => {
                                        setSelectedAccount(acc);
                                        setIsAccountModalOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${selectedAccount.id === acc.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                >
                                    <span className="material-symbols-outlined">{acc.icon || 'account_balance_wallet'}</span>
                                    <span className="font-semibold">{acc.name}</span>
                                    {selectedAccount.id === acc.id && <span className="material-symbols-outlined ml-auto">check</span>}
                                </button>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Add New Account</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newAccountName}
                                    onChange={(e) => setNewAccountName(e.target.value)}
                                    placeholder="Account Name"
                                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white"
                                />
                                <button
                                    onClick={handleCreateAccount}
                                    disabled={!newAccountName.trim()}
                                    className="bg-primary disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 rounded-xl font-bold"
                                >
                                    <span className="material-symbols-outlined">add</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddTransaction;
