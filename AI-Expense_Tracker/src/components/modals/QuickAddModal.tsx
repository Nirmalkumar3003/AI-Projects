import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { TransactionType, PaymentMethod } from '../../types';
import { DynamicIcon } from '../common/DynamicIcon';
import { X, Plus, Sparkles, Tag, Check, Calendar, CreditCard, Store, FileText } from 'lucide-react';

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash',
  'Crypto',
];

export const QuickAddModal: React.FC = () => {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    editingTransaction,
    setEditingTransaction,
    addTransaction,
    updateTransaction,
    categories,
    settings,
  } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('cat-food');
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [merchant, setMerchant] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [error, setError] = useState<string>('');

  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setTitle(editingTransaction.title);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date.substring(0, 10));
      setPaymentMethod(editingTransaction.paymentMethod);
      setMerchant(editingTransaction.merchant || '');
      setNotes(editingTransaction.notes || '');
      setTagsInput(editingTransaction.tags?.join(', ') || '');
      setError('');
    } else {
      setType('expense');
      setAmount('');
      setTitle('');
      setCategory('cat-food');
      setDate(new Date().toISOString().substring(0, 10));
      setPaymentMethod('UPI');
      setMerchant('');
      setNotes('');
      setTagsInput('');
      setError('');
    }

    if (isQuickAddOpen || editingTransaction) {
      setTimeout(() => amountInputRef.current?.focus(), 80);
    }
  }, [isQuickAddOpen, editingTransaction]);

  const isOpen = isQuickAddOpen || Boolean(editingTransaction);

  const handleClose = () => {
    setIsQuickAddOpen(false);
    setEditingTransaction(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please provide a valid transaction amount greater than 0');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a description / title for this transaction');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    if (editingTransaction) {
      updateTransaction({
        ...editingTransaction,
        type,
        amount: numAmount,
        title: title.trim(),
        category,
        date,
        paymentMethod,
        merchant: merchant.trim() || undefined,
        notes: notes.trim() || undefined,
        tags,
      });
    } else {
      addTransaction({
        type,
        amount: numAmount,
        title: title.trim(),
        category,
        date,
        paymentMethod,
        merchant: merchant.trim() || undefined,
        notes: notes.trim() || undefined,
        tags,
      });
    }

    handleClose();
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter(
    (c) => c.type === 'both' || c.type === type
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl glass-panel border border-cyan-500/30 shadow-2xl shadow-cyan-950/60 p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
              </h3>
              <p className="text-xs text-slate-400">
                {editingTransaction
                  ? 'Update transaction parameters and reconcile ledger'
                  : 'Fast-log income or expense with automated telemetry'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Transaction Type Segmented Toggle */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900/60 border border-white/[0.08]">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (category === 'cat-salary' || category === 'cat-freelance') {
                  setCategory('cat-food');
                }
              }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expense (Outflow)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('cat-salary');
              }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Income (Inflow)
            </button>
          </div>

          {/* Amount and Title */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1">
                AMOUNT ({settings.currency.symbol})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-cyan-400 font-bold">
                  {settings.currency.symbol}
                </span>
                <input
                  ref={amountInputRef}
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] focus:border-cyan-400 focus:outline-none text-white font-mono-numbers font-semibold text-lg"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-mono text-slate-400 mb-1">
                TRANSACTION TITLE
              </label>
              <input
                type="text"
                placeholder="e.g. Blue Tokai Coffee / AWS Cloud"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-white/[0.1] focus:border-cyan-400 focus:outline-none text-white text-sm"
                required
              />
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              CATEGORY
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
              {filteredCategories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all text-xs ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-sm'
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div
                      className="p-1 rounded-md"
                      style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                    >
                      <DynamicIcon name={cat.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>DATE</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] focus:border-cyan-400 focus:outline-none text-white text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" />
                <span>PAYMENT METHOD</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] focus:border-cyan-400 focus:outline-none text-white text-xs"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Merchant & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1 flex items-center gap-1">
                <Store className="w-3.5 h-3.5" />
                <span>MERCHANT / PAYEE</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Swiggy, Apple, Uber"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] focus:border-cyan-400 focus:outline-none text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                <span>TAGS (comma-separated)</span>
              </label>
              <input
                type="text"
                placeholder="dining, sprint, tax"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] focus:border-cyan-400 focus:outline-none text-white text-xs"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>NOTES / MEMO (OPTIONAL)</span>
            </label>
            <input
              type="text"
              placeholder="Additional context or transaction reference"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.1] focus:border-cyan-400 focus:outline-none text-white text-xs"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{editingTransaction ? 'Save Changes' : 'Confirm Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
