import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const AppTourOverlay = () => {
    const { hasCompletedOnboarding, language, clearDemoData, showConfirm } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const hasCompletedTourVal = JSON.parse(localStorage.getItem('hasCompletedTour') || 'false');

    const tourInitiated = useRef(false);
    const isRoutingRef = useRef(false);

    useEffect(() => {
        const handleStartTour = (e) => {
            const startIndex = e?.detail?.startIndex || 0;

            if (location.pathname !== '/') {
                navigate('/');
                setTimeout(() => window.dispatchEvent(new CustomEvent('start-app-tour', { detail: { startIndex } })), 100);
                return;
            }

            if (tourInitiated.current) return;
            tourInitiated.current = true;

            let driverObj;

            const jumpToStep = (action, selector, isNext = true) => {
                isRoutingRef.current = true;
                if (action) action();

                let attempts = 0;
                const checkDOM = setInterval(() => {
                    attempts++;
                    const el = document.querySelector(selector);
                    if (el && el.getBoundingClientRect().width > 0) {
                        clearInterval(checkDOM);
                        setTimeout(() => {
                            isRoutingRef.current = false;
                            if (isNext) driverObj.moveNext(); else driverObj.movePrevious();
                        }, 400);
                    } else if (attempts > 50) {
                        clearInterval(checkDOM);
                        isRoutingRef.current = false;
                        if (isNext) driverObj.moveNext(); else driverObj.movePrevious();
                    }
                }, 50);
            };

            if (!document.getElementById('tour-lock-style')) {
                const style = document.createElement('style');
                style.id = 'tour-lock-style';
                style.innerHTML = `
                    #root { pointer-events: none !important; user-select: none !important; }
                    .driver-active-element { pointer-events: none !important; user-select: none !important; }
                    .driver-active-element * { pointer-events: none !important; user-select: none !important; }
                    button.driver-popover-close-btn { display: none !important; }
                    .driver-popover-footer {
                        display: flex !important;
                        align-items: center !important;
                        justify-content: flex-end !important;
                        gap: 8px !important;
                        padding-top: 12px !important;
                        border-top: 1px solid rgba(0,0,0,0.05) !important;
                    }
                    .custom-skip-btn {
                        margin-right: auto;
                        padding: 7px 14px;
                        background: rgba(239, 68, 68, 0.1);
                        color: #ef4444 !important;
                        border-radius: 10px;
                        font-weight: 700;
                        font-size: 13px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        border: none;
                        transition: all 0.2s;
                    }
                    .custom-skip-btn:hover { background: rgba(239, 68, 68, 0.2); transform: translateY(-1px); }
                    .custom-skip-btn:active { transform: translateY(0); }
                `;
                document.head.appendChild(style);
            }

            driverObj = driver({
                showProgress: true,
                smoothScroll: true,
                allowClose: false,
                initialStep: startIndex,
                showButtons: ['next', 'previous'],
                doneBtnText: language === 'id' ? 'Selesai' : 'Done',
                nextBtnText: language === 'id' ? 'Lanjut &rarr;' : 'Next &rarr;',
                prevBtnText: language === 'id' ? '&larr; Kembali' : '&larr; Prev',
                popoverClass: 'font-display',
                onPopoverRender: (popover) => {
                    const footer = popover.footer || popover.wrapper?.querySelector('.driver-popover-footer');
                    if (footer && !footer.querySelector('.custom-skip-btn')) {
                        const skipBtn = document.createElement('button');
                        skipBtn.className = 'custom-skip-btn';
                        skipBtn.innerHTML = `<i class="material-symbols-outlined" style="font-size: 16px">close</i><span>Skip</span>`;
                        skipBtn.onclick = async () => {
                            const currentIndex = driverObj.getActiveIndex();
                            const lockStyleBtn = document.getElementById('tour-lock-style');
                            if (lockStyleBtn) lockStyleBtn.remove();
                            
                            driverObj.destroy();

                            const confirmed = await showConfirm(
                                language === 'id' ? 'Keluar dari Tutorial?' : 'Skip Tutorial?',
                                language === 'id' 
                                    ? 'Apakah Anda yakin? Anda bisa mengakses kembali tutorial ini di Profil.'
                                    : 'Are you sure? You can replay this tour in your Profile.',
                                'warning'
                            );

                            if (confirmed) {
                                localStorage.setItem('hasCompletedTour', 'true');
                                tourInitiated.current = false;
                                clearDemoData();
                                navigate('/');
                            } else {
                                tourInitiated.current = false;
                                window.dispatchEvent(new CustomEvent('start-app-tour', { detail: { startIndex: currentIndex } }));
                            }
                        };
                        footer.insertBefore(skipBtn, footer.firstChild);
                    }
                },
                onNextClick: () => {
                    const activeIndex = driverObj.getActiveIndex();
                    if (activeIndex === 2) {
                        jumpToStep(() => window.dispatchEvent(new CustomEvent('open-add-modal')), '#tour-amount-input');
                    } else if (activeIndex === 4) {
                        jumpToStep(() => {
                            window.dispatchEvent(new CustomEvent('close-add-modal'));
                            navigate('/transactions');
                        }, '#tour-transactions-filter');
                    } else if (activeIndex === 5) {
                        jumpToStep(() => navigate('/transaction/1'), '#tour-edit-btn');
                    } else if (activeIndex === 7) {
                        jumpToStep(() => navigate('/debt'), '#tour-debt-header');
                    } else if (activeIndex === 8) {
                        jumpToStep(() => {
                            const debtCard = document.querySelector('.bg-blue-500');
                            if (debtCard) debtCard.click();
                        }, '#tour-edit-debt-btn');
                    } else if (activeIndex === 10) {
                        jumpToStep(() => {
                            const closeBtn = document.querySelector('.relative.w-full .flex.items-center.gap-2 button:last-child');
                            if (closeBtn) closeBtn.click();
                        }, '.dti-tracker-card');
                    } else if (activeIndex === 11) {
                        jumpToStep(() => navigate('/subscriptions'), '#tour-bills-header');
                    } else if (activeIndex === 12) {
                        jumpToStep(() => {
                            const billCard = document.querySelector('main .cursor-pointer.group');
                            if (billCard) billCard.click();
                        }, '#tour-edit-sub-btn');
                    } else if (activeIndex === 14) {
                        jumpToStep(() => {
                            const closeBtn = document.querySelector('.relative.w-full .flex.items-center.gap-2 button:last-child');
                            if (closeBtn) closeBtn.click();
                            navigate('/profile');
                        }, '#nav-profile');
                    } else if (activeIndex === 15) {
                        jumpToStep(() => navigate('/'), 'header');
                    } else {
                        driverObj.moveNext();
                    }
                },
                onPrevClick: () => {
                    const activeIndex = driverObj.getActiveIndex();
                    if (activeIndex === 3) {
                        jumpToStep(() => window.dispatchEvent(new CustomEvent('close-add-modal')), '.add-transaction-btn', false);
                    } else if (activeIndex === 5) {
                        jumpToStep(() => {
                            navigate('/');
                            setTimeout(() => window.dispatchEvent(new CustomEvent('open-add-modal')), 100);
                        }, '#tour-save-btn', false);
                    } else if (activeIndex === 6) {
                        jumpToStep(() => navigate('/transactions'), '#tour-transactions-filter', false);
                    } else if (activeIndex === 8) {
                        jumpToStep(() => navigate('/transaction/1'), '#tour-save-edit-btn', false);
                    } else if (activeIndex === 9) {
                        jumpToStep(() => {
                            const closeBtn = document.querySelector('.relative.w-full .flex.items-center.gap-2 button:last-child');
                            if (closeBtn) closeBtn.click();
                        }, '#tour-debt-header', false);
                    } else if (activeIndex === 11) {
                        jumpToStep(() => {
                            const debtCard = document.querySelector('.bg-blue-500');
                            if (debtCard) debtCard.click();
                        }, '#tour-save-debt-edit-btn', false);
                    } else if (activeIndex === 12) {
                        jumpToStep(() => navigate('/debt'), '.dti-tracker-card', false);
                    } else if (activeIndex === 13) {
                        jumpToStep(() => {
                            const closeBtn = document.querySelector('.relative.w-full .flex.items-center.gap-2 button:last-child');
                            if (closeBtn) closeBtn.click();
                        }, '#tour-bills-header', false);
                    } else if (activeIndex === 15) {
                        jumpToStep(() => {
                            navigate('/subscriptions');
                            setTimeout(() => {
                                const billCard = document.querySelector('main .cursor-pointer.group');
                                if (billCard) billCard.click();
                            }, 100);
                        }, '#tour-save-sub-edit-btn', false);
                    } else if (activeIndex === 16) {
                        jumpToStep(() => navigate('/profile'), '#nav-profile', false);
                    } else {
                        driverObj.movePrevious();
                    }
                },
                steps: [
                    { popover: { title: language === 'id' ? 'Selamat Datang di ItungIn!' : 'Welcome to ItungIn!', description: language === 'id' ? 'Mari kita mulai tur singkat untuk melihat fitur-fitur tangguh yang membuat ItungIn spesial.' : 'Let\'s take a quick tour to explore the powerful features that make ItungIn special.', side: "center", align: 'start' } },
                    { element: '.hero-balance-section', popover: { title: language === 'id' ? 'Ringkasan Saldo' : 'Balance Overview', description: language === 'id' ? 'Di sini Anda dapat memantau kekayaan dan pergerakan dana Anda secara instan.' : 'Instantly monitor your total wealth and money flow here.', side: "bottom", align: 'start' } },
                    { element: '.add-transaction-btn', popover: { title: language === 'id' ? 'Tambah Transaksi' : 'Add Transaction', description: language === 'id' ? 'Tekan ini kapan saja untuk mencatat saldo atau menambah pemasukan baru.' : 'Tap this anytime to deduct expenses or add new income.', side: "bottom", align: 'end' } },
                    { element: '#tour-amount-input', popover: { title: language === 'id' ? 'Input Cepat' : 'Fast Input', description: language === 'id' ? 'Ketik jumlah uang di dalam kalkulator pintar ini.' : 'Type the amount in this smart calculator.', side: "bottom", align: 'start' } },
                    { element: '#tour-save-btn', popover: { title: language === 'id' ? 'Simpan Data' : 'Save Data', description: language === 'id' ? 'Pilih Simpan untuk memasukkannya ke pembukuan.' : 'Select Save to record it into your ledger.', side: "top", align: 'center' } },
                    { element: '#tour-transactions-filter', popover: { title: language === 'id' ? 'Riwayat & Pencarian' : 'History & Search', description: language === 'id' ? 'Gunakan filter pintar ini untuk memilah bulan, melacak riwayat, atau mencari transaksi lampau.' : 'Use smart filtering to breakdown months, track history, or search past transactions.', side: "bottom", align: 'center' } },
                    { element: '#tour-edit-btn', popover: { title: language === 'id' ? 'Edit Transaksi' : 'Edit Transactions', description: language === 'id' ? 'Ketuk transaksi mana pun untuk melihat rinciannya, lalu tekan tombol pensil ini.' : 'Tap any transaction to view its details, then press this pencil button.', side: "bottom", align: 'start' } },
                    { element: '#tour-save-edit-btn', popover: { title: language === 'id' ? 'Simpan Perubahan' : 'Save Modifications', description: language === 'id' ? 'Fitur ini memungkinkan Anda mengubah nominal, kategori, hingga tanggal di kemudian hari.' : 'This allows you to modify the amount, category, and date retroactively at any time.', side: "bottom", align: 'end' } },
                    { element: '#tour-debt-header', popover: { title: language === 'id' ? 'Manajemen Hutang' : 'Debt Management', description: language === 'id' ? 'Catat pinjaman, pantau denda telat bayar, dan lunasi hutang Anda secara bertahap.' : 'Record loans, track late fees, and pay off your debts incrementally.', side: "bottom", align: 'center' } },
                    { element: '#tour-edit-debt-btn', popover: { title: language === 'id' ? 'Ubah Profil Hutang' : 'Modify Debt Profiles', description: language === 'id' ? 'Sama halnya dengan transaksi, Anda dapat mengedit batas waktu dan total cicilan pinjaman Anda.' : 'Just like transactions, you can edit the terms, deadlines, and balances of your loans.', side: "top", align: 'start' } },
                    { element: '#tour-save-debt-edit-btn', popover: { title: language === 'id' ? 'Penalti Fleksibel' : 'Flexible Penalties', description: language === 'id' ? 'Sistem akan otomatis menghitung ulang denda penalti jika Anda mengubah persentase bunga.' : 'The system recalculates late penalties automatically if you adjust your custom interest rates.', side: "top", align: 'center' } },
                    { element: '.dti-tracker-card', popover: { title: language === 'id' ? 'Rasio Hutang (DTI)' : 'Debt-to-Income (DTI)', description: language === 'id' ? 'Fitur krusial ini memantau persentase penghasilan Anda yang habis untuk membayar hutang.' : 'This crucial feature tracks what percentage of your income is consumed by loan repayments.', side: "bottom", align: 'center' } },
                    { element: '#tour-bills-header', popover: { title: language === 'id' ? 'Tagihan Rutin' : 'Recurring Bills', description: language === 'id' ? 'Lacak layanan langganan bulanan Anda! (Misalnya: Netflix, Spotify, Listrik).' : 'Track your monthly subscription services! (e.g. Netflix, Spotify, Rent).', side: "bottom", align: 'center' } },
                    { element: '#tour-edit-sub-btn', popover: { title: language === 'id' ? 'Atur Siklus Tagihan' : 'Manage Billing Cycles', description: language === 'id' ? 'Lihat ikon pensil ini? Anda bisa menjadwalkan ulang atau mengedit subskripsi kapan pun.' : 'See this pencil icon? You can reschedule dates or edit subscriptions whenever prices change.', side: "top", align: 'start' } },
                    { element: '#tour-save-sub-edit-btn', popover: { title: language === 'id' ? 'Penjadwalan Otomatis' : 'Automated Rolling', description: language === 'id' ? 'Aplikasi akan otomatis memutar tagihan ke bulan depan setelah siklus ini berakhir.' : 'The app automatically rolls the bill into the next month once the current cycle closes.', side: "top", align: 'center' } },
                    { element: '#nav-profile', popover: { title: language === 'id' ? 'Profil & Arsip' : 'Profile & Archive', description: language === 'id' ? 'Sesuaikan tampilan, ubah tema, amankan data (Eksport/Import), atau baca FAQ.' : 'Customize looks, toggle themes, secure data (Export/Import), or read FAQs.', side: "top", align: 'center' } },
                    { element: 'header', popover: { title: language === 'id' ? 'Anda Sudah Ahli!' : 'You\'re All Set!', description: language === 'id' ? 'Tur selesai, data demo akan ditarik. Selamat mengeksplorasi secara nyata!' : 'Tour complete, demo data will now be wiped. Enjoy exploring for real!', side: "bottom", align: 'end' } }
                ],
                onDestroyStarted: () => {
                    if (isRoutingRef.current) return;
                    const lockStyleCleanup = document.getElementById('tour-lock-style');
                    if (lockStyleCleanup) lockStyleCleanup.remove();
                    localStorage.setItem('hasCompletedTour', 'true');
                    tourInitiated.current = false;
                    clearDemoData();
                    window.dispatchEvent(new CustomEvent('close-add-modal'));
                    navigate('/');
                }
            });

            driverObj.drive();
        };

        window.addEventListener('start-app-tour', handleStartTour);

        if (hasCompletedOnboarding && !hasCompletedTourVal && !tourInitiated.current) {
            handleStartTour();
        }

        return () => {
            window.removeEventListener('start-app-tour', handleStartTour);
        };
    }, [hasCompletedOnboarding, hasCompletedTourVal, language, location.pathname, navigate]);

    return null;
};

export default AppTourOverlay;
