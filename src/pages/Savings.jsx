import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import AddSavingGoalModal from '../components/AddSavingGoalModal';

export default function Savings() {
    const { savings, deleteSavingGoal, showConfirm, showAlert, language, allocateFundsToGoal, addTransaction, accounts, calculateBalance } = useApp();
    const navigate = useNavigate();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);

    // Top up state
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const [activeGoalForTopUp, setActiveGoalForTopUp] = useState(null);
    const [topUpAmount, setTopUpAmount] = useState('');

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setIsAddModalOpen(true);
    };

    const handleDelete = async (id, title) => {
        const confirmed = await showConfirm(
            language === 'id' ? 'Hapus Impian?' : 'Delete Goal?',
            language === 'id' ? `Apakah Anda yakin ingin menghapus target tabungan "${title}"?` : `Are you sure you want to delete the goal "${title}"?`,
            'danger'
        );
        if (confirmed) {
            deleteSavingGoal(id);
            showAlert(language === 'id' ? 'Impian dihapus.' : 'Goal deleted.', 'success');
        }
    };

    const handleOpenTopUp = (goal) => {
        setActiveGoalForTopUp(goal);
        setTopUpAmount('');
        setIsTopUpOpen(true);
    };

    const handleCloseTopUp = () => {
        setIsTopUpOpen(false);
        setActiveGoalForTopUp(null);
        setTopUpAmount('');
    };

    const submitTopUp = async (e) => {
        e.preventDefault();
        const value = parseFloat(topUpAmount.replace(/\D/g, ''));
        if (isNaN(value) || value <= 0) return;

        if (value >= 1000000000000) {
            showAlert(language === 'id' ? 'Nominal maksimal tidak boleh menyentuh 1 Triliun' : 'Maximum value cannot reach 1 Trillion', 'error');
            return;
        }

        const currentBal = calculateBalance();
        if (value > currentBal) {
            showAlert(language === 'id' ? 'Saldo aktif tidak cukup!' : 'Insufficient active balance!', 'error');
            return;
        }

        const remainingNeeded = activeGoalForTopUp.targetAmount - activeGoalForTopUp.currentAmount;
        if (value > remainingNeeded && remainingNeeded > 0) {
            const confirmedExt = await showConfirm(
                language === 'id' ? 'Melebihi Target' : 'Target Exceeded',
                language === 'id' ? 'Jumlah ini melebihi target tabungan Anda. Tetap lanjutkan?' : 'This amount exceeds your target goal. Continue anyway?',
                'warning'
            );
            if (!confirmedExt) return;
        }

        const confirmed = await showConfirm(
            language === 'id' ? 'Konfirmasi Transfer' : 'Confirm Transfer',
            language === 'id' ? `Pindahkan ${formatMoney(value)} ke impian ${activeGoalForTopUp.title}? Saldo utama akan berkurang.` : `Move ${formatMoney(value)} to ${activeGoalForTopUp.title}? Your main balance will be deducted.`,
            'info'
        );

        if (confirmed) {
            // Allocate internally
            allocateFundsToGoal(activeGoalForTopUp.id, value);

            // Record as expense to truly pull money out from active balance
            addTransaction({
                id: Date.now(),
                title: `Savings Transfer: ${activeGoalForTopUp.title}`,
                amount: -Math.abs(value),
                date: new Date().toISOString(),
                category: 'Others', // Fallback or could be "Savings"
                icon: activeGoalForTopUp.icon,
                accountId: accounts[0]?.id || '1'
            });

            showAlert(language === 'id' ? 'Dana berhasil ditambahkan!' : 'Funds added successfully!', 'success');
            handleCloseTopUp();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col pt-16">
            <header className="px-6 py-6 pb-2">
                <div className="flex justify-between items-end mb-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/premium')} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary transition-colors active:scale-95 shrink-0">
                            <span className="material-symbols-outlined font-bold">arrow_back</span>
                        </button>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                                {language === 'id' ? 'Impian' : 'Savings Goals'}
                            </h2>
                            <p className="text-sm font-medium text-slate-500 mt-1">
                                {language === 'id' ? 'Kumpulkan dana untuk masa depan' : 'Save funds for the future'}
                            </p>
                        </div>
                    </div>
                    <button
                        id="tour-add-goal"
                        onClick={() => { setEditingGoal(null); setIsAddModalOpen(true); }}
                        className="bg-primary hover:bg-primary-dark text-white p-3 rounded-2xl shadow-lg shadow-primary/20 transition-transform active:scale-95 flex items-center justify-center shrink-0"
                    >
                        <span className="material-symbols-outlined text-2xl leading-none">add</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 px-4 pb-24 overflow-y-auto pt-4">
                {savings.length === 0 ? (
                    <div id="tour-savings-list" className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2 opacity-60">
                        <span className="material-symbols-outlined text-5xl">savings</span>
                        <p className="font-medium text-sm">
                            {language === 'id' ? 'Belum ada target tabungan' : 'No savings goals set'}
                        </p>
                    </div>
                ) : (
                    <div id="tour-savings-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {savings.map(goal => {
                            const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                            const isAchieved = goal.currentAmount >= goal.targetAmount;

                            // Calculate days left
                            let daysLeft = null;
                            if (goal.deadline) {
                                const msDiff = new Date(goal.deadline) - new Date();
                                daysLeft = Math.ceil(msDiff / (1000 * 60 * 60 * 24));
                            }

                            return (
                                <div key={goal.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative group overflow-hidden flex flex-col">
                                    {isAchieved && (
                                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 shadow-sm">
                                            {language === 'id' ? 'TERCAPAI' : 'ACHIEVED'}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className={`w-12 h-12 rounded-2xl ${goal.color} flex items-center justify-center text-white shadow-inner`}>
                                            <span className="material-symbols-outlined text-2xl">{goal.icon}</span>
                                        </div>
                                        <div className="flex gap-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg p-1">
                                            <button onClick={() => handleEdit(goal)} className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(goal.id, goal.title)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-6 z-10">
                                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1 leading-tight">{goal.title}</h3>
                                        {daysLeft !== null && (
                                            <p className={`text-[11px] font-bold flex items-center gap-1 ${daysLeft < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                                <span className="material-symbols-outlined text-[12px]">event</span>
                                                {daysLeft < 0
                                                    ? (language === 'id' ? `Terlambat ${Math.abs(daysLeft)} hari` : `${Math.abs(daysLeft)} days overdue`)
                                                    : (language === 'id' ? `Sisa ${daysLeft} hari` : `${daysLeft} days left`)}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-auto relative z-10">
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <p className="font-black text-2xl text-slate-900 dark:text-white leading-none">
                                                    {formatMoney(goal.currentAmount)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                                                    Target
                                                </p>
                                                <p className="font-bold text-sm text-slate-500 dark:text-slate-400 leading-none">
                                                    {formatMoney(goal.targetAmount)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="w-full h-3 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden mb-4 relative shadow-inner">
                                            <div
                                                className={`h-full ${goal.color} transition-all duration-1000 ease-out`}
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>

                                        <button
                                            onClick={() => handleOpenTopUp(goal)}
                                            disabled={isAchieved}
                                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isAchieved ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] shadow-md shadow-slate-900/10 active:scale-[0.98]'}`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                            {language === 'id' ? 'Tambah Dana' : 'Add Funds'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Editor Modal */}
            <AddSavingGoalModal
                isOpen={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); setEditingGoal(null); }}
                goalToEdit={editingGoal}
            />

            {/* Top Up Modal */}
            {isTopUpOpen && activeGoalForTopUp && (
                <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCloseTopUp}></div>
                    <div className="bg-white dark:bg-slate-800 w-full sm:w-[400px] rounded-t-3xl sm:rounded-3xl p-6 relative z-10 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 fade-in duration-300">
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 sm:hidden"></div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                            {language === 'id' ? 'Tambah Dana Tabungan' : 'Top Up Savings'}
                        </h3>
                        <p className="text-sm font-medium text-slate-500 mb-6">
                            {activeGoalForTopUp.title}
                        </p>

                        <form onSubmit={submitTopUp} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    {language === 'id' ? 'Jumlah (Rp)' : 'Amount (Rp)'}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={topUpAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                        onChange={(e) => setTopUpAmount(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-slate-800 dark:text-slate-200"
                                        placeholder="0"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs font-bold text-slate-400 mt-2 text-right">
                                    {language === 'id' ? 'Dipotong dari Saldo Utama' : 'Deducted from Main Balance'}
                                </p>
                            </div>

                            <button
                                type="submit"
                                className={`w-full ${activeGoalForTopUp.color} hover:brightness-110 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] mt-4`}
                            >
                                {language === 'id' ? 'Pindahkan Dana' : 'Transfer Funds'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
