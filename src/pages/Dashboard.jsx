import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const Dashboard = () => {
    const { calculateBalance, calculateIncome, calculateExpenses, transactions } = useApp();
    const navigate = useNavigate();
    const [timePeriod, setTimePeriod] = useState('This Month');
    const [showPeriodMenu, setShowPeriodMenu] = useState(false);

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
            // Add more logic for 'Month to Date' etc if needed, treating Month to Date same as This Month for simplicity or specific day check
            if (period === 'Month to Date') {
                return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear && tDate <= now;
            }
            return true;
        });
    };

    const filteredTransactions = filterTransactionsByPeriod(transactions, timePeriod);

    // --- Spending Categories Logic ---
    const expenses = filteredTransactions.filter(t => t.amount < 0);
    const totalExpensesPeriod = expenses.reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

    const categoryData = expenses.reduce((acc, curr) => {
        const cat = curr.category;
        acc[cat] = (acc[cat] || 0) + Math.abs(curr.amount);
        return acc;
    }, {});

    // Color Palette
    const categoryColors = {
        'Food': 'bg-orange-500',
        'Debt Payment': 'bg-red-500',
        'Shopping': 'bg-pink-500',
        'Others': 'bg-slate-500',
        'Transport': 'bg-blue-500',
        'Utilities': 'bg-yellow-500',
        'Entertainment': 'bg-purple-500',
        'Health': 'bg-teal-500',
        'Education': 'bg-indigo-500'
    };

    const getCategoryColor = (catName) => categoryColors[catName] || 'bg-primary';

    const sortedCategories = Object.entries(categoryData)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4);

    // --- Balance Logic ---
    const totalBalance = calculateBalance();
    const isBalanceNegative = totalBalance < 0;

    // Dummy logic for percentage change - in real app, compare with previous month's end balance
    const percentageChange = "+2.4%";

    // Recent Transactions (Limit 4, from ALL time, not just filtered period)
    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4);

    return (
        <>
            {/* Hero Balance Section */}
            <section className="p-4">
                <div className={`rounded-xl p-6 text-white shadow-lg relative overflow-hidden transition-colors duration-500 ${isBalanceNegative ? 'bg-red-500 shadow-red-500/20' : 'bg-primary shadow-primary/20'}`}>
                    {/* Abstract Pattern Decoration */}
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                    <div className="relative z-10">
                        <p className="text-white/90 text-sm font-medium opacity-90">Total Balance</p>
                        <h2 className="text-4xl font-bold mt-1">{formatMoney(totalBalance)}</h2>
                        <div className="mt-4 flex items-center gap-2 text-xs bg-white/20 w-fit px-2 py-1 rounded-full">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span>
                            <span>{percentageChange} from last month</span>
                        </div>
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
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Income</span>
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
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Expenses</span>
                    </div>
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatMoney(totalExpensesPeriod)}</p>
                </div>
            </section>

            {/* Spending Categories Chart */}
            <section className="p-4 mt-2">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-center mb-6 relative">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Spending Categories</h3>
                        <button
                            onClick={() => setShowPeriodMenu(!showPeriodMenu)}
                            className="text-xs font-semibold text-primary flex items-center gap-1 bg-primary/5 px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
                        >
                            {timePeriod}
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>

                        {/* Period Dropdown */}
                        {showPeriodMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowPeriodMenu(false)}></div>
                                <div className="absolute top-8 right-0 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 w-32 py-1 flex flex-col">
                                    {['This Month', 'Last Month', 'Month to Date'].map(period => (
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

                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="donut-chart flex-shrink-0 relative w-32 h-32 flex items-center justify-center">
                            {/* Simple CSS Donut representation */}
                            <div className="absolute inset-0 rounded-full border-[12px] border-slate-100 dark:border-slate-700"></div>
                            <div className="absolute inset-0 rounded-full border-[12px] border-primary border-t-transparent border-l-transparent transform -rotate-45"></div>
                            <div className="relative z-10 text-center">
                                <span className="text-xs text-slate-400 block">Total</span>
                                <span className="font-bold text-sm block">{formatMoney(totalExpensesPeriod)}</span>
                            </div>
                        </div>
                        <div className="w-full space-y-3">
                            {sortedCategories.map(([cat, amount], idx) => (
                                <div key={cat} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(cat)}`}></div>
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{cat}</span>
                                    </div>
                                    <span className="text-sm font-bold">{Math.round((amount / totalExpensesPeriod) * 100) || 0}%</span>
                                </div>
                            ))}
                            {sortedCategories.length === 0 && <p className="text-sm text-slate-400 text-center py-2">No expenses for {timePeriod}</p>}
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent Transactions */}
            <section className="px-4 mt-2 pb-24">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Recent Transactions</h3>
                    <button onClick={() => navigate('/transactions')} className="text-xs font-semibold text-primary">View All</button>
                </div>
                <div className="space-y-3">
                    {recentTransactions.map(transaction => (
                        <div
                            key={transaction.id}
                            onClick={() => navigate(`/transaction/${transaction.id}`)}
                            className="bg-white dark:bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-primary/5 shadow-sm cursor-pointer active:scale-[0.99] transition-transform"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${transaction.amount > 0 ? 'bg-primary/10' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                    <span className={`material-symbols-outlined ${transaction.amount > 0 ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}>
                                        {transaction.icon || (transaction.amount > 0 ? 'payments' : 'shopping_bag')}
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
        </>
    );
};

export default Dashboard;
