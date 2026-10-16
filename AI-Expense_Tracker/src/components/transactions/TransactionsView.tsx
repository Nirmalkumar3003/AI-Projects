import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DynamicIcon } from '../common/DynamicIcon';
import { exportToCSV } from '../../utils/calculations';
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  ArrowUpDown,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Eye,
  Tag,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  X,
} from 'lucide-react';
import { Transaction, PaymentMethod } from '../../types';

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    categories,
    settings,
    setIsQuickAddOpen,
    setIsCsvImportOpen,
    setEditingTransaction,
    setInspectingTransaction,
    duplicateTransaction,
    deleteTransaction,
    addToast,
  } = useFinance();

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const catMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
        if (selectedMethod !== 'all' && t.paymentMethod !== selectedMethod) return false;
        if (startDate && t.date < startDate) return false;
        if (endDate && t.date > endDate) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchMerchant = t.merchant && t.merchant.toLowerCase().includes(q);
          const matchNotes = t.notes && t.notes.toLowerCase().includes(q);
          const matchTags = t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q));
          const matchAmount = t.amount.toString().includes(q);
          if (!matchTitle && !matchMerchant && !matchNotes && !matchTags && !matchAmount) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [
    transactions,
    typeFilter,
    selectedCategory,
    selectedMethod,
    startDate,
    endDate,
    searchQuery,
    sortBy,
  ]);

  const handleExportCSV = () => {
    const csvData = exportToCSV(filteredTransactions, categories);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora-filtered-transactions-${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({
      type: 'success',
      title: 'CSV Export Initiated',
      message: `Exported ${filteredTransactions.length} records.`,
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setSelectedCategory('all');
    setSelectedMethod('all');
    setStartDate('');
    setEndDate('');
    setSortBy('date-desc');
  };

  const activeFilterCount =
    (typeFilter !== 'all' ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedMethod !== 'all' ? 1 : 0) +
    (startDate ? 1 : 0) +
    (endDate ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              LEDGER AUDIT TERMINAL
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {filteredTransactions.length} of {transactions.length} Records
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white mt-1">
            Transaction Operations
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCsvImportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-colors"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl glass-card border border-white/[0.08] space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, merchant, amount, tags, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Type selector */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-white/[0.08]">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  typeFilter === 'all'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter('expense')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  typeFilter === 'expense'
                    ? 'bg-rose-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Expense
              </button>
              <button
                onClick={() => setTypeFilter('income')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  typeFilter === 'income'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Income
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                showAdvancedFilters || activeFilterCount > 0
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                  : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                title="Reset all filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Expandable Advanced Filter Panel */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in text-xs">
            {/* Category Filter */}
            <div>
              <label className="block text-slate-400 font-mono mb-1">CATEGORY</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="block text-slate-400 font-mono mb-1">PAYMENT METHOD</label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Methods</option>
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Cash">Cash</option>
                <option value="Crypto">Crypto</option>
              </select>
            </div>

            {/* Date Range Filters */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 font-mono mb-1">FROM</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-mono mb-1">TO</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Responsive Table View */}
      <div className="hidden md:block rounded-2xl glass-card border border-white/[0.08] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/[0.03] text-slate-400 font-mono border-b border-white/[0.08]">
            <tr>
              <th className="p-3.5 pl-5">Date</th>
              <th className="p-3.5">Title & Merchant</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Method</th>
              <th className="p-3.5 text-right">Amount</th>
              <th className="p-3.5 pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-slate-500">
                  <div className="max-w-sm mx-auto space-y-2">
                    <Layers className="w-8 h-8 mx-auto opacity-40 text-cyan-400" />
                    <p className="font-semibold text-white">No Matching Transactions</p>
                    <p className="text-xs text-slate-400">
                      Try clearing or loosening active search and filter constraints.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.06] text-slate-300 hover:text-white text-xs mt-2"
                    >
                      Reset Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((t) => {
                const isIncome = t.type === 'income';
                const cat = catMap.get(t.category);

                return (
                  <tr
                    key={t.id}
                    onClick={() => setInspectingTransaction(t)}
                    className="hover:bg-white/[0.02] cursor-pointer group transition-colors"
                  >
                    {/* Date */}
                    <td className="p-3.5 pl-5 font-mono text-slate-400 whitespace-nowrap">
                      {formatDate(t.date, 'short')}
                    </td>

                    {/* Title + Merchant */}
                    <td className="p-3.5 max-w-xs truncate">
                      <p className="font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                        {t.title}
                      </p>
                      {t.merchant && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{t.merchant}</p>
                      )}
                    </td>

                    {/* Category */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] text-slate-300 border border-white/[0.06] font-medium">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: cat?.color || '#38bdf8' }}
                        />
                        {cat?.name || 'Uncategorized'}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="p-3.5 text-slate-400 font-mono whitespace-nowrap">
                      {t.paymentMethod}
                    </td>

                    {/* Amount */}
                    <td className="p-3.5 text-right font-mono-numbers whitespace-nowrap">
                      <span
                        className={`font-bold text-sm ${
                          isIncome ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(t.amount, settings.currency)}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td
                      className="p-3.5 pr-5 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => duplicateTransaction(t.id)}
                          title="Duplicate"
                          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingTransaction(t)}
                          title="Edit"
                          className="p-1.5 rounded-lg hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTransaction(t.id)}
                          title="Delete"
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card List View */}
      <div className="md:hidden space-y-2.5">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 glass-card rounded-2xl text-xs">
            No matching transactions found.
          </div>
        ) : (
          filteredTransactions.map((t) => {
            const isIncome = t.type === 'income';
            const cat = catMap.get(t.category);

            return (
              <div
                key={t.id}
                onClick={() => setInspectingTransaction(t)}
                className="p-4 rounded-xl glass-card border border-white/[0.08] hover:border-cyan-500/40 cursor-pointer space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="p-2 rounded-lg shrink-0"
                      style={{
                        backgroundColor: `${cat?.color || '#38bdf8'}20`,
                        color: cat?.color || '#38bdf8',
                      }}
                    >
                      <DynamicIcon name={cat?.icon || 'Tag'} className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-white text-sm truncate">{t.title}</p>
                      <p className="text-xs text-slate-400">{cat?.name || 'General'}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`font-bold font-mono-numbers text-sm ${
                        isIncome ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(t.amount, settings.currency)}
                    </p>
                    <span className="text-[10px] font-mono text-slate-500">{t.date}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-xs">
                  <span className="text-slate-400 font-mono">{t.paymentMethod}</span>
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => duplicateTransaction(t.id)}
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingTransaction(t)}
                      className="p-1 rounded text-cyan-400"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      className="p-1 rounded text-rose-400"
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
    </div>
  );
};
