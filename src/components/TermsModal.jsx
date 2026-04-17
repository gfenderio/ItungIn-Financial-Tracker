import React from 'react';
import { useApp } from '../contexts/AppContext';

export default function TermsModal({ isOpen, onClose, onAgree, showAgreeButton = false }) {
    const { language } = useApp();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined">menu_book</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">
                            {language === 'id' ? 'Syarat & Ketentuan' : 'Terms & Conditions'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar text-sm text-slate-600 dark:text-slate-300 space-y-4">
                    <p className="text-xs text-slate-400">
                        {language === 'id' ? 'Terakhir Diperbarui: 15 April 2026' : 'Last Updated: April 15, 2026'}
                    </p>
                    <p>
                        {language === 'id' 
                            ? 'Selamat datang di ItungIn! Dengan mengunduh, mengakses, atau menggunakan aplikasi ItungIn, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini.' 
                            : 'Welcome to ItungIn! By downloading, accessing, or using the ItungIn application, you agree to be bound by these Terms and Conditions.'}
                    </p>
                    
                    <p><strong>1. {language === 'id' ? 'Deskripsi Layanan' : 'Description of Service'}</strong><br/>
                    {language === 'id' 
                        ? 'ItungIn adalah aplikasi pelacak keuangan pribadi yang menyediakan fitur pencatatan transaksi, manajemen utang, dan analisis keuangan. Layanan ini tersedia dalam versi Basic (Gratis) dan Plus (Premium).'
                        : 'ItungIn is a personal finance tracker application that provides transaction recording, debt management, and financial analysis features. This service is available in Basic (Free) and Plus (Premium) versions.'}</p>
                    
                    <p><strong>2. {language === 'id' ? 'Penafian Keuangan (Financial Disclaimer)' : 'Financial Disclaimer'}</strong><br/>
                    <span className="whitespace-pre-line">
                    {language === 'id' 
                        ? 'Bukan Penasihat Keuangan: ItungIn adalah alat bantu administratif. Segala kalkulasi, termasuk rasio Debt-To-Income (DTI) dan grafik analitik, adalah hasil input manual Anda. Kami tidak memberikan saran keuangan profesional.\nKeputusan Pengguna: Segala keputusan finansial, kerugian, atau pengelolaan utang yang Anda lakukan adalah tanggung jawab pribadi Anda. ItungIn tidak bertanggung jawab atas kesalahan pengambilan keputusan berdasarkan data aplikasi.'
                        : 'Not a Financial Advisor: ItungIn is an administrative tool. All calculations, including the Debt-To-Income (DTI) ratio and analytical charts, are results of your manual input. We do not provide professional financial advice.\nUser Decisions: All financial decisions, losses, or debt management you make are your personal responsibility. ItungIn is not liable for errors in decision-making based on application data.'}
                    </span></p>
                    
                    <p><strong>3. {language === 'id' ? 'Keamanan & Penyimpanan Data' : 'Data Security & Storage'}</strong><br/>
                    <span className="whitespace-pre-line">
                    {language === 'id' 
                        ? 'Penyimpanan Lokal: ItungIn saat ini menyimpan data secara lokal pada perangkat Anda menggunakan LocalStorage atau Internal Storage.\nRisiko Kehilangan: Kami tidak bertanggung jawab atas kehilangan data akibat penghapusan cache aplikasi, kerusakan perangkat, atau kehilangan perangkat. Kami sangat menyarankan Anda melakukan pencatatan cadangan secara mandiri.'
                        : 'Local Storage: ItungIn currently stores data locally on your device using LocalStorage or Internal Storage.\nRisk of Loss: We are not responsible for data loss due to app cache deletion, device damage, or device loss. We strongly advise you to make backups independently.'}
                    </span></p>

                    <p><strong>4. {language === 'id' ? 'Fitur ItungIn Plus (Premium)' : 'ItungIn Plus (Premium) Features'}</strong><br/>
                    <span className="whitespace-pre-line">
                    {language === 'id' 
                        ? 'Fitur premium mencakup Anggaran (Budgets), Analitik Detail, dan Tabungan & Impian. Fitur ini dapat diakses melalui dua cara:\nAkses Berbasis Iklan (Rewarded Ads): Pengguna dapat menonton iklan video hingga selesai untuk mendapatkan akses fitur Plus selama 3 jam. ItungIn tidak bertanggung jawab atas konten iklan yang disediakan oleh pihak ketiga (Google AdMob).\nSekali Bayar (Lifetime Access): Pengguna dapat membeli akses seumur hidup. "Seumur hidup" merujuk pada masa hidup produk (selama aplikasi didukung dan dioperasikan oleh pengembang). Tidak ada pengembalian dana (refund) setelah transaksi berhasil, kecuali diwajibkan oleh kebijakan Google Play Store.'
                        : 'Premium features include Budgets, Detailed Analytics, and Savings & Goals. These features can be accessed in two ways:\nAd-Based Access (Rewarded Ads): Users can watch a video ad to completion to gain access to Plus features for 3 hours. ItungIn is not responsible for the ad content provided by third parties (Google AdMob).\nOne-Time Payment (Lifetime Access): Users can purchase lifetime access. "Lifetime" refers to the product\'s lifespan (as long as the application is supported and operated by the developer). There are no refunds after a successful transaction, except as required by Google Play Store policies.'}
                    </span></p>
                    
                    <p><strong>5. {language === 'id' ? 'Iklan Pihak Ketiga' : 'Third-Party Advertisements'}</strong><br/>
                    {language === 'id' 
                        ? 'Aplikasi ini menggunakan layanan Google AdMob untuk menampilkan iklan. Dengan menggunakan aplikasi ini, Anda setuju bahwa Google dapat mengumpulkan dan menggunakan data teknis (seperti ID Iklan Android) untuk menyediakan iklan yang relevan bagi Anda.'
                        : 'This application uses Google AdMob services to display advertisements. By using this application, you agree that Google may collect and use technical data (such as the Android Advertising ID) to provide relevant ads to you.'}</p>
                    
                    <p><strong>6. {language === 'id' ? 'Batasan Tanggung Jawab' : 'Limitation of Liability'}</strong><br/>
                    {language === 'id' 
                        ? 'Pengembang ItungIn tidak bertanggung jawab atas segala kerusakan langsung atau tidak langsung yang timbul dari penggunaan aplikasi, termasuk namun tidak terbatas pada kerusakan sistem operasi atau ketidakakuratan data akibat kesalahan teknis peramban/perangkat.'
                        : 'The developer of ItungIn is not liable for any direct or indirect damages arising from the use of the application, including but not limited to operating system damage or data inaccuracy due to technical errors in the browser/device.'}</p>
                    
                    <p><strong>7. {language === 'id' ? 'Perubahan Ketentuan' : 'Changes to Terms'}</strong><br/>
                    {language === 'id' 
                        ? 'Kami berhak mengubah ketentuan ini sewaktu-waktu untuk menyesuaikan dengan fitur baru atau regulasi hukum. Penggunaan berkelanjutan Anda setelah perubahan dianggap sebagai persetujuan terhadap ketentuan baru.'
                        : 'We reserve the right to change these terms at any time to accommodate new features or legal regulations. Your continued use after the changes assumes agreement to the new terms.'}</p>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 shrink-0 flex justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        {language === 'id' ? 'Tutup' : 'Close'}
                    </button>
                    {showAgreeButton && (
                        <button 
                            onClick={onAgree} 
                            className="px-6 py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">check</span>
                            {language === 'id' ? 'Saya Setuju' : 'I Agree'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
