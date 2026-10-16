import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { DynamicIcon } from '../common/DynamicIcon';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Sliders,
  Sparkles,
  ArrowRight,
  TrendingDown,
  X,
  Check,
} from 'lucide-react';
import { Budget } from '../../types';

export const BudgetsView: React.FC = () => {
  const {
    budgets,
    setBudget,
    deleteBudget,
    categories,
    categorySpendBreakdown,
    currentMonthExpenses,
    settings,
    addToast,
  } = useFinance();

  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || '');
  const [budgetLimit, setBudgetLimit] = useState<string>('');
  const [rollover, setRollover] = useState(false);

  // What-if simulator state
  const [simulateCategory, setSimulateCategory] = useState<string>(
    categorySpendBreakdown[0]?.categoryId || ''
  );
  const [cutPercentage, setCutPercentage] = useState<number>(20);

  const totalMonthlyBudget = useMemo(() => {
    return budgets.reduce((sum, b) => sum + b.amount, 0);
  }, [budgets]);

  const totalBudgetSpent = useMemo(() => {
    return categorySpendBreakdown
      .filter((c) => c.budgetAmount)
      .reduce((sum, c) => sum + c.total, 0);
  }, [categorySpendBreakdown]);

  const overallUtilization = totalMonthlyBudget > 0
    ? Math.round((totalBudgetSpent / totalMonthlyBudget) * 100)
    : 0;

  // What-if simulation calculations
  const targetCategorySpend = useMemo(() => {
    const found = categorySpendBreakdown.find((c) => c.categoryId === simulateCategory);
    return found ? found.total : 0;
  }, [categorySpendBreakdown, simulateCategory]);

  const simulatedMonthlySavings = Math.round(targetCategorySpend * (cutPercentage / 100));
  const simulatedAnnualSavings = simulatedMonthlySavings * 12;

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(budgetLimit);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid budget amount');
      return;
    }

    setBudget({
      categoryId: selectedCatId,
      amount,
      period: 'monthly',
      month: '2026-10',
      rollover,
    });

    setIsAddBudgetModalOpen(false);
    setBudgetLimit('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              SMART BUDGET ENGINE
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {budgets.length} Monitored Sectors
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white mt-1">
            Category Spending Limits & Governance
          </h2>
        </div>

        <button
          onClick={() => setIsAddBudgetModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Configure Budget Limit</span>
        </button>
      </div>

      {/* Aggregate Budget Capacity Banner */}
      <div className="rounded-2xl glass-card p-6 border border-white/[0.08] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-slate-400">
              OCTOBER AGGREGATE BUDGET CAPACITY
            </span>
            <div className="flex items-baseline gap-3">
              <h3 className="text-3xl font-extrabold font-display font-mono-numbers text-white">
                {formatCurrency(totalBudgetSpent, settings.currency)}
              </h3>
              <span className="text-slate-400 text-sm font-mono-numbers">
                / {formatCurrency(totalMonthlyBudget, settings.currency)}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Overall budget utilization is at{' '}
              <span
                className={`font-semibold ${
                  overallUtilization > 85 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {overallUtilization}%
              </span>
              . Remaining buffer:{' '}
              <span className="text-cyan-300 font-mono-numbers font-semibold">
                {formatCurrency(Math.max(0, totalMonthlyBudget - totalBudgetSpent), settings.currency)}
              </span>
            </p>
          </div>

          {/* Large Progress Gauge */}
          <div className="w-full md:w-72 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Governance Gauge</span>
              <span
                className={`font-bold ${
                  overallUtilization > 100
                    ? 'text-rose-400'
                    : overallUtilization > 85
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {overallUtilization}%
              </span>
            </div>
            <div className="h-3 rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  overallUtilization > 100
                    ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]'
                    : overallUtilization > 85
                    ? 'bg-amber-400 shadow-[0_0_12px_#fbbf24]'
                    : 'bg-gradient-to-r from-cyan-500 to-emerald-400 shadow-[0_0_12px_#22d3ee]'
                }`}
                style={{ width: `${Math.min(100, overallUtilization)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0% Normal</span>
              <span>70% Caution</span>
              <span>85% Critical</span>
              <span>100% Breached</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((b) => {
          const breakdown = categorySpendBreakdown.find((c) => c.categoryId === b.categoryId);
          const cat = categories.find((c) => c.id === b.categoryId) || {
            id: b.categoryId,
            name: 'Uncategorized',
            color: '#38bdf8',
            icon: 'Tag',
          };

          const spent = breakdown?.total || 0;
          const remaining = b.amount - spent;
          const pct = Math.round((spent / b.amount) * 100);

          const isOver = pct > 100;
          const isCritical = pct > 85 && !isOver;
          const isWarning = pct >= 70 && pct <= 85;

          return (
            <div
              key={b.id}
              className={`p-5 rounded-2xl glass-card border transition-all duration-300 hover:-translate-y-1 ${
                isOver
                  ? 'border-rose-500/50 bg-rose-950/10'
                  : isCritical
                  ? 'border-amber-500/40 bg-amber-950/10'
                  : 'border-white/[0.08] hover:border-cyan-500/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="p-2 rounded-xl"
                    style={{
                      backgroundColor: `${cat.color}25`,
                      color: cat.color,
                    }}
                  >
                    <DynamicIcon name={cat.icon} className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">{cat.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      {b.rollover ? 'Auto-Rollover Active' : 'Fixed Monthly'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteBudget(b.id)}
                  title="Remove budget limit"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Amounts & Gauge */}
              <div className="space-y-2 mt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Spent / Limit</span>
                  <span className="font-mono-numbers text-sm font-bold text-white">
                    {formatCurrency(spent, settings.currency)} /{' '}
                    <span className="text-slate-400">{formatCurrency(b.amount, settings.currency)}</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver
                        ? 'bg-rose-500'
                        : isCritical
                        ? 'bg-amber-400'
                        : isWarning
                        ? 'bg-yellow-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span
                    className={`font-semibold font-mono text-[11px] ${
                      isOver
                        ? 'text-rose-400'
                        : isCritical
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {isOver ? `Over by ${formatCurrency(Math.abs(remaining), settings.currency)}` : `Buffer: ${formatCurrency(remaining, settings.currency)}`}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isOver
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : isCritical
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : isWarning
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {pct}% Spent
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive What-If Simulation Sandbox */}
      <div className="rounded-2xl glass-card p-6 border border-violet-500/30 shadow-xl bg-gradient-to-br from-violet-950/20 to-slate-900/60">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/40">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-mono font-semibold uppercase text-violet-400">
              SIMULATION LAB
            </span>
            <h3 className="text-base font-bold text-white">
              Interactive &quot;What-If&quot; Outflow Compression
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-300 max-w-2xl mb-4">
          Test hypothetical budget cuts across actual historical categories to calculate capital
          unlocked for savings goals or investment deployment.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Controls */}
          <div className="md:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  TARGET EXPENDITURE CATEGORY
                </label>
                <select
                  value={simulateCategory}
                  onChange={(e) => setSimulateCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-violet-400"
                >
                  {categorySpendBreakdown.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.categoryName} ({formatCurrency(c.total, settings.currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">REDUCTION TARGET</span>
                  <span className="text-violet-400 font-bold">{cutPercentage}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={cutPercentage}
                  onChange={(e) => setCutPercentage(parseInt(e.target.value))}
                  className="w-full accent-violet-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Simulated Impact Display Card */}
          <div className="md:col-span-5 p-4 rounded-xl bg-slate-900/80 border border-violet-500/30 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                PROJECTED CAPITAL RECAPTURE
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono-numbers text-emerald-400">
                  +{formatCurrency(simulatedMonthlySavings, settings.currency)}
                </span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Yields{' '}
                <span className="text-cyan-300 font-mono-numbers font-semibold">
                  +{formatCurrency(simulatedAnnualSavings, settings.currency)}
                </span>{' '}
                annually toward your wealth vaults.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Configure Budget Limit Modal */}
      {isAddBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsAddBudgetModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl glass-panel border border-cyan-500/30 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white">Configure Category Budget</h3>
              <button
                onClick={() => setIsAddBudgetModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">CATEGORY</label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] text-xs text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  MONTHLY CAP ({settings.currency.symbol})
                </label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] text-white font-mono-numbers font-bold"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rollover"
                  checked={rollover}
                  onChange={(e) => setRollover(e.target.checked)}
                  className="rounded bg-slate-900 border-white/[0.2] accent-cyan-400"
                />
                <label htmlFor="rollover" className="text-xs text-slate-300">
                  Allow surplus rollover into next billing period
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsAddBudgetModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
                >
                  Save Budget Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
