import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const AppTourOverlay = () => {
    const { hasCompletedOnboarding, language, clearDemoData } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const hasCompletedTour = JSON.parse(localStorage.getItem('hasCompletedTour') || 'false');

    // We only want to initialize the tour once.
    const tourInitiated = useRef(false);
    const isRoutingRef = useRef(false);

    // Reset lock if data was wiped
    useEffect(() => {
        if (!hasCompletedOnboarding) {
            tourInitiated.current = false;
            isRoutingRef.current = false;
        }
    }, [hasCompletedOnboarding]);

    useEffect(() => {
        if (!hasCompletedOnboarding || hasCompletedTour || tourInitiated.current) return;

        // If not on root, navigate to root and let the location change re-trigger this effect
        if (location.pathname !== '/') {
            navigate('/');
            return;
        }

        tourInitiated.current = true;

        const timer = setTimeout(() => {
            let driverObj;

            // This robust function guarantees the DOM completely renders AND animations finish 
            // before letting the tour proceed. This prevents the popup from showing up on the wrong page!
            const jumpToStep = (action, selector, isNext = true) => {
                isRoutingRef.current = true;
                if (action) action(); // Executes the navigation (e.g., navigate('/debt'))

                let attempts = 0;
                const checkDOM = setInterval(() => {
                    attempts++;
                    const el = document.querySelector(selector);
                    // Ensure the element physically exists AND has dimensions on the screen
                    if (el && el.getBoundingClientRect().width > 0) {
                        clearInterval(checkDOM);
                        setTimeout(() => {
                            isRoutingRef.current = false;
                            if (isNext) driverObj.moveNext(); else driverObj.movePrevious();
                        }, 400); // 400ms buffer guarantees React CSS transitions have settled
                    } else if (attempts > 50) {
                        // Failsafe: if element isn't found after 2.5 seconds, force the tour to proceed anyway
                        clearInterval(checkDOM);
                        isRoutingRef.current = false;
                        if (isNext) driverObj.moveNext(); else driverObj.movePrevious();
                    }
                }, 50);
            };

            // Infallible Interaction Lock protecting against all DOM tampering
            if (!document.getElementById('tour-lock-style')) {
                const style = document.createElement('style');
                style.id = 'tour-lock-style';
                style.innerHTML = `
                    #root { pointer-events: none !important; user-select: none !important; }
                    .driver-active-element { pointer-events: none !important; user-select: none !important; }
                    .driver-active-element * { pointer-events: none !important; user-select: none !important; }
                `;
                document.head.appendChild(style);
            }

            driverObj = driver({
                showProgress: true,
                smoothScroll: true,
                allowClose: false,
                doneBtnText: language === 'id' ? 'Selesai' : 'Done',
                closeBtnText: language === 'id' ? 'Tutup' : 'Close',
                nextBtnText: language === 'id' ? 'Lanjut &rarr;' : 'Next &rarr;',
                prevBtnText: language === 'id' ? '&larr; Kembali' : '&larr; Prev',
                popoverClass: 'font-display',
                onNextClick: () => {
                    const activeIndex = driverObj.getActiveIndex();

                    if (activeIndex === 2) {
                        // Step 3 -> 4 (Add Transaction -> Fast Input)
                        jumpToStep(() => window.dispatchEvent(new CustomEvent('open-add-modal')), '#tour-amount-input');
                    } else if (activeIndex === 4) {
                        // Step 5 -> 6 (Save Data -> Transactions Page)
                        jumpToStep(() => {
                            window.dispatchEvent(new CustomEvent('close-add-modal'));
                            navigate('/transactions');
                        }, '#tour-transactions-filter');
                    } else if (activeIndex === 5) {
                        // Step 6 -> 7 (History -> Transaction Detail Edit)
                        // Show the transaction detail page without editing
                        jumpToStep(() => navigate('/transaction/1'), '#tour-edit-btn');
                    } else if (activeIndex === 7) {
                        // Step 8 -> 9 (Transaction Detail -> Debt Page)
                        jumpToStep(() => navigate('/debt'), '#tour-debt-header');
                    } else if (activeIndex === 8) {
                        // Step 9 -> 10 (Debt -> Debt Details)
                        // Simulate opening a debt modal without editing
                        jumpToStep(() => {
                            const debtCard = document.querySelector('.bg-blue-500');
                            if (debtCard) debtCard.click();
                        }, '#tour-edit-debt-btn');
                    } else if (activeIndex === 10) {
                        // Step 11 -> 12 (Debt Details -> DTI Tracker)
                        jumpToStep(() => {
                            const closeBtn = document.querySelector('.relative.w-full .flex.items-center.gap-2 button:last-child');
                            if (closeBtn) closeBtn.click();
                        }, '.dti-tracker-card');
                    } else if (activeIndex === 11) {
                        // Step 12 -> 13 (DTI -> Bills Page)
                        // User reported it gets stuck here. We ensure navigation fires strongly.
                        jumpToStep(() => navigate('/subscriptions'), '#tour-bills-header');
                    } else if (activeIndex === 12) {
                        // Step 13 -> 14 (Bills -> Bill Details)
                        jumpToStep(() => {
                            const billCard = document.querySelector('main .cursor-pointer.group');
                            if (billCard) billCard.click();
                        }, '#tour-edit-sub-btn');
                    } else if (activeIndex === 14) {
                        // Step 15 -> 16 (Bill Details -> Profile Page)
                        jumpToStep(() => {
                            const closeBtn = document.querySelector('.relative.w-full .flex.items-center.gap-2 button:last-child');
                            if (closeBtn) closeBtn.click();
                            navigate('/profile');
                        }, '#nav-profile');
                    } else if (activeIndex === 15) {
                        // Step 16 -> 17 (Profile -> Dashboard)
                        jumpToStep(() => navigate('/'), 'header');
                    } else {
                        // Default normal next step
                        driverObj.moveNext();
                    }
                },
                onPrevClick: () => {
                    const activeIndex = driverObj.getActiveIndex();

                    if (activeIndex === 3) {
                        // Step 4 -> 3 (Fast Input -> Add Transaction Button)
                        jumpToStep(() => window.dispatchEvent(new CustomEvent('close-add-modal')), '.add-transaction-btn', false);
                    } else if (activeIndex === 5) {
                        // Step 6 -> 5 (Transactions Page -> Save Data)
                        jumpToStep(() => {
                            navigate('/');
                            setTimeout(() => window.dispatchEvent(new CustomEvent('open-add-modal')), 100);
                        }, '#tour-save-btn', false);
                    } else if (activeIndex === 6) {
                        // Step 7 -> 6 (Transaction Detail -> Transactions Page)
                        jumpToStep(() => navigate('/transactions'), '#tour-transactions-filter', false);
                    } else if (activeIndex === 8) {
                        // Step 9 -> 8 (Debt Page -> Transaction Detail)
                        jumpToStep(() => navigate('/transaction/1'), '#tour-save-edit-btn', false);
                    } else if (activeIndex === 9) {
                        // Step 10 -> 9 (Debt Details -> Debt Page Header)
                        jumpToStep(() => {
                            const closeBtn = document.querySelector('.relative.w-full .flex.items-center.gap-2 button:last-child');
                            if (closeBtn) closeBtn.click();
                        }, '#tour-debt-header', false);
                    } else if (activeIndex === 11) {
                        // Step 12 -> 11 (DTI Tracker -> Debt Details)
                        jumpToStep(() => {
                            const debtCard = document.querySelector('.bg-blue-500');
                            if (debtCard) debtCard.click();
                        }, '#tour-save-debt-edit-btn', false);
                    } else if (activeIndex === 12) {
                        // Step 13 -> 12 (Bills Page -> DTI Tracker)
                        jumpToStep(() => navigate('/debt'), '.dti-tracker-card', false);
                    } else if (activeIndex === 13) {
                        // Step 14 -> 13 (Bill Details -> Bills Header)
                        jumpToStep(() => {
                            const closeBtn = document.querySelector('.relative.w-full .flex.items-center.gap-2 button:last-child');
                            if (closeBtn) closeBtn.click();
                        }, '#tour-bills-header', false);
                    } else if (activeIndex === 15) {
                        // Step 16 -> 15 (Profile Page -> Bill Details)
                        jumpToStep(() => {
                            navigate('/subscriptions');
                            setTimeout(() => {
                                const billCard = document.querySelector('main .cursor-pointer.group');
                                if (billCard) billCard.click();
                            }, 100);
                        }, '#tour-save-sub-edit-btn', false);
                    } else if (activeIndex === 16) {
                        // Step 17 -> 16 (Dashboard -> Profile Page)
                        jumpToStep(() => navigate('/profile'), '#nav-profile', false);
                    } else {
                        driverObj.movePrevious();
                    }
                },
                steps: [
                    // Step 1
                    {
                        popover: {
                            title: language === 'id' ? 'Selamat Datang di ItungIn!' : 'Welcome to ItungIn!',
                            description: language === 'id'
                                ? 'Mari kita mulai tur singkat untuk melihat fitur-fitur tangguh yang membuat ItungIn spesial.'
                                : 'Let\'s take a quick tour to explore the powerful features that make ItungIn special.',
                            side: "center", align: 'start'
                        }
                    },
                    // Step 2
                    {
                        element: '.hero-balance-section',
                        popover: {
                            title: language === 'id' ? 'Ringkasan Saldo' : 'Balance Overview',
                            description: language === 'id'
                                ? 'Di sini Anda dapat memantau kekayaan dan pergerakan dana Anda secara instan.'
                                : 'Instantly monitor your total wealth and money flow here.',
                            side: "bottom", align: 'start'
                        }
                    },
                    // Step 3
                    {
                        element: '.add-transaction-btn',
                        popover: {
                            title: language === 'id' ? 'Tambah Transaksi' : 'Add Transaction',
                            description: language === 'id'
                                ? 'Tekan ini kapan saja untuk mencatat saldo atau menambah pemasukan baru.'
                                : 'Tap this anytime to deduct expenses or add new income.',
                            side: "bottom", align: 'end'
                        }
                    },
                    // Step 4
                    {
                        element: '#tour-amount-input',
                        popover: {
                            title: language === 'id' ? 'Input Cepat' : 'Fast Input',
                            description: language === 'id'
                                ? 'Ketik jumlah uang di dalam kalkulator pintar ini.'
                                : 'Type the amount in this smart calculator.',
                            side: "bottom", align: 'start'
                        }
                    },
                    // Step 5
                    {
                        element: '#tour-save-btn',
                        popover: {
                            title: language === 'id' ? 'Simpan Data' : 'Save Data',
                            description: language === 'id'
                                ? 'Pilih Simpan untuk memasukkannya ke pembukuan.'
                                : 'Select Save to record it into your ledger.',
                            side: "top", align: 'center'
                        }
                    },
                    // Step 6
                    {
                        element: '#tour-transactions-filter',
                        popover: {
                            title: language === 'id' ? 'Riwayat & Pencarian' : 'History & Search',
                            description: language === 'id'
                                ? 'Gunakan filter pintar ini untuk memilah bulan, melacak riwayat, atau mencari transaksi lampau.'
                                : 'Use smart filtering to breakdown months, track history, or search past transactions.',
                            side: "bottom", align: 'center'
                        }
                    },
                    // Step 7
                    {
                        element: '#tour-edit-btn',
                        popover: {
                            title: language === 'id' ? 'Edit Transaksi' : 'Edit Transactions',
                            description: language === 'id'
                                ? 'Ketuk transaksi mana pun untuk melihat rinciannya, lalu tekan tombol pensil ini.'
                                : 'Tap any transaction to view its details, then press this pencil button.',
                            side: "bottom", align: 'start'
                        }
                    },
                    // Step 8
                    {
                        element: '#tour-save-edit-btn',
                        popover: {
                            title: language === 'id' ? 'Simpan Perubahan' : 'Save Modifications',
                            description: language === 'id'
                                ? 'Fitur ini memungkinkan Anda mengubah nominal, kategori, hingga tanggal di kemudian hari.'
                                : 'This allows you to modify the amount, category, and date retroactively at any time.',
                            side: "bottom", align: 'end'
                        }
                    },
                    // Step 9
                    {
                        element: '#tour-debt-header',
                        popover: {
                            title: language === 'id' ? 'Manajemen Hutang' : 'Debt Management',
                            description: language === 'id'
                                ? 'Catat pinjaman, pantau denda telat bayar, dan lunasi hutang Anda secara bertahap.'
                                : 'Record loans, track late fees, and pay off your debts incrementally.',
                            side: "bottom", align: 'center'
                        }
                    },
                    // Step 10
                    {
                        element: '#tour-edit-debt-btn',
                        popover: {
                            title: language === 'id' ? 'Ubah Profil Hutang' : 'Modify Debt Profiles',
                            description: language === 'id'
                                ? 'Sama halnya dengan transaksi, Anda dapat mengedit batas waktu dan total cicilan pinjaman Anda.'
                                : 'Just like transactions, you can edit the terms, deadlines, and balances of your loans.',
                            side: "top", align: 'start'
                        }
                    },
                    // Step 11
                    {
                        element: '#tour-save-debt-edit-btn',
                        popover: {
                            title: language === 'id' ? 'Penalti Fleksibel' : 'Flexible Penalties',
                            description: language === 'id'
                                ? 'Sistem akan otomatis menghitung ulang denda penalti jika Anda mengubah persentase bunga.'
                                : 'The system recalculates late penalties automatically if you adjust your custom interest rates.',
                            side: "top", align: 'center'
                        }
                    },
                    // Step 12
                    {
                        element: '.dti-tracker-card',
                        popover: {
                            title: language === 'id' ? 'Rasio Hutang (DTI)' : 'Debt-to-Income (DTI)',
                            description: language === 'id'
                                ? 'Fitur krusial ini memantau persentase penghasilan Anda yang habis untuk membayar hutang.'
                                : 'This crucial feature tracks what percentage of your income is consumed by loan repayments.',
                            side: "bottom", align: 'center'
                        }
                    },
                    // Step 13
                    {
                        element: '#tour-bills-header',
                        popover: {
                            title: language === 'id' ? 'Tagihan Rutin' : 'Recurring Bills',
                            description: language === 'id'
                                ? 'Lacak layanan langganan bulanan Anda! (Misalnya: Netflix, Spotify, Listrik).'
                                : 'Track your monthly subscription services! (e.g. Netflix, Spotify, Rent).',
                            side: "bottom", align: 'center'
                        }
                    },
                    // Step 14
                    {
                        element: '#tour-edit-sub-btn',
                        popover: {
                            title: language === 'id' ? 'Atur Siklus Tagihan' : 'Manage Billing Cycles',
                            description: language === 'id'
                                ? 'Lihat ikon pensil ini? Anda bisa menjadwalkan ulang atau mengedit subskripsi kapan pun.'
                                : 'See this pencil icon? You can reschedule dates or edit subscriptions whenever prices change.',
                            side: "top", align: 'start'
                        }
                    },
                    // Step 15
                    {
                        element: '#tour-save-sub-edit-btn',
                        popover: {
                            title: language === 'id' ? 'Penjadwalan Otomatis' : 'Automated Rolling',
                            description: language === 'id'
                                ? 'Aplikasi akan otomatis memutar tagihan ke bulan depan setelah siklus ini berakhir.'
                                : 'The app automatically rolls the bill into the next month once the current cycle closes.',
                            side: "top", align: 'center'
                        }
                    },
                    // Step 16
                    {
                        element: '#nav-profile',
                        popover: {
                            title: language === 'id' ? 'Profil & Arsip' : 'Profile & Archive',
                            description: language === 'id'
                                ? 'Sesuaikan tampilan, ubah tema, amankan data (Eksport/Import), atau baca FAQ.'
                                : 'Customize looks, toggle themes, secure data (Export/Import), or read FAQs.',
                            side: "top", align: 'center'
                        }
                    },
                    // Step 17
                    {
                        element: 'header',
                        popover: {
                            title: language === 'id' ? 'Anda Sudah Ahli!' : 'You\'re All Set!',
                            description: language === 'id'
                                ? 'Tur selesai, data demo akan ditarik. Selamat mengeksplorasi secara nyata!'
                                : 'Tour complete, demo data will now be wiped. Enjoy exploring for real!',
                            side: "bottom", align: 'end'
                        }
                    }
                ],
                onDestroyStarted: () => {
                    // Shield the driver from self-destructing while React Router unmounts previous pages
                    if (isRoutingRef.current) return;

                    const lockStyle = document.getElementById('tour-lock-style');
                    if (lockStyle) lockStyle.remove();

                    if (driverObj.hasNextStep()) {
                        driverObj.destroy();
                        localStorage.setItem('hasCompletedTour', 'true');
                        tourInitiated.current = false;
                        clearDemoData();
                        navigate('/');
                        return;
                    }

                    localStorage.setItem('hasCompletedTour', 'true');
                    tourInitiated.current = false;
                    clearDemoData();

                    window.dispatchEvent(new CustomEvent('close-add-modal'));

                    navigate('/');
                    driverObj.destroy();
                }
            });

            driverObj.drive();
        }, 500);

        // DELIBERATELY REMOVED 'return () => clearTimeout(timer);'
        // This ensures the 500ms startup sequence absolutely NEVER gets aborted 
        // by rapid asynchronous state updates natively re-rendering the app container.
    }, [hasCompletedOnboarding, hasCompletedTour, language, location.pathname, navigate]);

    return null;
};

export default AppTourOverlay;
