import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { AdMob } from '@capacitor-community/admob';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { auth, db } from '../firebase';
import {
    onAuthStateChanged,
    signInWithCredential,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut
} from 'firebase/auth';
import {
    collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc,
    setDoc, getDocs, writeBatch, serverTimestamp
} from 'firebase/firestore';

// ─── Constants ───────────────────────────────────────────────────────────────
const ADMOB_REWARDED_ID = 'ca-app-pub-6871124638225688/7157865513';
const GOOGLE_WEB_CLIENT_ID = '410398071381-um39gftnd1c2o7sndesugi27h9ab708n.apps.googleusercontent.com';

// ─── Helpers ─────────────────────────────────────────────────────────────────
// userCol returns a CollectionReference (odd segment count: users/{uid}/{colName})
const userCol = (uid, name) => collection(db, 'users', uid, name);
// userDocRef returns a DocumentReference (even segment count: users/{uid}/{...path})
// All sub-document references must have an even total segment count.
const userDocRef = (uid, colName, docId) => doc(db, 'users', uid, colName, docId);
// Profile document path (4 segments = valid even path)
const profileDocRef = (uid) => doc(db, 'users', uid, 'settings', 'profile');

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // ── Auth State ──────────────────────────────────────────────────────────
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    // ── UI Prefs (always localStorage — never sensitive) ───────────────────
    const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'IDR');
    const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode') || 'false'));
    const [language, setLanguage] = useState(() => {
        const s = localStorage.getItem('language');
        return (s && s !== 'null') ? s : null;
    });

    // ── Onboarding ──────────────────────────────────────────────────────────
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(
        () => JSON.parse(localStorage.getItem('hasCompletedOnboarding') || 'false')
    );
    const [userProfile, setUserProfile] = useState(() => {
        try {
            const s = localStorage.getItem('userProfile');
            return s ? JSON.parse(s) : { name: '', email: '', isGuest: false };
        } catch { return { name: '', email: '', isGuest: false }; }
    });

    // ── Global UI ───────────────────────────────────────────────────────────
    const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: 'info' });
    const [confirmConfig, setConfirmConfig] = useState({ show: false, title: '', message: '', type: 'info', onConfirm: null });

    // ── Premium ─────────────────────────────────────────────────────────────
    const [premiumUnlockTime, setPremiumUnlockTime] = useState(() => {
        try { const s = localStorage.getItem('premiumUnlockTime'); return s ? JSON.parse(s) : null; }
        catch { return null; }
    });
    const [hasLifetimePremium, setHasLifetimePremium] = useState(() => {
        try { const s = localStorage.getItem('hasLifetimePremium'); return s ? JSON.parse(s) : false; }
        catch { return false; }
    });
    const isPremium = hasLifetimePremium || (premiumUnlockTime !== null && (Date.now() - premiumUnlockTime < 3 * 60 * 60 * 1000));

    // ── Financial Data ──────────────────────────────────────────────────────
    // For guest users these come from localStorage; for logged-in users they come from Firestore.
    const [notifications, setNotifications] = useState(() => {
        try { const s = JSON.parse(localStorage.getItem('notifications') || 'null'); return Array.isArray(s) ? s : []; }
        catch { return []; }
    });
    const [accounts, setAccounts] = useState(() => {
        try {
            const s = JSON.parse(localStorage.getItem('accounts') || 'null');
            return Array.isArray(s) ? s : [
                { id: '1', name: 'Main Bank Account', icon: 'account_balance' },
                { id: '2', name: 'Cash', icon: 'payments' },
            ];
        } catch { return []; }
    });
    const [transactions, setTransactions] = useState(() => {
        try {
            const s = JSON.parse(localStorage.getItem('transactions') || 'null');
            return Array.isArray(s) ? s.filter(Boolean) : [
                { id: 'demo-1', title: 'Starbucks', date: new Date().toISOString(), amount: -55000, category: 'Food', icon: 'coffee', accountId: '2' },
                { id: 'demo-2', title: 'Salary Deposit', date: new Date(new Date().setDate(1)).toISOString(), amount: 5000000, category: 'Income', icon: 'payments', accountId: '1' },
                { id: 'demo-3', title: 'Electric Bill', date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), amount: -150000, category: 'Utilities', icon: 'bolt', accountId: '1' },
                { id: 'demo-4', title: 'Apple Store', date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), amount: -2500000, category: 'Shopping', icon: 'shopping_bag', accountId: '1' },
            ];
        } catch { return []; }
    });
    const [debts, setDebts] = useState(() => {
        try {
            const s = JSON.parse(localStorage.getItem('debts') || 'null');
            return Array.isArray(s) ? s : [
                { id: 'demo-d1', title: 'Bank Loan', subtitle: 'Mortgage Refinance', balance: 4500000, total: 10000000, color: 'blue', icon: 'account_balance', dueDays: 5, nextDueMonthOffset: 0 },
                { id: 'demo-d2', title: 'Friend - Alex', subtitle: 'Personal Loan', balance: 50000, total: 200000, color: 'orange', icon: 'person', dueDays: 1, nextDueMonthOffset: 0 },
                { id: 'demo-d3', title: 'Credit Card', subtitle: 'Visa Platinum', balance: 1200000, total: 1200000, color: 'purple', icon: 'credit_card', dueDays: 12, nextDueMonthOffset: 0 },
            ];
        } catch { return []; }
    });
    const [subscriptions, setSubscriptions] = useState(() => {
        try { const s = JSON.parse(localStorage.getItem('subscriptions') || 'null'); return Array.isArray(s) ? s : []; }
        catch { return []; }
    });
    const [budgets, setBudgets] = useState(() => {
        try {
            const s = JSON.parse(localStorage.getItem('budgets') || 'null');
            return Array.isArray(s) ? s : [
                { id: 'demo-b1', category: 'Food', limit: 3000000, period: 'monthly' },
                { id: 'demo-b2', category: 'Shopping', limit: 1500000, period: 'monthly' },
            ];
        } catch { return []; }
    });
    const [savings, setSavings] = useState(() => {
        try {
            const s = JSON.parse(localStorage.getItem('savings') || 'null');
            return Array.isArray(s) ? s : [
                { id: 'demo-s1', title: 'Emergency Fund', targetAmount: 20000000, currentAmount: 5000000, deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10), icon: 'security', color: 'bg-emerald-500' },
                { id: 'demo-s2', title: 'New Laptop', targetAmount: 15000000, currentAmount: 2000000, deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().slice(0, 10), icon: 'laptop_mac', color: 'bg-blue-500' },
            ];
        } catch { return []; }
    });

    // Track whether Firestore has been seeded for this user
    const firestoreSeededRef = useRef(false);

    // ── Firestore sync helpers ──────────────────────────────────────────────
    // Generic Firestore-aware setter proxy. When logged in: applies update AND writes to Firestore.
    // When guest: applies update to local state only.
    const makeFirestoreSetter = (localSetter, colName) => {
        return (updaterOrValue) => {
            // Always update local React state immediately (optimistic)
            localSetter(updaterOrValue);

            if (!currentUser) return; // Guest mode — done
            const uid = currentUser.uid;

            // We need the resolved new value to write to Firestore.
            // Schedule a micro-task to batch-write the current state after React flushes.
            // Strategy: use a dedicated per-collection flush.
        };
    };

    // ── Auth State Listener ─────────────────────────────────────────────────
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            setIsAuthLoading(false);
            if (user) {
                const profile = {
                    name: user.displayName || '',
                    email: user.email || '',
                    photoURL: user.photoURL || '',
                    isGuest: false,
                    uid: user.uid,
                };
                setUserProfile(profile);
                localStorage.setItem('userProfile', JSON.stringify(profile));
                setHasCompletedOnboarding(true);
                localStorage.setItem('hasCompletedOnboarding', 'true');
            }
        });
        return unsubscribe;
    }, []);

    // ── Firestore Real-Time Listeners (active only when logged in) ──────────
    useEffect(() => {
        if (!currentUser) return;
        const uid = currentUser.uid;
        const unsubs = [];

        // Helper: seed demo data for brand-new users
        const seedIfEmpty = async (snap, seederFn) => {
            if (snap.empty && !firestoreSeededRef.current) {
                firestoreSeededRef.current = true;
                await seederFn(uid);
            }
        };

        // Transactions
        unsubs.push(onSnapshot(userCol(uid, 'transactions'), async (snap) => {
            if (!snap.empty) {
                setTransactions(
                    snap.docs.map(d => ({ ...d.data(), id: d.id }))
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                );
            } else if (!firestoreSeededRef.current) {
                firestoreSeededRef.current = true;
                await seedDemoDataToFirestore(uid);
            }
        }));

        // Debts
        unsubs.push(onSnapshot(userCol(uid, 'debts'), (snap) => {
            if (!snap.empty) setDebts(snap.docs.map(d => ({ ...d.data(), id: d.id })));
        }));

        // Budgets
        unsubs.push(onSnapshot(userCol(uid, 'budgets'), (snap) => {
            if (!snap.empty) setBudgets(snap.docs.map(d => ({ ...d.data(), id: d.id })));
        }));

        // Savings
        unsubs.push(onSnapshot(userCol(uid, 'savings'), (snap) => {
            if (!snap.empty) setSavings(snap.docs.map(d => ({ ...d.data(), id: d.id })));
        }));

        // Subscriptions
        unsubs.push(onSnapshot(userCol(uid, 'subscriptions'), (snap) => {
            setSubscriptions(snap.docs.map(d => ({ ...d.data(), id: d.id })));
        }));

        // Accounts
        unsubs.push(onSnapshot(userCol(uid, 'accounts'), (snap) => {
            if (!snap.empty) setAccounts(snap.docs.map(d => ({ ...d.data(), id: d.id })));
        }));

        // Notifications
        unsubs.push(onSnapshot(userCol(uid, 'notifications'), (snap) => {
            setNotifications(snap.docs.map(d => ({ ...d.data(), id: d.id })));
        }));

        // Profile (premium status, currency)
        unsubs.push(onSnapshot(profileDocRef(uid), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                if (data.hasLifetimePremium !== undefined) {
                    setHasLifetimePremium(data.hasLifetimePremium);
                    if (data.hasLifetimePremium) localStorage.setItem('hasLifetimePremium', 'true');
                }
                if (data.premiumUnlockTime) {
                    setPremiumUnlockTime(data.premiumUnlockTime);
                    localStorage.setItem('premiumUnlockTime', JSON.stringify(data.premiumUnlockTime));
                }
                if (data.currency) setCurrency(data.currency);
            }
        }));

        // Migrate guest localStorage data if present
        migratGuestDataToFirestore(uid);

        return () => unsubs.forEach(u => u());
    }, [currentUser]);

    // ── Seed demo data for new Firebase users ───────────────────────────────
    const seedDemoDataToFirestore = async (uid) => {
        const batch = writeBatch(db);
        const demoTransactions = [
            { title: 'Starbucks', date: new Date().toISOString(), amount: -55000, category: 'Food', icon: 'coffee', accountId: 'acc-cash' },
            { title: 'Salary Deposit', date: new Date(new Date().setDate(1)).toISOString(), amount: 5000000, category: 'Income', icon: 'payments', accountId: 'acc-bank' },
            { title: 'Electric Bill', date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), amount: -150000, category: 'Utilities', icon: 'bolt', accountId: 'acc-bank' },
            { title: 'Apple Store', date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), amount: -2500000, category: 'Shopping', icon: 'shopping_bag', accountId: 'acc-bank' },
        ];
        demoTransactions.forEach(t => batch.set(doc(userCol(uid, 'transactions')), t));

        const demoDebts = [
            { title: 'Bank Loan', subtitle: 'Mortgage Refinance', balance: 4500000, total: 10000000, color: 'blue', icon: 'account_balance', dueDays: 5, nextDueMonthOffset: 0 },
            { title: 'Friend - Alex', subtitle: 'Personal Loan', balance: 50000, total: 200000, color: 'orange', icon: 'person', dueDays: 1, nextDueMonthOffset: 0 },
            { title: 'Credit Card', subtitle: 'Visa Platinum', balance: 1200000, total: 1200000, color: 'purple', icon: 'credit_card', dueDays: 12, nextDueMonthOffset: 0 },
        ];
        demoDebts.forEach(d => batch.set(doc(userCol(uid, 'debts')), d));

        const demoAccounts = [
            { id: 'acc-bank', name: 'Main Bank Account', icon: 'account_balance' },
            { id: 'acc-cash', name: 'Cash', icon: 'payments' },
        ];
        demoAccounts.forEach(a => batch.set(doc(db, 'users', uid, 'accounts', a.id), a));

        const demoBudgets = [
            { category: 'Food', limit: 3000000, period: 'monthly' },
            { category: 'Shopping', limit: 1500000, period: 'monthly' },
        ];
        demoBudgets.forEach(b => batch.set(doc(userCol(uid, 'budgets')), b));

        const demoSavings = [
            { title: 'Emergency Fund', targetAmount: 20000000, currentAmount: 5000000, deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10), icon: 'security', color: 'bg-emerald-500' },
            { title: 'New Laptop', targetAmount: 15000000, currentAmount: 2000000, deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().slice(0, 10), icon: 'laptop_mac', color: 'bg-blue-500' },
        ];
        demoSavings.forEach(s => batch.set(doc(userCol(uid, 'savings')), s));

        // Create profile doc
        batch.set(profileDocRef(uid), {
            hasLifetimePremium: false,
            premiumUnlockTime: null,
            currency: 'IDR',
            createdAt: serverTimestamp(),
        });

        await batch.commit();
    };

    // ── Migrate guest localStorage data to Firestore on first sign-in ───────
    const migratGuestDataToFirestore = async (uid) => {
        const guestFlag = localStorage.getItem('guestDataMigrated');
        if (guestFlag) return; // Already migrated

        const guestTransactions = (() => { try { return JSON.parse(localStorage.getItem('transactions') || 'null'); } catch { return null; } })();
        if (!Array.isArray(guestTransactions) || guestTransactions.length === 0) return;

        // Only migrate if it looks like real user data (not just demo data)
        const hasRealData = guestTransactions.some(t => !String(t.id).startsWith('demo-'));
        if (!hasRealData) return;

        try {
            const batch = writeBatch(db);
            guestTransactions.forEach(t => {
                const { id, ...data } = t;
                batch.set(doc(userCol(uid, 'transactions')), data);
            });

            const guestDebts = JSON.parse(localStorage.getItem('debts') || '[]');
            guestDebts.forEach(d => { const { id, ...data } = d; batch.set(doc(userCol(uid, 'debts')), data); });

            const guestBudgets = JSON.parse(localStorage.getItem('budgets') || '[]');
            guestBudgets.forEach(b => { const { id, ...data } = b; batch.set(doc(userCol(uid, 'budgets')), data); });

            const guestSavings = JSON.parse(localStorage.getItem('savings') || '[]');
            guestSavings.forEach(s => { const { id, ...data } = s; batch.set(doc(userCol(uid, 'savings')), data); });

            const guestSubs = JSON.parse(localStorage.getItem('subscriptions') || '[]');
            guestSubs.forEach(s => { const { id, ...data } = s; batch.set(doc(userCol(uid, 'subscriptions')), data); });

            await batch.commit();
            localStorage.setItem('guestDataMigrated', 'true');
        } catch (e) {
            console.error('Guest data migration failed:', e);
        }
    };

    // ── Native Plugins Init ─────────────────────────────────────────────────
    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            // Real AdMob — no testing mode
            AdMob.initialize({ initializeForTesting: false }).then(() => {
                AdMob.addListener('onRewardedVideoAdReward', async () => {
                    const unlockTime = Date.now();
                    setPremiumUnlockTime(unlockTime);
                    localStorage.setItem('premiumUnlockTime', JSON.stringify(unlockTime));
                    if (currentUser) {
                        await setDoc(profileDocRef(currentUser.uid), { premiumUnlockTime: unlockTime }, { merge: true });
                    }
                    setAlertConfig({ show: true, message: 'ItungIn Plus Unlocked (3 Hours)', type: 'success' });
                });
            }).catch(e => console.error('AdMob init error:', e));

            LocalNotifications.requestPermissions();

            // Real In-App Purchase via cordova-plugin-purchase
            if (window.CdvPurchase) {
                const { store, ProductType, Platform } = window.CdvPurchase;
                store.register({
                    id: 'itungin_plus_lifetime',
                    type: ProductType.NON_CONSUMABLE,
                    platform: Platform.GOOGLE_PLAY
                });
                store.when().approved(p => p.verify()).verified(p => p.finish()).updated(async (p) => {
                    if (p.owned) {
                        setHasLifetimePremium(true);
                        localStorage.setItem('hasLifetimePremium', 'true');
                        if (currentUser) {
                            await setDoc(profileDocRef(currentUser.uid), { hasLifetimePremium: true }, { merge: true });
                        }
                    }
                });
                store.initialize([Platform.GOOGLE_PLAY]);
            }
        }
    }, [currentUser]);

    // ── Show Rewarded Ad (Real) ─────────────────────────────────────────────
    const showRewardedAd = async () => {
        if (Capacitor.isNativePlatform()) {
            try {
                await AdMob.prepareRewardVideoAd({ adId: ADMOB_REWARDED_ID, isTesting: false });
                await AdMob.showRewardVideoAd();
            } catch (error) {
                console.error('AdMob error:', error);
                setAlertConfig({ show: true, message: language === 'id' ? 'Gagal memuat iklan. Coba lagi.' : 'Failed to load ad. Please try again.', type: 'error' });
            }
        } else {
            // Web fallback — inform user it's Android-only
            setAlertConfig({ show: true, message: language === 'id' ? 'Fitur iklan hanya tersedia di aplikasi Android.' : 'Ad feature is only available in the Android app.', type: 'info' });
        }
    };

    // ── Purchase Lifetime (Real) ────────────────────────────────────────────
    const purchaseLifetime = () => {
        if (Capacitor.isNativePlatform() && window.CdvPurchase) {
            const product = window.CdvPurchase.store.get('itungin_plus_lifetime');
            if (product) {
                window.CdvPurchase.store.order(product.getOffer());
            } else {
                setAlertConfig({ show: true, message: language === 'id' ? 'Produk tidak ditemukan. Pastikan aplikasi sudah diunduh dari Google Play.' : 'Product not found. Make sure the app is downloaded from Google Play.', type: 'error' });
            }
        } else {
            // Web — inform user
            setAlertConfig({ show: true, message: language === 'id' ? 'Pembelian hanya tersedia di aplikasi Android (Google Play).' : 'Purchase is only available in the Android app (Google Play).', type: 'info' });
        }
    };

    // ── Google Sign-In ──────────────────────────────────────────────────────
    const googleSignIn = async () => {
        try {
            let firebaseUser;
            if (Capacitor.isNativePlatform()) {
                // Native: use @capgo/capacitor-social-login
                await SocialLogin.initialize({ google: { webClientId: GOOGLE_WEB_CLIENT_ID } });
                const result = await SocialLogin.login({ provider: 'google', options: { scopes: ['profile', 'email'] } });
                const idToken = result?.result?.idToken;
                if (!idToken) throw new Error('No ID token returned from Google Sign-In');
                const credential = GoogleAuthProvider.credential(idToken);
                const userCred = await signInWithCredential(auth, credential);
                firebaseUser = userCred.user;
            } else {
                // Web: Firebase popup
                const provider = new GoogleAuthProvider();
                provider.addScope('profile');
                provider.addScope('email');
                const userCred = await signInWithPopup(auth, provider);
                firebaseUser = userCred.user;
            }
            return firebaseUser;
        } catch (error) {
            console.error('Google Sign-In error:', error);
            throw error;
        }
    };

    // ── Sign Out ────────────────────────────────────────────────────────────
    const signOut = async () => {
        await firebaseSignOut(auth);
        setCurrentUser(null);
        setUserProfile({ name: '', email: '', isGuest: true });
        setHasCompletedOnboarding(false);
        setHasLifetimePremium(false);
        setPremiumUnlockTime(null);
        setTransactions([]);
        setDebts([]);
        setBudgets([]);
        setSavings([]);
        setSubscriptions([]);
        setAccounts([]);
        setNotifications([]);
        firestoreSeededRef.current = false;
        // Clear sensitive localStorage keys
        ['userProfile', 'hasLifetimePremium', 'premiumUnlockTime', 'guestDataMigrated', 'hasCompletedOnboarding'].forEach(k => localStorage.removeItem(k));
    };

    // ── Push Native Notification ────────────────────────────────────────────
    const pushNativeNotification = async (title, body, codeId) => {
        if (Capacitor.isNativePlatform()) {
            try {
                await LocalNotifications.schedule({ notifications: [{ title, body, id: Math.abs(codeId), schedule: { at: new Date(Date.now() + 1000) } }] });
            } catch (e) { console.error(e); }
        }
    };

    // ── Persistence for UI prefs ────────────────────────────────────────────
    useEffect(() => { localStorage.setItem('currency', currency); }, [currency]);
    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
        darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
    }, [darkMode]);
    useEffect(() => {
        if (language) localStorage.setItem('language', language);
        else localStorage.removeItem('language');
    }, [language]);
    useEffect(() => { localStorage.setItem('hasCompletedOnboarding', JSON.stringify(hasCompletedOnboarding)); }, [hasCompletedOnboarding]);
    useEffect(() => { localStorage.setItem('userProfile', JSON.stringify(userProfile)); }, [userProfile]);

    // ── Premium Expiry Checker ──────────────────────────────────────────────
    useEffect(() => {
        if (!premiumUnlockTime) return;
        const checkExpiry = () => { if (Date.now() - premiumUnlockTime > 3 * 60 * 60 * 1000) { setPremiumUnlockTime(null); localStorage.removeItem('premiumUnlockTime'); } };
        const interval = setInterval(checkExpiry, 60000);
        return () => clearInterval(interval);
    }, [premiumUnlockTime]);

    // ── Budget Notification Watcher ─────────────────────────────────────────
    useEffect(() => {
        if (!budgets || budgets.length === 0 || !transactions) return;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const monthTx = transactions.filter(t => { const d = new Date(t.date); return t.amount < 0 && d.getMonth() === currentMonth && d.getFullYear() === currentYear; });
        const spending = monthTx.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount); return acc; }, {});
        setNotifications(prev => {
            let n = [...prev]; let added = false;
            budgets.forEach(b => {
                const spent = spending[b.category] || 0;
                if (b.limit > 0) {
                    const ratio = spent / b.limit;
                    const idW = `budget_warn_${b.id}_${currentMonth}_${currentYear}`;
                    const idA = `budget_alert_${b.id}_${currentMonth}_${currentYear}`;
                    if (ratio >= 1.0 && !n.some(x => x.id === idA)) { n.push({ id: idA, text: language === 'id' ? `Anggaran ${b.category} telah habis!` : `${b.category} budget exceeded!`, icon: 'warning', time: 'Just now', read: false }); added = true; }
                    else if (ratio >= 0.8 && !n.some(x => x.id === idW) && !n.some(x => x.id === idA)) { n.push({ id: idW, text: language === 'id' ? `Anggaran ${b.category} mendekati batas (>${(ratio * 100).toFixed(0)}%).` : `${b.category} budget is nearing its limit (>${(ratio * 100).toFixed(0)}%).`, icon: 'info', time: 'Just now', read: false }); added = true; }
                }
            });
            return added ? n : prev;
        });
    }, [budgets, transactions, language]);

    // ── Version & Backup Watcher ────────────────────────────────────────────
    useEffect(() => {
        const savedVersion = localStorage.getItem('appVersion');
        const currentVersion = '1.0.0';
        if (savedVersion !== currentVersion) {
            setNotifications(prev => {
                const n = { id: `version_update_${currentVersion}`, text: language === 'id' ? `Selamat datang di ItungIn Versi ${currentVersion}! Nikmati fitur baru.` : `Welcome to ItungIn Version ${currentVersion}! Enjoy the new features.`, icon: 'rocket_launch', time: 'Just now', read: false };
                return [n, ...prev.filter(x => !x.id.startsWith('version_update_'))];
            });
            localStorage.setItem('appVersion', currentVersion);
        }
        const lastBackupStr = localStorage.getItem('lastBackupDate');
        if (lastBackupStr) {
            const diffDays = Math.ceil((new Date() - new Date(lastBackupStr)) / (1000 * 60 * 60 * 24));
            if (diffDays > 30) {
                setNotifications(prev => {
                    const id = `backup_reminder_${new Date().getMonth()}_${new Date().getFullYear()}`;
                    if (!prev.some(n => n.id === id)) return [{ id, text: language === 'id' ? 'Sudah waktunya mem-backup data Anda.' : 'Time to backup your data.', icon: 'security', time: 'Reminder', read: false }, ...prev];
                    return prev;
                });
            }
        }
    }, [language]);

    // ── Debt Due Date Watcher ───────────────────────────────────────────────
    useEffect(() => {
        if (!debts || !transactions) return;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        setNotifications(prev => {
            let n = [...prev]; let added = false;
            debts.forEach(debt => {
                if (debt.balance <= 0) return;
                const dueDay = debt.dueDays;
                let expectedDueDate = new Date(currentYear, currentMonth, dueDay);
                const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                if (dueDay > daysInMonth) expectedDueDate = new Date(currentYear, currentMonth, daysInMonth);
                let nextDueDate = expectedDueDate;
                if (now > expectedDueDate && now.getDate() > expectedDueDate.getDate()) {
                    nextDueDate = new Date(currentYear, currentMonth + 1, dueDay);
                    const nextDays = new Date(currentYear, currentMonth + 2, 0).getDate();
                    if (dueDay > nextDays) nextDueDate = new Date(currentYear, currentMonth + 1, nextDays);
                }
                const diffDays = Math.ceil((nextDueDate - now) / (1000 * 60 * 60 * 24));
                if (diffDays <= 5) {
                    const isPaid = transactions.some(t => { if (t.category !== 'Debt') return false; const td = new Date(t.date); return td.getMonth() === nextDueDate.getMonth() && td.getFullYear() === nextDueDate.getFullYear() && t.title.includes(debt.title); });
                    if (!isPaid) {
                        const notifId = `debt_${debt.id}_${now.getDate()}_${now.getMonth()}_${now.getFullYear()}`;
                        if (!n.some(x => x.id === notifId)) { n.unshift({ id: notifId, text: language === 'id' ? (diffDays < 0 ? `PERINGATAN: Tagihan "${debt.title}" Telat ${Math.abs(diffDays)} Hari!` : `Pengingat: Tagihan "${debt.title}" jatuh tempo dalam ${diffDays} hari.`) : (diffDays < 0 ? `WARNING: "${debt.title}" payment is OVERDUE by ${Math.abs(diffDays)} days!` : `Reminder: "${debt.title}" payment is due in ${diffDays} days.`), icon: diffDays < 0 ? 'warning' : 'event', time: 'System', read: false }); added = true; }
                    }
                }
            });
            return added ? n : prev;
        });
    }, [debts, transactions, language]);

    // ════════════════════════════════════════════════════════════════════════
    // ── Firestore-Aware CRUD Functions ──────────────────────────────────────
    // Pattern: if logged in → write to Firestore (onSnapshot will update state)
    //          if guest → update local state directly
    // ════════════════════════════════════════════════════════════════════════

    const addTransaction = async (transaction) => {
        if (currentUser) {
            const { id, ...data } = transaction;
            await addDoc(userCol(currentUser.uid, 'transactions'), data);
        } else {
            setTransactions(prev => [transaction, ...prev]);
        }
    };

    const updateTransaction = async (updatedTx) => {
        if (currentUser) {
            const { id, ...data } = updatedTx;
            await updateDoc(doc(db, 'users', currentUser.uid, 'transactions', String(id)), data);
        } else {
            setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
        }
    };

    const deleteTransaction = async (id) => {
        if (currentUser) {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'transactions', String(id)));
        } else {
            setTransactions(prev => prev.filter(t => t.id !== id));
        }
    };

    const addAccount = async (name) => {
        const newAcc = { id: Date.now().toString(), name, icon: 'account_balance_wallet' };
        if (currentUser) {
            await setDoc(doc(db, 'users', currentUser.uid, 'accounts', newAcc.id), newAcc);
        } else {
            setAccounts(prev => [...prev, newAcc]);
        }
    };

    // Firestore-aware proxy for setBudgets (used by Budgets.jsx with functional updaters)
    const setBudgetsSync = async (updaterOrValue) => {
        const newBudgets = typeof updaterOrValue === 'function' ? updaterOrValue(budgets) : updaterOrValue;
        setBudgets(newBudgets);
        if (currentUser) {
            const uid = currentUser.uid;
            const batch = writeBatch(db);
            // Delete existing
            const snap = await getDocs(userCol(uid, 'budgets'));
            snap.forEach(d => batch.delete(d.ref));
            // Re-add all
            newBudgets.forEach(b => {
                const { id, ...data } = b;
                const ref = id && !String(id).startsWith('demo-') ? doc(db, 'users', uid, 'budgets', String(id)) : doc(userCol(uid, 'budgets'));
                batch.set(ref, data);
            });
            await batch.commit();
        }
    };

    // Firestore-aware proxy for setDebts (used by Debt.jsx with functional updaters)
    const setDebtsSync = async (updaterOrValue) => {
        const newDebts = typeof updaterOrValue === 'function' ? updaterOrValue(debts) : updaterOrValue;
        setDebts(newDebts);
        if (currentUser) {
            const uid = currentUser.uid;
            const batch = writeBatch(db);
            const snap = await getDocs(userCol(uid, 'debts'));
            snap.forEach(d => batch.delete(d.ref));
            newDebts.forEach(d => {
                const { id, ...data } = d;
                const ref = id && !String(id).startsWith('demo-') ? doc(db, 'users', uid, 'debts', String(id)) : doc(userCol(uid, 'debts'));
                batch.set(ref, data);
            });
            await batch.commit();
        }
    };

    // Firestore-aware proxy for setSubscriptions
    const setSubscriptionsSync = async (updaterOrValue) => {
        const newSubs = typeof updaterOrValue === 'function' ? updaterOrValue(subscriptions) : updaterOrValue;
        setSubscriptions(newSubs);
        if (currentUser) {
            const uid = currentUser.uid;
            const batch = writeBatch(db);
            const snap = await getDocs(userCol(uid, 'subscriptions'));
            snap.forEach(d => batch.delete(d.ref));
            newSubs.forEach(s => {
                const { id, ...data } = s;
                const ref = doc(userCol(uid, 'subscriptions'));
                batch.set(ref, data);
            });
            await batch.commit();
        }
    };

    const updateDebt = async (updatedDebt) => {
        if (currentUser) {
            const { id, ...data } = updatedDebt;
            await updateDoc(doc(db, 'users', currentUser.uid, 'debts', String(id)), data);
        } else {
            setDebts(prev => prev.map(d => d.id === updatedDebt.id ? updatedDebt : d));
        }
    };

    const deleteDebt = async (id) => {
        if (currentUser) {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'debts', String(id)));
        } else {
            setDebts(prev => prev.filter(d => d.id !== id));
        }
    };

    const updateSubscription = async (updatedSub) => {
        if (currentUser) {
            const { id, ...data } = updatedSub;
            await updateDoc(doc(db, 'users', currentUser.uid, 'subscriptions', String(id)), data);
        } else {
            setSubscriptions(prev => prev.map(s => s.id === updatedSub.id ? updatedSub : s));
        }
    };

    const deleteSubscription = async (id) => {
        if (currentUser) {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'subscriptions', String(id)));
        } else {
            setSubscriptions(prev => prev.filter(s => s.id !== id));
        }
    };

    const addSavingGoal = async (goal) => {
        if (currentUser) {
            const { id, ...data } = goal;
            await addDoc(userCol(currentUser.uid, 'savings'), data);
        } else {
            setSavings(prev => [...prev, goal]);
        }
    };

    const updateSavingGoal = async (updatedGoal) => {
        if (currentUser) {
            const { id, ...data } = updatedGoal;
            await updateDoc(doc(db, 'users', currentUser.uid, 'savings', String(id)), data);
        } else {
            setSavings(prev => prev.map(s => s.id === updatedGoal.id ? updatedGoal : s));
        }
    };

    const deleteSavingGoal = async (id) => {
        if (currentUser) {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'savings', String(id)));
        } else {
            setSavings(prev => prev.filter(s => s.id !== id));
        }
    };

    const allocateFundsToGoal = async (goalId, targetAmount) => {
        const goal = savings.find(s => s.id === goalId);
        if (!goal) return;
        const updated = { ...goal, currentAmount: goal.currentAmount + targetAmount };
        await updateSavingGoal(updated);
    };

    const markNotificationAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const completeOnboarding = (profile) => {
        setUserProfile(profile);
        setHasCompletedOnboarding(true);
    };

    const updateUserProfile = (profile) => {
        setUserProfile(prev => ({ ...prev, ...profile }));
    };

    const calculateBalance = () => transactions.reduce((acc, curr) => acc + curr.amount, 0);
    const calculateIncome = () => transactions.filter(t => t.amount > 0).reduce((acc, curr) => acc + curr.amount, 0);
    const calculateExpenses = () => transactions.filter(t => t.amount < 0).reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

    const toggleDarkMode = () => setDarkMode(prev => !prev);
    const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'id' : 'en');

    const showAlert = (message, type = 'error') => {
        setAlertConfig({ show: true, message, type });
        setTimeout(() => setAlertConfig(prev => ({ ...prev, show: false })), 3000);
    };
    const hideAlert = () => setAlertConfig(prev => ({ ...prev, show: false }));

    const showConfirm = (title, message, type = 'info') => new Promise((resolve) => {
        setConfirmConfig({ show: true, title, message, type, onConfirm: () => resolve(true), onCancel: () => resolve(false) });
    });
    const hideConfirm = () => setConfirmConfig(prev => { if (prev.onCancel) prev.onCancel(); return { ...prev, show: false, onConfirm: null, onCancel: null }; });

    const unlockPremium = async () => {
        setHasLifetimePremium(true);
        localStorage.setItem('hasLifetimePremium', 'true');
        if (currentUser) await setDoc(profileDocRef(currentUser.uid), { hasLifetimePremium: true }, { merge: true });
    };

    // ── Reset / Demo helpers ──────────────────────────────────────────────────
    const resetData = async () => {
        if (currentUser) {
            // Delete all Firestore sub-collections for this user
            const uid = currentUser.uid;
            const cols = ['transactions', 'debts', 'accounts', 'subscriptions', 'budgets', 'savings', 'notifications'];
            for (const colName of cols) {
                const snap = await getDocs(userCol(uid, colName));
                const batch = writeBatch(db);
                snap.forEach(d => batch.delete(d.ref));
                await batch.commit();
            }
            await setDoc(profileDocRef(uid), { hasLifetimePremium: false, premiumUnlockTime: null, currency: 'IDR' }, { merge: true });
            firestoreSeededRef.current = false; // Allow re-seeding
        }
        // Always reset local state and prefs
        setHasCompletedOnboarding(false);
        setUserProfile({ name: '', email: '' });
        setLanguage(null);
        setHasLifetimePremium(false);
        setPremiumUnlockTime(null);
        localStorage.removeItem('hasCompletedTour');
        localStorage.removeItem('language');
        localStorage.removeItem('hasCompletedOnboarding');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('hasLifetimePremium');
        localStorage.removeItem('premiumUnlockTime');
        if (!currentUser) {
            // Guest mode: reset to demo data in localStorage
            const demoT = [
                { id: 'demo-1', title: 'Starbucks', date: new Date().toISOString(), amount: -55000, category: 'Food', icon: 'coffee', accountId: '2' },
                { id: 'demo-2', title: 'Salary Deposit', date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), amount: 5200000, category: 'Income', icon: 'payments', accountId: '1' },
                { id: 'demo-3', title: 'Electric Bill', date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), amount: -150000, category: 'Utilities', icon: 'bolt', accountId: '1' },
                { id: 'demo-4', title: 'Apple Store', date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), amount: -2500000, category: 'Shopping', icon: 'shopping_bag', accountId: '1' },
            ];
            setTransactions(demoT);
            setDebts([{ id: 'demo-d1', title: 'Bank Loan', subtitle: 'Mortgage Refinance', balance: 4500000, total: 10000000, color: 'blue', icon: 'account_balance', dueDays: 5, nextDueMonthOffset: 0 }, { id: 'demo-d2', title: 'Friend - Alex', subtitle: 'Personal Loan', balance: 50000, total: 200000, color: 'orange', icon: 'person', dueDays: 1, nextDueMonthOffset: 0 }]);
            setAccounts([{ id: '1', name: 'Main Bank Account', icon: 'account_balance' }, { id: '2', name: 'Cash', icon: 'payments' }]);
            setSubscriptions([{ id: 'demo-sub1', title: 'Netflix', amount: 155000, cycleMonths: 1, nextDueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(), icon: 'movie', color: 'indigo', category: 'Entertainment' }]);
            setBudgets([{ id: 'demo-b1', category: 'Food', limit: 3000000, period: 'monthly' }, { id: 'demo-b2', category: 'Shopping', limit: 1500000, period: 'monthly' }]);
            setSavings([{ id: 'demo-s1', title: 'Emergency Fund', targetAmount: 20000000, currentAmount: 5000000, deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10), icon: 'security', color: 'bg-emerald-500' }]);
            setNotifications([]);
        }
    };

    const resetDemoDataForTour = () => {
        const demoTrans = [
            { id: 'tour-1', title: 'Starbucks', date: new Date().toISOString(), amount: -55000, category: 'Food', icon: 'coffee', accountId: '2' },
            { id: 'tour-2', title: 'Salary Deposit', date: new Date(new Date().setDate(1)).toISOString(), amount: 5000000, category: 'Income', icon: 'payments', accountId: '1' },
            { id: 'tour-3', title: 'Electric Bill', date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), amount: -150000, category: 'Utilities', icon: 'bolt', accountId: '1' },
            { id: 'tour-4', title: 'Apple Store', date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), amount: -2500000, category: 'Shopping', icon: 'shopping_bag', accountId: '1' },
        ];
        setTransactions(demoTrans);
        setDebts([{ id: 'tour-d1', title: 'Bank Loan', subtitle: 'Mortgage Refinance', balance: 4500000, total: 10000000, color: 'blue', icon: 'account_balance', dueDays: 5, nextDueMonthOffset: 0 }, { id: 'tour-d2', title: 'Friend - Alex', subtitle: 'Personal Loan', balance: 50000, total: 200000, color: 'orange', icon: 'person', dueDays: 1, nextDueMonthOffset: 0 }]);
        setAccounts([{ id: '1', name: 'Main Bank Account', icon: 'account_balance' }, { id: '2', name: 'Cash', icon: 'payments' }]);
        setSubscriptions([{ id: 'tour-sub1', title: 'Netflix', amount: 155000, cycleMonths: 1, nextDueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(), icon: 'movie', color: 'indigo', category: 'Entertainment' }, { id: 'tour-sub2', title: 'Spotify Premium', amount: 55000, cycleMonths: 1, nextDueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(), icon: 'music_note', color: 'emerald', category: 'Entertainment' }]);
        setNotifications([]);
        setBudgets([{ id: 'tour-b1', category: 'Food', limit: 3000000, period: 'monthly' }, { id: 'tour-b2', category: 'Shopping', limit: 1500000, period: 'monthly' }]);
        localStorage.removeItem('hasCompletedTour');
    };

    const injectPremiumTourData = () => {
        const demoBudgets = [{ id: 'pb1', category: 'Food', limit: 3000000, period: 'monthly' }, { id: 'pb2', category: 'Shopping', limit: 1500000, period: 'monthly' }, { id: 'pb3', category: 'Utilities', limit: 1200000, period: 'monthly' }];
        const demoSavings = [{ id: 'ps1', title: 'Vacation', targetAmount: 15000000, currentAmount: 4500000, deadline: new Date(new Date().setMonth(new Date().getMonth() + 10)).toISOString().slice(0, 10), icon: 'flight', color: 'bg-blue-500' }, { id: 'ps2', title: 'New Phone', targetAmount: 8000000, currentAmount: 3200000, deadline: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString().slice(0, 10), icon: 'smartphone', color: 'bg-indigo-500' }];
        const demoTx = [];
        const cats = ['Food', 'Shopping', 'Utilities', 'Transportation', 'Entertainment'];
        for (let i = 0; i < 12; i++) {
            const date = new Date(); date.setMonth(date.getMonth() - i);
            demoTx.push({ id: `pt-inc-${i}`, title: 'Monthly Salary', date: new Date(new Date(date).setDate(1)).toISOString(), amount: 7500000 + Math.random() * 500000, category: 'Income', icon: 'work', accountId: '1' });
            for (let j = 0; j < 8; j++) {
                const cat = cats[Math.floor(Math.random() * cats.length)];
                demoTx.push({ id: `pt-exp-${i}-${j}`, title: `Demo ${cat} Item`, date: new Date(new Date(date).setDate(Math.floor(Math.random() * 28) + 1)).toISOString(), amount: -(100000 + Math.random() * 800000), category: cat, icon: 'payments', accountId: '1' });
            }
        }
        setBudgets(demoBudgets);
        setSavings(demoSavings);
        setTransactions(prev => [...demoTx, ...prev]);
    };

    const clearDemoData = () => { setTransactions([]); setDebts([]); setSubscriptions([]); setNotifications([]); setSavings([]); setBudgets([]); };

    const restoreData = (data) => {
        if (data.transactions) setTransactions(data.transactions);
        if (data.debts) setDebts(data.debts);
        if (data.subscriptions) setSubscriptions(data.subscriptions);
        if (data.savings) setSavings(data.savings);
        if (data.budgets) setBudgets(data.budgets);
        if (data.accounts) setAccounts(data.accounts);
        if (data.transactions) localStorage.setItem('transactions', JSON.stringify(data.transactions));
        if (data.debts) localStorage.setItem('debts', JSON.stringify(data.debts));
        if (data.subscriptions) localStorage.setItem('subscriptions', JSON.stringify(data.subscriptions));
        if (data.savings) localStorage.setItem('savings', JSON.stringify(data.savings));
        if (data.budgets) localStorage.setItem('budgets', JSON.stringify(data.budgets));
        if (data.accounts) localStorage.setItem('accounts', JSON.stringify(data.accounts));
    };

    return (
        <AppContext.Provider value={{
            // Auth
            currentUser,
            isAuthLoading,
            googleSignIn,
            signOut,
            // UI Prefs
            darkMode,
            toggleDarkMode,
            currency,
            setCurrency,
            language,
            setLanguage,
            toggleLanguage,
            // Onboarding
            hasCompletedOnboarding,
            completeOnboarding,
            userProfile,
            updateUserProfile,
            // Data
            transactions,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            debts,
            setDebts: setDebtsSync,
            updateDebt,
            deleteDebt,
            accounts,
            addAccount,
            subscriptions,
            setSubscriptions: setSubscriptionsSync,
            updateSubscription,
            deleteSubscription,
            budgets,
            setBudgets: setBudgetsSync,
            savings,
            addSavingGoal,
            updateSavingGoal,
            deleteSavingGoal,
            allocateFundsToGoal,
            notifications,
            markNotificationAsRead,
            markAllNotificationsAsRead,
            // Calculations
            calculateBalance,
            calculateIncome,
            calculateExpenses,
            // UI
            alertConfig,
            showAlert,
            hideAlert,
            confirmConfig,
            showConfirm,
            hideConfirm,
            // Premium
            isPremium,
            hasLifetimePremium,
            unlockPremium,
            showRewardedAd,
            purchaseLifetime,
            // Reset / Demo
            resetData,
            resetDemoDataForTour,
            injectPremiumTourData,
            clearDemoData,
            restoreData,
            // Native
            pushNativeNotification,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
