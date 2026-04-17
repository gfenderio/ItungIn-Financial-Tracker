import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const PremiumTourOverlay = () => {
    const { isPremium, language, injectPremiumTourData, restoreData, transactions, budgets, savings, debts, subscriptions, accounts, showConfirm } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    const tourInitiated = useRef(false);
    const isRoutingRef = useRef(false);

    useEffect(() => {
        const handleStartTour = (e) => {
            const startIndex = e?.detail?.startIndex || 0;

            // We ensure we only start this tour from the premium hub
            if (location.pathname !== '/premium') {
                navigate('/premium');
                setTimeout(() => window.dispatchEvent(new CustomEvent('start-premium-tour', { detail: { startIndex } })), 100);
                return;
            }

            if (tourInitiated.current) return;
            tourInitiated.current = true;

            // Backup real data before injecting demo (only if not resuming)
            if (startIndex === 0) {
                const backup = { transactions, budgets, savings, debts, subscriptions, accounts };
                localStorage.setItem('premium_tour_backup', JSON.stringify(backup));
            }

            // Inject demo data for the tour
            injectPremiumTourData();

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

            if (!document.getElementById('tour-lock-style-premium')) {
                const style = document.createElement('style');
                style.id = 'tour-lock-style-premium';
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

            const steps = [
                { element: '#tour-premium-budgets', popover: { title: language === 'id' ? 'Anggaran Super' : 'Super Budgets', description: language === 'id' ? 'Atur dan kelola batas pengeluaran anti jebol di sini.' : 'Set and manage unbreakable spending limits here.', side: "bottom", align: 'start' } },
                { element: '#tour-budget-cards', popover: { title: language === 'id' ? 'Pantau Batas Anda' : 'Monitor Your Limits', description: language === 'id' ? 'Warna bar akan berubah dari hijau, kuning, hingga merah saat Anda mendekati batas bulanan.' : 'The bar color changes from green, to yellow, to red as you approach the monthly limit.', side: "bottom", align: 'start' } },
                { element: '#tour-add-budget', popover: { title: language === 'id' ? 'Buat Anggaran Baru' : 'Add New Budget', description: language === 'id' ? 'Klik di sini untuk mulai membatasi pengeluaran per kategori.' : 'Click here to start limiting expenses per category.', side: "bottom", align: 'end' } },
                { element: '#tour-premium-analytics', popover: { title: language === 'id' ? 'Analitik Detail' : 'Deep Analytics', description: language === 'id' ? 'Selami kebiasaan belanja Anda dengan grafik interaktif kaya fitur.' : 'Dive into your spending habits with feature-rich interactive charts.', side: "bottom", align: 'start' } },
                { element: '#tour-period-selector', popover: { title: language === 'id' ? 'Rentang Waktu' : 'Time Period', description: language === 'id' ? 'Sesuaikan jangka waktu analitik Anda (6 Bulan, 1 Tahun, atau Semua data).' : 'Adjust your analytics timeframe (6 Months, 1 Year, or All time).', side: "bottom", align: 'start' } },
                { element: '#tour-trend-chart', popover: { title: language === 'id' ? 'Tren Kas' : 'Cash Flow Trend', description: language === 'id' ? 'Bandingkan laju Pemasukan dan Pengeluaran Anda dari waktu ke waktu.' : 'Compare your Income and Expense velocity over time.', side: "top", align: 'center' } },
                { element: '#tour-premium-savings', popover: { title: language === 'id' ? 'Impian' : 'Savings Goals', description: language === 'id' ? 'Kawal sisa uang Anda menuju target impian masa depan.' : 'Guard your remaining money towards future dream targets.', side: "top", align: 'start' } },
                { element: '#tour-savings-list', popover: { title: language === 'id' ? 'Top-Up Dana' : 'Top-Up Funds', description: language === 'id' ? 'Alokasikan uang Anda ke kartu ini, saldo dompet utama Anda akan otomatis terpotong!' : 'Allocate your money into these cards, your main active balance will be automatically deducted!', side: "bottom", align: 'center' } },
                { element: '#tour-premium-replay', popover: { title: language === 'id' ? 'Selesai!' : 'Done!', description: language === 'id' ? 'Jika Anda lupa cara kerjanya, putar ulang penjelasan ini memalui tombol Bantuan.' : 'If you forget how things work, replay this guide using the Help button.', side: "left", align: 'center' } }
            ];

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
                            const lockStyle = document.getElementById('tour-lock-style-premium');
                            if (lockStyle) lockStyle.remove();
                            
                            driverObj.destroy();

                            const confirmed = await showConfirm(
                                language === 'id' ? 'Keluar dari Tutorial?' : 'Skip Tutorial?',
                                language === 'id'
                                    ? 'Apakah Anda yakin? Anda bisa mengakses kembali tutorial ini lewat ikon Bantuan Tanda Tanya (?) di Menu ItungIn Plus.'
                                    : 'Are you sure? You can replay this tour via the Help (?) icon in the ItungIn Plus menu.',
                                'warning'
                            );

                            if (confirmed) {
                                tourInitiated.current = false;
                                localStorage.setItem('tour_premium_completed', 'true');
                                const backupStr = localStorage.getItem('premium_tour_backup');
                                if (backupStr) {
                                    try { restoreData(JSON.parse(backupStr)); localStorage.removeItem('premium_tour_backup'); } catch (e) {}
                                }
                            } else {
                                tourInitiated.current = false;
                                window.dispatchEvent(new CustomEvent('start-premium-tour', { detail: { startIndex: currentIndex } }));
                            }
                        };
                        footer.insertBefore(skipBtn, footer.firstChild);
                    }
                },
                onDestroyStarted: () => {
                    if (isRoutingRef.current) return;
                    const lockStyleCleanup = document.getElementById('tour-lock-style-premium');
                    if (lockStyleCleanup) lockStyleCleanup.remove();
                    tourInitiated.current = false;
                    localStorage.setItem('tour_premium_completed', 'true');
                    const backupStr = localStorage.getItem('premium_tour_backup');
                    if (backupStr) {
                        try { restoreData(JSON.parse(backupStr)); localStorage.removeItem('premium_tour_backup'); } catch (e) {}
                    }
                },
                onNextClick: () => {
                    const activeIndex = driverObj.getActiveIndex();
                    if (activeIndex === 0) jumpToStep(() => navigate('/budgets'), '#tour-budget-cards');
                    else if (activeIndex === 2) jumpToStep(() => navigate('/premium'), '#tour-premium-analytics');
                    else if (activeIndex === 3) jumpToStep(() => navigate('/analytics'), '#tour-period-selector');
                    else if (activeIndex === 5) jumpToStep(() => navigate('/premium'), '#tour-premium-savings');
                    else if (activeIndex === 6) jumpToStep(() => navigate('/savings'), '#tour-savings-list');
                    else if (activeIndex === 7) jumpToStep(() => navigate('/premium'), '#tour-premium-replay');
                    else driverObj.moveNext();
                },
                onPrevClick: () => {
                    const activeIndex = driverObj.getActiveIndex();
                    if (activeIndex === 1) jumpToStep(() => navigate('/premium'), '#tour-premium-budgets', false);
                    else if (activeIndex === 3) jumpToStep(() => navigate('/budgets'), '#tour-add-budget', false);
                    else if (activeIndex === 4) jumpToStep(() => navigate('/premium'), '#tour-premium-analytics', false);
                    else if (activeIndex === 6) jumpToStep(() => navigate('/analytics'), '#tour-trend-chart', false);
                    else if (activeIndex === 7) jumpToStep(() => navigate('/premium'), '#tour-premium-savings', false);
                    else if (activeIndex === 8) jumpToStep(() => navigate('/savings'), '#tour-savings-list', false);
                    else driverObj.movePrevious();
                },
                steps
            });
            driverObj.drive();
        };

        window.addEventListener('start-premium-tour', handleStartTour);
        const hasCompletedTour = localStorage.getItem('tour_premium_completed');
        if (isPremium && !hasCompletedTour && !tourInitiated.current) { handleStartTour(); }
        return () => { window.removeEventListener('start-premium-tour', handleStartTour); };
    }, [isPremium, language, navigate, location.pathname]);

    return null;
};

export default PremiumTourOverlay;
