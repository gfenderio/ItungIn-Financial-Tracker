import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export default function Budgets() {
    const { budgets, setBudgets, transactions, language, showAlert } = useApp();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);

    // Form State
    const [category, setCategory] = useState('Food');
    const [limit, setLimit] = useState('');

    // Predefined budgetable categories
    const availableCategories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Personal', 'Housing', 'Others'];

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Calculate current month spending per category
    const currentMonthSpending = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return t.amount < 0 && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        return currentMonthTransactions.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
            return acc;
        }, {});
    }, [transactions]);



    const handleSave = (e) => {
        e.preventDefault();
        const numericLimit = parseInt(limit.toString().replace(/\D/g, ''), 10);
        if (isNaN(numericLimit) || numericLimit <= 0) return;

        if (numericLimit >= 1000000000000) {
            showAlert(language === 'id' ? 'Nominal maksimal tidak boleh menyentuh 1 Triliun' : 'Maximum value cannot reach 1 Trillion', 'error');
            return;
        }

        if (editingBudget) {
            setBudgets(prev => prev.map(b => b.id === editingBudget.id ? { ...b, category, limit: numericLimit } : b));
        } else {
            const exists = budgets.find(b => b.category === category);
            if (exists) {
                setBudgets(prev => prev.map(b => b.id === exists.id ? { ...b, limit: b.limit + numericLimit } : b));
            } else {
                setBudgets(prev => [...prev, { id: Date.now(), category, limit: numericLimit, period: 'monthly' }]);
            }
        }
        closeModal();
    };

    const handleDelete = (id) => {
        setBudgets(prev => prev.filter(b => b.id !== id));
    };

    const openModal = (budget = null) => {
        if (budget) {
            setEditingBudget(budget);
            setCategory(budget.category);
            setLimit(budget.limit.toString());
        } else {
            setEditingBudget(null);
            setCategory('Food');
            setLimit('');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBudget(null);
        setCategory('Food');
        setLimit('');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col pt-16">
            <header className="px-6 py-6 pb-2">
                <div className="flex justify-between items-end mb-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/premium')} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary transition-colors active:scale-95 shrink-0">
                            <span className="material-symbols-outlined font-bold">arrow_back</span>
                        </button>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                                {language === 'id' ? 'Anggaran' : 'Budgets'}
                            </h2>
                            <p className="text-sm font-medium text-slate-500 mt-1">
                                {language === 'id' ? 'Kelola batas pengeluaran bulanan Anda' : 'Manage your monthly spending limits'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-primary hover:bg-primary-dark text-white p-3 rounded-2xl shadow-lg shadow-primary/20 transition-transform active:scale-95 flex items-center justify-center shrink-0"
                    >
                        <span className="material-symbols-outlined text-2xl leading-none">add</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 px-4 pb-24 overflow-y-auto space-y-4 pt-4">
                {budgets.length === 0 ? (
                    <div id="tour-budget-cards" className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2 opacity-60">
                        <span className="material-symbols-outlined text-5xl">track_changes</span>
                        <p className="font-medium text-sm">
                            {language === 'id' ? 'Belum ada anggaran' : 'No budgets set'}
                        </p>
                    </div>
                ) : (
                    <div id="tour-budget-cards" className="grid gap-4">
                        {budgets.map(budget => {
                            const spent = currentMonthSpending[budget.category] || 0;
                            const remaining = budget.limit - spent;
                            const percent = Math.min((spent / budget.limit) * 100, 100);
                            const isOver = spent >= budget.limit;
                            const isWarning = percent >= 80 && !isOver;

                            let progressColor = 'bg-blue-500';
                            if (isOver) progressColor = 'bg-red-500';
                            else if (isWarning) progressColor = 'bg-orange-400';

                            return (
                                <div key={budget.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                                                <span className="material-symbols-outlined shrink-0 text-xl">category</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 dark:text-slate-100">{budget.category}</h3>
                                                <p className="text-xs text-slate-400 font-medium">
                                                    {language === 'id' ? 'Batas Bulanan' : 'Monthly Limit'}: {formatMoney(budget.limit)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openModal(budget)} className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(budget.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden mb-2 relative">
                                        <div
                                            className={`h-full ${progressColor} transition-all duration-1000 ease-out`}
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                                                {language === 'id' ? 'Terpakai' : 'Spent'}
                                            </p>
                                            <p className={`font-bold leading-none ${isOver ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                                                {formatMoney(spent)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                                                {language === 'id' ? 'Sisa' : 'Left'}
                                            </p>
                                            <p className={`font-bold leading-none ${isOver ? 'text-red-500' : 'text-emerald-500'}`}>
                                                {isOver ? '-' : formatMoney(remaining)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="bg-white dark:bg-slate-800 w-full sm:w-[400px] rounded-t-3xl sm:rounded-3xl p-6 relative z-10 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 fade-in duration-300">
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 sm:hidden"></div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                            {editingBudget ? (language === 'id' ? 'Edit Anggaran' : 'Edit Budget') : (language === 'id' ? 'Buat Anggaran' : 'New Budget')}
                        </h3>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    {language === 'id' ? 'Kategori' : 'Category'}
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-slate-800 dark:text-slate-200"
                                >
                                    {availableCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    {language === 'id' ? 'Batas Bulanan (Limit)' : 'Monthly Limit'}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={limit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                        onChange={(e) => setLimit(e.target.value.replace(/\./g, ''))}
                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-slate-800 dark:text-slate-200"
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] mt-4"
                            >
                                {language === 'id' ? 'Simpan' : 'Save'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
