import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Transaction,
  Category,
  Budget,
  SavingsGoal,
  RecurringTransaction,
  UserSettings,
  NotificationItem,
  FinancialInsight,
  ActiveTab,
  CurrencyConfig,
} from '../types';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import {
  DEMO_TRANSACTIONS,
  DEMO_BUDGETS,
  DEMO_SAVINGS_GOALS,
  DEMO_RECURRING,
  DEMO_STARTING_BALANCE,
} from '../utils/demoData';
import {
  calculateIncome,
  calculateExpense,
  calculateBalance,
  calculateSavingsRate,
  calculateMoMChange,
  getCategorySpendingBreakdown,
  getDailyCashFlow,
  calculateRecurringMonthlyTotal,
  filterTransactionsByMonth,
  CategoryBreakdown,
} from '../utils/calculations';
import { SUPPORTED_CURRENCIES } from '../utils/formatters';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
  undoAction?: () => void;
}

interface FinanceContextType {
  // Navigation & UI state
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  isNovaOpen: boolean;
  setIsNovaOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isCsvImportOpen: boolean;
  setIsCsvImportOpen: (open: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (t: Transaction | null) => void;
  inspectingTransaction: Transaction | null;
  setInspectingTransaction: (t: Transaction | null) => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Onboarding state
  isDemoDataActive: boolean;

  // Data Collections
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  recurring: RecurringTransaction[];
  settings: UserSettings;
  notifications: NotificationItem[];
  insights: FinancialInsight[];
  isGeneratingInsights: boolean;

  // Metrics
  totalBalance: number;
  currentMonthIncome: number;
  currentMonthExpenses: number;
  currentMonthNet: number;
  savingsRate: number;
  availableBudget: number;
  momExpenseChange: { percentage: number; direction: 'increased' | 'decreased' | 'unchanged' };
  categorySpendBreakdown: CategoryBreakdown[];
  dailyCashFlow: { date: string; income: number; expense: number; net: number }[];
  recurringTotals: { income: number; expense: number; subscriptions: number };

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  undoLastDelete: () => void;
  duplicateTransaction: (id: string) => void;
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;
  setBudget: (budget: Omit<Budget, 'id' | 'createdAt'> & { id?: string }) => void;
  deleteBudget: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'history' | 'currentAmount'> & { initialAmount?: number }) => void;
  updateSavingsGoal: (goal: SavingsGoal) => void;
  addGoalContribution: (goalId: string, amount: number, type: 'contribution' | 'withdrawal', note?: string) => void;
  deleteSavingsGoal: (id: string) => void;
  addRecurring: (rec: Omit<RecurringTransaction, 'id' | 'createdAt'>) => void;
  updateRecurring: (rec: RecurringTransaction) => void;
  toggleRecurringStatus: (id: string) => void;
  deleteRecurring: (id: string) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  loadDemoData: () => void;
  clearAllData: () => void;
  importCsvTransactions: (validTxs: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  refreshInsights: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEY = 'nexora_finances_v2';

const DEFAULT_SETTINGS: UserSettings = {
  currency: SUPPORTED_CURRENCIES[0], // INR by default
  startingBalance: DEMO_STARTING_BALANCE,
  monthlyIncomeTarget: 200000,
  theme: 'dark',
  lowBalanceWarning: 20000,
  budgetAlertThreshold: 80,
  userName: 'Nirmal',
  userTitle: 'Chief FinTech Architect',
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isNovaOpen, setIsNovaOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [inspectingTransaction, setInspectingTransaction] = useState<Transaction | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [deletedHistory, setDeletedHistory] = useState<Transaction[]>([]);

  // Core State with LocalStorage Persistence
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_txs`);
      return saved ? JSON.parse(saved) : DEMO_TRANSACTIONS;
    } catch {
      return DEMO_TRANSACTIONS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_cats`);
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_budgets`);
      return saved ? JSON.parse(saved) : DEMO_BUDGETS;
    } catch {
      return DEMO_BUDGETS;
    }
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_goals`);
      return saved ? JSON.parse(saved) : DEMO_SAVINGS_GOALS;
    } catch {
      return DEMO_SAVINGS_GOALS;
    }
  });

  const [recurring, setRecurring] = useState<RecurringTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_recurring`);
      return saved ? JSON.parse(saved) : DEMO_RECURRING;
    } catch {
      return DEMO_RECURRING;
    }
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'October Payroll Reconciled',
      message: 'NexusTech Global direct salary credit of ₹1,95,000 confirmed.',
      type: 'success',
      timestamp: '2026-10-01T09:05:00Z',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Budget Threshold Notice',
      message: 'Housing & Rent allocation reached 95% of planned monthly capacity.',
      type: 'warning',
      timestamp: '2026-10-03T10:00:00Z',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Upcoming Mandate Due',
      message: 'Airtel Infinity 1Gbps Fiber Optic (₹1,799) scheduled for Oct 24.',
      type: 'info',
      timestamp: '2026-10-15T08:00:00Z',
      read: false,
    },
  ]);

  const [insights, setInsights] = useState<FinancialInsight[]>([
    {
      id: 'ins-default-1',
      title: 'High Savings Efficiency',
      description: 'Your savings rate of 74% outperforms typical benchmarks by 40%.',
      type: 'achievement',
      impact: 'High',
      metric: '74% rate',
    },
    {
      id: 'ins-default-2',
      title: 'Discretionary Outflow Check',
      description: 'Tech & cloud subscriptions account for ₹9,998 across 2 active services.',
      type: 'opportunity',
      impact: 'Medium',
      metric: '₹9,998 total',
    },
  ]);

  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isDemoDataActive, setIsDemoDataActive] = useState<boolean>(() => {
    return transactions.length === DEMO_TRANSACTIONS.length && transactions[0]?.id === DEMO_TRANSACTIONS[0]?.id;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_txs`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY}_cats`, JSON.stringify(categories));
      localStorage.setItem(`${STORAGE_KEY}_budgets`, JSON.stringify(budgets));
      localStorage.setItem(`${STORAGE_KEY}_goals`, JSON.stringify(savingsGoals));
      localStorage.setItem(`${STORAGE_KEY}_recurring`, JSON.stringify(recurring));
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [transactions, categories, budgets, savingsGoals, recurring, settings]);

  // Apply Theme to document HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      // System
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    }
  }, [settings.theme]);

  // Toast Management
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration ?? (toast.undoAction ? 6000 : 4000);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Keyboard shortcut listener for Command Palette (Cmd+K / Ctrl+K) and Quick Add (Q)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (
        e.key.toLowerCase() === 'q' &&
        !['input', 'textarea', 'select'].includes((e.target as HTMLElement)?.tagName?.toLowerCase()) &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        e.preventDefault();
        setIsQuickAddOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Financial Metric Calculations
  const currentMonthTransactions = useMemo(() => {
    return filterTransactionsByMonth(transactions, '2026-10');
  }, [transactions]);

  const previousMonthTransactions = useMemo(() => {
    return filterTransactionsByMonth(transactions, '2026-09');
  }, [transactions]);

  const totalBalance = useMemo(() => {
    return calculateBalance(settings.startingBalance, transactions);
  }, [settings.startingBalance, transactions]);

  const currentMonthIncome = useMemo(() => {
    return calculateIncome(currentMonthTransactions);
  }, [currentMonthTransactions]);

  const currentMonthExpenses = useMemo(() => {
    return calculateExpense(currentMonthTransactions);
  }, [currentMonthTransactions]);

  const currentMonthNet = useMemo(() => {
    return currentMonthIncome - currentMonthExpenses;
  }, [currentMonthIncome, currentMonthExpenses]);

  const savingsRate = useMemo(() => {
    return calculateSavingsRate(currentMonthIncome, currentMonthExpenses);
  }, [currentMonthIncome, currentMonthExpenses]);

  const availableBudget = useMemo(() => {
    const totalBudgetCap = budgets.reduce((sum, b) => sum + b.amount, 0);
    return Math.max(0, totalBudgetCap - currentMonthExpenses);
  }, [budgets, currentMonthExpenses]);

  const momExpenseChange = useMemo(() => {
    const prevExpense = calculateExpense(previousMonthTransactions);
    return calculateMoMChange(currentMonthExpenses, prevExpense);
  }, [currentMonthExpenses, previousMonthTransactions]);

  const categorySpendBreakdown = useMemo(() => {
    return getCategorySpendingBreakdown(currentMonthTransactions, categories, budgets);
  }, [currentMonthTransactions, categories, budgets]);

  const dailyCashFlow = useMemo(() => {
    return getDailyCashFlow(transactions, 30);
  }, [transactions]);

  const recurringTotals = useMemo(() => {
    return calculateRecurringMonthlyTotal(recurring);
  }, [recurring]);

  // Actions
  const addTransaction = useCallback(
    (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newTx: Transaction = {
        ...tx,
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: now,
        updatedAt: now,
      };

      setTransactions((prev) => [newTx, ...prev]);
      setIsDemoDataActive(false);
      addToast({
        type: 'success',
        title: 'Transaction Recorded',
        message: `${newTx.title} (${settings.currency.symbol}${newTx.amount.toLocaleString()}) logged to ledger.`,
      });
    },
    [addToast, settings.currency.symbol]
  );

  const updateTransaction = useCallback(
    (updated: Transaction) => {
      const now = new Date().toISOString();
      setTransactions((prev) =>
        prev.map((t) => (t.id === updated.id ? { ...updated, updatedAt: now } : t))
      );
      addToast({
        type: 'info',
        title: 'Transaction Updated',
        message: `Changes saved for ${updated.title}.`,
      });
    },
    [addToast]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      const target = transactions.find((t) => t.id === id);
      if (!target) return;

      setDeletedHistory((prev) => [target, ...prev]);
      setTransactions((prev) => prev.filter((t) => t.id !== id));

      addToast({
        type: 'warning',
        title: 'Transaction Removed',
        message: `${target.title} was removed from ledger.`,
        undoAction: () => {
          setTransactions((prev) => [target, ...prev]);
          setDeletedHistory((prev) => prev.filter((t) => t.id !== target.id));
          addToast({
            type: 'success',
            title: 'Action Reverted',
            message: `${target.title} has been restored.`,
          });
        },
      });
    },
    [transactions, addToast]
  );

  const undoLastDelete = useCallback(() => {
    if (deletedHistory.length === 0) return;
    const restored = deletedHistory[0];
    setTransactions((prev) => [restored, ...prev]);
    setDeletedHistory((prev) => prev.slice(1));
    addToast({
      type: 'success',
      title: 'Restored',
      message: `${restored.title} restored.`,
    });
  }, [deletedHistory, addToast]);

  const duplicateTransaction = useCallback(
    (id: string) => {
      const source = transactions.find((t) => t.id === id);
      if (!source) return;

      const now = new Date().toISOString();
      const dup: Transaction = {
        ...source,
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `${source.title} (Copy)`,
        date: new Date().toISOString().substring(0, 10),
        createdAt: now,
        updatedAt: now,
      };

      setTransactions((prev) => [dup, ...prev]);
      addToast({
        type: 'success',
        title: 'Transaction Duplicated',
        message: `Created clone of ${source.title}.`,
      });
    },
    [transactions, addToast]
  );

  const addCategory = useCallback(
    (cat: Omit<Category, 'id'>) => {
      const newCat: Category = {
        ...cat,
        id: `cat-custom-${Date.now()}`,
        isCustom: true,
      };
      setCategories((prev) => [...prev, newCat]);
      addToast({
        type: 'success',
        title: 'Category Created',
        message: `Category "${newCat.name}" is now active.`,
      });
    },
    [addToast]
  );

  const updateCategory = useCallback(
    (cat: Category) => {
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
      addToast({
        type: 'info',
        title: 'Category Updated',
        message: `Updated ${cat.name}.`,
      });
    },
    [addToast]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      addToast({
        type: 'warning',
        title: 'Category Removed',
      });
    },
    [addToast]
  );

  const setBudget = useCallback(
    (budget: Omit<Budget, 'id' | 'createdAt'> & { id?: string }) => {
      setBudgets((prev) => {
        const existingIdx = prev.findIndex((b) => b.categoryId === budget.categoryId);
        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            ...budget,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              ...budget,
              id: budget.id || `bgt-${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
          ];
        }
      });
      addToast({
        type: 'success',
        title: 'Budget Configured',
        message: 'Spending limits and monitoring active.',
      });
    },
    [addToast]
  );

  const deleteBudget = useCallback(
    (id: string) => {
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      addToast({
        type: 'warning',
        title: 'Budget Removed',
      });
    },
    [addToast]
  );

  const addSavingsGoal = useCallback(
    (
      goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'history' | 'currentAmount'> & {
        initialAmount?: number;
      }
    ) => {
      const initial = goal.initialAmount || 0;
      const now = new Date().toISOString();
      const newGoal: SavingsGoal = {
        id: `goal-${Date.now()}`,
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: initial,
        targetDate: goal.targetDate,
        category: goal.category,
        color: goal.color,
        icon: goal.icon,
        notes: goal.notes,
        createdAt: now,
        history:
          initial > 0
            ? [
                {
                  id: `gh-${Date.now()}`,
                  date: now.substring(0, 10),
                  amount: initial,
                  type: 'contribution',
                  note: 'Seed deposit',
                },
              ]
            : [],
      };

      setSavingsGoals((prev) => [...prev, newGoal]);
      addToast({
        type: 'success',
        title: 'Savings Vault Initialized',
        message: `Target ${settings.currency.symbol}${newGoal.targetAmount.toLocaleString()} configured for ${newGoal.name}.`,
      });
    },
    [addToast, settings.currency.symbol]
  );

  const updateSavingsGoal = useCallback(
    (goal: SavingsGoal) => {
      setSavingsGoals((prev) => prev.map((g) => (g.id === goal.id ? goal : g)));
      addToast({
        type: 'info',
        title: 'Goal Updated',
      });
    },
    [addToast]
  );

  const addGoalContribution = useCallback(
    (goalId: string, amount: number, type: 'contribution' | 'withdrawal', note?: string) => {
      setSavingsGoals((prev) =>
        prev.map((g) => {
          if (g.id !== goalId) return g;
          const delta = type === 'contribution' ? amount : -amount;
          const nextAmount = Math.max(0, g.currentAmount + delta);
          const historyEntry = {
            id: `gh-${Date.now()}`,
            date: new Date().toISOString().substring(0, 10),
            amount,
            type,
            note: note || (type === 'contribution' ? 'Manual deposit' : 'Manual withdrawal'),
          };

          return {
            ...g,
            currentAmount: nextAmount,
            history: [historyEntry, ...g.history],
          };
        })
      );

      addToast({
        type: type === 'contribution' ? 'success' : 'info',
        title: type === 'contribution' ? 'Contribution Logged' : 'Withdrawal Logged',
        message: `${settings.currency.symbol}${amount.toLocaleString()} ${type === 'contribution' ? 'added to' : 'drawn from'} vault.`,
      });
    },
    [addToast, settings.currency.symbol]
  );

  const deleteSavingsGoal = useCallback(
    (id: string) => {
      setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
      addToast({
        type: 'warning',
        title: 'Goal Removed',
      });
    },
    [addToast]
  );

  const addRecurring = useCallback(
    (rec: Omit<RecurringTransaction, 'id' | 'createdAt'>) => {
      const newRec: RecurringTransaction = {
        ...rec,
        id: `rec-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setRecurring((prev) => [...prev, newRec]);
      addToast({
        type: 'success',
        title: 'Recurring Schedule Created',
        message: `${newRec.title} (${settings.currency.symbol}${newRec.amount.toLocaleString()} / ${newRec.frequency}) registered.`,
      });
    },
    [addToast, settings.currency.symbol]
  );

  const updateRecurring = useCallback(
    (rec: RecurringTransaction) => {
      setRecurring((prev) => prev.map((r) => (r.id === rec.id ? rec : r)));
      addToast({
        type: 'info',
        title: 'Schedule Updated',
      });
    },
    [addToast]
  );

  const toggleRecurringStatus = useCallback(
    (id: string) => {
      setRecurring((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
      );
      addToast({
        type: 'info',
        title: 'Schedule Status Updated',
      });
    },
    [addToast]
  );

  const deleteRecurring = useCallback(
    (id: string) => {
      setRecurring((prev) => prev.filter((r) => r.id !== id));
      addToast({
        type: 'warning',
        title: 'Recurring Schedule Removed',
      });
    },
    [addToast]
  );

  const updateSettings = useCallback(
    (newSettings: Partial<UserSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
      addToast({
        type: 'success',
        title: 'Settings Saved',
        message: 'System parameters updated.',
      });
    },
    [addToast]
  );

  const loadDemoData = useCallback(() => {
    setTransactions(DEMO_TRANSACTIONS);
    setCategories(DEFAULT_CATEGORIES);
    setBudgets(DEMO_BUDGETS);
    setSavingsGoals(DEMO_SAVINGS_GOALS);
    setRecurring(DEMO_RECURRING);
    setSettings(DEFAULT_SETTINGS);
    setIsDemoDataActive(true);
    addToast({
      type: 'info',
      title: 'Demo Environment Active',
      message: 'Realistic dataset in ₹ INR loaded.',
    });
  }, [addToast]);

  const clearAllData = useCallback(() => {
    setTransactions([]);
    setBudgets([]);
    setSavingsGoals([]);
    setRecurring([]);
    setSettings((prev) => ({ ...prev, startingBalance: 0 }));
    setIsDemoDataActive(false);
    addToast({
      type: 'warning',
      title: 'Ledger Reset',
      message: 'All records purged. Fresh workspace ready.',
    });
  }, [addToast]);

  const importCsvTransactions = useCallback(
    (validTxs: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[]) => {
      const now = new Date().toISOString();
      const generated: Transaction[] = validTxs.map((t, i) => ({
        ...t,
        id: `tx-csv-${Date.now()}-${i}`,
        createdAt: now,
        updatedAt: now,
      }));

      setTransactions((prev) => [...generated, ...prev]);
      setIsDemoDataActive(false);
      addToast({
        type: 'success',
        title: 'CSV Import Complete',
        message: `Successfully integrated ${generated.length} transactions.`,
      });
    },
    [addToast]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const refreshInsights = useCallback(async () => {
    setIsGeneratingInsights(true);
    try {
      const context = {
        currencySymbol: settings.currency.symbol,
        currencyCode: settings.currency.code,
        balance: totalBalance,
        monthlyIncome: currentMonthIncome,
        monthlyExpenses: currentMonthExpenses,
        savingsRate,
        topCategories: categorySpendBreakdown.slice(0, 5),
        budgets,
        savingsGoals,
        recurringMonthlyTotal: recurringTotals.expense,
      };

      const res = await fetch('/api/nova/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.insights && Array.isArray(data.insights)) {
          setInsights(data.insights);
          addToast({
            type: 'info',
            title: 'NOVA Insights Synthesized',
            message: 'Predictive financial telemetry refreshed.',
          });
        }
      }
    } catch (err) {
      console.error('Error refreshing insights:', err);
    } finally {
      setIsGeneratingInsights(false);
    }
  }, [
    settings.currency,
    totalBalance,
    currentMonthIncome,
    currentMonthExpenses,
    savingsRate,
    categorySpendBreakdown,
    budgets,
    savingsGoals,
    recurringTotals,
    addToast,
  ]);

  const contextValue: FinanceContextType = {
    activeTab,
    setActiveTab,
    isQuickAddOpen,
    setIsQuickAddOpen,
    isNovaOpen,
    setIsNovaOpen,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isCsvImportOpen,
    setIsCsvImportOpen,
    editingTransaction,
    setEditingTransaction,
    inspectingTransaction,
    setInspectingTransaction,
    toasts,
    addToast,
    removeToast,
    isDemoDataActive,
    transactions,
    categories,
    budgets,
    savingsGoals,
    recurring,
    settings,
    notifications,
    insights,
    isGeneratingInsights,
    totalBalance,
    currentMonthIncome,
    currentMonthExpenses,
    currentMonthNet,
    savingsRate,
    availableBudget,
    momExpenseChange,
    categorySpendBreakdown,
    dailyCashFlow,
    recurringTotals,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    undoLastDelete,
    duplicateTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    setBudget,
    deleteBudget,
    addSavingsGoal,
    updateSavingsGoal,
    addGoalContribution,
    deleteSavingsGoal,
    addRecurring,
    updateRecurring,
    toggleRecurringStatus,
    deleteRecurring,
    updateSettings,
    loadDemoData,
    clearAllData,
    importCsvTransactions,
    markNotificationRead,
    clearNotifications,
    refreshInsights,
  };

  return <FinanceContext.Provider value={contextValue}>{children}</FinanceContext.Provider>;
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
