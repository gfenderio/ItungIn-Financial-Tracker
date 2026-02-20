import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // Initialize state from LocalStorage or default values
    const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'IDR');
    const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode')) || false);

    const [accounts, setAccounts] = useState(() => {
        try {
            const saved = localStorage.getItem('accounts');
            const parsed = saved ? JSON.parse(saved) : null;
            return Array.isArray(parsed) ? parsed : [
                { id: '1', name: 'Main Bank Account', icon: 'account_balance' },
                { id: '2', name: 'Cash', icon: 'payments' },
            ];
        } catch (e) {
            console.error("Error loading accounts:", e);
            return [];
        }
    });

    const [transactions, setTransactions] = useState(() => {
        try {
            const saved = localStorage.getItem('transactions');
            const parsed = saved ? JSON.parse(saved) : null;
            return Array.isArray(parsed) ? parsed.filter(Boolean) : [
                { id: 1, title: 'Starbucks', date: new Date().toISOString(), amount: -55000, category: 'Food', icon: 'coffee', accountId: '2' },
                { id: 2, title: 'Salary Deposit', date: '2023-11-15T09:00:00', amount: 5200000, category: 'Income', icon: 'payments', accountId: '1' },
                { id: 3, title: 'Electric Bill', date: '2023-11-14T10:00:00', amount: -150000, category: 'Utilities', icon: 'bolt', accountId: '1' },
                { id: 4, title: 'Apple Store', date: '2023-11-12T14:30:00', amount: -2500000, category: 'Shopping', icon: 'shopping_bag', accountId: '1' },
            ];
        } catch (e) {
            console.error("Error loading transactions:", e);
            return [];
        }
    });

    const [debts, setDebts] = useState(() => {
        try {
            const saved = localStorage.getItem('debts');
            const parsed = saved ? JSON.parse(saved) : null;
            return Array.isArray(parsed) ? parsed : [
                { id: 1, title: 'Bank Loan', subtitle: 'Mortgage Refinance', balance: 4500000, total: 10000000, color: 'blue', icon: 'account_balance', dueDays: 5 },
                { id: 2, title: 'Friend - Alex', subtitle: 'Personal Loan', balance: 50000, total: 200000, color: 'orange', icon: 'person', dueDays: 1 },
                { id: 3, title: 'Credit Card', subtitle: 'Visa Platinum', balance: 1200000, total: 1200000, color: 'purple', icon: 'credit_card', dueDays: 12 },
            ];
        } catch (e) {
            console.error("Error loading debts:", e);
            return [];
        }
    });

    // Persistence Effects
    useEffect(() => {
        try {
            localStorage.setItem('currency', currency);
        } catch (error) {
            console.error("Failed to save currency:", error);
        }
    }, [currency]);

    useEffect(() => {
        try {
            localStorage.setItem('darkMode', JSON.stringify(darkMode));
            if (darkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        } catch (error) {
            console.error("Failed to save dark mode:", error);
        }
    }, [darkMode]);

    useEffect(() => {
        try {
            localStorage.setItem('transactions', JSON.stringify(transactions));
        } catch (error) {
            console.error("Failed to save transactions:", error);
        }
    }, [transactions]);

    useEffect(() => {
        try {
            localStorage.setItem('debts', JSON.stringify(debts));
        } catch (error) {
            console.error("Failed to save debts:", error);
        }
    }, [debts]);

    useEffect(() => {
        try {
            localStorage.setItem('accounts', JSON.stringify(accounts));
        } catch (error) {
            console.error("Failed to save accounts:", error);
        }
    }, [accounts]);

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    const addTransaction = (transaction) => {
        setTransactions(prev => [transaction, ...prev]);
    };

    const addAccount = (name) => {
        setAccounts(prev => [...prev, { id: Date.now().toString(), name, icon: 'account_balance_wallet' }]);
    };

    const calculateBalance = () => {
        return transactions.reduce((acc, curr) => acc + curr.amount, 0);
    };

    const calculateIncome = () => {
        return transactions.filter(t => t.amount > 0).reduce((acc, curr) => acc + curr.amount, 0);
    };

    const calculateExpenses = () => {
        return transactions.filter(t => t.amount < 0).reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
    };

    return (
        <AppContext.Provider value={{
            darkMode,
            toggleDarkMode,
            transactions,
            addTransaction,
            debts,
            accounts,
            addAccount,
            calculateBalance,
            calculateIncome,
            calculateExpenses
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
