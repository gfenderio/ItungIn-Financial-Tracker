import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const AllTransactions = () => {
    const navigate = useNavigate();
    const { transactions } = useApp();

    // States for filtering and sorting
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All'); // All, Expense, Income
    const [sortBy, setSortBy] = useState('DateDesc'); // DateDesc, DateAsc, AmountDesc, AmountAsc

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Filter and Sort Processing
    const processedTransactions = useMemo(() => {
        let result = [...transactions];

        // 1. Filter by Search Query
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                (t.title && t.title.toLowerCase().includes(query)) ||
                (t.category && t.category.toLowerCase().includes(query))
            );
        }

        // 2. Filter by Type
        if (filterType === 'Expense') {
            result = result.filter(t => t.amount < 0);
        } else if (filterType === 'Income') {
            result = result.filter(t => t.amount > 0);
        }

        // 3. Sort
        result.sort((a, b) => {
            if (sortBy === 'DateDesc') {
                return new Date(b.date) - new Date(a.date);
            } else if (sortBy === 'DateAsc') {
                return new Date(a.date) - new Date(b.date);
            } else if (sortBy === 'AmountDesc') {
                return Math.abs(b.amount) - Math.abs(a.amount);
            } else if (sortBy === 'AmountAsc') {
                return Math.abs(a.amount) - Math.abs(b.amount);
            }
            return 0;
        });

        return result;
    }, [transactions, searchQuery, filterType, sortBy]);

    // Grouping by Date
    const groupedTransactions = useMemo(() => {
        const groups = {};

        processedTransactions.forEach(t => {
            const d = new Date(t.date);
            // Ignore time for grouping
            const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

            // Check for Today / Yesterday
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let keyStr = dateStr;
            if (d.toLocaleDateString() === today.toLocaleDateString()) {
                keyStr = "Today, " + dateStr;
            } else if (d.toLocaleDateString() === yesterday.toLocaleDateString()) {
                keyStr = "Yesterday, " + dateStr;
            }

            if (!groups[keyStr]) groups[keyStr] = [];
            groups[keyStr].push(t);
        });

        return groups;
    }, [processedTransactions]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-display pb-20">
            {/* Header */}
            <div className="flex items-center bg-white dark:bg-slate-800 p-4 sticky top-0 z-20 shadow-sm text-slate-900 dark:text-slate-100 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex size-12 shrink-0 items-center justify-center cursor-pointer rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </div>
                <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Transactions</h2>
                <div className="w-12"></div>
            </div>

            {/* Search and Filters */}
            <div className="px-4 mb-4 space-y-3 sticky top-[72px] z-10 bg-slate-50 dark:bg-slate-900 py-2">
                {/* Search Bar */}
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search transactions..."
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                    {searchQuery && (
                        <span
                            className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600"
                            onClick={() => setSearchQuery('')}
                        >
                            close
                        </span>
                    )}
                </div>

                {/* Filter and Sort Row */}
                <div className="flex gap-2 w-full overflow-x-auto overflow-y-hidden hide-scrollbar py-1">
                    {/* Types */}
                    {['All', 'Expense', 'Income'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${filterType === type ? (type === 'Expense' ? 'bg-red-500 text-white' : type === 'Income' ? 'bg-emerald-500 text-white' : 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900') : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                        >
                            {type}
                        </button>
                    ))}

                    {/* Sort Dropdown */}
                    <div className="relative ml-auto shrink-0 flex items-center">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 pl-3 pr-8 py-1.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                        >
                            <option value="DateDesc">Newest</option>
                            <option value="DateAsc">Oldest</option>
                            <option value="AmountDesc">Highest Amount</option>
                            <option value="AmountAsc">Lowest Amount</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-2 text-slate-400 pointer-events-none text-[16px]">swap_vert</span>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="px-4">
                {Object.keys(groupedTransactions).length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2">receipt_long</span>
                        <p>No transactions found.</p>
                    </div>
                ) : (
                    Object.keys(groupedTransactions).map(dateKey => (
                        <div key={dateKey} className="mb-6">
                            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 px-1 sticky top-[160px] bg-slate-50 dark:bg-slate-900/90 py-1 z-10 backdrop-blur-sm">
                                {dateKey}
                            </h3>
                            <div className="space-y-3">
                                {groupedTransactions[dateKey].map(transaction => (
                                    <div
                                        key={transaction.id}
                                        onClick={() => navigate(`/transaction/${transaction.id}`)}
                                        className="bg-white dark:bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-primary/5 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.99] transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${transaction.amount > 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                                <span className={`material-symbols-outlined ${transaction.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                                                    {transaction.category.toLowerCase() === 'others' ? 'category' : (transaction.icon || (transaction.amount > 0 ? 'payments' : 'shopping_bag'))}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900 dark:text-slate-100 max-w-[150px] sm:max-w-xs truncate">{transaction.title}</p>
                                                <p className="text-[11px] text-slate-400">
                                                    {transaction.category} • {new Date(transaction.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </p>
                                            </div>
                                        </div>
                                        <p className={`font-bold shrink-0 ${transaction.amount > 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 text-right max-w-[100px] truncate leading-tight'}`}>
                                            {transaction.amount > 0 ? '+' : ''}{formatMoney(transaction.amount)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AllTransactions;
