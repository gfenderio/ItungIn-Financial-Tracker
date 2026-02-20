import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const TransactionDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { transactions, accounts } = useApp();

    // Find transaction
    const transaction = transactions.find(t => t.id.toString() === id);
    const account = accounts.find(a => a.id === transaction?.accountId);

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
                <p>Transaction not found.</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-primary font-bold">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-display pb-20">
            {/* Header */}
            <div className="flex items-center bg-transparent p-4 sticky top-0 z-10 text-slate-900 dark:text-slate-100 mb-4">
                <div className="flex size-12 shrink-0 items-center cursor-pointer bg-white/50 dark:bg-black/20 rounded-full justify-center backdrop-blur-md" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </div>
            </div>

            <div className="px-6 flex flex-col items-center">
                <div className={`p-6 rounded-3xl mb-4 ${transaction.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <span className="material-symbols-outlined text-5xl">
                        {transaction.icon || (transaction.amount > 0 ? 'payments' : 'shopping_bag')}
                    </span>
                </div>

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

                {/* Receipt Card */}
                {transaction.receipt && (
                    <div className="w-full mt-4 bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm">
                        <p className="text-slate-400 text-sm font-medium mb-3">Receipt</p>
                        <img src={transaction.receipt} alt="Receipt" className="w-full rounded-2xl border border-slate-100 dark:border-slate-700" />
                    </div>
                )}

                {/* ID Debug (Optional) */}
                <p className="mt-8 text-xs text-slate-300 text-center">ID: {transaction.id}</p>
            </div>
        </div>
    );
};

export default TransactionDetail;
