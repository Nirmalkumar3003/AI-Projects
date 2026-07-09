import React, { useState } from "react";
import { Transaction, CATEGORIES } from "../types";
import { PlusCircle, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
}

export default function TransactionForm({ onAddTransaction }: TransactionFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food & Dining");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      alert("Please enter a valid description and amount.");
      return;
    }

    onAddTransaction({
      description: description.trim(),
      amount: parseFloat(amount),
      category: type === "income" ? "Income" : category,
      type,
      date,
      notes: notes.trim() || undefined,
    });

    // Reset Form
    setDescription("");
    setAmount("");
    setNotes("");
  };

  return (
    <div id="transaction-form-card" className="p-6 rounded-2xl border transition-all duration-300 backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border-zinc-200/50 dark:border-zinc-800/50 shadow-xl">
      <div className="flex items-center gap-3 mb-5">
        <PlusCircle className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        <h2 id="add-transaction-title" className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Add Transaction
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100/80 dark:bg-zinc-800/60 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setType("expense");
              if (category === "Income") setCategory("Food & Dining");
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              type === "expense"
                ? "bg-white dark:bg-zinc-700 text-red-600 dark:text-red-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <ArrowDownCircle className="w-4 h-4" />
            Expense
          </button>
          <button
            type="button"
            onClick={() => {
              setType("income");
              setCategory("Income");
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              type === "income"
                ? "bg-white dark:bg-zinc-700 text-green-600 dark:text-green-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            Income
          </button>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
            Description
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Weekly Groceries, Starbucks, Salary"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          />
        </div>

        {/* Amount & Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
              Amount ($)
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
          </div>
        </div>

        {/* Category Selector (Hidden or set to Income if type is income) */}
        {type === "expense" && (
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            >
              {CATEGORIES.filter((cat) => cat !== "Income").map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Notes (Optional) */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
            Notes (Optional)
          </label>
          <textarea
            placeholder="Add comments or notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl text-white font-medium text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 dark:from-indigo-500 dark:to-violet-500 dark:hover:from-indigo-400 dark:hover:to-violet-400 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          Add {type === "income" ? "Income" : "Expense"}
        </button>
      </form>
    </div>
  );
}
