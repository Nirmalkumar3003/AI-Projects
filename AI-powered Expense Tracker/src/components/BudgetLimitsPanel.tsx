import { useState } from "react";
import { BudgetLimit, Transaction, CATEGORIES } from "../types";
import { Target, AlertTriangle, CheckCircle, Edit3, Save, X } from "lucide-react";

interface BudgetLimitsPanelProps {
  budgets: BudgetLimit[];
  transactions: Transaction[];
  onUpdateBudget: (category: string, limit: number) => void;
}

export default function BudgetLimitsPanel({ budgets, transactions, onUpdateBudget }: BudgetLimitsPanelProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Calculate spent amounts for each expense category
  const categoryExpenses = CATEGORIES.reduce((acc, cat) => {
    if (cat === "Income") return acc;
    const total = transactions
      .filter((t) => t.category === cat && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    acc[cat] = total;
    return acc;
  }, {} as Record<string, number>);

  const handleEdit = (category: string, currentLimit: number) => {
    setEditingCategory(category);
    setEditValue(currentLimit.toString());
  };

  const handleSave = (category: string) => {
    const val = parseFloat(editValue);
    if (!isNaN(val) && val >= 0) {
      onUpdateBudget(category, val);
      setEditingCategory(null);
    } else {
      alert("Please enter a valid positive number.");
    }
  };

  return (
    <div id="budget-limits-card" className="p-6 rounded-2xl border transition-all duration-300 backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border-zinc-200/50 dark:border-zinc-800/50 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          <h2 id="monthly-budgets-title" className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Monthly Budgets
          </h2>
        </div>
      </div>

      <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
        {budgets.map((b) => {
          const spent = categoryExpenses[b.category] || 0;
          const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
          const isOver = spent > b.limit;
          const isWarning = !isOver && pct >= 80;

          return (
            <div
              key={b.category}
              className="p-3 rounded-xl border border-zinc-100/30 dark:border-zinc-800/20 bg-zinc-50/30 dark:bg-zinc-800/10"
            >
              <div className="flex items-center justify-between text-sm font-medium mb-1.5">
                <span className="text-zinc-800 dark:text-zinc-200">{b.category}</span>
                
                {/* Editing limit state */}
                {editingCategory === b.category ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-zinc-400">$</span>
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-16 px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSave(b.category)}
                      className="text-green-600 hover:text-green-500"
                      title="Save Limit"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="text-red-500 hover:text-red-400"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <span className="text-zinc-500 dark:text-zinc-400 text-xs">
                      ${spent.toFixed(1)} / <strong className="text-zinc-800 dark:text-zinc-200">${b.limit}</strong>
                    </span>
                    <button
                      onClick={() => handleEdit(b.category, b.limit)}
                      className="text-zinc-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Edit Budget Limit"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mb-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOver
                      ? "bg-red-500"
                      : isWarning
                      ? "bg-amber-500"
                      : "bg-indigo-500"
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>

              {/* Warnings and Indicators */}
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400 dark:text-zinc-500">
                  {pct.toFixed(0)}% Utilized
                </span>
                
                {isOver ? (
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Over Budget by ${(spent - b.limit).toFixed(0)}
                  </span>
                ) : isWarning ? (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Warning (80%+ filled)
                  </span>
                ) : b.limit > 0 ? (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    On Track
                  </span>
                ) : (
                  <span className="text-zinc-400 italic">No limit target set</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
