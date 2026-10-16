import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-salary',
    name: 'Salary & Income',
    icon: 'Briefcase',
    color: '#10b981', // emerald
    type: 'income',
  },
  {
    id: 'cat-freelance',
    name: 'Consulting & Freelance',
    icon: 'Laptop',
    color: '#06b6d4', // cyan
    type: 'income',
  },
  {
    id: 'cat-investments',
    name: 'Investments & Dividends',
    icon: 'TrendingUp',
    color: '#8b5cf6', // violet
    type: 'income',
  },
  {
    id: 'cat-food',
    name: 'Food & Dining',
    icon: 'Utensils',
    color: '#f97316', // orange
    type: 'expense',
  },
  {
    id: 'cat-groceries',
    name: 'Groceries & Mart',
    icon: 'ShoppingCart',
    color: '#84cc16', // lime
    type: 'expense',
  },
  {
    id: 'cat-housing',
    name: 'Housing & Rent',
    icon: 'Home',
    color: '#6366f1', // indigo
    type: 'expense',
  },
  {
    id: 'cat-tech',
    name: 'Tech & Subscriptions',
    icon: 'Cpu',
    color: '#38bdf8', // light blue
    type: 'expense',
  },
  {
    id: 'cat-transport',
    name: 'Transportation & Fuel',
    icon: 'Car',
    color: '#ec4899', // pink
    type: 'expense',
  },
  {
    id: 'cat-health',
    name: 'Health & Fitness',
    icon: 'Activity',
    color: '#14b8a6', // teal
    type: 'expense',
  },
  {
    id: 'cat-entertainment',
    name: 'Entertainment & Gaming',
    icon: 'Gamepad2',
    color: '#a855f7', // purple
    type: 'expense',
  },
  {
    id: 'cat-shopping',
    name: 'Shopping & Gear',
    icon: 'ShoppingBag',
    color: '#f43f5e', // rose
    type: 'expense',
  },
  {
    id: 'cat-utilities',
    name: 'Utilities & Telecom',
    icon: 'Zap',
    color: '#eab308', // yellow
    type: 'expense',
  },
  {
    id: 'cat-travel',
    name: 'Travel & Exploration',
    icon: 'Compass',
    color: '#0ea5e9', // sky
    type: 'expense',
  },
];
