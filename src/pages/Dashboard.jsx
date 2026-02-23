import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import AddTransactionModal from '../components/AddTransactionModal';

const Dashboard = () => {
    const { calculateBalance, calculateIncome, calculateExpenses, transactions, language } = useApp();
    const navigate = useNavigate();
    const [timePeriod, setTimePeriod] = useState('This Month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [showPeriodMenu, setShowPeriodMenu] = useState(false);
    const [categoryType, setCategoryType] = useState('Spending'); // Spending, Income, Both
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Expose robust custom events for AppTourOverlay to interact with this Dashboard correctly
    useEffect(() => {
        const handleOpen = () => setIsAddModalOpen(true);
        const handleClose = () => setIsAddModalOpen(false);
        window.addEventListener('open-add-modal', handleOpen);
        window.addEventListener('close-add-modal', handleClose);
        return () => {
            window.removeEventListener('open-add-modal', handleOpen);
            window.removeEventListener('close-add-modal', handleClose);
        };
    }, []);

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // --- Time Period Logic ---
    const filterTransactionsByPeriod = (txs, period) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return txs.filter(t => {
            const tDate = new Date(t.date);
            if (period === 'This Month') {
                return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
            }
            if (period === 'Last Month') {
                const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                return tDate.getMonth() === lastMonthDate.getMonth() && tDate.getFullYear() === lastMonthDate.getFullYear();
            }
            // Add logic for 'Year to Date' etc if needed
            if (period === 'Year to Date') {
                return tDate.getFullYear() === currentYear && tDate <= now;
            }
            if (period === 'Choose Period') {
                if (customStartDate && customEndDate) {
                    const start = new Date(customStartDate);
                    const end = new Date(customEndDate);
                    end.setHours(23, 59, 59, 999);
                    return tDate >= start && tDate <= end;
                }
                return true; // if not fully selected, assume all or don't filter out yet
            }
            return true;
        });
    };

    const filteredTransactions = filterTransactionsByPeriod(transactions, timePeriod);

    // Strict predefined periods
    const periodOptions = ['This Month', 'Last Month', 'Year to Date', 'Choose Period'];

    // --- Spending Categories Logic ---
    let targetTransactions = filteredTransactions;
    if (categoryType === 'Spending') targetTransactions = filteredTransactions.filter(t => t.amount < 0);
    else if (categoryType === 'Income') targetTransactions = filteredTransactions.filter(t => t.amount > 0);

    const expenses = filteredTransactions.filter(t => t.amount < 0);
    const totalExpensesPeriod = expenses.reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
    const totalCategoriesAmount = targetTransactions.reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

    let sortedCategories = [];

    const getBreakdown = (txs) => {
        const categoryData = txs.reduce((acc, curr) => {
            const cat = curr.category;
            acc[cat] = (acc[cat] || 0) + Math.abs(curr.amount);
            return acc;
        }, {});
        return Object.entries(categoryData).sort(([, a], [, b]) => b - a);
    };

    // Color shades generator based on type
    const getCategoryColorClass = (idx, flowType) => {
        if (flowType === 'Spending' || flowType === 'Expense') {
            const redShades = ['bg-red-500', 'bg-rose-400', 'bg-orange-400', 'bg-pink-400', 'bg-red-300', 'bg-amber-400'];
            return redShades[idx % redShades.length];
        } else if (flowType === 'Income') {
            const greenShades = ['bg-emerald-500', 'bg-teal-400', 'bg-cyan-400', 'bg-green-400', 'bg-emerald-300', 'bg-lime-400'];
            return greenShades[idx % greenShades.length];
        }
        const mixedShades = ['bg-indigo-500', 'bg-purple-500', 'bg-blue-500', 'bg-teal-500'];
        return mixedShades[idx % mixedShades.length];
    };

    const renderStackedBar = (title, totalAmount, categories, flowType) => {
        if (categories.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-6 text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="material-symbols-outlined text-3xl opacity-50 mb-2">bar_chart</span>
                    <span className="text-xs font-bold">{language === 'id' ? 'Tidak ada data' : 'No data'}</span>
                </div>
            );
        }

        return (
            <div className="w-full space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in duration-500">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</h4>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{formatMoney(totalAmount)}</p>
                    </div>
                </div>

                {/* The Stacked Progress Bar */}
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                    {categories.map(([cat, amount], idx) => {
                        const percent = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
                        const colorClass = getCategoryColorClass(idx, flowType);
                        return (
                            <div
                                key={cat}
                                style={{ width: `${percent}%` }}
                                className={`h-full border-r border-white/20 dark:border-slate-900/50 last:border-0 transition-all duration-1000 ease-out ${colorClass}`}
                                title={`${cat}: ${percent.toFixed(1)}%`}
                            ></div>
                        );
                    })}
                </div>

                {/* Legend / Breakdown List */}
                <div className="grid grid-cols-2 gap-y-2 gap-x-2 pt-1">
                    {categories.map(([cat, amount], idx) => {
                        const percent = totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : 0;
                        const colorClass = getCategoryColorClass(idx, flowType);
                        return (
                            <div key={cat} className="flex items-center justify-between group text-[11px] sm:text-xs bg-white dark:bg-slate-800 px-2 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center gap-2 truncate">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colorClass}`}></div>
                                    <span className="font-bold text-slate-600 dark:text-slate-300 truncate">{cat}</span>
                                </div>
                                <span className="font-bold text-slate-900 dark:text-slate-100 ml-2">{percent}%</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // --- Balance Logic ---
    const totalBalance = calculateBalance();
    const isBalanceNegative = totalBalance < 0;

    // Calculate percentage change compared to last month
    const nowLocal = new Date();
    const lastMonthEndLocal = new Date(nowLocal.getFullYear(), nowLocal.getMonth(), 0, 23, 59, 59, 999);

    const balanceLastMonth = transactions
        .filter(t => new Date(t.date) <= lastMonthEndLocal)
        .reduce((acc, curr) => acc + curr.amount, 0);

    let percentageChangeVal = 0;
    let percentageChangeStr = "";
    let isPercentagePositive = true;

    if (balanceLastMonth === 0) {
        percentageChangeStr = "No data from last month";
        isPercentagePositive = true;
    } else {
        percentageChangeVal = ((totalBalance - balanceLastMonth) / Math.abs(balanceLastMonth)) * 100;
        percentageChangeStr = `${percentageChangeVal > 0 ? '+' : ''}${percentageChangeVal.toFixed(1)}%`;
        isPercentagePositive = percentageChangeVal >= 0;
        percentageChangeStr += " from last month";
    }

    // Recent Transactions (Limit 4, from ALL time, not just filtered period)
    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4);

    return (
        <>
            {/* Hero Balance Section */}
            <section className={`hero-balance-section p-4 pt-6 rounded-b-3xl text-white shadow-lg relative overflow-hidden transition-colors duration-500 mb-6 ${isBalanceNegative ? 'bg-red-500 shadow-red-500/20' : 'bg-primary shadow-primary/20'}`}>
                {/* Abstract Pattern Decoration */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>

                <div className="relative z-10 flex justify-between items-start mb-4">
                    <p className="text-white/90 text-sm font-medium opacity-90">{language === 'id' ? 'Total Saldo' : 'Total Balance'}</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="add-transaction-btn bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        {language === 'id' ? 'Tambah Transaksi' : 'Add Transaction'}
                    </button>
                </div>

                <div className="relative z-10">
                    <h2 className="text-4xl font-bold mt-1">{formatMoney(totalBalance)}</h2>
                    <div className={`mt-2 flex items-center gap-1 text-xs bg-white/20 w-fit px-2 py-1 rounded-full ${isPercentagePositive ? 'text-white' : 'text-red-100'}`}>
                        <span className="material-symbols-outlined text-[14px]">
                            {balanceLastMonth === 0 ? 'info' : (isPercentagePositive ? 'trending_up' : 'trending_down')}
                        </span>
                        <span>{percentageChangeStr}</span>
                    </div>
                </div>
            </section>

            {/* Quick Summary Cards (Based on Filtered Period) */}
            <section className="px-4 grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-lg">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm">arrow_downward</span>
                        </div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{language === 'id' ? 'Pemasukan' : 'Income'}</span>
                    </div>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatMoney(filteredTransactions.filter(t => t.amount > 0).reduce((acc, c) => acc + c.amount, 0))}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-red-50 dark:bg-red-900/20 p-1.5 rounded-lg">
                            <span className="material-symbols-outlined text-red-500 text-sm">arrow_upward</span>
                        </div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{language === 'id' ? 'Pengeluaran' : 'Expenses'}</span>
                    </div>
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatMoney(totalExpensesPeriod)}</p>
                </div>
            </section>

            {/* Spending Categories Chart */}
            <section className="p-4 mt-2">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-center mb-6 relative">
                        <div className="flex items-center gap-2 relative">
                            <button
                                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                                className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1"
                            >
                                {categoryType === 'Spending' ? (language === 'id' ? 'Pengeluaran' : 'Spending') :
                                    categoryType === 'Income' ? (language === 'id' ? 'Pemasukan' : 'Income') :
                                        (language === 'id' ? 'Semua' : 'Both')}
                                <span className="hidden sm:inline">{language === 'id' ? 'Kategori' : 'Categories'}</span>
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                            </button>
                            {/* Category Type Dropdown */}
                            {showCategoryMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowCategoryMenu(false)}></div>
                                    <div className="absolute top-8 left-0 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 w-32 py-1 flex flex-col">
                                        {['Spending', 'Income', 'Both'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => {
                                                    setCategoryType(type);
                                                    setShowCategoryMenu(false);
                                                }}
                                                className={`text-xs text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium ${categoryType === type ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => setShowPeriodMenu(!showPeriodMenu)}
                            className="text-xs font-semibold text-primary flex items-center gap-1 bg-primary/5 px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
                        >
                            <span className="truncate max-w-[80px] sm:max-w-[120px]">{timePeriod}</span>
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>

                        {/* Period Dropdown */}
                        {showPeriodMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowPeriodMenu(false)}></div>
                                <div className="absolute top-8 right-0 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 w-40 py-1 flex flex-col max-h-48 overflow-y-auto">
                                    {periodOptions.map(period => (
                                        <button
                                            key={period}
                                            onClick={() => {
                                                setTimePeriod(period);
                                                setShowPeriodMenu(false);
                                            }}
                                            className={`text-xs text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium ${timePeriod === period ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}
                                        >
                                            {period}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Custom Period Picker */}
                    {timePeriod === 'Choose Period' && (
                        <div className="flex items-center justify-between gap-2 mb-6 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-2">
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start Date</p>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="bg-transparent border-none p-0 text-sm font-bold text-slate-800 dark:text-slate-200 focus:ring-0 w-full"
                                />
                            </div>
                            <span className="material-symbols-outlined text-slate-400 text-sm">arrow_forward</span>
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">End Date</p>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="bg-transparent border-none p-0 text-sm font-bold text-slate-800 dark:text-slate-200 focus:ring-0 w-full"
                                />
                            </div>
                        </div>
                    )}

                    {/* Horizontal Bar Chart Implementation */}
                    <div className="w-full space-y-4 pt-2">
                        {categoryType === 'Both' ? (
                            <>
                                {renderStackedBar(
                                    language === 'id' ? 'Pemasukan' : 'Income Breakdown',
                                    filteredTransactions.filter(t => t.amount > 0).reduce((acc, c) => acc + c.amount, 0),
                                    getBreakdown(filteredTransactions.filter(t => t.amount > 0)),
                                    'Income'
                                )}
                                {renderStackedBar(
                                    language === 'id' ? 'Pengeluaran' : 'Spending Breakdown',
                                    filteredTransactions.filter(t => t.amount < 0).reduce((acc, c) => acc + Math.abs(c.amount), 0),
                                    getBreakdown(filteredTransactions.filter(t => t.amount < 0)),
                                    'Expense'
                                )}
                            </>
                        ) : (
                            renderStackedBar(
                                language === 'id' ? 'Rincian Kategori' : 'Category Breakdown',
                                totalCategoriesAmount,
                                getBreakdown(targetTransactions),
                                categoryType
                            )
                        )}
                    </div>
                </div>
            </section>

            {/* Advanced Features Links */}
            <section className="px-4 mt-2">
                <div
                    onClick={() => navigate('/premium')}
                    className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-6 rounded-3xl shadow-lg cursor-pointer hover:shadow-xl transition-all group mb-6 active:scale-[0.98]"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/30 transition-colors"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl -ml-8 -mb-8 group-hover:bg-purple-500/30 transition-colors"></div>

                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-amber-400">workspace_premium</span>
                                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">{language === 'id' ? 'Fitur Plus' : 'ItungIn Plus'}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">
                                {language === 'id' ? 'Akses Fitur Pro' : 'Unlock Pro Features'}
                            </h3>
                            <p className="text-sm text-slate-400 line-clamp-2 max-w-[200px]">
                                {language === 'id' ? 'Mulai rencanakan anggaran, analitik detail, dan tabungan.' : 'Master budgets, deep analytics, and savings goals.'}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                            <span className="material-symbols-outlined text-white">chevron_right</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent Transactions */}
            <section className="px-4 mt-2 pb-24">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{language === 'id' ? 'Transaksi Terakhir' : 'Recent Transactions'}</h3>
                    <button onClick={() => navigate('/transactions')} className="text-xs font-semibold text-primary">{language === 'id' ? 'Lihat Semua' : 'View All'}</button>
                </div>
                <div className="space-y-3">
                    {recentTransactions.map(transaction => (
                        <div
                            key={transaction.id}
                            onClick={() => navigate(`/transaction/${transaction.id}`)}
                            className="bg-white dark:bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-primary/5 shadow-sm cursor-pointer active:scale-[0.99] transition-transform"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${transaction.amount > 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                    <span className={`material-symbols-outlined ${transaction.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                                        {transaction.category.toLowerCase() === 'others' ? 'category' : (transaction.icon || (transaction.amount > 0 ? 'payments' : 'shopping_bag'))}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{transaction.title}</p>
                                    <p className="text-xs text-slate-400">
                                        {new Date(transaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <p className={`font-bold ${transaction.amount > 0 ? 'text-primary' : 'text-red-500'}`}>
                                {transaction.amount > 0 ? '+' : ''}{formatMoney(transaction.amount)}
                            </p>
                        </div>
                    ))}
                    {recentTransactions.length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                            <p>No transactions yet</p>
                        </div>
                    )}
                </div>
            </section>

            <AddTransactionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
        </>
    );
};

export default Dashboard;
