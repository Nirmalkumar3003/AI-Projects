export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: string;
  notes?: string;
}

export interface BudgetLimit {
  category: string;
  limit: number;
}

export interface AISuggestions {
  summary: string;
  breakdownAnalysis: string;
  savingSuggestions: string[];
}

export interface AIPredictions {
  predictedTotal: number;
  analysis: string;
  recommendedCategoryBudgets: {
    category: string;
    amount: number;
  }[];
}

export interface AICategorizationResponse {
  category: string;
  confidence: number;
  reasoning: string;
}

export const CATEGORIES = [
  "Food & Dining",
  "Shopping",
  "Housing & Rent",
  "Utilities",
  "Transportation",
  "Entertainment",
  "Healthcare",
  "Income",
  "Other",
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "#f59e0b", // Amber
  "Shopping": "#ec4899", // Pink
  "Housing & Rent": "#3b82f6", // Blue
  "Utilities": "#06b6d4", // Cyan
  "Transportation": "#8b5cf6", // Purple
  "Entertainment": "#10b981", // Emerald
  "Healthcare": "#ef4444", // Red
  "Income": "#22c55e", // Green (mostly green)
  "Other": "#6b7280", // Gray
};
