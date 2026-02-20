import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // Initialize state from LocalStorage or default values
    const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'IDR');
    const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode')) || false);
    const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');

    // Global Alert State
    const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: 'info' });

    const [notifications, setNotifications] = useState(() => {
        try {
            const saved = localStorage.getItem('notifications');
            const parsed = saved ? JSON.parse(saved) : null;
            return Array.isArray(parsed) ? parsed : [
                { id: 1, text: "ItungIn v2.0 is live! Check out the new dashboard.", time: "Just now", read: false },
                { id: 2, text: "Exclusive Offer: Get 50% off Premium", time: "2h ago", read: false },
                { id: 3, text: "Backup completed successfully", time: "1d ago", read: true },
            ];
        } catch (e) {
            return [];
        }
    });

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
                { id: 1, title: 'Bank Loan', subtitle: 'Mortgage Refinance', balance: 4500000, total: 10000000, color: 'blue', icon: 'account_balance', dueDays: 5, nextDueMonthOffset: 0 },
                { id: 2, title: 'Friend - Alex', subtitle: 'Personal Loan', balance: 50000, total: 200000, color: 'orange', icon: 'person', dueDays: 1, nextDueMonthOffset: 0 },
                { id: 3, title: 'Credit Card', subtitle: 'Visa Platinum', balance: 1200000, total: 1200000, color: 'purple', icon: 'credit_card', dueDays: 12, nextDueMonthOffset: 0 },
            ];
        } catch (e) {
            console.error("Error loading debts:", e);
            return [];
        }
    });

    const [subscriptions, setSubscriptions] = useState(() => {
        try {
            const saved = localStorage.getItem('subscriptions');
            const parsed = saved ? JSON.parse(saved) : null;
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("Error loading subscriptions:", e);
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
            localStorage.setItem('language', language);
        } catch (error) {
            console.error("Failed to save language:", error);
        }
    }, [language]);

    useEffect(() => {
        try {
            localStorage.setItem('notifications', JSON.stringify(notifications));
        } catch (error) {
            console.error("Failed to save notifications:", error);
        }
    }, [notifications]);

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

    useEffect(() => {
        try {
            localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
        } catch (error) {
            console.error("Failed to save subscriptions:", error);
        }
    }, [subscriptions]);

    // Debt Payment Due Date Watcher
    useEffect(() => {
        if (!debts || !transactions) return;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        setNotifications(prev => {
            let newNotifs = [...prev];
            let added = false;

            debts.forEach(debt => {
                if (debt.balance <= 0) return;

                const dueDay = debt.dueDays;
                let expectedDueDate = new Date(currentYear, currentMonth, dueDay);

                const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                if (dueDay > daysInMonth) expectedDueDate = new Date(currentYear, currentMonth, daysInMonth);

                let nextDueDate = expectedDueDate;
                if (now > expectedDueDate && now.getDate() > expectedDueDate.getDate()) {
                    nextDueDate = new Date(currentYear, currentMonth + 1, dueDay);
                    const nextDaysInMonth = new Date(currentYear, currentMonth + 2, 0).getDate();
                    if (dueDay > nextDaysInMonth) nextDueDate = new Date(currentYear, currentMonth + 1, nextDaysInMonth);
                }

                const diffTime = nextDueDate - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 5 && diffDays >= 0) {
                    const isPaidThisMonth = transactions.some(t => {
                        if (t.category !== 'Debt') return false;
                        const tDate = new Date(t.date);
                        return tDate.getMonth() === nextDueDate.getMonth() &&
                            tDate.getFullYear() === nextDueDate.getFullYear() &&
                            t.title.includes(debt.title);
                    });

                    if (!isPaidThisMonth) {
                        const notifId = `debt_${debt.id}_${nextDueDate.getMonth()}_${nextDueDate.getFullYear()}`;
                        if (!newNotifs.some(n => n.id === notifId)) {
                            newNotifs.unshift({
                                id: notifId,
                                text: language === 'id'
                                    ? `Pengingat: Tagihan "${debt.title}" jatuh tempo dalam ${diffDays} hari.`
                                    : `Reminder: "${debt.title}" payment is due in ${diffDays} days.`,
                                time: 'Just now',
                                read: false
                            });
                            added = true;
                        }
                    }
                }
            });

            return added ? newNotifs : prev;
        });
    }, [debts, transactions, language]);

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'id' : 'en');
    };

    const showAlert = (message, type = 'error') => {
        setAlertConfig({ show: true, message, type });
        setTimeout(() => {
            hideAlert();
        }, 3000); // Auto-hide after 3 seconds
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, show: false }));
    };

    const markNotificationAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const resetData = () => {
        setTransactions([]);
        setDebts([]);
        setAccounts([]);
        setSubscriptions([]);
        setNotifications([]);
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
            calculateExpenses,
            language,
            toggleLanguage,
            notifications,
            markNotificationAsRead,
            markAllNotificationsAsRead,
            resetData,
            setDebts,
            subscriptions,
            setSubscriptions,
            alertConfig,
            showAlert,
            hideAlert
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
