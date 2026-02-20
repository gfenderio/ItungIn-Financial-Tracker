import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const AllTransactions = () => {
    const navigate = useNavigate();
    const { transactions } = useApp();

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-display pb-20">
            {/* Header */}
            <div className="flex items-center bg-white dark:bg-slate-800 p-4 sticky top-0 z-10 shadow-sm text-slate-900 dark:text-slate-100 mb-4">
                <div className="flex size-12 shrink-0 items-center cursor-pointer" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </div>
                <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">All Transactions</h2>
                <div className="w-12"></div> {/* Spacer */}
            </div>

            <div className="px-4 space-y-3">
                {transactions.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2">receipt_long</span>
                        <p>No transactions yet.</p>
                    </div>
                ) : (
                    transactions.map(transaction => (
                        <div
                            key={transaction.id}
                            onClick={() => navigate(`/transaction/${transaction.id}`)}
                            className="bg-white dark:bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-primary/5 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
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
                                        {new Date(transaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <p className={`font-bold ${transaction.amount > 0 ? 'text-primary' : 'text-red-500'}`}>
                                {transaction.amount > 0 ? '+' : ''}{formatMoney(transaction.amount)}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AllTransactions;
