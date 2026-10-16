import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DynamicIcon } from '../common/DynamicIcon';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  ArrowRight,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Tag,
} from 'lucide-react';
import { Transaction } from '../../types';

export const RecentActivity: React.FC = () => {
  const {
    transactions,
    categories,
    settings,
    setActiveTab,
    setInspectingTransaction,
    setEditingTransaction,
    duplicateTransaction,
    deleteTransaction,
  } = useFinance();

  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const catMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  // Filter and sort transactions
  const displayTransactions = useMemo(() => {
    let list = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (filterType !== 'all') {
      list = list.filter((t) => t.type === filterType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.merchant && t.merchant.toLowerCase().includes(q)) ||
          (t.notes && t.notes.toLowerCase().includes(q))
      );
    }

    return list.slice(0, 7); // Show top 7 recent in dashboard
  }, [transactions, filterType, searchQuery]);

  return (
    <div className="rounded-2xl glass-card p-5 border border-white/[0.08] mt-6">
      {/* Header with Title and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              LEDGER STREAM
            </span>
            <span className="text-xs text-slate-500 font-mono">({transactions.length} total)</span>
          </div>
          <h4 className="text-lg font-bold text-white font-display mt-0.5">
            Recent Financial Activity
          </h4>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter ledger..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-36 sm:w-48"
            />
          </div>

          {/* Type filters */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-white/[0.08]">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === 'expense'
                  ? 'bg-rose-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Outflow
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === 'income'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Inflow
            </button>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="mt-3 divide-y divide-white/[0.04]">
        {displayTransactions.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No transactions match the selected filter criteria.
          </div>
        ) : (
          displayTransactions.map((t) => {
            const isIncome = t.type === 'income';
            const cat = catMap.get(t.category);

            return (
              <div
                key={t.id}
                onClick={() => setInspectingTransaction(t)}
                className="group flex items-center justify-between py-3 px-2 rounded-xl hover:bg-white/[0.02] cursor-pointer transition-all"
              >
                {/* Left: Category Icon + Title + Meta */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="p-2.5 rounded-xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: `${cat?.color || '#38bdf8'}20`,
                      color: cat?.color || '#38bdf8',
                    }}
                  >
                    <DynamicIcon name={cat?.icon || 'Tag'} className="w-4 h-4" />
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                        {t.title}
                      </p>
                      {t.merchant && (
                        <span className="hidden md:inline px-1.5 py-0.2 rounded text-[10px] font-medium bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                          {t.merchant}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-mono">
                      <span>{formatDate(t.date, 'relative')}</span>
                      <span>•</span>
                      <span className="text-slate-500">{cat?.name || 'Uncategorized'}</span>
                      <span className="hidden sm:inline text-slate-600">•</span>
                      <span className="hidden sm:inline text-slate-500">{t.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount + Hover quick action buttons */}
                <div className="flex items-center gap-4 shrink-0 pl-3">
                  <div className="text-right">
                    <p
                      className={`text-sm sm:text-base font-bold font-mono-numbers ${
                        isIncome ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(t.amount, settings.currency)}
                    </p>
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider block ${
                        isIncome ? 'text-emerald-500/80' : 'text-rose-500/80'
                      }`}
                    >
                      {t.type}
                    </span>
                  </div>

                  {/* Inline Action Controls on Hover */}
                  <div
                    className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => duplicateTransaction(t.id)}
                      title="Duplicate"
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingTransaction(t)}
                      title="Edit"
                      className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      title="Delete"
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer view all */}
      <div className="pt-4 mt-2 border-t border-white/[0.06] flex items-center justify-between">
        <span className="text-xs text-slate-500 font-mono">
          Showing latest records
        </span>
        <button
          onClick={() => setActiveTab('transactions')}
          className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <span>Open Full Transaction Terminal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
