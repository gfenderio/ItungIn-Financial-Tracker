import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // Initialize state from LocalStorage or default values
    const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'IDR');
    const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode')) || false);
    const [language, setLanguage] = useState(() => {
        const saved = localStorage.getItem('language');
        return (saved && saved !== 'null') ? saved : null;
    });

    // Onboarding and User Profile
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => JSON.parse(localStorage.getItem('hasCompletedOnboarding') || 'false'));
    const [userProfile, setUserProfile] = useState(() => {
        try {
            const saved = localStorage.getItem('userProfile');
            return saved ? JSON.parse(saved) : { name: '', email: '' }; // Defaults handled in components if empty
        } catch (e) {
            return { name: '', email: '' };
        }
    });

    // Global Alert State
    const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: 'info' });
    const [confirmConfig, setConfirmConfig] = useState({ show: false, title: '', message: '', type: 'info', onConfirm: null });

    const [premiumUnlockTime, setPremiumUnlockTime] = useState(() => {
        try {
            const saved = localStorage.getItem('premiumUnlockTime');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });

    const [isPremium, setIsPremium] = useState(() => {
        try {
            const savedUnlockTime = localStorage.getItem('premiumUnlockTime');
            if (savedUnlockTime) {
                const unlockTime = JSON.parse(savedUnlockTime);
                if (Date.now() - unlockTime > 24 * 60 * 60 * 1000) {
                    return false;
                }
            }
            const saved = localStorage.getItem('isPremium');
            return saved ? JSON.parse(saved) : false;
        } catch (e) {
            return false;
        }
    });

    const [notifications, setNotifications] = useState(() => {
        try {
            const saved = localStorage.getItem('notifications');
            const parsed = saved ? JSON.parse(saved) : null;
            return Array.isArray(parsed) ? parsed : [];
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
                { id: 2, title: 'Salary Deposit', date: new Date(new Date().setDate(1)).toISOString(), amount: 5000000, category: 'Income', icon: 'payments', accountId: '1' },
                { id: 3, title: 'Electric Bill', date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), amount: -150000, category: 'Utilities', icon: 'bolt', accountId: '1' },
                { id: 4, title: 'Apple Store', date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), amount: -2500000, category: 'Shopping', icon: 'shopping_bag', accountId: '1' },
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

    const [budgets, setBudgets] = useState(() => {
        try {
            const saved = localStorage.getItem('budgets');
            const parsed = saved ? JSON.parse(saved) : null;
            return Array.isArray(parsed) ? parsed : [
                { id: 1, category: 'Food', limit: 3000000, period: 'monthly' },
                { id: 2, category: 'Shopping', limit: 1500000, period: 'monthly' }
            ];
        } catch (e) {
            console.error("Error loading budgets:", e);
            return [];
        }
    });

    const [savings, setSavings] = useState(() => {
        try {
            const saved = localStorage.getItem('savings');
            const parsed = saved ? JSON.parse(saved) : null;
            return Array.isArray(parsed) ? parsed : [
                { id: 1, title: 'Emergency Fund', targetAmount: 20000000, currentAmount: 5000000, deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10), icon: 'security', color: 'bg-emerald-500' },
                { id: 2, title: 'New Laptop', targetAmount: 15000000, currentAmount: 2000000, deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().slice(0, 10), icon: 'laptop_mac', color: 'bg-blue-500' }
            ];
        } catch (e) {
            console.error("Error loading savings:", e);
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
            if (language) {
                localStorage.setItem('language', language);
            } else {
                localStorage.removeItem('language');
            }
        } catch (error) {
            console.error("Failed to save language:", error);
        }
    }, [language]);

    useEffect(() => {
        try {
            localStorage.setItem('hasCompletedOnboarding', JSON.stringify(hasCompletedOnboarding));
        } catch (error) {
            console.error("Failed to save onboarding state:", error);
        }
    }, [hasCompletedOnboarding]);

    useEffect(() => {
        try {
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
        } catch (error) {
            console.error("Failed to save user profile:", error);
        }
    }, [userProfile]);

    useEffect(() => {
        try {
            localStorage.setItem('isPremium', JSON.stringify(isPremium));
        } catch (error) {
            console.error("Failed to save premium state:", error);
        }
    }, [isPremium]);

    useEffect(() => {
        try {
            if (premiumUnlockTime) {
                localStorage.setItem('premiumUnlockTime', JSON.stringify(premiumUnlockTime));
            } else {
                localStorage.removeItem('premiumUnlockTime');
            }
        } catch (error) {
            console.error("Failed to save premium unlock time:", error);
        }
    }, [premiumUnlockTime]);

    // Premium Expiry Checker
    useEffect(() => {
        if (!isPremium || !premiumUnlockTime) return;

        const checkExpiry = () => {
            if (Date.now() - premiumUnlockTime > 24 * 60 * 60 * 1000) {
                setIsPremium(false);
                setPremiumUnlockTime(null);
            }
        };

        const interval = setInterval(checkExpiry, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [isPremium, premiumUnlockTime]);

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

    useEffect(() => {
        try {
            localStorage.setItem('budgets', JSON.stringify(budgets));
        } catch (error) {
            console.error("Failed to save budgets:", error);
        }
    }, [budgets]);

    useEffect(() => {
        try {
            localStorage.setItem('savings', JSON.stringify(savings));
        } catch (error) {
            console.error("Failed to save savings:", error);
        }
    }, [savings]);

    // Budget Notification Watcher
    useEffect(() => {
        if (!budgets || budgets.length === 0 || !transactions) return;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return t.amount < 0 && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const categorySpending = currentMonthTransactions.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
            return acc;
        }, {});

        setNotifications(prev => {
            let newNotifs = [...prev];
            let added = false;

            budgets.forEach(b => {
                const spent = categorySpending[b.category] || 0;
                if (b.limit > 0) {
                    const ratio = spent / b.limit;
                    const idWarning = `budget_warn_${b.id}_${currentMonth}_${currentYear}`;
                    const idAlert = `budget_alert_${b.id}_${currentMonth}_${currentYear}`;

                    if (ratio >= 1.0) {
                        if (!newNotifs.some(n => n.id === idAlert)) {
                            newNotifs.push({
                                id: idAlert,
                                text: language === 'id' ? `Anggaran ${b.category} telah habis!` : `${b.category} budget exceeded!`,
                                icon: 'warning',
                                time: 'Just now',
                                read: false
                            });
                            added = true;
                        }
                    } else if (ratio >= 0.8) {
                        if (!newNotifs.some(n => n.id === idWarning) && !newNotifs.some(n => n.id === idAlert)) {
                            newNotifs.push({
                                id: idWarning,
                                text: language === 'id' ? `Anggaran ${b.category} mendekati batas (>${(ratio * 100).toFixed(0)}%).` : `${b.category} budget is nearing its limit (>${(ratio * 100).toFixed(0)}%).`,
                                icon: 'info',
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
    }, [budgets, transactions, language]);

    // System & App Version Watcher
    useEffect(() => {
        const savedVersion = localStorage.getItem('appVersion');
        const currentVersion = '1.0.0';

        if (savedVersion !== currentVersion) {
            setNotifications(prev => {
                const welcomeNotif = {
                    id: `version_update_${currentVersion}`,
                    text: language === 'id'
                        ? `Selamat datang di ItungIn Versi ${currentVersion}! Nikmati fitur baru.`
                        : `Welcome to ItungIn Version ${currentVersion}! Enjoy the new features.`,
                    icon: 'rocket_launch',
                    time: 'Just now',
                    read: false
                };
                return [welcomeNotif, ...prev.filter(n => !n.id.startsWith('version_update_'))];
            });
            localStorage.setItem('appVersion', currentVersion);
        }

        // Backup Reminder (If last backup was over 30 days ago)
        const lastBackupStr = localStorage.getItem('lastBackupDate');
        if (lastBackupStr) {
            const lastBackup = new Date(lastBackupStr);
            const diffDays = Math.ceil((new Date() - lastBackup) / (1000 * 60 * 60 * 24));
            if (diffDays > 30) {
                setNotifications(prev => {
                    const backupId = `backup_reminder_${new Date().getMonth()}_${new Date().getFullYear()}`;
                    if (!prev.some(n => n.id === backupId)) {
                        return [{
                            id: backupId,
                            text: language === 'id' ? 'Sudah waktunya mem-backup data Anda (Expor CSV/JSON).' : 'It is time to backup your data (Export CSV/JSON).',
                            icon: 'security',
                            time: 'Reminder',
                            read: false
                        }, ...prev];
                    }
                    return prev;
                });
            }
        }
    }, [language]);

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

                // If within 5 days OR past due!
                if (diffDays <= 5) {
                    const isPaidThisMonth = transactions.some(t => {
                        if (t.category !== 'Debt') return false;
                        const tDate = new Date(t.date);
                        return tDate.getMonth() === nextDueDate.getMonth() &&
                            tDate.getFullYear() === nextDueDate.getFullYear() &&
                            t.title.includes(debt.title);
                    });

                    if (!isPaidThisMonth) {
                        const notifId = `debt_${debt.id}_${now.getDate()}_${now.getMonth()}_${now.getFullYear()}`;
                        if (!newNotifs.some(n => n.id === notifId)) {
                            newNotifs.unshift({
                                id: notifId,
                                text: language === 'id'
                                    ? diffDays < 0
                                        ? `PERINGATAN: Tagihan "${debt.title}" Telat ${Math.abs(diffDays)} Hari!`
                                        : `Pengingat: Tagihan "${debt.title}" jatuh tempo dalam ${diffDays} hari.`
                                    : diffDays < 0
                                        ? `WARNING: "${debt.title}" payment is OVERDUE by ${Math.abs(diffDays)} days!`
                                        : `Reminder: "${debt.title}" payment is due in ${diffDays} days.`,
                                icon: diffDays < 0 ? 'warning' : 'event',
                                time: 'System',
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

    const showConfirm = (title, message, type = 'info') => {
        return new Promise((resolve) => {
            setConfirmConfig({
                show: true,
                title,
                message,
                type,
                onConfirm: () => resolve(true)
            });
            // Overriding the default backdrop click to reject the promise
            const oldHideConfirm = hideConfirm;
            setConfirmConfig(prev => ({
                ...prev,
                onCancel: () => resolve(false)
            }));
        });
    };

    const hideConfirm = () => {
        if (confirmConfig.onCancel) {
            confirmConfig.onCancel();
        }
        setConfirmConfig(prev => ({ ...prev, show: false, onConfirm: null, onCancel: null }));
    };

    const markNotificationAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteTransaction = (id) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const updateTransaction = (updatedTx) => {
        setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
    };

    const resetData = () => {
        setTransactions([
            { id: 1, title: 'Starbucks', date: new Date().toISOString(), amount: -55000, category: 'Food', icon: 'coffee', accountId: '2' },
            { id: 2, title: 'Salary Deposit', date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), amount: 5200000, category: 'Income', icon: 'payments', accountId: '1' },
            { id: 3, title: 'Electric Bill', date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), amount: -150000, category: 'Utilities', icon: 'bolt', accountId: '1' },
            { id: 4, title: 'Apple Store', date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), amount: -2500000, category: 'Shopping', icon: 'shopping_bag', accountId: '1' },
        ]);
        setDebts([
            { id: 1, title: 'Bank Loan', subtitle: 'Mortgage Refinance', balance: 4500000, total: 10000000, color: 'blue', icon: 'account_balance', dueDays: 5, nextDueMonthOffset: 0 },
            { id: 2, title: 'Friend - Alex', subtitle: 'Personal Loan', balance: 50000, total: 200000, color: 'orange', icon: 'person', dueDays: 1, nextDueMonthOffset: 0 },
        ]);
        setAccounts([
            { id: '1', name: 'Main Bank Account', icon: 'account_balance' },
            { id: '2', name: 'Cash', icon: 'payments' },
        ]);
        setSubscriptions([
            { id: 1, title: 'Netflix', amount: 155000, cycleMonths: 1, nextDueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(), icon: 'movie', color: 'indigo', category: 'Entertainment' },
            { id: 2, title: 'Spotify Premium', amount: 55000, cycleMonths: 1, nextDueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(), icon: 'music_note', color: 'emerald', category: 'Entertainment' }
        ]);
        setBudgets([
            { id: 1, category: 'Food', limit: 3000000, period: 'monthly' },
            { id: 2, category: 'Shopping', limit: 1500000, period: 'monthly' }
        ]);
        setSavings([
            { id: 1, title: 'Emergency Fund', targetAmount: 20000000, currentAmount: 5000000, deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10), icon: 'security', color: 'bg-emerald-500' },
            { id: 2, title: 'New Laptop', targetAmount: 15000000, currentAmount: 2000000, deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().slice(0, 10), icon: 'laptop_mac', color: 'bg-blue-500' }
        ]);
        setNotifications([]);
        setHasCompletedOnboarding(false);
        setUserProfile({ name: '', email: '' });
        setLanguage(null);
        setIsPremium(false);
        localStorage.removeItem('hasCompletedTour');
        localStorage.removeItem('language');
        localStorage.removeItem('hasCompletedOnboarding');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('isPremium');
    };

    const resetDemoDataForTour = () => {
        const demoTrans = [
            { id: 1, title: 'Starbucks', date: new Date().toISOString(), amount: -55000, category: 'Food', icon: 'coffee', accountId: '2' },
            { id: 2, title: 'Salary Deposit', date: new Date(new Date().setDate(1)).toISOString(), amount: 5000000, category: 'Income', icon: 'payments', accountId: '1' },
            { id: 3, title: 'Electric Bill', date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), amount: -150000, category: 'Utilities', icon: 'bolt', accountId: '1' },
            { id: 4, title: 'Apple Store', date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), amount: -2500000, category: 'Shopping', icon: 'shopping_bag', accountId: '1' },
        ];
        const demoDebts = [
            { id: 1, title: 'Bank Loan', subtitle: 'Mortgage Refinance', balance: 4500000, total: 10000000, color: 'blue', icon: 'account_balance', dueDays: 5, nextDueMonthOffset: 0 },
            { id: 2, title: 'Friend - Alex', subtitle: 'Personal Loan', balance: 50000, total: 200000, color: 'orange', icon: 'person', dueDays: 1, nextDueMonthOffset: 0 },
        ];
        const demoAccounts = [
            { id: '1', name: 'Main Bank Account', icon: 'account_balance' },
            { id: '2', name: 'Cash', icon: 'payments' },
        ];
        const demoSubs = [
            { id: 1, title: 'Netflix', amount: 155000, cycleMonths: 1, nextDueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(), icon: 'movie', color: 'indigo', category: 'Entertainment' },
            { id: 2, title: 'Spotify Premium', amount: 55000, cycleMonths: 1, nextDueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(), icon: 'music_note', color: 'emerald', category: 'Entertainment' }
        ];

        setTransactions(demoTrans);
        setDebts(demoDebts);
        setAccounts(demoAccounts);
        setSubscriptions(demoSubs);
        setNotifications([]);
        setBudgets([
            { id: 1, category: 'Food', limit: 3000000, period: 'monthly' },
            { id: 2, category: 'Shopping', limit: 1500000, period: 'monthly' }
        ]);

        localStorage.setItem('transactions', JSON.stringify(demoTrans));
        localStorage.setItem('debts', JSON.stringify(demoDebts));
        localStorage.setItem('accounts', JSON.stringify(demoAccounts));
        localStorage.setItem('subscriptions', JSON.stringify(demoSubs));

        const demoSavings = [
            { id: 1, title: 'Emergency Fund', targetAmount: 20000000, currentAmount: 5000000, deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10), icon: 'security', color: 'bg-emerald-500' },
            { id: 2, title: 'New Laptop', targetAmount: 15000000, currentAmount: 2000000, deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().slice(0, 10), icon: 'laptop_mac', color: 'bg-blue-500' }
        ];
        setSavings(demoSavings);
        localStorage.setItem('savings', JSON.stringify(demoSavings));

        localStorage.setItem('budgets', JSON.stringify([
            { id: 1, category: 'Food', limit: 3000000, period: 'monthly' },
            { id: 2, category: 'Shopping', limit: 1500000, period: 'monthly' }
        ]));
        localStorage.removeItem('hasCompletedTour');
    };

    const injectPremiumTourData = () => {
        const demoBudgets = [
            { id: 'pb1', category: 'Food', limit: 3000000, period: 'monthly' },
            { id: 'pb2', category: 'Shopping', limit: 1500000, period: 'monthly' },
            { id: 'pb3', category: 'Utilities', limit: 1200000, period: 'monthly' }
        ];
        const demoSavings = [
            { id: 'ps1', title: 'Vacation', targetAmount: 15000000, currentAmount: 4500000, deadline: new Date(new Date().setMonth(new Date().getMonth() + 10)).toISOString().slice(0, 10), icon: 'flight', color: 'bg-blue-500' },
            { id: 'ps2', title: 'New Phone', targetAmount: 8000000, currentAmount: 3200000, deadline: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString().slice(0, 10), icon: 'smartphone', color: 'bg-indigo-500' }
        ];
        // Generate 12 months of transactions
        const demoTransactions = [];
        const cats = ['Food', 'Shopping', 'Utilities', 'Transportation', 'Entertainment'];

        for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);

            // Monthly Salary (Income)
            demoTransactions.push({
                id: `pt-inc-${i}`,
                title: 'Monthly Salary',
                date: new Date(new Date(date).setDate(1)).toISOString(),
                amount: 7500000 + (Math.random() * 500000),
                category: 'Income',
                icon: 'work',
                accountId: '1'
            });

            // Random Expenses
            for (let j = 0; j < 8; j++) {
                const day = Math.floor(Math.random() * 28) + 1;
                const cat = cats[Math.floor(Math.random() * cats.length)];
                demoTransactions.push({
                    id: `pt-exp-${i}-${j}`,
                    title: `Demo ${cat} Item`,
                    date: new Date(new Date(date).setDate(day)).toISOString(),
                    amount: -(100000 + (Math.random() * 800000)),
                    category: cat,
                    icon: 'payments',
                    accountId: '1'
                });
            }
        }

        setBudgets(demoBudgets);
        setSavings(demoSavings);
        setTransactions(prev => [...demoTransactions, ...prev]);

        // Persist temporarily for page reloads during tour
        localStorage.setItem('budgets', JSON.stringify(demoBudgets));
        localStorage.setItem('savings', JSON.stringify(demoSavings));
        localStorage.setItem('transactions', JSON.stringify([...demoTransactions, ...transactions]));
    };

    const clearDemoData = () => {
        setTransactions([]);
        setDebts([]);
        setSubscriptions([]);
        setNotifications([]);
        setSavings([]);
        setBudgets([]);

        localStorage.setItem('transactions', JSON.stringify([]));
        localStorage.setItem('debts', JSON.stringify([]));
        localStorage.setItem('subscriptions', JSON.stringify([]));
        localStorage.setItem('savings', JSON.stringify([]));
        localStorage.setItem('budgets', JSON.stringify([]));
    };

    const restoreData = (data) => {
        if (data.transactions) setTransactions(data.transactions);
        if (data.debts) setDebts(data.debts);
        if (data.subscriptions) setSubscriptions(data.subscriptions);
        if (data.savings) setSavings(data.savings);
        if (data.budgets) setBudgets(data.budgets);
        if (data.accounts) setAccounts(data.accounts);

        // Persist immediately
        if (data.transactions) localStorage.setItem('transactions', JSON.stringify(data.transactions));
        if (data.debts) localStorage.setItem('debts', JSON.stringify(data.debts));
        if (data.subscriptions) localStorage.setItem('subscriptions', JSON.stringify(data.subscriptions));
        if (data.savings) localStorage.setItem('savings', JSON.stringify(data.savings));
        if (data.budgets) localStorage.setItem('budgets', JSON.stringify(data.budgets));
        if (data.accounts) localStorage.setItem('accounts', JSON.stringify(data.accounts));
    };

    const completeOnboarding = (profile) => {
        setUserProfile(profile);
        setHasCompletedOnboarding(true);
    };

    const updateUserProfile = (profile) => {
        setUserProfile(prev => ({ ...prev, ...profile }));
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

    const updateDebt = (updatedDebt) => {
        setDebts(prev => prev.map(d => d.id === updatedDebt.id ? updatedDebt : d));
    };

    const deleteDebt = (id) => {
        setDebts(prev => prev.filter(d => d.id !== id));
    };

    const updateSubscription = (updatedSub) => {
        setSubscriptions(prev => prev.map(s => s.id === updatedSub.id ? updatedSub : s));
    };

    const deleteSubscription = (id) => {
        setSubscriptions(prev => prev.filter(s => s.id !== id));
    };

    const addSavingGoal = (goal) => {
        setSavings(prev => [...prev, goal]);
    };

    const updateSavingGoal = (updatedGoal) => {
        setSavings(prev => prev.map(s => s.id === updatedGoal.id ? updatedGoal : s));
    };

    const deleteSavingGoal = (id) => {
        setSavings(prev => prev.filter(s => s.id !== id));
    };

    const allocateFundsToGoal = (goalId, targetAmount) => {
        // Find existing goal to update its currentAmount
        setSavings(prev => prev.map(s => {
            if (s.id === goalId) {
                return { ...s, currentAmount: s.currentAmount + targetAmount };
            }
            return s;
        }));
    };

    const unlockPremium = () => {
        setIsPremium(true);
        setPremiumUnlockTime(Date.now());
    };

    return (
        <AppContext.Provider value={{
            darkMode,
            toggleDarkMode,
            transactions,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            debts,
            setDebts,
            updateDebt,
            deleteDebt,
            accounts,
            addAccount,
            calculateBalance,
            calculateIncome,
            calculateExpenses,
            language,
            setLanguage, // Added explicitly
            toggleLanguage,
            notifications,
            markNotificationAsRead,
            markAllNotificationsAsRead,
            resetData,
            resetDemoDataForTour,
            injectPremiumTourData,
            clearDemoData,
            restoreData,
            subscriptions,
            setSubscriptions,
            updateSubscription,
            deleteSubscription,
            budgets,
            setBudgets,
            alertConfig,
            showAlert,
            hideAlert,
            confirmConfig,
            showConfirm,
            hideConfirm,
            hasCompletedOnboarding,
            completeOnboarding,
            userProfile,
            updateUserProfile,
            savings,
            addSavingGoal,
            updateSavingGoal,
            deleteSavingGoal,
            allocateFundsToGoal,
            isPremium,
            unlockPremium
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
