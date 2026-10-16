export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 
  | 'UPI' 
  | 'Credit Card' 
  | 'Debit Card' 
  | 'Cash' 
  | 'Net Banking' 
  | 'Crypto';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  title: string;
  category: string; // Category ID
  date: string; // ISO date string (YYYY-MM-DD or full ISO)
  paymentMethod: PaymentMethod;
  merchant?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color or hex
  type: 'expense' | 'income' | 'both';
  isCustom?: boolean;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'custom';
  month?: string; // YYYY-MM
  rollover?: boolean;
  createdAt: string;
}

export interface GoalContribution {
  id: string;
  date: string;
  amount: number;
  type: 'contribution' | 'withdrawal';
  note?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category: string;
  color: string;
  icon: string;
  notes?: string;
  history: GoalContribution[];
  createdAt: string;
}

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  frequency: RecurrenceFrequency;
  nextDueDate: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  merchant?: string;
  isActive: boolean;
  notes?: string;
  isSubscription: boolean;
  createdAt: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export interface UserSettings {
  currency: CurrencyConfig;
  startingBalance: number;
  monthlyIncomeTarget: number;
  theme: 'dark' | 'light' | 'system';
  lowBalanceWarning: number;
  budgetAlertThreshold: number; // percentage, e.g. 80
  userName: string;
  userTitle: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'alert';
  timestamp: string;
  read: boolean;
  actionLink?: string;
}

export interface FinancialInsight {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'opportunity' | 'achievement' | 'tip';
  impact: 'High' | 'Medium' | 'Low' | 'Neutral';
  metric: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
}

export type ActiveTab = 
  | 'overview' 
  | 'transactions' 
  | 'budgets' 
  | 'savings' 
  | 'recurring' 
  | 'reports' 
  | 'nova' 
  | 'settings';
