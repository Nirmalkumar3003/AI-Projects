import { useState, useEffect } from "react";
import { Transaction, BudgetLimit } from "./types";
import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS } from "./mockData";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import BudgetLimitsPanel from "./components/BudgetLimitsPanel";
import DashboardCharts from "./components/DashboardCharts";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Percent,
  RotateCcw,
  Sun,
  Moon,
  Info,
} from "lucide-react";

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    return (saved as "light" | "dark") || "dark";
  });

  // Core App states loaded from localStorage or mockData
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<BudgetLimit[]>(() => {
    const saved = localStorage.getItem("budgets");
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("budgets", JSON.stringify(budgets));
  }, [budgets]);

  // Sync theme class to root
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Dynamic calculations
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Handlers
  const handleAddTransaction = (newT: Omit<Transaction, "id">) => {
    const transactionWithId: Transaction = {
      ...newT,
      id: "tx_" + Date.now() + Math.random().toString(36).substr(2, 5),
    };
    setTransactions((prev) => [transactionWithId, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateBudget = (category: string, newLimit: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.category === category ? { ...b, limit: newLimit } : b))
    );
  };

  const handleResetData = () => {
    if (confirm("Reset everything back to the initial demo transactions?")) {
      setTransactions(INITIAL_TRANSACTIONS);
      setBudgets(INITIAL_BUDGETS);
    }
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear ALL transactions and budgets?")) {
      setTransactions([]);
      setBudgets(INITIAL_BUDGETS.map((b) => ({ ...b, limit: 0 })));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 transition-colors duration-300 font-sans selection:bg-indigo-500/30">
      {/* Decorative background glows */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] left-[5%] w-[500px] h-[500px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        
        {/* Header section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-md">
                <Wallet className="w-5 h-5" />
              </div>
              <h1 id="app-title" className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                Expense Tracker
              </h1>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xl">
              Track budgets, categorize outlays, and access your personal spending analytics dynamically.
            </p>
          </div>

          {/* Settings & Theme controllers */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetData}
              title="Reset initial demo data"
              className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-sm transition-all flex items-center justify-center cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleClearData}
              title="Clear all transaction logs"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 shadow-sm transition-all cursor-pointer"
            >
              Clear All
            </button>

            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-sm transition-all flex items-center justify-center cursor-pointer"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Dashboard Grid Layout */}
        <div className="space-y-6">
          
          {/* Row 1: KPI Cards */}
          <section id="kpi-cards-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1: Total Income */}
            <div className="p-4 rounded-2xl border transition-all duration-300 backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border-zinc-200/50 dark:border-zinc-800/50 shadow-md relative overflow-hidden group">
              <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 w-16 h-16 bg-green-500/5 dark:bg-green-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Total Income
                </span>
                <div className="p-1.5 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>

            {/* KPI 2: Total Expenses */}
            <div className="p-4 rounded-2xl border transition-all duration-300 backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border-zinc-200/50 dark:border-zinc-800/50 shadow-md relative overflow-hidden group">
              <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 w-16 h-16 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Total Expenses
                </span>
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                ${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>

            {/* KPI 3: Net Savings */}
            <div className="p-4 rounded-2xl border transition-all duration-300 backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border-zinc-200/50 dark:border-zinc-800/50 shadow-md relative overflow-hidden group">
              <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 w-16 h-16 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Net Savings
                </span>
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <PiggyBank className="w-4 h-4" />
                </div>
              </div>
              <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${netSavings >= 0 ? "text-zinc-900 dark:text-zinc-100" : "text-red-500"}`}>
                {netSavings < 0 && "-"}${Math.abs(netSavings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>

            {/* KPI 4: Savings Rate */}
            <div className="p-4 rounded-2xl border transition-all duration-300 backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border-zinc-200/50 dark:border-zinc-800/50 shadow-md relative overflow-hidden group">
              <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 w-16 h-16 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Savings Rate
                </span>
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                  <Percent className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                {savingsRate.toFixed(1)}%
              </h3>
            </div>

          </section>

          {/* Row 2: Charts (Spending Breakdown & Cash Flow) */}
          <section id="charts-section">
            <DashboardCharts transactions={transactions} />
          </section>

          {/* Row 3: Forms, Budgets, and Log list (Balanced columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left side: Add Transaction Form + Budget Targets (span 5) */}
            <div className="lg:col-span-5 space-y-6">
              <TransactionForm onAddTransaction={handleAddTransaction} />
              
              <BudgetLimitsPanel
                budgets={budgets}
                transactions={transactions}
                onUpdateBudget={handleUpdateBudget}
              />
            </div>

            {/* Right side: Detailed Transaction Logs Table/List (span 7) */}
            <div className="lg:col-span-7">
              <TransactionList
                transactions={transactions}
                onDeleteTransaction={handleDeleteTransaction}
              />
            </div>

          </div>

        </div>

        {/* Footer/Disclaimer section */}
        <footer className="mt-12 pt-6 border-t border-zinc-200/30 dark:border-zinc-800/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 dark:text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>Secure offline data. All settings and transactions are stored locally on your device.</span>
          </div>
          <div>
            <span>Local Web Application Platform</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
