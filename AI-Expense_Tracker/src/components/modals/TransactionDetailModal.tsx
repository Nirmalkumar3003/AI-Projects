import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DynamicIcon } from '../common/DynamicIcon';
import {
  X,
  Calendar,
  CreditCard,
  Store,
  Tag,
  FileText,
  Copy,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

export const TransactionDetailModal: React.FC = () => {
  const {
    inspectingTransaction,
    setInspectingTransaction,
    setEditingTransaction,
    duplicateTransaction,
    deleteTransaction,
    categories,
    settings,
  } = useFinance();

  if (!inspectingTransaction) return null;

  const t = inspectingTransaction;
  const isIncome = t.type === 'income';
  const categoryObj = categories.find((c) => c.id === t.category);

  const handleEdit = () => {
    setEditingTransaction(t);
    setInspectingTransaction(null);
  };

  const handleDuplicate = () => {
    duplicateTransaction(t.id);
    setInspectingTransaction(null);
  };

  const handleDelete = () => {
    deleteTransaction(t.id);
    setInspectingTransaction(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => setInspectingTransaction(null)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-2xl glass-panel border border-cyan-500/30 shadow-2xl shadow-cyan-950/60 p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Top actions & close */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            TRANSACTION TELEMETRY
          </span>
          <button
            onClick={() => setInspectingTransaction(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Amount & Title */}
        <div className="py-6 text-center">
          <div
            className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 shadow-xl ${
              isIncome
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shadow-emerald-950/40'
                : 'bg-rose-500/15 border border-rose-500/40 text-rose-400 shadow-rose-950/40'
            }`}
          >
            {isIncome ? <ArrowDownLeft className="w-7 h-7" /> : <ArrowUpRight className="w-7 h-7" />}
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white font-mono-numbers">
            {isIncome ? '+' : '-'}
            {formatCurrency(t.amount, settings.currency)}
          </h2>
          <p className="text-base font-semibold text-slate-200 mt-1">{t.title}</p>
          <span
            className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
              isIncome
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {t.type}
          </span>
        </div>

        {/* Key-Value Details */}
        <div className="space-y-3 py-3 border-y border-white/[0.08] text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Date Recorded</span>
            </span>
            <span className="text-white font-mono">{formatDate(t.date, 'full')}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              <span>Category</span>
            </span>
            <span className="flex items-center gap-1.5 text-white font-medium">
              {categoryObj && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: categoryObj.color }}
                />
              )}
              {categoryObj?.name || t.category}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
              <span>Payment Method</span>
            </span>
            <span className="text-white font-mono">{t.paymentMethod}</span>
          </div>

          {t.merchant && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-cyan-400" />
                <span>Merchant / Payee</span>
              </span>
              <span className="text-white font-medium">{t.merchant}</span>
            </div>
          )}

          {t.tags && t.tags.length > 0 && (
            <div className="pt-1">
              <span className="text-slate-400 block mb-1.5">Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {t.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300 font-mono text-[11px] border border-white/[0.08]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {t.notes && (
            <div className="pt-1">
              <span className="text-slate-400 flex items-center gap-1 mb-1">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Notes</span>
              </span>
              <p className="p-2.5 rounded-xl bg-slate-900/60 text-slate-300 border border-white/[0.06] leading-relaxed">
                {t.notes}
              </p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-4 grid grid-cols-3 gap-2">
          <button
            onClick={handleDuplicate}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate</span>
          </button>

          <button
            onClick={handleEdit}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
