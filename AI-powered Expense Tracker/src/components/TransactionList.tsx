import React, { useState, useMemo } from "react";
import { Transaction, CATEGORIES, CATEGORY_COLORS } from "../types";
import {
  Search,
  Trash2,
  Calendar,
  Utensils,
  ShoppingBag,
  Home,
  Zap,
  Car,
  Film,
  HeartPulse,
  Wallet,
  FileText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  "Food & Dining": Utensils,
  "Shopping": ShoppingBag,
  "Housing & Rent": Home,
  "Utilities": Zap,
  "Transportation": Car,
  "Entertainment": Film,
  "Healthcare": HeartPulse,
  "Income": Wallet,
  "Other": FileText,
};

export default function TransactionList({ transactions, onDeleteTransaction }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<"all" | "income" | "expense">("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");

  // Filter & Sort Logic
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Search Term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(term) ||
          (t.notes && t.notes.toLowerCase().includes(term)) ||
          t.category.toLowerCase().includes(term)
      );
    }

    // Category
    if (selectedCategory !== "All") {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // Type
    if (selectedType !== "all") {
      result = result.filter((t) => t.type === selectedType);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === "date-asc") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === "amount-desc") {
        return b.amount - a.amount;
      } else {
        return a.amount - b.amount;
      }
    });

    return result;
  }, [transactions, searchTerm, selectedCategory, selectedType, sortBy]);

  return (
    <div id="transaction-list-card" className="p-6 rounded-2xl border transition-all duration-300 backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border-zinc-200/50 dark:border-zinc-800/50 shadow-xl flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 id="transactions-title" className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Transactions History
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Showing {filteredTransactions.length} of {transactions.length} items
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 pl-9 pr-4 py-1.5 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          />
        </div>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {/* Filter by Category */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-1">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Type */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-1">
            Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="w-full px-3 py-1.5 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-1">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-1.5 rounded-xl bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto max-h-[360px] pr-1 space-y-2.5 custom-scrollbar">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-400 dark:text-zinc-500">
            <Search className="w-8 h-8 mb-2 stroke-1" />
            <p className="text-sm">No transactions found matching criteria.</p>
          </div>
        ) : (
          filteredTransactions.map((t) => {
            const IconComponent = CATEGORY_ICONS[t.category] || FileText;
            const categoryColor = CATEGORY_COLORS[t.category] || "#6b7280";

            return (
              <div
                key={t.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-100/50 dark:border-zinc-800/30 bg-zinc-50/50 dark:bg-zinc-800/20 hover:bg-zinc-100/40 dark:hover:bg-zinc-800/40 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Icon Badge */}
                  <div
                    className="p-2.5 rounded-xl flex-shrink-0 text-white"
                    style={{ backgroundColor: categoryColor + "20", color: categoryColor }}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>

                  {/* Text Details */}
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {t.description}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="font-semibold" style={{ color: categoryColor }}>
                        {t.category}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {t.date}
                      </span>
                      {t.notes && (
                        <>
                          <span>•</span>
                          <span className="italic truncate max-w-[150px]" title={t.notes}>
                            {t.notes}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount and Delete Action */}
                <div className="flex items-center gap-4 pl-3">
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-sm font-semibold flex items-center justify-end gap-0.5 ${
                        t.type === "income" ? "text-green-600 dark:text-green-400" : "text-zinc-900 dark:text-zinc-100"
                      }`}
                    >
                      {t.type === "income" ? (
                        <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                      {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => onDeleteTransaction(t.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                    title="Delete transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
