import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

export default function Analytics() {
    const { transactions, language } = useApp();
    const navigate = useNavigate();
    const [period, setPeriod] = useState('6M'); // '6M', '1Y', 'ALL'

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Calculate 6-month trend for Income vs Expense
    const trendData = useMemo(() => {
        const now = new Date();
        const data = [];
        let monthsToTraverse = period === '6M' ? 6 : period === '1Y' ? 12 : 24;

        for (let i = monthsToTraverse - 1; i >= 0; i--) {
            const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const m = targetMonth.getMonth();
            const y = targetMonth.getFullYear();

            const monthTxs = transactions.filter(t => {
                const d = new Date(t.date);
                return d.getMonth() === m && d.getFullYear() === y;
            });

            const income = monthTxs.filter(t => t.amount > 0).reduce((a, b) => a + b.amount, 0);
            const expense = monthTxs.filter(t => t.amount < 0).reduce((a, b) => a + Math.abs(b.amount), 0);

            data.push({
                name: targetMonth.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short' }),
                Income: income,
                Expense: expense
            });
        }
        return data;
    }, [transactions, period, language]);

    // Calculate overall category breakdown (Expense)
    const categoryData = useMemo(() => {
        const expenseTxs = transactions.filter(t => t.amount < 0);
        const map = expenseTxs.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
            return acc;
        }, {});

        return Object.entries(map)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    // Calculate overall category breakdown (Income)
    const incomeCategoryData = useMemo(() => {
        const incomeTxs = transactions.filter(t => t.amount > 0);
        const map = incomeTxs.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
            return acc;
        }, {});

        return Object.entries(map)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-xl">
                    <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm font-bold">
                            {entry.name}: {formatMoney(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
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
                                {language === 'id' ? 'Analitik' : 'Analytics'}
                            </h2>
                            <p className="text-sm font-medium text-slate-500 mt-1">
                                {language === 'id' ? 'Wawasan dan tren keuangan Anda' : 'Your financial insights and trends'}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-4 pb-24 overflow-y-auto space-y-6 pt-4">

                {/* Trend Chart */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 dark:text-white">
                            {language === 'id' ? 'Arus Kas' : 'Cash Flow'}
                        </h3>
                        <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg">
                            {['6M', '1Y', 'ALL'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${period === p ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `Rp${(val / 1000000).toFixed(1)}M`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                <Line type="monotone" dataKey="Income" name={language === 'id' ? 'Pemasukan' : 'Income'} stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="Expense" name={language === 'id' ? 'Pengeluaran' : 'Expense'} stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Bar Chart */}
                <div id="tour-distribution-charts" className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="mb-6">
                            <h3 className="font-bold text-slate-800 dark:text-white">
                                {language === 'id' ? 'Distribusi Pengeluaran' : 'Spending Distribution'}
                            </h3>
                            <p className="text-xs text-slate-500">{language === 'id' ? 'Semua Waktu' : 'All Time'}</p>
                        </div>

                        <div className="h-64 w-full">
                            {categoryData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-slate-400">
                                    <p className="text-sm font-bold">{language === 'id' ? 'Tidak ada data pengeluaran' : 'No expense data'}</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} dx={-10} width={80} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        <div className="mb-6">
                            <h3 className="font-bold text-slate-800 dark:text-white">
                                {language === 'id' ? 'Distribusi Pemasukan' : 'Income Distribution'}
                            </h3>
                            <p className="text-xs text-slate-500">{language === 'id' ? 'Semua Waktu' : 'All Time'}</p>
                        </div>

                        <div className="h-64 w-full">
                            {incomeCategoryData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-slate-400">
                                    <p className="text-sm font-bold">{language === 'id' ? 'Tidak ada data pemasukan' : 'No income data'}</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={incomeCategoryData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} dx={-10} width={80} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                            {incomeCategoryData.map((entry, index) => (
                                                <Cell key={`income-cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
