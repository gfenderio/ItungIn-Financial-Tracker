import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

export default function AddSavingGoalModal({ isOpen, onClose, goalToEdit = null }) {
    const { addSavingGoal, updateSavingGoal, showConfirm, showAlert, language } = useApp();

    const [title, setTitle] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [icon, setIcon] = useState('savings');
    const [color, setColor] = useState('bg-blue-500');

    const icons = ['savings', 'home', 'directions_car', 'flight_takeoff', 'laptop_mac', 'school', 'favorite', 'health_and_safety'];
    const colors = [
        'bg-blue-500', 'bg-emerald-500', 'bg-red-500', 'bg-orange-500',
        'bg-indigo-500', 'bg-pink-500', 'bg-teal-500', 'bg-cyan-500'
    ];

    useEffect(() => {
        if (isOpen) {
            if (goalToEdit) {
                setTitle(goalToEdit.title);
                setTargetAmount(goalToEdit.targetAmount.toString());
                setDeadline(goalToEdit.deadline);
                setIcon(goalToEdit.icon);
                setColor(goalToEdit.color);
            } else {
                setTitle('');
                setTargetAmount('');
                setDeadline('');
                setIcon('savings');
                setColor('bg-blue-500');
            }
        }
    }, [isOpen, goalToEdit]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        const numTargetAmount = parseFloat(targetAmount.replace(/\D/g, ''));
        if (!title || isNaN(numTargetAmount) || numTargetAmount <= 0) {
            showAlert(language === 'id' ? 'Lengkapi judul dan target nominal!' : 'Please fill title and target amount!', 'error');
            return;
        }

        if (numTargetAmount >= 1000000000000) {
            showAlert(language === 'id' ? 'Nominal maksimal tidak boleh menyentuh 1 Triliun' : 'Maximum value cannot reach 1 Trillion', 'error');
            return;
        }

        if (goalToEdit) {
            updateSavingGoal({
                ...goalToEdit,
                title,
                targetAmount: numTargetAmount,
                deadline,
                icon,
                color
            });
            showAlert(language === 'id' ? 'Impian berhasil diperbarui!' : 'Goal updated successfully!', 'success');
        } else {
            addSavingGoal({
                id: Date.now(),
                title,
                targetAmount: numTargetAmount,
                currentAmount: 0,
                deadline,
                icon,
                color
            });
            showAlert(language === 'id' ? 'Impian baru berhasil dibuat!' : 'New goal created successfully!', 'success');
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white dark:bg-slate-800 w-full sm:w-[480px] rounded-t-3xl sm:rounded-3xl p-6 relative z-10 slide-in-from-bottom-full animate-in duration-300">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 sm:hidden"></div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        {goalToEdit ? (language === 'id' ? 'Edit Impian' : 'Edit Goal') : (language === 'id' ? 'Buat Impian Baru' : 'Create New Goal')}
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 dark:bg-slate-700 rounded-full">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Visual Preview Header */}
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 mb-6">
                        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-inner transition-colors`}>
                            <span className="material-symbols-outlined text-3xl">{icon}</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">Preview</p>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 mt-1 truncate max-w-[200px]">
                                {title || (language === 'id' ? 'Mobil Baru' : 'New Car')}
                            </h3>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            {language === 'id' ? 'Nama Impian' : 'Goal Name'}
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder={language === 'id' ? 'Cth: Beli Laptop, Dana Darurat' : 'Ex: New Laptop, Emergency Fund'}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100 font-bold"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            {language === 'id' ? 'Target Kumpul (Rp)' : 'Target Amount (Rp)'}
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={targetAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                            onChange={e => setTargetAmount(e.target.value)}
                            placeholder="0"
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100 font-bold"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            {language === 'id' ? 'Tenggat Waktu (Opsional)' : 'Deadline (Optional)'}
                        </label>
                        <input
                            type="date"
                            value={deadline}
                            onChange={e => setDeadline(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100 font-bold"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Icon</label>
                            <div className="grid grid-cols-4 gap-2">
                                {icons.map(i => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setIcon(i)}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${icon === i ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-inner scale-110' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">{i}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Color</label>
                            <div className="grid grid-cols-4 gap-2">
                                {colors.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${c} ${color === c ? 'ring-4 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-slate-300 dark:ring-slate-600 scale-90' : 'opacity-80 hover:opacity-100'}`}
                                    ></button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg mt-6 active:scale-[0.98] transition-transform"
                    >
                        {goalToEdit ? (language === 'id' ? 'Simpan Perubahan' : 'Save Changes') : (language === 'id' ? 'Buat Impian' : 'Create Goal')}
                    </button>
                </form>
            </div>
        </div>
    );
}
