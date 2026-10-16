import { Transaction, Category, Budget, RecurringTransaction, SavingsGoal } from '../types';

/**
 * Filter transactions by month (YYYY-MM). If no month specified, uses current month.
 */
export function filterTransactionsByMonth(transactions: Transaction[], yearMonth?: string): Transaction[] {
  const target = yearMonth || new Date().toISOString().substring(0, 7);
  return transactions.filter((t) => t.date.startsWith(target));
}

/**
 * Calculate total income within transactions
 */
export function calculateIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

/**
 * Calculate total expenses within transactions
 */
export function calculateExpense(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

/**
 * Calculate current net balance: startingBalance + historical incomes - historical expenses
 */
export function calculateBalance(startingBalance: number, allTransactions: Transaction[]): number {
  const totalIncome = calculateIncome(allTransactions);
  const totalExpense = calculateExpense(allTransactions);
  return startingBalance + totalIncome - totalExpense;
}

/**
 * Calculate savings rate (0 - 100%)
 */
export function calculateSavingsRate(income: number, expense: number): number {
  if (income <= 0) return 0;
  const net = income - expense;
  if (net <= 0) return 0;
  return Math.min(100, Math.round((net / income) * 100));
}

/**
 * Calculate month-over-month change percentage
 */
export function calculateMoMChange(currentPeriodExpense: number, previousPeriodExpense: number): {
  percentage: number;
  direction: 'increased' | 'decreased' | 'unchanged';
} {
  if (previousPeriodExpense === 0) {
    return {
      percentage: currentPeriodExpense > 0 ? 100 : 0,
      direction: currentPeriodExpense > 0 ? 'increased' : 'unchanged',
    };
  }

  const diff = currentPeriodExpense - previousPeriodExpense;
  const percentage = Math.round(Math.abs((diff / previousPeriodExpense) * 100));

  if (diff > 0) return { percentage, direction: 'increased' };
  if (diff < 0) return { percentage, direction: 'decreased' };
  return { percentage: 0, direction: 'unchanged' };
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  total: number;
  percentage: number;
  budgetAmount?: number;
  budgetUtilization?: number; // e.g. 85 for 85%
  isOverBudget?: boolean;
}

/**
 * Get category spending breakdown for given transactions and budgets
 */
export function getCategorySpendingBreakdown(
  transactions: Transaction[],
  categories: Category[],
  budgets: Budget[] = []
): CategoryBreakdown[] {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const categoryMap = new Map<string, Category>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  const budgetMap = new Map<string, Budget>();
  budgets.forEach((b) => budgetMap.set(b.categoryId, b));

  const spendMap = new Map<string, number>();
  expenses.forEach((t) => {
    spendMap.set(t.category, (spendMap.get(t.category) || 0) + Number(t.amount || 0));
  });

  const breakdown: CategoryBreakdown[] = [];

  spendMap.forEach((amount, catId) => {
    const cat = categoryMap.get(catId) || {
      id: catId,
      name: 'Uncategorized',
      color: '#94a3b8',
      icon: 'Tag',
      type: 'expense' as const,
    };

    const budget = budgetMap.get(catId);
    const budgetAmount = budget?.amount;
    const budgetUtilization = budgetAmount && budgetAmount > 0 ? Math.round((amount / budgetAmount) * 100) : undefined;
    const isOverBudget = budgetUtilization !== undefined && budgetUtilization > 100;
    const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;

    breakdown.push({
      categoryId: catId,
      categoryName: cat.name,
      categoryColor: cat.color,
      categoryIcon: cat.icon,
      total: amount,
      percentage,
      budgetAmount,
      budgetUtilization,
      isOverBudget,
    });
  });

  return breakdown.sort((a, b) => b.total - a.total);
}

/**
 * Group transactions for daily or monthly cash-flow charts
 */
export function getDailyCashFlow(transactions: Transaction[], days: number = 30) {
  const map = new Map<string, { date: string; income: number; expense: number; net: number }>();
  
  // Sort transactions by date ascending
  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  sorted.forEach((t) => {
    const d = t.date.substring(0, 10);
    const existing = map.get(d) || { date: d, income: 0, expense: 0, net: 0 };
    if (t.type === 'income') {
      existing.income += Number(t.amount || 0);
    } else {
      existing.expense += Number(t.amount || 0);
    }
    existing.net = existing.income - existing.expense;
    map.set(d, existing);
  });

  const result = Array.from(map.values());
  return result.slice(-days);
}

/**
 * Calculate normalized monthly burn rate for recurring items
 */
export function calculateRecurringMonthlyTotal(recurring: RecurringTransaction[]): {
  income: number;
  expense: number;
  subscriptions: number;
} {
  let income = 0;
  let expense = 0;
  let subscriptions = 0;

  recurring.forEach((item) => {
    if (!item.isActive) return;

    let monthly = item.amount;
    if (item.frequency === 'daily') monthly = item.amount * 30;
    else if (item.frequency === 'weekly') monthly = item.amount * 4.33;
    else if (item.frequency === 'yearly') monthly = item.amount / 12;

    if (item.type === 'income') {
      income += monthly;
    } else {
      expense += monthly;
      if (item.isSubscription) {
        subscriptions += monthly;
      }
    }
  });

  return {
    income: Math.round(income),
    expense: Math.round(expense),
    subscriptions: Math.round(subscriptions),
  };
}

/**
 * Calculate required monthly savings pace for a goal
 */
export function calculateGoalPace(goal: SavingsGoal): {
  remaining: number;
  monthsRemaining: number;
  monthlyPace: number;
  progressPercent: number;
  isCompleted: boolean;
} {
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const progressPercent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  const isCompleted = goal.currentAmount >= goal.targetAmount;

  const now = new Date();
  const target = new Date(goal.targetDate);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const monthsRemaining = Math.max(1, Math.ceil(diffDays / 30));

  const monthlyPace = remaining > 0 ? Math.ceil(remaining / monthsRemaining) : 0;

  return {
    remaining,
    monthsRemaining,
    monthlyPace,
    progressPercent,
    isCompleted,
  };
}

/**
 * Convert transactions array to downloadable CSV string
 */
export function exportToCSV(transactions: Transaction[], categories: Category[]): string {
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  const headers = ['ID', 'Date', 'Type', 'Amount', 'Title', 'Category', 'Payment Method', 'Merchant', 'Tags', 'Notes'];
  const rows = transactions.map((t) => [
    t.id,
    t.date,
    t.type,
    t.amount,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${catMap.get(t.category) || t.category}"`,
    t.paymentMethod || '',
    `"${(t.merchant || '').replace(/"/g, '""')}"`,
    `"${(t.tags || []).join(';')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Parse CSV text into validated transaction draft objects
 */
export function parseCSV(
  csvText: string,
  categories: Category[],
  existingTransactions: Transaction[]
): {
  valid: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[];
  errors: { row: number; error: string; raw: string }[];
  duplicates: number;
} {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) {
    return { valid: [], errors: [{ row: 1, error: 'CSV must have a header row and at least 1 data row', raw: '' }], duplicates: 0 };
  }

  const catMapByName = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
  const existingKeys = new Set(
    existingTransactions.map((t) => `${t.date}-${t.amount}-${t.title.toLowerCase()}`)
  );

  const headerLine = lines[0].toLowerCase();
  const headers = parseCSVLine(headerLine);

  const findIdx = (names: string[]) => headers.findIndex((h) => names.some((n) => h.includes(n)));

  const dateIdx = findIdx(['date', 'time', 'timestamp']);
  const amountIdx = findIdx(['amount', 'price', 'val', 'cost']);
  const titleIdx = findIdx(['title', 'desc', 'description', 'narrative', 'name']);
  const typeIdx = findIdx(['type', 'in/out', 'flow']);
  const catIdx = findIdx(['category', 'cat']);
  const methodIdx = findIdx(['payment', 'method', 'mode']);
  const merchantIdx = findIdx(['merchant', 'vendor', 'payee']);

  if (dateIdx === -1 || amountIdx === -1 || titleIdx === -1) {
    return {
      valid: [],
      errors: [
        {
          row: 1,
          error: 'Required columns missing. CSV must include Date, Amount, and Title/Description columns.',
          raw: lines[0],
        },
      ],
      duplicates: 0,
    };
  }

  const valid: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[] = [];
  const errors: { row: number; error: string; raw: string }[] = [];
  let duplicates = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line);
    const rawDate = cols[dateIdx]?.trim();
    const rawAmount = cols[amountIdx]?.replace(/[^0-9.-]/g, '');
    const title = cols[titleIdx]?.trim();

    if (!rawDate || !title) {
      errors.push({ row: i + 1, error: 'Missing date or title', raw: line });
      continue;
    }

    const amount = Math.abs(parseFloat(rawAmount));
    if (isNaN(amount) || amount <= 0) {
      errors.push({ row: i + 1, error: 'Invalid numeric amount', raw: line });
      continue;
    }

    // Determine type
    let type: 'expense' | 'income' = 'expense';
    if (typeIdx !== -1 && cols[typeIdx]) {
      const t = cols[typeIdx].toLowerCase();
      if (t.includes('income') || t.includes('cr') || t.includes('credit') || t.includes('inflow')) {
        type = 'income';
      }
    } else if (parseFloat(rawAmount) > 0 && cols[amountIdx]?.includes('+')) {
      type = 'income';
    }

    // Category matching
    let category = type === 'income' ? 'cat-salary' : 'cat-shopping';
    if (catIdx !== -1 && cols[catIdx]) {
      const catInput = cols[catIdx].toLowerCase().trim();
      const matched = catMapByName.get(catInput);
      if (matched) {
        category = matched;
      }
    }

    // Normalize date YYYY-MM-DD
    let normalizedDate = rawDate;
    const parsedDate = new Date(rawDate);
    if (!isNaN(parsedDate.getTime())) {
      normalizedDate = parsedDate.toISOString().substring(0, 10);
    }

    // Duplicate check
    const dedupKey = `${normalizedDate}-${amount}-${title.toLowerCase()}`;
    if (existingKeys.has(dedupKey)) {
      duplicates++;
      continue;
    }

    valid.push({
      date: normalizedDate,
      amount,
      title,
      type,
      category,
      paymentMethod: (cols[methodIdx] as any) || 'UPI',
      merchant: cols[merchantIdx] || '',
      notes: 'Imported via CSV',
      tags: ['csv-import'],
    });
  }

  return { valid, errors, duplicates };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
