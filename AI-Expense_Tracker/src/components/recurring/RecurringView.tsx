import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DynamicIcon } from '../common/DynamicIcon';
import {
  Repeat,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Trash2,
  CreditCard,
  Tv,
  Clock,
  X,
  Zap,
} from 'lucide-react';
import { RecurringTransaction, RecurrenceFrequency, PaymentMethod } from '../../types';

export const RecurringView: React.FC = () => {
  const {
    recurring,
    recurringTotals,
    addRecurring,
    toggleRecurringStatus,
    deleteRecurring,
    categories,
    settings,
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState(categories[0]?.id || '');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');
  const [nextDueDate, setNextDueDate] = useState('2026-11-01');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [merchant, setMerchant] = useState('');
  const [isSubscription, setIsSubscription] = useState(true);
  const [notes, setNotes] = useState('');

  const catMap = new Map(categories.map((c) => [c.id, c]));

  // Sort upcoming schedules by next due date
  const sortedRecurring = [...recurring].sort(
    (a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    addRecurring({
      title: title.trim(),
      amount: numAmount,
      type,
      category,
      frequency,
      nextDueDate,
      paymentMethod,
      merchant: merchant.trim() || undefined,
      isSubscription,
      isActive: true,
      notes: notes.trim() || undefined,
    });

    setIsAddModalOpen(false);
    setTitle('');
    setAmount('');
    setMerchant('');
    setNotes('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              RECURRING MANDATES & CONTRACTS
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {recurring.length} Schedules
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white mt-1">
            Subscriptions & Recurring Cash-Flow
          </h2>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register Schedule</span>
        </button>
      </div>

      {/* Burn Rate Analytics Banner */}
      <div className="rounded-2xl glass-card p-6 border border-white/[0.08] grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs font-mono text-slate-400 uppercase">
            Monthly Subscription Burn
          </span>
          <p className="text-2xl font-extrabold font-display font-mono-numbers text-rose-400 mt-1">
            {formatCurrency(recurringTotals.subscriptions, settings.currency)}
            <span className="text-xs text-slate-400 font-normal"> / mo</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Automated SaaS & media subscriptions</p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs font-mono text-slate-400 uppercase">
            Total Fixed Monthly Obligations
          </span>
          <p className="text-2xl font-extrabold font-display font-mono-numbers text-white mt-1">
            {formatCurrency(recurringTotals.expense, settings.currency)}
            <span className="text-xs text-slate-400 font-normal"> / mo</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Includes rent, utilities, and memberships</p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs font-mono text-slate-400 uppercase">
            Automated Inflow Schedules
          </span>
          <p className="text-2xl font-extrabold font-display font-mono-numbers text-emerald-400 mt-1">
            {formatCurrency(recurringTotals.income, settings.currency)}
            <span className="text-xs text-slate-400 font-normal"> / mo</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Recurring salary and advisory retainers</p>
        </div>
      </div>

      {/* Recurring Schedules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedRecurring.map((item) => {
          const cat = catMap.get(item.category);
          const isExpense = item.type === 'expense';

          // Calculate countdown to due date
          const now = new Date();
          const due = new Date(item.nextDueDate);
          const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl glass-card border transition-all duration-300 relative overflow-hidden group ${
                !item.isActive
                  ? 'opacity-60 border-white/[0.04]'
                  : 'border-white/[0.08] hover:border-cyan-500/40 hover:-translate-y-1'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="p-2.5 rounded-xl shrink-0"
                    style={{
                      backgroundColor: `${cat?.color || '#38bdf8'}20`,
                      color: cat?.color || '#38bdf8',
                    }}
                  >
                    <DynamicIcon name={cat?.icon || 'Tag'} className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">{item.title}</h4>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {item.frequency} • {item.paymentMethod}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleRecurringStatus(item.id)}
                    title={item.isActive ? 'Pause Schedule' : 'Resume Schedule'}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/[0.06] transition-colors"
                  >
                    {item.isActive ? (
                      <PauseCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <PlayCircle className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteRecurring(item.id)}
                    title="Remove Schedule"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Amount & Due Date */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Amount</span>
                  <p
                    className={`text-lg font-bold font-mono-numbers ${
                      isExpense ? 'text-white' : 'text-emerald-400'
                    }`}
                  >
                    {isExpense ? '-' : '+'}
                    {formatCurrency(item.amount, settings.currency)}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Next Due</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      diffDays <= 3
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                        : diffDays <= 7
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-white/[0.04] text-slate-300 border border-white/[0.06]'
                    }`}
                  >
                    {diffDays === 0
                      ? 'Due Today'
                      : diffDays === 1
                      ? 'Due Tomorrow'
                      : `In ${diffDays} days (${item.nextDueDate.substring(5)})`}
                  </span>
                </div>
              </div>

              {item.notes && (
                <p className="mt-3 text-[11px] text-slate-400 italic truncate border-t border-white/[0.04] pt-2">
                  {item.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Recurring Schedule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl glass-panel border border-cyan-500/30 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white">Register Recurring Schedule</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900/60 border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-1.5 rounded-lg font-semibold ${
                    type === 'expense' ? 'bg-rose-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  Recurring Outflow
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-1.5 rounded-lg font-semibold ${
                    type === 'income' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  Recurring Inflow
                </button>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">SCHEDULE TITLE</label>
                <input
                  type="text"
                  placeholder="e.g. Netflix 4K / Core Salary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] text-white text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">
                    AMOUNT ({settings.currency.symbol})
                  </label>
                  <input
                    type="number"
                    placeholder="1500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] text-white font-mono-numbers font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">FREQUENCY</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">NEXT DUE DATE</label>
                  <input
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">PAYMENT METHOD</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] text-white"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">CATEGORY</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="subCheckbox"
                  checked={isSubscription}
                  onChange={(e) => setIsSubscription(e.target.checked)}
                  className="rounded bg-slate-900 border-white/[0.2] accent-cyan-400"
                />
                <label htmlFor="subCheckbox" className="text-slate-300">
                  Track in Monthly Subscription Burn Rate
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
                >
                  Register Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
