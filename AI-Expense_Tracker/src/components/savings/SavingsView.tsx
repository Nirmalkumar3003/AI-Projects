import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { calculateGoalPace } from '../../utils/calculations';
import { DynamicIcon } from '../common/DynamicIcon';
import { SavingsContributionModal } from '../modals/SavingsContributionModal';
import {
  Target,
  Plus,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  CheckCircle2,
  X,
  Clock,
  Zap,
} from 'lucide-react';
import { SavingsGoal } from '../../types';

export const SavingsView: React.FC = () => {
  const {
    savingsGoals,
    addSavingsGoal,
    deleteSavingsGoal,
    settings,
  } = useFinance();

  const [activeContributionGoal, setActiveContributionGoal] = useState<SavingsGoal | null>(null);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);

  // New goal form state
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2027-04-01');
  const [color, setColor] = useState('#06b6d4');
  const [icon, setIcon] = useState('ShieldCheck');
  const [notes, setNotes] = useState('');

  const totalTargetVaults = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrentReserves = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalCompletedGoals = savingsGoals.filter((g) => g.currentAmount >= g.targetAmount).length;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const initial = initialAmount ? parseFloat(initialAmount) : 0;

    if (isNaN(target) || target <= 0) {
      alert('Please enter a valid target amount');
      return;
    }

    addSavingsGoal({
      name: name.trim(),
      targetAmount: target,
      initialAmount: initial,
      targetDate,
      category: 'cat-investments',
      color,
      icon,
      notes: notes.trim() || undefined,
    });

    setIsAddGoalModalOpen(false);
    setName('');
    setTargetAmount('');
    setInitialAmount('');
    setNotes('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              WEALTH ACCUMULATION VAULTS
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {savingsGoals.length} Active Targets
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white mt-1">
            Savings Goals & Milestone Reserves
          </h2>
        </div>

        <button
          onClick={() => setIsAddGoalModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Initialize New Vault</span>
        </button>
      </div>

      {/* Aggregate Vaults Overview Banner */}
      <div className="rounded-2xl glass-card p-6 border border-white/[0.08] grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs font-mono text-slate-400 uppercase">Total Liquid Reserves</span>
          <p className="text-2xl font-extrabold font-display font-mono-numbers text-cyan-400 mt-1">
            {formatCurrency(totalCurrentReserves, settings.currency)}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Across all registered vault targets</p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs font-mono text-slate-400 uppercase">Target Horizon Capital</span>
          <p className="text-2xl font-extrabold font-display font-mono-numbers text-white mt-1">
            {formatCurrency(totalTargetVaults, settings.currency)}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {totalTargetVaults > 0
              ? `${Math.round((totalCurrentReserves / totalTargetVaults) * 100)}% overall funded`
              : '0% funded'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs font-mono text-slate-400 uppercase">Completed Milestones</span>
          <p className="text-2xl font-extrabold font-display font-mono-numbers text-emerald-400 mt-1">
            {totalCompletedGoals} / {savingsGoals.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Goals fully funded and locked</p>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {savingsGoals.map((goal) => {
          const pace = calculateGoalPace(goal);

          return (
            <div
              key={goal.id}
              className="p-6 rounded-2xl glass-card border border-white/[0.08] hover:border-cyan-500/40 transition-all duration-300 relative overflow-hidden group"
            >
              {/* Radial glow background */}
              <div
                className="absolute -right-12 -top-12 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity"
                style={{ backgroundColor: goal.color }}
              />

              <div className="relative z-10 space-y-4">
                {/* Card Top: Icon + Name + Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-3 rounded-2xl shrink-0"
                      style={{
                        backgroundColor: `${goal.color}20`,
                        color: goal.color,
                        border: `1px solid ${goal.color}40`,
                      }}
                    >
                      <DynamicIcon name={goal.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight">{goal.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Target: {formatDate(goal.targetDate, 'medium')}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteSavingsGoal(goal.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-400">Current Accumulation</span>
                    <div className="text-right">
                      <span className="text-lg font-bold font-mono-numbers text-white">
                        {formatCurrency(goal.currentAmount, settings.currency)}
                      </span>
                      <span className="text-xs text-slate-400 font-mono-numbers ml-1">
                        / {formatCurrency(goal.targetAmount, settings.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Ring / Bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden shadow-inner">
                    <div
                      className="h-full rounded-full transition-all duration-700 shadow-[0_0_12px]"
                      style={{
                        width: `${pace.progressPercent}%`,
                        backgroundColor: goal.color,
                        boxShadow: `0 0 10px ${goal.color}`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs pt-0.5">
                    <span className="text-slate-400 font-mono">
                      {pace.isCompleted
                        ? '🎉 100% Target Attained!'
                        : `${formatCurrency(pace.remaining, settings.currency)} remaining`}
                    </span>
                    <span
                      className="font-mono font-bold px-2 py-0.5 rounded-full text-[11px]"
                      style={{
                        backgroundColor: `${goal.color}20`,
                        color: goal.color,
                      }}
                    >
                      {pace.progressPercent}%
                    </span>
                  </div>
                </div>

                {/* Pace Metric */}
                {!pace.isCompleted && (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Required Monthly Cadence:</span>
                    </div>
                    <span className="font-mono-numbers font-bold text-cyan-300">
                      {formatCurrency(pace.monthlyPace, settings.currency)} / mo
                    </span>
                  </div>
                )}

                {goal.notes && (
                  <p className="text-xs text-slate-400 line-clamp-2 italic leading-relaxed">
                    &quot;{goal.notes}&quot;
                  </p>
                )}

                {/* Actions: Deposit / Withdraw button */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/[0.06]">
                  <button
                    onClick={() => setActiveContributionGoal(goal)}
                    className="w-full py-2 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors group-hover:border-cyan-500/40"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Adjust Reserves (Deposit / Withdraw)</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Adjust Contribution Modal */}
      {activeContributionGoal && (
        <SavingsContributionModal
          goal={activeContributionGoal}
          onClose={() => setActiveContributionGoal(null)}
        />
      )}

      {/* Add New Goal Modal */}
      {isAddGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsAddGoalModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl glass-panel border border-cyan-500/30 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white">Initialize Savings Vault</h3>
              <button
                onClick={() => setIsAddGoalModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">VAULT TARGET NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Cyber EV Roadster / Emergency Runway"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] text-white text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">
                    TARGET AMOUNT ({settings.currency.symbol})
                  </label>
                  <input
                    type="number"
                    placeholder="250000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] text-white font-mono-numbers font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">
                    SEED DEPOSIT (OPTIONAL)
                  </label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] text-white font-mono-numbers"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">TARGET DATE</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">ACCENT COLOR</label>
                  <div className="flex items-center gap-2 mt-1">
                    {['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          color === c ? 'scale-125 border-white' : 'border-transparent opacity-60'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">OBJECTIVE MEMO</label>
                <input
                  type="text"
                  placeholder="Rationale and timeline considerations"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsAddGoalModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
                >
                  Initialize Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
