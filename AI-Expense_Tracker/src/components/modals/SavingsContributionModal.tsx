import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { X, ArrowDownRight, ArrowUpRight, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SavingsContributionModalProps {
  goal: SavingsGoal | null;
  onClose: () => void;
}

export const SavingsContributionModal: React.FC<SavingsContributionModalProps> = ({ goal, onClose }) => {
  const { addGoalContribution, settings } = useFinance();
  const [type, setType] = useState<'contribution' | 'withdrawal'>('contribution');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (type === 'withdrawal' && numAmount > goal.currentAmount) {
      setError(`Cannot withdraw more than current balance (${settings.currency.symbol}${goal.currentAmount.toLocaleString()})`);
      return;
    }

    addGoalContribution(goal.id, numAmount, type, note.trim() || undefined);

    // If goal was reached with this contribution, fire confetti!
    if (type === 'contribution' && goal.currentAmount + numAmount >= goal.targetAmount) {
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'],
        });
      } catch (e) {
        // Safe fallback
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-2xl glass-panel border border-cyan-500/30 shadow-2xl shadow-cyan-950/60 p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <h3 className="text-base font-bold text-white">Adjust Vault Reserves</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-3 p-3 rounded-xl bg-slate-900/60 border border-white/[0.06]">
          <p className="text-xs text-slate-400">Vault Target:</p>
          <p className="text-sm font-bold text-white">{goal.name}</p>
          <div className="flex items-center justify-between mt-1 text-xs">
            <span className="text-slate-400">Current Balance:</span>
            <span className="font-mono-numbers text-cyan-400 font-semibold">
              {formatCurrency(goal.currentAmount, settings.currency)} / {formatCurrency(goal.targetAmount, settings.currency)}
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900/60 border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setType('contribution')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                type === 'contribution'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Deposit</span>
            </button>
            <button
              type="button"
              onClick={() => setType('withdrawal')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                type === 'withdrawal'
                  ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              AMOUNT ({settings.currency.symbol})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-cyan-400 font-bold">
                {settings.currency.symbol}
              </span>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] focus:border-cyan-400 focus:outline-none text-white font-mono-numbers font-semibold text-lg"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              NOTE / REASON (OPTIONAL)
            </label>
            <input
              type="text"
              placeholder="e.g. October savings allocation, Freelance bonus"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] focus:border-cyan-400 focus:outline-none text-white text-xs"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Confirm {type === 'contribution' ? 'Deposit' : 'Withdrawal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
